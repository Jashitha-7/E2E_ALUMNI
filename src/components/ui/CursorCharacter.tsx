"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface CursorCharacterProps {
  imageSrc: string;
  size?: number;
  /** Area to avoid (e.g., form area) - character will stay outside */
  avoidArea?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  /** Reference to an element to avoid */
  avoidRef?: React.RefObject<HTMLElement>;
}

const CursorCharacter: React.FC<CursorCharacterProps> = ({
  imageSrc,
  size = 80,
  avoidRef,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const characterRef = useRef<HTMLDivElement>(null);

  // Spring physics for smooth following
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);
  const rotate = useSpring(useMotionValue(0), { damping: 30, stiffness: 200 });

  useEffect(() => {
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    // Show character after mount
    const timer = setTimeout(() => setIsVisible(true), 500);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let targetX = mousePos.x - size / 2;
    let targetY = mousePos.y - size / 2;

    // Check if we need to avoid the form area
    if (avoidRef?.current) {
      const rect = avoidRef.current.getBoundingClientRect();
      const padding = 20; // Extra padding around the form
      const avoidArea = {
        top: rect.top - padding,
        left: rect.left - padding,
        right: rect.right + padding,
        bottom: rect.bottom + padding,
      };

      // Check if cursor is inside the avoid area
      const cursorInAvoidArea =
        mousePos.x > avoidArea.left &&
        mousePos.x < avoidArea.right &&
        mousePos.y > avoidArea.top &&
        mousePos.y < avoidArea.bottom;

      if (cursorInAvoidArea) {
        // Find the nearest edge to position the character
        const distToLeft = mousePos.x - avoidArea.left;
        const distToRight = avoidArea.right - mousePos.x;
        const distToTop = mousePos.y - avoidArea.top;
        const distToBottom = avoidArea.bottom - mousePos.y;

        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

        if (minDist === distToLeft) {
          targetX = avoidArea.left - size - 10;
        } else if (minDist === distToRight) {
          targetX = avoidArea.right + 10;
        } else if (minDist === distToTop) {
          targetY = avoidArea.top - size - 10;
        } else {
          targetY = avoidArea.bottom + 10;
        }
      }
    }

    // Keep character within viewport
    targetX = Math.max(10, Math.min(windowSize.width - size - 10, targetX));
    targetY = Math.max(10, Math.min(windowSize.height - size - 10, targetY));

    // Calculate rotation based on movement direction
    const currentX = x.get();
    const deltaX = targetX - currentX;
    const tilt = Math.max(-15, Math.min(15, deltaX * 0.3));

    x.set(targetX);
    y.set(targetY);
    rotate.set(tilt);
  }, [mousePos, windowSize, size, avoidRef, isVisible, x, y, rotate]);

  if (!isVisible) return null;

  return (
    <motion.div
      ref={characterRef}
      className="fixed pointer-events-none z-50"
      style={{
        x,
        y,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "backOut" }}
    >
      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full bg-black/20 blur-sm"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Character container with bounce animation */}
      <motion.div
        style={{ rotate }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)",
            transform: "scale(1.2)",
          }}
        />

        {/* Character image */}
        <motion.img
          src={imageSrc}
          alt="Mascot Character"
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))",
          }}
          whileHover={{ scale: 1.1 }}
        />

        {/* Sparkle effects */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white"
            style={{
              top: `${20 + i * 20}%`,
              left: `${70 + i * 10}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default CursorCharacter;
