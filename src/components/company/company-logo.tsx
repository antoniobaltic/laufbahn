"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface CompanyLogoProps {
  domain?: string | null;
  companyName: string;
  size?: number;
  className?: string;
}

// Generate a consistent background color from company name
function nameToColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-orange-100 text-orange-600",
    "bg-green-100 text-green-600",
    "bg-dark-100 text-dark-600",
    "bg-light-gray text-dark-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function CompanyLogo({
  domain,
  companyName,
  size = 28,
  className,
}: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);

  const initial = companyName.charAt(0).toUpperCase();
  const colorClass = nameToColor(companyName);

  // No domain or both sources failed → monogram
  if (!domain || imgError) {
    return (
      <div
        className={cn(
          "rounded-md flex items-center justify-center shrink-0",
          colorClass,
          className
        )}
        style={{ width: size, height: size }}
      >
        <span
          className="font-heading font-semibold leading-none"
          style={{ fontSize: size * 0.45 }}
        >
          {initial}
        </span>
      </div>
    );
  }

  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <div
      className={cn(
        "rounded-md overflow-hidden shrink-0 bg-white border border-border flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`${companyName} logo`}
        width={size}
        height={size}
        className="object-contain"
        onError={() => setImgError(true)}
        unoptimized
      />
    </div>
  );
}
