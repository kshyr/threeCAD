import { createRef, type RefObject } from "react";
import type { BufferAttribute } from "three";
import { create } from "zustand";

type ModelState = {
  positions: Float32Array;
  setPositions: (newPositions: Float32Array) => void;

  indices: Uint16Array;
  setIndices: (newIndices: Uint16Array) => void;

  pointsPositionAttributeRef: RefObject<BufferAttribute>;
  indicesAttributeRef: RefObject<BufferAttribute>;
};

export const useModelStore = create<ModelState>()((set) => ({
  positions: new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]),
  setPositions: (newPositions) => set({ positions: newPositions }),

  indices: new Uint16Array([0, 1, 2, 2, 3, 0]),
  setIndices: (newIndices) => set({ indices: newIndices }),

  pointsPositionAttributeRef: createRef(),
  indicesAttributeRef: createRef(),
}));
