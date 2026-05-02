import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../infrastructure/config/supabase";
import {
  SupabaseMembershipRequestRepository
} from "../../infrastructure/repositories/CollaborationRepositories";
import type { MembershipRequest, Organization } from "../../domain/entities/collaboration";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Building2,
  Clock
} from "lucide-react";

export function JoinRequestsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get("org");
  const { user } = useAuth();
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, { email: string; name: string }>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const requestRepo = new SupabaseMembershipRequestRepository();

      if (orgId) {
        // Requests for a specific org (admin view)
        const reqs = await requestRepo.getPendingForOrg(orgId);
        setRequests(reqs);
        // Get org name
        const { data: org } = await supabase
          .from("organizations")
          .select("id, name, created_at")
          .eq("id", orgId)
          .single();
        if (org) setOrganizations([org]);

        // Fetch user profiles for all requesters
        if (reqs.length > 0) {
          const userIds = reqs.map(r => r.user_id);
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("user_id, email, name")
            .in("user_id", userIds);
          const map: Record<string, { email: string; name: string }> = {};
          profiles?.forEach(p => { map[p.user_id] = { email: p.email, name: p.name || "" }; });
          setUserProfiles(map);
        }
      } else {
        // Get all orgs where user is admin
        const { data: adminOrgs } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("role", "admin");

        if (!adminOrgs || adminOrgs.length === 0) {
          setRequests([]);
          setOrganizations([]);
          return;
        }

        const orgIds = adminOrgs.map(a => a.organization_id);
        const { data: orgs } = await supabase
          .from("organizations")
          .select("*")
          .in("id", orgIds);
        setOrganizations(orgs || []);

        // Get all pending requests for those orgs
        const allRequests: MembershipRequest[] = [];
        for (const oid of orgIds) {
          const reqs = await requestRepo.getPendingForOrg(oid);
          allRequests.push(...reqs);
        }
        setRequests(allRequests);

        // Fetch user profiles for all requesters
        const userIds = allRequests.map(r => r.user_id);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("user_id, email, name")
            .in("user_id", userIds);
          const map: Record<string, { email: string; name: string }> = {};
          profiles?.forEach(p => { map[p.user_id] = { email: p.email, name: p.name || "" }; });
          setUserProfiles(map);
        }
      }
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, orgId]);

  const handleApprove = async (requestId: string) => {
    try {
      const repo = new SupabaseMembershipRequestRepository();
      await repo.approve(requestId);
      await fetchData();
    } catch (err) {
      console.error("Error approving request", err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const repo = new SupabaseMembershipRequestRepository();
      await repo.reject(requestId);
      await fetchData();
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  const getOrgName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || orgId;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-surface-100 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            {orgId ? (
              <button
                onClick={() => navigate(`/organizations/${orgId}`)}
                className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors mb-2 font-medium"
              >
                <ArrowLeft size={18} /> Volver a la organización
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard/organizations")}
                className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors mb-2 font-medium"
              >
                <ArrowLeft size={18} /> Volver a organizaciones
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-primary" size={28} />
              Solicitudes de Membresía
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl font-medium">
              {orgId
                ? `Solicitudes pendientes para ${getOrgName(orgId)}`
                : "Todas las solicitudes pendientes de tus organizaciones"}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
            <Clock size={16} />
            {requests.length} pendiente{requests.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </header>

      <div className="p-6">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
            <CheckCircle className="text-green-600 mb-4" size={48} />
            <h2 className="text-lg font-semibold text-slate-900">No hay solicitudes pendientes</h2>
            <p className="text-slate-700 font-medium mt-2">
              {orgId
                ? "Esta organización no tiene solicitudes pendientes."
                : "Ninguna de tus organizaciones tiene solicitudes pendientes."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="border p-6 rounded-2xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-lg font-bold">
                    {(userProfiles[req.user_id]?.email || req.user_id).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{userProfiles[req.user_id]?.email || req.user_id}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mt-1">
                      <Building2 size={14} />
                      {getOrgName(req.organization_id)}
                      <span className="text-slate-400">·</span>
                      <Clock size={14} />
                      {new Date(req.requested_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(req.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Aprobar
                  </Button>
                  <Button
                    onClick={() => handleReject(req.id)}
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 font-semibold rounded-xl flex items-center gap-2"
                  >
                    <XCircle size={16} /> Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
