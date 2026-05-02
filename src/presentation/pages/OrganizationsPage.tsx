import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/config/supabase";
import { SupabaseOrganizationRepository, SupabaseMembershipRequestRepository } from "../../infrastructure/repositories/CollaborationRepositories";
import type { Organization } from "../../domain/entities/collaboration";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Users,
  Loader2,
  ArrowRight,
  Crown,
  Globe,
  Clock,
  Search,
  X
} from "lucide-react";

export function OrganizationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [userRoles, setUserRoles] = useState<Record<string, "admin" | "member">>({});
  const [exploringOrgs, setExploringOrgs] = useState<Organization[]>([]);
  const [exploringCounts, setExploringCounts] = useState<Record<string, number>>({});
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [requestingOrg, setRequestingOrg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [searchExplore, setSearchExplore] = useState("");
  const [explorePage, setExplorePage] = useState(1);
  const EXPLORE_PAGE_SIZE = 6;

  const fetchOrganizations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const repo = new SupabaseOrganizationRepository();
      const orgs = await repo.getByUser(user.id);
      setOrganizations(orgs);

      const counts: Record<string, number> = {};
      const roles: Record<string, "admin" | "member"> = {};
      for (const org of orgs) {
        counts[org.id] = await repo.getMemberCount(org.id);
        const { data } = await supabase
          .from("organization_members")
          .select("role")
          .eq("organization_id", org.id)
          .eq("user_id", user.id)
          .single();
        roles[org.id] = data?.role || "member";
      }
      setMemberCounts(counts);
      setUserRoles(roles);

      const allOrgs = await repo.getAllExceptUser(user.id);
      setExploringOrgs(allOrgs);

      const exploreCounts: Record<string, number> = {};
      for (const org of allOrgs) {
        exploreCounts[org.id] = await repo.getMemberCount(org.id);
      }
      setExploringCounts(exploreCounts);

      const { data: pendingReqs } = await supabase
        .from("membership_requests")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "pending");
      const pendingMap: Record<string, boolean> = {};
      pendingReqs?.forEach(r => { pendingMap[r.organization_id] = true; });
      setPendingRequests(pendingMap);
    } catch (err) {
      console.error("Error fetching organizations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJoin = async (orgId: string) => {
    if (!user) return;
    setRequestingOrg(orgId);
    try {
      const repo = new SupabaseMembershipRequestRepository();
      await repo.submit(orgId, user.id);
      setPendingRequests(prev => ({ ...prev, [orgId]: true }));
    } catch (err) {
      console.error("Error requesting join", err);
    } finally {
      setRequestingOrg(null);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  const handleCreateOrganization = async () => {
    if (!user || !newOrgName.trim()) return;
    setCreating(true);
    try {
      const repo = new SupabaseOrganizationRepository();
      await repo.create(newOrgName.trim());
      setNewOrgName("");
      setShowCreateDialog(false);
      await fetchOrganizations();
    } catch (err) {
      console.error("Error creating organization", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredExplore = exploringOrgs.filter(o => o.name.toLowerCase().includes(searchExplore.toLowerCase()));
  const totalExplorePages = Math.ceil(filteredExplore.length / EXPLORE_PAGE_SIZE);
  const paginatedExplore = filteredExplore.slice((explorePage - 1) * EXPLORE_PAGE_SIZE, explorePage * EXPLORE_PAGE_SIZE);

  const resetExplorePage = () => setExplorePage(1);

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-surface-100 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-primary" size={28} />
              Mis Organizaciones
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl font-medium">
              Gestiona tus organizaciones y proyectos de pruebas de usabilidad.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-3"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="tracking-wide">NUEVA ORGANIZACIÓN</span>
            </Button>
            <Button
              onClick={() => setShowExploreModal(true)}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold px-5 py-6 rounded-2xl flex items-center gap-2"
            >
              <Globe size={18} />
              <span className="tracking-wide">EXPLORAR</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Mis Organizaciones</h2>
              {organizations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                  <Building2 className="text-slate-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-slate-900">No tienes organizaciones aún</h3>
                  <p className="text-slate-700 font-medium mt-2">Crea tu primera organización para empezar a colaborar.</p>
                  <Button onClick={() => setShowCreateDialog(true)} variant="outline" className="mt-4 border-slate-300 font-semibold">
                    Crear organización
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="border p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">{org.name}</h3>
                            {userRoles[org.id] === "admin" && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Crown size={12} /> Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 font-medium mt-1">
                            Creada el {new Date(org.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span className="font-medium">{memberCounts[org.id] || 0} miembros</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Button
                          onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
                        >
                          Gestionar
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Explore Modal */}
      {showExploreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={22} className="text-primary" />
                <h2 className="text-xl font-bold text-slate-900">Explorar organizaciones</h2>
              </div>
              <button
                onClick={() => setShowExploreModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar organizaciones..."
                  value={searchExplore}
                  onChange={(e) => { setSearchExplore(e.target.value); resetExplorePage(); }}
                  className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                />
              </div>
              {filteredExplore.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedExplore.map((org) => (
                      <div
                        key={org.id}
                        className="border border-dashed border-slate-300 p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-800">{org.name}</h3>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            {new Date(org.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} />
                            <span className="font-medium">{exploringCounts[org.id] || 0} miembros</span>
                          </div>
                        </div>
                        {pendingRequests[org.id] ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                            <Clock size={14} />
                            Solicitud pendiente
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleRequestJoin(org.id)}
                            disabled={requestingOrg === org.id}
                            className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl py-2 mt-auto"
                          >
                            {requestingOrg === org.id ? <Loader2 className="animate-spin" size={14} /> : <ArrowRight size={14} />}
                            Solicitar pertenecer
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {totalExplorePages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        onClick={() => setExplorePage(p => Math.max(1, p - 1))}
                        disabled={explorePage === 1}
                        variant="outline"
                        className="border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm"
                      >
                        ← Anterior
                      </Button>
                      <span className="text-sm font-medium text-slate-600 px-3">
                        {explorePage} / {totalExplorePages}
                      </span>
                      <Button
                        onClick={() => setExplorePage(p => Math.min(totalExplorePages, p + 1))}
                        disabled={explorePage === totalExplorePages}
                        variant="outline"
                        className="border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm"
                      >
                        Siguiente →
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Globe size={40} className="text-slate-400 mb-3" />
                  <h3 className="text-base font-semibold text-slate-700">No hay organizaciones disponibles</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Todas las organizaciones existentes ya tienen un administrador que debe invitarte.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Crear nueva organización</h3>
              <input
                type="text"
                placeholder="Nombre de la organización"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-6"
                onKeyDown={(e) => e.key === "Enter" && handleCreateOrganization()}
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setShowCreateDialog(false); setNewOrgName(""); }}
                  disabled={creating}
                  className="flex-1 rounded-xl py-6 font-semibold border-slate-300 text-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={creating || !newOrgName.trim()}
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