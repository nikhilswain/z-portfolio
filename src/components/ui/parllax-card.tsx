"use client";

import type React from "react";

import { useState, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface ParllaxCardProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  imageSelector?: string;
  textSelector?: string;
  glowOnHover?: boolean;
  glowColor?: string;
}

export function ParllaxCard({
  children,
  className = "",
  depth = 80,
  imageSelector = "img",
  textSelector = "h3",
  glowOnHover = true,
  glowColor = "rgba(236, 72, 153, 0.5)",
}: ParllaxCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to rotation (reduced values to prevent overflow)
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]);

  // Transform for parallax elements (reduced values)
  const imgX = useTransform(mouseX, [-0.5, 0.5], ["-10px", "10px"]);
  const imgY = useTransform(mouseY, [-0.5, 0.5], ["-10px", "10px"]);
  const textX = useTransform(mouseX, [-0.5, 0.5], ["-5px", "5px"]);
  const textY = useTransform(mouseY, [-0.5, 0.5], ["-5px", "5px"]);

  // Glow effect position
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;

    const rect = cardRef.current.getBoundingClientRect();

    // Calculate mouse position relative to card (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: `${depth * 4}px`,
      }}
    >
      <motion.div
        className="relative w-full h-full rounded-xl overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          rotateX: isHovered ? rotateX : "0deg",
          rotateY: isHovered ? rotateY : "0deg",
          transition: isHovered ? "none" : "all 0.5s ease-out",
        }}
      >
        {/* Main content */}
        <div className="relative w-full h-full">{children}</div>

        {/* Parallax image effect */}
        {isHovered && (
          <>
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 10 }}
            >
              {Array.from(
                cardRef.current?.querySelectorAll(imageSelector) ?? []
              ).map((img, idx) => {
                const element = img as HTMLElement;
                element.style.transform = `translateX(${imgX.get()}px) translateY(${imgY.get()}px)`;
                element.style.transition = "none";
                return null;
              })}
            </motion.div>

            {/* Parallax text effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 20 }}
            >
              {Array.from(
                cardRef.current?.querySelectorAll(textSelector) ?? []
              ).map((text, idx) => {
                const element = text as HTMLElement;
                element.style.transform = `translateX(${textX.get()}px) translateY(${textY.get()}px)`;
                element.style.transition = "none";
                return null;
              })}
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Glow effect */}
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowX} ${glowY}, ${glowColor}, transparent 70%)`,
            opacity: isHovered ? 0.6 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        />
      )}
    </motion.div>
  );
}
