import Campaigns from "@/components/Campaigns";
import CreateCampaign from "@/components/CreateCampaign";
import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-black p-4 text-white"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #1a1a1a 0%, #0a0a0a 50%, #000000 100%)",
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <ClientOnly>
          <Campaigns />
        </ClientOnly>
      </div>
    </div>
  );
}
