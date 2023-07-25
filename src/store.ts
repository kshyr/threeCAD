import { createRef, type RefObject } from "react";
import { BufferAttribute, Vector3 } from "three";
import { create } from "zustand";

type ModelState = {
  positions: Vector3[];
  setPositions: (newPositions: Vector3[]) => void;

  indices: number[];
  setIndices: (newIndices: number[]) => void;

  selectedPoints: Vector3[];
  setSelectedPoints: (newSelectedPoints: Vector3[]) => void;

  pointsPositionAttributeRef: RefObject<BufferAttribute>;
  indicesAttributeRef: RefObject<BufferAttribute>;
};

export const useModelStore = create<ModelState>()((set) => ({
  positions: [],
  setPositions: (newPositions) => set({ positions: newPositions }),

  indices: [],
  setIndices: (newIndices) => set({ indices: newIndices }),

  selectedPoints: [],
  setSelectedPoints: (newSelectedPoints) =>
    set({ selectedPoints: newSelectedPoints }),

  pointsPositionAttributeRef: createRef(),
  indicesAttributeRef: createRef(),
}));
