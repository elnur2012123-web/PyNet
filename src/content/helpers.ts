/** Tagged template for Python code: keeps backslashes, strips the first newline and trailing space. */
export const py = (s: TemplateStringsArray, ...v: unknown[]) =>
  String.raw({ raw: s.raw }, ...v)
    .replace(/^\n/, "")
    .replace(/\s+$/, "");

/** Join expected output lines. */
export const out = (...lines: (string | number)[]) => lines.join("\n");
