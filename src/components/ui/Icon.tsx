import {
  Box, BookOpen, Braces, Bug, Calculator, Code, FileText, Flame, GitBranch, GraduationCap, Hammer, Keyboard,
  Layers, Library, ListChecks, Package, Repeat, Rocket, Shapes, Sparkles, Star, Target, Terminal, Trophy, Type,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  box: Box, "book-open": BookOpen, braces: Braces, bug: Bug, calculator: Calculator, code: Code, "file-text": FileText,
  flame: Flame, "git-branch": GitBranch, "graduation-cap": GraduationCap, hammer: Hammer, keyboard: Keyboard,
  layers: Layers, library: Library, "list-checks": ListChecks, package: Package, repeat: Repeat, rocket: Rocket,
  shapes: Shapes, sparkles: Sparkles, star: Star, target: Target, terminal: Terminal, trophy: Trophy, type: Type,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Code;
  return <C className={className} aria-hidden="true" />;
}
