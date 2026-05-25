"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditProfilePage() {

  const [user, setUser] = useState<any>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");

  const [region, setRegion] = useState("Asia");
  const [device, setDevice] = useState("PC");

  const [message, setMessage] = useState("");

  useEffect(() => {

    loadProfile();

  }, []);

  const loadProfile = async () => {

    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) return;

    setUser(authData.user);

    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("email", authData.user.email)
      .single();

    if (data) {

      setUsername(data.username || "");
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url || "");
      setStatus(data.status || "");

      setRegion(data.region || "Asia");
      setDevice(data.device || "PC");

    }
  };

  const saveProfile = async () => {

    if (!user) return;

    const { error } = await supabase
      .from("players")
      .upsert(
        {
          email: user.email,
          username: username,
          display_name: displayName,
          avatar_url: avatarUrl,
          status: status,
          region: region,
          device: device,
        },
        {
          onConflict: "email",
        }
      );

    if (error) {

      setMessage("Failed to save profile.");
      return;

    }

    setMessage("Profile updated successfully. Redirecting...");

    setTimeout(() => {

      window.location.href = "/profile";

    }, 2000);

  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10 overflow-hidden relative">

      {/* Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[180px] opacity-20" />

      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[180px] opacity-20" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-2xl bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl shadow-[0_0_100px_rgba(168,85,247,0.15)]">

        <h1 className="text-5xl font-black mb-8">
          Edit Profile
        </h1>

        <div className="space-y-6">

          {/* Avatar Preview */}
          <div className="flex justify-center">

            <img
              src={
                avatarUrl ||
                "https://placehold.co/400x400/7c3aed/ffffff?text=A"
              }
              alt="avatar"
              className="w-40 h-40 rounded-full object-cover border-4 border-black shadow-[0_0_40px_rgba(59,130,246,0.7)]"
            />

          </div>

          {/* Upload Avatar */}
          <div>

            <p className="mb-2 text-zinc-400">
              Upload Avatar
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {

                const file = e.target.files?.[0];

                if (!file) return;

                const fileName = `${Date.now()}-${file.name}`;

                const { error } = await supabase.storage
                  .from("avatars")
                  .upload(fileName, file);

                if (error) {

                  setMessage("Failed to upload image.");
                  return;

                }

                const { data } = supabase.storage
                  .from("avatars")
                  .getPublicUrl(fileName);

                setAvatarUrl(data.publicUrl);

              }}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4"
            />

          </div>

          {/* Username */}
          <div>

            <p className="mb-2 text-zinc-400">
              Username
            </p>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="fallend4rk"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            />

          </div>

          {/* Display Name */}
          <div>

            <p className="mb-2 text-zinc-400">
              Display Name
            </p>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Excalibur"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            />

          </div>

          {/* Region */}
          <div>

            <p className="mb-2 text-zinc-400">
              Region
            </p>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            >
              <option>Asia</option>
              <option>Europe</option>
              <option>North America</option>
              <option>South America</option>
              <option>Africa</option>
              <option>Oceania</option>
            </select>

          </div>

          {/* Device */}
          <div>

            <p className="mb-2 text-zinc-400">
              Device
            </p>

            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            >
              <option>PC</option>
              <option>Mobile</option>
              <option>Console</option>
            </select>

          </div>

          {/* Status */}
          <div>

            <p className="mb-2 text-zinc-400">
              Status
            </p>

            <textarea
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Grinding ranked ⚔️"
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none resize-none"
            />

          </div>

          {/* Save */}
          <button
            onClick={saveProfile}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition"
          >
            Save Profile
          </button>

          {/* Message */}
          {message && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-green-300">
              {message}
            </div>
          )}

        </div>

      </div>

    </main>
  );
}