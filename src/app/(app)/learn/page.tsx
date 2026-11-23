import type { Metadata } from "next";
import { Curriculum } from "@/components/course/Curriculum";

export const metadata: Metadata = { title: "Python course" };

export default function LearnPage() {
  return <Curriculum />;
}
