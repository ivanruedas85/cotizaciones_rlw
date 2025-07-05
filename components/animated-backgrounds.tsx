"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image"

export function AnimatedBackground() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Imagen de fondo base - carteras de cuero */}
            <div className="absolute inset-0">
                <Image
                    src="/img/fondo_carteras.webp"
                    alt="Fondo de carteras de cuero"
                    fill
                    className="object-cover object-center"
                    style={{
                        filter:
                            theme === "dark"
                                ? "brightness(0.3) contrast(1.2) sepia(0.2)"
                                : "brightness(0.4) contrast(0.8) sepia(0.1)",
                    }}
                    priority
                />
                {/* Overlay para mejorar legibilidad */}
                <div
                    className={cn(
                        "absolute inset-0 transition-all duration-1000",
                        theme === "dark" ? "bg-black/70" : "bg-white/60",
                    )}
                />
            </div>

            {/* Gradiente base por encima de la imagen */}
            <div
                className={cn(
                    "absolute inset-0 transition-all duration-1000 z-10",
                    theme === "dark"
                        ? "bg-gradient-to-br from-slate-900/80 via-purple-900/30 to-slate-900/80"
                        : "bg-gradient-to-br from-blue-50/70 via-indigo-50/60 to-purple-50/70",
                )}
            />

            {/* Formas animadas - por encima del gradiente */}
            <div className="relative z-20">
                <motion.div
                    className={cn(
                        "absolute top-0 left-0 w-96 h-96 rounded-full opacity-15 blur-3xl",
                        theme === "dark" ? "bg-purple-500" : "bg-blue-400",
                    )}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                <motion.div
                    className={cn(
                        "absolute top-1/2 right-0 w-80 h-80 rounded-full opacity-12 blur-3xl",
                        theme === "dark" ? "bg-blue-500" : "bg-purple-400",
                    )}
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 5,
                    }}
                />

                <motion.div
                    className={cn(
                        "absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl",
                        theme === "dark" ? "bg-indigo-500" : "bg-pink-400",
                    )}
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 10,
                    }}
                />

                {/* Partículas flotantes */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={cn(
                            "absolute w-1.5 h-1.5 rounded-full opacity-20",
                            theme === "dark" ? "bg-white" : "bg-gray-600",
                        )}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Overlay final sutil para unificar */}
            <div
                className={cn(
                    "absolute inset-0 transition-all duration-1000 z-30",
                    theme === "dark" ? "bg-black/10" : "bg-white/20",
                )}
            />
        </div>
    )
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ")
}

