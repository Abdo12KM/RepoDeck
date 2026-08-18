"use client";

import React, { useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltedCardProps {
  maxAngle?: number;
  scale?: number;
  glareOpacity?: number;
  className?: string;
  children: React.ReactNode;
}

export function TiltedCard({
  maxAngle = 10,
  scale = 1.02,
  glareOpacity = 0.15,
  className,
  children,
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 });
  const cardScale = useSpring(1, { stiffness: 300, damping: 25 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    rotateX.set(-deltaY * maxAngle);
    rotateY.set(deltaX * maxAngle);
    glareX.set((x / rect.width) * 100);
    glareY.set((y / rect.height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    cardScale.set(scale);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    cardScale.set(1);
  };

  return (
    <div style={{ perspective: "1000px" }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale: cardScale,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#09090b] transition-shadow duration-300",
          isHovered && "shadow-primary/10 shadow-2xl",
          className,
        )}
      >
        {/* Dynamic Glare Overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.8), transparent 60%)`,
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}
