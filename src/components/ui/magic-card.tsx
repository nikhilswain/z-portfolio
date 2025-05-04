"use client";

import type React from "react";

import { useState, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  backgroundClassName?: string;
  hoverScale?: number;
}

export function MagicCard({
  children,
  className = "",
  backgroundClassName = "bg-zinc-900 border-zinc-800",
  hoverScale = 1.05,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate rotation (max 10 degrees)
    const rotX = ((mouseY - centerY) / (rect.height / 2)) * -10;
    const rotY = ((mouseX - centerX) / (rect.width / 2)) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
      }}
      animate={{
        scale: isHovered ? hoverScale : 1,
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
        mass: 0.5,
      }}
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
      }}
    >
      {/* Card content */}
      <div
        className={`relative z-10 h-full w-full rounded-xl ${backgroundClassName} p-6`}
      >
        {children}
      </div>

      {/* Highlight effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20 opacity-0 rounded-xl"
        animate={{
          opacity: isHovered ? 0.6 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 rounded-xl overflow-hidden"
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20"
          animate={{
            left: isHovered ? "100%" : "-100%",
            top: isHovered ? "100%" : "-100%",
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
          style={{
            width: "200%",
            height: "200%",
            transform: "rotate(30deg)",
            transformOrigin: "top left",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
