"use client";

import React from "react";
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

      {/* SVG Line Art - Minimalist Compass Symbol */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-md"
      >
        {/* Minimalist Compass Dial Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="22"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeDasharray="2 4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />

        {/* --- 3D BEVELLED 4-POINT COMPASS STAR --- */}
        <g>
          {/* North Pointer */}
          {/* Left Facet (Light Cyan) */}
          <motion.polygon
            points="50,20 44,50 50,50"
            fill="#38bdf8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
          />
          {/* Right Facet (Sky Blue) */}
          <motion.polygon
            points="50,20 56,50 50,50"
            fill="#0ea5e9"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
          />

          {/* South Pointer */}
          {/* Left Facet (Light Cyan) */}
          <motion.polygon
            points="50,80 44,50 50,50"
            fill="#38bdf8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.35 }}
          />
          {/* Right Facet (Sky Blue) */}
          <motion.polygon
            points="50,80 56,50 50,50"
            fill="#0ea5e9"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.35 }}
          />

          {/* West Pointer */}
          {/* Top Facet (Light Cyan) */}
          <motion.polygon
            points="20,50 50,44 50,50"
            fill="#38bdf8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.4 }}
          />
          {/* Bottom Facet (Sky Blue) */}
          <motion.polygon
            points="20,50 50,56 50,50"
            fill="#0ea5e9"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.4 }}
          />

          {/* East Pointer */}
          {/* Top Facet (Light Cyan) */}
          <motion.polygon
            points="80,50 50,44 50,50"
            fill="#38bdf8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.4 }}
          />
          {/* Bottom Facet (Sky Blue) */}
          <motion.polygon
            points="80,50 50,56 50,50"
            fill="#0ea5e9"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.4 }}
          />
        </g>

        {/* --- CENTRAL GLOWING CORE (Prominent Amber/Yellow) --- */}
        {/* Outer Glow Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="7"
          fill="#fbbf24"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        />

        {/* Inner Solid Gold/Amber Circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="3"
          fill="#fbbf24"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        />
      </svg>
    </div>
  );
}
