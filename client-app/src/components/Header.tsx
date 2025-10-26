import { Link } from "@tanstack/react-router";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useLogin, useLogout, useProfile } from "../hooks/auth";

export default function Header() {
  const { address } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  // TanStack Query hooks
  const { data: profileData, isLoading: isLoadingProfile } = useProfile(
    !!address,
  );
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const isVerified = !!profileData?.user;
  const isVerifying = loginMutation.isPending || isLoadingProfile;

  const handleVerifyMessage = async (connectedAddress: `0x${string}`) => {
    try {
      const message = `Welcome to CrowdFund!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${connectedAddress}\nTimestamp: ${new Date().toISOString()}`;

      const signature = await signMessageAsync({ message });
      console.log("🚀 ~ handleVerifyMessage ~ signature:", signature);

      // Call backend API to verify signature using TanStack Query
      await loginMutation.mutateAsync({
        walletAddress: connectedAddress,
        signature,
        message,
      });

      console.log("Login successful");
    } catch (error) {
      console.log("🚀 ~ handleVerifyMessage ~ error:", error);
      console.error("Error verifying message:", error);
      disconnect();
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      disconnect();
    } catch (error) {
      console.error("Logout error:", error);
      // Still disconnect on error
      disconnect();
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              CF
            </div>
            <span className="text-xl font-bold text-gray-800">CrowdFund</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              activeProps={{
                className: "text-green-600 font-semibold",
              }}
            >
              Browse Campaigns
            </Link>
            {address && (
              <Link
                to="/create"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                activeProps={{
                  className: "text-green-600 font-semibold",
                }}
              >
                Start a Campaign
              </Link>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {address ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">
                    {isVerifying
                      ? "Verifying..."
                      : isVerified
                        ? "Verified ✓"
                        : "Connected"}
                  </p>
                  <p className="text-sm font-mono text-gray-800">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  disabled={isVerifying}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={async () => {
                      const result = await connectAsync({ connector });
                      handleVerifyMessage(result.accounts[0]);
                    }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Connect Wallet
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex gap-4 pb-3 border-t pt-3">
          <Link
            to="/"
            className="text-gray-700 hover:text-green-600 font-medium transition-colors text-sm"
            activeProps={{
              className: "text-green-600 font-semibold",
            }}
          >
            Browse
          </Link>
          {address && (
            <Link
              to="/create"
              className="text-gray-700 hover:text-green-600 font-medium transition-colors text-sm"
              activeProps={{
                className: "text-green-600 font-semibold",
              }}
            >
              Create
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
