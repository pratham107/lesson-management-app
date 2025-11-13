/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { outline } = await request.json();

    if (!outline)
      return NextResponse.json({ error: "Outline is required" }, { status: 400 });

    // Check if lesson already exists
    const { data: existingLesson, error: fetchError } = await supabase
      .from("lessons")
      .select("*")
      .eq("outline", outline)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (existingLesson) {
      // If already exists, return it instead of creating a duplicate
      return NextResponse.json(
        { message: "Lesson already exists", id: existingLesson.id },
        { status: 200 }
      );
    }

    // create new lesson
    const { data: pendingLesson, error: insertError } = await supabase
      .from("lessons")
      .insert([{ outline, status: "generating" }])
      .select()
      .single();

    if (insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 });

    const prompt = `
Generate only the JSX (no function, no TypeScript, no export, no explanation).
The JSX must be safe and ready to render directly inside a React component.
Use Tailwind CSS for styling.

Topic: "${outline}"

Requirements:
- Return ONLY valid JSX (do not include any wrapper like export default function or <>).
- Use simple, clear text and structure with headings, paragraphs, and small examples.
- Wrap everything in a single root <div> element.
- Do not include any explanations or code comments.
- Output only the JSX content.
`;

    const trace: any[] = [];
    trace.push({ step: "Prompt Sent", prompt });

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();

    trace.push({ step: "Gemini Response", response: generatedContent });

    await supabase
      .from("lessons")
      .update({
        content: generatedContent,
        status: "generated",
        trace,
      })
      .eq("id", pendingLesson.id);

    return NextResponse.json(
      { message: "Lesson generated successfully", id: pendingLesson.id },
      { status: 201 }
    );

  } catch (err: any) {
    console.error("Gemini generation failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to generate lesson content" },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("*")
      .order("id", { ascending: true });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ lessons }, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch lessons:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}



