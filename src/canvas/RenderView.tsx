import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stats,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import { BufferGeometry, DoubleSide } from "three";
import { useModelStore } from "../store";
import { useMemo } from "react";

export default function RenderView() {
  return (
    <>
      <Canvas className="border">
        <pointLight position={[5, 5, 5]} />

        <Meshes />
        <Points />

        <OrbitControls />
        <Stats />

        <GizmoHelper>
          <GizmoViewport />
        </GizmoHelper>
        <Grid infiniteGrid sectionColor={0x333333} />
      </Canvas>
    </>
  );
}

function Meshes() {
  const positions = useModelStore((state) => state.positions);
  const indices = useModelStore((state) => state.indices);

  const color = 0xaaaaaa;

  const meshGeometry = useMemo(() => {
    const g = new BufferGeometry();

    g.setFromPoints(positions);
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [positions, indices]);

  return (
    <mesh geometry={meshGeometry}>
      <meshBasicMaterial attach="material" color={color} side={DoubleSide} />
    </mesh>
  );
}

function Points() {
  const positions = useModelStore((state) => state.positions);

  const pointsGeometry = useMemo(() => {
    const g = new BufferGeometry();

    g.setFromPoints(positions);
    g.computeVertexNormals();
    return g;
  }, [positions]);

  return (
    <points geometry={pointsGeometry}>
      <pointsMaterial attach="material" size={0.1} />
    </points>
  );
}
