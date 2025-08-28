import { createContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";

type AuthContextType = {
	user: User | null;
	session: Session | null;
};

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data } = await supabase.auth.getSession();
			if (!isMounted) return;
			setSession(data.session);
			setUser(data.session?.user ?? null);
		})();

		const { data: subscription } = supabase.auth.onAuthStateChange(
			(_event, newSession) => {
				setSession(newSession);
				setUser(newSession?.user ?? null);
			}
		);

		return () => {
			isMounted = false;
			subscription.subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, session }}>
			{children}
		</AuthContext.Provider>
	);
}

