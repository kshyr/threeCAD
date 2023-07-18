import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import {
  OrbitControls,
  Stats,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";

type PointsProps = {
  positions: number[];
};

type RenderViewProps = PointsProps;

export default function RenderView({ positions }: RenderViewProps) {
  return (
    <>
      <Canvas className="border">
        <pointLight position={[5, 5, 5]} />

        <OrbitControls />
        <Points positions={positions} />
        <Stats />

        <GizmoHelper>
          <GizmoViewport />
        </GizmoHelper>
        <Grid infiniteGrid />
      </Canvas>
    </>
  );
}

function Points({ positions }: PointsProps) {
  const points = useMemo(() => {
    return new Float32Array(positions);
  }, [positions]);

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={points}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" color={0xffffff} size={0.1} />
    </points>
  );
}
