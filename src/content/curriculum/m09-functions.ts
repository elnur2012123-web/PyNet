import type { Module } from "../types";
import { out, py } from "../helpers";

export const m09: Module = {
  id: "m9",
  number: 9,
  title: "Functions",
  description: "Package code into reusable functions with parameters and return values.",
  icon: "braces",
  lessons: [
    {
      id: "m9-functions-intro",
      title: "What are functions? Creating and calling them",
      minutes: 8,
      intro: `A **function** is a named block of code that does one job. You **define** it once and **call** it whenever you need it.

You already use built-in functions: \`print()\`, \`len()\`, \`input()\`. Now you will make your own.

- **Define** with \`def\`, a name, brackets and a colon. The body is indented.
- **Call** it by writing its name with brackets: \`greet()\`.

Defining a function does **not** run it. The code inside runs only when you call it.

Why use functions?

- **Reuse:** write once, use many times.
- **Organise:** split a big program into small, named pieces.
- **Fix once:** a bug fixed inside the function is fixed everywhere.`,
      syntax: py`
def function_name():
    # body
    ...

function_name()  # call it`,
      examples: [
        { title: "Define and call", code: py`
def greet():
    print("Hello!")
    print("Welcome to PyNest")

greet()
greet()` },
        { title: "A reusable separator", code: py`
def line():
    print("-" * 20)

line()
print("Report")
line()` },
      ],
      realWorld: `Apps have functions like \`send_email()\`, \`calculate_total()\` and \`log_in()\` that are called from many places.`,
      mistakes: [
        { wrong: py`
def hello():
    print("hi")
hello`, right: py`
def hello():
    print("hi")
hello()`, why: "Without brackets the function is not called, so nothing happens." },
        { wrong: py`
say_hi()
def say_hi():
    print("hi")`, right: py`
def say_hi():
    print("hi")
say_hi()`, why: "A function must be defined before the line that calls it runs." },
      ],
      tryIt: py`
def cheer():
    print("Go team!")

for i in range(3):
    cheer()`,
      practice: [
        { prompt: "Define a function `welcome()` that prints `Welcome!`. Call it once.", tests: [{ expected: "Welcome!" }], hint: "def welcome(): then call welcome()", solution: py`
def welcome():
    print("Welcome!")

welcome()` },
        { prompt: "Define `stars()` that prints `*****`. Call it 3 times.", tests: [{ expected: out("*****", "*****", "*****") }], hint: "Call it three times or in a loop.", solution: py`
def stars():
    print("*****")

stars()
stars()
stars()` },
        { prompt: "Define a function `banner()` that prints `===`, then `PyNest`, then `===`. (The tests call it for you, so do not call it yourself.)", tests: [{ append: "banner()", expected: out("===", "PyNest", "===") }], hint: "Three prints inside the function body.", solution: py`
def banner():
    print("===")
    print("PyNest")
    print("===")` },
      ],
      quiz: [
        { q: "Which keyword defines a function?", options: ["func", "def", "function", "define"], answer: 1, explain: "Python uses def." },
        { q: "What is printed?", code: py`
def f():
    print("A")
print("B")`, options: ["A B", "B", "A", "Nothing"], answer: 1, explain: "f is defined but never called." },
      ],
    },
    {
      id: "m9-parameters",
      title: "Parameters and arguments",
      minutes: 8,
      intro: `Functions become much more useful when you can **give them information**.

- A **parameter** is a variable name in the function definition: \`def greet(name):\`
- An **argument** is the actual value you pass in when calling: \`greet("Ana")\`

Inside the function, \`name\` holds whatever was passed in.

You can have several parameters, separated by commas. Arguments are matched **in order**: \`def add(a, b)\` with \`add(2, 5)\` puts 2 in a and 5 in b.

Calling with the wrong number of arguments raises a **TypeError**.`,
      syntax: py`
def greet(name):
    print("Hi", name)

greet("Ana")   # "Ana" is the argument`,
      examples: [
        { title: "One parameter", code: py`
def greet(name):
    print(f"Hello, {name}!")

greet("Ana")
greet("Ben")` },
        { title: "Two parameters", code: py`
def describe(animal, sound):
    print(f"The {animal} says {sound}")

describe("cat", "meow")
describe("cow", "moo")` },
      ],
      realWorld: `\`send_message(to, text)\` — the same function sends different messages to different people based on the arguments.`,
      mistakes: [
        { wrong: py`
def add(a, b):
    print(a + b)
add(1)`, right: py`
def add(a, b):
    print(a + b)
add(1, 2)`, why: "add needs two arguments; giving one raises TypeError: missing 1 required positional argument." },
      ],
      tryIt: py`
def repeat(word, times):
    print(word * times)

repeat("ha", 3)
repeat("-", 10)`,
      practice: [
        { prompt: "Define `square(n)` that **prints** n squared.", tests: [{ append: "square(4)\nsquare(10)", expected: out(16, 100) }], hint: "print(n * n)", solution: py`
def square(n):
    print(n * n)` },
        { prompt: "Define `introduce(name, age)` that prints `I am <name> and I am <age>`.", tests: [{ append: 'introduce("Kai", 12)', expected: "I am Kai and I am 12" }], hint: "Use an f-string with both parameters.", solution: py`
def introduce(name, age):
    print(f"I am {name} and I am {age}")` },
        { prompt: "Define `box(width, height)` that prints a rectangle of `#` with that size.", tests: [{ append: "box(3, 2)", expected: out("###", "###") }, { append: "box(1, 3)", expected: out("#", "#", "#") }], hint: 'for _ in range(height): print("#" * width)', solution: py`
def box(width, height):
    for _ in range(height):
        print("#" * width)` },
      ],
      quiz: [
        { q: "In `def f(x):` and `f(5)`, what is the argument?", options: ["x", "5", "f", "def"], answer: 1, explain: "The value passed in (5) is the argument; x is the parameter." },
        { q: "What happens when you call a 2-parameter function with 3 arguments?", options: ["The extra is ignored", "TypeError", "It works fine", "SyntaxError"], answer: 1, explain: "The number of arguments must match." },
      ],
    },
    {
      id: "m9-return",
      title: "Return values",
      minutes: 9,
      intro: `So far our functions **printed** results. Often you want a function to **give back** a value so you can use it later. That is what **\`return\`** does.

\`def add(a, b):\`
\`    return a + b\`

\`total = add(3, 4)\` → \`total\` is 7.

Key ideas:

- \`return\` sends a value back to the caller and **ends the function immediately**.
- A function without \`return\` gives back \`None\`.
- **print vs return:** print only shows a value on screen; return hands it back so the program can keep working with it.
- You can return several values as a tuple: \`return low, high\`.`,
      syntax: py`
def function_name(params):
    return result

value = function_name(args)`,
      examples: [
        { title: "Using a returned value", code: py`
def area(w, h):
    return w * h

total = area(3, 4) + area(2, 5)
print(total)` },
        { title: "Returning early", code: py`
def is_even(n):
    if n % 2 == 0:
        return True
    return False

print(is_even(10), is_even(7))` },
      ],
      realWorld: `\`calculate_tax(price)\` returns a number that is then added to a bill, shown in a receipt and saved to a database — printing alone could not do that.`,
      mistakes: [
        { wrong: py`
def double(x):
    print(x * 2)
y = double(5) + 1`, right: py`
def double(x):
    return x * 2
y = double(5) + 1`, why: "A function that only prints returns None, and None + 1 raises TypeError." },
      ],
      tryIt: py`
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([4, 9, 1, 7])
print(low, high)`,
      practice: [
        { prompt: "Define `add(a, b)` that **returns** the sum.", tests: [{ append: "print(add(2, 3))\nprint(add(10, -4))", expected: out(5, 6) }], hint: "return a + b", solution: py`
def add(a, b):
    return a + b` },
        { prompt: "Define `is_adult(age)` that returns `True` if age >= 18, else `False`.", tests: [{ append: "print(is_adult(20))\nprint(is_adult(18))\nprint(is_adult(5))", expected: out("True", "True", "False") }], hint: "return age >= 18", solution: py`
def is_adult(age):
    return age >= 18` },
        { prompt: "Define `average(nums)` that returns the average of a list of numbers.", tests: [{ append: "print(average([2, 4, 6]))\nprint(average([5]))", expected: out("4.0", "5.0") }], hint: "return sum(nums) / len(nums)", solution: py`
def average(nums):
    return sum(nums) / len(nums)` },
      ],
      quiz: [
        { q: "What does a function without return give back?", options: ["0", "None", "False", "An error"], answer: 1, explain: "Python returns None by default." },
        { q: "What is printed?", code: py`
def f():
    return 1
    print("x")
print(f())`, options: ["x then 1", "1", "x", "None"], answer: 1, explain: "return ends the function; the print inside never runs." },
      ],
    },
    {
      id: "m9-default-keyword",
      title: "Default parameters and keyword arguments",
      minutes: 7,
      intro: `**Default parameters** give a parameter a value to use when the caller does not provide one:

\`def greet(name, greeting="Hello"):\`

\`greet("Ana")\` uses "Hello"; \`greet("Ana", "Hi")\` uses "Hi".

Rule: parameters **with** defaults must come **after** those without.

**Keyword arguments** name the parameter when calling, so order does not matter:

\`greet(greeting="Hey", name="Ben")\`

You have already used keyword arguments: \`print("a", "b", sep="-")\` — \`sep\` is a keyword argument with a default of \`" "\`.`,
      syntax: py`
def f(a, b=10):
    ...
f(1)
f(1, b=5)
f(b=5, a=1)`,
      examples: [
        { title: "Defaults", code: py`
def power(base, exp=2):
    return base ** exp

print(power(5))
print(power(2, 10))` },
        { title: "Keyword arguments", code: py`
def order(item, size="M", milk=False):
    print(item, size, "with milk" if milk else "no milk")

order("latte", milk=True)
order(size="L", item="tea")` },
      ],
      realWorld: `Settings with sensible defaults: \`resize_image(img, width, keep_ratio=True)\` — most callers never need to change keep_ratio.`,
      mistakes: [
        { wrong: py`def f(a=1, b):
    pass`, right: py`def f(b, a=1):
    pass`, why: "Non-default parameters cannot follow default ones (SyntaxError)." },
      ],
      tryIt: py`
def make_tag(text, tag="p"):
    return f"<{tag}>{text}</{tag}>"

print(make_tag("Hello"))
print(make_tag("Title", tag="h1"))`,
      practice: [
        { prompt: 'Define `greet(name, greeting="Hello")` that returns `"<greeting>, <name>!"`.', tests: [{ append: 'print(greet("Ana"))\nprint(greet("Ben", "Hi"))', expected: out("Hello, Ana!", "Hi, Ben!") }], hint: 'return f"{greeting}, {name}!"', solution: py`
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"` },
        { prompt: "Define `price_with_tax(price, tax=0.1)` returning price plus tax, rounded to 2 decimals with round().", tests: [{ append: "print(price_with_tax(100))\nprint(price_with_tax(50, tax=0.2))", expected: out("110.0", "60.0") }], hint: "return round(price * (1 + tax), 2)", solution: py`
def price_with_tax(price, tax=0.1):
    return round(price * (1 + tax), 2)` },
        { prompt: "Define `describe(name, age, city)` returning `\"<name> (<age>) from <city>\"`. The test calls it with keyword arguments in a different order.", tests: [{ append: 'print(describe(city="Rome", name="Lia", age=30))', expected: "Lia (30) from Rome" }], hint: "Keyword arguments match by name, not position.", solution: py`
def describe(name, age, city):
    return f"{name} ({age}) from {city}"` },
      ],
      quiz: [
        { q: "What is printed?", code: py`
def f(x, y=3):
    return x * y
print(f(2))`, options: ["2", "5", "6", "Error"], answer: 2, explain: "y defaults to 3, so 2 × 3 = 6." },
        { q: "Which call uses a keyword argument?", options: ["f(1, 2)", "f(x=1)", "f()", "f[1]"], answer: 1, explain: "x=1 names the parameter." },
      ],
    },
    {
      id: "m9-scope",
      title: "Local and global scope",
      minutes: 8,
      intro: `**Scope** is where a variable can be seen and used.

- A variable created **inside** a function is **local**: it only exists while the function runs and cannot be used outside.
- A variable created **outside** any function is **global**: functions can **read** it.

If you **assign** to a name inside a function, Python treats it as a new local variable — it does **not** change the global one. You *can* force it with the \`global\` keyword, but it is usually better to **pass values in as parameters and return results**.

Keeping variables local makes functions independent and easier to test.`,
      syntax: py`
x = 10          # global
def f():
    y = 5       # local
    return x + y`,
      examples: [
        { title: "Local variables stay inside", code: py`
def make_total():
    total = 100
    return total

result = make_total()
print(result)` },
        { title: "Assigning creates a local copy", code: py`
count = 0
def bump():
    count = 99
bump()
print(count)`, note: "Prints 0 — the function changed its own local count." },
      ],
      realWorld: `Large programs have thousands of variables. Scope prevents one function from accidentally overwriting another function's data.`,
      mistakes: [
        { wrong: py`
def setup():
    secret = 42
setup()
print(secret)`, right: py`
def setup():
    return 42
secret = setup()
print(secret)`, why: "secret is local to setup, so using it outside raises NameError. Return it instead." },
      ],
      tryIt: py`
score = 0

def add_points(current, points):
    return current + points

score = add_points(score, 10)
score = add_points(score, 5)
print(score)`,
      practice: [
        { prompt: "Fix the NameError by returning the value from the function and storing it in `message`.", starter: py`
def make_message():
    message = "Hi there"

make_message()
print(message)`, tests: [{ expected: "Hi there" }], hint: "return the text and write message = make_message()", solution: py`
def make_message():
    return "Hi there"

message = make_message()
print(message)` },
        { prompt: "Define `add_bonus(score)` that returns score + 50, without using global. Use it to update `score = 100` and print it.", tests: [{ expected: "150" }], hint: "score = add_bonus(score)", solution: py`
def add_bonus(score):
    return score + 50

score = 100
score = add_bonus(score)
print(score)` },
        { prompt: "Predict and print: this code prints the value of `x` after the call. Write code that prints `x` using the same structure, and make it print `5`.", starter: py`
x = 5
def change():
    x = 10
change()
print(x)`, tests: [{ expected: "5" }], hint: "Just run it — assigning inside creates a local variable, the global stays 5.", solution: py`
x = 5
def change():
    x = 10
change()
print(x)` },
      ],
      quiz: [
        { q: "Can code outside a function use a variable created inside it?", options: ["Yes", "No, it is local"], answer: 1, explain: "Local variables exist only inside the function." },
        { q: "What is printed?", code: py`
n = 1
def f():
    return n + 1
print(f())`, options: ["1", "2", "NameError", "None"], answer: 1, explain: "Functions can read global variables." },
      ],
    },
    {
      id: "m9-lambda",
      title: "Lambda functions",
      minutes: 6,
      intro: `A **lambda** is a tiny, unnamed function written on one line:

\`lambda x: x * 2\`

It takes parameters before the colon and **automatically returns** the expression after it.

These two are equivalent:

\`def double(x): return x * 2\`
\`double = lambda x: x * 2\`

Lambdas are mostly used for **short, throwaway** functions passed to other functions, like the \`key\` in \`sorted()\`. For anything longer than one expression, use a normal \`def\`.`,
      syntax: py`lambda parameters: expression`,
      examples: [
        { title: "A simple lambda", code: py`
square = lambda n: n * n
print(square(6))` },
        { title: "Sorting by length", code: py`
words = ["banana", "fig", "apple"]
print(sorted(words, key=lambda w: len(w)))` },
      ],
      realWorld: `Sorting a list of products by price, or users by sign-up date, usually uses a lambda as the sort key.`,
      mistakes: [
        { wrong: py`f = lambda x: return x + 1`, right: py`f = lambda x: x + 1`, why: "Lambdas return automatically; writing return is a SyntaxError." },
      ],
      tryIt: py`
add = lambda a, b: a + b
print(add(3, 4))
people = [("Ana", 30), ("Ben", 22)]
print(sorted(people, key=lambda p: p[1]))`,
      practice: [
        { prompt: "Create `triple = lambda x: ...` that triples a number.", tests: [{ append: "print(triple(4))\nprint(triple(-1))", expected: out(12, -3) }], hint: "lambda x: x * 3", solution: py`triple = lambda x: x * 3` },
        { prompt: 'Given `names = ["Zed", "amy", "Bob"]`, print them sorted ignoring case, using `key=lambda`.', tests: [{ expected: "['amy', 'Bob', 'Zed']" }], hint: "key=lambda n: n.lower()", solution: py`
names = ["Zed", "amy", "Bob"]
print(sorted(names, key=lambda n: n.lower()))` },
        { prompt: "Given `pairs = [(1, 'b'), (3, 'a'), (2, 'c')]`, print them sorted by the **second** item.", tests: [{ expected: "[(3, 'a'), (1, 'b'), (2, 'c')]" }], hint: "key=lambda p: p[1]", solution: py`
pairs = [(1, 'b'), (3, 'a'), (2, 'c')]
print(sorted(pairs, key=lambda p: p[1]))` },
      ],
      quiz: [
        { q: "What does `(lambda a, b: a - b)(10, 4)` return?", options: ["6", "14", "-6", "Error"], answer: 0, explain: "10 - 4 = 6." },
        { q: "When should you use lambda?", options: ["For long, complex logic", "For short one-expression functions", "Never", "Only for printing"], answer: 1, explain: "Lambdas are for short throwaway functions." },
      ],
    },
    {
      id: "m9-practical",
      title: "Practical functions",
      minutes: 10,
      intro: `Let's write the kind of functions real programs use. Good functions:

- Do **one clear job** and have a **descriptive name** (\`count_vowels\`, not \`f\`).
- Take inputs as **parameters** and give results with **return**.
- Have a **docstring**: a string on the first line explaining what the function does.

Functions can call other functions. Building small helpers and combining them is how big programs are made.`,
      syntax: py`
def count_vowels(text):
    """Return how many vowels are in text."""
    ...`,
      examples: [
        { title: "Helpers that work together", code: py`
def celsius_to_f(c):
    """Convert Celsius to Fahrenheit."""
    return c * 9 / 5 + 32

def describe_weather(c):
    f = celsius_to_f(c)
    label = "warm" if c >= 20 else "cool"
    return f"{c}C / {f:.0f}F is {label}"

print(describe_weather(25))
print(describe_weather(8))` },
        { title: "A validator", code: py`
def is_strong_password(pw):
    """At least 8 chars and contains a digit."""
    has_digit = any(ch.isdigit() for ch in pw)
    return len(pw) >= 8 and has_digit

print(is_strong_password("hello"))
print(is_strong_password("hello2026"))` },
      ],
      realWorld: `A real web app might have \`validate_email()\`, \`hash_password()\`, \`create_user()\` — each small, named and tested separately.`,
      mistakes: [
        { wrong: py`
def f(a):
    print(a * 1.2)`, right: py`
def add_vat(price):
    """Return price including 20% VAT."""
    return price * 1.2`, why: "Clear names, docstrings and return values make functions reusable." },
      ],
      tryIt: py`
def count_vowels(text):
    """Return the number of vowels in text."""
    return sum(1 for ch in text.lower() if ch in "aeiou")

print(count_vowels("Python Programming"))`,
      practice: [
        { prompt: "Define `count_vowels(text)` that returns the number of vowels (a, e, i, o, u, any case).", tests: [{ append: 'print(count_vowels("Hello World"))\nprint(count_vowels("AEIOU"))\nprint(count_vowels("xyz"))', expected: out(3, 5, 0) }], hint: "Loop over text.lower() and count chars in 'aeiou'.", solution: py`
def count_vowels(text):
    count = 0
    for ch in text.lower():
        if ch in "aeiou":
            count += 1
    return count` },
        { prompt: "Define `is_palindrome(word)` returning True if the word reads the same backwards (ignore case).", tests: [{ append: 'print(is_palindrome("Level"))\nprint(is_palindrome("python"))', expected: out("True", "False") }], hint: "w = word.lower(); return w == w[::-1]", solution: py`
def is_palindrome(word):
    w = word.lower()
    return w == w[::-1]` },
        { prompt: "Define `largest(nums)` that returns the biggest number **without** using max().", tests: [{ append: "print(largest([3, 9, 2]))\nprint(largest([-5, -1, -7]))", expected: out(9, -1) }], hint: "Start with best = nums[0] and compare each item.", solution: py`
def largest(nums):
    best = nums[0]
    for n in nums:
        if n > best:
            best = n
    return best` },
      ],
      quiz: [
        { q: "What is a docstring?", options: ["A comment starting with #", "A string at the start of a function describing it", "A string returned by a function", "An error message"], answer: 1, explain: "Docstrings document what a function does." },
        { q: "Which is the better function name?", options: ["f", "do_stuff", "calculate_discount", "x1"], answer: 2, explain: "Names should describe the job." },
      ],
    },
  ],
};
