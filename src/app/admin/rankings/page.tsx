"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Ranking {
  id: number;
  ranks: number;
  mode: "1v1" | "2v2";
  username: string | null;
  player_1: string | null;
  player_2: string | null;
  region: string;
  country_flag: string | null;
  discord: string | null;
  youtube: string | null;
}

export default function AdminRankingsPage() {
  const router = useRouter();

  const [players, setPlayers] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newPlayer, setNewPlayer] = useState({
    ranks: 1,
    mode: "1v1" as "1v1" | "2v2",
    username: "",
    player_1: "",
    player_2: "",
    region: "Asia",
    country_flag: "🌍",
    discord: "",
    youtube: "",
  });

  useEffect(() => {
    checkAccess();
  }, []);

  async function fetchPlayers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("player_rankings")
      .select("*")
      .order("ranks", { ascending: true });

    if (error) {
      console.error(error);
      setPlayers([]);
    } else {
      setPlayers((data as Ranking[]) || []);
    }

    setLoading(false);
  }

  async function checkAccess() {
    try {
      const { data: authUserData } = await supabase.auth.getUser();

      const user = authUserData?.user ?? null;

      console.log("Current user:", user);

      if (!user?.email) {
        setLoading(false);
        router.push("/leaderboards");
        return;
      }

      const { data, error } = await supabase
        .from("staffs")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();

      console.log("Staff row:", data);
      console.log("Staff error:", error);

      if (error || !data) {
        setLoading(false);
        router.push("/leaderboards");
        return;
      }

      await fetchPlayers();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const handleChange = (
    id: number,
    field: keyof Ranking,
    value: string | number | null,
  ) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? { ...player, [field]: value } : player,
      ),
    );
  };

  const saveChanges = async () => {
    setSaving(true);

    try {
      await Promise.all(
        players.map((player) =>
          supabase
            .from("player_rankings")
            .update({
              ranks: player.ranks,
              mode: player.mode,
              username: player.username,
              player_1: player.player_1,
              player_2: player.player_2,
              region: player.region,
              country_flag: player.country_flag,
              discord: player.discord,
              youtube: player.youtube,
            })
            .eq("id", player.id),
        ),
      );

      alert("Changes saved successfully!");
      await fetchPlayers();
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    }

    setSaving(false);
  };

  const createPlayer = async () => {
    const payload = {
      ranks: newPlayer.ranks,
      mode: newPlayer.mode,
      username: newPlayer.username || null,
      player_1: newPlayer.player_1 || null,
      player_2: newPlayer.player_2 || null,
      region: newPlayer.region,
      country_flag: newPlayer.country_flag || null,
      discord: newPlayer.discord || null,
      youtube: newPlayer.youtube || null,
    };

    const { error } = await supabase.from("player_rankings").insert(payload);

    if (error) {
      console.error(error);
      alert(`Failed to create ranking:\n${error.message}`);
      return;
    }

    setNewPlayer({
      ranks: 1,
      mode: "1v1",
      username: "",
      player_1: "",
      player_2: "",
      region: "Asia",
      country_flag: "🌍",
      discord: "",
      youtube: "",
    });

    await fetchPlayers();
  };

  const deletePlayer = async (id: number) => {
    if (!confirm("Delete this ranking?")) return;

    const { error } = await supabase
      .from("player_rankings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete ranking.");
      return;
    }

    await fetchPlayers();
  };

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => router.push("/leaderboards")}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-bold hover:bg-white/10"
          >
            ← Back
          </button>

          <h1 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-4xl font-black text-transparent">
            ✏️ Rankings Admin
          </h1>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Save"}
          </button>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-4 text-2xl font-bold">➕ Create Ranking</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="number"
              value={newPlayer.ranks}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  ranks: Number(e.target.value),
                })
              }
              placeholder="Rank"
              className="rounded-xl bg-black p-3"
            />

            <select
              value={newPlayer.mode}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  mode: e.target.value as "1v1" | "2v2",
                })
              }
              className="rounded-xl bg-black p-3"
            >
              <option value="1v1">1v1</option>
              <option value="2v2">2v2</option>
            </select>

            <input
              value={newPlayer.region}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  region: e.target.value,
                })
              }
              placeholder="Region"
              className="rounded-xl bg-black p-3"
            />

            <input
              value={newPlayer.country_flag}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  country_flag: e.target.value,
                })
              }
              placeholder="Flag"
              className="rounded-xl bg-black p-3"
            />

            {newPlayer.mode === "1v1" ? (
              <input
                value={newPlayer.username}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    username: e.target.value,
                  })
                }
                placeholder="Username"
                className="rounded-xl bg-black p-3"
              />
            ) : (
              <>
                <input
                  value={newPlayer.player_1}
                  onChange={(e) =>
                    setNewPlayer({
                      ...newPlayer,
                      player_1: e.target.value,
                    })
                  }
                  placeholder="Player 1"
                  className="rounded-xl bg-black p-3"
                />

                <input
                  value={newPlayer.player_2}
                  onChange={(e) =>
                    setNewPlayer({
                      ...newPlayer,
                      player_2: e.target.value,
                    })
                  }
                  placeholder="Player 2"
                  className="rounded-xl bg-black p-3"
                />
              </>
            )}

            <input
              value={newPlayer.discord}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  discord: e.target.value,
                })
              }
              placeholder="Discord URL"
              className="rounded-xl bg-black p-3"
            />

            <input
              value={newPlayer.youtube}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  youtube: e.target.value,
                })
              }
              placeholder="YouTube URL"
              className="rounded-xl bg-black p-3"
            />
          </div>

          <button
            onClick={createPlayer}
            className="mt-6 rounded-2xl bg-green-600 px-6 py-3 font-bold"
          >
            Create Ranking
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="space-y-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-bold">#{player.ranks}</p>

                  <button
                    onClick={() => deletePlayer(player.id)}
                    className="rounded-xl bg-red-500 px-4 py-2"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <input
                    type="number"
                    value={player.ranks}
                    onChange={(e) =>
                      handleChange(player.id, "ranks", Number(e.target.value))
                    }
                    className="rounded-xl bg-black p-3"
                  />

                  <select
                    value={player.mode}
                    onChange={(e) =>
                      handleChange(
                        player.id,
                        "mode",
                        e.target.value as "1v1" | "2v2",
                      )
                    }
                    className="rounded-xl bg-black p-3"
                  >
                    <option value="1v1">1v1</option>
                    <option value="2v2">2v2</option>
                  </select>

                  <input
                    value={player.region}
                    onChange={(e) =>
                      handleChange(player.id, "region", e.target.value)
                    }
                    className="rounded-xl bg-black p-3"
                  />

                  <input
                    value={player.country_flag || ""}
                    onChange={(e) =>
                      handleChange(player.id, "country_flag", e.target.value)
                    }
                    className="rounded-xl bg-black p-3"
                  />

                  <input
                    value={player.discord || ""}
                    onChange={(e) =>
                      handleChange(player.id, "discord", e.target.value)
                    }
                    placeholder="Discord"
                    className="rounded-xl bg-black p-3"
                  />

                  <input
                    value={player.youtube || ""}
                    onChange={(e) =>
                      handleChange(player.id, "youtube", e.target.value)
                    }
                    placeholder="YouTube URL"
                    className="rounded-xl bg-black p-3"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {player.mode === "1v1" ? (
                    <input
                      value={player.username || ""}
                      onChange={(e) =>
                        handleChange(player.id, "username", e.target.value)
                      }
                      placeholder="Username"
                      className="rounded-xl bg-black p-3"
                    />
                  ) : (
                    <>
                      <input
                        value={player.player_1 || ""}
                        onChange={(e) =>
                          handleChange(player.id, "player_1", e.target.value)
                        }
                        placeholder="Player 1"
                        className="rounded-xl bg-black p-3"
                      />
                      <input
                        value={player.player_2 || ""}
                        onChange={(e) =>
                          handleChange(player.id, "player_2", e.target.value)
                        }
                        placeholder="Player 2"
                        className="rounded-xl bg-black p-3"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
