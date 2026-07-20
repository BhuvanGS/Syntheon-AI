'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';
import type { CSSProperties } from 'react';

type AsciiLogoPropProps = {
  className?: string;
  style?: CSSProperties;
};

function DashedEdges({
  geometry,
  color = '#e8eef8',
}: {
  geometry: THREE.BufferGeometry;
  color?: string;
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 20), [geometry]);
  const positions = edges.attributes.position.array as Float32Array;

  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    const mat = new THREE.LineDashedMaterial({
      color: new THREE.Color(color),
      dashSize: 0.12,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.92,
    });
    const obj = new THREE.LineSegments(geo, mat);
    obj.computeLineDistances();
    return obj;
  }, [positions, color]);

  return <primitive object={line} />;
}

function CapsuleBar({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const geo = useMemo(() => new THREE.BoxGeometry(0.55, 2.65, 0.55), []);
  return (
    <group position={position} rotation={rotation}>
      <DashedEdges geometry={geo} />
    </group>
  );
}

function CenterRect() {
  const geo = useMemo(() => new THREE.BoxGeometry(0.72, 0.72, 0.28), []);

  const cross = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const s = 0.14;
    const z = 0.15;
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([-s, 0, z, s, 0, z, 0, -s, z, 0, s, z]), 3)
    );
    const mat = new THREE.LineDashedMaterial({
      color: new THREE.Color('#e8eef8'),
      dashSize: 0.06,
      gapSize: 0.04,
      transparent: true,
      opacity: 0.95,
    });
    const lines = new THREE.LineSegments(g, mat);
    lines.computeLineDistances();
    return lines;
  }, []);

  return (
    <group>
      <DashedEdges geometry={geo} />
      <primitive object={cross} />
    </group>
  );
}

function LogoMark({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (animate) {
      group.current.rotation.y += delta * 0.45;
      tilt.current += delta * 1.1;
      group.current.position.y = Math.sin(tilt.current) * 0.08;
      group.current.rotation.x = 0.35 + Math.sin(tilt.current * 0.7) * 0.04;
    } else {
      group.current.rotation.y = 0.55;
      group.current.rotation.x = 0.38;
    }
  });

  const barRot: [number, number, number] = [0, 0, -Math.PI / 4];
  const offset = 0.78;

  return (
    <group ref={group} scale={0.72}>
      <CapsuleBar position={[-offset, offset, 0]} rotation={barRot} />
      <CapsuleBar position={[offset, -offset, 0]} rotation={barRot} />
      <CenterRect />
    </group>
  );
}

/**
 * Dashed wireframe Syntheon mark — rotates like a floating 3D prop.
 */
export function AsciiLogoProp({ className, style }: AsciiLogoPropProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={className}
      aria-hidden
      style={{
        width: '100%',
        maxWidth: 260,
        height: 220,
        margin: '0 auto',
        position: 'relative',
        ...style,
      }}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.15, 6.4], fov: 28 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <LogoMark animate={!reduce} />
      </Canvas>
    </div>
  );
}
