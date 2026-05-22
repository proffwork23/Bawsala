"use client";

import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, BookOpen, Users, GraduationCap, FileText, Sparkles } from "lucide-react";

export function LessonPlannerClient() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [stage, setStage] = useState("الابتدائية");
  const [studentsCount, setStudentsCount] = useState("20");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/generate-lesson",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic || !studentsCount) return;

    sendMessage(
      {
        text: `توليد خطة درس: ${subject} - ${topic}`,
      },
      {
        body: {
          subject,
          topic,
          stage,
          studentsCount: parseInt(studentsCount, 10),
        },
      }
    );
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-8">
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-extrabold flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-machine-azure" />
            بوصلة المعلم
          </h1>
          <p className="text-soul-fg/80 dark:text-white/80">
            أدخل معطيات درسك وسيقوم الذكاء الاصطناعي ببناء خطة تفصيلية بالاعتماد على أفضل استراتيجيات التدريس.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> المادة العلمية
            </label>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: العلوم، الرياضيات، اللغة العربية"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" /> موضوع الدرس
            </label>
            <input
              required
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: دورة حياة النبات، الفاعل والمفعول"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> المرحلة الدراسية
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all"
            >
              <option value="رياض أطفال">رياض أطفال</option>
              <option value="الابتدائية">الابتدائية</option>
              <option value="المتوسطة/الإعدادية">المتوسطة / الإعدادية</option>
              <option value="الثانوية">الثانوية</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" /> عدد الطلاب المتوقع
            </label>
            <input
              required
              type="number"
              min="1"
              max="100"
              value={studentsCount}
              onChange={(e) => setStudentsCount(e.target.value)}
              placeholder="مثال: 20"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all"
            />
          </div>

          <div className="sm:col-span-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-machine-cobalt hover:bg-machine-azure text-white font-bold rounded-xl px-6 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-machine-azure/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> جاري التوليد...
                </>
              ) : (
                "توليد خطة الدرس"
              )}
            </button>
          </div>
        </form>
      </section>

      {lastMessage && lastMessage.role === "assistant" && (
        <section className="glass-panel rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="prose prose-slate dark:prose-invert max-w-none font-sans whitespace-pre-wrap leading-relaxed">
            {lastMessage.parts
              ?.map((part) => (part.type === "text" ? part.text : ""))
              ?.join("")}
          </div>
        </section>
      )}
    </div>
  );
}
