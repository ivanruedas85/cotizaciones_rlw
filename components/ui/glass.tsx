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
    enhanced?: boolean // Nueva prop para mejor contraste sobre fondo de cuero
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
    opacity = 0.15,
    border = true,
    shadow = true,
    rounded = "lg",
    animate = true,
    enhanced = false,
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

                // Background with enhanced opacity for leather background
                enhanced ? "bg-white/20 dark:bg-black/40" : "bg-white/15 dark:bg-white/8",

                // Border with better visibility
                border &&
                (enhanced ? "border border-white/30 dark:border-white/20" : "border border-white/25 dark:border-white/15"),

                // Enhanced shadow for leather background
                shadow &&
                (enhanced
                    ? "shadow-2xl shadow-black/30 dark:shadow-black/50"
                    : "shadow-xl shadow-black/20 dark:shadow-black/40"),

                // Additional effects
                "backdrop-saturate-150",

                // Enhanced gradient overlay for better contrast
                enhanced &&
                "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/25 before:via-white/10 before:to-transparent before:opacity-60 dark:before:from-white/15 dark:before:via-white/5 dark:before:to-transparent",

                !enhanced &&
                "before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50",

                className,
            )}
            style={{
                backgroundColor: enhanced ? `rgba(255, 255, 255, ${opacity * 1.3})` : `rgba(255, 255, 255, ${opacity})`,
            }}
            {...motionProps}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </Component>
    )
}

