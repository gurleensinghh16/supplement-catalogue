
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        // Load the existing Supabase session.
        supabase.auth
            .getSession()
            .then(({ data: { session }, error }) => {
                if (!active) return;

                if (error) {
                    console.error("Failed to load session:", error);
                    setUser(null);
                } else {
                    setUser(session?.user ?? null);
                }

                setIsLoading(false);
            })
            .catch((error) => {
                if (!active) return;

                console.error("Failed to load session:", error);
                setUser(null);
                setIsLoading(false);
            });

        // Keep authentication state synchronized.
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!active) return;

            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (
        email: string,
        password: string
    ): Promise<User> => {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error("Login succeeded but no user was returned.");
        }

        return data.user;
    };

    const signOut = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }
    };

    return {
        isLoading,
        isAuthenticated: !!user,
        user,
        signIn,
        signOut,
    };
}
