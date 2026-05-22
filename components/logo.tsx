"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Animated Ambient Glow (Light Blue) */}
      <motion.div
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[#38bdf8]/20 blur-[20px] rounded-full"
      />

      <Image
        src="/logo-transparent.png"
        alt="Bawsala Logo"
        width={100}
        height={100}
        className="relative z-10 w-full h-full object-contain drop-shadow-md"
        priority
      />
    </div>
  );
}
