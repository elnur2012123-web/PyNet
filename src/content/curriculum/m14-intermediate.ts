import type { Module } from "../types";
import { out, py } from "../helpers";

export const m14: Module = {
  id: "m14",
  number: 14,
  title: "Intermediate Python",
  description: "Write elegant, Pythonic code with comprehensions, generators, recursion and decorators.",
  icon: "sparkles",
  lessons: [
    {
      id: "m14-list-comprehensions",
      title: "List comprehensions",
      minutes: 9,
      intro: `A **list comprehension** builds a new list in **one readable line**.

Instead of:

\`squares = []\`
\`for n in range(5):\`
\`    squares.append(n * n)\`

write:

\`squares = [n * n for n in range(5)]\`

Read it as: "**n × n for each n in range(5)**".

Add a **filter** with \`if\` at the end: \`[n for n in nums if n > 0]\`.

You can also transform with if/else in the front part: \`["even" if n % 2 == 0 else "odd" for n in nums]\`.

Keep comprehensions short — if one becomes hard to read, use a normal loop.`,
      syntax: py`
[expression for item in iterable]
[expression for item in iterable if condition]`,
      examples: [
        { title: "Transform", code: py`
names = ["ana", "ben", "cy"]
print([n.title() for n in names])` },
        { title: "Filter", code: py`
nums = [4, -2, 9, 0, -7, 3]
print([n for n in nums if n > 0])` },
      ],
      realWorld: `Data cleaning is full of comprehensions: "all emails in lowercase", "only orders above $50", "prices with tax added".`,
      mistakes: [
        { wrong: py`[for n in nums n * 2]`, right: py`[n * 2 for n in nums]`, why: "The expression comes first, then the for part." },
      ],
      tryIt: py`
words = ["apple", "kiwi", "banana", "fig"]
print([w.upper() for w in words if len(w) > 3])`,
      practice: [
        { prompt: "Use a list comprehension to print the cubes of 1 to 5: `[1, 8, 27, 64, 125]`.", tests: [{ expected: "[1, 8, 27, 64, 125]" }], hint: "[n ** 3 for n in range(1, 6)]", solution: py`print([n ** 3 for n in range(1, 6)])` },
        { prompt: "Given `nums = [1, 2, 3, 4, 5, 6, 7, 8]`, print only the even numbers using a comprehension.", tests: [{ expected: "[2, 4, 6, 8]" }], hint: "if n % 2 == 0", solution: py`
nums = [1, 2, 3, 4, 5, 6, 7, 8]
print([n for n in nums if n % 2 == 0])` },
        { prompt: 'Given `words = ["hi", "hello", "hey"]`, print a list of their lengths.', tests: [{ expected: "[2, 5, 3]" }], hint: "[len(w) for w in words]", solution: py`
words = ["hi", "hello", "hey"]
print([len(w) for w in words])` },
      ],
      quiz: [
        { q: "What does `[x * 2 for x in [1, 2, 3]]` produce?", options: ["[1, 2, 3, 1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]"], answer: 1, explain: "Each item is doubled." },
        { q: "Where does the filtering `if` go?", options: ["At the start", "At the end", "Inside the for"], answer: 1, explain: "[expr for x in items if cond]" },
      ],
    },
    {
      id: "m14-dict-comprehensions",
      title: "Dictionary comprehensions",
      minutes: 7,
      intro: `**Dictionary comprehensions** build dicts in one line, using \`key: value\`:

\`{n: n * n for n in range(4)}\` → \`{0: 0, 1: 1, 2: 4, 3: 9}\`

They are great for:

- Building a lookup table from a list.
- Transforming every value: \`{k: v * 2 for k, v in prices.items()}\`
- Filtering: \`{k: v for k, v in scores.items() if v >= 50}\`
- Swapping keys and values: \`{v: k for k, v in d.items()}\`

There are also **set comprehensions**: \`{w.lower() for w in words}\`.`,
      syntax: py`{key_expr: value_expr for item in iterable if condition}`,
      examples: [
        { title: "Word lengths", code: py`
words = ["sun", "planet", "star"]
print({w: len(w) for w in words})` },
        { title: "Discount every price", code: py`
prices = {"tea": 2.0, "cake": 5.0}
sale = {item: p * 0.8 for item, p in prices.items()}
print(sale)` },
      ],
      realWorld: `Turning a list of users into a dict keyed by user ID makes lookups instant — a very common pattern in web backends.`,
      mistakes: [
        { wrong: py`{k, v for k, v in d.items()}`, right: py`{k: v for k, v in d.items()}`, why: "Use a colon between key and value; a comma makes it a set/tuple syntax error." },
      ],
      tryIt: py`
scores = {"ana": 82, "ben": 45, "cy": 67}
passed = {name: s for name, s in scores.items() if s >= 50}
print(passed)`,
      practice: [
        { prompt: "Build and print `{1: 1, 2: 4, 3: 9}` with a dict comprehension.", tests: [{ expected: "{1: 1, 2: 4, 3: 9}" }], hint: "{n: n * n for n in range(1, 4)}", solution: py`print({n: n * n for n in range(1, 4)})` },
        { prompt: 'Given `stock = {"apple": 0, "pear": 4, "plum": 2}`, print a dict with only items in stock (value > 0).', tests: [{ expected: "{'pear': 4, 'plum': 2}" }], hint: "if v > 0", solution: py`
stock = {"apple": 0, "pear": 4, "plum": 2}
print({k: v for k, v in stock.items() if v > 0})` },
        { prompt: 'Given `codes = {"a": 1, "b": 2}`, swap keys and values and print the result.', tests: [{ expected: "{1: 'a', 2: 'b'}" }], hint: "{v: k for k, v in codes.items()}", solution: py`
codes = {"a": 1, "b": 2}
print({v: k for k, v in codes.items()})` },
      ],
      quiz: [
        { q: "What does `{x: x + 1 for x in [1, 2]}` produce?", options: ["{1: 2, 2: 3}", "[2, 3]", "{2, 3}"], answer: 0, explain: "Keys 1, 2 with values x + 1." },
        { q: "What does `{w for w in [\"a\", \"a\", \"b\"]}` create?", options: ["A list", "A dict", "A set"], answer: 2, explain: "No colon → set comprehension." },
      ],
    },
    {
      id: "m14-enumerate-zip",
      title: "enumerate() and zip()",
      minutes: 7,
      intro: `Two helpers that make loops cleaner:

**\`enumerate(items)\`** gives you the **index and the item** together:

\`for i, name in enumerate(names):\`

Start counting from 1 with \`enumerate(names, start=1)\`.

**\`zip(a, b)\`** walks through two (or more) lists **side by side**, pairing items:

\`for name, score in zip(names, scores):\`

\`zip\` stops at the **shortest** list. \`dict(zip(keys, values))\` builds a dictionary from two lists.`,
      syntax: py`
for i, item in enumerate(items, start=1):
    ...
for a, b in zip(list_a, list_b):
    ...`,
      examples: [
        { title: "Numbered list", code: py`
tasks = ["study", "train", "sleep"]
for i, t in enumerate(tasks, start=1):
    print(f"{i}. {t}")` },
        { title: "Pairing lists", code: py`
names = ["Ana", "Ben"]
scores = [91, 78]
for n, s in zip(names, scores):
    print(n, s)
print(dict(zip(names, scores)))` },
      ],
      realWorld: `Leaderboards show "1. Ana 980 XP" with enumerate; spreadsheet columns are combined row by row with zip.`,
      mistakes: [
        { wrong: py`
for i in range(len(names)):
    print(i, names[i])`, right: py`
for i, name in enumerate(names):
    print(i, name)`, why: "range(len(...)) works but enumerate is clearer and less error-prone." },
      ],
      tryIt: py`
days = ["Mon", "Tue", "Wed"]
temps = [21, 24, 19]
for i, (d, t) in enumerate(zip(days, temps), start=1):
    print(i, d, t)`,
      practice: [
        { prompt: 'Given `colors = ["red", "green", "blue"]`, print `1 red`, `2 green`, `3 blue` using enumerate.', tests: [{ expected: out("1 red", "2 green", "3 blue") }], hint: "enumerate(colors, start=1)", solution: py`
colors = ["red", "green", "blue"]
for i, c in enumerate(colors, start=1):
    print(i, c)` },
        { prompt: 'Given `items = ["pen", "cup"]` and `prices = [2, 5]`, print `pen costs 2` and `cup costs 5` using zip.', tests: [{ expected: out("pen costs 2", "cup costs 5") }], hint: "for item, price in zip(items, prices):", solution: py`
items = ["pen", "cup"]
prices = [2, 5]
for item, price in zip(items, prices):
    print(f"{item} costs {price}")` },
        { prompt: 'Build a dict from `keys = ["x", "y", "z"]` and `vals = [1, 2, 3]` with zip and print it.', tests: [{ expected: "{'x': 1, 'y': 2, 'z': 3}" }], hint: "dict(zip(keys, vals))", solution: py`
keys = ["x", "y", "z"]
vals = [1, 2, 3]
print(dict(zip(keys, vals)))` },
      ],
      quiz: [
        { q: "What does enumerate give you in each iteration?", options: ["Only the index", "Only the item", "Index and item"], answer: 2, explain: "A pair (index, item)." },
        { q: "`list(zip([1, 2, 3], [\"a\", \"b\"]))` has how many pairs?", options: ["3", "2", "5"], answer: 1, explain: "zip stops at the shortest list." },
      ],
    },
    {
      id: "m14-map-filter",
      title: "map() and filter()",
      minutes: 7,
      intro: `**map(function, items)** applies a function to **every** item.

\`list(map(int, ["1", "2"]))\` → \`[1, 2]\`

**filter(function, items)** keeps only the items where the function returns **True**.

\`list(filter(lambda n: n > 0, nums))\`

Both return **lazy** objects — wrap them in \`list()\` to see the results.

They pair nicely with built-in functions and lambdas. In modern Python, list comprehensions often do the same thing more readably; both styles are worth recognising.`,
      syntax: py`
list(map(function, items))
list(filter(function, items))`,
      examples: [
        { title: "map", code: py`
prices = ["3.5", "10", "7.25"]
nums = list(map(float, prices))
print(sum(nums))` },
        { title: "filter", code: py`
words = ["", "hi", "", "python"]
print(list(filter(None, words)))
print(list(filter(lambda w: len(w) > 2, words)))`, note: "filter(None, ...) keeps truthy items, removing empty strings." },
      ],
      realWorld: `Reading numbers from a file or form often starts with \`map(int, line.split())\`.`,
      mistakes: [
        { wrong: py`print(map(str.upper, ["a", "b"]))`, right: py`print(list(map(str.upper, ["a", "b"])))`, why: "map returns a map object; convert it with list() to see values." },
      ],
      tryIt: py`
nums = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda n: n % 2 == 0, nums))
doubled = list(map(lambda n: n * 2, evens))
print(evens, doubled)`,
      practice: [
        { prompt: 'Use map to convert `["4", "5", "6"]` to ints and print their sum.', tests: [{ expected: "15" }], hint: "sum(map(int, [...]))", solution: py`print(sum(map(int, ["4", "5", "6"])))` },
        { prompt: "Use filter with a lambda to print the numbers in `[3, 12, 7, 20, 1]` that are greater than 5, as a list.", tests: [{ expected: "[12, 7, 20]" }], hint: "list(filter(lambda n: n > 5, nums))", solution: py`print(list(filter(lambda n: n > 5, [3, 12, 7, 20, 1])))` },
        { prompt: 'Use map with `str.title` to print `["ana", "ben"]` as `[\'Ana\', \'Ben\']`.', tests: [{ expected: "['Ana', 'Ben']" }], hint: "list(map(str.title, names))", solution: py`print(list(map(str.title, ["ana", "ben"])))` },
      ],
      quiz: [
        { q: "What does filter keep?", options: ["Items where the function returns True", "All items", "The first item only"], answer: 0, explain: "It filters out falsy results." },
        { q: "`list(map(len, [\"ab\", \"c\"]))` is…", options: ["[2, 1]", "3", "['ab', 'c']"], answer: 0, explain: "len is applied to each string." },
      ],
    },
    {
      id: "m14-sorting-key",
      title: "Sorting with key",
      minutes: 7,
      intro: `\`sorted()\` and \`.sort()\` accept a **\`key\`** function. Python calls it on each item and sorts by the **result**.

- \`sorted(words, key=len)\` — by length.
- \`sorted(words, key=str.lower)\` — alphabetical, ignoring case.
- \`sorted(people, key=lambda p: p["age"])\` — by a dict field.
- \`reverse=True\` — largest first.

To sort by **several** things, return a tuple: \`key=lambda p: (-p["score"], p["name"])\` sorts by score (high first), then name A→Z for ties.

\`min()\` and \`max()\` accept \`key\` too: \`max(people, key=lambda p: p["score"])\`.`,
      syntax: py`sorted(items, key=function, reverse=False)`,
      examples: [
        { title: "By length", code: py`
words = ["banana", "fig", "cherry", "kiwi"]
print(sorted(words, key=len))` },
        { title: "Leaderboard", code: py`
players = [
    {"name": "Ben", "xp": 300},
    {"name": "Ana", "xp": 450},
    {"name": "Cy", "xp": 300},
]
for p in sorted(players, key=lambda p: (-p["xp"], p["name"])):
    print(p["name"], p["xp"])` },
      ],
      realWorld: `The PyNest leaderboard sorts users by XP (highest first) and then by name to break ties — exactly this technique.`,
      mistakes: [
        { wrong: py`sorted(people, key=p["age"])`, right: py`sorted(people, key=lambda p: p["age"])`, why: "key needs a function, not a value." },
      ],
      tryIt: py`
products = [("pen", 1.5), ("bag", 30), ("book", 12)]
print(sorted(products, key=lambda p: p[1], reverse=True))
print(min(products, key=lambda p: p[1]))`,
      practice: [
        { prompt: 'Sort `["Zebra", "apple", "Mango"]` alphabetically ignoring case and print it.', tests: [{ expected: "['apple', 'Mango', 'Zebra']" }], hint: "key=str.lower", solution: py`print(sorted(["Zebra", "apple", "Mango"], key=str.lower))` },
        { prompt: 'Given `people = [("Ana", 31), ("Ben", 25), ("Cy", 40)]`, print the name of the youngest using min with key.', tests: [{ expected: "Ben" }], hint: "min(people, key=lambda p: p[1])[0]", solution: py`
people = [("Ana", 31), ("Ben", 25), ("Cy", 40)]
print(min(people, key=lambda p: p[1])[0])` },
        { prompt: 'Given `scores = {"ana": 70, "ben": 95, "cy": 82}`, print the names sorted by score from highest to lowest.', tests: [{ expected: "['ben', 'cy', 'ana']" }], hint: "sorted(scores, key=scores.get, reverse=True)", solution: py`
scores = {"ana": 70, "ben": 95, "cy": 82}
print(sorted(scores, key=scores.get, reverse=True))` },
      ],
      quiz: [
        { q: "What is `sorted([\"bb\", \"a\", \"ccc\"], key=len)`?", options: ["['a', 'bb', 'ccc']", "['ccc', 'bb', 'a']", "['a', 'ccc', 'bb']"], answer: 0, explain: "Sorted by length." },
        { q: "What must `key` be?", options: ["A number", "A function", "A list", "A string"], answer: 1, explain: "key is a function applied to each item." },
      ],
    },
    {
      id: "m14-iterators-generators",
      title: "Iterators and generators",
      minutes: 10,
      intro: `An **iterable** is anything you can loop over: lists, strings, dicts, ranges, files. An **iterator** is the object that actually hands out items **one at a time**.

- \`it = iter([1, 2, 3])\` creates an iterator.
- \`next(it)\` gets the next item. When nothing is left, it raises \`StopIteration\` (for loops handle this automatically).

A **generator** is the easiest way to make your own iterator. It is a function that uses **\`yield\`** instead of return. Each \`yield\` hands out a value and **pauses** the function until the next value is requested.

Generators are **lazy**: they produce values only when needed, so they use very little memory — even for millions of items.

**Generator expressions** look like list comprehensions with round brackets: \`sum(n * n for n in range(1000000))\`.`,
      syntax: py`
def count_up(n):
    i = 1
    while i <= n:
        yield i
        i += 1`,
      examples: [
        { title: "next() on an iterator", code: py`
it = iter(["a", "b", "c"])
print(next(it))
print(next(it))
print(next(it))` },
        { title: "A generator", code: py`
def evens(limit):
    for n in range(0, limit + 1, 2):
        yield n

print(list(evens(10)))
for e in evens(4):
    print("got", e)` },
      ],
      realWorld: `Reading a 10 GB log file line by line works because files are iterators — Python never loads the whole file into memory.`,
      mistakes: [
        { wrong: py`
gen = (n for n in range(3))
print(list(gen))
print(list(gen))`, right: py`
nums = [n for n in range(3)]
print(nums)
print(nums)`, why: "A generator can be used only once; the second list() is empty. Use a list if you need the values again." },
      ],
      tryIt: py`
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))`,
      practice: [
        { prompt: "Write a generator `countdown(n)` that yields n, n-1, … 1.", tests: [{ append: "print(list(countdown(4)))", expected: "[4, 3, 2, 1]" }], hint: "while n > 0: yield n; n -= 1", solution: py`
def countdown(n):
    while n > 0:
        yield n
        n -= 1` },
        { prompt: "Write a generator `squares(n)` that yields the squares of 1..n.", tests: [{ append: "print(list(squares(5)))\nprint(sum(squares(3)))", expected: out("[1, 4, 9, 16, 25]", "14") }], hint: "for i in range(1, n + 1): yield i * i", solution: py`
def squares(n):
    for i in range(1, n + 1):
        yield i * i` },
        { prompt: "Use a generator expression inside sum() to print the sum of all odd numbers below 100.", tests: [{ expected: "2500" }], hint: "sum(n for n in range(100) if n % 2 == 1)", solution: py`print(sum(n for n in range(100) if n % 2 == 1))` },
      ],
      quiz: [
        { q: "Which keyword makes a function a generator?", options: ["return", "yield", "gen", "async"], answer: 1, explain: "yield turns a function into a generator." },
        { q: "Why are generators memory-efficient?", options: ["They compress data", "They produce values one at a time, only when needed", "They store values on disk"], answer: 1, explain: "They are lazy." },
      ],
    },
    {
      id: "m14-recursion",
      title: "Recursion",
      minutes: 10,
      intro: `**Recursion** is when a function **calls itself** to solve a smaller version of the same problem.

Every recursive function needs:

- A **base case** — a simple situation where it returns an answer directly (and stops calling itself).
- A **recursive case** — it calls itself with a **smaller** input, moving towards the base case.

Factorial is the classic example: 5! = 5 × 4!, and 1! = 1.

Without a base case, the function calls itself forever until Python stops it with a **RecursionError** (maximum recursion depth exceeded — about 1000 calls).

Recursion shines for naturally nested problems: folders inside folders, family trees, and many puzzles.`,
      syntax: py`
def factorial(n):
    if n <= 1:          # base case
        return 1
    return n * factorial(n - 1)   # recursive case`,
      examples: [
        { title: "Factorial", code: py`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))` },
        { title: "Summing nested lists", code: py`
def deep_sum(items):
    total = 0
    for x in items:
        if isinstance(x, list):
            total += deep_sum(x)
        else:
            total += x
    return total

print(deep_sum([1, [2, 3], [4, [5, 6]]]))` },
      ],
      realWorld: `File explorers calculate a folder's size recursively; search algorithms like those in chess engines explore moves recursively.`,
      mistakes: [
        { wrong: py`
def count(n):
    print(n)
    count(n - 1)`, right: py`
def count(n):
    if n == 0:
        return
    print(n)
    count(n - 1)`, why: "With no base case the function never stops → RecursionError." },
      ],
      tryIt: py`
def countdown(n):
    if n == 0:
        print("Liftoff!")
        return
    print(n)
    countdown(n - 1)

countdown(3)`,
      practice: [
        { prompt: "Write a recursive `factorial(n)`.", tests: [{ append: "print(factorial(1))\nprint(factorial(6))", expected: out(1, 720) }], hint: "Base case n <= 1 returns 1.", solution: py`
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)` },
        { prompt: "Write a recursive `sum_to(n)` returning 1 + 2 + … + n (sum_to(0) is 0).", tests: [{ append: "print(sum_to(0))\nprint(sum_to(10))", expected: out(0, 55) }], hint: "return n + sum_to(n - 1)", solution: py`
def sum_to(n):
    if n == 0:
        return 0
    return n + sum_to(n - 1)` },
        { prompt: "Write a recursive `reverse(s)` that returns the string reversed (no slicing with [::-1]).", tests: [{ append: 'print(reverse("abc"))\nprint(reverse(""))', expected: out("cba", "") }], hint: "reverse(s[1:]) + s[0]; base case: empty string.", solution: py`
def reverse(s):
    if s == "":
        return ""
    return reverse(s[1:]) + s[0]` },
      ],
      quiz: [
        { q: "What stops a recursive function from running forever?", options: ["The base case", "A for loop", "print()", "Nothing"], answer: 0, explain: "The base case returns without recursing." },
        { q: "Missing a base case raises…", options: ["StopIteration", "RecursionError", "KeyError"], answer: 1, explain: "Python limits the recursion depth." },
      ],
    },
    {
      id: "m14-decorators",
      title: "Decorators (introduction)",
      minutes: 10,
      intro: `In Python, **functions are objects**: you can store them in variables, pass them to other functions and return them.

A **decorator** is a function that **wraps another function** to add extra behaviour — without changing the original function's code.

\`@my_decorator\` above a function means: \`func = my_decorator(func)\`.

A decorator usually defines an inner \`wrapper\` function that:

- does something **before**,
- calls the original function,
- does something **after**,
- returns the result.

Use \`*args, **kwargs\` in the wrapper so it works with any arguments. You have already seen a built-in decorator: \`@property\`.`,
      syntax: py`
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@shout
def greet(name):
    return f"hi {name}"`,
      examples: [
        { title: "Logging calls", code: py`
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}{args}")
        return func(*args, **kwargs)
    return wrapper

@log_calls
def add(a, b):
    return a + b

print(add(2, 3))` },
        { title: "Repeat a function", code: py`
def twice(func):
    def wrapper():
        func()
        func()
    return wrapper

@twice
def hello():
    print("Hello!")

hello()` },
      ],
      realWorld: `Web frameworks use decorators everywhere: \`@app.route("/home")\` connects a URL to a function, and \`@login_required\` protects pages.`,
      mistakes: [
        { wrong: py`
def deco(func):
    def wrapper():
        func()
    return wrapper()`, right: py`
def deco(func):
    def wrapper():
        func()
    return wrapper`, why: "Return the wrapper function itself, not the result of calling it." },
      ],
      tryIt: py`
def exclaim(func):
    def wrapper(*args):
        return func(*args) + "!"
    return wrapper

@exclaim
def name_tag(name):
    return "I am " + name

print(name_tag("PyNest"))`,
      practice: [
        { prompt: "Write a decorator `uppercase` that makes the decorated function's returned string uppercase. Apply it to `greet(name)` returning `\"hello \" + name`.", tests: [{ append: 'print(greet("ana"))', expected: "HELLO ANA" }], hint: "wrapper returns func(*args).upper()", solution: py`
def uppercase(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper

@uppercase
def greet(name):
    return "hello " + name` },
        { prompt: 'Write a decorator `announce` that prints `start` before and `end` after calling the function. Apply it to `work()` which prints `working`.', tests: [{ append: "work()", expected: out("start", "working", "end") }], hint: "print, call func(), print.", solution: py`
def announce(func):
    def wrapper(*args, **kwargs):
        print("start")
        result = func(*args, **kwargs)
        print("end")
        return result
    return wrapper

@announce
def work():
    print("working")` },
        { prompt: "Write a decorator `double_result` that doubles a number returned by the function. Apply it to `add(a, b)`.", tests: [{ append: "print(add(2, 3))", expected: "10" }], hint: "return func(*args) * 2", solution: py`
def double_result(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs) * 2
    return wrapper

@double_result
def add(a, b):
    return a + b` },
      ],
      quiz: [
        { q: "`@deco` above `def f():` is the same as…", options: ["f = deco", "f = deco(f)", "deco = f(deco)", "f()"], answer: 1, explain: "The decorator receives f and returns a replacement." },
        { q: "Why use `*args, **kwargs` in a wrapper?", options: ["To make it faster", "So it accepts any arguments", "It is required syntax"], answer: 1, explain: "It forwards whatever arguments are given." },
      ],
    },
  ],
};
