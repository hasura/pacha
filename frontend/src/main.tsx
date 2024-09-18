import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProviders } from "@/ui/mantine";

import App from "./App.tsx";
import '@/ui/styles/app-styles';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProviders>
      <App />
    </MantineProviders>
  </StrictMode>
);
