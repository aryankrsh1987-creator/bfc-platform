"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateCrewPage() {

  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [crewName, setCrewName] = useState("");

  const [crewTag, setCrewTag] = useState("");

  const [region, setRegion] = useState("Asia");

  const [discord, setDiscord] = useState("");

  const [roblox, setRoblox] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const loadUser = async () => {

      const { data } =
        await supabase.auth.getUser();

      if (data.user) {

        setUser(data.user);

      }

    };

    loadUser();

  }, []);

  const createCrew = async () => {

    if (
      !crewName ||
      !crewTag ||
      !discord ||
      !roblox
    ) {

      alert("Fill everything.");

      return;

    }

    if (!user) {

      alert("Login first.");

      return;

    }

    setLoading(true);

    // CHECK IF USER ALREADY HAS A CREW
    const { data: existingCrew } =
      await supabase
        .from("crews")
        .select("*")
        .eq("owner_email", user.email)
        .single();

    if (existingCrew) {

      alert(
        "You already own a crew."
      );

      setLoading(false);

      return;

    }

    const { error } =
      await supabase
        .from("crews")
        .insert([

          {

            owner_email:
              user.email,

            owner_username:
              user.user_metadata
                ?.full_name ||

              user.email,

            crew_name:
              crewName,

            crew_tag:
              crewTag,

            region,

            discord,

            roblox,

            // STATS
            pub_won: 0,

            pub_lost: 0,

            org_won: 0,

            org_lost: 0,

          },

        ]);

    setLoading(false);

    if (error) {

      alert(error.message);

      return;

    }

    alert("Crew created!");

    router.push("/crews");

  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden relative">

      {/* PURPLE GLOW */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/30 blur-[160px] rounded-full" />

      {/* BLUE GLOW */}
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-600/20 blur-[160px] rounded-full" />

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-2xl bg-white/[0.04] border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl">

        {/* TITLE */}
        <p className="text-purple-400 tracking-[5px] font-bold mb-4">
          CREATE CREW
        </p>

        <h1 className="text-5xl font-black mb-10">

          Register Your
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {" "}Crew
          </span>

        </h1>

        {/* FORM */}
        <div className="space-y-6">

          {/* CREW NAME */}
          <div>

            <p className="text-zinc-400 mb-2">
              Crew Name
            </p>

            <input
              value={crewName}
              onChange={(e) =>
                setCrewName(
                  e.target.value
                )
              }
              placeholder="Shadow Reapers"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/40"
            />

          </div>

          {/* CREW TAG */}
          <div>

            <p className="text-zinc-400 mb-2">
              Crew Tag
            </p>

            <input
              value={crewTag}
              onChange={(e) =>
                setCrewTag(
                  e.target.value
                )
              }
              placeholder="SR"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/40"
            />

          </div>

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

              <option>
                Asia
              </option>

              <option>
                Europe
              </option>

              <option>
                North America
              </option>

              <option>
                South America
              </option>

              <option>
                Middle East
              </option>

            </select>

          </div>

          {/* DISCORD */}
          <div>

            <p className="text-zinc-400 mb-2">
              Discord Invite
            </p>

            <input
              value={discord}
              onChange={(e) =>
                setDiscord(
                  e.target.value
                )
              }
              placeholder="discord.gg/example"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/40"
            />

          </div>

          {/* ROBLOX */}
          <div>

            <p className="text-zinc-400 mb-2">
              Roblox Contact
            </p>

            <input
              value={roblox}
              onChange={(e) =>
                setRoblox(
                  e.target.value
                )
              }
              placeholder="@Username"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/40"
            />

          </div>

          {/* PREVIEW */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">

            <p className="text-zinc-500 mb-3">
              Crew Preview
            </p>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  {crewName || "Crew Name"}
                </h2>

                <p className="text-purple-400">
                  [{crewTag || "TAG"}]
                </p>

              </div>

              <div className="text-right">

                <p className="text-zinc-400">
                  {region}
                </p>

                <p className="text-zinc-500 text-sm">
                  0W - 0L
                </p>

              </div>

            </div>

          </div>

          {/* BUTTON */}
          <button
            onClick={createCrew}
            disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-[1.02] transition duration-300 shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >

            {loading
              ? "Creating..."
              : "Create Crew"}

          </button>

        </div>

      </div>

    </main>
  );
}