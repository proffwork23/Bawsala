"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Injecting CSS animation inline for bullet-proof hydration-free progress bar */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes progressFill {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-progress-fill {
              animation: progressFill 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              animation-delay: 0.5s;
            }
          `}} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Logo className="w-32 h-32 mb-6" />
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-heading font-extrabold text-soul-fg dark:text-white"
            >
              بوصلة
            </motion.h1>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-3 text-soul-fg/70 dark:text-white/70 font-semibold tracking-wide"
            >
              مخطط الدروس الذكي
            </motion.p>

            {/* Progress Bar with visible Track and CSS Animation */}
            <div className="h-1 bg-black/10 dark:bg-white/10 mt-8 rounded-full w-48 overflow-hidden">
              <div 
                className="h-full bg-machine-cobalt dark:bg-machine-azure rounded-full animate-progress-fill" 
                style={{ width: "0%" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
