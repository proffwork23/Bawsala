import { streamObject, embed } from "ai";
import { createGroq } from '@ai-sdk/groq';
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

// Strict JSON Schema for the LLM output
const lessonSchema = z.object({
  coverImageKeyword: z.string().describe("1 or 2 literal English words for image search"),
  lessonHook: z.string().describe("A short, engaging opening to grab students' attention"),
  classroomManagement: z.string().describe("Specific instructions on how to group students based on the provided 'studentsCount'"),
  mermaidDiagramCode: z.string().describe("Valid Mermaid.js flowchart code starting with graph TD;"),
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

    const SYSTEM_PROMPT = `أنت خبير تربوي متقدم في تصميم خطط الدروس التفاعلية بناءً على استراتيجيات التدريس الحديثة.

تعليمات صارمة (STRICT RULES):
1. لا تقم بتأليف استراتيجيات غير موجودة في السياق المرفق.
2. التزم بتخصيص الخطة لتناسب المرحلة الدراسية وعدد الطلاب المذكور بدقة.
3. التزم بتصميم الأنشطة والخطوات بالاعتماد فقط على الموارد المتاحة.

4. قواعد صارمة لمخطط mermaidDiagramCode:
   - You MUST generate a valid Mermaid.js flowchart.
   - Use a top-down flowchart starting with: graph TD;
   - CRITICAL SYNTAX RULE: Do NOT use parentheses (), brackets [], braces {}, or quotes "" inside the node text. These will crash the Mermaid parser.
   - Keep node text very brief.
   - Valid Format Example:
     graph TD;
     A[بداية الدرس] --> B[تقسيم المجموعات];
     B --> C[العمل الجماعي];
     C --> D[التقييم];

5. قواعد صارمة للكلمة المفتاحية coverImageKeyword:
   - You MUST output exactly 1 or 2 English words.
   - The words MUST be literal, physical, and directly represent the academic topic. 
   - ABSOLUTELY NO metaphors, animals, or abstract concepts. 
   - Example: If the topic is "Programming", use "Computer" or "Keyboard". DO NOT use "Lion" or "Brain".

سياق الاستراتيجيات المسترجعة:
${contextText}
`;

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // 4. Generate the lesson plan via streamObject
    const result = streamObject({
      model: groq('llama3-70b-8192'),
      system: SYSTEM_PROMPT,
      schema: lessonSchema,
      prompt: `المادة: ${subject}\nموضوع الدرس: ${topic}\nالمرحلة الدراسية: ${stage}\nعدد الطلاب: ${studentsCount}\nالموارد المتاحة: ${resources.join(", ") || "لا توجد موارد خاصة"}\n\nرجاءً قم بكتابة خطة الدرس التطبيقية استناداً إلى الشروط والسياق.`,
    });

    return result.toTextStreamResponse();
  } catch (e: any) {
    console.error("Error generating lesson plan:", e);
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}


