import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus, Icosahedron, Ring, Plane, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Floating Sphere with gradient material
function FloatingSphere({ position, color, speed = 1, distort = 0.3, scale = 1 }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

// Floating Torus
function FloatingTorus({ position, color, scale = 1 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
      <Torus ref={meshRef} args={[1, 0.4, 32, 64]} position={position} scale={scale}>
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </Torus>
    </Float>
  );
}

// Floating Icosahedron (Geometric crystal shape)
function FloatingCrystal({ position, color, scale = 1 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={1.5} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[1, 0]} position={position} scale={scale}>
        <meshStandardMaterial
          color={color}
          roughness={0}
          metalness={1}
          transparent
          opacity={0.7}
          wireframe
        />
      </Icosahedron>
    </Float>
  );
}

// Floating Box with wobble
function FloatingBox({ position, color, scale = 1 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Box ref={meshRef} args={[1, 1, 1]} position={position} scale={scale}>
        <MeshWobbleMaterial
          color={color}
          attach="material"
          factor={0.2}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Box>
    </Float>
  );
}

// Particle field background
function ParticleField() {
  const count = 500;
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      // Purple to cyan gradient
      const t = Math.random();
      colors[i * 3] = 0.55 + t * 0.02; // R
      colors[i * 3 + 1] = 0.36 - t * 0.1; // G
      colors[i * 3 + 2] = 0.96 - t * 0.13; // B
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.02;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Mouse follow camera with enhanced parallax
function CameraRig({ intensity = 2 }: { intensity?: number }) {
  const { camera, mouse } = useThree();
  const target = useRef(new THREE.Vector3());
  
  useFrame((state) => {
    // Smooth camera movement following mouse
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * intensity, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * intensity + 0.5, 0.03);
    
    // Subtle breathing effect
    camera.position.z = 15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    
    // Look slightly ahead of center for depth
    target.current.set(mouse.x * 0.5, mouse.y * 0.5, 0);
    camera.lookAt(target.current);
  });

  return null;
}

// Glowing animated ring
function GlowingRing({ position, color, scale = 1 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      // Pulsing scale
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={1.5} floatIntensity={1}>
      <Ring ref={meshRef} args={[0.8, 1, 64]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </Ring>
    </Float>
  );
}

// Gradient background plane
function GradientBackground() {
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#0a0a0f');
    gradient.addColorStop(1, '#050508');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <Plane args={[100, 100]} position={[0, 0, -30]}>
      <meshBasicMaterial map={gradientTexture} />
    </Plane>
  );
}

// Main 3D Scene component
export function Scene3D({ intensity = 2 }: { intensity?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0a0a0f']} />
      
      {/* Gradient background */}
      <GradientBackground />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[10, -10, 10]} intensity={0.6} color="#06b6d4" />
      <pointLight position={[0, 10, 5]} intensity={0.4} color="#a855f7" />
      
      {/* Sparkle particles */}
      <Sparkles count={100} scale={20} size={2} speed={0.4} opacity={0.5} color="#8b5cf6" />
      
      {/* 3D Objects */}
      <FloatingSphere position={[-4, 2, -2]} color="#8b5cf6" scale={1.5} distort={0.4} />
      <FloatingSphere position={[4, -1, -3]} color="#06b6d4" scale={1} distort={0.3} />
      <FloatingSphere position={[0, 3, -5]} color="#a855f7" scale={0.8} distort={0.5} />
      
      <FloatingTorus position={[5, 2, -4]} color="#8b5cf6" scale={0.8} />
      <FloatingTorus position={[-5, -2, -6]} color="#06b6d4" scale={0.6} />
      
      {/* Glowing rings */}
      <GlowingRing position={[-2, -1, -3]} color="#8b5cf6" scale={0.7} />
      <GlowingRing position={[3, 2, -5]} color="#06b6d4" scale={0.5} />
      
      <FloatingCrystal position={[-3, -3, -4]} color="#a855f7" scale={1.2} />
      <FloatingCrystal position={[3, 3, -6]} color="#22d3ee" scale={0.9} />
      
      <FloatingBox position={[6, -3, -5]} color="#7c3aed" scale={0.7} />
      <FloatingBox position={[-6, 1, -7]} color="#0891b2" scale={0.5} />
      
      {/* Particle background */}
      <ParticleField />
      
      {/* Camera follows mouse with enhanced parallax */}
      <CameraRig intensity={intensity} />
    </Canvas>
  );
}

// Mini scene for section backgrounds
export function MiniScene({ variant = 'spheres' }: { variant?: 'spheres' | 'crystals' | 'boxes' | 'rings' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-5, -5, 5]} intensity={0.6} color="#06b6d4" />
      
      <Sparkles count={30} scale={10} size={1.5} speed={0.3} opacity={0.4} color="#a855f7" />
      
      {variant === 'spheres' && (
        <>
          <FloatingSphere position={[-3, 1, 0]} color="#8b5cf6" scale={0.6} />
          <FloatingSphere position={[3, -1, 0]} color="#06b6d4" scale={0.5} />
        </>
      )}
      
      {variant === 'crystals' && (
        <>
          <FloatingCrystal position={[-2, 0, 0]} color="#a855f7" scale={0.8} />
          <FloatingCrystal position={[2, 0, 0]} color="#22d3ee" scale={0.6} />
        </>
      )}
      
      {variant === 'boxes' && (
        <>
          <FloatingBox position={[-2, 1, 0]} color="#7c3aed" scale={0.5} />
          <FloatingBox position={[2, -1, 0]} color="#0891b2" scale={0.4} />
        </>
      )}
      
      {variant === 'rings' && (
        <>
          <GlowingRing position={[-2, 0, 0]} color="#8b5cf6" scale={0.6} />
          <GlowingRing position={[2, 0, 0]} color="#06b6d4" scale={0.5} />
        </>
      )}
      
      <CameraRig intensity={1} />
    </Canvas>
  );
}

// Floating shapes scene for backgrounds
export function FloatingShapesScene({ count = 8 }: { count?: number }) {
  const shapes = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const type = ['sphere', 'torus', 'crystal', 'box', 'ring'][Math.floor(Math.random() * 5)];
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 5,
      ];
      const color = ['#8b5cf6', '#06b6d4', '#a855f7', '#22d3ee', '#7c3aed'][Math.floor(Math.random() * 5)];
      const scale = 0.3 + Math.random() * 0.5;
      items.push({ type, position, color, scale, id: i });
    }
    return items;
  }, [count]);

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 55 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[-10, -10, 10]} intensity={0.6} color="#06b6d4" />
      
      <Sparkles count={50} scale={15} size={1.2} speed={0.2} opacity={0.3} color="#a855f7" />
      
      {shapes.map((shape) => {
        switch (shape.type) {
          case 'sphere':
            return <FloatingSphere key={shape.id} position={shape.position} color={shape.color} scale={shape.scale} />;
          case 'torus':
            return <FloatingTorus key={shape.id} position={shape.position} color={shape.color} scale={shape.scale} />;
          case 'crystal':
            return <FloatingCrystal key={shape.id} position={shape.position} color={shape.color} scale={shape.scale} />;
          case 'box':
            return <FloatingBox key={shape.id} position={shape.position} color={shape.color} scale={shape.scale} />;
          case 'ring':
            return <GlowingRing key={shape.id} position={shape.position} color={shape.color} scale={shape.scale} />;
          default:
            return null;
        }
      })}
      
      <CameraRig intensity={1.5} />
    </Canvas>
  );
}

export default Scene3D;
