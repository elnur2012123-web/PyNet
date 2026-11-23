import type { Module } from "../types";
import { out, py } from "../helpers";

export const m12: Module = {
  id: "m12",
  number: 12,
  title: "Modules and Libraries",
  description: "Reuse code with import, explore the standard library and meet pip.",
  icon: "package",
  lessons: [
    {
      id: "m12-import",
      title: "What are modules? import and from import",
      minutes: 8,
      intro: `A **module** is a Python file full of ready-made code (functions, variables, classes) that you can use in your program. Python comes with hundreds of them — this collection is called the **standard library**.

Ways to import:

- \`import math\` — then use \`math.sqrt(16)\`. The module name keeps things organised.
- \`from math import sqrt, pi\` — use \`sqrt(16)\` directly.
- \`import math as m\` — a shorter **alias**: \`m.sqrt(16)\`.
- Avoid \`from math import *\` — it dumps everything into your program and can hide name clashes.

Imports usually go at the **top** of the file.`,
      syntax: py`
import math
from random import randint
import datetime as dt`,
      examples: [
        { title: "Two import styles", code: py`
import math
print(math.pi)
from math import sqrt
print(sqrt(81))` },
        { title: "Using an alias", code: py`
import statistics as st
print(st.mean([2, 4, 9]))` },
      ],
      realWorld: `Nobody writes everything from scratch. Professional code is mostly imports of well-tested modules plus a little glue code.`,
      mistakes: [
        { wrong: py`
import math
print(sqrt(4))`, right: py`
import math
print(math.sqrt(4))`, why: "With import math, you must write math.sqrt. Only from math import sqrt lets you use sqrt directly." },
      ],
      tryIt: py`
from math import floor, ceil
print(floor(3.7), ceil(3.2))`,
      practice: [
        { prompt: "Import math and print `math.factorial(5)`.", tests: [{ expected: "120" }], hint: "import math", solution: py`
import math
print(math.factorial(5))` },
        { prompt: "Use `from math import pi` and print pi rounded to 2 decimals using round().", tests: [{ expected: "3.14" }], hint: "round(pi, 2)", solution: py`
from math import pi
print(round(pi, 2))` },
        { prompt: "Import the `statistics` module as `st` and print the median of `[3, 1, 7, 5, 9]`.", tests: [{ expected: "5" }], hint: "st.median([...])", solution: py`
import statistics as st
print(st.median([3, 1, 7, 5, 9]))` },
      ],
      quiz: [
        { q: "After `from math import sqrt`, how do you call it?", options: ["math.sqrt(9)", "sqrt(9)", "import.sqrt(9)"], answer: 1, explain: "It is imported directly into your program." },
        { q: "What is the standard library?", options: ["A website", "Modules that come with Python", "A book", "Packages you must buy"], answer: 1, explain: "It ships with every Python installation." },
      ],
    },
    {
      id: "m12-own-modules",
      title: "Creating your own modules",
      minutes: 8,
      intro: `Any \`.py\` file can be a module! If you save functions in \`helpers.py\`, another file in the same folder can do \`import helpers\`.

This lets you split a big program into tidy files: \`game.py\`, \`player.py\`, \`utils.py\`.

**\`if __name__ == "__main__":\`** — code inside this block runs only when the file is run directly, **not** when it is imported. Use it for tests or demo code in a module.

*In PyNest's editor everything is one file, but we can simulate a module by writing a .py file and importing it — try the example!*`,
      syntax: py`
# helpers.py
def greet(name):
    return f"Hi {name}"

# main.py
import helpers
print(helpers.greet("Ana"))`,
      examples: [
        { title: "Make a module and import it", code: py`
code = '''
def area(r):
    return 3.14159 * r * r

UNIT = "cm"
'''
with open("shapes.py", "w") as f:
    f.write(code)

import shapes
print(round(shapes.area(2), 2), shapes.UNIT)` },
        { title: "The __main__ guard", code: py`
def main():
    print("Running as a program")

if __name__ == "__main__":
    main()` },
      ],
      realWorld: `Large projects like Instagram's backend have thousands of modules, each focused on one area.`,
      mistakes: [
        { wrong: "Naming your own file random.py or math.py", right: "Use unique names like my_tools.py", why: "Your file would shadow the real module, and imports would break mysteriously." },
      ],
      tryIt: py`
with open("mytools.py", "w") as f:
    f.write("def shout(t):\n    return t.upper() + '!'\n")

import mytools
print(mytools.shout("modules are cool"))`,
      practice: [
        { prompt: "Write a file `calc.py` containing `def double(x): return x * 2`, then import calc and print `calc.double(21)`.", tests: [{ expected: "42" }], hint: "Write the file with open(...,'w'), then import calc.", solution: py`
with open("calc.py", "w") as f:
    f.write("def double(x):\n    return x * 2\n")
import calc
print(calc.double(21))` },
        { prompt: "Write `greetings.py` containing `HELLO = \"hello\"`. Use `from greetings import HELLO` and print it.", tests: [{ expected: "hello" }], hint: "from greetings import HELLO", solution: py`
with open("greetings.py", "w") as f:
    f.write('HELLO = "hello"\n')
from greetings import HELLO
print(HELLO)` },
        { prompt: "Print the value of `__name__` when the code runs directly.", tests: [{ expected: "__main__" }], hint: "print(__name__)", solution: py`print(__name__)` },
      ],
      quiz: [
        { q: "What is a module, at its simplest?", options: ["A .py file", "A folder", "A function", "A variable"], answer: 0, explain: "Any Python file can be imported as a module." },
        { q: "When does code under `if __name__ == \"__main__\":` run?", options: ["Always", "Only when the file is run directly", "Only when imported"], answer: 1, explain: "It is skipped on import." },
      ],
    },
    {
      id: "m12-pip-stdlib",
      title: "Installing packages with pip and the standard library",
      minutes: 7,
      intro: `**The standard library** covers a lot: math, random numbers, dates, files, JSON, CSV, web requests (\`urllib\`), and more. Always check it first.

**Third-party packages** are modules written by the community, shared on **PyPI** (the Python Package Index). You install them with **pip**, Python's package installer, in your computer's terminal:

\`pip install requests\`

Useful commands:

- \`pip install name\` — install
- \`pip list\` — see installed packages
- \`pip uninstall name\` — remove
- \`pip install -r requirements.txt\` — install everything a project needs

Professionals use a **virtual environment** (\`python -m venv .venv\`) so each project has its own packages.

*The PyNest browser editor cannot run pip; it includes the full standard library.*`,
      syntax: py`
# In the terminal (not in Python):
#   pip install requests
import json
print(json.dumps({"ok": True}))`,
      examples: [
        { title: "json from the standard library", code: py`
import json
data = {"name": "Ana", "skills": ["python", "sql"]}
text = json.dumps(data)
print(text)
back = json.loads(text)
print(back["skills"][0])` },
        { title: "collections.Counter", code: py`
from collections import Counter
votes = ["red", "blue", "red", "green", "red"]
print(Counter(votes).most_common(1))` },
      ],
      realWorld: `Popular packages: requests (web), pandas (data), Django/Flask (websites), pygame (games), scikit-learn (machine learning).`,
      mistakes: [
        { wrong: py`pip install requests  # typed inside a .py file`, right: "Run pip install requests in the terminal / command prompt.", why: "pip is a terminal command, not Python code — in a .py file it is a SyntaxError." },
      ],
      tryIt: py`
import json
settings = {"theme": "dark", "volume": 7}
print(json.dumps(settings, indent=2))`,
      practice: [
        { prompt: 'Use json.dumps to convert `{"a": 1}` to a string and print it.', tests: [{ expected: '{"a": 1}' }], hint: "import json", solution: py`
import json
print(json.dumps({"a": 1}))` },
        { prompt: 'Use json.loads to parse `\'{"score": 42}\'` and print the score.', tests: [{ expected: "42" }], hint: 'json.loads(text)["score"]', solution: py`
import json
data = json.loads('{"score": 42}')
print(data["score"])` },
        { prompt: 'Use `collections.Counter` to print how many times `"a"` appears in `"banana"`.', tests: [{ expected: "3" }], hint: 'Counter("banana")["a"]', solution: py`
from collections import Counter
print(Counter("banana")["a"])` },
      ],
      quiz: [
        { q: "Where do you run `pip install`?", options: ["Inside a .py file", "In the terminal", "In the browser address bar"], answer: 1, explain: "pip is a command-line tool." },
        { q: "What is PyPI?", options: ["A Python editor", "The Python Package Index", "A math module", "An error type"], answer: 1, explain: "PyPI hosts community packages." },
      ],
    },
    {
      id: "m12-random-math",
      title: "The random and math modules",
      minutes: 8,
      intro: `**random** — for games, simulations and picking things:

- \`random.randint(1, 6)\` — a whole number from 1 to 6 (**both included**).
- \`random.choice(list)\` — one random item.
- \`random.shuffle(list)\` — mixes a list in place.
- \`random.random()\` — a float between 0 and 1.
- \`random.seed(42)\` — makes the "random" results repeatable (great for testing).

**math** — beyond basic operators:

- \`math.sqrt(x)\`, \`math.pi\`, \`math.floor(x)\`, \`math.ceil(x)\`
- \`math.pow(x, y)\`, \`math.gcd(a, b)\`, \`math.factorial(n)\`
- \`math.sin\`, \`math.cos\` (angles in radians)`,
      syntax: py`
import random, math
roll = random.randint(1, 6)
root = math.sqrt(25)`,
      examples: [
        { title: "Dice and picks", code: py`
import random
print("You rolled", random.randint(1, 6))
print("Lunch:", random.choice(["pizza", "plov", "salad"]))` },
        { title: "Math helpers", code: py`
import math
print(math.ceil(7 / 2))
print(math.gcd(12, 18))
print(round(math.sqrt(2), 3))` },
      ],
      realWorld: `random powers dice in games and shuffled quiz questions; math powers geometry in graphics, physics engines and finance.`,
      mistakes: [
        { wrong: py`random.randint(1, 6)  # forgot import`, right: py`import random
random.randint(1, 6)`, why: "Without import random you get NameError." },
      ],
      tryIt: py`
import random
deck = ["A", "K", "Q", "J"]
random.shuffle(deck)
print(deck)`,
      practice: [
        { prompt: "Set `random.seed(1)` and print `random.randint(1, 100)`. (Seeding makes the result predictable — it is 18.)", tests: [{ expected: "18" }], hint: "import random; random.seed(1)", solution: py`
import random
random.seed(1)
print(random.randint(1, 100))` },
        { prompt: "Use math.ceil to print how many buses of 40 seats are needed for 130 students.", tests: [{ expected: "4" }], hint: "math.ceil(130 / 40)", solution: py`
import math
print(math.ceil(130 / 40))` },
        { prompt: "Print the area of a circle with radius 3, rounded to 2 decimals, using math.pi.", tests: [{ expected: "28.27" }], hint: "round(math.pi * 3 ** 2, 2)", solution: py`
import math
print(round(math.pi * 3 ** 2, 2))` },
      ],
      quiz: [
        { q: "Can `random.randint(1, 3)` return 3?", options: ["Yes", "No"], answer: 0, explain: "Both ends are included." },
        { q: "What is `math.floor(4.9)`?", options: ["5", "4", "4.9"], answer: 1, explain: "floor rounds down." },
      ],
    },
    {
      id: "m12-datetime-os",
      title: "The datetime and os modules",
      minutes: 8,
      intro: `**datetime** — work with dates and times:

- \`datetime.date.today()\` — today's date.
- \`datetime.datetime.now()\` — current date and time.
- \`datetime.date(2026, 12, 31)\` — a specific date.
- Subtracting dates gives a \`timedelta\`: \`(d2 - d1).days\`.
- \`.strftime("%d/%m/%Y")\` formats a date as text. Common codes: \`%Y\` year, \`%m\` month, \`%d\` day, \`%H:%M\` time, \`%A\` weekday name.

**os** — talk to the operating system:

- \`os.getcwd()\`, \`os.listdir()\`, \`os.makedirs()\`, \`os.remove(path)\`
- \`os.path.exists()\`, \`os.path.getsize()\`
- \`os.environ\` — environment variables (where apps keep settings like API keys).`,
      syntax: py`
from datetime import date
d = date(2026, 1, 1)
print(d.strftime("%d %B %Y"))`,
      examples: [
        { title: "Days until an event", code: py`
from datetime import date
start = date(2026, 11, 23)
exam = date(2026, 12, 20)
print((exam - start).days, "days to go")` },
        { title: "Formatting dates", code: py`
from datetime import date
d = date(2026, 3, 8)
print(d.strftime("%A, %d %B %Y"))` },
      ],
      realWorld: `Calendars, reminders, subscription renewals and streak counters (like your PyNest streak!) are all built on date arithmetic.`,
      mistakes: [
        { wrong: py`
import datetime
datetime.date.today().year = 2030`, right: py`
from datetime import date
d = date(2030, 1, 1)`, why: "Date objects are immutable; create a new date instead." },
      ],
      tryIt: py`
from datetime import date, timedelta
today = date(2026, 11, 23)
print("In 100 days:", today + timedelta(days=100))`,
      practice: [
        { prompt: "Print how many days are between 1 Jan 2026 and 1 Mar 2026.", tests: [{ expected: "59" }], hint: "(date(2026, 3, 1) - date(2026, 1, 1)).days", solution: py`
from datetime import date
print((date(2026, 3, 1) - date(2026, 1, 1)).days)` },
        { prompt: "Print the date 25 December 2026 formatted as `25/12/2026`.", tests: [{ expected: "25/12/2026" }], hint: 'strftime("%d/%m/%Y")', solution: py`
from datetime import date
print(date(2026, 12, 25).strftime("%d/%m/%Y"))` },
        { prompt: "Print the weekday name of 1 January 2026 using `%A`.", tests: [{ expected: "Thursday" }], hint: 'date(2026, 1, 1).strftime("%A")', solution: py`
from datetime import date
print(date(2026, 1, 1).strftime("%A"))` },
      ],
      quiz: [
        { q: "What does subtracting two dates give?", options: ["A number", "A timedelta", "A string", "An error"], answer: 1, explain: "Use .days on the timedelta." },
        { q: "Which strftime code is the 4-digit year?", options: ["%y", "%Y", "%d", "%m"], answer: 1, explain: "%Y gives e.g. 2026." },
      ],
    },
    {
      id: "m12-external",
      title: "Introduction to external libraries",
      minutes: 7,
      intro: `Once you know the basics, external libraries let you do amazing things with very little code. A tour of famous ones:

- **requests** — download web pages and talk to APIs.
- **pandas** — analyse tables of data (like Excel, but in code).
- **matplotlib** — draw charts.
- **Flask / Django / FastAPI** — build websites and APIs.
- **pygame** — make 2D games.
- **numpy** — fast math on large arrays of numbers.
- **scikit-learn, PyTorch** — machine learning and AI.

How to start with a library:

- Install it: \`pip install pandas\`
- Read its "Quickstart" docs.
- Copy a small example, run it, then change one thing at a time.

*These libraries need a local Python install — the PyNest browser editor includes only the standard library.*`,
      syntax: py`
# On your computer:
#   pip install requests
# import requests
# r = requests.get("https://api.github.com")
# print(r.status_code)
print("Libraries extend Python")`,
      examples: [
        { title: "What a pandas script looks like", code: py`
# pip install pandas
# import pandas as pd
# df = pd.read_csv("sales.csv")
# print(df["price"].mean())
print("Read the comments: this needs pandas installed locally")` },
        { title: "The standard library can often do it too", code: py`
import statistics
prices = [3.5, 12, 30]
print(statistics.mean(prices))` },
      ],
      realWorld: `Data analysts use pandas daily; web developers use Django or FastAPI; game makers start with pygame. Your Python basics are the foundation for all of them.`,
      mistakes: [
        { wrong: py`import pandas  # in an environment without it`, right: "Install with pip install pandas, then import it.", why: "Importing a library that is not installed raises ModuleNotFoundError." },
      ],
      tryIt: py`
try:
    import pandas
    print("pandas is available")
except ModuleNotFoundError:
    print("pandas is not installed here — install it locally with pip")`,
      practice: [
        { prompt: "Try to import a module called `not_a_real_module` and print `missing` when ModuleNotFoundError is raised.", tests: [{ expected: "missing" }], hint: "try/except ModuleNotFoundError", solution: py`
try:
    import not_a_real_module
except ModuleNotFoundError:
    print("missing")` },
        { prompt: "Use the standard library `statistics.mean` to print the mean of `[10, 20, 60]`.", tests: [{ expected: "30" }], hint: "import statistics", solution: py`
import statistics
print(statistics.mean([10, 20, 60]))` },
        { prompt: 'Create a dict `libs = {"web": "requests", "data": "pandas", "games": "pygame"}` and print which library to use for games.', tests: [{ expected: "pygame" }], hint: 'libs["games"]', solution: py`
libs = {"web": "requests", "data": "pandas", "games": "pygame"}
print(libs["games"])` },
      ],
      quiz: [
        { q: "Which library is commonly used for data analysis?", options: ["pygame", "pandas", "flask", "random"], answer: 1, explain: "pandas works with tables of data." },
        { q: "What error do you get importing a library that is not installed?", options: ["NameError", "ModuleNotFoundError", "ImportWarning"], answer: 1, explain: "The module cannot be found." },
      ],
    },
  ],
};
