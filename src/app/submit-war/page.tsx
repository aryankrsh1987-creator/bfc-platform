"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SubmitWarPage() {

  const [crewA, setCrewA] = useState("");

  const [crewB, setCrewB] = useState("");

  const [winner, setWinner] = useState("");

  const [region, setRegion] = useState("Asia");

  const [format, setFormat] = useState("2v2");

  const [images, setImages] =
    useState<File[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [opponentScore, setOpponentScore] =
    useState(0);

  // HANDLE IMAGE SELECT
  const handleImages = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    if (!e.target.files) return;

    setImages(Array.from(e.target.files));

  };

  // SUBMIT WAR
  const submitWar = async () => {

    const { data: authData } =
      await supabase.auth.getUser();

    if (!authData.user) {

      alert("Login first.");

      return;

    }

    if (images.length === 0) {

      alert("Upload screenshots.");

      return;

    }

    setUploading(true);

    const uploadedUrls: string[] = [];

    // UPLOAD ALL IMAGES
    for (const image of images) {

      const fileName =
        `${Date.now()}-${image.name}`;

      const { error } =
        await supabase.storage
          .from("war-proofs")
          .upload(fileName, image);

      if (error) {

        alert(error.message);

        setUploading(false);

        return;

      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("war-proofs")
        .getPublicUrl(fileName);

      uploadedUrls.push(
        publicUrlData.publicUrl
      );

    }

    // AUTO SCORE
    const autoScore =
      `${images.length}-${opponentScore}`;

    // SAVE TO DATABASE
    const { error } =
      await supabase
        .from("war_submissions")
        .insert([

          {

            crew_a: crewA,

            crew_b: crewB,

            winner,

            score: autoScore,

            region,

            format,

            proof_images: uploadedUrls,

            screenshot_count:
              images.length,

            submitted_by:
              authData.user.email,

            status: "pending",

          },

        ]);

    setUploading(false);

    if (error) {

      alert(error.message);

      return;

    }

    alert(
      `War submitted! Auto score: ${autoScore}`
    );

  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden relative">

      {/* GLOW */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-red-500/20 blur-[150px] rounded-full" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-purple-500/20 blur-[150px] rounded-full" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-3xl bg-white/[0.04] border border-white/10 rounded-[32px] p-10 backdrop-blur-xl">

        {/* TITLE */}
        <div className="mb-10">

          <p className="text-red-400 font-bold tracking-[5px] mb-3">
            VERIFIED WAR SYSTEM
          </p>

          <h1 className="text-6xl font-black">

            Submit
            <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              {" "}War Log
            </span>

          </h1>

        </div>

        {/* FORM */}
        <div className="space-y-5">

          <input
            placeholder="Crew A"
            value={crewA}
            onChange={(e) =>
              setCrewA(e.target.value)
            }
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/40"
          />

          <input
            placeholder="Crew B"
            value={crewB}
            onChange={(e) =>
              setCrewB(e.target.value)
            }
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/40"
          />

          <input
            placeholder="Winner Crew"
            value={winner}
            onChange={(e) =>
              setWinner(e.target.value)
            }
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/40"
          />

          {/* REGION */}
          <select
            value={region}
            onChange={(e) =>
              setRegion(e.target.value)
            }
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4"
          >

            <option>Asia</option>
            <option>Europe</option>
            <option>Middle East</option>
            <option>North America</option>

          </select>

          {/* FORMAT */}
          <select
            value={format}
            onChange={(e) =>
              setFormat(e.target.value)
            }
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4"
          >

            <option>1v1</option>
            <option>2v2</option>
            <option>3v3</option>
            <option>4v4</option>

          </select>

          {/* IMAGE UPLOAD */}
          <div className="bg-black/30 border border-dashed border-white/20 rounded-3xl p-8 text-center">

            <p className="text-2xl font-bold mb-3">
              Upload Winning Screenshots
            </p>

            <p className="text-zinc-500 mb-6">
              1 screenshot = 1 point
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="w-full"
            />

          </div>

          {/* OPPONENT SCORE */}
          <input
            type="number"
            value={opponentScore}
            onChange={(e) =>
              setOpponentScore(
                Number(e.target.value)
              )
            }
            placeholder="Opponent Score"
            className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/40"
          />

          {/* AUTO SCORE */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">

            <p className="text-red-400 font-bold mb-2">
              AUTO DETECTED SCORE
            </p>

            <p className="text-5xl font-black">
              {images.length}-{opponentScore}
            </p>

          </div>

          {/* SUBMIT */}
          <button
            onClick={submitWar}
            disabled={uploading}
            className="w-full py-5 rounded-3xl text-2xl font-black bg-gradient-to-r from-red-500 to-purple-500 hover:scale-[1.02] transition duration-300 shadow-[0_0_40px_rgba(239,68,68,0.35)]"
          >

            {uploading
              ? "Uploading..."
              : "Submit Verified War"}

          </button>

        </div>

      </div>

    </main>
  );
}