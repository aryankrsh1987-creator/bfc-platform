"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/profile",
      },
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-30 top-[-100px] left-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-blue-500 rounded-full blur-[140px] opacity-20 bottom-[-100px] right-[-100px]" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">

        <h1 className="text-2xl font-bold tracking-wide">
          BFC
        </h1>

        <div className="flex items-center gap-6">

          <Link
            href="/leaderboards"
            className="text-zinc-300 hover:text-white transition"
          >
            Leaderboards
          </Link>

          <button className="text-zinc-300 hover:text-white transition">
            Tournaments
          </button>

          <button
            onClick={loginWithGoogle}
            className="bg-white text-black px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
          >
            Login
          </button>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-32">

        <h1 className="text-7xl font-extrabold mb-6 tracking-tight">
          Blox Fruits Competitive
        </h1>

        <p className="text-zinc-300 text-xl max-w-2xl mb-10">
          The next generation competitive PvP platform for ranked players,
          tournaments, regional leaderboards, and verified battles.
        </p>

        <div className="flex gap-4">

          <Link
            href="/arena"
            className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition duration-300"
          >
            Enter Arena
          </Link>

          <Link
            href="/leaderboards"
            className="border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition duration-300"
          >
            View Rankings
          </Link>

        </div>

      </section>

      {/* Feature Cards */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-8 mt-28 max-w-6xl mx-auto">

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:scale-105 transition duration-300 hover:border-purple-500">

          <h2 className="text-2xl font-bold mb-4">
            Ranked PvP
          </h2>

          <p className="text-zinc-400">
            Fight verified competitive players and climb the regional leaderboard.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:scale-105 transition duration-300 hover:border-blue-500">

          <h2 className="text-2xl font-bold mb-4">
            Tournaments
          </h2>

          <p className="text-zinc-400">
            Participate in official FT5 and FT10 tournaments with fair moderation.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:scale-105 transition duration-300 hover:border-pink-500">

          <h2 className="text-2xl font-bold mb-4">
            Regional Rankings
          </h2>

          <p className="text-zinc-400">
            Compete against players from your own region with balanced matchmaking.
          </p>

        </div>

      </section>

    </main>
  );
}