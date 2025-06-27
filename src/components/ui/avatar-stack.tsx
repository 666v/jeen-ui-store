"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarStackVariants = cva(
  "flex -space-x-2",
  {
    variants: {
      size: {
        sm: "space-x-1",
        md: "space-x-2", 
        lg: "space-x-3",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface AvatarStackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarStackVariants> {
  animate?: boolean
}

const AvatarStack = React.forwardRef<HTMLDivElement, AvatarStackProps>(
  ({ className, size, animate = false, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    
    return (
      <div
        ref={ref}
        className={cn(avatarStackVariants({ size }), className)}
        {...props}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={cn(
              "relative",
              animate && "animate-in slide-in-from-right-2 duration-300",
              animate && {
                "animation-delay-0": index === 0,
                "animation-delay-100": index === 1,
                "animation-delay-200": index === 2,
                "animation-delay-300": index === 3,
                "animation-delay-400": index === 4,
              }
            )}
            style={animate ? { animationDelay: `${index * 100}ms` } : undefined}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)
AvatarStack.displayName = "AvatarStack"

export { AvatarStack, avatarStackVariants } 