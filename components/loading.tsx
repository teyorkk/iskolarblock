"use client";

import { motion } from "framer-motion";
import NextImage from "next/image";

export function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="text-center">
        {/* Bouncing Logo */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex justify-center mb-4"
        >
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
            <NextImage
              src="/scholarblock.svg"
              alt="ScholarBlock Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-2xl font-medium"
        >
          Loading SCholarBlock Please wait...
        </motion.p>
      </div>
    </div>
  );
}
