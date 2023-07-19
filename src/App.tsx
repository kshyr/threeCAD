import RenderView from "./canvas/RenderView";
import SideEditView from "./canvas/SideEditView";

export default function App() {
  return (
    <main className="grid grid-cols-2 h-full">
      <SideEditView side="z" />
      <RenderView />
      <SideEditView side="x" />
      <SideEditView side="y" />
    </main>
  );
}
