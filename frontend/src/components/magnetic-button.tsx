"use client";

import { useState, useRef, ReactNode } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  magneticStrength?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  as?: "button" | "a";
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  rippleColor?: string;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export default function MagneticButton({
  children,
  className = "",
  magneticStrength = 0.3,
  onClick,
  as = "button",
  href,
  disabled = false,
  type = "button",
  rippleColor = "rgba(255, 255, 255, 0.3)",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Enhanced spring physics for more natural movement
  const springConfig = { 
    damping: 20, 
    stiffness: 200,
    mass: 0.5,
    restDelta: 0.001
  };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center with smooth falloff
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Reduce magnetic effect near edges for more natural feel
    const maxDistance = Math.max(rect.width, rect.height) * 0.6;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const falloff = Math.max(0, 1 - distance / maxDistance);

    x.set(distanceX * magneticStrength * falloff);
    y.set(distanceY * magneticStrength * falloff);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return;

    // Create ripple effect
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;
      
      const newRipple: Ripple = {
        x: rippleX,
        y: rippleY,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    // Call original onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  const Component = as === "a" ? motion.a : motion.button;

  const baseProps = {
    ref,
    onClick: handleClick,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => !disabled && setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    style: { x: xSpring, y: ySpring },
    className: `relative inline-flex items-center justify-center overflow-hidden ${className} ${
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
    }`,
    whileHover: disabled ? {} : { scale: 1.05 },
    whileTap: disabled ? {} : { scale: 0.95 },
    "aria-disabled": disabled,
  };

  return (
    <>
      {as === "button" ? (
        <Component {...baseProps} type={type} disabled={disabled}>
          {/* Ripple Effects */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: ripple.x,
                  top: ripple.y,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: rippleColor,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            ))}
          </AnimatePresence>
          
          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            {children}
          </span>
        </Component>
      ) : (
        <Component {...baseProps} href={disabled ? undefined : href}>
          {/* Ripple Effects */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: ripple.x,
                  top: ripple.y,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: rippleColor,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            ))}
          </AnimatePresence>
          
          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            {children}
          </span>
        </Component>
      )}
    </>
  );
}