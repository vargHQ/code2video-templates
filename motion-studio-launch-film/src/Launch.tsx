import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { Cursor } from "./components/Cursor";
import { ProductCard } from "./components/ProductCard";
import { Closing } from "./scenes/Closing";
import { Opening } from "./scenes/Opening";
import { PromptPanel } from "./scenes/PromptPanel";
import { Result } from "./scenes/Result";
import { Sound } from "./scenes/Sound";

// Layer order: background, product container, highlights + cursor, text.
export const Launch: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <ProductCard />
    <PromptPanel />
    <Cursor />
    <Opening />
    <Result />
    <Closing />
    <Sound />
  </AbsoluteFill>
);
