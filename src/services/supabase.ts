import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
	// Fail fast in dev to surface missing envs
	// eslint-disable-next-line no-console
	console.warn(
		"Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. OAuth login will not work."
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

