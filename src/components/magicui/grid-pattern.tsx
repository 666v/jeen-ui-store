"use client";

import { cn } from "@/lib/utils";

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
  className?: string;
}

export function GridPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  strokeDasharray,
  className,
  ...props
}: GridPatternProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full fill-gray-400/20 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id="grid"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M ${height} 0 V ${height} H 0`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray={strokeDasharray}
            className="text-gray-400/20"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export function GridPatternLinearGradient() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-lg border bg-background p-20">
      <GridPattern
        width={20}
        height={20}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] ",
        )}
      />
    </div>
  );
}
