import { streamText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 60; // Set higher timeout for LLM

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { subject, topic, stage, studentsCount } = await req.json();

    // 1. Generate embedding for the user's query
    const queryText = `المادة: ${subject} | الموضوع: ${topic} | المرحلة: ${stage} | الطلاب: ${studentsCount}`;
    
    const { embedding: queryEmbedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: queryText,
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
    const systemPrompt = `أنت "بوصلة"، خبير تصميم تعليمي محترف، مهمتك كتابة خطة درس تطبيقية للمعلم بناءً على المدخلات المقدمة واستراتيجيات التدريس المسترجعة من قاعدة البيانات فقط (Zero-Shot RAG).

القيود والشروط:
- لا تقم بتأليف استراتيجيات غير موجودة في السياق المرفق.
- التزم بتخصيص الخطة لتناسب المرحلة الدراسية وعدد الطلاب المذكور بدقة.
- يجب أن تتضمن خطة الدرس العناصر التالية:
  1. تمهيد الدرس (Hook): طريقة جاذبة ومبتكرة لبدء الدرس.
  2. التوزيع الميكانيكي للطلاب: كيف سيجلس الطلاب (مجموعات، ثنائيات، الخ) بناءً على عددهم المذكور والمساحة.
  3. السيناريو التطبيقي خطوة بخطوة: بناءً على "الخطوات الإجرائية" للاستراتيجية الأنسب من ضمن المسترجعة.
  4. الاستراتيجيات البديلة: اذكر الاستراتيجيات الأخرى (المسترجعة أيضاً) كخيارات بديلة باختصار شديد متى يمكن استخدامها.
- اكتب بلغة عربية فصحى وبأسلوب تربوي رصين ومنظم ومقسم بعناوين واضحة.
- استخدم تنسيق Markdown (عناوين، نقاط، خط عريض) ليظهر بشكل جميل على المنصة.

سياق الاستراتيجيات المسترجعة:
${contextText}
`;

    // 4. Generate the lesson plan via stream
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: `المادة: ${subject}\nموضوع الدرس: ${topic}\nالمرحلة الدراسية: ${stage}\nعدد الطلاب: ${studentsCount}\n\nرجاءً قم بكتابة خطة الدرس التطبيقية بناءً على التعليمات والسياق.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (e: any) {
    console.error("Error generating lesson plan:", e);
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
