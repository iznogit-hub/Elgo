"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";

function Model({ startAnimation }: { startAnimation: boolean }) {
  // Use a generic bot model or placeholder
  // If you don't have a .glb file, use a simple Mesh for now
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Gentle floating idle animation
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  useEffect(() => {
    if (startAnimation && meshRef.current) {
        // Entrance Animation
        gsap.fromTo(meshRef.current.scale, 
            { x: 0, y: 0, z: 0 }, 
            { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.5)" }
        );
    }
  }, [startAnimation]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef} scale={[0,0,0]}>
          {/* REPLACE THIS MESH WITH YOUR GLB MODEL */}
          {/* <primitive object={scene} /> */}
          
          {/* Fallback Cyber Sphere */}
          <mesh>
              <icosahedronGeometry args={[1.2, 0]} />
              <meshStandardMaterial 
                color="#06b6d4" 
                wireframe 
                emissive="#06b6d4"
                emissiveIntensity={2}
              />
          </mesh>
          {/* Inner Core */}
          <mesh scale={0.5}>
              <sphereGeometry args={[1, 32, 32]} />
              <meshBasicMaterial color="white" />
          </mesh>
      </group>
    </Float>
  );
}

export function AvatarImage({ startAnimation }: { startAnimation: boolean }) {
  return (
    <div className="w-32 h-32 md:w-48 md:h-48 relative pointer-events-none"> 
      {/* pointer-events-none on container so clicks pass through to the wrapper in GlobalAppWrapper, 
          OR set pointer-events-auto if you want interactions inside the canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Model startAnimation={startAnimation} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}