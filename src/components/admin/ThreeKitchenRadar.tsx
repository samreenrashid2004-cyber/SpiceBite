import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Compass, RotateCw } from 'lucide-react';

export const ThreeKitchenRadar: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Renderer setup with PBR Tone Mapping
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.5);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xff8833, 0x0a1026, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffa24c, 2.4);
    keyLight.position.set(4, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff4500, 2.0, 10);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // 3. Composite 3-12 Part Procedural Model: SpiceBite Royal Handi & Dispatch Hub (THREE.Group)
    const hubGroup = new THREE.Group();
    scene.add(hubGroup);

    // Base Radial Ground Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    hubGroup.add(shadowMesh);

    // Part 1: Circular Glowing Radar Pedestal Platform
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.14, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x181c2b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.07;
    pedestal.receiveShadow = true;
    hubGroup.add(pedestal);

    // Part 2: Inner Brass Trim Ring
    const ringGeo = new THREE.TorusGeometry(1.45, 0.025, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });
    const brassRing = new THREE.Mesh(ringGeo, ringMat);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = 0.145;
    hubGroup.add(brassRing);

    // Part 3: Royal Clay Handi (Biryani Handi) Base
    const handiPoints: THREE.Vector2[] = [];
    handiPoints.push(new THREE.Vector2(0.0, 0.0));
    handiPoints.push(new THREE.Vector2(0.42, 0.0));
    handiPoints.push(new THREE.Vector2(0.68, 0.22));
    handiPoints.push(new THREE.Vector2(0.78, 0.48));
    handiPoints.push(new THREE.Vector2(0.72, 0.72));
    handiPoints.push(new THREE.Vector2(0.55, 0.88));
    handiPoints.push(new THREE.Vector2(0.62, 0.94));
    handiPoints.push(new THREE.Vector2(0.58, 1.0));

    const handiGeo = new THREE.LatheGeometry(handiPoints, 36);
    const handiMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // Rich terracotta clay
      roughness: 0.65,
      metalness: 0.1,
    });
    const handiMesh = new THREE.Mesh(handiGeo, handiMat);
    handiMesh.position.y = 0.14;
    handiMesh.castShadow = true;
    handiMesh.receiveShadow = true;
    hubGroup.add(handiMesh);

    // Part 4: Handi Golden Rim Collar
    const collarGeo = new THREE.TorusGeometry(0.60, 0.045, 16, 36);
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
    });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.08;
    hubGroup.add(collar);

    // Part 5: Handi Lid (Dum Purdah Sealing)
    const lidGeo = new THREE.ConeGeometry(0.58, 0.28, 32);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      roughness: 0.55,
      metalness: 0.15,
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 1.22;
    lid.castShadow = true;
    hubGroup.add(lid);

    // Part 6: Handi Top Brass Finial Handle
    const finialGeo = new THREE.SphereGeometry(0.09, 20, 20);
    const finialMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const finial = new THREE.Mesh(finialGeo, finialMat);
    finial.position.y = 1.42;
    hubGroup.add(finial);

    // Part 7 & 8: Brass Side Ring Handles (Left & Right)
    const handleGeo = new THREE.TorusGeometry(0.12, 0.024, 12, 24, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
    });

    const leftHandle = new THREE.Mesh(handleGeo, handleMat);
    leftHandle.position.set(-0.73, 0.72, 0);
    leftHandle.rotation.z = Math.PI / 2;
    hubGroup.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, handleMat);
    rightHandle.position.set(0.73, 0.72, 0);
    rightHandle.rotation.z = -Math.PI / 2;
    hubGroup.add(rightHandle);

    // Part 9: Floating Dispatch Orbit Node 1 (Zinger Burger Beacon)
    const zingerOrbit = new THREE.Group();
    const zingerNodeGeo = new THREE.SphereGeometry(0.11, 16, 16);
    const zingerNodeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.8,
      metalness: 0.6,
      roughness: 0.3,
    });
    const zingerNode = new THREE.Mesh(zingerNodeGeo, zingerNodeMat);
    zingerNode.position.set(1.4, 0.75, 0);
    zingerOrbit.add(zingerNode);
    hubGroup.add(zingerOrbit);

    // Part 10: Floating Dispatch Orbit Node 2 (Darjeeling Momos Beacon)
    const momoOrbit = new THREE.Group();
    const momoNodeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const momoNodeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.3,
    });
    const momoNode = new THREE.Mesh(momoNodeGeo, momoNodeMat);
    momoNode.position.set(-1.3, 0.95, 0.4);
    momoOrbit.add(momoNode);
    hubGroup.add(momoOrbit);

    // Part 11: Aromatic Steam / Embers Particles
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number; resetY: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = 1.35 + Math.random() * 0.9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      velocities.push({
        x: (Math.random() - 0.5) * 0.004,
        y: 0.005 + Math.random() * 0.008,
        z: (Math.random() - 0.5) * 0.004,
        resetY: 1.35,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    hubGroup.add(particles);

    // 4. Smooth Lossless Animation Loop with Clock Damping
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Damped rotation of main group
      if (isRotating) {
        hubGroup.rotation.y += delta * 0.42;
      }

      // Independent counter-rotation for dispatch beacons
      zingerOrbit.rotation.y += delta * 0.9;
      zingerNode.position.y = 0.75 + Math.sin(elapsed * 2.5) * 0.08;

      momoOrbit.rotation.y -= delta * 0.7;
      momoNode.position.y = 0.95 + Math.cos(elapsed * 2.2) * 0.07;

      // Subtle breathing scale on lid
      lid.position.y = 1.22 + Math.sin(elapsed * 4.0) * 0.01;

      // Animate aromatic particles upward
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 0] += velocities[i].x;
        posArr[i * 3 + 2] += velocities[i].z;

        if (posArr[i * 3 + 1] > 2.6) {
          posArr[i * 3 + 1] = velocities[i].resetY;
          posArr[i * 3 + 0] = (Math.random() - 0.5) * 0.35;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 5. Clean Resource Disposal on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose geometries
      pedestalGeo.dispose();
      ringGeo.dispose();
      handiGeo.dispose();
      collarGeo.dispose();
      lidGeo.dispose();
      finialGeo.dispose();
      handleGeo.dispose();
      zingerNodeGeo.dispose();
      momoNodeGeo.dispose();
      particleGeo.dispose();
      shadowGeo.dispose();

      // Dispose materials
      pedestalMat.dispose();
      ringMat.dispose();
      handiMat.dispose();
      collarMat.dispose();
      lidMat.dispose();
      finialMat.dispose();
      handleMat.dispose();
      zingerNodeMat.dispose();
      momoNodeMat.dispose();
      particleMat.dispose();
      shadowMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRotating]);

  return (
    <div className="relative w-full h-full min-h-[260px] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-stone-900/60 to-black/80 border border-white/10 shadow-inner">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Overlay Badges */}
      <div className="absolute top-3.5 left-4 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 font-mono">
          Live Handi & Dispatch 3D Radar
        </span>
      </div>

      <div className="absolute bottom-3.5 right-4 flex items-center gap-1.5 z-10">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="px-2.5 py-1 text-[10px] font-bold rounded-lg glass-panel text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
          title={isRotating ? 'Pause 3D rotation' : 'Resume 3D rotation'}
        >
          <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{isRotating ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      <div className="absolute bottom-3.5 left-4 pointer-events-none">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Lahore Kitchen Dispatch Hub (PBR Procedural)</span>
        </div>
      </div>
    </div>
  );
};
