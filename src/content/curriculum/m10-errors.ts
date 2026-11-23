import type { Module } from "../types";
import { out, py } from "../helpers";

export const m10: Module = {
  id: "m10",
  number: 10,
  title: "Error Handling",
  description: "Read error messages, understand common errors and handle them with try/except.",
  icon: "bug",
  lessons: [
    {
      id: "m10-what-are-errors",
      title: "What are errors? Syntax, runtime and logical",
      minutes: 8,
      intro: `Every programmer makes errors — all day, every day. The skill is understanding them quickly. There are three kinds:

- **Syntax errors** — the code breaks Python's grammar rules (missing colon, unmatched bracket). Python refuses to run **anything**.
- **Runtime errors** (also called **exceptions**) — the grammar is fine, but something goes wrong **while running**, like dividing by zero. Python stops at that line.
- **Logical errors** — the program runs without crashing but gives the **wrong answer**. Python cannot detect these; you find them by testing.

**How to read a traceback** (the error report):

- Read the **last line** first: it shows the **error type** and a message.
- Look for **line N** to see where it happened.`,
      syntax: py`
# Traceback (most recent call last):
#   File "main.py", line 2, in <module>
# ZeroDivisionError: division by zero`,
      examples: [
        { title: "A runtime error", code: py`
print("Start")
result = 10 / 0
print("End")` },
        { title: "A logical error (no crash, wrong answer)", code: py`
a, b = 4, 6
average = a + b / 2
print(average)`, note: "Prints 7.0 instead of 5.0 — brackets are missing." },
      ],
      realWorld: `Professional developers spend a large share of their time debugging. Reading tracebacks calmly is one of the most valuable skills you can learn.`,
      mistakes: [
        { wrong: "Ignoring the error message and changing random lines.", right: "Read the last line, then the line number, then fix that spot.", why: "Error messages tell you exactly what went wrong and where." },
      ],
      tryIt: py`
items = ["a", "b", "c"]
print(items[1])
print(items[5])`,
      practice: [
        { prompt: "Fix the **syntax error** so this prints `ok`.", starter: py`
if True
    print("ok")`, tests: [{ expected: "ok" }], hint: "A colon is missing.", solution: py`
if True:
    print("ok")` },
        { prompt: "Fix the **logical error**: it should print the average of 4 and 6, which is `5.0`.", starter: py`
a, b = 4, 6
print(a + b / 2)`, tests: [{ expected: "5.0" }], hint: "Add brackets around a + b.", solution: py`
a, b = 4, 6
print((a + b) / 2)` },
        { prompt: "Fix the **runtime error** so the program prints `10.0` (divide by 2 instead of 0).", starter: py`
x = 20
print(x / 0)`, tests: [{ expected: "10.0" }], hint: "Change the divisor.", solution: py`
x = 20
print(x / 2)` },
      ],
      quiz: [
        { q: "Which error type does Python NOT detect for you?", options: ["Syntax errors", "Runtime errors", "Logical errors"], answer: 2, explain: "Logical errors produce wrong results without crashing." },
        { q: "Which part of a traceback should you read first?", options: ["The first line", "The last line", "The middle"], answer: 1, explain: "The last line shows the error type and message." },
      ],
    },
    {
      id: "m10-common-errors-1",
      title: "NameError, TypeError and ValueError",
      minutes: 9,
      intro: `Three errors you will meet constantly:

**NameError** — you used a name Python does not know.
- Usually a **typo** (\`pritn\`) or a variable used **before** it was created.

**TypeError** — an operation was used on the **wrong type**.
- \`"Age: " + 5\` (str + int), calling a function with the wrong number of arguments, or calling something that is not a function.

**ValueError** — the **type** is right but the **value** is not acceptable.
- \`int("hello")\` — a string, but not one that looks like a number.

For every error: read the message, find the line, and ask "what did Python expect here?"`,
      syntax: py`
# NameError: name 'x' is not defined
# TypeError: can only concatenate str (not "int") to str
# ValueError: invalid literal for int() with base 10: 'hi'`,
      examples: [
        { title: "Fixing a NameError", code: py`
username = "alex"
print(username)` },
        { title: "Avoiding Type and Value errors", code: py`
age = 15
print("Age: " + str(age))
text = "42"
if text.isdigit():
    print(int(text) + 1)` },
      ],
      realWorld: `Most crashes in beginner programs come from these three errors. Recognising them by name lets you fix them in seconds.`,
      mistakes: [
        { wrong: py`print(Name)`, right: py`name = "Ana"
print(name)`, why: "Python is case-sensitive: Name and name are different, so Name is undefined." },
      ],
      tryIt: py`
value = "12"
print(int(value) * 2)
print("Total: " + str(24))`,
      practice: [
        { prompt: "Fix the NameError (a typo) so it prints `hello`.", starter: py`
greeting = "hello"
print(greting)`, tests: [{ expected: "hello" }], hint: "Check the spelling of the variable.", solution: py`
greeting = "hello"
print(greeting)` },
        { prompt: "Fix the TypeError so it prints `Points: 30`.", starter: py`
points = 30
print("Points: " + points)`, tests: [{ expected: "Points: 30" }], hint: "Convert points with str() or use an f-string.", solution: py`
points = 30
print("Points: " + str(points))` },
        { prompt: 'Read a line. If it is made only of digits (`.isdigit()`), print the number doubled; otherwise print `Not a number`. This avoids a ValueError.', tests: [{ input: ["21"], expected: "42" }, { input: ["abc"], expected: "Not a number" }], hint: "if text.isdigit(): ...", solution: py`
text = input()
if text.isdigit():
    print(int(text) * 2)
else:
    print("Not a number")` },
      ],
      quiz: [
        { q: "`int(\"3.5\")` raises which error?", options: ["TypeError", "ValueError", "NameError"], answer: 1, explain: "It is a string (right type) but not a valid int value." },
        { q: "`len(5)` raises which error?", options: ["TypeError", "ValueError", "NameError"], answer: 0, explain: "int has no length — wrong type." },
      ],
    },
    {
      id: "m10-common-errors-2",
      title: "IndexError, KeyError, ZeroDivisionError and AttributeError",
      minutes: 9,
      intro: `Four more errors tied to data:

**IndexError** — a list/string index that does not exist: \`[1, 2][5]\`. Remember the last index is \`len - 1\`.

**KeyError** — a dictionary key that does not exist: \`{"a": 1}["b"]\`. Use \`in\` or \`.get()\`.

**ZeroDivisionError** — dividing (or using \`%\` / \`//\`) by zero. Check the divisor first.

**AttributeError** — using a method or attribute the object does not have: \`"hi".push("!")\` or \`5.upper()\`. Often caused by a typo in a method name or by a variable being a different type (or \`None\`) than you expected.`,
      syntax: py`
# IndexError: list index out of range
# KeyError: 'b'
# ZeroDivisionError: division by zero
# AttributeError: 'str' object has no attribute 'push'`,
      examples: [
        { title: "Safe access", code: py`
nums = [1, 2, 3]
i = 5
if i < len(nums):
    print(nums[i])
else:
    print("No item at", i)` },
        { title: "Safe division and dict lookup", code: py`
total, count = 50, 0
print(total / count if count else 0)
stock = {"apple": 3}
print(stock.get("pear", 0))` },
      ],
      realWorld: `An empty shopping cart (count = 0) or a product that was deleted (missing key) are everyday situations that cause these errors in real apps.`,
      mistakes: [
        { wrong: py`
names = ["a", "b"]
names.push("c")`, right: py`
names = ["a", "b"]
names.append("c")`, why: "Python lists use append, not push (that is JavaScript)." },
      ],
      tryIt: py`
grades = {"ana": 90}
for name in ["ana", "ben"]:
    print(name, grades.get(name, "no grade"))`,
      practice: [
        { prompt: "Fix the IndexError so it prints the last item `c`.", starter: py`
letters = ["a", "b", "c"]
print(letters[3])`, tests: [{ expected: "c" }], hint: "Use index 2 or -1.", solution: py`
letters = ["a", "b", "c"]
print(letters[-1])` },
        { prompt: "Define `safe_divide(a, b)` that returns `a / b`, or `None` when b is 0.", tests: [{ append: "print(safe_divide(10, 2))\nprint(safe_divide(1, 0))", expected: out("5.0", "None") }], hint: "if b == 0: return None", solution: py`
def safe_divide(a, b):
    if b == 0:
        return None
    return a / b` },
        { prompt: "Fix the AttributeError so it prints `HELLO`.", starter: py`
word = "hello"
print(word.uppercase())`, tests: [{ expected: "HELLO" }], hint: "The method is called upper().", solution: py`
word = "hello"
print(word.upper())` },
      ],
      quiz: [
        { q: "`{\"x\": 1}[\"y\"]` raises…", options: ["IndexError", "KeyError", "ValueError"], answer: 1, explain: "Missing dictionary keys raise KeyError." },
        { q: "`[1, 2, 3][3]` raises…", options: ["IndexError", "KeyError", "No error"], answer: 0, explain: "Valid indexes are 0, 1, 2." },
      ],
    },
    {
      id: "m10-common-errors-3",
      title: "IndentationError, ModuleNotFoundError and FileNotFoundError",
      minutes: 7,
      intro: `**IndentationError** — the spaces at the start of lines are wrong: a block is not indented, or indentation is inconsistent. Use 4 spaces per level, and never mix tabs and spaces.

**ModuleNotFoundError** — \`import\` could not find a module. Causes: a typo (\`import maths\`), or a third-party package that is not installed (fix with \`pip install name\` on your computer). *In the PyNest editor, only the standard library is available.*

**FileNotFoundError** — \`open()\` could not find the file. Causes: wrong file name, wrong folder, or the file was never created. Check the path and spelling.`,
      syntax: py`
# IndentationError: expected an indented block after 'if' statement on line 1
# ModuleNotFoundError: No module named 'maths'
# FileNotFoundError: [Errno 44] No such file or directory: 'data.txt'`,
      examples: [
        { title: "Correct imports", code: py`
import math
print(math.sqrt(49))` },
        { title: "Creating a file before reading it", code: py`
with open("notes.txt", "w") as f:
    f.write("Remember Python!")
with open("notes.txt") as f:
    print(f.read())` },
      ],
      realWorld: `When you download a project from the internet, ModuleNotFoundError is often the first error you see — it means you need to install its packages.`,
      mistakes: [
        { wrong: py`import Math`, right: py`import math`, why: "Module names are case-sensitive." },
      ],
      tryIt: py`
import os
print(os.path.exists("missing.txt"))`,
      practice: [
        { prompt: "Fix the IndentationError so it prints `inside`.", starter: py`
if 1 < 2:
print("inside")`, tests: [{ expected: "inside" }], hint: "Indent the print by 4 spaces.", solution: py`
if 1 < 2:
    print("inside")` },
        { prompt: "Fix the import so it prints `3.0` (the square root of 9).", starter: py`
import maths
print(maths.sqrt(9))`, tests: [{ expected: "3.0" }], hint: "The module is called math.", solution: py`
import math
print(math.sqrt(9))` },
        { prompt: "Write `hello` into `greet.txt` (mode \"w\"), then read it back and print it — so no FileNotFoundError happens.", tests: [{ expected: "hello" }], hint: "Use with open(..., 'w') first, then with open(...) to read.", solution: py`
with open("greet.txt", "w") as f:
    f.write("hello")
with open("greet.txt") as f:
    print(f.read())` },
      ],
      quiz: [
        { q: "What usually causes ModuleNotFoundError for a third-party package?", options: ["A syntax error", "The package is not installed", "Division by zero", "Bad indentation"], answer: 1, explain: "Install it with pip." },
        { q: "How many spaces per indentation level are recommended?", options: ["1", "2", "4", "8"], answer: 2, explain: "PEP 8 recommends 4 spaces." },
      ],
    },
    {
      id: "m10-try-except",
      title: "try and except",
      minutes: 9,
      intro: `Some errors are **expected** — a user types letters instead of a number, a file is missing. Instead of crashing, you can **handle** them.

\`try:\` — put code that might fail here.
\`except SomeError:\` — runs only if that error happens inside try.

If no error happens, the except block is skipped.

Tips:

- Catch **specific** errors (\`except ValueError:\`) — not everything.
- You can have several except blocks for different errors.
- \`except ValueError as e:\` gives you the error object, so you can print its message.
- Avoid a bare \`except:\` — it hides real bugs.`,
      syntax: py`
try:
    risky_code()
except ValueError:
    handle_it()`,
      examples: [
        { title: "Safe number input", code: py`
text = "abc"
try:
    n = int(text)
    print("Number:", n)
except ValueError:
    print("That is not a number!")` },
        { title: "Several error types", code: py`
def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "cannot divide by zero"
    except TypeError:
        return "numbers only please"

print(divide(10, 2))
print(divide(1, 0))
print(divide("x", 2))` },
      ],
      realWorld: `Banking apps catch network errors and show "Please try again" instead of crashing. Robust programs expect things to go wrong.`,
      mistakes: [
        { wrong: py`
try:
    x = int("hi")
except:
    pass`, right: py`
try:
    x = int("hi")
except ValueError:
    print("Invalid number")`, why: "A bare except that does nothing hides errors silently, making bugs very hard to find." },
      ],
      tryIt: py`
try:
    age = int(input("Age: "))
    print("In 10 years:", age + 10)
except ValueError:
    print("Please type digits only")`,
      practice: [
        { prompt: "Read a line and try to convert it with int(). Print the number + 1, or `Invalid` on ValueError.", tests: [{ input: ["41"], expected: "42" }, { input: ["forty"], expected: "Invalid" }], hint: "Wrap int(input()) in try/except ValueError.", solution: py`
try:
    n = int(input())
    print(n + 1)
except ValueError:
    print("Invalid")` },
        { prompt: "Read two integers (two lines) and print a / b. If b is 0, catch ZeroDivisionError and print `Cannot divide by zero`.", tests: [{ input: ["10", "4"], expected: "2.5" }, { input: ["5", "0"], expected: "Cannot divide by zero" }], hint: "except ZeroDivisionError:", solution: py`
a = int(input())
b = int(input())
try:
    print(a / b)
except ZeroDivisionError:
    print("Cannot divide by zero")` },
        { prompt: 'Define `get_item(items, i)` that returns items[i], or the string `"missing"` if an IndexError occurs.', tests: [{ append: 'print(get_item([1, 2], 1))\nprint(get_item([1, 2], 9))', expected: out(2, "missing") }], hint: "try: return items[i] except IndexError: return 'missing'", solution: py`
def get_item(items, i):
    try:
        return items[i]
    except IndexError:
        return "missing"` },
      ],
      quiz: [
        { q: "When does the except block run?", options: ["Always", "Only when a matching error occurs in try", "Never", "Before try"], answer: 1, explain: "except only runs on a matching exception." },
        { q: "Why avoid a bare `except:`?", options: ["It is slower", "It hides unexpected bugs", "It is a syntax error", "It only catches one error"], answer: 1, explain: "It catches everything, including mistakes you should see." },
      ],
    },
    {
      id: "m10-else-finally",
      title: "else and finally",
      minutes: 7,
      intro: `A try statement can have two more optional parts:

- **\`else:\`** runs only if **no error** happened in try. Put the "success" code here, keeping the try block small.
- **\`finally:\`** runs **always** — error or not. Use it for clean-up, like closing a file or a connection.

Order: \`try\` → \`except\` → \`else\` → \`finally\`.`,
      syntax: py`
try:
    ...
except SomeError:
    ...
else:
    ...   # no error
finally:
    ...   # always`,
      examples: [
        { title: "All four parts", code: py`
def parse(text):
    try:
        n = int(text)
    except ValueError:
        print("bad input")
    else:
        print("got", n)
    finally:
        print("done")

parse("5")
parse("x")` },
        { title: "Clean-up with finally", code: py`
print("Opening connection")
try:
    print(10 / 0)
except ZeroDivisionError:
    print("Error handled")
finally:
    print("Closing connection")` },
      ],
      realWorld: `Databases and network connections must always be closed, even if something fails — that is exactly what finally guarantees.`,
      mistakes: [
        { wrong: py`
try:
    n = int(text)
    print("Success! Doubled:", n * 2)
    save(n)
except ValueError:
    print("bad")`, right: py`
try:
    n = int(text)
except ValueError:
    print("bad")
else:
    print("Success! Doubled:", n * 2)`, why: "Keep try small so you only catch errors from the line you expect to fail." },
      ],
      tryIt: py`
for value in ["10", "ten"]:
    try:
        n = int(value)
    except ValueError:
        print(value, "-> error")
    else:
        print(value, "->", n * 2)
    finally:
        print("checked", value)`,
      practice: [
        { prompt: "Read a line. Try int(). On ValueError print `error`; in else print `ok`; in finally print `end`.", tests: [{ input: ["7"], expected: out("ok", "end") }, { input: ["seven"], expected: out("error", "end") }], hint: "try / except ValueError / else / finally", solution: py`
try:
    n = int(input())
except ValueError:
    print("error")
else:
    print("ok")
finally:
    print("end")` },
        { prompt: "Read two lines a and b. Print a / b in an else block, `div by zero` on ZeroDivisionError, and always print `finished`.", tests: [{ input: ["9", "3"], expected: out("3.0", "finished") }, { input: ["9", "0"], expected: out("div by zero", "finished") }], hint: "Only the division goes inside try.", solution: py`
a = int(input())
b = int(input())
try:
    result = a / b
except ZeroDivisionError:
    print("div by zero")
else:
    print(result)
finally:
    print("finished")` },
        { prompt: "Define `check(x)` that tries `10 / x`, returns `'bad'` on ZeroDivisionError, `'good'` otherwise (use else), and always prints `checked` (use finally).", tests: [{ append: "print(check(2))\nprint(check(0))", expected: out("checked", "good", "checked", "bad") }], hint: "finally runs before the function actually returns.", solution: py`
def check(x):
    try:
        10 / x
    except ZeroDivisionError:
        return "bad"
    else:
        return "good"
    finally:
        print("checked")` },
      ],
      quiz: [
        { q: "When does `finally` run?", options: ["Only on errors", "Only without errors", "Always"], answer: 2, explain: "finally always runs." },
        { q: "When does `else` (in try) run?", options: ["When an error occurred", "When no error occurred", "Always"], answer: 1, explain: "else is for the success path." },
      ],
    },
    {
      id: "m10-raise",
      title: "Raising exceptions",
      minutes: 7,
      intro: `You can create errors yourself with **\`raise\`**. Why would you want to? To stop your function when it receives **invalid data**, with a clear message.

\`raise ValueError("Age cannot be negative")\`

This is better than silently returning a wrong result. The caller can catch it with try/except.

Choose a fitting error type:

- \`ValueError\` — bad value (negative age, empty name).
- \`TypeError\` — wrong type (a string where a number was needed).`,
      syntax: py`
if bad_condition:
    raise ValueError("clear message")`,
      examples: [
        { title: "Validating input", code: py`
def set_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

print(set_age(15))
try:
    set_age(-3)
except ValueError as e:
    print("Error:", e)` },
        { title: "Type checking", code: py`
def area(side):
    if not isinstance(side, (int, float)):
        raise TypeError("side must be a number")
    return side * side

print(area(4))` },
      ],
      realWorld: `Libraries raise clear exceptions when used incorrectly — for example, a payment function raises an error for a negative amount instead of charging it.`,
      mistakes: [
        { wrong: py`raise "Something bad"`, right: py`raise ValueError("Something bad")`, why: "You must raise an exception object, not a plain string (TypeError)." },
      ],
      tryIt: py`
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("Insufficient funds")
    return balance - amount

try:
    print(withdraw(100, 30))
    print(withdraw(100, 300))
except ValueError as e:
    print("Error:", e)`,
      practice: [
        { prompt: 'Define `set_score(n)` that raises `ValueError("bad score")` if n is not between 0 and 100, otherwise returns n.', tests: [{ append: 'print(set_score(50))\ntry:\n    set_score(150)\nexcept ValueError as e:\n    print(e)', expected: out(50, "bad score") }], hint: "if n < 0 or n > 100: raise ValueError(\"bad score\")", solution: py`
def set_score(n):
    if n < 0 or n > 100:
        raise ValueError("bad score")
    return n` },
        { prompt: 'Define `make_username(name)` that raises `ValueError("empty name")` if name is an empty string, otherwise returns name in lowercase.', tests: [{ append: 'print(make_username("ALEX"))\ntry:\n    make_username("")\nexcept ValueError as e:\n    print(e)', expected: out("alex", "empty name") }], hint: 'if name == "": raise ValueError("empty name")', solution: py`
def make_username(name):
    if name == "":
        raise ValueError("empty name")
    return name.lower()` },
        { prompt: "Call `int(\"oops\")` inside try and print the caught error message using `as e`. Expected output is Python's message.", tests: [{ expected: "invalid literal for int() with base 10: 'oops'" }], hint: "except ValueError as e: print(e)", solution: py`
try:
    int("oops")
except ValueError as e:
    print(e)` },
      ],
      quiz: [
        { q: "What does `raise` do?", options: ["Fixes an error", "Creates (throws) an exception", "Ignores errors", "Restarts the program"], answer: 1, explain: "raise signals an error." },
        { q: "Which error fits a negative quantity?", options: ["TypeError", "ValueError", "NameError", "KeyError"], answer: 1, explain: "The type is right but the value is invalid." },
      ],
    },
    {
      id: "m10-debugging",
      title: "Debugging techniques",
      minutes: 9,
      intro: `**Debugging** is finding and fixing bugs. A calm, step-by-step approach beats guessing:

- **Read the error message** — type, message and line number.
- **Reproduce it** — find the exact input that causes the problem.
- **Print debugging** — add \`print()\` lines to see what values variables really have: \`print("DEBUG total =", total)\`.
- **Check types** with \`type()\` when behaviour is surprising.
- **Shrink the problem** — comment out code until you find the smallest piece that still fails.
- **Rubber duck debugging** — explain your code line by line out loud (or to PyBuddy!). Often you find the bug while explaining.
- **Use assert** — \`assert x > 0, "x must be positive"\` stops the program if an assumption is wrong.

Remove debug prints when you are done.`,
      syntax: py`
print("DEBUG:", variable)
assert condition, "message if false"`,
      examples: [
        { title: "Finding a bug with prints", code: py`
def total_price(prices):
    total = 0
    for p in prices:
        total += p
        print("DEBUG p =", p, "total =", total)
    return total

print(total_price([5, 10, 2]))` },
        { title: "assert checks assumptions", code: py`
def average(nums):
    assert len(nums) > 0, "list must not be empty"
    return sum(nums) / len(nums)

print(average([2, 4]))` },
      ],
      realWorld: `Professional developers use the same techniques — plus debugger tools that pause programs. Print debugging remains one of the most used methods in the world.`,
      mistakes: [
        { wrong: "Changing many lines at once hoping one fixes it.", right: "Change one thing, run, observe, repeat.", why: "Small steps tell you exactly which change fixed (or broke) the program." },
      ],
      tryIt: py`
def count_long_words(words):
    count = 0
    for w in words:
        print("DEBUG checking", w, len(w))
        if len(w) > 4:
            count += 1
    return count

print(count_long_words(["sun", "planet", "galaxy", "star"]))`,
      practice: [
        { prompt: "This function should return the sum of even numbers but returns the wrong value. Fix the bug.", starter: py`
def sum_evens(nums):
    total = 0
    for n in nums:
        if n % 2 == 1:
            total += n
    return total

print(sum_evens([1, 2, 3, 4]))`, tests: [{ expected: "6" }], hint: "Even numbers have remainder 0.", solution: py`
def sum_evens(nums):
    total = 0
    for n in nums:
        if n % 2 == 0:
            total += n
    return total

print(sum_evens([1, 2, 3, 4]))` },
        { prompt: "This should count down 3, 2, 1 but prints nothing. Fix it.", starter: py`
n = 3
while n < 0:
    print(n)
    n -= 1`, tests: [{ expected: out(3, 2, 1) }], hint: "Check the loop condition: should run while n > 0.", solution: py`
n = 3
while n > 0:
    print(n)
    n -= 1` },
        { prompt: "This function should return the largest number, but fails for all-negative lists. Fix it.", starter: py`
def biggest(nums):
    best = 0
    for n in nums:
        if n > best:
            best = n
    return best

print(biggest([-5, -2, -9]))`, tests: [{ expected: "-2" }], hint: "Start best with the first item, not 0.", solution: py`
def biggest(nums):
    best = nums[0]
    for n in nums:
        if n > best:
            best = n
    return best

print(biggest([-5, -2, -9]))` },
      ],
      quiz: [
        { q: "What is 'rubber duck debugging'?", options: ["Deleting code", "Explaining code line by line out loud", "Using a special tool", "Restarting the computer"], answer: 1, explain: "Explaining your code often reveals the bug." },
        { q: "What does `assert x > 0` do when x is -1?", options: ["Nothing", "Raises AssertionError", "Prints False", "Sets x to 0"], answer: 1, explain: "A failed assert raises AssertionError." },
      ],
    },
  ],
};
