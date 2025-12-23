import { supabaseBrowser } from "@/lib/supabaseBrowser";

export async function signInWithGoogle() {
  const { error } = await supabaseBrowser.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google login error:", error.message);
  }
}

export async function signOut() {
  const { error } = await supabaseBrowser.auth.signOut();

  if (error) {
    console.error("Sign out error:", error.message);
  }
}
