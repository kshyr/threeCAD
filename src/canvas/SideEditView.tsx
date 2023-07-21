import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useModelStore } from "../store";
import { Vector3 } from "three";

type SideEditViewProps = {
  side: "x" | "y" | "z" | "-x" | "-y" | "-z";
};

export default function SideEditView({ side }: SideEditViewProps) {
  const positions = useModelStore((state) => state.positions);
  const setPositions = useModelStore((state) => state.setPositions);

  // const indices = useModelStore((state) => state.indices);
  // const setIndices = useModelStore((state) => state.setIndices);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const cellSize = 48;

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

    ctx.strokeStyle = "#222";
    ctx.stroke();

    for (let i = 0; i < positions.length; i++) {
      const x = positions[i].x * cellSize;
      const y = positions[i].y * cellSize;
      const z = positions[i].z * cellSize;

      switch (side) {
        case "x":
          drawVertex(-z + canvas.width / 2, -y + canvas.height / 2);
          break;
        case "y":
          drawVertex(x + canvas.width / 2, z + canvas.height / 2);
          break;
        case "z":
          drawVertex(x + canvas.width / 2, -y + canvas.height / 2);
          break;
        default:
          drawVertex(y + canvas.width / 2, z + canvas.height / 2);
          break;
      }
    }
  }, [positions]);

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
    return () => {
      window.removeEventListener("resize", handleResize);
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

  function drawVertex(u: number, v: number) {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const vertexSize = cellSize / 6;
    ctx.beginPath();
    ctx.fillStyle = "#333";
    ctx.fillRect(
      u - vertexSize / 2,
      v - vertexSize / 2,
      vertexSize,
      vertexSize
    );
    ctx.stroke();
  }

  function addVertex(u: number, v: number) {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    drawVertex(u, v);

    // TODO: come back to this
    const uOffset = Math.floor(u - canvas.width / 2) / cellSize;
    const vOffset = Math.floor(v - canvas.height / 2) / cellSize;
    let vertexPos: Vector3;

    switch (side) {
      case "x":
        vertexPos = new Vector3(0, -vOffset, -uOffset);
        break;

      case "y":
        vertexPos = new Vector3(uOffset, 0, vOffset);
        break;

      case "z":
        vertexPos = new Vector3(uOffset, -vOffset, 0);
        break;

      default:
        vertexPos = new Vector3(0, uOffset, vOffset);
        break;
    }

    const newPositions = [...positions, vertexPos];
    setPositions(newPositions);
  }

  function getMousePos(clientX: number, clientY: number) {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
    };
  }

  function handleRightClick(e: MouseEvent) {
    e.preventDefault();
    const { x, y } = getMousePos(e.clientX, e.clientY);

    const u = Math.round(x / cellSize) * cellSize;
    const v = Math.round(y / cellSize) * cellSize;

    addVertex(u, v);
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons === 1) {
      const { x, y } = getMousePos(e.clientX, e.clientY);

      setIsPressing(true);
      setStartPos({ x, y });
    }
  }

  function handleMouseUp() {
    setIsPressing(false);
    setStartPos(null);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isPressing) {
      return;
    }

    if (!startPos) {
      setStartPos({ ...getMousePos(e.clientX, e.clientY) });

      return;
    }

    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";

    const { x, y } = getMousePos(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setStartPos({ ...getMousePos(e.clientX, e.clientY) });
  }

  return (
    <div className="flex justify-center items-center h-full">
      <canvas
        ref={canvasRef}
        className="border h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={handleRightClick}
      />
    </div>
  );
}
