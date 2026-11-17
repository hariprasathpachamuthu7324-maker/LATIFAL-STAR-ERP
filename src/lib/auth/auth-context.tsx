"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient, getSupabaseEnv } from "@/lib/supabase/client";
import type { UserProfile, UserRole } from "./types";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setSimulatedUser: (user: Partial<UserProfile> | null) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}) {
  const [user, setUser] = React.useState<UserProfile | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();

  // Initialize Supabase session on client
  React.useEffect(() => {
    const { isConfigured } = getSupabaseEnv();
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Attempt to fetch profile metadata from profiles table
          let profileName: string | null = null;
          let profileRole: UserRole | null = null;
          let profileActive = true;

          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, role, is_active")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profile) {
              profileName = profile.full_name;
              profileRole = profile.role as UserRole;
              profileActive = profile.is_active ?? true;
            }
          } catch {
            // If profiles table query fails, fallback to user metadata
          }

          const role = profileRole || 
                       (session.user.user_metadata?.role as UserRole) || 
                       (session.user.app_metadata?.role as UserRole) || 
                       (session.user.email?.includes("admin") ? "ADMIN" : session.user.email?.includes("manager") ? "MANAGER" : "STAFF");
          
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: profileName || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Authorized User",
            role: role,
            isActive: profileActive,
            createdAt: session.user.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          let profileName: string | null = null;
          let profileRole: UserRole | null = null;

          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, role")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profile) {
              profileName = profile.full_name;
              profileRole = profile.role as UserRole;
            }
          } catch {
            // ignore
          }

          const role = profileRole || 
                       (session.user.user_metadata?.role as UserRole) || 
                       (session.user.app_metadata?.role as UserRole) || 
                       (session.user.email?.includes("admin") ? "ADMIN" : "STAFF");

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: profileName || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Authorized User",
            role: role,
            isActive: true,
            createdAt: session.user.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { isConfigured } = getSupabaseEnv();
      if (isConfigured) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push("/login");
    }
  };

  const setSimulatedUser = (newUser: Partial<UserProfile> | null) => {
    if (!newUser) {
      setUser(null);
      return;
    }
    setUser((prev) => (prev ? { ...prev, ...newUser, updatedAt: new Date().toISOString() } : null));
  };

  const role = user?.role || "STAFF";
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isLoading,
        signOut,
        setSimulatedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
