import { LessonPlannerClient } from "@/components/lesson-planner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "مخطط الدروس الذكي - بوصلة",
  description: "ابنِ خطط دروس متكاملة وتفاعلية باستخدام منصة بوصلة.",
};

export default function PlannerPage() {
  return (
    <div className="relative min-h-screen pb-20 pt-10">
      <LessonPlannerClient />
    </div>
  );
}
