"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

type Lesson = {
  id: number;
  outline: string;
  status: string;
};

export default function LessonTable() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .order("id", { ascending: true });
      setLessons(data || []);
      setLoading(false);
    };
    loadData();

    const channel = supabase
      .channel("lessons-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lessons" },
        (payload) => {
          console.log("Realtime event:", payload);
          if (payload.eventType === "INSERT") {
            setLessons((prev) => [...prev, payload.new as Lesson]);
          } else if (payload.eventType === "UPDATE") {
            setLessons((prev) =>
              prev.map((l) =>
                l.id === (payload.new as Lesson).id
                  ? (payload.new as Lesson)
                  : l
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading)
    return (
      <div className="text-center text-white py-6">Loading lessons...</div>
    );

  return (
    <div className="w-[500px] mx-auto mb-4 bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-2xl font-semibold text-white text-center py-4 border-b border-gray-700">
        📘 Lesson Management
      </h2>
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="bg-gray-800 text-gray-100 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Sr</th>
            <th className="px-4 py-3">Lesson ID</th>
            <th className="px-4 py-3">Outline</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {lessons.length > 0 ? (
            lessons.map((l, i) => (
              <tr
                key={l.id}
                className="hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              >
                <Link href={`./lesson/${l.id}`} className="contents">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-mono">{l.id}</td>
                  <td className="px-4 py-3">{l.outline}</td>
                  <td className="px-4 py-3">
                    {l.status === "generated" ? (
                      <span className="bg-green-300 text-black rounded-full px-3 py-1">
                        Generated
                      </span>
                    ) : (
                      <span className="bg-yellow-300 text-black rounded-full px-3 py-1">
                        Generating…
                      </span>
                    )}
                  </td>
                </Link>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-6 text-gray-400">
                No lessons found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
