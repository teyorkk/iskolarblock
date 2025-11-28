"use client";

import { ReactNode } from "react";

interface ResponsiveTableWrapperProps {
  desktopView: ReactNode;
  mobileView: ReactNode;
  className?: string;
}

export function ResponsiveTableWrapper({
  desktopView,
  mobileView,
  className,
}: ResponsiveTableWrapperProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className={`hidden md:block overflow-x-auto ${className || ""}`}>
        {desktopView}
      </div>

      {/* Mobile Card View */}
      <div className={`md:hidden ${className || ""}`}>
        {mobileView}
      </div>
    </>
  );
}

