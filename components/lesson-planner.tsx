"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { 
  Loader2, BookOpen, Users, GraduationCap, FileText, Sparkles, 
  Wrench, ArrowRight, CheckCircle2, Clock 
} from "lucide-react";

// List of available classroom resources
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

const TABS = [
  { id: "hook", label: "تمهيد الدرس", emoji: "" },
  { id: "seating", label: "التوزيع الميكانيكي", emoji: "" },
  { id: "scenario", label: "السيناريو التطبيقي", emoji: "" },
  { id: "alternatives", label: "الاستراتيجيات البديلة", emoji: "" }
];

interface Section {
  id: string;
  title: string;
  emoji: string;
  content: string;
}

// Markdown parser to JSX for custom RTL display
function MarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  let inList = false;
  const listItems: string[] = [];
  const elements: React.JSX.Element[] = [];

  const renderTextWithFormatting = (txt: string, key: string) => {
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={key}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-bold text-machine-cobalt dark:text-machine-ink">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const flushList = (keyPrefix: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="list-disc list-inside space-y-2 my-3 text-soul-fg/90 dark:text-white/90">
          {listItems.map((item, idx) => (
            <li key={idx} className="mr-4 text-right">
              {renderTextWithFormatting(item, `li-item-${idx}`)}
            </li>
          ))}
        </ul>
      );
      listItems.length = 0;
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check if bullet point
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(trimmed.substring(2));
      return;
    }
    
    // Check if numbered list item
    if (trimmed.match(/^\d+\.\s/)) {
      inList = true;
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      return;
    }

    // Flush list if line is empty or is not a list item
    if (trimmed === "" || (!trimmed.startsWith("- ") && !trimmed.startsWith("* ") && !trimmed.match(/^\d+\.\s/))) {
      flushList(index);
    }

    if (trimmed === "") {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Headers
    if (trimmed.startsWith("###")) {
      elements.push(
        <h4 key={index} className="text-lg font-bold mt-4 mb-2 text-soul-fg dark:text-white">
          {renderTextWithFormatting(trimmed.substring(3).trim(), `h4-${index}`)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("##")) {
      elements.push(
        <h3 key={index} className="text-xl font-bold mt-5 mb-3 text-soul-fg dark:text-white border-b border-black/10 dark:border-white/10 pb-1">
          {renderTextWithFormatting(trimmed.substring(2).trim(), `h3-${index}`)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("#")) {
      elements.push(
        <h2 key={index} className="text-2xl font-extrabold mt-6 mb-4 text-soul-fg dark:text-white">
          {renderTextWithFormatting(trimmed.substring(1).trim(), `h2-${index}`)}
        </h2>
      );
      return;
    }

    // Plain paragraph
    elements.push(
      <p key={index} className="leading-relaxed my-2 text-soul-fg/90 dark:text-white/90">
        {renderTextWithFormatting(trimmed, `p-${index}`)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="space-y-1 text-right" dir="rtl">{elements}</div>;
}

// Helper to extract sections from streamed text
function parseStreamedContent(text: string): Section[] {
  const sections = [
    { id: "hook", title: "تمهيد الدرس (Hook)", emoji: "", content: "" },
    { id: "seating", title: "التوزيع الميكانيكي للطلاب", emoji: "", content: "" },
    { id: "scenario", title: "السيناريو التطبيقي خطوة بخطوة", emoji: "", content: "" },
    { id: "alternatives", title: "الاستراتيجيات البديلة", emoji: "", content: "" }
  ];

  if (!text) return sections;

  const hookIndex = text.indexOf("### تمهيد الدرس");
  const seatingIndex = text.indexOf("### التوزيع الميكانيكي");
  const scenarioIndex = text.indexOf("### السيناريو التطبيقي");
  const alternativesIndex = text.indexOf("### الاستراتيجيات البديلة");

  const getSlice = (start: number, end: number) => {
    if (start === -1) return "";
    const nextLineBreak = text.indexOf("\n", start);
    const actualStart = nextLineBreak !== -1 ? nextLineBreak + 1 : start + 6;
    if (end === -1) return text.substring(actualStart);
    return text.substring(actualStart, end);
  };

  const hookEnd = [seatingIndex, scenarioIndex, alternativesIndex]
    .filter((idx) => idx !== -1)
    .reduce((min, idx) => Math.min(min, idx), text.length);
  sections[0].content = hookIndex !== -1 ? getSlice(hookIndex, hookEnd).trim() : "";

  const seatingEnd = [scenarioIndex, alternativesIndex]
    .filter((idx) => idx !== -1 && idx > seatingIndex)
    .reduce((min, idx) => Math.min(min, idx), text.length);
  sections[1].content = seatingIndex !== -1 ? getSlice(seatingIndex, seatingEnd).trim() : "";

  const scenarioEnd = [alternativesIndex]
    .filter((idx) => idx !== -1 && idx > scenarioIndex)
    .reduce((min, idx) => Math.min(min, idx), text.length);
  sections[2].content = scenarioIndex !== -1 ? getSlice(scenarioIndex, scenarioEnd).trim() : "";

  sections[3].content = alternativesIndex !== -1 ? getSlice(alternativesIndex, -1).trim() : "";

  // Fallback: If no markers are present yet, output everything in Hook
  if (hookIndex === -1 && seatingIndex === -1 && scenarioIndex === -1 && alternativesIndex === -1) {
    sections[0].content = text.trim();
  }

  return sections;
}

export function LessonPlannerClient() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [stage, setStage] = useState("الابتدائية");
  const [studentsCount, setStudentsCount] = useState("20");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [view, setView] = useState<"form" | "dashboard">("form");
  const [activeTab, setActiveTab] = useState<"hook" | "seating" | "scenario" | "alternatives">("hook");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/generate-lesson",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic || !studentsCount) return;

    setView("dashboard");
    setActiveTab("hook");

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
          resources: selectedResources,
        },
      }
    );
  };

  const handleBack = () => {
    if (isLoading) {
      stop();
    }
    setView("form");
  };

  const lastMessage = messages[messages.length - 1];
  const lastMessageText = lastMessage && lastMessage.role === "assistant"
    ? lastMessage.parts
      ? lastMessage.parts.map((part) => (part.type === "text" ? part.text : "")).join("")
      : ""
    : "";

  const parsedSections = parseStreamedContent(lastMessageText);

  // Auto-advance tabs as sections start streaming
  let activeStreamingIndex = -1;
  if (isLoading) {
    for (let i = parsedSections.length - 1; i >= 0; i--) {
      if (parsedSections[i].content.length > 0) {
        activeStreamingIndex = i;
        break;
      }
    }
    if (activeStreamingIndex === -1 && lastMessageText.length > 0) {
      activeStreamingIndex = 0;
    }
  }

  const lastStreamingIndexRef = useRef(-1);
  useEffect(() => {
    if (activeStreamingIndex !== -1 && activeStreamingIndex !== lastStreamingIndexRef.current) {
      lastStreamingIndexRef.current = activeStreamingIndex;
      const ids = ["hook", "seating", "scenario", "alternatives"];
      setActiveTab(ids[activeStreamingIndex] as any);
    }
  }, [activeStreamingIndex]);

  const getSectionStatus = (index: number) => {
    const section = parsedSections[index];
    const hasContent = section && section.content.length > 0;
    
    if (isLoading) {
      if (activeStreamingIndex === index) {
        return "streaming";
      }
      if (hasContent) {
        return "done";
      }
      return "waiting";
    } else {
      if (hasContent) {
        return "done";
      }
      return "empty";
    }
  };

  const currentSection = parsedSections.find((s) => s.id === activeTab) || parsedSections[0];

  if (view === "dashboard") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
        {/* Top Header Panel */}
        <section className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-2 text-machine-cobalt dark:text-machine-ink text-sm font-semibold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>لوحة تحكم خطة الدرس الذكية - بوصلة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-soul-fg dark:text-white">
              {topic}
            </h1>
            <p className="text-sm text-soul-fg/70 dark:text-white/70">
              المادة: <span className="font-semibold text-soul-fg dark:text-white">{subject}</span>
              {" | "}
              المرحلة: <span className="font-semibold text-soul-fg dark:text-white">{stage}</span>
              {" | "}
              الطلاب: <span className="font-semibold text-soul-fg dark:text-white">{studentsCount}</span>
            </p>
          </div>
          
          <button
            onClick={handleBack}
            className="flex items-center gap-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-soul-fg dark:text-white px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            الرجوع وتعديل البيانات
          </button>
        </section>

        {/* Selected Resources Summary */}
        {selectedResources.length > 0 && (
          <section className="glass-panel rounded-2xl p-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-soul-fg/60 dark:text-white/60 ml-2">الموارد المعتمدة:</span>
            {selectedResources.map((res) => (
              <span
                key={res}
                className="bg-machine-cobalt/10 text-machine-cobalt dark:bg-machine-azure/10 dark:text-machine-ink text-xs px-2.5 py-1 rounded-lg font-semibold"
              >
                {res}
              </span>
            ))}
          </section>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-2 md:pb-0">
            {TABS.map((tab, idx) => {
              const status = getSectionStatus(idx);
              const isActive = activeTab === tab.id;
              const isDisabled = status === "waiting" || status === "empty";
              
              let statusIcon = null;
              if (status === "streaming") {
                statusIcon = <Loader2 className="w-4 h-4 animate-spin text-machine-azure" />;
              } else if (status === "done") {
                statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
              } else if (status === "waiting") {
                statusIcon = <Clock className="w-4 h-4 text-soul-fg/40 dark:text-white/40 shrink-0" />;
              }

              return (
                <button
                  key={tab.id}
                  disabled={isDisabled}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 md:flex-initial flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border text-right transition-all font-semibold text-sm whitespace-nowrap md:whitespace-normal
                    ${isActive 
                      ? "bg-machine-cobalt/10 border-machine-cobalt text-machine-cobalt dark:bg-machine-azure/10 dark:border-machine-azure dark:text-machine-ink shadow-md" 
                      : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-soul-fg/80 dark:text-white/80"
                    }
                    ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </div>
                  {statusIcon}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="md:col-span-3">
            <section className="glass-panel rounded-3xl p-6 sm:p-8 min-h-[350px] flex flex-col justify-between">
              <div>
                {/* Tab Header inside content */}
                <div className="border-b border-black/10 dark:border-white/10 pb-4 mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-heading font-extrabold flex items-center gap-2 text-soul-fg dark:text-white">
                    <span className="text-2xl">{currentSection.emoji}</span>
                    {currentSection.title}
                  </h2>
                  
                  {isLoading && getSectionStatus(TABS.findIndex(t => t.id === activeTab)) === "streaming" && (
                    <span className="flex items-center gap-1.5 text-xs text-machine-cobalt dark:text-machine-ink font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-machine-cobalt dark:bg-machine-azure" />
                      جاري صياغة النص...
                    </span>
                  )}
                </div>

                {/* Main Text Content */}
                {currentSection.content ? (
                  <div className="animate-in fade-in duration-300">
                    <MarkdownRenderer text={currentSection.content} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-machine-azure" />
                    <p className="text-sm text-soul-fg/60 dark:text-white/60">
                      في انتظار صياغة هذا القسم بواسطة النظام...
                    </p>
                  </div>
                )}
              </div>
              
              {/* Progress Bar Footer for Dashboard */}
              {isLoading && (
                <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-soul-fg/50 dark:text-white/50">
                  <span>بوصلة تفاعلية - يتم التوليد الآن بواسطة النظام</span>
                  <div className="flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-machine-azure" />
                    <span className="w-1.5 h-1.5 rounded-full bg-machine-azure delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-machine-azure delay-150" />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 space-y-8" dir="rtl">
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-heading font-extrabold flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-machine-azure" />
            بوصلة المعلم
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
