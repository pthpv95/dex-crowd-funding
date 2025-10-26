import { createFileRoute } from "@tanstack/react-router";
import { getProfileServerFn } from "@/api/auth.server";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
  loader: async () => {
    const userProfile = await getProfileServerFn();
    return {
      userProfile,
    };
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 to-black p-4 text-white"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #1a1a1a 0%, #0a0a0a 50%, #000000 100%)",
      }}
    >
      <div className="max-w-2xl w-full">
        {data.userProfile ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold">User Profile</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">User ID:</span>{" "}
                {data.userProfile.user.id}
              </p>
              <p>
                <span className="font-semibold">Wallet Address:</span>{" "}
                <span className="font-mono text-sm">
                  {data.userProfile.user.walletAddress}
                </span>
              </p>
              {data.userProfile.user.createdAt && (
                <p>
                  <span className="font-semibold">Created At:</span>{" "}
                  {new Date(data.userProfile.user.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/20">
            <h2 className="text-xl font-bold mb-2">Not Authenticated</h2>
            <p className="text-gray-300">
              Please connect your wallet and sign in to view your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
