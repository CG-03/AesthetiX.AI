import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface Object3DViewerProps {
  segmentationMask: {x: number, y: number}[];
  imageWidth: number;
  imageHeight: number;
  imageUrl: string;
}

function ExtrudedMask({ shape, texture, imageWidth, imageHeight, centerX, centerY }: any) {
  const geomRef = React.useRef<THREE.ExtrudeGeometry>(null);

  React.useEffect(() => {
    if (geomRef.current) {
        const posAttribute = geomRef.current.attributes.position;
        const uvAttribute = geomRef.current.attributes.uv;
        
        for (let i = 0; i < posAttribute.count; i++) {
            const x = posAttribute.getX(i);
            const y = posAttribute.getY(i);
            const z = posAttribute.getZ(i);
            
            if (z > -0.1 && z < 0.1) {
                const origX = (x * 50) + centerX;
                const origY = centerY - (y * 50);
                
                const u = origX / imageWidth;
                const v = 1.0 - (origY / imageHeight);
                
                uvAttribute.setXY(i, u, v);
            }
        }
        uvAttribute.needsUpdate = true;
    }
  }, [shape, imageWidth, imageHeight, centerX, centerY]);

  return (
    <mesh>
      <extrudeGeometry ref={geomRef} args={[shape, { depth: 0.5, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 }]} />
      <meshStandardMaterial attach="material-0" map={texture} roughness={0.4} />
      <meshStandardMaterial attach="material-1" color="#B3541E" roughness={0.2} metalness={0.5} />
    </mesh>
  );
}

export default function Object3DViewer({ segmentationMask, imageWidth, imageHeight, imageUrl }: Object3DViewerProps) {
  const { shape, texture, center } = useMemo(() => {
    if (!segmentationMask || segmentationMask.length === 0) return { shape: null, texture: null, center: null };

    const shape = new THREE.Shape();
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    segmentationMask.forEach((pt: any) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    segmentationMask.forEach((pt: any, i: number) => {
      const x = (pt.x - centerX) / 50; 
      const y = -(pt.y - centerY) / 50; 
      
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });

    const texture = new THREE.TextureLoader().load(imageUrl);
    texture.colorSpace = "srgb";
    
    return { shape, texture, center: {x: centerX, y: centerY} };
  }, [segmentationMask, imageWidth, imageHeight, imageUrl]);

  if (!shape) return null;

  return (
    <div className="w-full h-[400px] bg-gray-100 dark:bg-[#0F0E0D] rounded-t-[2.5rem] overflow-hidden shadow-inner relative border-b border-gray-100 dark:border-[#3A3632]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Center>
          <ExtrudedMask shape={shape} texture={texture} imageWidth={imageWidth} imageHeight={imageHeight} centerX={center.x} centerY={center.y} />
        </Center>
        
        <OrbitControls enableZoom={true} enablePan={true} autoRotate={true} autoRotateSpeed={2} />
      </Canvas>
      <div className="absolute top-6 left-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest drop-shadow-md flex flex-col gap-1 z-10 pointer-events-none">
        <span className="bg-white/80 px-2 py-1 rounded dark:bg-[#1A1816]/80 dark:text-[#F5F0E8] backdrop-blur-sm shadow-sm inline-block w-max">3D Spatial Extrusion</span>
        <span className="bg-white/80 px-2 py-1 rounded dark:bg-[#1A1816]/80 dark:text-[#F5F0E8] backdrop-blur-sm shadow-sm inline-block w-max">Drag to Rotate</span>
      </div>
    </div>
  );
}
