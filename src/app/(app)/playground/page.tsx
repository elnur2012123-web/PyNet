import type { Metadata } from "next";
import { Playground } from "./Playground";

export const metadata: Metadata = { title: "Python playground" };
export default function PlaygroundPage() {
  return <Playground />;
}
