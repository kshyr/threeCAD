import { createRef, type RefObject } from "react";
import { BufferAttribute, Vector3 } from "three";
import { create } from "zustand";

export type Side = "x" | "y" | "z" | "-x" | "-y" | "-z";

export type SelectedArea = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} | null;

type SelectionArea = {
  side: Side;
  selectedArea: SelectedArea;
};

type ModelState = {
  positions: Vector3[];
  setPositions: (newPositions: Vector3[]) => void;

  indices: number[];
  setIndices: (newIndices: number[]) => void;

  selectionAreas: SelectionArea[];
  clearSelection: () => void;
  setSelectedArea: (newSelectedArea: SelectedArea, side: Side) => void;

  selectedPoints: Vector3[];
  setSelectedPoints: (newSelectedPoints: Vector3[]) => void;

  activeSide: Side;
  setActiveSide: (newSide: Side) => void;

  pointsPositionAttributeRef: RefObject<BufferAttribute>;
  indicesAttributeRef: RefObject<BufferAttribute>;
};

const INIT_SELECTION_AREAS: SelectionArea[] = (["z", "x", "y"] as Side[]).map(
  (s) => {
    return { side: s, selectedArea: null };
  }
);

export const useModelStore = create<ModelState>()((set) => ({
  positions: [],
  setPositions: (newPositions) => set({ positions: newPositions }),

  indices: [],
  setIndices: (newIndices) => set({ indices: newIndices }),

  selectionAreas: INIT_SELECTION_AREAS,
  clearSelection: () =>
    set({ selectionAreas: INIT_SELECTION_AREAS, selectedPoints: [] }),
  setSelectedArea: (newSelectedArea, side) => {
    set((state) => {
      const newSelectionAreas = [...state.selectionAreas];
      const selectedAreaIndex = newSelectionAreas.findIndex(
        (a) => a.side === side
      );
      newSelectionAreas[selectedAreaIndex].selectedArea = newSelectedArea;
      return { selectionAreas: newSelectionAreas };
    });
  },

  selectedPoints: [],
  setSelectedPoints: (newSelectedPoints) =>
    set({ selectedPoints: newSelectedPoints }),

  activeSide: "z",
  setActiveSide: (newSide) => set({ activeSide: newSide }),

  pointsPositionAttributeRef: createRef(),
  indicesAttributeRef: createRef(),
}));
