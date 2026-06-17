"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LeaderboardsPage() {
  const router = useRouter();

  const hoverAudio = useRef<HTMLAudioElement | null>(null);

  const [players, setPlayers] = useState<any[]>([]);
  const [region, setRegion] = useState("Global");
  const [mode, setMode] = useState("1v1");

  useEffect(() => {
    hoverAudio.current = new Audio("/hover.mp3");
    hoverAudio.current.volume = 0.2;
  }, []);

  const playHoverSound = () => {
    if (!hoverAudio.current) return;

    hoverAudio.current.currentTime = 0;
    hoverAudio.current.play().catch(() => {});
  };

  useEffect(() => {
    fetchPlayers();
  }, [region, mode]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return "from-yellow-400 to-amber-500 shadow-[0_0_35px_rgba(251,191,36,0.45)]";
    }

    if (rank === 2) {
      return "from-zinc-300 to-zinc-500 shadow-[0_0_35px_rgba(161,161,170,0.4)]";
    }

    if (rank === 3) {
      return "from-orange-500 to-amber-700 shadow-[0_0_35px_rgba(251,146,60,0.4)]";
    }

    return "from-purple-500 to-cyan-500 shadow-[0_0_25px_rgba(168,85,247,0.35)]";
  };

  const fetchPlayers = async () => {
    let query = supabase.from("player_rankings").select("*").eq("mode", mode);

    if (region !== "Global") {
      query = query.eq("region", region);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setPlayers([]);
      return;
    }

    if (!data) {
      setPlayers([]);
      return;
    }

    const ranked = [...data].sort((a, b) => a.ranks - b.ranks);

    const regionalRanks = ranked.map((player, index) => ({
      ...player,
      displayRank: index + 1,
    }));

    setPlayers(regionalRanks);
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-600/20 blur-[180px] rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-cyan-600/20 blur-[180px] rounded-full" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Edit Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => router.push("/admin/rankings")}
            onMouseEnter={playHoverSound}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/20 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            <Pencil size={20} className="text-purple-300" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-purple-400 tracking-[6px] font-bold mb-4">
            COMPETITIVE PLAYERS
          </p>

          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            🏆 Rankings
          </h1>

          <p className="text-zinc-400 text-xl">
            Track the best players and teams worldwide.
          </p>
        </div>

        {/* Region Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            "Global",
            "Asia",
            "Europe",
            "Oceania",
            "North America",
            "South America",
          ].map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              onMouseEnter={playHoverSound}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]
              ${
                region === r
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_30px_rgba(168,85,247,0.45)]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Mode Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          {["1v1", "2v2"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              onMouseEnter={playHoverSound}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.35)]
              ${
                mode === m
                  ? "bg-gradient-to-r from-cyan-500 to-pink-500 shadow-[0_0_35px_rgba(168,85,247,0.35)]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              {m} Rankings
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-5">
          {players.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-3xl">
              <p className="text-zinc-500 text-xl">
                No rankings available for this region.
              </p>
            </div>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="group rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/40 via-black/70 to-cyan-950/40 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getRankStyle(
                        player.displayRank,
                      )} flex items-center justify-center text-2xl font-black transition-all duration-300 group-hover:scale-110`}
                    >
                      {player.displayRank === 1 ? (
                        <span className="animate-bounce">👑</span>
                      ) : (
                        `#${player.displayRank}`
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-black group-hover:text-cyan-300 transition">
                        {mode === "1v1"
                          ? player.username
                          : `${player.player_1} & ${player.player_2}`}
                      </h2>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                          {player.country_flag || "🌍"} {player.region}
                        </span>

                        {player.discord && (
                          <a
                            href={
                              player.discord.startsWith("http")
                                ? player.discord
                                : `https://${player.discord}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 transition"
                          >
                            💬 Discord
                          </a>
                        )}

                        {player.youtube && (
                          <a
                            href={
                              player.youtube.startsWith("http")
                                ? player.youtube
                                : `https://${player.youtube}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/40 transition"
                          >
                            ▶️ YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-zinc-500 text-sm uppercase tracking-[3px]">
                      {mode === "1v1" ? "Player Rank" : "Team Rank"}
                    </p>

                    <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      #{player.displayRank}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
