import { useState } from "react";
import RenderView from "./canvas/RenderView";
import SideEditView from "./canvas/SideEditView";

export default function App() {
  const [positions, setPositions] = useState([
    -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0,
  ]);

  const [indices, setIndices] = useState([0, 1, 2, 2, 3, 0]);

  return (
    <main className="grid grid-cols-2 h-full">
      <SideEditView side="z" positions={positions} />
      <RenderView positions={positions} indices={indices} />
      <SideEditView side="x" positions={positions} />
      <SideEditView side="y" positions={positions} />
    </main>
  );
}
