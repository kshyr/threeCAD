import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stats,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import { BufferGeometry } from "three";
import { useModelStore } from "../store";
import { useMemo } from "react";

export default function RenderView() {
  return (
    <>
      <Canvas className="border">
        <pointLight position={[5, 5, 5]} />

        <OrbitControls />
        <Points />
        <Stats />

        <GizmoHelper>
          <GizmoViewport />
        </GizmoHelper>
        <Grid infiniteGrid sectionColor={0x333333} />
      </Canvas>
    </>
  );
}

function Points() {
  const positions = useModelStore((state) => state.positions);
  // const setPositions = useModelStore((state) => state.setPositions);

  // const indices = useModelStore((state) => state.indices);
  // const setIndices = useModelStore((state) => state.setIndices);

  // const color = 0xaaaaaa;

  const geometry = useMemo(() => {
    const g = new BufferGeometry();

    g.setFromPoints(positions);
    g.computeVertexNormals();
    return g;
  }, [positions]);

  return (
    <>
      {/* <mesh>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="index"
            array={indices}
            count={indices.length}
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial attach="material" color={color} side={DoubleSide} />
      </mesh> */}
      <points geometry={geometry}>
        <pointsMaterial attach="material" size={0.1} />
      </points>
    </>
  );
}
