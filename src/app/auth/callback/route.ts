import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile set up
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { data: profile } = await supabase
          .from("players")
          .select("username")
          .eq("email", user.email)
          .maybeSingle();

        // If no profile, redirect to edit-profile to create one
        if (!profile?.username) {
          return NextResponse.redirect(`${origin}/edit-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to home on error
  return NextResponse.redirect(`${origin}?error=auth_failed`);
}
