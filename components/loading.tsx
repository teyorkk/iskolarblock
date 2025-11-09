"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

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
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 font-medium"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}
