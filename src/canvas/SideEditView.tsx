import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useModelStore, Side, SelectedArea } from "../store";
import { Vector3 } from "three";
import { buildCube } from "../util/shapes";

type SideEditViewProps = {
  side: Side;
};

export default function SideEditView({ side }: SideEditViewProps) {
  const positions = useModelStore((state) => state.positions);
  const setPositions = useModelStore((state) => state.setPositions);

  const indices = useModelStore((state) => state.indices);
  const setIndices = useModelStore((state) => state.setIndices);

  const selectedArea = useModelStore(
    (state) => state.selectionAreas.find((a) => a.side === side)?.selectedArea
  );
  const clearSelection = useModelStore((state) => state.clearSelection);
  const setSelectedArea = (newSelectedArea: SelectedArea) => {
    useModelStore.getState().setSelectedArea(newSelectedArea, side);
  };

  const selectedPoints = useModelStore((state) => state.selectedPoints);
  const setSelectedPoints = useModelStore((state) => state.setSelectedPoints);

  const activeSide = useModelStore((state) => state.activeSide);
  const setActiveSide = useModelStore((state) => state.setActiveSide);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressing, setIsPressing] = useState(false);

  const [mouseLoc, setMouseLoc] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const cellSize = 40;

  useEffect(() => {
    console.log(selectedArea);
  }, [selectedArea]);
  const getLocalMousePos = useCallback(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((mouseLoc.x - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((mouseLoc.y - rect.top) / (rect.bottom - rect.top)) * canvas.height,
    };
  }, [mouseLoc]);

  const drawVertex = useCallback(
    (u: number, v: number, vertex: Vector3) => {
      if (!canvasRef.current) {
        return;
      }

      const isInsideSelectedArea =
        selectedArea &&
        selectedArea.x1 < u &&
        u <= selectedArea.x2 &&
        selectedArea.y1 < v &&
        v <= selectedArea.y2;

      let isSelected = false;

      if (isInsideSelectedArea) {
        isSelected = true;
        if (!selectedPoints.includes(vertex)) {
          setSelectedPoints([...selectedPoints, vertex]);
        }
      } else if (selectedPoints.includes(vertex)) {
        isSelected = true;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

      const vertexSize = cellSize / 6;
      ctx.beginPath();
      ctx.fillStyle = isSelected ? "#733" : "#333";
      ctx.fillRect(
        u - vertexSize / 2,
        v - vertexSize / 2,
        vertexSize,
        vertexSize
      );
      ctx.stroke();
    },
    [selectedArea, selectedPoints, setSelectedPoints]
  );

  const drawSelectedArea = useCallback(() => {
    if (!selectedArea || !canvasRef.current || !isPressing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.beginPath();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#aaa";
    ctx.lineCap = "round";

    ctx.moveTo(selectedArea.x1, selectedArea.y1);
    ctx.lineTo(selectedArea.x2, selectedArea.y1);
    ctx.lineTo(selectedArea.x2, selectedArea.y2);
    ctx.moveTo(selectedArea.x2, selectedArea.y2);
    ctx.lineTo(selectedArea.x1, selectedArea.y2);
    ctx.lineTo(selectedArea.x1, selectedArea.y1);

    ctx.stroke();
  }, [isPressing, selectedArea]);

  const drawGrid = useCallback(() => {
    clearCanvas();
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }

    for (let y = 0; y < canvas.height; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#222";
    ctx.stroke();

    for (let i = 0; i < positions.length; i++) {
      const x = positions[i].x * cellSize;
      const y = positions[i].y * cellSize;
      const z = positions[i].z * cellSize;

      switch (side) {
        case "x":
          drawVertex(
            -z + canvas.width / 2,
            -y + canvas.height / 2,
            positions[i]
          );
          break;
        case "y":
          drawVertex(x + canvas.width / 2, z + canvas.height / 2, positions[i]);
          break;
        case "z":
          drawVertex(
            x + canvas.width / 2,
            -y + canvas.height / 2,
            positions[i]
          );
          break;
        default:
          drawVertex(y + canvas.width / 2, z + canvas.height / 2, positions[i]);
          break;
      }
    }
    drawSelectedArea();
  }, [positions, side, drawVertex, drawSelectedArea]);

  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;

      canvas.width = Math.floor(window.innerWidth / 2 / cellSize) * cellSize;
      canvas.height = Math.floor(window.innerHeight / 2 / cellSize) * cellSize;

      drawGrid();
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawGrid]);

  function clearCanvas() {
    if (!canvasRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawShape(u: number, v: number) {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    const uOffset = Math.floor(u - canvas.width / 2) / cellSize;
    const vOffset = Math.floor(v - canvas.height / 2) / cellSize;
    let newPositions: Vector3[];
    let newIndices: number[];
    const size = 1;

    switch (side) {
      case "x": {
        const { vx, ix } = buildCube(
          0,
          -vOffset,
          -uOffset,
          size,
          Math.max(Math.max(...indices) + 1, 0)
        );
        newPositions = vx;
        newIndices = ix;
        break;
      }
      case "y": {
        const { vx, ix } = buildCube(
          uOffset,
          0,
          vOffset,
          size,
          Math.max(Math.max(...indices) + 1, 0)
        );
        newPositions = vx;
        newIndices = ix;
        break;
      }
      case "z": {
        const { vx, ix } = buildCube(
          uOffset,
          -vOffset,
          0,
          size,
          Math.max(Math.max(...indices) + 1, 0)
        );
        newPositions = vx;
        newIndices = ix;
        break;
      }
      default: {
        const { vx, ix } = buildCube(
          uOffset,
          -vOffset,
          0,
          size,
          Math.max(Math.max(...indices) + 1, 0)
        );
        newPositions = vx;
        newIndices = ix;
        break;
      }
    }

    setPositions([...positions, ...newPositions]);
    setIndices([...indices, ...newIndices]);
  }

  function handleRightClick(e: MouseEvent) {
    e.preventDefault();
    clearSelection();
    const { x, y } = getLocalMousePos();

    const gridX = Math.round(x / cellSize) * cellSize;
    const gridY = Math.round(y / cellSize) * cellSize;
    const u = x > gridX ? gridX + cellSize / 2 : gridX - cellSize / 2;
    const v = y > gridY ? gridY + cellSize / 2 : gridY - cellSize / 2;

    drawShape(u, v);
  }

  function handleMouseDown(e: MouseEvent) {
    drawGrid();
    if (e.buttons === 1) {
      const { x, y } = getLocalMousePos();
      setIsPressing(true);
      clearSelection();
      setSelectedArea({ x1: x, y1: y, x2: x, y2: y });
    }
  }

  function handleMouseUp() {
    drawGrid();
    setIsPressing(false);
  }

  function handleMouseMove(e: MouseEvent) {
    setActiveSide(side);
    drawGrid();
    setMouseLoc({ x: e.clientX, y: e.clientY });
    if (!isPressing) {
      return;
    }

    const { x, y } = getLocalMousePos();

    if (!selectedArea) {
      setSelectedArea({ x1: x, y1: y, x2: x, y2: y });
      return;
    }

    let newX1, newY1, newX2, newY2;

    if (selectedArea.x1 >= x) {
      newX1 = x;
      newX2 = selectedArea.x2;
    } else {
      newX1 = selectedArea.x1;
      newX2 = x;
    }

    if (selectedArea.y1 >= y) {
      newY1 = y;
      newY2 = selectedArea.y2;
    } else {
      newY1 = selectedArea.y1;
      newY2 = y;
    }

    setSelectedArea({ x1: newX1, y1: newY1, x2: newX2, y2: newY2 });
  }

  function handleKeyDown(e: KeyboardEvent) {
    let newSelectedPoints = selectedPoints;

    switch (e.key) {
      case "w": {
        newSelectedPoints = selectedPoints.map((p) => {
          if (activeSide === "z") {
            p.y += 1;
          } else if (activeSide === "x") {
            p.y += 1;
          } else if (activeSide === "y") {
            p.z -= 1;
          }
          return p;
        });
        break;
      }

      case "a": {
        newSelectedPoints = selectedPoints.map((p) => {
          if (activeSide === "z") {
            p.x -= 1;
          } else if (activeSide === "x") {
            p.z += 1;
          } else if (activeSide === "y") {
            p.x -= 1;
          }
          return p;
        });
        break;
      }

      case "d": {
        newSelectedPoints = selectedPoints.map((p) => {
          if (activeSide === "z") {
            p.x += 1;
          } else if (activeSide === "x") {
            p.z -= 1;
          } else if (activeSide === "y") {
            p.x += 1;
          }
          return p;
        });
        break;
      }

      case "s": {
        newSelectedPoints = selectedPoints.map((p) => {
          if (activeSide === "z") {
            p.y -= 1;
          } else if (activeSide === "x") {
            p.y -= 1;
          } else if (activeSide === "y") {
            p.z += 1;
          }
          return p;
        });
        break;
      }
    }

    const newPositions = positions.map((pos) => {
      selectedPoints.forEach((selected, i) => {
        if (pos === selected) {
          return newSelectedPoints[i];
        }
      });
      return pos;
    });

    setPositions(newPositions);
    setSelectedPoints(newSelectedPoints);
  }

  return (
    <div className="flex relative justify-center items-center h-full">
      <canvas
        ref={canvasRef}
        className={`border-2 h-full w-full ${
          side === activeSide ? "border-zinc-600" : "border-zinc-900"
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={handleRightClick}
      />
      <h1 className="absolute top-2 right-4 font-bold text-lg text-gray-300 pointer-events-none">
        {side.toUpperCase()}
      </h1>
      <h1 className="fixed bottom-4 left-4 text-gray-300 max-w-xs">
        - right click to create a cube mesh <br />- use "WASD" to move selected
        vertices when hovering over desired sideview
      </h1>
    </div>
  );
}
