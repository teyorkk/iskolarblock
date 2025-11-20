"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";
import type { LandingNavigationProps } from "@/types/components";

export function LandingNavigation({
  isMobileMenuOpen,
  onMobileMenuToggle,
}: LandingNavigationProps): React.JSX.Element {
  const handleSmoothScroll = (id: string): void => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <NextImage
                  src="/iskolarblock.svg"
                  alt="IskolarBlock Logo"
                  fill
                  className="object-contain"
                  priority
                  quality={90}
                  sizes="32px"
                />
              </div>
              <span className="font-bold text-xl text-gray-900">
                IskolarBlock
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#live-impact"
              className="text-gray-600 hover:text-orange-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll("live-impact");
              }}
            >
              Live Impact
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-orange-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll("features");
              }}
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-gray-600 hover:text-orange-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleSmoothScroll("about");
              }}
            >
              About
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              Login
            </Link>
            <Link href="/register">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4"
          >
            <div className="flex flex-col space-y-3">
              <Link
                href="#live-impact"
                className="text-gray-600 hover:text-orange-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onMobileMenuToggle();
                  handleSmoothScroll("live-impact");
                }}
              >
                Live Impact
              </Link>
              <Link
                href="#features"
                className="text-gray-600 hover:text-orange-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onMobileMenuToggle();
                  handleSmoothScroll("features");
                }}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-gray-600 hover:text-orange-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onMobileMenuToggle();
                  handleSmoothScroll("about");
                }}
              >
                About
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                Login
              </Link>
              <Link href="/register">
                <Button className="bg-orange-500 hover:bg-orange-600 w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
