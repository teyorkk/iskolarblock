"use client";

import NextImage from "next/image";
import { AppBackground } from "@/components/common/app-background";
import type { LandingFooterProps } from "@/types/components";

export function LandingFooter({}: LandingFooterProps): React.JSX.Element {
  return (
    <footer className="relative overflow-hidden bg-white/80 backdrop-blur-md border-t py-12">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                <NextImage
                  src="/iskolarblock.svg"
                  alt="IskolarBlock Logo"
                  fill
                  className="object-contain"
                  quality={90}
                  sizes="32px"
                  loading="lazy"
                />
              </div>
              <span className="font-bold text-lg text-gray-900">
                IskolarBlock
              </span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-600">
              © 2025 IskolarBlock. Barangay San Miguel, Hagonoy
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Empowering scholars through blockchain transparency
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
