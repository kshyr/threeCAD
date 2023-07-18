import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import {
  OrbitControls,
  Stats,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import { DoubleSide } from "three";

type PointsProps = {
  positions: number[];
  indices: number[];
};

type RenderViewProps = PointsProps;

export default function RenderView({ positions, indices }: RenderViewProps) {
  return (
    <>
      <Canvas className="border">
        <pointLight position={[5, 5, 5]} />

        <OrbitControls />
        <Points positions={positions} indices={indices} />
        <Stats />

        <GizmoHelper>
          <GizmoViewport />
        </GizmoHelper>
        <Grid infiniteGrid />
      </Canvas>
    </>
  );
}

function Points({ positions, indices }: PointsProps) {
  const [color, setColor] = useState(0xaaaaaa);
  return (
    <>
      <mesh>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(positions)}
            count={positions.length / 3}
            itemSize={3}
          />{" "}
          <bufferAttribute
            attach="index"
            array={new Uint16Array(indices)}
            count={indices.length}
            itemSize={1}
          />
        </bufferGeometry>
        <meshBasicMaterial attach="material" color={color} side={DoubleSide} />
      </mesh>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(positions)}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial attach="material" size={0.1} />
      </points>
    </>
  );
}
