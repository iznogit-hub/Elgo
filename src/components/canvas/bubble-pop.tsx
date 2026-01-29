"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

// --- GLOBAL TRIGGER HELPER ---
export const triggerPop = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("BUBBLE_POP_TRIGGER"));
  }
};

export default function BubblePopOverlay() {
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      setPopping(true);
      // Reset after animation duration
      setTimeout(() => setPopping(false), 2500);
    };

    window.addEventListener("BUBBLE_POP_TRIGGER", handleTrigger);
    return () => window.removeEventListener("BUBBLE_POP_TRIGGER", handleTrigger);
  }, []);

  // Only render canvas when popping to save performance
  if (!popping) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <BubbleSystem />
      </Canvas>
    </div>
  );
}

function BubbleSystem() {
  const bubblesRef = useRef<THREE.Group>(null);
  const count = 30; // Number of bubbles

  // ⚡ FIX: Generate random data inside useMemo so it is pure during render
  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 10, // X
        (Math.random() - 0.5) * 10, // Y
        (Math.random() - 0.5) * 5,  // Z
      ] as [number, number, number],
      scale: 0.2 + Math.random() * 0.5,
      speed: 0.1 + Math.random() * 0.2,
      popDelay: 0.8 + Math.random() * 0.5, // Pre-calculate delay
    }));
  }, []);

  useFrame((state, delta) => {
    if (!bubblesRef.current) return;
    
    // Animate bubbles floating up
    bubblesRef.current.children.forEach((child: any, i) => {
      if (child.position) {
        child.position.y += data[i].speed * 20 * delta; // Fly up fast
        // Jitter
        child.position.x += Math.sin(state.clock.elapsedTime * 5 + i) * 0.02;
      }
    });
  });

  return (
    <group ref={bubblesRef}>
      <Instances range={count}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
          roughness={0} 
          thickness={1.5} 
          transmission={1} // Glass effect
          color="#06b6d4" // Cyan
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          ior={1.5}
          transparent
          opacity={0.8}
        />
        
        {data.map((props, i) => (
          <Bubble key={i} {...props} />
        ))}
      </Instances>
    </group>
  );
}

interface BubbleProps {
  position: [number, number, number];
  scale: number;
  popDelay: number;
  speed: number;
}

function Bubble({ position, scale, popDelay }: BubbleProps) {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Reset initial scale
    ref.current.scale.set(0, 0, 0);

    // Entrance Animation (Scale Up)
    gsap.to(ref.current.scale, {
      x: scale, 
      y: scale, 
      z: scale, 
      duration: 0.5, 
      ease: "back.out(1.7)" 
    });

    // Pop Animation (Scale to 0)
    gsap.to(ref.current.scale, {
      x: 0, 
      y: 0, 
      z: 0,
      duration: 0.2,
      delay: popDelay, 
      ease: "power2.in"
    });
  }, [scale, popDelay]);

  return (
    <Instance ref={ref} position={position} />
  );
}