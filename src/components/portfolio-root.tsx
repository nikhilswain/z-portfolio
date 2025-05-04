import { ModeProvider } from "./mode-provider";
import Home from "./home";

export function PortfolioRoot() {
  return (
    <ModeProvider>
      <Home />
    </ModeProvider>
  );
}
