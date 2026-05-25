"use client";

import { useState } from "react";
import Link from "next/link";

export default function RulesPage() {

  const [openSection, setOpenSection] =
    useState<string | null>("general");

  const toggleSection = (section: string) => {

    if (openSection === section) {

      setOpenSection(null);

    } else {

      setOpenSection(section);

    }

  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-red-600/20 blur-[160px] rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-purple-600/20 blur-[160px] rounded-full" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl bg-black/20">

        <Link
          href="/"
          className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          BFC
        </Link>

        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="text-zinc-300 hover:text-white transition"
          >
            Home
          </Link>

          <Link
            href="/crews"
            className="text-zinc-300 hover:text-purple-400 transition"
          >
            Crews
          </Link>

          <Link
            href="/chat"
            className="text-zinc-300 hover:text-cyan-400 transition"
          >
            Chat
          </Link>

        </div>

      </nav>

      {/* HEADER */}
      <section className="relative z-10 text-center pt-20 px-6">

        <p className="text-red-400 tracking-[6px] font-bold mb-4">
          OFFICIAL RULEBOOK
        </p>

        <h1 className="text-7xl font-black mb-6">

          BFC
          <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
            {" "}Competitive Rules
          </span>

        </h1>

        <p className="text-zinc-400 text-xl max-w-3xl mx-auto">
          Official competitive regulations,
          verification system, anti-cheat enforcement,
          and punishment policies.
        </p>

      </section>

      {/* RULES */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-6">

        {/* GENERAL */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden">

          <button
            onClick={() =>
              toggleSection("general")
            }
            className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition"
          >

            <div>

              <p className="text-red-400 font-bold mb-2">
                ⚔️ GENERAL RULES
              </p>

              <h2 className="text-3xl font-black">
                Match Regulations
              </h2>

            </div>

            <span className="text-3xl">
              {openSection === "general"
                ? "−"
                : "+"}
            </span>

          </button>

          {openSection === "general" && (

            <div className="px-8 pb-8 text-zinc-300 space-y-4">

              <p>
                • Both crews must agree before wars begin.
              </p>

              <p>
                • Match format must be agreed beforehand.
              </p>

              <p>
                • No outside interference allowed.
              </p>

              <p>
                • Only registered participants may play.
              </p>

              <p>
                • Respect opponents and staff decisions.
              </p>

              <p>
                • Unsportsmanlike behavior may result in penalties.
              </p>

            </div>

          )}

        </div>

        {/* PROOF */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden">

          <button
            onClick={() =>
              toggleSection("proof")
            }
            className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition"
          >

            <div>

              <p className="text-cyan-400 font-bold mb-2">
                🎥 PROOF RULES
              </p>

              <h2 className="text-3xl font-black">
                Verification System
              </h2>

            </div>

            <span className="text-3xl">
              {openSection === "proof"
                ? "−"
                : "+"}
            </span>

          </button>

          {openSection === "proof" && (

            <div className="px-8 pb-8 text-zinc-300 space-y-4">

              <p>
                • Screenshots are allowed for standard wars.
              </p>

              <p>
                • Video proof is recommended for high ranked wars.
              </p>

              <p>
                • Edited or cropped proof is prohibited.
              </p>

              <p>
                • Fake proof may lead to blacklist.
              </p>

              <p>
                • Match screenshots should clearly show results.
              </p>

            </div>

          )}

        </div>

        {/* FAIR PLAY */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden">

          <button
            onClick={() =>
              toggleSection("macros")
            }
            className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition"
          >

            <div>

              <p className="text-orange-400 font-bold mb-2">
                🚫 MACROS & FFLAGS
              </p>

              <h2 className="text-3xl font-black">
                Fair Play Policies
              </h2>

            </div>

            <span className="text-3xl">
              {openSection === "macros"
                ? "−"
                : "+"}
            </span>

          </button>

          {openSection === "macros" && (

            <div className="px-8 pb-8 text-zinc-300 space-y-4">

              <p>
                • Macros and auto-clickers are prohibited.
              </p>

              <p>
                • Exploiting glitches or unintended mechanics is prohibited.
              </p>

              <p>
                • Any form of hacks, cheats, scripts, or external advantages are banned.
              </p>

              <p>
                • Abuse of game-breaking bugs may result in permanent blacklist.
              </p>

              <p>
                • No animation fflags are banned.
              </p>

              <p>
                • Abusive rendering fflags are prohibited.
              </p>

              <p>
                • Staff decide whether an fflag is abusive.
              </p>

            </div>

          )}

        </div>

        {/* PUNISHMENTS */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden">

          <button
            onClick={() =>
              toggleSection("punishments")
            }
            className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition"
          >

            <div>

              <p className="text-red-400 font-bold mb-2">
                🛡️ PUNISHMENTS
              </p>

              <h2 className="text-3xl font-black">
                Competitive Enforcement
              </h2>

            </div>

            <span className="text-3xl">
              {openSection === "punishments"
                ? "−"
                : "+"}
            </span>

          </button>

          {openSection === "punishments" && (

            <div className="px-8 pb-8 text-zinc-300 space-y-4">

              <p>
                • Fake proof may lead to suspension.
              </p>

              <p>
                • Refusing to accept losses may cause disqualification.
              </p>

              <p>
                • Racism, harassment, or toxic behavior may lead to permanent blacklist.
              </p>

              <p>
                • Severe cheating may result in permanent competitive bans.
              </p>

              <p>
                • Staff decisions are final.
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}