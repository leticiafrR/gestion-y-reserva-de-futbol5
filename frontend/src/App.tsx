import { QueryClientProvider } from "@tanstack/react-query";

import { Navigation } from "@/Navigation";
import { appQueryClient } from "@/config/app-query-client";
import { TokenProvider } from "@/services/TokenContext";

export function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <TokenProvider>
        <Navigation />
      </TokenProvider>
    </QueryClientProvider>
  );
}
