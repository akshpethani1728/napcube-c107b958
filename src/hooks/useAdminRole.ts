import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminRole = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(roles?.some(r => r.role === 'admin') || false);
      }
      setLoading(false);
    };

    checkAdminRole();
  }, [userId]);

  return { isAdmin, loading };
};
