/** Errors that aren't in the Error Explorer, explained for PyBuddy. */
export const EXTRA_ERRORS: Record<string, { meaning: string; fix: string; example?: string }> = {
  EOFError: { meaning: "`input()` was called, but there was no more input to read.", fix: "In the PyNest editor, type your answers in the **Input** box before pressing Run — one line for each `input()`.", example: 'name = input("Name: ")   # needs a line in the Input box' },
  UnboundLocalError: { meaning: "Inside a function, you used a variable before giving it a value *in that function*. Assigning to a name anywhere in a function makes it local there.", fix: "Pass the value in as a parameter and return the new value, or (less ideal) add `global name` at the top of the function.", example: "count = 0\ndef bump(count):\n    return count + 1\ncount = bump(count)" },
  TabError: { meaning: "The indentation mixes tabs and spaces.", fix: "Use 4 spaces for every level. Most editors can convert tabs to spaces automatically." },
  StopIteration: { meaning: "`next()` was called on an iterator that has no items left.", fix: "Use a `for` loop (it handles the end for you), or give `next()` a default: `next(it, None)`." },
  OverflowError: { meaning: "A number became too big for the operation (often with floats like `2.0 ** 10000`).", fix: "Use whole numbers (ints can grow very large) or check your formula — it may grow faster than you think." },
  AssertionError: { meaning: "An `assert` statement found that something you expected to be true was false.", fix: "Read the message after the assert, then check the values just before it with `print()`." },
  KeyboardInterrupt: { meaning: "The program was stopped by the user (Ctrl+C or the Stop button).", fix: "Nothing is broken. If the program never finishes on its own, look for an infinite loop." },
  MemoryError: { meaning: "The program tried to use more memory than is available — often a list that grows forever inside a loop.", fix: "Check your loops' stop conditions, and avoid building huge lists you don't need." },
  PermissionError: { meaning: "You don't have permission to open or change that file or folder.", fix: "Pick another location, close the file if another program has it open, or check the file's permissions." },
  IsADirectoryError: { meaning: "You tried to open a **folder** as if it were a file.", fix: "Include the file name in the path: `open(\"data/notes.txt\")`, not `open(\"data\")`." },
  NotImplementedError: { meaning: "A method exists but hasn't been written yet — usually a parent class expects child classes to fill it in.", fix: "Write that method in your subclass." },
  UnicodeDecodeError: { meaning: "Python couldn't read the text in a file with the expected encoding.", fix: "Open it with the right encoding: `open(path, encoding=\"utf-8\")`." },
  RuntimeError: { meaning: "A general error that happens while running, for example changing a dictionary while looping over it.", fix: "Loop over a copy instead: `for k in list(d):`." },
  ConnectionError: { meaning: "The program couldn't reach a website or server.", fix: "Check the internet connection and the address. Note: the PyNest browser editor can't make web requests." },
  OSError: { meaning: "The operating system reported a problem — often with files or folders.", fix: "Read the message: it usually says which file and what went wrong." },
};
