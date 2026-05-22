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
    const systemPrompt = `أنت "بوصلة"، خبير تصميم تعليمي محترف، مهمتك كتابة خطة درس تطبيقية للمعلم بناءً على المدخلات المقدمة واستراتيجيات التدريس المسترجعة من قاعدة البيانات فقط (Zero-Shot RAG).

القيود والشروط الهامة:
1. لا تقم بتأليف استراتيجيات غير موجودة في السياق المرفق.
2. التزم بتخصيص الخطة لتناسب المرحلة الدراسية وعدد الطلاب المذكور بدقة.
3. التزم بتصميم وتخطيط جميع الأنشطة والخطوات بالاعتماد فقط وحصرياً على الموارد المتاحة المحددة في الفصل وهي: (${resources.join(", ") || "لا توجد موارد خاصة"}). لا تفترض وجود أي أجهزة، أدوات، أوراق عمل، أو تقنيات أخرى غير مذكورة في هذه القائمة.
4. يجب كتابة خطة الدرس وتقسيمها باستخدام هذه العناوين الفرعية الأربعة بالضبط، ولا تكتب أي نص أو مقدمات أو خاتمة خارج هذه الأقسام الأربعة:
   ### 🎯 تمهيد الدرس (Hook)
   اكتب هنا طريقة جاذبة ومبتكرة لبدء الدرس باستخدام الموارد المتاحة.
   
   ### 👥 التوزيع الميكانيكي للطلاب
   اكتب هنا كيفية تقسيم وجلوس الطلاب (مجموعات، ثنائيات، إلخ) بناءً على عددهم والمساحة والموارد المحددة.
   
   ### 📋 السيناريو التطبيقي خطوة بخطوة
   اكتب هنا خطوات تنفيذ الدرس بالتفصيل بناءً على "الخطوات الإجرائية" للاستراتيجية الأنسب من السياق، مع الدمج الدقيق للموارد المتاحة في الخطوات.
   
   ### 🔄 الاستراتيجيات البديلة
   اكتب هنا الاستراتيجيات الأخرى (المسترجعة أيضاً) كخيارات بديلة باختصار شديد ومتى يمكن للمعلم استخدامها.

- اكتب بلغة عربية فصحى وبأسلوب تربوي رصين ومنظم ومقسم بعناوين واضحة.
- استخدم تنسيق Markdown (عناوين، نقاط، خط عريض) ليظهر بشكل جميل على المنصة.

سياق الاستراتيجيات المسترجعة:
${contextText}
`;

    // 4. Generate the lesson plan via stream
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: `المادة: ${subject}\nموضوع الدرس: ${topic}\nالمرحلة الدراسية: ${stage}\nعدد الطلاب: ${studentsCount}\nالموارد المتاحة: ${resources.join(", ") || "لا توجد موارد خاصة"}\n\nرجاءً قم بكتابة خطة الدرس التطبيقية بناءً على التعليمات والسياق.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (e: any) {
    console.error("Error generating lesson plan:", e);
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
