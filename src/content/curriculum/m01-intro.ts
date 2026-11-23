import type { Module } from "../types";
import { out, py } from "../helpers";

export const m01: Module = {
  id: "m1",
  number: 1,
  title: "Introduction to Python",
  description: "What programming is, why Python is a great first language, and your very first program.",
  icon: "rocket",
  lessons: [
    {
      id: "m1-what-is-programming",
      title: "What is programming?",
      minutes: 6,
      intro: `**Programming** means writing instructions for a computer. A computer is very fast, but it cannot guess what you want. You must tell it exactly what to do, step by step.

A list of instructions is called a **program**. The language you write those instructions in is a **programming language**. Python is one of them.

Think of a recipe. A recipe says: "Break two eggs. Add sugar. Mix for one minute." A program is the same idea, but for a computer:

- Show a message on the screen.
- Add two numbers.
- Repeat something ten times.

The computer follows your instructions **in order**, from top to bottom, exactly as written.`,
      syntax: py`print("This is an instruction")`,
      examples: [
        {
          title: "A program with three instructions",
          code: py`
print("Step 1: Wake up")
print("Step 2: Drink water")
print("Step 3: Learn Python")`,
          note: "Python runs line 1, then line 2, then line 3.",
        },
        {
          title: "Computers are great at math",
          code: py`print(12345 * 6789)`,
          note: "The computer answers instantly: 83810205.",
        },
      ],
      realWorld: `Programs are everywhere: the alarm on your phone, the game you play, the website that shows you videos, and the traffic lights on your street are all controlled by programs that someone wrote.`,
      mistakes: [
        {
          wrong: py`Print("Hello")`,
          right: py`print("Hello")`,
          why: "Computers are exact. Python knows `print` but not `Print` — capital letters matter.",
        },
      ],
      tryIt: py`
print("Hello! I am a program.")
print("I follow instructions in order.")`,
      practice: [
        {
          prompt: "Write a program that prints exactly: `I can program!`",
          starter: py`# Write your instruction below
`,
          tests: [{ expected: "I can program!" }],
          hint: 'Use print("...") and put the text inside quotes.',
          solution: py`print("I can program!")`,
        },
        {
          prompt: "Print three lines: `One`, `Two`, `Three` (each on its own line, in that order).",
          tests: [{ expected: out("One", "Two", "Three") }],
          hint: "Use three print() instructions, one per line.",
          solution: py`
print("One")
print("Two")
print("Three")`,
        },
        {
          prompt: "Make the computer calculate and print the result of `7 * 6`.",
          tests: [{ expected: "42" }],
          hint: "You can put math inside print() without quotes: print(7 * 6).",
          solution: py`print(7 * 6)`,
        },
      ],
      quiz: [
        {
          q: "What is a program?",
          options: ["A list of instructions for a computer", "A type of computer screen", "A website", "A keyboard shortcut"],
          answer: 0,
          explain: "A program is a set of instructions the computer follows in order.",
        },
        {
          q: "In which order does Python run these lines?",
          code: py`
print("A")
print("B")`,
          options: ["B then A", "A then B", "Both at the same time", "Random order"],
          answer: 1,
          explain: "Python runs code from top to bottom.",
        },
      ],
    },
    {
      id: "m1-what-is-python",
      title: "What is Python and why use it?",
      minutes: 6,
      intro: `**Python** is a programming language created by Guido van Rossum and first released in 1991. It was designed to be **easy to read** — Python code often looks almost like English.

Why do so many beginners (and professionals) choose Python?

- **Readable:** short, clean code with very few strange symbols.
- **Versatile:** used for websites, data analysis, artificial intelligence, automation, games and science.
- **Huge community:** millions of people use it, so help is easy to find.
- **Free:** anyone can download and use Python.

Companies like Google, Netflix, Instagram and NASA use Python every day.`,
      syntax: py`print("Python is readable!")`,
      examples: [
        {
          title: "Python reads like English",
          code: py`
age = 15
if age >= 13:
    print("You are a teenager or older")`,
          note: "Even without knowing Python, you can probably guess what this does.",
        },
        {
          title: "Python as a calculator",
          code: py`
print(2 + 3)
print(100 / 4)`,
        },
      ],
      realWorld: `Scientists use Python to analyse space images, doctors use it to study medical data, and AI tools like chatbots are mostly built with Python.`,
      mistakes: [
        {
          wrong: py`print "Hello"`,
          right: py`print("Hello")`,
          why: "This is old Python 2 style. In Python 3 (what we learn), print always needs brackets.",
        },
      ],
      tryIt: py`
print("Python was released in", 1991)
print("That is", 2026 - 1991, "years ago")`,
      practice: [
        {
          prompt: "Print the text `Python is fun`.",
          tests: [{ expected: "Python is fun" }],
          hint: 'print("Python is fun")',
          solution: py`print("Python is fun")`,
        },
        {
          prompt: "Python was first released in 1991. Print how many years passed until 2000 by calculating `2000 - 1991`.",
          tests: [{ expected: "9" }],
          hint: "Put the subtraction inside print() without quotes.",
          solution: py`print(2000 - 1991)`,
        },
        {
          prompt: "Print two lines: `Easy to read` then `Easy to learn`.",
          tests: [{ expected: out("Easy to read", "Easy to learn") }],
          hint: "Two print() lines.",
          solution: py`
print("Easy to read")
print("Easy to learn")`,
        },
      ],
      quiz: [
        {
          q: "Which of these is a main reason beginners choose Python?",
          options: ["It is very hard to read", "It is easy to read and write", "It only works on one computer", "It costs a lot of money"],
          answer: 1,
          explain: "Python is famous for being readable and beginner-friendly.",
        },
        {
          q: "Which is correct Python 3 code?",
          options: ['print "Hi"', 'print("Hi")', 'Print("Hi")', 'echo("Hi")'],
          answer: 1,
          explain: "In Python 3, print is a function and needs brackets. It is all lowercase.",
        },
      ],
    },
    {
      id: "m1-setup",
      title: "Installing Python and choosing an editor",
      minutes: 8,
      intro: `To write Python on your own computer you need two things:

- **Python itself** — the program that understands and runs your code (called the **interpreter**).
- **A code editor** — a program where you type your code.

**Installing Python**

- **Windows:** go to python.org, download the latest Python 3, run the installer and tick **"Add python.exe to PATH"** before clicking Install.
- **macOS:** download the installer from python.org, or use Homebrew with \`brew install python\`.
- **Linux:** Python is usually already installed. Check with \`python3 --version\` in the terminal.

**Choosing an editor (IDE)**

An **IDE** (Integrated Development Environment) is a code editor with extra helpers like colors, error highlighting and a Run button.

- **VS Code** — free, popular, works everywhere (install the Python extension).
- **PyCharm Community** — free, made just for Python.
- **Thonny** — very simple, made for beginners.
- **IDLE** — comes with Python automatically.

**Good news:** on PyNest you do not need to install anything. Our editor runs real Python inside your browser.`,
      syntax: py`
# In a terminal you can check your version:
#   python3 --version
# And run a file:
#   python3 hello.py
print("Running!")`,
      examples: [
        {
          title: "A file called hello.py",
          code: py`
# Save this as hello.py, then run: python3 hello.py
print("Hello from my own computer!")`,
        },
        {
          title: "Checking the Python version from code",
          code: py`
import sys
print(sys.version_info.major)`,
          note: "This prints 3, because we use Python 3.",
        },
      ],
      realWorld: `Professional developers spend most of their day in an editor like VS Code. Learning to use one early makes you comfortable with real-world tools.`,
      mistakes: [
        {
          wrong: "Installing Python on Windows without ticking “Add python.exe to PATH”.",
          right: "Re-run the installer, choose Modify, and enable “Add Python to environment variables”.",
          why: "Without PATH, typing `python` in the terminal shows “command not found”.",
        },
        {
          wrong: "Saving your file as hello.txt",
          right: "Save it as hello.py",
          why: "Python files must end in .py so editors and Python recognise them.",
        },
      ],
      tryIt: py`
import sys
print("You are running Python", sys.version.split()[0])`,
      practice: [
        {
          prompt: "Print `I am ready to code`.",
          tests: [{ expected: "I am ready to code" }],
          hint: "Use print with quotes.",
          solution: py`print("I am ready to code")`,
        },
        {
          prompt: "Use `import sys` and print `sys.version_info.major` (the main Python version number).",
          tests: [{ expected: "3" }],
          hint: "First line: import sys. Second line: print(sys.version_info.major)",
          solution: py`
import sys
print(sys.version_info.major)`,
        },
        {
          prompt: "Print the name of your favourite editor from this list exactly as written: `VS Code`.",
          tests: [{ expected: "VS Code" }],
          hint: 'print("VS Code")',
          solution: py`print("VS Code")`,
        },
      ],
      quiz: [
        {
          q: "What is the program that actually runs your Python code called?",
          options: ["The interpreter", "The browser", "The keyboard", "The compiler cable"],
          answer: 0,
          explain: "The Python interpreter reads your code and runs it.",
        },
        {
          q: "Which file name is correct for a Python program?",
          options: ["game.txt", "game.python", "game.py", "game.doc"],
          answer: 2,
          explain: "Python files end with .py.",
        },
      ],
    },
    {
      id: "m1-first-program",
      title: "Your first Python program",
      minutes: 5,
      intro: `It is tradition for programmers to start with a program that says **Hello, World!**. Let's write it.

\`print("Hello, World!")\`

That is the whole program. Here is what each part means:

- \`print\` — a built-in Python command (a **function**) that shows something on the screen.
- \`( )\` — brackets hold what you want to give to print.
- \`"Hello, World!"\` — text inside quotes. Text in Python is called a **string**.

Press **Run** in the editor below and you will see the text appear in the output area. Congratulations — you are now a programmer!`,
      syntax: py`print("your text here")`,
      examples: [
        { title: "Hello, World!", code: py`print("Hello, World!")` },
        {
          title: "Say hello to yourself",
          code: py`
print("Hello, Alex!")
print("Welcome to Python.")`,
        },
      ],
      realWorld: `Every app you have ever used shows messages to its users. "Your order was placed", "Wrong password", "Level complete!" — all start with the simple idea of displaying text.`,
      mistakes: [
        { wrong: py`print(Hello, World!)`, right: py`print("Hello, World!")`, why: "Text must be inside quotes, otherwise Python thinks Hello is a name it should know." },
        { wrong: py`print("Hello, World!"`, right: py`print("Hello, World!")`, why: "Every opening bracket needs a closing bracket." },
      ],
      tryIt: py`print("Hello, World!")`,
      practice: [
        {
          prompt: "Print exactly `Hello, World!`",
          tests: [{ expected: "Hello, World!" }],
          hint: "Copy the example — capital H, comma, capital W, exclamation mark.",
          solution: py`print("Hello, World!")`,
        },
        {
          prompt: "Print `Hello, Python!`",
          tests: [{ expected: "Hello, Python!" }],
          hint: 'print("Hello, Python!")',
          solution: py`print("Hello, Python!")`,
        },
        {
          prompt: "Print two lines: `My first program` and `It works!`",
          tests: [{ expected: out("My first program", "It works!") }],
          hint: "Use two print() lines.",
          solution: py`
print("My first program")
print("It works!")`,
        },
      ],
      quiz: [
        {
          q: "What does print() do?",
          options: ["Sends a file to the printer", "Shows output on the screen", "Deletes text", "Saves a file"],
          answer: 1,
          explain: "In Python, print() displays output on the screen (console).",
        },
        {
          q: "Why do we put quotes around Hello, World!?",
          options: ["To make it bold", "Because it is text (a string)", "Quotes are optional decoration", "To make it a number"],
          answer: 1,
          explain: "Quotes tell Python that something is text, not code.",
        },
      ],
    },
    {
      id: "m1-print",
      title: "Understanding print()",
      minutes: 8,
      intro: `\`print()\` can do more than show one piece of text.

**Print several things at once.** Separate them with commas. Python puts a space between them automatically.

**Print numbers.** Numbers do not need quotes. You can even do math inside print.

**Change the separator** with \`sep=\`, and change what is printed at the **end** with \`end=\`. By default, \`end\` is a new line, which is why each print starts on a new line.

**An empty print()** prints a blank line.`,
      syntax: py`print(value1, value2, sep=" ", end="\n")`,
      examples: [
        {
          title: "Several values",
          code: py`
print("I am", 15, "years old")
print("2 + 2 =", 2 + 2)`,
          note: "Output: I am 15 years old / 2 + 2 = 4",
        },
        {
          title: "sep and end",
          code: py`
print("2026", "11", "23", sep="-")
print("Loading", end="...")
print("done")`,
          note: "Output: 2026-11-23 and Loading...done",
        },
      ],
      realWorld: `Programs print receipts, scoreboards and reports. Controlling spacing with sep and end is how you make output look neat.`,
      mistakes: [
        { wrong: py`print("Age: " 15)`, right: py`print("Age:", 15)`, why: "Separate different values with a comma." },
        { wrong: py`print("5 + 5")`, right: py`print(5 + 5)`, why: "With quotes Python prints the text 5 + 5. Without quotes it calculates 10." },
      ],
      tryIt: py`
print("Name:", "Alex")
print("Score:", 90 + 5)
print()
print("a", "b", "c", sep=" | ")`,
      practice: [
        {
          prompt: 'Print `Score: 100` using **two values** separated by a comma: the text `"Score:"` and the number `100`.',
          tests: [{ expected: "Score: 100" }],
          hint: 'print("Score:", 100)',
          solution: py`print("Score:", 100)`,
        },
        {
          prompt: "Print `10/20/2030` by giving print the three numbers 10, 20 and 2030 and using `sep=\"/\"`.",
          tests: [{ expected: "10/20/2030" }],
          hint: 'print(10, 20, 2030, sep="/")',
          solution: py`print(10, 20, 2030, sep="/")`,
        },
        {
          prompt: 'Use two print() calls but make the output one line: `Hello World`. (Hint: `end=" "`)',
          tests: [{ expected: "Hello World" }],
          hint: 'print("Hello", end=" ") then print("World")',
          solution: py`
print("Hello", end=" ")
print("World")`,
        },
      ],
      quiz: [
        {
          q: "What is the output?",
          code: py`print("a", "b", sep="")`,
          options: ["a b", "ab", "a,b", "a\nb"],
          answer: 1,
          explain: 'sep="" means nothing is put between the values.',
        },
        {
          q: "What is the output?",
          code: py`print(3 * 3)`,
          options: ["3 * 3", "9", "33", "Error"],
          answer: 1,
          explain: "Without quotes, Python calculates 3 * 3 = 9.",
        },
      ],
    },
    {
      id: "m1-comments",
      title: "Comments",
      minutes: 5,
      intro: `A **comment** is a note for humans. Python completely ignores it.

Start a comment with the **#** symbol. Everything after \`#\` on that line is ignored.

Why write comments?

- To explain **why** your code does something.
- To leave notes for your future self (you will forget!).
- To temporarily turn off a line of code without deleting it ("commenting out").

For longer notes, put \`#\` at the start of every line.`,
      syntax: py`
# This is a comment
print("Hi")  # a comment can also go after code`,
      examples: [
        {
          title: "Explaining code",
          code: py`
# Calculate the price with a 10% discount
price = 50
print(price * 0.9)  # 45.0`,
        },
        {
          title: "Commenting out a line",
          code: py`
print("This runs")
# print("This does not run")`,
        },
      ],
      realWorld: `In real teams, good comments help other developers understand code quickly. Many companies require comments on tricky parts of the code.`,
      mistakes: [
        { wrong: py`// this is a comment`, right: py`# this is a comment`, why: "// is used in other languages like JavaScript. Python uses #." },
      ],
      tryIt: py`
# My comment is ignored
print("Only this line shows")  # this note is ignored too`,
      practice: [
        {
          prompt: "This code prints two lines. Comment out the second print so only `Keep me` appears.",
          starter: py`
print("Keep me")
print("Hide me")`,
          tests: [{ expected: "Keep me" }],
          hint: "Put # at the start of the second line.",
          solution: py`
print("Keep me")
# print("Hide me")`,
        },
        {
          prompt: "Write a comment that says `My greeting`, then on the next line print `Hello`.",
          tests: [{ expected: "Hello" }],
          hint: "# My greeting  (new line)  print(\"Hello\")",
          solution: py`
# My greeting
print("Hello")`,
        },
        {
          prompt: "Print `5` and add a comment at the end of the same line explaining it.",
          tests: [{ expected: "5" }],
          hint: "print(5)  # any note",
          solution: py`print(5)  # prints the number five`,
        },
      ],
      quiz: [
        {
          q: "Which symbol starts a comment in Python?",
          options: ["//", "#", "--", "/*"],
          answer: 1,
          explain: "Python comments start with #.",
        },
        {
          q: "What is printed?",
          code: py`
# print("A")
print("B")`,
          options: ["A", "B", "A and B", "Nothing"],
          answer: 1,
          explain: "The first line is a comment, so only B is printed.",
        },
      ],
    },
    {
      id: "m1-syntax",
      title: "Basic Python syntax",
      minutes: 8,
      intro: `**Syntax** means the grammar rules of a language. Python's rules are simple but strict:

- **One instruction per line.** Each line is usually one statement.
- **Case-sensitive.** \`print\` works, \`Print\` and \`PRINT\` do not.
- **Indentation matters.** Spaces at the start of a line are meaningful. Code that belongs to an \`if\` or loop must be indented (usually 4 spaces). Normal code should not start with spaces.
- **Brackets and quotes come in pairs.** Every \`(\` needs a \`)\`, every \`"\` needs a closing \`"\`.
- **A colon \`:\`** ends lines that start a block, like \`if\`, \`for\` and \`def\`.

If you break a rule, Python stops and shows a **SyntaxError** or **IndentationError**. That is normal — errors are how Python tells you what to fix.`,
      syntax: py`
if 5 > 3:
    print("Indented code belongs to the if")
print("Not indented: always runs")`,
      examples: [
        {
          title: "Indentation creates a block",
          code: py`
temperature = 30
if temperature > 25:
    print("It is hot")
    print("Drink water")
print("Have a nice day")`,
        },
        {
          title: "Case-sensitivity",
          code: py`
name = "Sam"
Name = "Lee"
print(name, Name)`,
          note: "name and Name are two different variables.",
        },
      ],
      realWorld: `Python's indentation rule forces code to look tidy. That is one reason why Python code written by different people still looks similar and readable.`,
      mistakes: [
        { wrong: py`
if 5 > 3:
print("yes")`, right: py`
if 5 > 3:
    print("yes")`, why: "Code inside an if must be indented, otherwise you get an IndentationError." },
        { wrong: py`if 5 > 3
    print("yes")`, right: py`if 5 > 3:
    print("yes")`, why: "Lines that start a block must end with a colon." },
      ],
      tryIt: py`
score = 80
if score >= 50:
    print("You passed!")
print("Thanks for playing")`,
      practice: [
        {
          prompt: "Fix the code so it runs and prints `Big number`.",
          starter: py`
if 100 > 10
print("Big number")`,
          tests: [{ expected: "Big number" }],
          hint: "Add a colon after the condition and indent the print with 4 spaces.",
          solution: py`
if 100 > 10:
    print("Big number")`,
        },
        {
          prompt: "Fix the capitalisation error so this prints `Hi`.",
          starter: py`Print("Hi")`,
          tests: [{ expected: "Hi" }],
          hint: "print is all lowercase.",
          solution: py`print("Hi")`,
        },
        {
          prompt: "Fix the missing bracket so this prints `Done`.",
          starter: py`print("Done"`,
          tests: [{ expected: "Done" }],
          hint: "Every ( needs a ).",
          solution: py`print("Done")`,
        },
      ],
      quiz: [
        {
          q: "What does Python use to group code inside an if statement?",
          options: ["Curly braces { }", "Indentation (spaces)", "Semicolons ;", "The word END"],
          answer: 1,
          explain: "Python uses indentation, usually 4 spaces.",
        },
        {
          q: "Which error do you get when indentation is wrong?",
          options: ["NameError", "IndentationError", "ZeroDivisionError", "KeyError"],
          answer: 1,
          explain: "Python raises an IndentationError for incorrect indentation.",
        },
      ],
    },
    {
      id: "m1-execution",
      title: "How Python executes code",
      minutes: 7,
      intro: `When you press Run, the Python **interpreter** reads your program and runs it **line by line, from top to bottom**.

Here is what happens:

- Python first checks the whole file for **syntax** mistakes. If it finds one, nothing runs.
- Then it runs line 1, then line 2, and so on.
- If a line causes an error while running (a **runtime error**), Python **stops** at that line. Lines after it do not run.
- Lines that already ran still produced their output.

This is why reading an error message carefully is so important: it tells you the **line number** where Python stopped.`,
      syntax: py`
print("Line 1 runs first")
print("Line 2 runs second")`,
      examples: [
        {
          title: "Python stops at a runtime error",
          code: py`
print("Start")
print(10 / 0)
print("This never prints")`,
          note: "You will see Start, then a ZeroDivisionError on line 2.",
        },
        {
          title: "Order matters",
          code: py`
x = 5
print(x)
x = 10
print(x)`,
          note: "Prints 5 then 10, because x changed between the two prints.",
        },
      ],
      realWorld: `Debugging (finding mistakes) is mostly about following the code like the interpreter does: line by line, checking what each line does.`,
      mistakes: [
        { wrong: py`
print(total)
total = 5`, right: py`
total = 5
print(total)`, why: "You must create something before you use it. Python reads top to bottom." },
      ],
      tryIt: py`
print("First")
print("Second")
print("Third")`,
      practice: [
        {
          prompt: "Reorder the lines so the output is `1`, `2`, `3` on separate lines.",
          starter: py`
print(3)
print(1)
print(2)`,
          tests: [{ expected: out(1, 2, 3) }],
          hint: "Python runs from top to bottom.",
          solution: py`
print(1)
print(2)
print(3)`,
        },
        {
          prompt: "This code crashes. Fix it by moving the line that creates `name` above the print, so it prints `Ada`.",
          starter: py`
print(name)
name = "Ada"`,
          tests: [{ expected: "Ada" }],
          hint: "Create the variable first, then print it.",
          solution: py`
name = "Ada"
print(name)`,
        },
        {
          prompt: "Remove the line that causes the crash so the program prints `before` and `after`.",
          starter: py`
print("before")
print(1 / 0)
print("after")`,
          tests: [{ expected: out("before", "after") }],
          hint: "Delete (or comment out) the line with 1 / 0.",
          solution: py`
print("before")
print("after")`,
        },
      ],
      quiz: [
        {
          q: "What is printed before the error?",
          code: py`
print("A")
print(5 / 0)
print("B")`,
          options: ["Nothing", "A", "A and B", "B"],
          answer: 1,
          explain: "Line 1 runs and prints A. Line 2 crashes, so line 3 never runs.",
        },
        {
          q: "How does Python run a program?",
          options: ["Bottom to top", "Randomly", "Top to bottom, line by line", "Only the last line"],
          answer: 2,
          explain: "The interpreter executes statements from top to bottom.",
        },
      ],
    },
  ],
};
