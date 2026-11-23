/** Beginner-friendly explanations for Python error types. */
const HELP: Record<string, { tip: string; slug?: string }> = {
  SyntaxError: { tip: "Python couldn't understand the grammar of your code. Look for a missing colon (:), bracket or quote on or just before the highlighted line.", slug: "syntaxerror" },
  IndentationError: { tip: "The spaces at the start of a line are wrong. Code inside if/for/while/def must be indented by 4 spaces, and lines in the same block must line up.", slug: "indentationerror" },
  TabError: { tip: "Tabs and spaces are mixed. Use 4 spaces for every indentation level.", slug: "indentationerror" },
  NameError: { tip: "Python doesn't know this name. Check the spelling (capital letters matter!), create the variable before using it, or add quotes if it's meant to be text.", slug: "nameerror" },
  TypeError: { tip: "An operation got the wrong type of value — for example adding text and a number. Convert with str(), int() or float(), or check how many arguments a function needs.", slug: "typeerror" },
  ValueError: { tip: "The value has the right type but the wrong content — for example int(\"hello\"). Check what the user typed or what you passed in.", slug: "valueerror" },
  IndexError: { tip: "You asked for a position that doesn't exist. Remember indexes start at 0 and the last item is at len(...) - 1.", slug: "indexerror" },
  KeyError: { tip: "That key isn't in the dictionary. Check spelling and capitals, or use .get(key, default).", slug: "keyerror" },
  ZeroDivisionError: { tip: "You divided by zero. Check the divisor before dividing.", slug: "zerodivisionerror" },
  AttributeError: { tip: "This value doesn't have that method or attribute. Check the spelling and the type of the value (it may be None).", slug: "attributeerror" },
  ImportError: { tip: "The module exists but doesn't contain the name you imported. Check the spelling.", slug: "importerror" },
  ModuleNotFoundError: { tip: "Python can't find this module. Check the spelling. Note: the browser editor includes only Python's standard library (no pip packages).", slug: "modulenotfounderror" },
  FileNotFoundError: { tip: "The file doesn't exist at that path. Create it first, or check the name. Files in this editor live in a temporary in-browser folder.", slug: "filenotfounderror" },
  RecursionError: { tip: "A function called itself too many times. Make sure it has a base case that stops the recursion.", slug: "recursionerror" },
  EOFError: { tip: "input() was called but there was no input left. Type your answers in the Input box — one line for each input() call." },
  AssertionError: { tip: "An assert statement failed — an assumption in the code turned out to be False." },
  UnboundLocalError: { tip: "You used a variable inside a function before giving it a value there. Pass it in as a parameter or assign it first." },
  KeyboardInterrupt: { tip: "The program was stopped." },
  StopIteration: { tip: "next() was called on an iterator that has no items left." },
  OverflowError: { tip: "A number became too large to handle." },
  MemoryError: { tip: "The program used too much memory — maybe a list grew forever in a loop." },
};

export function friendlyHelp(type: string) {
  return HELP[type] ?? { tip: "Read the last line of the error: it names the problem. The line number shows where it happened." };
}
