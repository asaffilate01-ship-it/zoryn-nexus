import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "@/lib/zoryn-data";

export type ZorynRole = Role | "staff";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useAccount() {
  const { session, user, loading } = useSession();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["account", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [profile, roles] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .eq("id", userId!)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      if (profile.error) throw profile.error;
      if (roles.error) throw roles.error;
      return {
        profile: profile.data,
        roles: (roles.data ?? []).map((r) => r.role as ZorynRole),
      };
    },
  });

  return {
    session,
    user,
    loading: loading || query.isLoading,
    profile: query.data?.profile ?? null,
    roles: query.data?.roles ?? [],
    hasRole: (role: ZorynRole) => (query.data?.roles ?? []).includes(role),
  };
}
