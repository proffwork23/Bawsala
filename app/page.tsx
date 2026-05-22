import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Lightbulb } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 lg:py-40 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-machine-cobalt/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-machine-azure/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-8 flex flex-col items-center">
          <div className="mb-4">
            <Logo className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>
          

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-extrabold text-soul-fg dark:text-white leading-tight">
            وجهتك الذكية نحو <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-machine-cobalt to-machine-azure">
              تعليم استثنائي
            </span>
          </h1>

          <p className="text-lg md:text-xl text-soul-fg/70 dark:text-white/70 max-w-2xl leading-relaxed font-medium">
            منصة "بوصلة" تساعدك كمعلم على تصميم خطط دروس مبتكرة وتفاعلية في ثوانٍ، بناءً على أفضل استراتيجيات التدريس الحديثة وبما يتناسب مع موارد فصلك.
          </p>

          <div className="pt-8">
            <Link
              href="/planner"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-machine-cobalt hover:bg-machine-azure text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-machine-azure/25 hover:shadow-machine-azure/40 hover:-translate-y-1"
            >
              ابدأ التخطيط الآن
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-soul-fg dark:text-white">لماذا بوصلة؟</h2>
            <p className="text-soul-fg/60 dark:text-white/60 max-w-xl mx-auto">صُممت المنصة خصيصاً لتوفير وقتك وجهدك، والتركيز على ما يهم حقاً: إلهام طلابك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-machine-cobalt/10 text-machine-cobalt flex items-center justify-center mb-6">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-soul-fg dark:text-white">استراتيجيات دقيقة</h3>
              <p className="text-soul-fg/70 dark:text-white/70 leading-relaxed">
                توجيه ذكي لأفضل الاستراتيجيات التربوية التي تتناسب مع موضوع الدرس والمرحلة العمرية.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-soul-fg dark:text-white">أفكار إبداعية</h3>
              <p className="text-soul-fg/70 dark:text-white/70 leading-relaxed">
                اقتراح طرق مبتكرة للتمهيد للدرس وجذب انتباه الطلاب من اللحظة الأولى.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-soul-fg dark:text-white">تكيف مع الموارد</h3>
              <p className="text-soul-fg/70 dark:text-white/70 leading-relaxed">
                تصميم الخطة لتلائم الأدوات والتقنيات المتاحة فعلياً في فصلك دون افتراضات خيالية.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
