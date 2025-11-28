"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppBackgroundProps {
  className?: string;
}

export function AppBackground({
  className,
}: AppBackgroundProps): React.JSX.Element {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-orange-50/60 to-white/20" />

      <motion.div
        className="absolute top-8 left-4 w-44 h-44 bg-orange-200 rounded-full opacity-40 blur-lg"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/3 right-12 w-36 h-36 bg-amber-300 rounded-full opacity-35 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 15, -10, 0],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-12 right-6 w-56 h-56 bg-orange-400 rounded-full opacity-25 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/4 w-28 h-28 bg-orange-100 rounded-full opacity-30 blur-lg"
        animate={{
          y: [-15, 15, -15],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}


