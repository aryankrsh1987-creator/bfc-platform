"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RequestWarPage() {

  const [enemyCrew, setEnemyCrew] =
    useState("");

  const [warType, setWarType] =
    useState("organized");

  const [format, setFormat] =
    useState("2v2");

  const [region, setRegion] =
    useState("Asia");

  const [date, setDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const sendRequest = async () => {

    const { data: authData } =
      await supabase.auth.getUser();

    if (!authData.user) {

      alert("Login first.");

      return;

    }

    if (!enemyCrew.trim()) {

      alert(
        "Please enter enemy crew."
      );

      return;

    }

    if (
      warType === "organized" &&
      !date
    ) {

      alert(
        "Select match date."
      );

      return;

    }

    setLoading(true);

    // GET PLAYER USERNAME
    const { data: playerData } =
      await supabase
        .from("players")
        .select("username")
        .eq(
          "email",
          authData.user.email
        )
        .single();

    // FIND TARGET CREW
    const { data: targetCrew } =
      await supabase
        .from("crews")
        .select("owner_email")
        .eq(
          "crew_name",
          enemyCrew
        )
        .single();

    // CREW DOES NOT EXIST
    if (!targetCrew) {

      setLoading(false);

      alert(
        "Crew does not exist."
      );

      return;

    }

    // CREATE WAR REQUEST
    const { error } =
      await supabase
        .from("war_requests")
        .insert([

          {

            requester_email:
              authData.user.email,

            requester_username:
              playerData?.username ||
              "Unknown Player",

            target_crew_name:
              enemyCrew,

            war_type:
              warType,

            format:
              warType === "organized"
                ? format
                : null,

            region,

            war_date:
              warType === "organized"
                ? date
                : null,

            notes,

            status: "pending",

          },

        ]);

    if (error) {

      setLoading(false);

      alert(error.message);

      return;

    }

    // SEND WEBSITE NOTIFICATION
    await supabase
      .from("notifications")
      .insert([

        {

          user_email:
            targetCrew.owner_email,

          title:
            "⚔️ New War Request",

          message:
            `${playerData?.username || "Unknown Player"} requested a ${warType} war against ${enemyCrew}.`

        },

      ]);

    setLoading(false);

    alert(
      "War request sent!"
    );

    setEnemyCrew("");
    setNotes("");
    setDate("");

  };

  return (

    <main className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6 py-20">

      {/* RED GLOW */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-red-600/20 blur-[160px] rounded-full" />

      {/* PURPLE GLOW */}
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/20 blur-[160px] rounded-full" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-3xl bg-white/[0.04] border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl">

        {/* HEADER */}
        <div className="mb-10">

          <p className="text-red-400 tracking-[6px] font-bold mb-4">
            WAR REQUEST SYSTEM
          </p>

          <h1 className="text-6xl font-black mb-4">

            Request
            <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Competitive War
            </span>

          </h1>

          <p className="text-zinc-400 text-lg">
            Challenge crews to organized
            or public wars.
          </p>

        </div>

        {/* FORM */}
        <div className="space-y-6">

          {/* ENEMY CREW */}
          <div>

            <p className="text-zinc-400 mb-2">
              Enemy Crew
            </p>

            <input
              value={enemyCrew}
              onChange={(e) =>
                setEnemyCrew(
                  e.target.value
                )
              }
              placeholder="Shadow Reapers"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/40"
            />

          </div>

          {/* WAR TYPE */}
          <div>

            <p className="text-zinc-400 mb-3">
              War Type
            </p>

            <div className="grid grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() =>
                  setWarType(
                    "organized"
                  )
                }
                className={`py-5 rounded-2xl font-black transition duration-300

                ${warType === "organized"
                  ? "bg-gradient-to-r from-red-500 to-purple-500 shadow-[0_0_30px_rgba(239,68,68,0.35)]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"}

                `}
              >
                🏆 Organized War
              </button>

              <button
                type="button"
                onClick={() =>
                  setWarType(
                    "public"
                  )
                }
                className={`py-5 rounded-2xl font-black transition duration-300

                ${warType === "public"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_30px_rgba(249,115,22,0.35)]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"}

                `}
              >
                ⚔️ Public War
              </button>

            </div>

          </div>

          {/* ORGANIZED OPTIONS */}
          {warType === "organized" && (

            <>

              <div>

                <p className="text-zinc-400 mb-2">
                  Match Format
                </p>

                <select
                  value={format}
                  onChange={(e) =>
                    setFormat(
                      e.target.value
                    )
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
                >

                  <option>1v1</option>
                  <option>2v2</option>
                  <option>3v3</option>
                  <option>4v4</option>

                </select>

              </div>

              <div>

                <p className="text-zinc-400 mb-2">
                  Match Date
                </p>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
                />

              </div>

            </>

          )}

          {/* REGION */}
          <div>

            <p className="text-zinc-400 mb-2">
              Region
            </p>

            <select
              value={region}
              onChange={(e) =>
                setRegion(
                  e.target.value
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            >

              <option>Asia</option>
              <option>Europe</option>
              <option>Oceania</option>

            </select>

          </div>

          {/* NOTES */}
          <div>

            <p className="text-zinc-400 mb-2">
              Notes
            </p>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Additional war details..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 resize-none outline-none"
            />

          </div>

          {/* SEND BUTTON */}
          <button
            onClick={sendRequest}
            disabled={loading}
            className="w-full py-5 rounded-3xl text-2xl font-black bg-gradient-to-r from-red-500 to-purple-500 hover:scale-[1.02] transition duration-300 shadow-[0_0_40px_rgba(239,68,68,0.35)]"
          >

            {loading
              ? "Sending..."
              : "⚔️ Send War Request"}

          </button>

          {/* BACK */}
          <Link
            href="/crews"
            className="block text-center text-zinc-400 hover:text-white transition"
          >
            ← Back To Crews
          </Link>

        </div>

      </div>

    </main>

  );

}