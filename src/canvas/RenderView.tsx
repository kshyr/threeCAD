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

type Point = {
  geometry: BufferGeometry;
  isSelected: boolean;
};

function Points() {
  const positions = useModelStore((state) => state.positions);
  const selectedPoints = useModelStore((state) => state.selectedPoints);

  const points = useMemo(() => {
    const newPoints: Point[] = [];
    for (let i = 0; i < positions.length; i++) {
      const g = new BufferGeometry();
      g.setFromPoints([positions[i]]);
      g.computeVertexNormals();

      let isSelected = false;
      if (selectedPoints.includes(positions[i])) {
        isSelected = true;
      }
      const newPoint: Point = { geometry: g, isSelected };

      newPoints.push(newPoint);
    }

    return newPoints;
  }, [positions, selectedPoints]);

  return points.map((point, i) => {
    return (
      <points geometry={point.geometry} key={`point-${i}`}>
        <pointsMaterial
          attach="material"
          color={point.isSelected ? 0xaa5555 : 0xffffff}
          size={0.1}
        />
      </points>
    );
  });
}
