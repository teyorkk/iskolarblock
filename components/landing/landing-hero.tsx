"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";
import type { LandingHeroProps } from "@/types/components";

export function LandingHero({}: LandingHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-transparent" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-orange-300 rounded-full opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
              <NextImage
                src="/scholarblock.svg"
                alt="ScholarBlock Logo"
                fill
                className="object-contain"
                priority
                quality={90}
                sizes="80px"
              />
            </div>
            <div className="relative w-24 h-24">
              <NextImage
                src="/sk-logo.png"
                alt="SK Logo"
                fill
                className="object-contain"
                priority
                quality={90}
                sizes="96px"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ScholarBlock
            <span className="block text-lg md:text-2xl font-normal text-gray-600 mt-2">
              Empowering Scholars Through Blockchain Transparency
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            A revolutionary scholarship management system for Barangay San
            Miguel, Hagonoy. Secure, transparent, and efficient - powered by
            blockchain technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6"
              >
                Apply Now
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

