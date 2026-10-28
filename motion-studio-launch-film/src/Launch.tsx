import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { Cursor } from "./components/Cursor";
import { ProductCard } from "./components/ProductCard";
import { Closing } from "./scenes/Closing";
import { Opening } from "./scenes/Opening";
import { Result } from "./scenes/Result";
import { Sound } from "./scenes/Sound";

// Layer order: background, product container, highlights + cursor, text.
export const Launch: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <ProductCard />
    <Cursor />
    <Opening />
    <Result />
    <Closing />
    <Sound />
  </AbsoluteFill>
);
