import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

type SideEditViewProps = {
  side: "x" | "y" | "z" | "-x" | "-y" | "-z";
  positions: number[];
};

type PointsProps = {
  positions: number[];
};

export default function SideEditView({ side, positions }: SideEditViewProps) {
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
      console.log(y);
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }

    ctx.strokeStyle = "#222";
    ctx.stroke();
  }

  function getMousePos(clientX: number, clientY: number) {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
    };
  }

  function handleMouseDown(e: MouseEvent) {
    setIsPressing(true);
    setStartPos({ ...getMousePos(e.clientX, e.clientY) });
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
        onPointerLeave={() => setIsPressing(false)}
      />
    </div>
  );
}

function Points({ positions }: PointsProps) {
  const points = useMemo(() => {
    return new Float32Array(positions);
  }, [positions]);

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={points}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" color={0xffffff} size={0.1} />
    </points>
  );
}
