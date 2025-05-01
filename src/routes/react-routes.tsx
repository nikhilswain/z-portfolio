// src/routes/react-routes.tsx
import type { RouteObject } from "react-router-dom";
import Home from "@/components/home";
import { CliHome } from "@/components/cli-home";
import { GuiHome } from "@/components/gui-home";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/cli",
    element: <CliHome />,
  },
  {
    path: "/gui",
    element: <GuiHome />,
  },
  {
    path: "*",
    element: <Home />,
  },
];
