"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ChatPage() {

  const [user, setUser] = useState<any>(null);

  const [profile, setProfile] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);

  const [message, setMessage] = useState("");

  const [currentRoom, setCurrentRoom] = useState("global-chat");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingText, setEditingText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // LOAD USER
  useEffect(() => {

    const loadUser = async () => {

      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) return;

      setUser(authData.user);

      const { data: profileData } = await supabase
        .from("players")
        .select("*")
        .eq("email", authData.user.email)
        .single();

      setProfile(profileData);

    };

    loadUser();

  }, []);

  // LOAD MESSAGES
  useEffect(() => {

    fetchMessages(currentRoom);

    const channel = supabase
      .channel("global-chat")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {

          fetchMessages(currentRoom);

        }
      )

      .subscribe();

    return () => {

      supabase.removeChannel(channel);

    };

  }, [currentRoom]);

  const fetchMessages = async (room: string) => {

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("room", room)
      .order("created_at", {
        ascending: true,
      });

    if (data) {

      setMessages(data);

      setTimeout(() => {

        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });

      }, 100);

    }

  };

  const sendMessage = async () => {

    if (!message.trim()) return;

    const bannedWords = [

      "nigger",
      "niga",
      "nigga",
      "slave",

      "isis",
      "terrorist",
      "al qaeda",

      "pedo",
      "pedophile",
      "cp",
      "rape",
      "sex",
      "porn",
      "child porn",

      "kill yourself",
      "kys",

    ];

    const lowerMessage = message.toLowerCase();

    const containsBadWord = bannedWords.some((word) =>
      lowerMessage.includes(word)
    );

    if (containsBadWord) {

      alert("Message blocked.");

      return;

    }

    if (!profile) return;

    const { error } = await supabase
      .from("messages")
      .insert([
        {
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          text: message,
          room: currentRoom,
        },
      ]);

    if (!error) {

      setMessage("");

    }

  };

  const deleteMessage = async (id: number) => {

    await supabase
      .from("messages")
      .delete()
      .eq("id", id);

    setMessages((prev) =>
      prev.filter((msg) => msg.id !== id)
    );

  };

  const saveEdit = async (id: number) => {

    await supabase
      .from("messages")
      .update({
        text: editingText,
      })
      .eq("id", id);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, text: editingText }
          : msg
      )
    );

    setEditingId(null);

  };

  return (
    <main className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* LEFT SIDEBAR */}
      <div className="w-72 border-r border-white/10 bg-white/5 backdrop-blur-2xl p-6 hidden md:block">

        <Link
          href="/"
          className="text-3xl font-black mb-8 block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          BFC CHAT
        </Link>

        <div className="space-y-3">

          <button
            onClick={() => {

              setCurrentRoom("global-chat");

              fetchMessages("global-chat");

            }}
            className={`w-full text-left rounded-2xl px-4 py-3 transition

            ${currentRoom === "global-chat"
              ? "bg-purple-500/20 border border-purple-500/20"
              : "bg-white/5 border border-white/10"}

            `}
          >
            # global-chat
          </button>

          <button
            onClick={() => {

              setCurrentRoom("asia");

              fetchMessages("asia");

            }}
            className={`w-full text-left rounded-2xl px-4 py-3 transition

            ${currentRoom === "asia"
              ? "bg-purple-500/20 border border-purple-500/20"
              : "bg-white/5 border border-white/10"}

            `}
          >
            # asia
          </button>

          <button
            onClick={() => {

              setCurrentRoom("arena");

              fetchMessages("arena");

            }}
            className={`w-full text-left rounded-2xl px-4 py-3 transition

            ${currentRoom === "arena"
              ? "bg-purple-500/20 border border-purple-500/20"
              : "bg-white/5 border border-white/10"}

            `}
          >
            # arena
          </button>

        </div>

      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-5 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-black">
              # {currentRoom}
            </h2>

            <p className="text-zinc-400 text-sm">
              Competitive community chat
            </p>

          </div>

          <div className="text-green-400 font-semibold animate-pulse">
            ● ONLINE
          </div>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.map((msg, index) => (

            <div
              key={index}
              className="group relative flex items-start gap-4 animate-[messagePop_0.4s_ease] bg-white/[0.03] border border-white/5 rounded-2xl p-3 hover:bg-white/[0.05] transition"
            >

              <img
                src={msg.avatar_url || "/avatar.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border border-white/10"
              />

              <div className="flex-1">

                <div className="flex items-center gap-2">

                  <p className="font-bold text-lg">
                    {msg.display_name}
                  </p>

                  <span className="text-zinc-500 text-sm">
                    @{msg.username}
                  </span>

                </div>

                {editingId === msg.id ? (

                  <div className="flex gap-2 mt-2">

                    <input
                      value={editingText}
                      onChange={(e) =>
                        setEditingText(e.target.value)
                      }

                      onKeyDown={(e) => {

                        if (e.key === "Enter") {

                          saveEdit(msg.id);

                        }

                      }}

                      className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 outline-none flex-1"
                    />

                    <button
                      onClick={() => saveEdit(msg.id)}
                      className="bg-green-500 px-4 rounded-xl"
                    >
                      Save
                    </button>

                  </div>

                ) : (

                  <p className="text-zinc-300 mt-1 break-words">
                    {msg.text}
                  </p>

                )}

                {/* DISCORD STYLE ACTIONS */}
                {profile?.username === msg.username && (

                  <div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                  >

                    <div className="flex items-center gap-2 bg-black/80 border border-white/10 backdrop-blur-xl px-2 py-1 rounded-xl shadow-2xl">

                      <button
                        onClick={() => {

                          setEditingId(msg.id);

                          setEditingText(msg.text);

                        }}
                        className="text-zinc-300 hover:text-blue-400 transition text-sm"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-zinc-300 hover:text-red-400 transition text-sm"
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                )}

              </div>

            </div>

          ))}

          <div ref={bottomRef} />

        </div>

        {/* INPUT */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl p-5">

          <div className="flex gap-4">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}

              onKeyDown={(e) => {

                if (e.key === "Enter") {

                  sendMessage();

                }

              }}

              placeholder={`Message #${currentRoom}`}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 rounded-2xl font-bold hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition duration-300"
            >
              Send
            </button>

          </div>

        </div>

      </div>

      {/* ANIMATIONS */}
      <style jsx global>{`

        @keyframes messagePop {

          0% {

            opacity: 0;
            transform: translateY(20px) scale(0.9);

          }

          60% {

            opacity: 1;
            transform: translateY(-4px) scale(1.02);

          }

          100% {

            opacity: 1;
            transform: translateY(0px) scale(1);

          }

        }

      `}</style>

    </main>
  );
}