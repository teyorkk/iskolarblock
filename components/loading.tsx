"use client";

import { motion } from "framer-motion";
import NextImage from "next/image";
import { AppBackground } from "@/components/common/app-background";

export function Loading() {
  const dots = [0, 1, 2];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      <AppBackground />

      <div className="text-center relative z-10">
        {/* Bouncing Logo */}
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
          className="relative z-10 flex justify-center items-center mb-8"
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
              quality={90}
              sizes="96px"
            />
          </motion.div>
        </motion.div>

        {/* Loading Text + bouncing dots */}
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
      </div>
    </div>
  );
}
