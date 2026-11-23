import type { PythonErrorEntry } from "./types";
import { out, py } from "./helpers";

export const PY_ERRORS: PythonErrorEntry[] = [
  {
    slug: "syntaxerror", name: "SyntaxError", category: "Syntax", difficulty: "Beginner",
    summary: "Your code breaks Python's grammar rules, so nothing runs.",
    meaning: "Python read your code and found something that is not valid Python — like a sentence with missing punctuation. Because Python checks the whole file before running, no line runs at all.",
    why: ["A missing colon after if, for, while, def or class", "Unmatched brackets ( ) [ ] { } or quotes", "Using = instead of == in a condition", "Misspelled keywords (e.g. esle)"],
    badCode: py`
if 5 > 3
    print("yes")`,
    message: "SyntaxError: expected ':'",
    fixedCode: py`
if 5 > 3:
    print("yes")`,
    prevent: ["Read the line the error points to and the line just before it", "Let your editor highlight matching brackets", "Remember every if/for/while/def line ends with a colon"],
    exercise: { prompt: "Fix the syntax errors so the program prints `done`.", starter: py`
for i in range(3)
    pass
print("done"`, tests: [{ expected: "done" }], hint: "There is a missing colon and a missing bracket.", solution: py`
for i in range(3):
    pass
print("done")` },
    quiz: [
      { q: "Does any code run when a file has a SyntaxError?", options: ["Yes, until the error line", "No, nothing runs"], answer: 1, explain: "Python parses the whole file first." },
      { q: "Which line causes a SyntaxError?", options: ['print("hi")', "if x == 1:", "while True", "x = 5"], answer: 2, explain: "The while line is missing its colon." },
    ],
  },
  {
    slug: "indentationerror", name: "IndentationError", category: "Syntax", difficulty: "Beginner",
    summary: "The spaces at the start of a line are wrong.",
    meaning: "Python uses indentation (spaces at the start of lines) to know which lines belong together in a block. If a block is not indented, or indentation is inconsistent, Python cannot understand the structure.",
    why: ["Forgetting to indent the body of if/for/def", "Indenting a line that should not be indented", "Mixing tabs and spaces", "Inconsistent numbers of spaces in the same block"],
    badCode: py`
def greet():
print("hello")`,
    message: "IndentationError: expected an indented block after function definition on line 1",
    fixedCode: py`
def greet():
    print("hello")
greet()`,
    prevent: ["Always use 4 spaces per level", "Configure your editor to insert spaces when you press Tab", "After a line ending in :, the next line must be indented"],
    exercise: { prompt: "Fix the indentation so it prints `big` then `end`.", starter: py`
n = 10
if n > 5:
print("big")
print("end")`, tests: [{ expected: out("big", "end") }], hint: "Only the first print belongs inside the if.", solution: py`
n = 10
if n > 5:
    print("big")
print("end")` },
    quiz: [
      { q: "How many spaces per indentation level are standard?", options: ["2", "4", "8", "Any"], answer: 1, explain: "PEP 8 recommends 4." },
      { q: "IndentationError is a special kind of…", options: ["TypeError", "SyntaxError", "NameError"], answer: 1, explain: "It is a subclass of SyntaxError." },
    ],
  },
  {
    slug: "nameerror", name: "NameError", category: "Names & Types", difficulty: "Beginner",
    summary: "You used a name that Python does not know.",
    meaning: "Python does not know what this name refers to. The variable or function has not been created yet, or it is spelled differently.",
    why: ["A typo in a variable or function name", "Using a variable before assigning it", "Forgetting quotes around text, so Python treats it as a name", "Using a variable outside the function where it was created"],
    badCode: py`print(username)`,
    message: "NameError: name 'username' is not defined",
    fixedCode: py`
username = "Alex"
print(username)`,
    prevent: ["Create variables before using them", "Copy-paste long names or use editor autocomplete", "Remember Python is case-sensitive: Name ≠ name"],
    exercise: { prompt: "Fix the NameError so it prints `Welcome, Sam`.", starter: py`
user_name = "Sam"
print("Welcome, " + username)`, tests: [{ expected: "Welcome, Sam" }], hint: "The variable names don't match.", solution: py`
user_name = "Sam"
print("Welcome, " + user_name)` },
    quiz: [
      { q: "What causes `NameError: name 'Hello' is not defined` in `print(Hello)`?", options: ["Missing quotes", "Wrong indentation", "Division by zero"], answer: 0, explain: "Without quotes, Hello is treated as a variable name." },
      { q: "Is `Score` the same name as `score`?", options: ["Yes", "No"], answer: 1, explain: "Names are case-sensitive." },
    ],
  },
  {
    slug: "typeerror", name: "TypeError", category: "Names & Types", difficulty: "Beginner",
    summary: "An operation was used on a value of the wrong type.",
    meaning: "You tried to do something that doesn't make sense for that type of value — like adding text and a number, or calling something that isn't a function.",
    why: ["Joining a string and a number with +", "Calling a function with too many or too few arguments", "Using an index on a number, e.g. 5[0]", "Calling a non-function, e.g. x = 5; x()"],
    badCode: py`
age = 15
print("Age: " + age)`,
    message: 'TypeError: can only concatenate str (not "int") to str',
    fixedCode: py`
age = 15
print("Age: " + str(age))
print(f"Age: {age}")`,
    prevent: ["Use f-strings to mix text and numbers", "Check types with type() when unsure", "Read the function definition to see how many arguments it needs"],
    exercise: { prompt: "Fix the TypeError so it prints `Total: 30`.", starter: py`
a = "10"
b = 20
print("Total:", a + b)`, tests: [{ expected: "Total: 30" }], hint: "Convert a to an int.", solution: py`
a = "10"
b = 20
print("Total:", int(a) + b)` },
    quiz: [
      { q: "Which line raises TypeError?", options: ['"a" * 3', '"a" + 3', "3 + 3", '"a" + "3"'], answer: 1, explain: "str + int is not allowed." },
      { q: "`len(42)` raises…", options: ["ValueError", "TypeError", "NameError"], answer: 1, explain: "An int has no length." },
    ],
  },
  {
    slug: "valueerror", name: "ValueError", category: "Values & Data", difficulty: "Beginner",
    summary: "The type is right, but the value is not acceptable.",
    meaning: "The function received the right kind of value, but its content is wrong. For example, int() accepts strings, but only strings that look like whole numbers.",
    why: ['int("hello") or int("3.5")', "Unpacking the wrong number of values: a, b = [1, 2, 3]", "list.remove(x) when x is not in the list", "math.sqrt(-1)"],
    badCode: py`number = int("ten")`,
    message: "ValueError: invalid literal for int() with base 10: 'ten'",
    fixedCode: py`
text = "ten"
try:
    number = int(text)
except ValueError:
    print("Please type digits, like 10")`,
    prevent: ["Validate user input with .isdigit() or try/except", "Check that list items exist before removing them", "Match the number of variables when unpacking"],
    exercise: { prompt: "Read a line. Print the number squared, or `Invalid` if it is not a whole number (use try/except).", starter: "text = input()\n", tests: [{ input: ["7"], expected: "49" }, { input: ["seven"], expected: "Invalid" }], hint: "Wrap int(text) in try.", solution: py`
text = input()
try:
    n = int(text)
    print(n * n)
except ValueError:
    print("Invalid")` },
    quiz: [
      { q: '`int("12")` works. Does `int("12.0")`?', options: ["Yes", "No, ValueError"], answer: 1, explain: "int() can't parse a decimal string; use int(float(...))." },
      { q: "`a, b = [1, 2, 3]` raises…", options: ["ValueError", "IndexError", "TypeError"], answer: 0, explain: "Too many values to unpack." },
    ],
  },
  {
    slug: "indexerror", name: "IndexError", category: "Values & Data", difficulty: "Beginner",
    summary: "You asked for a position that does not exist in a list or string.",
    meaning: "Lists and strings have positions (indexes) from 0 to len - 1. You asked for an index outside that range.",
    why: ["Forgetting that indexing starts at 0", "Using len(list) as an index", "Accessing an item of an empty list", "Loop ranges that go one step too far"],
    badCode: py`
colors = ["red", "green", "blue"]
print(colors[3])`,
    message: "IndexError: list index out of range",
    fixedCode: py`
colors = ["red", "green", "blue"]
print(colors[2])
print(colors[-1])`,
    prevent: ["The last item is at len - 1, or simply use [-1]", "Loop over items directly: for c in colors", "Check if a list is empty before reading from it"],
    exercise: { prompt: "Fix the loop so it prints every item without an IndexError.", starter: py`
nums = [5, 10, 15]
for i in range(len(nums) + 1):
    print(nums[i])`, tests: [{ expected: out(5, 10, 15) }], hint: "range(len(nums)) already covers every index.", solution: py`
nums = [5, 10, 15]
for i in range(len(nums)):
    print(nums[i])` },
    quiz: [
      { q: "A list has 4 items. What is the last valid index?", options: ["4", "3", "5"], answer: 1, explain: "Indexes go 0–3." },
      { q: "`[][0]` raises…", options: ["IndexError", "KeyError", "Nothing"], answer: 0, explain: "An empty list has no index 0." },
    ],
  },
  {
    slug: "keyerror", name: "KeyError", category: "Values & Data", difficulty: "Beginner",
    summary: "You looked up a dictionary key that does not exist.",
    meaning: "Dictionaries find values by key. The key you used is not in the dictionary (keys are case-sensitive and type-sensitive: 1 and \"1\" are different).",
    why: ["Typos or different capitalisation in the key", "The key was never added", "Using a number key vs. a string key", "The key was deleted earlier"],
    badCode: py`
user = {"name": "Ana", "age": 15}
print(user["email"])`,
    message: "KeyError: 'email'",
    fixedCode: py`
user = {"name": "Ana", "age": 15}
print(user.get("email", "no email"))
if "age" in user:
    print(user["age"])`,
    prevent: ['Use d.get(key, default) when a key might be missing', 'Check with "key" in d first', "Print d.keys() to see what keys really exist"],
    exercise: { prompt: 'Using `stock = {"apple": 3, "pear": 0}`, read a fruit name and print its stock, or `0` if unknown — without a KeyError.', starter: 'stock = {"apple": 3, "pear": 0}\n', tests: [{ input: ["apple"], expected: "3" }, { input: ["kiwi"], expected: "0" }], hint: "stock.get(name, 0)", solution: py`
stock = {"apple": 3, "pear": 0}
name = input()
print(stock.get(name, 0))` },
    quiz: [
      { q: 'What does `{"a": 1}.get("b")` return?', options: ["KeyError", "None", "0"], answer: 1, explain: "get returns None for missing keys by default." },
      { q: 'Is `d["Name"]` the same as `d["name"]`?', options: ["Yes", "No"], answer: 1, explain: "Keys are case-sensitive." },
    ],
  },
  {
    slug: "zerodivisionerror", name: "ZeroDivisionError", category: "Runtime", difficulty: "Beginner",
    summary: "You divided a number by zero.",
    meaning: "Division by zero has no answer in mathematics, so Python stops. This also applies to // and %.",
    why: ["A divisor variable that happens to be 0", "Averages of empty lists: sum([]) / len([])", "User input of 0"],
    badCode: py`
total = 50
count = 0
print(total / count)`,
    message: "ZeroDivisionError: division by zero",
    fixedCode: py`
total = 50
count = 0
average = total / count if count != 0 else 0
print(average)`,
    prevent: ["Check the divisor before dividing", "Handle empty lists before computing averages", "Catch ZeroDivisionError where user input is involved"],
    exercise: { prompt: "Write `average(nums)` that returns 0 for an empty list instead of crashing.", tests: [{ append: "print(average([2, 4]))\nprint(average([]))", expected: out("3.0", 0) }], hint: "if not nums: return 0", solution: py`
def average(nums):
    if not nums:
        return 0
    return sum(nums) / len(nums)` },
    quiz: [
      { q: "Does `10 % 0` raise ZeroDivisionError?", options: ["Yes", "No"], answer: 0, explain: "Modulo by zero is also undefined." },
      { q: "Best fix for averaging an empty list?", options: ["Ignore it", "Check len first", "Divide by 1"], answer: 1, explain: "Handle the empty case explicitly." },
    ],
  },
  {
    slug: "attributeerror", name: "AttributeError", category: "Names & Types", difficulty: "Beginner",
    summary: "The value does not have the method or attribute you used.",
    meaning: "You used .something on a value, but that type of value has no attribute or method with that name. Often it is a typo, or the variable holds a different type than you think (very often None).",
    why: ["Misspelled method names (.uppercase() instead of .upper())", "Methods from other languages (.push() instead of .append())", "A variable is None because a function did not return anything", "Calling string methods on numbers"],
    badCode: py`
names = ["Ana"]
names.push("Ben")`,
    message: "AttributeError: 'list' object has no attribute 'push'",
    fixedCode: py`
names = ["Ana"]
names.append("Ben")
print(names)`,
    prevent: ["Use dir(value) to see available methods", "Check type(value) when an attribute is missing", "Remember that methods like list.sort() return None"],
    exercise: { prompt: "Fix the AttributeError: the list should be sorted and printed as `[1, 2, 3]`.", starter: py`
nums = [3, 1, 2]
nums = nums.sort()
print(nums.copy())`, tests: [{ expected: "[1, 2, 3]" }], hint: "sort() returns None — don't reassign.", solution: py`
nums = [3, 1, 2]
nums.sort()
print(nums.copy())` },
    quiz: [
      { q: "`'hello'.push('!')` raises…", options: ["AttributeError", "TypeError", "NameError"], answer: 0, explain: "str has no push method." },
      { q: "`x = [3, 1].sort(); x.append(5)` fails because x is…", options: ["A list", "None", "A tuple"], answer: 1, explain: "sort() returns None." },
    ],
  },
  {
    slug: "importerror", name: "ImportError", category: "Files & Imports", difficulty: "Intermediate", premium: true,
    summary: "The module was found, but the name you tried to import from it was not.",
    meaning: "With `from module import name`, Python found the module but it does not contain `name` — usually a typo or a name that exists in a different module or version.",
    why: ["Misspelled names: from math import squareroot", "Importing something from the wrong module", "The name was added in a newer version of the library", "Circular imports between your own files"],
    badCode: py`from math import squareroot`,
    message: "ImportError: cannot import name 'squareroot' from 'math'",
    fixedCode: py`
from math import sqrt
print(sqrt(16))`,
    prevent: ["Check the documentation for the exact name", "Use dir(module) to list what a module provides", "Avoid files that import each other"],
    exercise: { prompt: "Fix the import so it prints `120`.", starter: py`
from math import fact
print(fact(5))`, tests: [{ expected: "120" }], hint: "The function is called factorial.", solution: py`
from math import factorial
print(factorial(5))` },
    quiz: [
      { q: "ImportError vs ModuleNotFoundError: which means the module itself is missing?", options: ["ImportError", "ModuleNotFoundError"], answer: 1, explain: "ImportError means the module exists but the name doesn't." },
      { q: "How can you list names in a module?", options: ["dir(module)", "len(module)", "print(module())"], answer: 0, explain: "dir shows attributes." },
    ],
  },
  {
    slug: "modulenotfounderror", name: "ModuleNotFoundError", category: "Files & Imports", difficulty: "Beginner", premium: true,
    summary: "Python cannot find a module with that name.",
    meaning: "The module you tried to import is not installed, or its name is misspelled. For third-party packages, you must install them with pip first.",
    why: ["Typos: import maths", "A third-party package not installed (requests, pandas)", "Installed into a different Python/virtual environment", "Your own file is not in the same folder"],
    badCode: py`import maths`,
    message: "ModuleNotFoundError: No module named 'maths'",
    fixedCode: py`
import math
print(math.pi)`,
    prevent: ["Double-check module names", "Run pip install <package> in the terminal for third-party packages", "Activate the right virtual environment"],
    exercise: { prompt: "Fix the import so it prints a random number between 1 and 1 (which is always 1).", starter: py`
import randoms
print(randoms.randint(1, 1))`, tests: [{ expected: "1" }], hint: "The module is called random.", solution: py`
import random
print(random.randint(1, 1))` },
    quiz: [
      { q: "How do you fix ModuleNotFoundError for 'requests'?", options: ["pip install requests", "import Requests", "Restart Python"], answer: 0, explain: "Install the package." },
      { q: "Can you run pip inside a .py file as code?", options: ["Yes", "No, it's a terminal command"], answer: 1, explain: "pip runs in the terminal." },
    ],
  },
  {
    slug: "filenotfounderror", name: "FileNotFoundError", category: "Files & Imports", difficulty: "Beginner", premium: true,
    summary: "The file you tried to open does not exist at that path.",
    meaning: "open() in read mode needs an existing file. Python looked at the path you gave and found nothing there.",
    why: ["Misspelled file name or extension", "The file is in a different folder than the program runs in", "The file was never created", "Wrong path separators or relative path"],
    badCode: py`
with open("my_notes.txt") as f:
    print(f.read())`,
    message: "FileNotFoundError: [Errno 44] No such file or directory: 'my_notes.txt'",
    fixedCode: py`
import os
if os.path.exists("my_notes.txt"):
    with open("my_notes.txt") as f:
        print(f.read())
else:
    print("File not found - creating it")
    with open("my_notes.txt", "w") as f:
        f.write("")`,
    prevent: ["Check os.path.exists(path) first", "Print os.getcwd() to see where your program runs", "Use try/except FileNotFoundError for user-provided paths"],
    exercise: { prompt: "Read `config.txt` if it exists; otherwise print `using defaults`. (It does not exist.) Use try/except.", tests: [{ expected: "using defaults" }], hint: "except FileNotFoundError:", solution: py`
try:
    with open("config.txt") as f:
        print(f.read())
except FileNotFoundError:
    print("using defaults")` },
    quiz: [
      { q: 'Does open("new.txt", "w") raise FileNotFoundError if the file is missing?', options: ["Yes", "No, write mode creates it"], answer: 1, explain: "w creates the file (if the folder exists)." },
      { q: "Which function shows the current working folder?", options: ["os.getcwd()", "os.path()", "open()"], answer: 0, explain: "getcwd = get current working directory." },
    ],
  },
  {
    slug: "recursionerror", name: "RecursionError", category: "Runtime", difficulty: "Intermediate", premium: true,
    summary: "A function called itself too many times (usually forever).",
    meaning: "Python limits how deep functions can call themselves (about 1000 levels). Hitting the limit almost always means a recursive function has no base case, or never reaches it.",
    why: ["Missing base case", "The recursive call doesn't move towards the base case (e.g. n + 1 instead of n - 1)", "Very deep recursion on large inputs", "Two functions calling each other endlessly"],
    badCode: py`
def countdown(n):
    print(n)
    countdown(n - 1)

countdown(3)`,
    message: "RecursionError: maximum recursion depth exceeded",
    fixedCode: py`
def countdown(n):
    if n == 0:
        return
    print(n)
    countdown(n - 1)

countdown(3)`,
    prevent: ["Write the base case first", "Make sure each call gets closer to the base case", "Use a loop for very deep repetition"],
    exercise: { prompt: "Fix `total(n)` so it returns 1 + 2 + … + n without a RecursionError.", starter: py`
def total(n):
    return n + total(n - 1)

print(total(4))`, tests: [{ expected: "10" }], hint: "Add a base case: if n == 0: return 0", solution: py`
def total(n):
    if n == 0:
        return 0
    return n + total(n - 1)

print(total(4))` },
    quiz: [
      { q: "What every recursive function needs:", options: ["A loop", "A base case", "A global variable"], answer: 1, explain: "The base case stops the recursion." },
      { q: "`def f(n): return f(n + 1)` — what happens with f(1)?", options: ["Returns 2", "RecursionError", "Infinite loop with no error"], answer: 1, explain: "It never stops calling itself." },
    ],
  },
];

export { ERROR_CATEGORIES } from "./errors-meta";
