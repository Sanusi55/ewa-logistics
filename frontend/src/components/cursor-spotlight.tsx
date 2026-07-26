"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function CursorSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth spring animation for the spotlight
  const springConfig = { damping: 25, stiffness: 300 };
  const xSpring = useSpring(mousePosition.x, springConfig);
  const ySpring = useSpring(mousePosition.y, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, textarea, [data-magnetic]")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Main Spotlight */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-screen"
        style={{
          x: useTransform(xSpring, (x) => x - (isHovering ? 120 : 80)),
          y: useTransform(ySpring, (y) => y - (isHovering ? 120 : 80)),
        }}
      >
        <div
          className={`rounded-full bg-gradient-to-r from-orange-500/20 via-red-500/20 to-amber-500/20 blur-2xl transition-all duration-300 ${
            isHovering ? "w-60 h-60 opacity-100" : "w-40 h-40 opacity-60"
          }`}
        />
      </motion.div>

      {/* Inner Glow */}
      <motion.div
        className="fixed pointer-events-none z-[9998] mix-blend-screen"
        style={{
          x: useTransform(xSpring, (x) => x - (isHovering ? 40 : 30)),
          y: useTransform(ySpring, (y) => y - (isHovering ? 40 : 30)),
        }}
      >
        <div
          className={`rounded-full bg-gradient-to-r from-orange-400/30 via-red-400/30 to-amber-400/30 blur-xl transition-all duration-300 ${
            isHovering ? "w-20 h-20 opacity-100" : "w-16 h-16 opacity-50"
          }`}
        />
      </motion.div>

      {/* Cursor Dot */}
      <motion.div
        className="fixed pointer-events-none z-[9997]"
        style={{
          x: useTransform(xSpring, (x) => x - 4),
          y: useTransform(ySpring, (y) => y - 4),
        }}
      >
        <div
          className={`w-2 h-2 rounded-full bg-orange-500 transition-all duration-300 ${
            isHovering ? "scale-150" : "scale-100"
          }`}
        />
      </motion.div>
    </>
  );
}