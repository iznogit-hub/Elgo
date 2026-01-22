"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, Float, Sparkles, Environment } from "@react-three/drei";
import { useEffect, useRef, Suspense } from "react";
import * as THREE from "three";
import { HackerText } from "@/components/ui/hacker-text";

interface ViewerProps {
  url?: string;
  velocity?: number; // 0 to 1000
  animation?: "idle" | "victory" | "alert";
  tier?: string;
  showHud?: boolean;
}

// THE INTERNAL 3D MODEL COMPONENT
function Model({ url, animation, velocity = 0 }: any) {
  const group = useRef<THREE.Group>(null);
  // Default to a placeholder if URL is missing to prevent crash
  const modelUrl = url || "/models/operative.glb"; 
  
  // Load Model
  const gltf = useGLTF(modelUrl) as any;
  const { nodes, materials } = gltf;
  const { actions } = useAnimations(gltf.animations, group);

  // 1. ANIMATION HANDLER
  useEffect(() => {
    if (!actions) return;
    // Stop all current animations
    Object.values(actions).forEach(a => a?.stop());
    
    // Play requested animation (fuzzy match or default to first)
    const actionKeys = Object.keys(actions);
    const targetAction = actionKeys.find(k => k.toLowerCase().includes(animation)) || actionKeys[0];
    
    if (targetAction) {
      actions[targetAction]?.reset().fadeIn(0.5).play();
    }
  }, [animation, actions]);

  // 2. VELOCITY REACTION (GLOW)
  useFrame((state) => {
    if (group.current) {
      group.current.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // If Velocity > 500, pulsate the emissive channels
          if (velocity > 500) {
            const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
            child.material.emissive = new THREE.Color("#06b6d4"); // Cyan
            child.material.emissiveIntensity = 0.5 + (pulse * (velocity / 1000));
          } else {
            child.material.emissiveIntensity = 0.1;
          }
        }
      });
    }
  });

  return <primitive object={nodes.Scene || nodes.scene} ref={group} />;
}

// THE MAIN EXPORTED COMPONENT
export default function OperativeViewer({ 
  url = "/models/operative.glb", 
  velocity = 0, 
  animation = "idle",
  tier = "recruit",
  showHud = true 
}: ViewerProps) {
  
  const auraColor = tier === "inner_circle" ? "#ef4444" : "#06b6d4"; // Red for VIP, Cyan for Recruit

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.5, 4], fov: 45 }}>
        {/* LIGHTING SETUP */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={auraColor} />

        {/* HIGH VELOCITY PARTICLES */}
        {velocity > 500 && (
          <Sparkles count={40} scale={4} size={3} speed={0.4} opacity={0.4} color={auraColor} />
        )}

        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
           <Suspense fallback={null}>
             <Model url={url} animation={animation} velocity={velocity} />
           </Suspense>
        </Float>

        <Environment preset="city" />
        
        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 2.5} 
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>

      {/* HUD OVERLAY */}
      {showHud && (
        <div className="absolute bottom-4 left-4 pointer-events-none select-none">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${velocity > 500 ? "bg-red-500 animate-ping" : "bg-green-500"}`} />
            <HackerText 
              text={velocity > 500 ? "OVERCLOCK ENGAGED" : "SYSTEM STABLE"} 
              className="text-xs font-bold text-white tracking-widest" 
            />
          </div>
          <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase">
            ID: {tier}_{velocity}
          </p>
        </div>
      )}
    </div>
  );
}