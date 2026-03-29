"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { mascotSounds } from "./MascotSounds";

// ============================================================================
// TYPES
// ============================================================================
type MascotState = "idle" | "running" | "climbing" | "peeking" | "hiding" | "waving";
type InputFocus = "none" | "email" | "password";
type IdleBehavior = "none" | "look_around" | "wave" | "stretch" | "bounce" | "curious";

// ============================================================================
// TOON MATERIAL - Custom cartoon shader
// ============================================================================
function ToonMaterial({ color, emissive = "#000000" }: { color: string; emissive?: string }) {
  return (
    <meshToonMaterial 
      color={color} 
      emissive={emissive}
      emissiveIntensity={0.1}
    />
  );
}

// ============================================================================
// CHIBI CHARACTER - Enhanced with IK, blink, head tracking, idle behaviors
// ============================================================================
interface ChibiCharacterProps {
  state: MascotState;
  targetPosition: THREE.Vector3;
  cardBounds: { x: number; y: number; width: number; height: number } | null;
}

function ChibiCharacter({ state, targetPosition, cardBounds }: ChibiCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const legsRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);
  
  const currentPos = useRef(new THREE.Vector3(2, -1.5, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const runCycle = useRef(0);
  const idleTime = useRef(0);
  const isMoving = useRef(false);
  
  // Enhanced animation refs
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);
  const blinkProgress = useRef(0);
  const nextBlinkTime = useRef(Math.random() * 3 + 2); // Random 2-5 seconds
  const headTargetRotation = useRef(new THREE.Euler(0, 0, 0));
  const currentHeadRotation = useRef(new THREE.Euler(0, 0, 0));
  const idleBehavior = useRef<IdleBehavior>("none");
  const idleBehaviorTimer = useRef(0);
  const idleBehaviorProgress = useRef(0);
  const lastState = useRef<MascotState>("idle");
  const wasOnGround = useRef(true);
  const stepSoundTimer = useRef(0);

  // Colors from reference image
  const colors = {
    hair: "#3d2314",
    hairLight: "#5c3a2a",
    skin: "#ffe4c9",
    eyeWhite: "#ffffff",
    eyeIris: "#6b4423",
    eyePupil: "#1a0f0a",
    blush: "#ff8888",
    robe: "#f5f5f5",
    belt: "#6b1c23",
    hakama: "#e8e8e8",
  };

  useFrame((frameState, delta) => {
    if (!groupRef.current || !bodyRef.current) return;

    const time = frameState.clock.elapsedTime;
    let finalTarget = targetPosition.clone();
    
    // ========== SOUND EFFECTS ==========
    // Play sounds on state changes
    if (lastState.current !== state) {
      if (state === "climbing") {
        mascotSounds.playClimb();
      } else if (state === "hiding") {
        mascotSounds.playChirp();
      }
      lastState.current = state;
    }
    
    // ========== STATE-BASED POSITIONING ==========
    if (state === "climbing" || state === "peeking") {
      // Position on top-right of card area
      if (cardBounds) {
        finalTarget.set(cardBounds.x + cardBounds.width * 0.4, cardBounds.y + cardBounds.height * 0.5 + 0.3, 0);
      }
    } else if (state === "hiding") {
      // Position on card but hiding
      if (cardBounds) {
        finalTarget.set(cardBounds.x + cardBounds.width * 0.4, cardBounds.y + cardBounds.height * 0.5, 0);
      }
    }

    // ========== MOVEMENT PHYSICS ==========
    const direction = finalTarget.clone().sub(currentPos.current);
    const distance = direction.length();
    
    // Spring physics
    const springStrength = state === "climbing" ? 5 : 4;
    const damping = 0.82;
    
    velocity.current.add(direction.multiplyScalar(springStrength * delta));
    velocity.current.multiplyScalar(damping);
    
    // Add slight bounce when stopping
    if (distance < 0.1 && velocity.current.length() < 0.05) {
      velocity.current.y += Math.sin(time * 8) * 0.002;
    }
    
    currentPos.current.add(velocity.current);
    
    // Ground detection for landing sound
    const onGround = currentPos.current.y <= -1.4;
    if (!wasOnGround.current && onGround && velocity.current.y < -0.1) {
      mascotSounds.playLand();
    }
    wasOnGround.current = onGround;
    
    // Step sounds while running
    if (state === "running" && distance > 0.2) {
      stepSoundTimer.current += delta;
      if (stepSoundTimer.current > 0.25) {
        mascotSounds.playStep();
        stepSoundTimer.current = 0;
      }
    }
    groupRef.current.position.copy(currentPos.current);

    // Track if moving
    isMoving.current = velocity.current.length() > 0.03;

    // ========== HEAD LOOK-AT CURSOR ==========
    if (headRef.current && state !== "hiding") {
      // Calculate head rotation to look towards cursor/target
      const lookDir = finalTarget.clone().sub(currentPos.current);
      const headYaw = Math.atan2(lookDir.x, 2) * 0.4; // Horizontal look
      const headPitch = Math.atan2(lookDir.y - currentPos.current.y, 3) * 0.3; // Vertical look
      
      headTargetRotation.current.set(
        THREE.MathUtils.clamp(headPitch, -0.3, 0.3),
        THREE.MathUtils.clamp(headYaw, -0.5, 0.5),
        0
      );
      
      // Smooth head rotation
      currentHeadRotation.current.x = THREE.MathUtils.lerp(currentHeadRotation.current.x, headTargetRotation.current.x, 0.08);
      currentHeadRotation.current.y = THREE.MathUtils.lerp(currentHeadRotation.current.y, headTargetRotation.current.y, 0.08);
      
      headRef.current.rotation.copy(currentHeadRotation.current);
    }

    // ========== BLINK ANIMATION ==========
    blinkTimer.current += delta;
    if (blinkTimer.current >= nextBlinkTime.current && !isBlinking.current) {
      isBlinking.current = true;
      blinkProgress.current = 0;
    }
    
    if (isBlinking.current) {
      blinkProgress.current += delta * 8; // Blink speed
      
      // Blink curve: close then open
      let blinkAmount = 0;
      if (blinkProgress.current < 0.5) {
        blinkAmount = blinkProgress.current * 2; // Closing
      } else if (blinkProgress.current < 1) {
        blinkAmount = 1 - (blinkProgress.current - 0.5) * 2; // Opening
      } else {
        isBlinking.current = false;
        blinkTimer.current = 0;
        nextBlinkTime.current = Math.random() * 3 + 2; // Next blink in 2-5 seconds
      }
      
      // Apply to eyelids
      if (leftEyelidRef.current && rightEyelidRef.current) {
        const eyelidY = 0.045 - blinkAmount * 0.06;
        leftEyelidRef.current.position.y = eyelidY;
        rightEyelidRef.current.position.y = eyelidY;
        leftEyelidRef.current.scale.y = 1 + blinkAmount * 2;
        rightEyelidRef.current.scale.y = 1 + blinkAmount * 2;
      }
    }

    // ========== ROTATION - Face direction of movement ==========
    if (isMoving.current && state !== "hiding") {
      const targetRotation = Math.atan2(velocity.current.x, 0.5) * 0.5;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }

    // ========== RUNNING ANIMATION WITH IK LEGS ==========
    if (isMoving.current && legsRef.current && armsRef.current && leftLegRef.current && rightLegRef.current) {
      runCycle.current += delta * 15;
      
      // IK-inspired leg animation - legs reach towards ground
      const leftPhase = runCycle.current;
      const rightPhase = runCycle.current + Math.PI;
      
      // Upper leg rotation (hip)
      const leftHipAngle = Math.sin(leftPhase) * 0.5;
      const rightHipAngle = Math.sin(rightPhase) * 0.5;
      
      // Foot height offset (lift when swinging forward)
      const leftFootY = Math.max(0, Math.sin(leftPhase)) * 0.05;
      const rightFootY = Math.max(0, Math.sin(rightPhase)) * 0.05;
      
      // Apply to legs
      leftLegRef.current.rotation.x = leftHipAngle;
      rightLegRef.current.rotation.x = rightHipAngle;
      leftLegRef.current.position.y = leftFootY;
      rightLegRef.current.position.y = rightFootY;
      
      // Arm swing (opposite to legs)
      const armSwing = Math.sin(runCycle.current) * 0.35;
      armsRef.current.children[0].rotation.x = -armSwing;
      armsRef.current.children[1].rotation.x = armSwing;
      armsRef.current.children[0].rotation.z = 0.4 + Math.abs(armSwing) * 0.1;
      armsRef.current.children[1].rotation.z = -0.4 - Math.abs(armSwing) * 0.1;
      
      // Body bounce and tilt
      bodyRef.current.position.y = Math.abs(Math.sin(runCycle.current * 2)) * 0.06;
      bodyRef.current.rotation.z = Math.sin(runCycle.current) * 0.06;
      bodyRef.current.rotation.x = 0.1; // Lean forward while running
    } else {
      // Reset to idle pose smoothly
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
        leftLegRef.current.position.y = THREE.MathUtils.lerp(leftLegRef.current.position.y, 0, 0.1);
        rightLegRef.current.position.y = THREE.MathUtils.lerp(rightLegRef.current.position.y, 0, 0.1);
      }
      if (armsRef.current) {
        armsRef.current.children[0].rotation.x = THREE.MathUtils.lerp(armsRef.current.children[0].rotation.x, 0, 0.1);
        armsRef.current.children[1].rotation.x = THREE.MathUtils.lerp(armsRef.current.children[1].rotation.x, 0, 0.1);
        armsRef.current.children[0].rotation.z = THREE.MathUtils.lerp(armsRef.current.children[0].rotation.z, 0.4, 0.1);
        armsRef.current.children[1].rotation.z = THREE.MathUtils.lerp(armsRef.current.children[1].rotation.z, -0.4, 0.1);
      }
      if (bodyRef.current) {
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
      }
    }

    // ========== RANDOM IDLE BEHAVIORS ==========
    if (!isMoving.current && state === "idle") {
      idleTime.current += delta;
      idleBehaviorTimer.current += delta;
      
      // Trigger random idle behavior every 4-8 seconds
      if (idleBehavior.current === "none" && idleBehaviorTimer.current > 4 + Math.random() * 4) {
        const behaviors: IdleBehavior[] = ["look_around", "wave", "stretch", "bounce", "curious"];
        idleBehavior.current = behaviors[Math.floor(Math.random() * behaviors.length)];
        idleBehaviorProgress.current = 0;
        idleBehaviorTimer.current = 0;
        
        // Play chirp for some behaviors
        if (idleBehavior.current === "wave" || idleBehavior.current === "curious") {
          mascotSounds.playChirp();
        }
      }
      
      // Execute idle behaviors
      if (idleBehavior.current !== "none") {
        idleBehaviorProgress.current += delta;
        const progress = idleBehaviorProgress.current;
        
        switch (idleBehavior.current) {
          case "look_around":
            // Look left, then right
            if (headRef.current) {
              const lookPhase = Math.sin(progress * 2) * 0.4;
              headRef.current.rotation.y = lookPhase;
            }
            if (progress > 3) idleBehavior.current = "none";
            break;
            
          case "wave":
            // Wave with right arm
            if (armsRef.current && armsRef.current.children[1]) {
              const waveAngle = Math.sin(progress * 10) * 0.3;
              armsRef.current.children[1].rotation.z = -1.2 + waveAngle;
              armsRef.current.children[1].rotation.x = -0.5;
            }
            if (progress > 2) {
              idleBehavior.current = "none";
              if (armsRef.current?.children[1]) {
                armsRef.current.children[1].rotation.z = -0.4;
                armsRef.current.children[1].rotation.x = 0;
              }
            }
            break;
            
          case "stretch":
            // Stretch up
            if (bodyRef.current) {
              const stretchAmount = Math.sin(progress * Math.PI / 2) * 0.1;
              bodyRef.current.position.y = stretchAmount;
              bodyRef.current.scale.y = 1 + stretchAmount * 0.5;
            }
            if (armsRef.current) {
              const armRaise = Math.sin(progress * Math.PI / 2);
              armsRef.current.children[0].rotation.z = 0.4 + armRaise * 1.2;
              armsRef.current.children[1].rotation.z = -0.4 - armRaise * 1.2;
            }
            if (progress > 2) {
              idleBehavior.current = "none";
              if (bodyRef.current) bodyRef.current.scale.y = 1;
            }
            break;
            
          case "bounce":
            // Excited bounce
            if (bodyRef.current) {
              const bounceHeight = Math.abs(Math.sin(progress * 8)) * 0.15;
              bodyRef.current.position.y = bounceHeight;
            }
            // Small jump sound
            if (Math.floor(progress * 8) % 2 === 0 && progress > 0.1 && Math.floor((progress - delta) * 8) !== Math.floor(progress * 8)) {
              mascotSounds.playStep();
            }
            if (progress > 1.5) idleBehavior.current = "none";
            break;
            
          case "curious":
            // Head tilt curious look
            if (headRef.current) {
              const tilt = Math.sin(progress * 2) * 0.25;
              headRef.current.rotation.z = tilt;
              headRef.current.rotation.x = 0.15;
            }
            if (progress > 2) {
              idleBehavior.current = "none";
              if (headRef.current) headRef.current.rotation.z = 0;
            }
            break;
        }
      } else {
        // Default gentle breathing/swaying
        bodyRef.current.position.y = Math.sin(time * 2) * 0.03;
        bodyRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;
      }
    }

    // ========== EYE ANIMATIONS ==========
    if (eyesRef.current) {
      if (state === "hiding") {
        // Covering eyes - move hands up (we'll animate the arms instead)
        eyesRef.current.visible = false;
      } else {
        eyesRef.current.visible = true;
        
        // Eyes follow cursor slightly
        if (state !== "climbing" && state !== "peeking") {
          const lookX = THREE.MathUtils.clamp(direction.x * 0.1, -0.03, 0.03);
          const lookY = THREE.MathUtils.clamp(direction.y * 0.1, -0.02, 0.02);
          eyesRef.current.position.x = THREE.MathUtils.lerp(eyesRef.current.position.x, lookX, 0.1);
          eyesRef.current.position.y = THREE.MathUtils.lerp(eyesRef.current.position.y, lookY, 0.1);
        }
      }
    }

    // ========== SPECIAL STATE ANIMATIONS ==========
    if (state === "climbing") {
      // Peeking pose - lean forward
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0.3, 0.1);
    } else if (state === "hiding") {
      // Arms up covering eyes
      if (armsRef.current) {
        armsRef.current.children[0].rotation.x = THREE.MathUtils.lerp(armsRef.current.children[0].rotation.x, -2.5, 0.15);
        armsRef.current.children[1].rotation.x = THREE.MathUtils.lerp(armsRef.current.children[1].rotation.x, -2.5, 0.15);
        armsRef.current.children[0].rotation.z = THREE.MathUtils.lerp(armsRef.current.children[0].rotation.z, 0.5, 0.15);
        armsRef.current.children[1].rotation.z = THREE.MathUtils.lerp(armsRef.current.children[1].rotation.z, -0.5, 0.15);
      }
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
    } else {
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, 0.1);
      if (armsRef.current && !isMoving.current) {
        armsRef.current.children[0].rotation.z = THREE.MathUtils.lerp(armsRef.current.children[0].rotation.z, 0.4, 0.1);
        armsRef.current.children[1].rotation.z = THREE.MathUtils.lerp(armsRef.current.children[1].rotation.z, -0.4, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} scale={0.5}>
      {/* Shadow */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>

      <group ref={bodyRef}>
        {/* ========== HEAD ========== */}
        <group ref={headRef} position={[0, 0.55, 0]}>
          {/* Face */}
          <mesh>
            <sphereGeometry args={[0.45, 32, 32]} />
            <ToonMaterial color={colors.skin} />
          </mesh>

          {/* ========== HAIR ========== */}
          <group position={[0, 0.12, 0]}>
            {/* Hair base */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.48, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
              <ToonMaterial color={colors.hair} />
            </mesh>

            {/* Top spikes */}
            {[
              { pos: [0, 0.38, 0], rot: [0, 0, 0.1], scale: [0.12, 0.32, 0.12] },
              { pos: [-0.12, 0.35, 0.05], rot: [0.2, 0, -0.35], scale: [0.1, 0.28, 0.1] },
              { pos: [0.15, 0.33, 0], rot: [-0.1, 0, 0.4], scale: [0.09, 0.26, 0.09] },
              { pos: [0.05, 0.4, -0.08], rot: [0.25, 0, 0.15], scale: [0.08, 0.24, 0.08] },
              { pos: [-0.08, 0.38, -0.06], rot: [0.2, 0, -0.1], scale: [0.09, 0.25, 0.09] },
            ].map((spike, i) => (
              <mesh key={`top-${i}`} position={spike.pos as [number, number, number]} rotation={spike.rot as [number, number, number]}>
                <coneGeometry args={[spike.scale[0], spike.scale[1], 6]} />
                <ToonMaterial color={i % 2 === 0 ? colors.hair : colors.hairLight} />
              </mesh>
            ))}

            {/* Side spikes - Left */}
            {[
              { pos: [-0.38, 0.08, 0.1], rot: [0.3, 0.3, -0.75], scale: [0.09, 0.22, 0.09] },
              { pos: [-0.35, 0.18, 0.05], rot: [0.1, 0.2, -0.55], scale: [0.08, 0.2, 0.08] },
              { pos: [-0.32, -0.02, 0.12], rot: [0.4, 0.15, -0.85], scale: [0.07, 0.18, 0.07] },
            ].map((spike, i) => (
              <mesh key={`left-${i}`} position={spike.pos as [number, number, number]} rotation={spike.rot as [number, number, number]}>
                <coneGeometry args={[spike.scale[0], spike.scale[1], 6]} />
                <ToonMaterial color={i % 2 === 0 ? colors.hair : colors.hairLight} />
              </mesh>
            ))}

            {/* Side spikes - Right */}
            {[
              { pos: [0.38, 0.08, 0.1], rot: [0.3, -0.3, 0.75], scale: [0.09, 0.22, 0.09] },
              { pos: [0.35, 0.18, 0.05], rot: [0.1, -0.2, 0.55], scale: [0.08, 0.2, 0.08] },
              { pos: [0.32, -0.02, 0.12], rot: [0.4, -0.15, 0.85], scale: [0.07, 0.18, 0.07] },
            ].map((spike, i) => (
              <mesh key={`right-${i}`} position={spike.pos as [number, number, number]} rotation={spike.rot as [number, number, number]}>
                <coneGeometry args={[spike.scale[0], spike.scale[1], 6]} />
                <ToonMaterial color={i % 2 === 0 ? colors.hairLight : colors.hair} />
              </mesh>
            ))}

            {/* Front bangs */}
            {[
              { pos: [0, -0.08, 0.38], rot: [0.55, 0, 0], scale: [0.11, 0.22, 0.11] },
              { pos: [-0.14, -0.06, 0.35], rot: [0.45, 0.15, 0.1], scale: [0.09, 0.2, 0.09] },
              { pos: [0.14, -0.06, 0.35], rot: [0.45, -0.15, -0.1], scale: [0.09, 0.2, 0.09] },
              { pos: [-0.24, -0.1, 0.3], rot: [0.35, 0.25, 0.2], scale: [0.07, 0.16, 0.07] },
              { pos: [0.24, -0.1, 0.3], rot: [0.35, -0.25, -0.2], scale: [0.07, 0.16, 0.07] },
            ].map((spike, i) => (
              <mesh key={`bang-${i}`} position={spike.pos as [number, number, number]} rotation={spike.rot as [number, number, number]}>
                <coneGeometry args={[spike.scale[0], spike.scale[1], 6]} />
                <ToonMaterial color={i % 2 === 0 ? colors.hair : colors.hairLight} />
              </mesh>
            ))}

            {/* Back spikes */}
            {[
              { pos: [0, 0.12, -0.35], rot: [-0.55, 0, 0], scale: [0.1, 0.22, 0.1] },
              { pos: [-0.12, 0.08, -0.32], rot: [-0.45, 0.15, -0.15], scale: [0.09, 0.2, 0.09] },
              { pos: [0.12, 0.08, -0.32], rot: [-0.45, -0.15, 0.15], scale: [0.09, 0.2, 0.09] },
            ].map((spike, i) => (
              <mesh key={`back-${i}`} position={spike.pos as [number, number, number]} rotation={spike.rot as [number, number, number]}>
                <coneGeometry args={[spike.scale[0], spike.scale[1], 6]} />
                <ToonMaterial color={colors.hair} />
              </mesh>
            ))}
          </group>

          {/* ========== EYES ========== */}
          <group ref={eyesRef} position={[0, 0, 0.35]}>
            {/* Left eye */}
            <group position={[-0.14, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.095, 16, 16]} />
                <ToonMaterial color={colors.eyeWhite} />
              </mesh>
              <mesh position={[0, -0.01, 0.05]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <ToonMaterial color={colors.eyeIris} />
              </mesh>
              <mesh position={[0, -0.01, 0.085]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshBasicMaterial color={colors.eyePupil} />
              </mesh>
              <mesh position={[0.025, 0.025, 0.1]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Eyelid for blink animation */}
              <mesh ref={leftEyelidRef} position={[0, 0.045, 0.04]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.08]} />
                <ToonMaterial color={colors.skin} />
              </mesh>
            </group>

            {/* Right eye */}
            <group position={[0.14, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.095, 16, 16]} />
                <ToonMaterial color={colors.eyeWhite} />
              </mesh>
              <mesh position={[0, -0.01, 0.05]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <ToonMaterial color={colors.eyeIris} />
              </mesh>
              <mesh position={[0, -0.01, 0.085]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshBasicMaterial color={colors.eyePupil} />
              </mesh>
              <mesh position={[0.025, 0.025, 0.1]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Eyelid for blink animation */}
              <mesh ref={rightEyelidRef} position={[0, 0.045, 0.04]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[0.12, 0.04, 0.08]} />
                <ToonMaterial color={colors.skin} />
              </mesh>
            </group>
          </group>

          {/* Eyebrows - confident angle */}
          <mesh position={[-0.14, 0.12, 0.4]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.1, 0.022, 0.015]} />
            <ToonMaterial color={colors.hair} />
          </mesh>
          <mesh position={[0.14, 0.12, 0.4]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.1, 0.022, 0.015]} />
            <ToonMaterial color={colors.hair} />
          </mesh>

          {/* Blush */}
          <mesh position={[-0.25, -0.08, 0.35]}>
            <circleGeometry args={[0.055, 16]} />
            <meshBasicMaterial color={colors.blush} transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.25, -0.08, 0.35]}>
            <circleGeometry args={[0.055, 16]} />
            <meshBasicMaterial color={colors.blush} transparent opacity={0.5} />
          </mesh>

          {/* Smile */}
          <mesh position={[0, -0.16, 0.4]} rotation={[0.1, 0, 0]}>
            <torusGeometry args={[0.055, 0.012, 8, 16, Math.PI]} />
            <ToonMaterial color="#c9967a" />
          </mesh>
        </group>

        {/* ========== BODY ========== */}
        {/* Neck */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
          <ToonMaterial color={colors.skin} />
        </mesh>

        {/* Torso - white gi */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 0.45, 16]} />
          <ToonMaterial color={colors.robe} />
        </mesh>

        {/* Collar V-shape */}
        <mesh position={[-0.07, 0.08, 0.14]} rotation={[0.3, 0.25, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.025]} />
          <ToonMaterial color={colors.robe} />
        </mesh>
        <mesh position={[0.07, 0.08, 0.14]} rotation={[0.3, -0.25, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.025]} />
          <ToonMaterial color={colors.robe} />
        </mesh>

        {/* Belt/Obi */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.1, 16]} />
          <ToonMaterial color={colors.belt} />
        </mesh>
        <mesh position={[0, -0.25, 0.22]}>
          <boxGeometry args={[0.08, 0.07, 0.06]} />
          <ToonMaterial color={colors.belt} />
        </mesh>

        {/* Hakama (wide pants) */}
        <mesh position={[0, -0.58, 0]}>
          <coneGeometry args={[0.38, 0.55, 8]} />
          <ToonMaterial color={colors.hakama} />
        </mesh>

        {/* ========== ARMS ========== */}
        <group ref={armsRef}>
          {/* Left arm */}
          <group position={[-0.28, -0.05, 0]}>
            <mesh rotation={[0, 0, 0.4]}>
              <capsuleGeometry args={[0.065, 0.18, 8, 8]} />
              <ToonMaterial color={colors.robe} />
            </mesh>
            <mesh position={[-0.1, -0.16, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <ToonMaterial color={colors.skin} />
            </mesh>
          </group>

          {/* Right arm */}
          <group position={[0.28, -0.05, 0]}>
            <mesh rotation={[0, 0, -0.4]}>
              <capsuleGeometry args={[0.065, 0.18, 8, 8]} />
              <ToonMaterial color={colors.robe} />
            </mesh>
            <mesh position={[0.1, -0.16, 0]}>
              <sphereGeometry args={[0.055, 16, 16]} />
              <ToonMaterial color={colors.skin} />
            </mesh>
          </group>
        </group>

        {/* ========== LEGS ========== */}
        <group ref={legsRef} position={[0, -0.75, 0]}>
          {/* Left leg */}
          <group ref={leftLegRef} position={[-0.1, 0, 0]}>
            <mesh>
              <capsuleGeometry args={[0.06, 0.15, 8, 8]} />
              <ToonMaterial color={colors.hakama} />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.15, 0.03]}>
              <boxGeometry args={[0.07, 0.03, 0.1]} />
              <ToonMaterial color="#f0f0f0" />
            </mesh>
          </group>

          {/* Right leg */}
          <group ref={rightLegRef} position={[0.1, 0, 0]}>
            <mesh>
              <capsuleGeometry args={[0.06, 0.15, 8, 8]} />
              <ToonMaterial color={colors.hakama} />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.15, 0.03]}>
              <boxGeometry args={[0.07, 0.03, 0.1]} />
              <ToonMaterial color="#f0f0f0" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// ============================================================================
// SCENE - Main 3D scene with character
// ============================================================================
interface SceneProps {
  inputFocus: InputFocus;
  cardRef: React.RefObject<HTMLElement> | null;
}

function Scene({ inputFocus, cardRef }: SceneProps) {
  const { viewport } = useThree();
  const [targetPos, setTargetPos] = useState(new THREE.Vector3(2, -1.5, 0));
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [cardBounds, setCardBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const lastMouseMove = useRef(Date.now());

  // Update card bounds
  useEffect(() => {
    const updateCardBounds = () => {
      if (cardRef?.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((rect.left + rect.width / 2) / window.innerWidth * 2 - 1) * (viewport.width / 2);
        const y = (-(rect.top + rect.height / 2) / window.innerHeight * 2 + 1) * (viewport.height / 2);
        const width = (rect.width / window.innerWidth) * viewport.width;
        const height = (rect.height / window.innerHeight) * viewport.height;
        setCardBounds({ x, y, width, height });
      }
    };
    
    updateCardBounds();
    window.addEventListener("resize", updateCardBounds);
    return () => window.removeEventListener("resize", updateCardBounds);
  }, [cardRef, viewport]);

  // Handle input focus states
  useEffect(() => {
    if (inputFocus === "email") {
      setMascotState("climbing");
    } else if (inputFocus === "password") {
      setMascotState("hiding");
    } else {
      setMascotState("idle");
    }
  }, [inputFocus]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (inputFocus !== "none") return; // Don't follow cursor when focused on input
      
      lastMouseMove.current = Date.now();
      
      const x = ((e.clientX / window.innerWidth) * 2 - 1) * (viewport.width / 2);
      const y = (-(e.clientY / window.innerHeight) * 2 + 1) * (viewport.height / 2);

      // Keep character at bottom portion of screen, running along
      const clampedY = Math.min(y, -0.5);
      
      // Avoid the card area
      if (cardBounds) {
        const inCardX = x > cardBounds.x - cardBounds.width / 2 - 0.5 && 
                       x < cardBounds.x + cardBounds.width / 2 + 0.5;
        const inCardY = clampedY > cardBounds.y - cardBounds.height / 2 - 0.5 && 
                       clampedY < cardBounds.y + cardBounds.height / 2 + 0.5;
        
        if (inCardX && inCardY) {
          // Position to the side of the card
          const newX = x < cardBounds.x ? cardBounds.x - cardBounds.width / 2 - 0.7 : cardBounds.x + cardBounds.width / 2 + 0.7;
          setTargetPos(new THREE.Vector3(newX, clampedY, 0));
          return;
        }
      }

      setTargetPos(new THREE.Vector3(x, clampedY, 0));
      setMascotState("running");
    };

    const handleMouseStop = () => {
      if (Date.now() - lastMouseMove.current > 500 && inputFocus === "none") {
        setMascotState("idle");
      }
    };

    const interval = setInterval(handleMouseStop, 500);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, [viewport, cardBounds, inputFocus]);

  return (
    <>
      {/* Lighting - soft and cute */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} color="#ffffff" castShadow />
      <directionalLight position={[-3, 4, 3]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[0, 3, 4]} intensity={0.5} color="#06b6d4" />

      {/* Sparkles for magic effect */}
      <Sparkles 
        count={20} 
        scale={5} 
        size={1.5} 
        speed={0.3} 
        color="#8b5cf6"
        opacity={0.5}
      />

      {/* Ground plane for shadow */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* The Character */}
      <Float speed={1} rotationIntensity={0} floatIntensity={inputFocus === "none" ? 0.1 : 0}>
        <ChibiCharacter 
          state={mascotState} 
          targetPosition={targetPos}
          cardBounds={cardBounds}
        />
      </Float>
    </>
  );
}

// ============================================================================
// LOGIN MASCOT - Main exported component
// ============================================================================
export interface LoginMascotProps {
  inputFocus?: InputFocus;
  cardRef?: React.RefObject<HTMLElement>;
}

const LoginMascot: React.FC<LoginMascotProps> = ({ 
  inputFocus = "none",
  cardRef = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        shadows
      >
        <Scene inputFocus={inputFocus} cardRef={cardRef} />
      </Canvas>
    </div>
  );
};

export default LoginMascot;
export type { InputFocus };
