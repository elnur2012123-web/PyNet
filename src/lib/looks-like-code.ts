/** Heuristic: should this short answer option be shown in a monospace font? */
export const looksLikeCodeOption = (s: string) => /[()[\]{}='"#*%\\]|^\s*[\d.\-]+\s*$|\n|^[a-z_]+\.[a-z_]+|^(int|float|str|bool|None|True|False)$/.test(s);
