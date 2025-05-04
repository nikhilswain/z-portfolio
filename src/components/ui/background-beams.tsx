import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export function BackgroundBeams() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize particles based on current dimensions
  const initParticles = useCallback(() => {
    if (!canvasRef.current) return;

    const { width, height } = dimensionsRef.current;
    const particles: Particle[] = [];
    const count = Math.min(Math.floor(width / 20), 40); // Adjust particle count based on width

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color:
          i % 2 === 0 ? "rgba(236, 72, 153, 0.5)" : "rgba(34, 211, 238, 0.5)",
      });
    }

    particlesRef.current = particles;
  }, []);

  // Handle resize without state updates
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;

    if (container) {
      const { width, height } = container.getBoundingClientRect();

      // Update ref instead of state to avoid re-renders
      dimensionsRef.current = { width, height };

      // Update canvas size
      canvas.width = width;
      canvas.height = height;

      // Reinitialize particles when resizing
      initParticles();
    }
  }, [initParticles]);

  // Draw particles and connections
  const drawParticles = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles
    particlesRef.current.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });

    // Draw connections
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${
            0.1 * (1 - distance / 150)
          })`;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }, []);

  // Update particle positions
  const updateParticles = useCallback(() => {
    const { width, height } = dimensionsRef.current;

    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off walls
      if (particle.x < 0 || particle.x > width) {
        particle.vx = -particle.vx;
      }

      if (particle.y < 0 || particle.y > height) {
        particle.vy = -particle.vy;
      }
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  // Setup effect - runs once on mount
  useEffect(() => {
    // Initial setup
    handleResize();
    setIsInitialized(true);

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [handleResize, animate]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />
    </div>
  );
}
