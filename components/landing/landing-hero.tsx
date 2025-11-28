"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";
import { AppBackground } from "@/components/common/app-background";
import type { LandingHeroProps } from "@/types/components";

export function LandingHero({}: LandingHeroProps): React.JSX.Element {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <AppBackground />

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
                src="/iskolarblock.svg"
                alt="IskolarBlock Logo"
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
            IskolarBlock
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
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
