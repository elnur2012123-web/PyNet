import type { ModuleQuiz } from "./types";
import { out, py } from "./helpers";

/** Module quizzes. Answer keys stay on the server; grading happens in /api/quiz. */
export const MODULE_QUIZZES: ModuleQuiz[] = [
  {
    moduleId: "m1",
    questions: [
      { type: "mcq", q: "What is a program?", options: ["A list of instructions for a computer", "A computer screen", "A type of file"], answer: 0, explain: "Programs are step-by-step instructions." },
      { type: "output", q: "What is the output?", code: py`print("Py", "thon", sep="")`, options: ["Py thon", "Python", "Py,thon"], answer: 1, explain: 'sep="" puts nothing between values.' },
      { type: "error", q: "Which line has an error?", code: py`
print("A")
Print("B")
print("C")`, options: ["Line 1", "Line 2", "Line 3"], answer: 1, explain: "Print with a capital P is not defined." },
      { type: "mcq", q: "Which symbol starts a comment?", options: ["//", "#", "<!--"], answer: 1, explain: "Python comments start with #." },
      { type: "blank", q: "Fill in the blank to show text on the screen.", code: '____("Hello")', answers: ["print"], explain: "print() displays output." },
      { type: "output", q: "What is the output?", code: py`
print("A", end="-")
print("B")`, options: ["A B", "A-B", "A\nB"], answer: 1, explain: 'end="-" replaces the newline with a dash.' },
      { type: "code", q: "Write a program that prints `Python` on one line and `Zero` on the next.", starter: "", tests: [{ expected: out("Python", "Zero") }], explain: "Two print calls.", solution: py`
print("Python")
print("Zero")` },
    ],
  },
  {
    moduleId: "m2",
    questions: [
      { type: "mcq", q: "Which is a valid variable name?", options: ["2nd", "my-var", "my_var", "class"], answer: 2, explain: "Letters, digits, underscores; not starting with a digit; not a keyword." },
      { type: "output", q: "What is printed?", code: py`print(type(7.0).__name__)`, options: ["int", "float", "str"], answer: 1, explain: "7.0 has a decimal point." },
      { type: "output", q: "What is printed?", code: py`
x = "5"
print(x * 2)`, options: ["10", "55", "Error"], answer: 1, explain: "String repetition." },
      { type: "error", q: "Which line raises an error?", code: py`
a = "3"
b = 4
c = a + b`, options: ["Line 1", "Line 2", "Line 3"], answer: 2, explain: "str + int → TypeError." },
      { type: "blank", q: "Fill in the blank to convert text to a whole number.", code: 'n = ___("42")', answers: ["int"], explain: "int() converts to an integer." },
      { type: "mcq", q: "Which value is a boolean?", options: ['"True"', "True", "true", "1"], answer: 1, explain: "True (capital T, no quotes)." },
      { type: "output", q: "What is printed?", code: py`
a, b = 1, 2
a, b = b, a
print(a, b)`, options: ["1 2", "2 1", "2 2"], answer: 1, explain: "The values are swapped." },
      { type: "code", q: "Store 19.99 in `price` and print it multiplied by 3, rounded to 2 decimals with round().", starter: "", tests: [{ expected: "59.97" }], explain: "round(price * 3, 2)", solution: py`
price = 19.99
print(round(price * 3, 2))` },
    ],
  },
  {
    moduleId: "m3",
    questions: [
      { type: "output", q: "What is printed?", code: py`print(17 // 5, 17 % 5)`, options: ["3 2", "3.4 2", "2 3"], answer: 0, explain: "17 = 5 × 3 + 2." },
      { type: "output", q: "What is printed?", code: py`print(2 + 3 * 4 ** 2)`, options: ["50", "400", "98"], answer: 0, explain: "4 ** 2 = 16, × 3 = 48, + 2 = 50." },
      { type: "mcq", q: "What does `!=` mean?", options: ["Equal", "Not equal", "Assignment"], answer: 1, explain: "!= tests inequality." },
      { type: "output", q: "What is printed?", code: py`print(not (3 > 2 and 2 > 3))`, options: ["True", "False"], answer: 0, explain: "The and is False; not makes it True." },
      { type: "blank", q: "Fill in to add 5 to score using the shortcut operator.", code: "score ___ 5", answers: ["+="], explain: "+= adds and assigns." },
      { type: "error", q: "Which line is a SyntaxError?", code: py`
x = 5
if x = 5:
    print("five")`, options: ["Line 1", "Line 2", "Line 3"], answer: 1, explain: "Use == to compare." },
      { type: "output", q: "What is printed?", code: py`print(10 / 4)`, options: ["2", "2.5", "2.0"], answer: 1, explain: "/ gives a float." },
      { type: "code", q: "Read a number of seconds and print it as `M min S sec` (e.g. 125 → `2 min 5 sec`).", starter: "", tests: [{ input: ["125"], expected: "2 min 5 sec" }, { input: ["59"], expected: "0 min 59 sec" }], explain: "Use // and %.", solution: py`
s = int(input())
print(f"{s // 60} min {s % 60} sec")` },
    ],
  },
  {
    moduleId: "m4",
    questions: [
      { type: "output", q: "What is printed?", code: py`print("python"[1:4])`, options: ["pyt", "yth", "ytho"], answer: 1, explain: "Indexes 1, 2, 3." },
      { type: "output", q: "What is printed?", code: py`print("a-b-c".split("-"))`, options: ["['a', 'b', 'c']", "abc", "['a-b-c']"], answer: 0, explain: "split returns a list." },
      { type: "mcq", q: "Strings in Python are…", options: ["Mutable", "Immutable"], answer: 1, explain: "You cannot change characters in place." },
      { type: "output", q: "What is printed?", code: py`
name = "ana"
print(f"{name.title()} has {len(name)} letters")`, options: ["ana has 3 letters", "Ana has 3 letters", "Ana has len(name) letters"], answer: 1, explain: "Expressions inside braces are evaluated." },
      { type: "blank", q: "Fill in to remove spaces from both ends.", code: 'clean = "  hi  ".____()', answers: ["strip"], explain: "strip() trims whitespace." },
      { type: "error", q: "Which line raises an error?", code: py`
s = "cat"
print(s[0])
s[0] = "b"`, options: ["Line 1", "Line 2", "Line 3"], answer: 2, explain: "Strings don't support item assignment." },
      { type: "output", q: "What is printed?", code: py`print(f"{7 / 3:.2f}")`, options: ["2.33", "2.3", "2.333"], answer: 0, explain: ".2f = two decimals." },
      { type: "code", q: "Read a full name like `ada lovelace` and print the initials in uppercase, e.g. `AL`.", starter: "", tests: [{ input: ["ada lovelace"], expected: "AL" }, { input: ["grace brewster hopper"], expected: "GBH" }], explain: "Take the first letter of each word.", solution: py`
words = input().split()
print("".join(w[0] for w in words).upper())` },
    ],
  },
  {
    moduleId: "m5",
    questions: [
      { type: "mcq", q: "What type does input() return?", options: ["int", "str", "depends"], answer: 1, explain: "Always a string." },
      { type: "output", q: "User types `4`. What is printed?", code: py`
n = input()
print(n * 3)`, options: ["12", "444", "Error"], answer: 1, explain: "String repetition." },
      { type: "blank", q: "Fill in to read a decimal number.", code: "x = _____(input())", answers: ["float"], explain: "float() converts to a decimal." },
      { type: "output", q: "What is printed?", code: py`print(f"{'x':>3}|")`, options: ["x  |", "  x|", " x |"], answer: 1, explain: "> right-aligns in width 3." },
      { type: "mcq", q: "How do you read `3 7` into two ints?", options: ["a, b = int(input())", "a, b = map(int, input().split())", "a, b = input(int)"], answer: 1, explain: "split then convert each." },
      { type: "error", q: "Which line raises an error when the user types `ten`?", code: py`
text = input()
n = int(text)
print(n)`, options: ["Line 1", "Line 2", "Line 3"], answer: 1, explain: "int('ten') raises ValueError." },
      { type: "code", q: "Read a name and an age (two lines). Print `<name> will be <age+1> next year`.", starter: "", tests: [{ input: ["Mia", "12"], expected: "Mia will be 13 next year" }], explain: "Convert age with int().", solution: py`
name = input()
age = int(input())
print(f"{name} will be {age + 1} next year")` },
    ],
  },
  {
    moduleId: "m6",
    questions: [
      { type: "output", q: "What is printed?", code: py`
x = 7
if x > 10:
    print("A")
elif x > 5:
    print("B")
else:
    print("C")`, options: ["A", "B", "C"], answer: 1, explain: "7 > 5 is the first True condition." },
      { type: "mcq", q: "How many branches of an if/elif/else chain run?", options: ["All True ones", "Exactly one", "Zero or more"], answer: 1, explain: "Only the first matching branch (or else)." },
      { type: "output", q: "What is printed?", code: py`print(5 <= 5 and not 3 == 4)`, options: ["True", "False"], answer: 0, explain: "True and True." },
      { type: "error", q: "Which line has the error?", code: py`
age = 20
if age >= 18:
print("adult")`, options: ["Line 1", "Line 2", "Line 3"], answer: 2, explain: "The print must be indented." },
      { type: "blank", q: "Fill in the keyword for 'otherwise, if…'.", code: "____ score > 50:", answers: ["elif"], explain: "elif = else if." },
      { type: "output", q: "What is printed?", code: py`
day = "Sun"
print("weekend" if day in ("Sat", "Sun") else "weekday")`, options: ["weekend", "weekday"], answer: 0, explain: "Sun is in the tuple." },
      { type: "code", q: "Read a temperature. Print `Freezing` (< 0), `Cold` (< 15), `Mild` (< 25) or `Hot`.", starter: "", tests: [{ input: ["-5"], expected: "Freezing" }, { input: ["10"], expected: "Cold" }, { input: ["20"], expected: "Mild" }, { input: ["30"], expected: "Hot" }, { input: ["0"], expected: "Cold" }], explain: "Ordered if/elif.", solution: py`
t = int(input())
if t < 0:
    print("Freezing")
elif t < 15:
    print("Cold")
elif t < 25:
    print("Mild")
else:
    print("Hot")` },
    ],
  },
  {
    moduleId: "m7",
    questions: [
      { type: "output", q: "What is printed?", code: py`
for i in range(1, 8, 3):
    print(i, end=" ")`, options: ["1 4 7 ", "1 3 5 7 ", "1 4 "], answer: 0, explain: "Start 1, step 3, stop before 8." },
      { type: "output", q: "How many times is 'x' printed?", code: py`
i = 0
while i < 10:
    i += 3
    print("x")`, options: ["3", "4", "10"], answer: 1, explain: "i becomes 3, 6, 9, 12 → 4 prints." },
      { type: "mcq", q: "What does `break` do?", options: ["Skips one iteration", "Exits the loop", "Pauses"], answer: 1, explain: "break leaves the loop." },
      { type: "error", q: "Which loop never ends?", code: py`
n = 5
while n > 0:
    print(n)`, options: ["It ends after 5 prints", "It never ends: n never changes", "It prints nothing"], answer: 1, explain: "Add n -= 1." },
      { type: "blank", q: "Fill in to skip the rest of the current iteration.", code: "if n % 2 == 0:\n    ________", answers: ["continue"], explain: "continue jumps to the next iteration." },
      { type: "output", q: "What is printed?", code: py`
total = 0
for ch in "a1b2c3":
    if ch.isdigit():
        total += int(ch)
print(total)`, options: ["6", "123", "0"], answer: 0, explain: "1 + 2 + 3." },
      { type: "code", q: "Read n and print the factorial of n (n! = 1 × 2 × … × n) using a loop. 0! is 1.", starter: "", tests: [{ input: ["5"], expected: "120" }, { input: ["0"], expected: "1" }, { input: ["1"], expected: "1" }], explain: "Multiply in a loop.", solution: py`
n = int(input())
result = 1
for i in range(2, n + 1):
    result *= i
print(result)` },
    ],
  },
  {
    moduleId: "m8",
    questions: [
      { type: "output", q: "What is printed?", code: py`
a = [1, 2, 3]
a.append([4])
print(len(a))`, options: ["4", "3", "6"], answer: 0, explain: "The whole list [4] is one item." },
      { type: "mcq", q: "Which structure cannot be changed after creation?", options: ["list", "dict", "tuple", "set"], answer: 2, explain: "Tuples are immutable." },
      { type: "output", q: "What is printed?", code: py`print(sorted({3, 1, 3, 2}))`, options: ["[1, 2, 3]", "[3, 1, 3, 2]", "{1, 2, 3}"], answer: 0, explain: "Sets drop duplicates; sorted returns a list." },
      { type: "error", q: "Which line raises a KeyError?", code: py`
d = {"a": 1}
print(d.get("b"))
print(d["b"])`, options: ["Line 2", "Line 3", "None"], answer: 1, explain: "Square-bracket lookup of a missing key raises KeyError." },
      { type: "blank", q: "Fill in to add an item to the end of a list.", code: 'items.______("pen")', answers: ["append"], explain: "append adds to the end." },
      { type: "output", q: "What is printed?", code: py`
d = {"x": 1, "y": 2}
for k, v in d.items():
    print(k * v, end=" ")`, options: ["x yy ", "1 2 ", "xy "], answer: 0, explain: "String repetition: 'x'*1, 'y'*2." },
      { type: "code", q: "Read words on one line and print a dict mapping each word to its length (in the order they appear; assume no repeats).", starter: "", tests: [{ input: ["hi there you"], expected: "{'hi': 2, 'there': 5, 'you': 3}" }], explain: "Build a dict in a loop or comprehension.", solution: py`
words = input().split()
print({w: len(w) for w in words})` },
    ],
  },
  {
    moduleId: "m9",
    questions: [
      { type: "output", q: "What is printed?", code: py`
def f(x, y=2):
    return x ** y
print(f(3), f(2, 3))`, options: ["9 8", "6 6", "9 6"], answer: 0, explain: "3² = 9 and 2³ = 8." },
      { type: "mcq", q: "What does a function return without a return statement?", options: ["0", "None", "An error"], answer: 1, explain: "None by default." },
      { type: "error", q: "Which line raises an error?", code: py`
def add(a, b):
    return a + b
print(add(1))`, options: ["Line 1", "Line 2", "Line 3"], answer: 2, explain: "Missing an argument → TypeError." },
      { type: "output", q: "What is printed?", code: py`
x = 1
def change():
    x = 99
change()
print(x)`, options: ["1", "99", "Error"], answer: 0, explain: "The function created a local x." },
      { type: "blank", q: "Fill in the keyword that sends a value back to the caller.", code: "def double(n):\n    ______ n * 2", answers: ["return"], explain: "return gives back a value." },
      { type: "output", q: "What is printed?", code: py`print(sorted(["bb", "a", "ccc"], key=lambda s: -len(s)))`, options: ["['ccc', 'bb', 'a']", "['a', 'bb', 'ccc']", "Error"], answer: 0, explain: "Negative length → longest first." },
      { type: "code", q: "Define `count_words(text)` returning the number of words in text.", starter: "def count_words(text):\n    ", tests: [{ append: 'print(count_words("one two three"))\nprint(count_words("solo"))', expected: out(3, 1) }], explain: "len(text.split())", solution: py`
def count_words(text):
    return len(text.split())` },
    ],
  },
  {
    moduleId: "m10",
    questions: [
      { type: "mcq", q: "Which error does Python NOT report automatically?", options: ["SyntaxError", "Logical error", "TypeError"], answer: 1, explain: "Logical errors give wrong results silently." },
      { type: "output", q: "What is printed?", code: py`
try:
    print(1 / 0)
except ZeroDivisionError:
    print("oops")
finally:
    print("done")`, options: ["oops done", "oops\ndone", "done"], answer: 1, explain: "except runs, then finally." },
      { type: "error", q: "`[1, 2, 3][3]` raises…", code: "[1, 2, 3][3]", options: ["KeyError", "IndexError", "ValueError"], answer: 1, explain: "Index out of range." },
      { type: "mcq", q: "When does the else block of a try statement run?", options: ["Always", "Only if no exception occurred", "Only on exceptions"], answer: 1, explain: "else is the success path." },
      { type: "blank", q: "Fill in to create your own error.", code: '_____ ValueError("bad input")', answers: ["raise"], explain: "raise throws an exception." },
      { type: "output", q: "What is printed?", code: py`
try:
    int("x")
except ValueError as e:
    print(type(e).__name__)`, options: ["ValueError", "TypeError", "x"], answer: 0, explain: "The caught exception is a ValueError." },
      { type: "code", q: "Read a line; print its integer value doubled, or `bad` if it is not an integer (use try/except).", starter: "", tests: [{ input: ["21"], expected: "42" }, { input: ["2.5"], expected: "bad" }], explain: "except ValueError", solution: py`
try:
    print(int(input()) * 2)
except ValueError:
    print("bad")` },
    ],
  },
  {
    moduleId: "m11",
    questions: [
      { type: "mcq", q: 'What does mode "a" do?', options: ["Reads", "Erases then writes", "Adds to the end"], answer: 2, explain: "Append mode." },
      { type: "mcq", q: "Main advantage of `with open(...)`?", options: ["Speed", "Automatic closing", "Encryption"], answer: 1, explain: "The file closes when the block ends." },
      { type: "output", q: "What is printed?", code: py`
with open("t.txt", "w") as f:
    f.write("a\nb\n")
with open("t.txt") as f:
    print(len(f.readlines()))`, options: ["1", "2", "4"], answer: 1, explain: "Two lines." },
      { type: "error", q: "Which call raises FileNotFoundError if missing.txt does not exist?", code: "", options: ['open("missing.txt", "w")', 'open("missing.txt")', 'open("missing.txt", "a")'], answer: 1, explain: "Read mode needs an existing file." },
      { type: "blank", q: "Fill in the module that reads comma-separated files.", code: "import ___", answers: ["csv"], explain: "The csv module." },
      { type: "code", q: "Write `x`, `y`, `z` on separate lines to `abc.txt`, then read the file and print the lines joined with `-` (`x-y-z`).", starter: "", tests: [{ expected: "x-y-z" }], explain: "read().split() then join.", solution: py`
with open("abc.txt", "w") as f:
    f.write("x\ny\nz\n")
with open("abc.txt") as f:
    print("-".join(f.read().split()))` },
    ],
  },
  {
    moduleId: "m12",
    questions: [
      { type: "mcq", q: "After `import math`, how do you call sqrt?", options: ["sqrt(4)", "math.sqrt(4)", "math->sqrt(4)"], answer: 1, explain: "Use the module name prefix." },
      { type: "mcq", q: "Where do you run `pip install requests`?", options: ["In a .py file", "In the terminal", "In print()"], answer: 1, explain: "pip is a command-line tool." },
      { type: "output", q: "What is printed?", code: py`
import random
random.seed(5)
a = random.randint(1, 100)
random.seed(5)
b = random.randint(1, 100)
print(a == b)`, options: ["True", "False"], answer: 0, explain: "The same seed gives the same sequence." },
      { type: "output", q: "What is printed?", code: py`
from datetime import date
print((date(2026, 1, 11) - date(2026, 1, 1)).days)`, options: ["10", "11", "9"], answer: 0, explain: "Ten days apart." },
      { type: "blank", q: "Fill in to import only sqrt from math.", code: "____ math import sqrt", answers: ["from"], explain: "from module import name." },
      { type: "error", q: "What does `import mathematics` raise?", code: "import mathematics", options: ["ImportError", "ModuleNotFoundError", "NameError"], answer: 1, explain: "No module with that name." },
      { type: "code", q: "Use the math module to print the hypotenuse of a right triangle with sides 5 and 12 (as a float).", starter: "", tests: [{ expected: "13.0" }], explain: "math.sqrt(5**2 + 12**2) or math.hypot(5, 12)", solution: py`
import math
print(math.hypot(5, 12))` },
    ],
  },
  {
    moduleId: "m13",
    questions: [
      { type: "mcq", q: "What is `self`?", options: ["The class", "The current object", "A keyword for loops"], answer: 1, explain: "self refers to the instance." },
      { type: "output", q: "What is printed?", code: py`
class A:
    def __init__(self, n):
        self.n = n
    def grow(self):
        self.n += 1
a = A(1)
a.grow(); a.grow()
print(a.n)`, options: ["1", "2", "3"], answer: 2, explain: "Two increments from 1." },
      { type: "mcq", q: "In `class Car(Vehicle):`, Car is the…", options: ["Parent", "Child (subclass)", "Module"], answer: 1, explain: "Car inherits from Vehicle." },
      { type: "error", q: "Which line raises a TypeError when called?", code: py`
class Dog:
    def bark():
        return "woof"
print(Dog().bark())`, options: ["Line 2", "Line 4"], answer: 1, explain: "bark is missing self, so calling it with the instance fails." },
      { type: "blank", q: "Fill in to call the parent's __init__.", code: "_____().__init__(name)", answers: ["super"], explain: "super() refers to the parent class." },
      { type: "output", q: "What is printed?", code: py`
class P:
    def hi(self): return "P"
class C(P):
    def hi(self): return "C" + super().hi()
print(C().hi())`, options: ["C", "CP", "P"], answer: 1, explain: "C's method calls the parent's and adds to it." },
      { type: "code", q: "Create class `Circle(r)` with method `area()` returning the area rounded to 2 decimals (use 3.14159 for pi).", starter: "", tests: [{ append: "print(Circle(1).area())\nprint(Circle(2).area())", expected: out(3.14, 12.57) }], explain: "round(3.14159 * r * r, 2)", solution: py`
class Circle:
    def __init__(self, r):
        self.r = r

    def area(self):
        return round(3.14159 * self.r * self.r, 2)` },
    ],
  },
  {
    moduleId: "m14",
    questions: [
      { type: "output", q: "What is printed?", code: py`print([x * x for x in range(5) if x % 2])`, options: ["[1, 9]", "[0, 4, 16]", "[1, 4, 9]"], answer: 0, explain: "Odd x only: 1 and 3." },
      { type: "output", q: "What is printed?", code: py`print(list(zip("ab", [1, 2, 3])))`, options: ["[('a', 1), ('b', 2)]", "[('a', 1), ('b', 2), (None, 3)]", "Error"], answer: 0, explain: "zip stops at the shortest." },
      { type: "mcq", q: "Which keyword makes a generator?", options: ["return", "yield", "lambda"], answer: 1, explain: "yield." },
      { type: "error", q: "What error does this raise?", code: py`
def f(n):
    return f(n - 1)
f(3)`, options: ["RecursionError", "StopIteration", "No error"], answer: 0, explain: "No base case." },
      { type: "blank", q: "Fill in to get index and item together.", code: "for i, x in _________(items):", answers: ["enumerate"], explain: "enumerate yields (index, item)." },
      { type: "output", q: "What is printed?", code: py`
def deco(f):
    def w():
        return f() + 1
    return w
@deco
def three():
    return 3
print(three())`, options: ["3", "4", "Error"], answer: 1, explain: "The decorator adds 1." },
      { type: "code", q: "Define a recursive `power(base, exp)` (exp ≥ 0) without using ** or pow.", starter: "", tests: [{ append: "print(power(2, 10))\nprint(power(5, 0))", expected: out(1024, 1) }], explain: "Base case exp == 0 returns 1.", solution: py`
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)` },
    ],
  },
  {
    moduleId: "m15",
    questions: [
      { type: "mcq", q: "Best structure for rooms with exits in a text adventure?", options: ["A single string", "A dict of dicts", "A tuple of ints"], answer: 1, explain: "Rooms keyed by name, each with exits." },
      { type: "mcq", q: "Which module should generate real passwords?", options: ["random", "secrets", "math"], answer: 1, explain: "secrets is cryptographically secure." },
      { type: "output", q: "What is printed?", code: py`
BEATS = {"rock": "scissors", "paper": "rock", "scissors": "paper"}
print(BEATS["paper"])`, options: ["rock", "scissors", "paper"], answer: 0, explain: "Paper beats rock." },
      { type: "blank", q: "Fill in to save a Python list to a JSON file.", code: "json.____(tasks, f)", answers: ["dump"], explain: "json.dump writes to a file." },
      { type: "code", q: "Define `check_guess(secret, guess)` returning `Too low`, `Too high` or `Correct`.", starter: "", tests: [{ append: 'print(check_guess(10, 3))\nprint(check_guess(10, 30))\nprint(check_guess(10, 10))', expected: out("Too low", "Too high", "Correct") }], explain: "Compare guess with secret.", solution: py`
def check_guess(secret, guess):
    if guess < secret:
        return "Too low"
    if guess > secret:
        return "Too high"
    return "Correct"` },
    ],
  },
];

export const QUIZ_PASS_PERCENT = 60;
