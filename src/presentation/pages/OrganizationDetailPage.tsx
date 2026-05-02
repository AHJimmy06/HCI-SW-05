import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/config/supabase";
import {
  SupabaseOrganizationRepository,
  SupabaseProjectRepository,
  SupabaseOrganizationMemberRepository,
  SupabaseMembershipRequestRepository
} from "../../infrastructure/repositories/CollaborationRepositories";
import type { Organization, Project, OrganizationMember, MembershipRequest } from "../../domain/entities/collaboration";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  FolderKanban,
  Plus,
  Loader2,
  ArrowLeft,
  Crown,
  UserPlus,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock
} from "lucide-react";

export function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { email: string; name: string }>>({});
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "members" | "requests">("projects");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{ user_id: string; email: string; name: string }[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [userHasMore, setUserHasMore] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const USER_PAGE_SIZE = 10;

  const fetchData = async () => {
    if (!orgId || !user) return;
    setLoading(true);
    try {
      const orgRepo = new SupabaseOrganizationRepository();
      const projRepo = new SupabaseProjectRepository();
      const memberRepo = new SupabaseOrganizationMemberRepository();
      const requestRepo = new SupabaseMembershipRequestRepository();

      const [org, projList, memberList, requestList] = await Promise.all([
        orgRepo.getByUser(user.id).then(orgs => orgs.find(o => o.id === orgId)),
        projRepo.getByOrg(orgId),
        memberRepo.getMembers(orgId),
        requestRepo.getPendingForOrg(orgId)
      ]);

      if (!org) {
        navigate("/dashboard/organizations");
        return;
      }

      setOrganization(org);
      setProjects(projList);
      setMembers(memberList);
      setRequests(requestList);

      // Check if current user is admin
      const admin = await memberRepo.isAdmin(orgId, user.id);
      setIsAdmin(admin);
      setIsMember(memberList.some(m => m.user_id === user.id));

      // Check for pending request from this user
      const { data: pendingReqs } = await supabase
        .from("membership_requests")
        .select("*")
        .eq("organization_id", orgId)
        .eq("user_id", user.id)
        .eq("status", "pending");
      setHasPendingRequest((pendingReqs?.length ?? 0) > 0);

      // Fetch member profiles from user_profiles table (for members AND requesters)
      const allUserIds = [...memberList.map(m => m.user_id), ...requestList.map(r => r.user_id)];
      const uniqueUserIds = [...new Set(allUserIds)];
      const map: Record<string, { email: string; name: string }> = {};

      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, email, name")
          .in("user_id", uniqueUserIds);
        profiles?.forEach(p => { map[p.user_id] = { email: p.email, name: p.name || "" }; });
        setMemberProfiles(map);
      }
    } catch (err) {
      console.error("Error fetching org data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId, user]);

  const handleCreateProject = async () => {
    if (!orgId || !newProjectName.trim()) return;
    setCreating(true);
    try {
      const repo = new SupabaseProjectRepository();
      await repo.create(orgId, newProjectName.trim());
      setNewProjectName("");
      setShowCreateProject(false);
      await fetchData();
    } catch (err) {
      console.error("Error creating project", err);
    } finally {
      setCreating(false);
    }
  };

  const handleAssignMember = async (targetUserId: string) => {
    if (!orgId) return;
    setAssigning(true);
    try {
      const memberRepo = new SupabaseOrganizationMemberRepository();
      await memberRepo.addMember(orgId, targetUserId, "member");
      setAssignEmail("");
      setShowUserPicker(false);
      await fetchData();
    } catch (err) {
      console.error("Error assigning member", err);
    } finally {
      setAssigning(false);
    }
  };

  const loadUserProfiles = async (page: number) => {
    setUserLoading(true);
    try {
      const from = page * USER_PAGE_SIZE;
      const { data, error, count } = await supabase
        .from("user_profiles")
        .select("user_id, email, name", { count: 'exact' })
        .range(from, from + USER_PAGE_SIZE - 1)
        .order('email', { ascending: true });

      if (error) throw error;

      if (page === 0) {
        setUserProfiles(data || []);
      } else {
        setUserProfiles(prev => [...prev, ...(data || [])]);
      }
      setUserHasMore((count || 0) > from + USER_PAGE_SIZE);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setUserLoading(false);
    }
  };

  const loadMoreUsers = () => {
    if (!userLoading && userHasMore) {
      const nextPage = userPage + 1;
      setUserPage(nextPage);
      loadUserProfiles(nextPage);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const repo = new SupabaseMembershipRequestRepository();
      await repo.approve(requestId);
      await fetchData();
    } catch (err) {
      console.error("Error approving request", err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const repo = new SupabaseMembershipRequestRepository();
      await repo.reject(requestId);
      await fetchData();
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  const handleRequestJoin = async () => {
    if (!orgId || !user) return;
    setRequesting(true);
    try {
      const repo = new SupabaseMembershipRequestRepository();
      await repo.submit(orgId, user.id);
      setHasPendingRequest(true);
      await fetchData();
    } catch (err) {
      console.error("Error requesting join", err);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!organization) return null;

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-surface-100 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <button
              onClick={() => navigate("/dashboard/organizations")}
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors mb-2 font-medium"
            >
              <ArrowLeft size={18} /> Volver a organizaciones
            </button>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-primary" size={28} />
              {organization.name}
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl font-medium">
              Organización · Miembro desde {new Date(organization.created_at).toLocaleDateString()}
            </p>
          </div>
          {!isMember && !isAdmin && (
            hasPendingRequest ? (
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock size={16} />
                Solicitud pendiente
              </Badge>
            ) : (
              <Button
                onClick={handleRequestJoin}
                disabled={requesting}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-3"
              >
                {requesting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                Solicitar pertenecer
              </Button>
            )
          )}
        </div>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit m-6">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "projects" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <FolderKanban size={16} />
          Proyectos
          <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "projects" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
            {projects.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "members" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Users size={16} />
          Miembros
          <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "members" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
            {members.length}
          </span>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "requests" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users size={16} />
            Solicitudes
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "requests" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
              {requests.length}
            </span>
          </button>
        )}
      </div>

      <div className="p-6">
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Proyectos de la organización</h2>
                <p className="text-sm text-slate-600 font-medium mt-0.5">Gestiona los proyectos y accede a sus tests de usabilidad</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">{projects.length} proyecto{projects.length !== 1 ? "s" : ""}</Badge>
                {isAdmin && (
                  <Button
                    onClick={() => setShowCreateProject(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl flex items-center gap-2"
                  >
                    <Plus size={18} /> Nuevo proyecto
                  </Button>
                )}
              </div>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                <FolderKanban className="text-slate-400 mb-4" size={40} />
                <h2 className="text-lg font-semibold text-slate-900">No hay proyectos aún</h2>
                {isAdmin && <p className="text-slate-700 font-medium mt-1">Crea el primer proyecto para esta organización.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => navigate(`/dashboard/project/${proj.id}`)}
                    className="border p-5 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                        <FolderKanban size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg truncate">{proj.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Creado {new Date(proj.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight size={18} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Ver tests
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Miembros de la organización</h2>
                <p className="text-sm text-slate-600 font-medium mt-0.5">Invita nuevos miembros o gestiona los existentes</p>
              </div>
              <Badge variant="outline" className="px-3 py-1">{members.length} miembro{members.length !== 1 ? "s" : ""}</Badge>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">
                    Buscar usuario
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Escribí para buscar..."
                      value={assignEmail}
                      onFocus={() => {
                        setShowUserPicker(true);
                        if (userProfiles.length === 0) loadUserProfiles(0);
                      }}
                      onChange={(e) => {
                        setAssignEmail(e.target.value);
                        setUserPage(0);
                        setUserProfiles([]);
                        setUserHasMore(true);
                        loadUserProfiles(0);
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowUserPicker(false), 150);
                      }}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {showUserPicker && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                        {userLoading && userProfiles.length === 0 ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="animate-spin text-primary" size={20} />
                          </div>
                        ) : userProfiles.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-500">No hay usuarios registrados</div>
                        ) : (
                          userProfiles.map((u) => (
                            <button
                              key={u.user_id}
                              onMouseDown={() => {
                                setAssignEmail(u.email);
                                setShowUserPicker(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-primary/5 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                            >
                              <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                                {u.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">{u.email}</p>
                                {u.name && u.name !== u.email && (
                                  <p className="text-xs text-slate-500 truncate">{u.name}</p>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                        {userLoading && userProfiles.length > 0 && (
                          <div className="flex justify-center py-3">
                            <Loader2 className="animate-spin text-primary" size={16} />
                          </div>
                        )}
                        {userHasMore && userProfiles.length > 0 && (
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              loadMoreUsers();
                            }}
                            className="w-full px-4 py-3 text-center text-xs font-bold text-primary hover:bg-primary/5 border-t border-slate-100 transition-colors"
                          >
                            {userLoading ? "Cargando..." : "Ver más usuarios"}
                          </button>
                        )}
                        {!userHasMore && userProfiles.length > 0 && (
                          <div className="px-4 py-2 text-[10px] text-slate-400 text-center border-t border-slate-100">
                            Fin de los resultados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const selected = userProfiles.find(u => u.email === assignEmail);
                    if (selected) handleAssignMember(selected.user_id);
                  }}
                  disabled={assigning || !assignEmail.trim()}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl mt-6"
                >
                  {assigning ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                  Asignar
                </Button>
              </div>
            )}
            <div className="border rounded-2xl bg-white overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Rol</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Fecha de ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold">
                            {(memberProfiles[member.user_id]?.email || member.user_id).charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-slate-900">{memberProfiles[member.user_id]?.email || member.user_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.role === "admin" ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Crown size={12} /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-fit">Miembro</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Solicitudes pendientes</h2>
                <p className="text-sm text-slate-600 font-medium mt-0.5">Revisa y aprueba las solicitudes de nuevos miembros</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                {requests.length} pendiente{requests.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                <CheckCircle className="text-slate-400 mb-4" size={40} />
                <h2 className="text-lg font-semibold text-slate-900">No hay solicitudes pendientes</h2>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="border p-6 rounded-2xl bg-white shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold">
                      {(memberProfiles[req.user_id]?.email || req.user_id).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{memberProfiles[req.user_id]?.email || req.user_id}</p>
                      <p className="text-sm text-slate-600 font-medium">Solicitó unirse · {new Date(req.requested_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproveRequest(req.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                    >
                      <CheckCircle size={16} /> Aprobar
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(req.id)}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 font-semibold rounded-xl"
                    >
                      <XCircle size={16} /> Rechazar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      {showCreateProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Crear nuevo proyecto</h3>
              <input
                type="text"
                placeholder="Nombre del proyecto"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-6"
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setShowCreateProject(false); setNewProjectName(""); }}
                  disabled={creating}
                  className="flex-1 rounded-xl py-6 font-semibold border-slate-300 text-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={creating || !newProjectName.trim()}
                  className="flex-1 rounded-xl py-6 bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  {creating ? <Loader2 className="animate-spin" size={18} /> : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
