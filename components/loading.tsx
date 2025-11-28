"use client";

import { motion } from "framer-motion";
import NextImage from "next/image";
import { AppBackground } from "@/components/common/app-background";

export function Loading() {
  // Animated dots for loading text
  const dots = [0, 1, 2];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <AppBackground />

      <div className="text-center relative z-10">
        {/* Rotating rings around logo */}
        <div className="relative flex justify-center items-center mb-8">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute border-4 border-orange-300/50 rounded-full"
            style={{ width: 180, height: 180 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Middle pulsing ring */}
          <motion.div
            className="absolute border-3 border-orange-400/40 rounded-full"
            style={{ width: 140, height: 140 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Inner rotating ring (reverse) */}
          <motion.div
            className="absolute border-2 border-amber-300/60 rounded-full"
            style={{ width: 100, height: 100 }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Main Logo with multiple animations */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10"
          >
            <motion.div
              className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl"
              animate={{
                boxShadow: [
                  "0 20px 40px rgba(251, 146, 60, 0.3)",
                  "0 25px 50px rgba(251, 146, 60, 0.5)",
                  "0 20px 40px rgba(251, 146, 60, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <NextImage
                src="/iskolarblock.svg"
                alt="IskolarBlock Logo"
                fill
                className="object-contain rounded-3xl p-2"
                priority
                quality={90}
                sizes="96px"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Loading Text with animated dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.h2
            className="text-gray-800 text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading IskolarBlock
          </motion.h2>

          {/* Animated dots */}
          <div className="flex gap-1 ml-2">
            {dots.map((dot) => (
              <motion.span
                key={dot}
                className="w-2 h-2 rounded-full bg-orange-500"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: dot * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
