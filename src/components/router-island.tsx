import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "@/routes/react-routes";

function RoutesWrapper() {
  const element = useRoutes(routes);
  return element;
}

export function RouterIsland() {
  return (
    <BrowserRouter>
      <RoutesWrapper />
    </BrowserRouter>
  );
}
