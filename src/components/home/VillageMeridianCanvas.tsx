// DevMeDoAnDrOiD
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function canRunWebGLScene(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency < 4) return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export const VillageMeridianCanvas: React.FC = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => canRunWebGLScene());

  useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current;
    if (!host) return;

    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;

    const isDark = document.documentElement.classList.contains('dark');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const nodeCount = width < 768 ? 28 : 46;
    const positions = new Float32Array(nodeCount * 3);
    const velocities = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    const primaryColor = new THREE.Color(isDark ? '#47b8a3' : '#14655a');
    const accentColor = new THREE.Color(isDark ? '#fbbf24' : '#d97706');

    for (let i = 0; i < nodeCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 18;
      positions[i3 + 1] = (Math.random() - 0.5) * 8.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 4;

      velocities[i3] = (Math.random() - 0.5) * 0.008;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.006;
      velocities[i3 + 2] = 0;

      const c = i % 5 === 0 ? accentColor : primaryColor;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.65 : 0.42
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);

    const maxPairs = nodeCount * nodeCount;
    const linePositions = new Float32Array(maxPairs * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x47b8a3 : 0x177e6f,
      transparent: true,
      opacity: isDark ? 0.16 : 0.11
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    const group = new THREE.Group();
    group.add(lines);
    group.add(points);
    scene.add(group);

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      pointerY = -((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(host);

    let rafId = 0;
    const thresholdSq = 3.2 * 3.2;

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (!isVisible || document.hidden) return;

      const posAttr = pointsGeometry.attributes.position as THREE.BufferAttribute;
      const lineAttr = lineGeometry.attributes.position as THREE.BufferAttribute;
      let lineVertexIndex = 0;

      for (let i = 0; i < nodeCount; i++) {
        const i3 = i * 3;
        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];

        if (positions[i3] > 9.5 || positions[i3] < -9.5) velocities[i3] *= -1;
        if (positions[i3 + 1] > 4.6 || positions[i3 + 1] < -4.6) velocities[i3 + 1] *= -1;

        for (let j = i + 1; j < nodeCount; j++) {
          const j3 = j * 3;
          const dx = positions[i3] - positions[j3];
          const dy = positions[i3 + 1] - positions[j3 + 1];
          const distSq = dx * dx + dy * dy;
          if (distSq < thresholdSq) {
            linePositions[lineVertexIndex++] = positions[i3];
            linePositions[lineVertexIndex++] = positions[i3 + 1];
            linePositions[lineVertexIndex++] = positions[i3 + 2];
            linePositions[lineVertexIndex++] = positions[j3];
            linePositions[lineVertexIndex++] = positions[j3 + 1];
            linePositions[lineVertexIndex++] = positions[j3 + 2];
          }
        }
      }

      posAttr.needsUpdate = true;
      lineAttr.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineVertexIndex / 3);

      group.rotation.y += (pointerX * 0.14 - group.rotation.y) * 0.035;
      group.rotation.x += (pointerY * 0.12 - group.rotation.x) * 0.035;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      io.disconnect();
      ro.disconnect();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 -z-10 pointer-events-none opacity-80 overflow-hidden"
      aria-hidden="true"
    />
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
