"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiveProvider, LivePreview, LiveError } from "react-live";

interface Lesson {
  id: number;
  outline: string;
  content: string;
  status: string;
  trace: { step: string; prompt?: string; response?: string }[];
}

export default function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lesson/${id}`);
        if (!res.ok) throw new Error("Failed to fetch lesson");
        const data = await res.json();
        setLesson(data.lesson);
        console.log(data.lesson.content)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-200">
        Loading lesson...
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center py-10">❌ Error: {error}</div>;

  if (!lesson)
    return <div className="text-center text-gray-400 py-10">No lesson found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-white">
        Lesson #{lesson.id}: {lesson.outline}
      </h1>

      <section className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-3 text-white">🧠 Lesson Content</h2>

        <LiveProvider code={lesson.content}>
          <div className="bg-gray-800 rounded-lg p-6">
            <LivePreview className="text-gray-200" />
            <LiveError className="text-red-400 mt-2" />
          </div>
        </LiveProvider>
      </section>
    </div>
  );
}
