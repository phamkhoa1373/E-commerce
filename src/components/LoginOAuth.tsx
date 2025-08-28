import { supabase } from "@/services/supabase";

export function LoginOAuth() {
	async function loginWithGoogle() {
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: window.location.origin },
		});
	}

	async function loginWithFacebook() {
		await supabase.auth.signInWithOAuth({
			provider: "facebook",
			options: { redirectTo: window.location.origin },
		});
	}

	return (
		<div style={{ display: "flex", gap: 8 }}>
			<button onClick={loginWithGoogle}>Đăng nhập với Google</button>
			<button onClick={loginWithFacebook}>Đăng nhập với Facebook</button>
		</div>
	);
}

