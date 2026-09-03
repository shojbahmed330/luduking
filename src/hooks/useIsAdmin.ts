import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAIL = "rajshahi.jibon@gmail.com";

/** True only for the group admin — matches the database is_group_admin() rule. */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setIsAdmin((data.user?.email || "").toLowerCase() === ADMIN_EMAIL);
    });
    return () => {
      active = false;
    };
  }, []);

  return isAdmin;
}
