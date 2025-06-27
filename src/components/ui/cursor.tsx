"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cursorVariants = cva(
  "relative",
  {
    variants: {
      variant: {
        default: "",
        pointer: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CursorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cursorVariants> {}

const Cursor = React.forwardRef<HTMLDivElement, CursorProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cursorVariants({ variant }), className)}
      {...props}
    />
  )
)
Cursor.displayName = "Cursor"

const CursorPointer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-3 h-3 rounded-full border-2 border-white shadow-lg",
      className
    )}
    {...props}
  />
))
CursorPointer.displayName = "CursorPointer"

const CursorBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-4 left-4 rounded-lg shadow-lg border",
      className
    )}
    {...props}
  />
))
CursorBody.displayName = "CursorBody"

const CursorName = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-xs font-medium", className)}
    {...props}
  />
))
CursorName.displayName = "CursorName"

const CursorMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs opacity-80", className)}
    {...props}
  />
))
CursorMessage.displayName = "CursorMessage"

export { Cursor, CursorPointer, CursorBody, CursorName, CursorMessage } 