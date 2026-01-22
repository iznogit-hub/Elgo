"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Instance, Instances, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

// --- GLOBAL TRIGGER HELPER ---
// Import this function in other pages to trigger the effect
export const triggerPop = () => {
  window.dispatchEvent(new CustomEvent("BUBBLE_POP_TRIGGER"));
};

export default function BubblePopOverlay() {
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      setPopping(true);
      // Reset after animation
      setTimeout(() => setPopping(false), 2000);
    };

    window.addEventListener("BUBBLE_POP_TRIGGER", handleTrigger);
    return () => window.removeEventListener("BUBBLE_POP_TRIGGER", handleTrigger);
  }, []);

  // Only render canvas when popping to save performance
  if (!popping) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
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

  // Generate random starting positions
  const data = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 10, // X
        (Math.random() - 0.5) * 10, // Y
        (Math.random() - 0.5) * 5,  // Z
      ],
      scale: 0.2 + Math.random() * 0.5,
      speed: 0.1 + Math.random() * 0.2,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!bubblesRef.current) return;
    
    // Animate bubbles floating up and popping
    bubblesRef.current.children.forEach((child, i) => {
      child.position.y += data[i].speed * 20 * delta; // Fly up fast
      
      // Jitter
      child.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.02;
    });
  });

  return (
    <group ref={bubblesRef}>
      <Instances range={count}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
          roughness={0} 
          thickness={2} 
          transmission={1} // Glass effect
          color="#06b6d4" // Cyan
          emissive="#06b6d4"
          emissiveIntensity={0.2}
          ior={1.5}
        />
        
        {data.map((props, i) => (
          <Bubble key={i} {...props} />
        ))}
      </Instances>
    </group>
  );
}

function Bubble({ position, scale, speed }: any) {
  const ref = useRef<any>(null);

  useEffect(() => {
    // Entrance Animation (Scale Up)
    gsap.fromTo(ref.current.scale, 
      { x: 0, y: 0, z: 0 },
      { x: scale, y: scale, z: scale, duration: 0.5, ease: "back.out(1.7)" }
    );

    // Pop Animation (Scale to 0)
    gsap.to(ref.current.scale, {
      x: 0, y: 0, z: 0,
      duration: 0.2,
      delay: 0.8 + Math.random() * 0.5, // Random pop time
      ease: "power2.in"
    });
  }, [scale]);

  return (
    <Instance ref={ref} position={position} />
  );
}