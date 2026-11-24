"use client";
import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { Decoration, EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting, indentUnit } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const highlight = HighlightStyle.define([
  { tag: t.keyword, color: "var(--cm-kw)" },
  { tag: [t.string, t.special(t.string)], color: "var(--cm-str)" },
  { tag: [t.number, t.bool, t.null], color: "var(--cm-num)" },
  { tag: t.comment, color: "rgb(var(--muted))", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--cm-fn)" },
  { tag: [t.definition(t.variableName), t.className], color: "var(--cm-def)" },
  { tag: [t.operator, t.punctuation], color: "rgb(var(--muted))" },
  { tag: t.self, color: "var(--cm-kw)", fontStyle: "italic" },
]);

const baseTheme = EditorView.theme({
  "&": { backgroundColor: "rgb(var(--code-bg))", color: "rgb(var(--fg))" },
  ".cm-content": { caretColor: "rgb(var(--accent))", padding: "12px 0" },
  ".cm-gutters": { backgroundColor: "rgb(var(--code-bg))", color: "rgb(var(--muted) / 0.7)", border: "none" },
  ".cm-activeLine": { backgroundColor: "rgb(var(--elevated) / 0.6)" },
  ".cm-activeLineGutter": { backgroundColor: "rgb(var(--elevated) / 0.6)", color: "rgb(var(--fg))" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "rgb(var(--accent) / 0.22) !important" },
  ".cm-cursor": { borderLeftColor: "rgb(var(--accent))", borderLeftWidth: "2px" },
  ".cm-matchingBracket": { backgroundColor: "rgb(var(--accent) / 0.18)", outline: "none" },
  ".cm-errorLine": { backgroundColor: "rgb(var(--danger) / 0.12)" },
});

export function CodeEditor({
  value, onChange, onRun, minHeight = "220px", maxHeight, readOnly = false, errorLine = null, ariaLabel = "Python code editor", language = "python",
}: {
  language?: "python" | "cpp";
  value: string; onChange?: (v: string) => void; onRun?: () => void; minHeight?: string; maxHeight?: string; readOnly?: boolean; errorLine?: number | null; ariaLabel?: string;
}) {
  const extensions = useMemo(() => {
    const ext = [
      language === "cpp" ? cpp() : python(),
      indentUnit.of("    "),
      syntaxHighlighting(highlight),
      baseTheme,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      Prec.highest(keymap.of([
        { key: "Mod-Enter", run: () => { onRun?.(); return true; } },
        { key: "Shift-Enter", run: () => { onRun?.(); return true; } },
      ])),
    ];
    if (errorLine) {
      ext.push(EditorView.decorations.of((view) => {
        if (errorLine < 1 || errorLine > view.state.doc.lines) return Decoration.none;
        const line = view.state.doc.line(errorLine);
        return Decoration.set([Decoration.line({ class: "cm-errorLine" }).range(line.from)]);
      }));
    }
    return ext;
  }, [onRun, errorLine, ariaLabel, language]);

  return (
    <div className="overflow-hidden" style={{ ["--cm-kw" as string]: "#c678dd", ["--cm-str" as string]: "#3d9a50", ["--cm-num" as string]: "#d19a66", ["--cm-fn" as string]: "#3b82f6", ["--cm-def" as string]: "#0ea5b7" }}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme="none"
        readOnly={readOnly}
        minHeight={minHeight}
        maxHeight={maxHeight}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true, autocompletion: true, bracketMatching: true, closeBrackets: true, indentOnInput: true, tabSize: 4 }}
        className="cm-pynest"
      />
    </div>
  );
}
