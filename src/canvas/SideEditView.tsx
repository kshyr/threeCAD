import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { useModelStore } from "../store";

type SideEditViewProps = {
  side: "x" | "y" | "z" | "-x" | "-y" | "-z";
};

export default function SideEditView({ side }: SideEditViewProps) {
  const positions = useModelStore((state) => state.positions);
  const setPositions = useModelStore((state) => state.setPositions);

  // const indices = useModelStore((state) => state.indices);
  // const setIndices = useModelStore((state) => state.setIndices);

  const pointsPositionAttributeRef = useModelStore(
    (state) => state.pointsPositionAttributeRef
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const cellSize = 48;

  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current) {
        return;
      }

      const canvas = canvasRef.current;

      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;

      drawGrid();
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function drawGrid() {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    for (let x = 0; x < canvas.width; x += cellSize) {
      ctx.moveTo(0.5 + x, 0);
      ctx.lineTo(x, canvas.height);
    }

    for (let y = 0; y < canvas.height; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }

    ctx.strokeStyle = "#222";
    ctx.stroke();
  }

  function drawVertex(u: number, v: number) {
    if (!canvasRef.current || !pointsPositionAttributeRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    ctx.rect(u, v, cellSize / 8, cellSize / 8);
    ctx.stroke();

    const uOffset = Math.floor(u - canvas.width / 2);
    const vOffset = Math.floor(v - canvas.height / 2);
    let vertexPos: number[];

    switch (side) {
      case "x":
        vertexPos = [0, uOffset, vOffset];
        break;

      case "y":
        vertexPos = [uOffset, 0, vOffset];
        break;

      case "z":
        vertexPos = [uOffset, vOffset, 0];
        break;

      default:
        vertexPos = [0, uOffset, vOffset];
        break;
    }

    console.log(vertexPos);

    const newPositions = new Float32Array([...positions, ...vertexPos]);
    setPositions(newPositions);

    pointsPositionAttributeRef.current.array = new Float32Array([0, 1, 2]);
    pointsPositionAttributeRef.current.needsUpdate = true;
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

    drawVertex(x, y);
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.buttons === 1) {
      setIsPressing(true);
      setStartPos({ ...getMousePos(e.clientX, e.clientY) });
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
