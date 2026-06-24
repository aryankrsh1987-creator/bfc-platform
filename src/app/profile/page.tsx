"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Player | null>(null);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [crewCount, setCrewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      router.replace("/auth");
      return;
    }

    const { data: playerData } = await supabase
      .from("players")
      .select("*")
      .eq("email", authData.user.email)
      .maybeSingle();

    // If user has no profile yet, redirect to edit-profile to create one
    if (!playerData?.username) {
      router.replace("/edit-profile");
      return;
    }

    setProfile(playerData);
    setLoading(false);

    if (playerData?.username) {
        // GET BEST RANKING (both 1v1 solo and 2v2 team placements)
        const [{ data: soloRankings }, { data: teamRankings }] = await Promise.all([
          supabase
            .from("player_rankings")
            .select("ranks")
            .eq("mode", "1v1")
            .eq("username", playerData.username)
            .order("ranks", { ascending: true })
            .limit(1),
          supabase
            .from("player_rankings")
            .select("ranks")
            .eq("mode", "2v2")
            .or(`player_1.eq.${playerData.username},player_2.eq.${playerData.username}`)
            .order("ranks", { ascending: true })
            .limit(1),
        ]);

        const soloRank = soloRankings?.[0]?.ranks ?? null;
        const teamRank = teamRankings?.[0]?.ranks ?? null;

        // Pick the best (lowest number = highest rank) from both modes
        setPlayerRank(
          soloRank !== null && teamRank !== null
            ? Math.min(soloRank, teamRank)
            : (soloRank ?? teamRank),
        );

        // GET CREW MEMBERSHIPS
        const { count } = await supabase
          .from("crew_members")
          .select("*", { count: "exact", head: true })
          .eq("member_email", authData.user.email);

        setCrewCount(count ?? 0);
      }
    };

    loadProfile();
  }, [loadProfile, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* TOP NAVBAR */}
      <div className="relative z-20 flex items-center justify-between px-8 py-6">
        <Link
          href="/"
          className="bg-white/10 border border-white/10 px-5 py-3 rounded-2xl hover:bg-white/20 transition backdrop-blur-xl"
        >
          ← Home
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/leaderboards"
            className="text-zinc-300 hover:text-white transition"
          >
            Leaderboards
          </Link>

          <Link
            href="/edit-profile"
            className="text-zinc-300 hover:text-white transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[180px] opacity-20" />

      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[180px] opacity-20" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Main Card */}
        <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-2xl shadow-[0_0_100px_rgba(168,85,247,0.15)]">
          {/* Banner */}
          <div className="relative h-80 bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 overflow-hidden">
            {/* Banner Image */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />
          </div>

          {/* Content */}
          <div className="px-8 pb-10 relative">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Avatar */}
              <div className="-mt-24 relative shrink-0">
                <Image
                  src={profile?.avatar_url || "https://placehold.co/400x400/7c3aed/ffffff?text=User"}
                  alt="avatar"
                  width={176}
                  height={176}
                  className="w-44 h-44 rounded-full border-4 border-black object-cover shadow-[0_0_50px_rgba(59,130,246,0.7)]"
                  unoptimized
                />

                {/* Online Dot */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-green-500 rounded-full border-4 border-black animate-pulse" />
              </div>

              {/* User Info */}
              <div className="pb-4 mt-6 lg:mt-0 flex-1">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                    {profile?.display_name || "Player"}
                  </h1>

                  {(playerRank !== null || crewCount > 0) && (
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 rounded-full text-sm font-black">
                      VERIFIED
                    </div>
                  )}

                  {/* Edit Profile Button */}
                  <Link
                    href="/edit-profile"
                    className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition text-lg"
                  >
                    ✏️
                  </Link>
                </div>

                <p className="text-zinc-400 text-xl mt-2">
                  @{profile?.username || "unknown"}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mt-5">
                  {playerRank !== null && (
                    <div className="bg-purple-500/20 border border-purple-400/20 text-purple-200 px-4 py-2 rounded-full text-sm font-semibold">
                      Ranked #{playerRank}
                    </div>
                  )}

                  {profile?.region && (
                    <div className="bg-blue-500/20 border border-blue-400/20 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold">
                      🌍 {profile.region}
                    </div>
                  )}

                  {profile?.device && (
                    <div className="bg-cyan-500/20 border border-cyan-400/20 text-cyan-200 px-4 py-2 rounded-full text-sm font-semibold">
                      {profile.device === "PC"
                        ? "🖥 PC"
                        : profile.device === "Mobile"
                          ? "📱 Mobile"
                          : "🎮 Console"}
                    </div>
                  )}

                  {crewCount > 0 && (
                    <div className="bg-green-500/20 border border-green-400/20 text-green-200 px-4 py-2 rounded-full text-sm font-semibold">
                      👥 {crewCount} {crewCount === 1 ? "Crew" : "Crews"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-10 bg-black/30 border border-white/10 rounded-3xl p-4 backdrop-blur-xl">
              <p className="text-zinc-500 text-sm tracking-widest mb-2">
                STATUS
              </p>

              <p className="text-2xl font-semibold">
                {profile?.status || "No status"}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
              <div className="bg-black/40 min-h-[180px] border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:scale-[1.02] transition flex flex-col justify-center">
                <p className="text-zinc-500 text-sm">RANK</p>

                <h2 className="text-5xl font-black text-purple-400 mt-3">
                  {playerRank !== null ? `#${playerRank}` : "—"}
                </h2>
              </div>

              <div className="bg-black/40 min-h-[180px] border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:scale-[1.02] transition flex flex-col justify-center">
                <p className="text-zinc-500 text-sm">REGION</p>

                <h2 className="text-5xl font-black text-cyan-400 mt-3">
                  {profile?.region?.toUpperCase() || "—"}
                </h2>
              </div>

              <div className="bg-black/40 min-h-[180px] border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:scale-[1.02] transition flex flex-col justify-center">
                <p className="text-zinc-500 text-sm">DEVICE</p>

                <h2 className="text-5xl font-black text-green-400 mt-3">
                  {profile?.device || "—"}
                </h2>
              </div>

              <div className="bg-black/40 min-h-[180px] border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover:scale-[1.02] transition flex flex-col justify-center">
                <p className="text-zinc-500 text-sm">CREWS</p>

                <h2 className="text-4xl font-black text-orange-400 mt-3">
                  {crewCount}
                </h2>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-10">
              <p className="text-zinc-500 text-sm tracking-widest mb-4">
                BADGES
              </p>

              <div className="flex flex-wrap gap-4">
                {playerRank !== null && (
                  <div className="bg-purple-500/20 border border-purple-400/20 text-purple-200 px-5 py-3 rounded-2xl font-semibold">
                    ⚔ Ranked #{playerRank}
                  </div>
                )}

                {playerRank !== null && playerRank <= 10 && (
                  <div className="bg-yellow-500/20 border border-yellow-400/20 text-yellow-200 px-5 py-3 rounded-2xl font-semibold">
                    👑 Top 10
                  </div>
                )}

                {crewCount > 0 && (
                  <div className="bg-green-500/20 border border-green-400/20 text-green-200 px-5 py-3 rounded-2xl font-semibold">
                    👥 Crew Member
                  </div>
                )}

                {profile?.region && (
                  <div className="bg-blue-500/20 border border-blue-400/20 text-blue-200 px-5 py-3 rounded-2xl font-semibold">
                    🌍 {profile.region}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
