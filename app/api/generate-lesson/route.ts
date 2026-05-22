import { streamObject, embed } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

// Strict JSON Schema for the LLM output
const lessonSchema = z.object({
  imageGenerationPrompt: z.string().describe("A highly detailed English prompt to generate an educational AI image explaining the topic (e.g., 'A highly detailed 3D illustration of the solar system showing planets orbiting the sun, educational, vivid colors')"),
  lessonHook: z.string().describe("A short, engaging opening to grab students' attention"),
  classroomManagement: z.string().describe("Specific instructions on how to group students based on the provided 'studentsCount'"),
  mermaidDiagramCode: z.string().describe("Valid Mermaid.js 'mindmap' code (starting with mindmap\\n) showing the core concepts and elements of the topic"),
  interactiveSteps: z.array(z.object({
    title: z.string().describe("Step title"),
    description: z.string().describe("Detailed explanation of what the teacher and students will do"),
    durationInMinutes: z.number().describe("Duration in minutes"),
  })),
  alternativeStrategies: z.array(z.string()).describe("Brief list of fallback strategies"),
});

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration environment variables are missing.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { subject, topic, stage, studentsCount, resources = [] } = await req.json();

    // 1. Generate embedding for the user's query
    const queryText = `المادة: ${subject} | الموضوع: ${topic} | المرحلة: ${stage} | الطلاب: ${studentsCount} | الموارد المتاحة: ${resources.join(", ")}`;
    
    const { embedding: queryEmbedding } = await embed({
      model: google.embedding("gemini-embedding-001"),
      value: queryText,
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
    });

    // 2. Query Supabase for top 3 matching strategies
    const { data: strategies, error } = await supabase.rpc("match_strategies", {
      query_embedding: queryEmbedding,
      match_threshold: 0.2, // Adjust threshold as needed
      match_count: 3
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      throw new Error("Failed to search strategies");
    }

    const contextText = strategies.map((s: any, i: number) => `
الاستراتيجية/الطريقة رقم ${i + 1}:
الاسم: ${s.name}
النظرية: ${s.theory}
الخطوات الإجرائية: ${s.procedures}
الأداة التقنية: ${s.tech_tool}
معيار النجاح: ${s.success_criteria}
`).join("\n---\n");

    // 3. System Prompt setup (Zero-Shot RAG)
    const systemPrompt = `أنت "بوصلة"، خبير تصميم تعليمي محترف، مهمتك كتابة خطة درس تطبيقية للمعلم بناءً على المدخلات المقدمة واستراتيجيات التدريس المسترجعة من قاعدة البيانات فقط.

القيود والشروط الهامة:
1. لا تقم بتأليف استراتيجيات غير موجودة في السياق المرفق.
2. التزم بتخصيص الخطة لتناسب المرحلة الدراسية وعدد الطلاب المذكور بدقة.
3. التزم بتصميم الأنشطة والخطوات بالاعتماد فقط على الموارد المتاحة.
4. يجب توليد مخطط Mermaid.js من نوع خريطة ذهنية (mindmap) صحيح برمجياً يوضح العناصر الأساسية والمفاهيم الخاصة بموضوع الدرس. استخدم المسافات البادئة (Indentation) الصحيحة لدعم شجرة الخريطة الذهنية، وادعم النصوص العربية.
5. استخرج وصف دقيق وتفصيلي باللغة الإنجليزية (Prompt) لتوليد صورة ذكاء اصطناعي تعليمية تشرح وتجسد موضوع الدرس بوضوح.

سياق الاستراتيجيات المسترجعة:
${contextText}
`;

    // 4. Generate the lesson plan via streamObject
    const result = streamObject({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      schema: lessonSchema,
      prompt: `المادة: ${subject}\nموضوع الدرس: ${topic}\nالمرحلة الدراسية: ${stage}\nعدد الطلاب: ${studentsCount}\nالموارد المتاحة: ${resources.join(", ") || "لا توجد موارد خاصة"}\n\nرجاءً قم بكتابة خطة الدرس التطبيقية استناداً إلى الشروط والسياق.`,
    });

    return result.toTextStreamResponse();
  } catch (e: any) {
    console.error("Error generating lesson plan:", e);
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}


