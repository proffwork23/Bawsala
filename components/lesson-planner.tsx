"use client";

import React, { useState, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { 
  Loader2, BookOpen, Users, GraduationCap, FileText, Sparkles, 
  Wrench, ArrowRight, Clock, Image as ImageIcon, ChevronDown, CheckCircle2
} from "lucide-react";
import { Logo } from "@/components/logo";
import { MermaidDiagram } from "@/components/mermaid-diagram";

// Same schema as the backend
const lessonSchema = z.object({
  imageGenerationPrompt: z.string(),
  lessonHook: z.string(),
  classroomManagement: z.string(),
  mermaidDiagramCode: z.string(),
  interactiveSteps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    durationInMinutes: z.number(),
  })),
  alternativeStrategies: z.array(z.string()),
});

const AVAILABLE_RESOURCES = [
  { id: "board", label: "سبورة تقليدية" },
  { id: "smart_screen", label: "شاشة ذكية / تفاعلية" },
  { id: "computers", label: "أجهزة حاسوب / لابتوب للطلاب" },
  { id: "mobiles", label: "هواتف ذكية / موبايلات للطلاب" },
  { id: "internet", label: "اتصال إنترنت" },
  { id: "worksheets", label: "أوراق عمل مطبوعة" },
  { id: "physical_models", label: "مجسمات ووسائل ملموسة" },
  { id: "projector", label: "جهاز عرض (Projector)" },
  { id: "lab", label: "مختبر / معمل مدرسي" }
];

export function LessonPlannerClient() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [stage, setStage] = useState("الابتدائية");
  const [studentsCount, setStudentsCount] = useState("20");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [view, setView] = useState<"form" | "dashboard">("form");
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false);

  const { object, submit, isLoading, stop } = useObject({
    api: "/api/generate-lesson",
    schema: lessonSchema,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch cover image once the keyword is available
  useEffect(() => {
    if (object?.imageGenerationPrompt && !coverImageUrl) {
      // Use Pollinations AI to generate the image on the fly
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(object.imageGenerationPrompt)}?width=1280&height=720&nologo=true`;
      setCoverImageUrl(url);
    }
  }, [object?.imageGenerationPrompt, coverImageUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic || !studentsCount) return;

    setView("dashboard");
    setCoverImageUrl(null);
    setIsAlternativesOpen(false);

    submit({
      subject,
      topic,
      stage,
      studentsCount: parseInt(studentsCount, 10),
      resources: selectedResources,
    });
  };

  const handleBack = () => {
    if (isLoading) stop();
    setView("form");
  };

  if (view === "dashboard") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
        {/* Header Section */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-machine-cobalt dark:text-machine-ink text-sm font-semibold">
              <Logo className="w-5 h-5" />
              <span>لوحة تحكم خطة الدرس الذكية - بوصلة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-soul-fg dark:text-white">
              {topic}
            </h1>
            <p className="text-sm text-soul-fg/70 dark:text-white/70">
              المادة: <span className="font-semibold">{subject}</span> | 
              المرحلة: <span className="font-semibold">{stage}</span> | 
              الطلاب: <span className="font-semibold">{studentsCount}</span>
            </p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-soul-fg dark:text-white px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            الرجوع للتعديل
          </button>
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-machine-azure/10 text-machine-cobalt dark:text-machine-ink rounded-xl border border-machine-azure/20 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-semibold text-sm">جاري التفكير وصياغة الخطة... (الوقت المنقضي: {elapsedTime}ث)</span>
          </div>
        )}

        {/* Hero Image */}
        {(coverImageUrl || isLoading) && (
          <section className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10 shadow-sm">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover animate-in fade-in duration-700" />
            ) : (
              <div className="flex flex-col items-center text-soul-fg/40 dark:text-white/40">
                <ImageIcon className="w-10 h-10 mb-2 animate-pulse" />
                <span className="text-sm">جاري البحث عن صورة تناسب الدرس...</span>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h2 className="text-white text-2xl font-bold drop-shadow-md">الخطة التطبيقية للدرس</h2>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overview Cards */}
          <section className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-soul-fg dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" /> تمهيد الدرس
            </h3>
            <p className="text-sm text-soul-fg/80 dark:text-white/80 leading-relaxed min-h-[60px]">
              {object?.lessonHook || (isLoading ? <span className="animate-pulse">جاري الكتابة...</span> : "لم يتم توليد تمهيد.")}
            </p>
          </section>

          <section className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-soul-fg dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
              <Users className="w-5 h-5 text-machine-azure" /> إدارة الفصل والتوزيع
            </h3>
            <p className="text-sm text-soul-fg/80 dark:text-white/80 leading-relaxed min-h-[60px]">
              {object?.classroomManagement || (isLoading ? <span className="animate-pulse">جاري الكتابة...</span> : "لم يتم توليد خطة توزيع.")}
            </p>
          </section>
        </div>

        {/* Visual Flow (Mermaid) */}
        <section className="glass-panel rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-soul-fg dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            التدفق البصري للدرس
          </h3>
          {object?.mermaidDiagramCode ? (
            <MermaidDiagram chart={object.mermaidDiagramCode} />
          ) : (
             <div className="h-40 flex items-center justify-center text-sm text-soul-fg/40 dark:text-white/40">
               {isLoading ? "جاري رسم المخطط البياني..." : "لم يتم توليد المخطط."}
             </div>
          )}
        </section>

        {/* Execution Steps */}
        <section className="glass-panel rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-soul-fg dark:text-white flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> خطوات التنفيذ (السيناريو)
          </h3>
          <div className="space-y-4">
            {object?.interactiveSteps?.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-machine-cobalt text-white flex items-center justify-center font-bold shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="text-xs font-semibold text-machine-cobalt dark:text-machine-ink flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {step?.durationInMinutes || "?"} د
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-bold text-soul-fg dark:text-white text-base">{step?.title || "..."}</h4>
                  <p className="text-sm text-soul-fg/80 dark:text-white/80 leading-relaxed">
                    {step?.description || "..."}
                  </p>
                </div>
              </div>
            ))}
            {(!object?.interactiveSteps || object.interactiveSteps.length === 0) && (
              <div className="text-center py-6 text-sm text-soul-fg/50 dark:text-white/50">
                {isLoading ? "جاري كتابة الخطوات..." : "لا توجد خطوات."}
              </div>
            )}
          </div>
        </section>

        {/* Alternatives Accordion */}
        <section className="glass-panel rounded-3xl overflow-hidden border border-black/5 dark:border-white/5">
          <button 
            onClick={() => setIsAlternativesOpen(!isAlternativesOpen)}
            className="w-full flex items-center justify-between p-6 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-right"
          >
            <h3 className="text-lg font-bold text-soul-fg dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-slate-500" /> الاستراتيجيات البديلة
            </h3>
            <ChevronDown className={`w-5 h-5 text-soul-fg/50 transition-transform duration-300 ${isAlternativesOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${isAlternativesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="p-6 pt-0 space-y-3">
              {object?.alternativeStrategies?.map((alt, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <p className="text-sm text-soul-fg/80 dark:text-white/80">{alt}</p>
                </div>
              ))}
              {(!object?.alternativeStrategies || object.alternativeStrategies.length === 0) && (
                <p className="text-sm text-soul-fg/50 dark:text-white/50">لا توجد بدائل متاحة.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-8" dir="rtl">
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-extrabold text-soul-fg dark:text-white">
            درس جديد
          </h1>
          <p className="text-soul-fg/80 dark:text-white/80 text-sm sm:text-base">
            أدخل معطيات درسك وسيقوم النظام ببناء خطة تفصيلية بالاعتماد على أفضل استراتيجيات التدريس.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-soul-fg/90 dark:text-white/90">
              <BookOpen className="w-4 h-4 text-machine-azure" /> المادة العلمية
            </label>
            <input
              required
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: العلوم، الرياضيات، اللغة العربية"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-soul-fg/90 dark:text-white/90">
              <FileText className="w-4 h-4 text-machine-azure" /> موضوع الدرس
            </label>
            <input
              required
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: دورة حياة النبات، الفاعل والمفعول"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-soul-fg/90 dark:text-white/90">
              <GraduationCap className="w-4 h-4 text-machine-azure" /> المرحلة الدراسية
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all text-right cursor-pointer"
            >
              <option value="رياض أطفال">رياض أطفال</option>
              <option value="الابتدائية">الابتدائية</option>
              <option value="المتوسطة/الإعدادية">المتوسطة / الإعدادية</option>
              <option value="الثانوية">الثانوية</option>
              <option value="الجامعية">الجامعية</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-soul-fg/90 dark:text-white/90">
              <Users className="w-4 h-4 text-machine-azure" /> عدد الطلاب المتوقع
            </label>
            <input
              required
              type="number"
              min="1"
              max="100"
              value={studentsCount}
              onChange={(e) => setStudentsCount(e.target.value)}
              placeholder="مثال: 20"
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all text-right"
            />
          </div>

          {/* Available Resources Custom Multi-select */}
          <div className="sm:col-span-2 space-y-2 relative">
            <label className="text-sm font-semibold flex items-center gap-2 text-soul-fg/90 dark:text-white/90">
              <Wrench className="w-4 h-4 text-machine-azure" /> الموارد المتاحة في الفصل
            </label>
            <button
              type="button"
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-right flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-machine-azure transition-all cursor-pointer"
            >
              <span className="truncate text-sm sm:text-base">
                {selectedResources.length === 0
                  ? "اختر الموارد المتاحة من القائمة..."
                  : `${selectedResources.length} مورد/موارد محددة`}
              </span>
              <span className="text-xs text-soul-fg/60 dark:text-white/60">▼</span>
            </button>

            {isResourcesOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsResourcesOpen(false)}
                />
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-4 max-h-64 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedResources(AVAILABLE_RESOURCES.map(r => r.label))}
                      className="text-xs text-machine-cobalt dark:text-machine-ink hover:underline cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedResources([])}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {AVAILABLE_RESOURCES.map((resource) => {
                      const isChecked = selectedResources.includes(resource.label);
                      return (
                        <label
                          key={resource.id}
                          className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedResources(selectedResources.filter(r => r !== resource.label));
                              } else {
                                setSelectedResources([...selectedResources, resource.label]);
                              }
                            }}
                            className="rounded border-gray-300 text-machine-cobalt focus:ring-machine-azure"
                          />
                          <span className="text-sm text-soul-fg dark:text-white">{resource.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Visual Pills for Selected Resources */}
            {selectedResources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 animate-in fade-in duration-300">
                {selectedResources.map((res) => (
                  <span
                    key={res}
                    className="inline-flex items-center gap-1 bg-machine-cobalt/10 text-machine-cobalt dark:bg-machine-azure/10 dark:text-machine-ink text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-machine-cobalt/20 dark:border-machine-azure/20"
                  >
                    {res}
                    <button
                      type="button"
                      onClick={() => setSelectedResources(selectedResources.filter(r => r !== res))}
                      className="hover:text-red-500 font-bold mr-1 cursor-pointer text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-machine-cobalt hover:bg-machine-azure text-white font-bold rounded-xl px-6 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-machine-azure/20 cursor-pointer"
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
    </div>
  );
}
