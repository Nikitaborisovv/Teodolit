import { SceneRoot } from '@/scene/SceneRoot';
import { Panel } from '@/ui/Panel';
import { ZenithPanel } from '@/ui/ZenithPanel';
import { TourOverlay } from '@/ui/TourOverlay';

export function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-bg text-text-primary">
      <ZenithPanel />
      <main className="relative flex-1">
        <SceneRoot />
        <TourOverlay />
      </main>
      <Panel />
    </div>
  );
}
