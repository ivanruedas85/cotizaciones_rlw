"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    blur?: "sm" | "md" | "lg" | "xl"
    opacity?: number
    border?: boolean
    shadow?: boolean
    rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
    animate?: boolean
}

const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
}

const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
}

export function Glass({
    children,
    className,
    blur = "md",
    opacity = 0.1,
    border = true,
    shadow = true,
    rounded = "lg",
    animate = true,
    ...props
}: GlassProps) {
    const Component = animate ? motion.div : "div"

    const motionProps = animate
        ? {
            initial: { opacity: 0, y: 20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
            whileHover: {
                scale: 1.02,
                transition: { duration: 0.2 },
            },
        }
        : {}

    return (
        <Component
            className={cn(
                // Base glass effect
                "relative",
                blurClasses[blur],
                roundedClasses[rounded],

                // Background with opacity
                "bg-white/10 dark:bg-white/5",

                // Border
                border && "border border-white/20 dark:border-white/10",

                // Shadow
                shadow && "shadow-xl shadow-black/10 dark:shadow-black/20",

                // Additional effects
                "backdrop-saturate-150",
                "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50",

                className,
            )}
            style={{
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
            }}
            {...motionProps}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </Component>
    )
}
