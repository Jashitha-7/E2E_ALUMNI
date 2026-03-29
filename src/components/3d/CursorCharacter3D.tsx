"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Chibi Character made of 3D geometries - matching the reference image
function ChibiCharacter({ targetPosition }: { targetPosition: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  // Smooth follow with physics
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Calculate direction to target
    const direction = targetPosition.clone().sub(currentPos.current);

    // Spring physics for smooth movement
    const springStrength = 3;
    const damping = 0.85;

    velocity.current.add(direction.multiplyScalar(springStrength * delta));
    velocity.current.multiplyScalar(damping);
    currentPos.current.add(velocity.current);

    groupRef.current.position.copy(currentPos.current);

    // Tilt based on velocity (leaning into movement)
    const tiltX = -velocity.current.y * 0.5;
    const tiltZ = velocity.current.x * 0.3;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tiltX, 0.1);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, tiltZ, 0.1);

    // Subtle bounce animation
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.05;
  });

  // Hair color - dark chocolate brown
  const hairColor = "#3d2314";
  const hairColorLight = "#5c3a2a";
  // Skin tone
  const skinColor = "#ffe4c9";
  // Eye color - warm brown/amber
  const eyeColor = "#5c3a1e";
  // Outfit colors
  const robeColor = "#f8f8f8";
  const beltColor = "#6b1c23";

  return (
    <group ref={groupRef} scale={0.9}>
      {/* ========== HEAD ========== */}
      <group position={[0, 0.55, 0]}>
        {/* Main head shape - larger for chibi */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>

        {/* ========== HAIR ========== */}
        <group position={[0, 0.15, 0]}>
          {/* Base hair cap */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* Main messy hair spikes - top */}
          <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.1]}>
            <coneGeometry args={[0.15, 0.35, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.15, 0.32, 0.05]} rotation={[0.2, 0, -0.4]}>
            <coneGeometry args={[0.12, 0.3, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
          <mesh position={[0.18, 0.3, 0]} rotation={[-0.1, 0, 0.5]}>
            <coneGeometry args={[0.1, 0.28, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.08, 0.38, -0.1]} rotation={[0.3, 0, 0.2]}>
            <coneGeometry args={[0.08, 0.22, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
          <mesh position={[-0.08, 0.36, -0.08]} rotation={[0.2, 0, -0.15]}>
            <coneGeometry args={[0.09, 0.25, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* Side spikes - left */}
          <mesh position={[-0.4, 0.05, 0.1]} rotation={[0.3, 0.3, -0.8]}>
            <coneGeometry args={[0.1, 0.25, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.38, 0.15, 0]} rotation={[0, 0.2, -0.6]}>
            <coneGeometry args={[0.08, 0.2, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
          <mesh position={[-0.35, -0.05, 0.15]} rotation={[0.4, 0.1, -0.9]}>
            <coneGeometry args={[0.07, 0.18, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* Side spikes - right */}
          <mesh position={[0.4, 0.05, 0.1]} rotation={[0.3, -0.3, 0.8]}>
            <coneGeometry args={[0.1, 0.25, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.38, 0.15, 0]} rotation={[0, -0.2, 0.6]}>
            <coneGeometry args={[0.08, 0.2, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
          <mesh position={[0.35, -0.05, 0.15]} rotation={[0.4, -0.1, 0.9]}>
            <coneGeometry args={[0.07, 0.18, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* Back spikes */}
          <mesh position={[0, 0.15, -0.35]} rotation={[-0.6, 0, 0]}>
            <coneGeometry args={[0.12, 0.25, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.15, 0.1, -0.32]} rotation={[-0.5, 0.2, -0.2]}>
            <coneGeometry args={[0.1, 0.22, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
          <mesh position={[0.15, 0.1, -0.32]} rotation={[-0.5, -0.2, 0.2]}>
            <coneGeometry args={[0.1, 0.22, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>

          {/* Front bangs - messy style falling over forehead */}
          <mesh position={[0, -0.1, 0.4]} rotation={[0.6, 0, 0]}>
            <coneGeometry args={[0.12, 0.25, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.15, -0.08, 0.38]} rotation={[0.5, 0.2, 0.15]}>
            <coneGeometry args={[0.1, 0.22, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
          <mesh position={[0.15, -0.08, 0.38]} rotation={[0.5, -0.2, -0.15]}>
            <coneGeometry args={[0.1, 0.22, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.25, -0.12, 0.32]} rotation={[0.4, 0.3, 0.25]}>
            <coneGeometry args={[0.08, 0.18, 6]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.25, -0.12, 0.32]} rotation={[0.4, -0.3, -0.25]}>
            <coneGeometry args={[0.08, 0.18, 6]} />
            <meshStandardMaterial color={hairColorLight} roughness={0.9} />
          </mesh>
        </group>

        {/* ========== EYES - Confident/smug look ========== */}
        <group position={[0, 0, 0.38]}>
          {/* Left eye white */}
          <mesh position={[-0.15, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Left eye - brown/amber iris */}
          <mesh position={[-0.15, -0.01, 0.06]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={eyeColor} roughness={0.3} />
          </mesh>
          {/* Left pupil */}
          <mesh position={[-0.15, -0.01, 0.1]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#1a0f0a" roughness={0.2} />
          </mesh>
          {/* Left eye highlight */}
          <mesh position={[-0.12, 0.02, 0.12]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          {/* Left eyelid - confident/relaxed look */}
          <mesh position={[-0.15, 0.05, 0.05]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.14, 0.04, 0.1]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>

          {/* Right eye white */}
          <mesh position={[0.15, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Right eye - brown/amber iris */}
          <mesh position={[0.15, -0.01, 0.06]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={eyeColor} roughness={0.3} />
          </mesh>
          {/* Right pupil */}
          <mesh position={[0.15, -0.01, 0.1]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#1a0f0a" roughness={0.2} />
          </mesh>
          {/* Right eye highlight */}
          <mesh position={[0.18, 0.02, 0.12]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          {/* Right eyelid - confident/relaxed look */}
          <mesh position={[0.15, 0.05, 0.05]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.14, 0.04, 0.1]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
        </group>

        {/* Eyebrows - confident angle */}
        <mesh position={[-0.15, 0.15, 0.42]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.12, 0.025, 0.02]} />
          <meshStandardMaterial color={hairColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.15, 0.15, 0.42]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.12, 0.025, 0.02]} />
          <meshStandardMaterial color={hairColor} roughness={0.8} />
        </mesh>

        {/* Blush marks - pink circles on cheeks */}
        <mesh position={[-0.28, -0.08, 0.32]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#ff9999" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.28, -0.08, 0.32]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#ff9999" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>

        {/* Confident smile */}
        <mesh position={[0, -0.18, 0.42]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#d4a59a" />
        </mesh>
      </group>

      {/* ========== BODY - White traditional outfit ========== */}
      {/* Neck */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.15, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* Main torso - white robe/gi top */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.5, 16]} />
        <meshStandardMaterial color={robeColor} roughness={0.5} />
      </mesh>

      {/* Collar - V-neck style */}
      <mesh position={[-0.08, 0.05, 0.15]} rotation={[0.3, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.2, 0.03]} />
        <meshStandardMaterial color={robeColor} roughness={0.5} />
      </mesh>
      <mesh position={[0.08, 0.05, 0.15]} rotation={[0.3, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.2, 0.03]} />
        <meshStandardMaterial color={robeColor} roughness={0.5} />
      </mesh>

      {/* Belt/Obi - dark maroon/burgundy */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.12, 16]} />
        <meshStandardMaterial color={beltColor} roughness={0.6} />
      </mesh>
      {/* Belt knot */}
      <mesh position={[0, -0.3, 0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
        <meshStandardMaterial color={beltColor} roughness={0.6} />
      </mesh>

      {/* Hakama (wide pants/skirt) - white */}
      <mesh position={[0, -0.65, 0]}>
        <coneGeometry args={[0.4, 0.6, 8]} />
        <meshStandardMaterial color={robeColor} roughness={0.5} />
      </mesh>

      {/* ========== ARMS ========== */}
      {/* Left arm - sleeve */}
      <group position={[-0.32, -0.1, 0]}>
        <mesh rotation={[0, 0, 0.4]}>
          <capsuleGeometry args={[0.08, 0.2, 8, 8]} />
          <meshStandardMaterial color={robeColor} roughness={0.5} />
        </mesh>
        {/* Left hand */}
        <mesh position={[-0.12, -0.18, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Right arm - sleeve */}
      <group position={[0.32, -0.1, 0]}>
        <mesh rotation={[0, 0, -0.4]}>
          <capsuleGeometry args={[0.08, 0.2, 8, 8]} />
          <meshStandardMaterial color={robeColor} roughness={0.5} />
        </mesh>
        {/* Right hand */}
        <mesh position={[0.12, -0.18, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
      </group>

      {/* ========== FEET - peeking out from hakama ========== */}
      <mesh position={[-0.1, -0.95, 0.1]}>
        <boxGeometry args={[0.08, 0.03, 0.12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>
      <mesh position={[0.1, -0.95, 0.1]}>
        <boxGeometry args={[0.08, 0.03, 0.12]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
      </mesh>

      {/* Subtle glow effect */}
      <mesh scale={1.3}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.03} />
      </mesh>
    </group>
  );
}

// Scene component that handles mouse tracking
function Scene({ avoidRef }: { avoidRef?: React.RefObject<HTMLElement> }) {
  const { viewport } = useThree();
  const [targetPos, setTargetPos] = useState(new THREE.Vector3(2, 0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert screen coordinates to 3D world coordinates
      const x = ((e.clientX / window.innerWidth) * 2 - 1) * (viewport.width / 2);
      const y = (-(e.clientY / window.innerHeight) * 2 + 1) * (viewport.height / 2);

      // Check if cursor is over the form area
      if (avoidRef?.current) {
        const rect = avoidRef.current.getBoundingClientRect();
        const padding = 50;
        
        if (
          e.clientX > rect.left - padding &&
          e.clientX < rect.right + padding &&
          e.clientY > rect.top - padding &&
          e.clientY < rect.bottom + padding
        ) {
          // Position character outside the form area
          // Find which edge is closest and position there
          const distLeft = e.clientX - rect.left;
          const distRight = rect.right - e.clientX;
          const distTop = e.clientY - rect.top;
          const distBottom = rect.bottom - e.clientY;
          
          const minDist = Math.min(distLeft, distRight, distTop, distBottom);
          
          let newX = x;
          let newY = y;
          
          if (minDist === distLeft) {
            newX = ((rect.left - 100) / window.innerWidth * 2 - 1) * (viewport.width / 2);
          } else if (minDist === distRight) {
            newX = ((rect.right + 100) / window.innerWidth * 2 - 1) * (viewport.width / 2);
          } else if (minDist === distTop) {
            newY = (-((rect.top - 100) / window.innerHeight) * 2 + 1) * (viewport.height / 2);
          } else {
            newY = (-((rect.bottom + 100) / window.innerHeight) * 2 + 1) * (viewport.height / 2);
          }
          
          setTargetPos(new THREE.Vector3(newX, newY, 0));
          return;
        }
      }

      setTargetPos(new THREE.Vector3(x, y, 0));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [viewport, avoidRef]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-3, 3, 2]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[0, 2, 3]} intensity={0.8} color="#06b6d4" />

      {/* Sparkles around the character */}
      <Sparkles 
        count={30} 
        scale={4} 
        size={2} 
        speed={0.5} 
        color="#8b5cf6"
      />

      {/* The 3D Chibi Character */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <ChibiCharacter targetPosition={targetPos} />
      </Float>
    </>
  );
}

interface CursorCharacter3DProps {
  avoidRef?: React.RefObject<HTMLElement>;
}

const CursorCharacter3D: React.FC<CursorCharacter3DProps> = ({ avoidRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene avoidRef={avoidRef} />
      </Canvas>
    </div>
  );
};

export default CursorCharacter3D;
