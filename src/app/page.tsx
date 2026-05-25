"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {

  const videoRef = useRef<HTMLVideoElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const hoverSoundRef = useRef<HTMLAudioElement>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const [showEffects, setShowEffects] = useState(true);

  const [playVideo, setPlayVideo] = useState(false);

  const [showButtons, setShowButtons] = useState(false);

  const [user, setUser] = useState<any>(null);

  // PLAY HOVER SOUND
  const playHoverSound = () => {

    if (!hoverSoundRef.current) return;

    hoverSoundRef.current.currentTime = 0;

    hoverSoundRef.current.volume = 0.6;

    hoverSoundRef.current.play().catch(() => {});

  };

  // UNLOCK AUDIO AFTER USER INTERACTION
  useEffect(() => {

    const unlockAudio = async () => {

      if (!audioRef.current) return;

      try {

        audioRef.current.volume = 0;

        await audioRef.current.play();

        audioRef.current.pause();

        audioRef.current.currentTime = 0;

        setAudioUnlocked(true);

        setShowButtons(true);

        setTimeout(() => {

          startLoop();

        }, 10000);

      } catch (err) {

        console.log("Audio blocked");

      }

      window.removeEventListener(
        "click",
        unlockAudio
      );

    };

    window.addEventListener(
      "click",
      unlockAudio
    );

    return () => {

      window.removeEventListener(
        "click",
        unlockAudio
      );

    };

  }, []);

  // GET USER
  useEffect(() => {

    const getUser = async () => {

      const { data } =
        await supabase.auth.getUser();

      setUser(data.user);

    };

    getUser();

  }, []);

  // START LOOP
  const startLoop = () => {

    setShowEffects(true);

    setPlayVideo(false);

    setTimeout(async () => {

      setShowEffects(false);

      setPlayVideo(true);

      if (videoRef.current) {

        videoRef.current.currentTime = 0;

        videoRef.current.play().catch(() => {});

      }

      if (
        audioRef.current &&
        audioUnlocked
      ) {

        try {

          audioRef.current.currentTime = 0;

          audioRef.current.volume = 0.12;

          await audioRef.current.play();

        } catch {}

      }

    }, 1000);

  };

  // LOOP AGAIN
  const handleVideoEnd = () => {

    setPlayVideo(false);

    setShowEffects(true);

    if (audioRef.current) {

      audioRef.current.pause();

      audioRef.current.currentTime = 0;

    }

    setTimeout(() => {

      startLoop();

    }, 10000);

  };

  // LOGIN
  const loginWithGoogle = async () => {

    await supabase.auth.signInWithOAuth({

      provider: "google",

      options: {

        redirectTo:
          `${window.location.origin}/profile`,

      },

    });

  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        muted
        playsInline
        onEnded={handleVideoEnd}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[3000ms]

        ${playVideo
          ? "opacity-40"
          : "opacity-0"}

        `}
      >

        <source
          src="/bg.mp4"
          type="video/mp4"
        />

      </video>

      {/* MUSIC */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
      >

        <source
          src="/music.mp3"
          type="audio/mpeg"
        />

      </audio>

      {/* HOVER SOUND */}
      <audio ref={hoverSoundRef}>

        <source
          src="/hover.mp3"
          type="audio/mpeg"
        />

      </audio>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70" />

      {/* PURPLE GLOW */}
      <div
        className={`absolute w-[500px] h-[500px]
        bg-purple-600 rounded-full blur-[150px]
        top-[-100px] left-[-100px]

        transition-opacity duration-[3000ms]

        ${showEffects
          ? "opacity-30"
          : "opacity-0"}

        `}
      />

      {/* BLUE GLOW */}
      <div
        className={`absolute w-[400px] h-[400px]
        bg-blue-500 rounded-full blur-[140px]
        bottom-[-100px] right-[-100px]

        transition-opacity duration-[3000ms]

        ${showEffects
          ? "opacity-20"
          : "opacity-0"}

        `}
      />

      {/* GRID */}
      <div
        className={`absolute inset-0

        bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]

        bg-[size:40px_40px]

        transition-opacity duration-[3000ms]

        ${showEffects
          ? "opacity-100"
          : "opacity-0"}

        `}
      />

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">

        {/* LOGO */}
        <Link
          href="/"
          onMouseEnter={playHoverSound}
          className="text-3xl font-black tracking-wide bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          BFC
        </Link>

        {/* NAV ITEMS */}
        <div className="flex items-center gap-6">

          {/* MAILBOX */}
          <Link
            href="/crew-dashboard"
            className="relative group"
          >

            <div
              onMouseEnter={playHoverSound}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/30 transition duration-300"
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7 text-white"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 7.5v9a2.25 2.25 0 0 1-2.25 2.25h-15A2.25 2.25 0 0 1 2.25 16.5v-9m19.5 0A2.25 2.25 0 0 0 19.5 5.25h-15A2.25 2.25 0 0 0 2.25 7.5m19.5 0v.243a2.25 2.25 0 0 1-.876 1.789l-7.5 5.625a2.25 2.25 0 0 1-2.748 0l-7.5-5.625A2.25 2.25 0 0 1 2.25 7.743V7.5"
                />

              </svg>

            </div>

          </Link>

          <Link
            href="/"
            onMouseEnter={playHoverSound}
            className="text-zinc-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            href="/crews"
            onMouseEnter={playHoverSound}
            className="text-zinc-300 hover:text-purple-400 transition"
          >
            Crews
          </Link>

          <Link
            href="/leaderboards"
            onMouseEnter={playHoverSound}
            className="text-zinc-300 hover:text-white transition"
          >
            Leaderboards
          </Link>

          <Link
            href="/chat"
            onMouseEnter={playHoverSound}
            className="text-zinc-300 hover:text-cyan-400 transition"
          >
            Chat
          </Link>

          <Link
            href="/rules"
            onMouseEnter={playHoverSound}
            className="text-zinc-300 hover:text-red-400 transition"
          >
            Rules
          </Link>

          <Link
            href="/profile"
            onMouseEnter={playHoverSound}
            className="text-zinc-300 hover:text-white transition"
          >
            Profile
          </Link>

          <Link
            href="/create-crew"
            onMouseEnter={playHoverSound}
            className="bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
          >
            Create Crew
          </Link>

          {user ? (

            <div className="flex items-center gap-4">

              <Link
                href="/profile"
                onMouseEnter={playHoverSound}
                className="bg-white/10 border border-white/10 px-5 py-2 rounded-xl hover:bg-white/20 transition"
              >
                My Profile
              </Link>

              <button
                onMouseEnter={playHoverSound}
                onClick={async () => {

                  await supabase.auth.signOut();

                  window.location.reload();

                }}
                className="bg-red-500 px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
              >
                Logout
              </button>

            </div>

          ) : (

            <button
              onMouseEnter={playHoverSound}
              onClick={loginWithGoogle}
              className="bg-white text-black px-5 py-2 rounded-xl font-semibold hover:scale-105 transition"
            >
              Login
            </button>

          )}

        </div>

      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-32">

        <div
          className={`bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-2 rounded-full mb-6 transition-all duration-[2500ms]

          ${playVideo
            ? "opacity-0 scale-75 blur-xl"
            : "opacity-100 scale-100"}

          `}
        >

          <span className="text-sm text-zinc-300">
            Competitive Roblox PvP Platform
          </span>

        </div>

        <div className="relative">

          <div
            className={`absolute inset-0 blur-[120px] bg-blue-500/40 transition-all duration-[3000ms]

            ${playVideo
              ? "scale-150 opacity-100"
              : "scale-100 opacity-0"}

            `}
          />

          <h1
            className={`relative text-7xl md:text-8xl font-black mb-6 tracking-tight leading-none transition-all duration-[3000ms]

            ${playVideo
              ? "scale-110 tracking-[10px]"
              : "scale-100 tracking-tight"}

            `}
          >

            <span
              className={`inline-block transition-all duration-[2500ms]

              ${playVideo
                ? "translate-y-[-20px] text-white"
                : "translate-y-0"}

              `}
            >
              Blox Fruits
            </span>

            <br />

            <span
              className={`inline-block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-all duration-[3000ms]

              ${playVideo
                ? "scale-125 brightness-150"
                : "scale-100"}

              `}
            >
              Competitive
            </span>

          </h1>

        </div>

        <p
          className={`text-zinc-400 text-xl max-w-2xl mb-10 leading-relaxed transition-all duration-[2500ms]

          ${playVideo
            ? "opacity-0 translate-y-10 blur-md"
            : "opacity-100 translate-y-0"}

          `}
        >

          The next generation competitive PvP platform for ranked players,
          tournaments, regional leaderboards, verified battles,
          crews, and global community wars.

        </p>

        <div
          className={`flex flex-wrap justify-center gap-4 transition-all duration-[1500ms]

          ${showButtons
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-20 scale-75 pointer-events-none"}

          ${playVideo
            ? "animate-pulse"
            : ""}

          `}
        >

          <Link
            href="/crews"
            onMouseEnter={playHoverSound}
            className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition duration-300 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            Explore Crews
          </Link>

          <Link
            href="/leaderboards"
            onMouseEnter={playHoverSound}
            className="border border-white/10 bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition duration-300"
          >
            View Rankings
          </Link>

          <Link
            href="/chat"
            onMouseEnter={playHoverSound}
            className="border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-md px-8 py-4 rounded-2xl font-bold hover:bg-cyan-500/20 hover:scale-105 transition duration-300 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
          >
            Global Chat
          </Link>

        </div>

        {playVideo && (

          <div className="absolute bottom-20 animate-pulse">

            <p className="text-blue-300 tracking-[8px] text-sm font-bold">
              ENTERING COMPETITIVE MODE
            </p>

          </div>

        )}

      </section>

    </main>
  );
}