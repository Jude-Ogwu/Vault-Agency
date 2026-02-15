import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";

import { ThemeProvider } from "@/components/theme-provider";

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <App />
        </ThemeProvider>
    </HelmetProvider>
);
