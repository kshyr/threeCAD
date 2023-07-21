import { Vector3 } from "three";

export function buildCube(
  x: number,
  y: number,
  z: number,
  size: number,
  i: number
): { vx: Vector3[]; ix: number[] } {
  const d = size / 2;
  const vertices: number[][] = [
    [x - d, y - d, z - d],
    [x - d, y + d, z - d],
    [x + d, y - d, z - d],
    [x + d, y + d, z - d],
    [x - d, y - d, z + d],
    [x - d, y + d, z + d],
    [x + d, y - d, z + d],
    [x + d, y + d, z + d],
  ];

  const indices: number[][] = [
    [0, 1, 2, 2, 3, 1],
    [0, 1, 4, 4, 5, 1],
    [4, 5, 6, 6, 7, 5],
    [2, 3, 6, 6, 7, 3],
    [0, 2, 4, 4, 6, 2],
    [1, 3, 5, 5, 7, 3],
  ];

  return {
    vx: vertices.map((v) => new Vector3(v[0], v[1], v[2])),
    ix: indices.flat().map((x) => x + i),
  };
}
