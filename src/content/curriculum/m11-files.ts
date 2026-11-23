import type { Module } from "../types";
import { out, py } from "../helpers";

export const m11: Module = {
  id: "m11",
  number: 11,
  title: "File Handling",
  description: "Save and load data with text files and CSV files.",
  icon: "file-text",
  lessons: [
    {
      id: "m11-intro-open",
      title: "What is file handling? Opening and closing files",
      minutes: 8,
      intro: `Variables disappear when a program ends. To **keep** data — notes, scores, settings — you save it in a **file**. **File handling** means creating, reading and changing files from code.

The basic steps:

- **Open** the file with \`open(name, mode)\`.
- **Read** from it or **write** to it.
- **Close** it with \`.close()\` so changes are saved and the system is released.

**Modes:**

- \`"r"\` — read (default). Error if the file does not exist.
- \`"w"\` — write. Creates the file, or **erases** it if it exists.
- \`"a"\` — append. Adds to the end without erasing.

*In PyNest, files live in a temporary in-browser folder that resets when you reload the page.*`,
      syntax: py`
f = open("file.txt", "w")
f.write("text")
f.close()`,
      examples: [
        { title: "Write then read", code: py`
f = open("hello.txt", "w")
f.write("Hello, file!")
f.close()

f = open("hello.txt", "r")
print(f.read())
f.close()` },
        { title: "Checking if a file exists", code: py`
import os
print(os.path.exists("hello.txt"))
print(os.path.exists("nope.txt"))` },
      ],
      realWorld: `Games save progress to files, apps write log files, and spreadsheets are files that programs read and create.`,
      mistakes: [
        { wrong: py`
f = open("data.txt", "w")
f.write("important")`, right: py`
f = open("data.txt", "w")
f.write("important")
f.close()`, why: "Forgetting close() can leave data unsaved. The with statement (next lessons) closes automatically." },
      ],
      tryIt: py`
f = open("diary.txt", "w")
f.write("Today I learned files.")
f.close()
f = open("diary.txt")
print(f.read())
f.close()`,
      practice: [
        { prompt: "Write `Python` into `lang.txt`, close it, then open it again, read it and print the content.", tests: [{ expected: "Python" }], hint: "open with 'w', write, close; open with 'r', read, close.", solution: py`
f = open("lang.txt", "w")
f.write("Python")
f.close()
f = open("lang.txt", "r")
print(f.read())
f.close()` },
        { prompt: "Write `first` to `a.txt` with mode \"w\", then write `second` with mode \"w\" again. Read and print the file. (What happened to `first`?)", tests: [{ expected: "second" }], hint: '"w" erases the old content.', solution: py`
f = open("a.txt", "w")
f.write("first")
f.close()
f = open("a.txt", "w")
f.write("second")
f.close()
f = open("a.txt")
print(f.read())
f.close()` },
        { prompt: "Use `os.path.exists` to print whether `ghost.txt` exists (it does not).", tests: [{ expected: "False" }], hint: "import os", solution: py`
import os
print(os.path.exists("ghost.txt"))` },
      ],
      quiz: [
        { q: "Which mode erases a file before writing?", options: ['"r"', '"w"', '"a"'], answer: 1, explain: '"w" truncates the file.' },
        { q: "What happens when opening a missing file with \"r\"?", options: ["It is created", "FileNotFoundError", "It returns empty text"], answer: 1, explain: "Read mode requires the file to exist." },
      ],
    },
    {
      id: "m11-reading",
      title: "Reading files",
      minutes: 8,
      intro: `There are several ways to read a file:

- \`f.read()\` — the **whole** file as one string.
- \`f.readline()\` — **one** line at a time.
- \`f.readlines()\` — a **list** of all lines.
- \`for line in f:\` — loop line by line (best for big files).

Each line read from a file **ends with \`\\n\`** (the newline character). Use \`.strip()\` to remove it.

Writing several lines? Add \`\\n\` yourself: \`f.write("line 1\\n")\`.`,
      syntax: py`
f = open("file.txt")
for line in f:
    print(line.strip())
f.close()`,
      examples: [
        { title: "Reading line by line", code: py`
f = open("todo.txt", "w")
f.write("buy milk\ncall mom\nstudy\n")
f.close()

f = open("todo.txt")
for line in f:
    print("-", line.strip())
f.close()` },
        { title: "readlines()", code: py`
f = open("todo.txt")
lines = f.readlines()
f.close()
print(len(lines), "tasks")
print(lines[0].strip())` },
      ],
      realWorld: `Programs read configuration files on start-up, and data scientists read huge data files line by line.`,
      mistakes: [
        { wrong: py`
for line in open("todo.txt"):
    print(line)`, right: py`
for line in open("todo.txt"):
    print(line.strip())`, why: "Each line already ends with \\n, and print adds another — so you get blank lines between." },
      ],
      tryIt: py`
f = open("nums.txt", "w")
f.write("4\n8\n15\n")
f.close()
total = 0
for line in open("nums.txt"):
    total += int(line)
print("Total:", total)`,
      practice: [
        { prompt: "Write three lines `a`, `b`, `c` to `letters.txt`, then read it and print the number of lines.", tests: [{ expected: "3" }], hint: "f.write('a\\nb\\nc\\n'), then len(f.readlines())", solution: py`
f = open("letters.txt", "w")
f.write("a\nb\nc\n")
f.close()
f = open("letters.txt")
print(len(f.readlines()))
f.close()` },
        { prompt: "Write `10`, `20`, `30` on separate lines to `n.txt`. Read them and print their sum.", tests: [{ expected: "60" }], hint: "Convert each line with int().", solution: py`
f = open("n.txt", "w")
f.write("10\n20\n30\n")
f.close()
total = 0
f = open("n.txt")
for line in f:
    total += int(line)
f.close()
print(total)` },
        { prompt: "Write `first line\\nsecond line\\n` to `two.txt`. Read only the first line with readline() and print it without the newline.", tests: [{ expected: "first line" }], hint: "print(f.readline().strip())", solution: py`
f = open("two.txt", "w")
f.write("first line\nsecond line\n")
f.close()
f = open("two.txt")
print(f.readline().strip())
f.close()` },
      ],
      quiz: [
        { q: "What does readlines() return?", options: ["One string", "A list of lines", "The first line", "The number of lines"], answer: 1, explain: "readlines returns a list." },
        { q: "Why use strip() on lines from a file?", options: ["To remove the trailing newline", "To uppercase", "To count words"], answer: 0, explain: "Lines end with \\n." },
      ],
    },
    {
      id: "m11-writing-appending",
      title: "Writing and appending files",
      minutes: 7,
      intro: `**Writing** (\`"w"\`) replaces everything in the file. **Appending** (\`"a"\`) adds to the end and keeps what was there.

- \`f.write(text)\` writes a string (no automatic newline!).
- \`f.writelines(list_of_strings)\` writes several strings.
- \`write()\` only accepts **strings** — convert numbers with \`str()\` or f-strings.

Use \`"w"\` to save a fresh copy of your data, and \`"a"\` for logs or history that grow over time.`,
      syntax: py`
f = open("log.txt", "a")
f.write("new entry\n")
f.close()`,
      examples: [
        { title: "A growing log", code: py`
f = open("log.txt", "w")
f.write("start\n")
f.close()

for event in ["login", "click", "logout"]:
    f = open("log.txt", "a")
    f.write(event + "\n")
    f.close()

print(open("log.txt").read())` },
        { title: "Saving numbers", code: py`
scores = [12, 40, 33]
f = open("scores.txt", "w")
for s in scores:
    f.write(f"{s}\n")
f.close()
print(open("scores.txt").read().split())` },
      ],
      realWorld: `Servers append every request to log files, and chat apps append each new message to history.`,
      mistakes: [
        { wrong: py`f.write(42)`, right: py`f.write(str(42))`, why: "write() needs a string; passing an int raises TypeError." },
      ],
      tryIt: py`
f = open("visits.txt", "a")
f.write("visit\n")
f.close()
print(open("visits.txt").read().count("visit"), "visits so far")`,
      practice: [
        { prompt: "Write `apple` to `shop.txt` with \"w\", then append `banana` with \"a\" (one item per line). Print the file's lines as a list using `.read().split()`.", tests: [{ expected: "['apple', 'banana']" }], hint: "Remember to add \\n after each item.", solution: py`
f = open("shop.txt", "w")
f.write("apple\n")
f.close()
f = open("shop.txt", "a")
f.write("banana\n")
f.close()
print(open("shop.txt").read().split())` },
        { prompt: "Save the numbers 1 to 5 to `nums.txt` (one per line) using a loop, then print the file's content.", tests: [{ expected: out(1, 2, 3, 4, 5) }], hint: 'f.write(f"{i}\\n")', solution: py`
f = open("nums.txt", "w")
for i in range(1, 6):
    f.write(f"{i}\n")
f.close()
print(open("nums.txt").read())` },
        { prompt: "Fix the TypeError so it writes the score and prints `Score: 99`.", starter: py`
score = 99
f = open("score.txt", "w")
f.write(score)
f.close()
print("Score:", open("score.txt").read())`, tests: [{ expected: "Score: 99" }], hint: "Convert score to a string.", solution: py`
score = 99
f = open("score.txt", "w")
f.write(str(score))
f.close()
print("Score:", open("score.txt").read())` },
      ],
      quiz: [
        { q: "Which mode keeps existing content and adds to the end?", options: ['"w"', '"a"', '"r"'], answer: 1, explain: "Append mode." },
        { q: "Does write() add a newline automatically?", options: ["Yes", "No"], answer: 1, explain: "You must add \\n yourself." },
      ],
    },
    {
      id: "m11-with-open",
      title: "with open() — the safe way",
      minutes: 6,
      intro: `Forgetting \`close()\` is a classic bug. Python has a better way: the **\`with\` statement**.

\`with open("file.txt") as f:\`
\`    content = f.read()\`

When the indented block ends, Python **closes the file automatically** — even if an error happens inside.

This is the recommended way to work with files. From now on, always use \`with\`.

You can open two files in one with: \`with open("a.txt") as src, open("b.txt", "w") as dst:\``,
      syntax: py`
with open("file.txt", "w") as f:
    f.write("hello")`,
      examples: [
        { title: "Write and read with with", code: py`
with open("note.txt", "w") as f:
    f.write("Python is great\n")

with open("note.txt") as f:
    print(f.read().strip())` },
        { title: "Copying a file", code: py`
with open("note.txt") as src, open("copy.txt", "w") as dst:
    dst.write(src.read())
with open("copy.txt") as f:
    print("Copied:", f.read().strip())` },
      ],
      realWorld: `Professional Python code almost always uses with for files, database connections and network sockets.`,
      mistakes: [
        { wrong: py`
with open("x.txt", "w") as f:
f.write("hi")`, right: py`
with open("x.txt", "w") as f:
    f.write("hi")`, why: "Code that uses the file must be indented inside the with block." },
      ],
      tryIt: py`
with open("animals.txt", "w") as f:
    f.write("cat\ndog\nowl\n")
with open("animals.txt") as f:
    for line in f:
        print(line.strip().upper())`,
      practice: [
        { prompt: "Using `with`, write `Hello with` to `w.txt`, then read and print it using `with`.", tests: [{ expected: "Hello with" }], hint: "Two with blocks.", solution: py`
with open("w.txt", "w") as f:
    f.write("Hello with")
with open("w.txt") as f:
    print(f.read())` },
        { prompt: "Write the words `red`, `green`, `blue` (one per line) to `colors.txt` with `with`, then read the file and print the longest word.", tests: [{ expected: "green" }], hint: "max(words, key=len)", solution: py`
with open("colors.txt", "w") as f:
    f.write("red\ngreen\nblue\n")
with open("colors.txt") as f:
    words = f.read().split()
print(max(words, key=len))` },
        { prompt: "Write three lines to `src.txt`, then copy it to `dst.txt` in upper case, then print `dst.txt`.", tests: [{ expected: out("ONE", "TWO", "THREE") }], hint: "dst.write(src.read().upper())", solution: py`
with open("src.txt", "w") as f:
    f.write("one\ntwo\nthree\n")
with open("src.txt") as src, open("dst.txt", "w") as dst:
    dst.write(src.read().upper())
with open("dst.txt") as f:
    print(f.read())` },
      ],
      quiz: [
        { q: "What is the main benefit of `with open(...)`?", options: ["Faster reading", "Automatically closes the file", "Creates backups", "Encrypts the file"], answer: 1, explain: "The file is closed when the block ends." },
        { q: "Is the file closed if an error happens inside the with block?", options: ["Yes", "No"], answer: 0, explain: "with guarantees clean-up." },
      ],
    },
    {
      id: "m11-csv",
      title: "Working with text and CSV files",
      minutes: 10,
      intro: `**CSV** (Comma-Separated Values) is a simple format for tables. Each line is a row; commas separate the columns:

\`name,age\`
\`Ana,15\`
\`Ben,17\`

Python's built-in **\`csv\`** module reads and writes it correctly (it handles tricky cases like commas inside quotes):

- \`csv.reader(f)\` — each row is a **list** of strings.
- \`csv.DictReader(f)\` — each row is a **dict** using the header as keys.
- \`csv.writer(f).writerow([...])\` — write a row.

Open CSV files for writing with \`newline=""\` to avoid blank lines on Windows. Remember: values come back as **strings** — convert numbers with int()/float().`,
      syntax: py`
import csv
with open("data.csv") as f:
    for row in csv.DictReader(f):
        print(row["name"])`,
      examples: [
        { title: "Writing a CSV", code: py`
import csv
with open("people.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "age"])
    w.writerow(["Ana", 15])
    w.writerow(["Ben", 17])
print(open("people.csv").read())` },
        { title: "Reading with DictReader", code: py`
import csv
with open("people.csv") as f:
    for row in csv.DictReader(f):
        print(row["name"], "is", row["age"])` },
      ],
      realWorld: `Banks, schools and online shops let you "Export to CSV" so data can be opened in Excel or analysed with Python.`,
      mistakes: [
        { wrong: py`total += row["age"]`, right: py`total += int(row["age"])`, why: "CSV values are always strings." },
      ],
      tryIt: py`
import csv
with open("sales.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["item", "price"])
    w.writerows([["pen", "1.5"], ["book", "12"], ["bag", "30"]])
with open("sales.csv") as f:
    total = sum(float(r["price"]) for r in csv.DictReader(f))
print("Total sales:", total)`,
      practice: [
        { prompt: "Write a CSV `scores.csv` with header `name,score` and rows `Ana,80` and `Ben,90`. Then read it with DictReader and print the average score (`85.0`).", tests: [{ expected: "85.0" }], hint: "Collect int(row['score']) into a list.", solution: py`
import csv
with open("scores.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "score"])
    w.writerow(["Ana", 80])
    w.writerow(["Ben", 90])
scores = []
with open("scores.csv") as f:
    for row in csv.DictReader(f):
        scores.append(int(row["score"]))
print(sum(scores) / len(scores))` },
        { prompt: "Split the CSV line `\"Tashkent,Uzbekistan,2900000\"` by commas and print the second field.", tests: [{ expected: "Uzbekistan" }], hint: 'line.split(",")[1]', solution: py`
line = "Tashkent,Uzbekistan,2900000"
print(line.split(",")[1])` },
        { prompt: "Write a CSV with header `city,temp` and rows (`Oslo`, 5), (`Cairo`, 30), (`Lima`, 18). Read it back and print the name of the hottest city.", tests: [{ expected: "Cairo" }], hint: "Track the best row while looping, or use max with key.", solution: py`
import csv
with open("t.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["city", "temp"])
    w.writerows([["Oslo", 5], ["Cairo", 30], ["Lima", 18]])
with open("t.csv") as f:
    rows = list(csv.DictReader(f))
hottest = max(rows, key=lambda r: int(r["temp"]))
print(hottest["city"])` },
      ],
      quiz: [
        { q: "What type are values read from a CSV file?", options: ["int", "str", "It depends", "float"], answer: 1, explain: "Everything comes back as strings." },
        { q: "What does DictReader use as dictionary keys?", options: ["Row numbers", "The header row", "Random names", "The first column values"], answer: 1, explain: "The first row is used as keys." },
      ],
    },
    {
      id: "m11-paths",
      title: "File paths",
      minutes: 7,
      intro: `A **path** tells Python where a file is.

- A **relative path** like \`"data.txt"\` or \`"notes/today.txt"\` starts from the **current working directory** (the folder the program runs in).
- An **absolute path** gives the full location: \`"/home/user/data.txt"\` on Mac/Linux or \`"C:\\\\Users\\\\Ana\\\\data.txt"\` on Windows.

Useful tools:

- \`os.getcwd()\` — current folder.
- \`os.makedirs("folder", exist_ok=True)\` — create folders.
- \`os.listdir(".")\` — list files.
- \`os.path.join("folder", "file.txt")\` — build paths that work on every system.
- The modern \`pathlib.Path\` class does all this with a friendly object.`,
      syntax: py`
import os
path = os.path.join("data", "scores.txt")`,
      examples: [
        { title: "Folders and joined paths", code: py`
import os
os.makedirs("reports", exist_ok=True)
path = os.path.join("reports", "jan.txt")
with open(path, "w") as f:
    f.write("January report")
print(os.listdir("reports"))` },
        { title: "pathlib", code: py`
from pathlib import Path
p = Path("reports") / "feb.txt"
p.write_text("February")
print(p.read_text(), p.suffix, p.name)` },
      ],
      realWorld: `Apps store files in organised folders (\`uploads/2026/11/photo.png\`). Building paths with os.path.join keeps code working on Windows, Mac and Linux.`,
      mistakes: [
        { wrong: py`path = "reports" + "/" + "jan.txt"`, right: py`path = os.path.join("reports", "jan.txt")`, why: "Hand-built paths may use the wrong separator on another system." },
      ],
      tryIt: py`
from pathlib import Path
folder = Path("my_folder")
folder.mkdir(exist_ok=True)
(folder / "a.txt").write_text("A")
(folder / "b.txt").write_text("B")
print(sorted(p.name for p in folder.iterdir()))`,
      practice: [
        { prompt: 'Use `os.path.join` to build the path from `"music"` and `"song.mp3"` and print it.', tests: [{ expected: "music/song.mp3" }], hint: "import os first.", solution: py`
import os
print(os.path.join("music", "song.mp3"))` },
        { prompt: "Create a folder `box` (exist_ok=True), write `x` into `box/item.txt` and print the sorted list of files in `box`.", tests: [{ expected: "['item.txt']" }], hint: "os.makedirs, then open(os.path.join(...), 'w'), then sorted(os.listdir('box'))", solution: py`
import os
os.makedirs("box", exist_ok=True)
with open(os.path.join("box", "item.txt"), "w") as f:
    f.write("x")
print(sorted(os.listdir("box")))` },
        { prompt: 'Using pathlib, print the file extension (suffix) of `Path("photo.final.png")`.', tests: [{ expected: ".png" }], hint: "Path(...).suffix", solution: py`
from pathlib import Path
print(Path("photo.final.png").suffix)` },
      ],
      quiz: [
        { q: "`\"data/file.txt\"` is a…", options: ["Relative path", "Absolute path"], answer: 0, explain: "It does not start from the root of the drive." },
        { q: "Why use os.path.join?", options: ["It is faster", "It uses the correct separator for each operating system", "It creates the file"], answer: 1, explain: "Portable paths." },
      ],
    },
  ],
};
