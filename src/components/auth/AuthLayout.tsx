"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Ref to the card element for positioning */
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const AuthLayout = ({ title, subtitle, children, footer, className, cardRef: externalCardRef }: AuthLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Combine refs
  const setCardRef = (el: HTMLDivElement | null) => {
    (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (externalCardRef) {
      (externalCardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  };

  // Mouse position for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics
  const softSpring = { damping: 30, stiffness: 100 };
  
  // Shadow movement for depth
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [30, -30]), softSpring);
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [30, -30]), softSpring);

  // Glow position
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [10, 90]), softSpring);
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, 90]), softSpring);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-950 via-[#0a0a12] to-neutral-950">
      {/* Deep space background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(15,10,30,1)_0%,rgba(5,5,10,1)_100%)]" />
      
      {/* Ambient nebula glows */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.12),transparent_40%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.1),transparent_40%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_50%)]" />

      {/* Animated star field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Animated grid - subtle perspective */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          perspective: "1000px",
          transform: "rotateX(60deg) translateY(-50%)",
          transformOrigin: "center center",
        }}
      />

      {/* Large floating orbs with parallax */}
      <motion.div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)",
          filter: "blur(60px)",
          x: useTransform(mouseX, [-0.5, 0.5], [50, -50]),
          y: useTransform(mouseY, [-0.5, 0.5], [50, -50]),
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)",
          filter: "blur(50px)",
          x: useTransform(mouseX, [-0.5, 0.5], [-40, 40]),
          y: useTransform(mouseY, [-0.5, 0.5], [-40, 40]),
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles with depth */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            background: i % 2 === 0 
              ? "radial-gradient(circle, rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 0.2))"
              : "radial-gradient(circle, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.2))",
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 4) * 20}%`,
            boxShadow: i % 2 === 0 
              ? "0 0 10px rgba(139, 92, 246, 0.5)"
              : "0 0 10px rgba(6, 182, 212, 0.5)",
          }}
          animate={{
            y: [0, -40 - i * 5, 0],
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Main container */}
      <div 
        className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-6 py-16"
      >
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.6 },
          }}
          className={cn("w-full max-w-md", className)}
          style={{ pointerEvents: "auto", zIndex: 20 }}
        >
              {/* Card Container */}
              <motion.div
                style={{
                  pointerEvents: "auto",
                }}
                className="relative"
              >
                {/* Deep shadow layer - moves opposite to card tilt */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    filter: "blur(40px)",
                    x: shadowX,
                    y: shadowY,
                    opacity: isHovered ? 0.8 : 0.4,
                  }}
                />

                {/* Mid shadow for depth */}
                <motion.div
                  className="absolute inset-2 rounded-3xl pointer-events-none"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    filter: "blur(25px)",
                    opacity: isHovered ? 0.6 : 0.3,
                  }}
                />

                {/* Animated border glow ring */}
                <motion.div
                  className="absolute -inset-[3px] rounded-[26px] pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, 
                      transparent 0deg,
                      rgba(139, 92, 246, 0.7) 60deg,
                      rgba(6, 182, 212, 0.7) 120deg,
                      rgba(99, 102, 241, 0.7) 180deg,
                      rgba(139, 92, 246, 0.7) 240deg,
                      transparent 360deg)`,
                    opacity: isHovered ? 0.8 : 0.3,
                    filter: "blur(2px)",
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Outer glow pulse */}
                <motion.div
                  className="absolute -inset-4 rounded-[32px] pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15), transparent 70%)",
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.98, 1.02, 0.98],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Main glass card */}
                <motion.div
                  ref={setCardRef}
                  className="relative rounded-3xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(20, 20, 35, 0.9) 0%, rgba(15, 15, 28, 0.95) 100%)",
                    backdropFilter: "blur(40px) saturate(180%)",
                    WebkitBackdropFilter: "blur(40px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: `
                      0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                      0 30px 60px -15px rgba(0, 0, 0, 0.6),
                      0 0 40px -10px rgba(139, 92, 246, 0.2),
                      0 -1px 0 0 rgba(255, 255, 255, 0.1) inset,
                      0 50px 100px -30px rgba(0, 0, 0, 0.4)
                    `,
                    pointerEvents: "auto",
                    zIndex: 5,
                  }}
                  // Floating animation
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Dynamic spotlight glow following mouse */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: useTransform(
                        [glowX, glowY],
                        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 25%, transparent 50%)`
                      ),
                      opacity: isHovered ? 1 : 0,
                    }}
                  />

                  {/* Top edge highlight */}
                  <div 
                    className="absolute top-0 left-4 right-4 h-[1px] pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    }}
                  />

                  {/* Glass reflection - top left shine */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                    }}
                  />

                  {/* Diagonal shine effect */}
                  <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                  >
                    <motion.div
                      className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 pointer-events-none"
                      style={{
                        background: "linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.03) 48%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 52%, transparent 55%)",
                        transform: "rotate(-45deg)",
                      }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 4,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative p-10 md:p-12" style={{ position: "relative", zIndex: 10, pointerEvents: "auto" }}>
                    {/* Layer 1 - Header (deepest parallax) */}
                    <motion.div 
                      className="space-y-2 text-center"
                      style={{ 
                      }}
                    >
                      {/* Floating badge */}
                      <motion.div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                        style={{
                          background: "rgba(139, 92, 246, 0.15)",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(139, 92, 246, 0.2)",
                            "0 0 30px rgba(139, 92, 246, 0.3)",
                            "0 0 20px rgba(139, 92, 246, 0.2)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        <span 
                          className="text-[10px] uppercase tracking-[0.2em] font-medium"
                          style={{ color: "rgba(196, 181, 253, 0.9)" }}
                        >
                          Alumni Network
                        </span>
                      </motion.div>

                      <h1 
                        className="text-2xl md:text-3xl font-bold"
                        style={{
                          background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #67e8f9 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          textShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        {title}
                      </h1>
                      {subtitle && (
                        <p 
                          className="text-sm"
                          style={{ color: "rgba(203, 213, 225, 0.8)" }}
                        >
                          {subtitle}
                        </p>
                      )}
                    </motion.div>

                    {/* Layer 2 - Form content (medium parallax) */}
                    <motion.div 
                      className="mt-8 space-y-5"
                      style={{ 
                        position: "relative",
                        zIndex: 50,
                        pointerEvents: "auto",
                      }}
                    >
                      {children}
                    </motion.div>

                    {/* Layer 3 - Footer (subtle parallax) */}
                    {footer && (
                      <motion.div 
                        className="mt-8"
                        style={{ 
                        }}
                      >
                        {footer}
                      </motion.div>
                    )}
                  </div>

                  {/* Bottom edge gradient */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                    }}
                  />

                  {/* Corner accents */}
                  <div 
                    className="absolute top-4 left-4 w-8 h-8 pointer-events-none"
                    style={{
                      borderTop: "2px solid rgba(139, 92, 246, 0.4)",
                      borderLeft: "2px solid rgba(139, 92, 246, 0.4)",
                      borderRadius: "4px 0 0 0",
                    }}
                  />
                  <div 
                    className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none"
                    style={{
                      borderBottom: "2px solid rgba(6, 182, 212, 0.4)",
                      borderRight: "2px solid rgba(6, 182, 212, 0.4)",
                      borderRadius: "0 0 4px 0",
                    }}
                  />
                </motion.div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-5 -right-5 w-10 h-10 rounded-xl pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(99, 102, 241, 0.9))",
                    boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)",
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotateZ: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-8 h-8 rounded-lg pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(34, 211, 238, 0.9))",
                    boxShadow: "0 10px 25px rgba(6, 182, 212, 0.4), 0 0 15px rgba(6, 182, 212, 0.3)",
                  }}
                  animate={{
                    y: [0, 8, 0],
                    rotateZ: [0, -15, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                <motion.div
                  className="absolute top-1/2 -right-3 w-4 h-4 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(167, 139, 250, 0.9), rgba(139, 92, 246, 0.7))",
                    boxShadow: "0 0 20px rgba(167, 139, 250, 0.5)",
                  }}
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 5, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
