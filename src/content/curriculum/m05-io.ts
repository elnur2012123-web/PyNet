import type { Module } from "../types";
import { out, py } from "../helpers";

export const m05: Module = {
  id: "m5",
  number: 5,
  title: "User Input and Output",
  description: "Make interactive programs that ask questions and respond to the user.",
  icon: "keyboard",
  lessons: [
    {
      id: "m5-input",
      title: "Getting input with input()",
      minutes: 7,
      intro: `So far our programs always did the same thing. **\`input()\`** lets a program **ask the user** for information while it runs.

\`name = input("What is your name? ")\`

- The text inside the brackets is the **prompt** — the question shown to the user.
- The program **waits** until the user types something and presses Enter.
- Whatever they typed is stored in the variable **as a string**.

**In the PyNest editor:** type your answers in the **Input** box before pressing Run — one line for each \`input()\` call.`,
      syntax: py`answer = input("Question? ")`,
      examples: [
        { title: "Greeting the user", code: py`
name = input("What is your name? ")
print("Nice to meet you,", name)` },
        { title: "Two questions", code: py`
food = input("Favourite food? ")
color = input("Favourite colour? ")
print(f"You like {color} {food}!")` },
      ],
      realWorld: `Every form you fill in — sign-up pages, search boxes, chat messages — is a way of collecting input from a user.`,
      mistakes: [
        { wrong: py`input("Name? ")
print(name)`, right: py`name = input("Name? ")
print(name)`, why: "If you do not store the answer in a variable, it is lost." },
      ],
      tryIt: py`
hobby = input("What is your hobby? ")
print("Wow,", hobby, "sounds fun!")`,
      practice: [
        { prompt: "Ask for a name with input() and print `Hello, <name>!` (e.g. `Hello, Mia!`).", tests: [{ input: ["Mia"], expected: "Hello, Mia!" }, { input: ["Leo"], expected: "Hello, Leo!" }], hint: 'name = input() then print(f"Hello, {name}!")', solution: py`
name = input("Name: ")
print(f"Hello, {name}!")` },
        { prompt: "Ask for a city and print it in uppercase.", tests: [{ input: ["paris"], expected: "PARIS" }, { input: ["Tokyo"], expected: "TOKYO" }], hint: "print(city.upper())", solution: py`
city = input("City: ")
print(city.upper())` },
        { prompt: "Ask for a word and print how many characters it has.", tests: [{ input: ["python"], expected: "6" }, { input: ["hi"], expected: "2" }], hint: "print(len(word))", solution: py`
word = input("Word: ")
print(len(word))` },
      ],
      quiz: [
        { q: "What type does input() always return?", options: ["int", "str", "float", "It depends on what the user types"], answer: 1, explain: "input() always gives you a string." },
        { q: "What is the text inside input(\"...\") called?", options: ["A prompt", "A comment", "A variable", "An index"], answer: 0, explain: "It is the prompt shown to the user." },
      ],
    },
    {
      id: "m5-number-input",
      title: "Converting input into numbers",
      minutes: 7,
      intro: `Because \`input()\` returns a **string**, this does not work as expected:

\`age = input("Age? ")\` then \`age + 1\` → **TypeError**.

Convert the answer first:

- \`int(input("Age? "))\` for whole numbers
- \`float(input("Price? "))\` for decimals

If the user types something that is not a number (like "ten"), Python raises a **ValueError**. You will learn how to handle that gracefully in the Error Handling module.`,
      syntax: py`
age = int(input("Age: "))
price = float(input("Price: "))`,
      examples: [
        { title: "Age next year", code: py`
age = int(input("How old are you? "))
print("Next year you will be", age + 1)` },
        { title: "Doubling a price", code: py`
price = float(input("Price: "))
print(price * 2)` },
      ],
      realWorld: `A calculator, a tip calculator or a BMI app all read numbers from the user and must convert them before doing any math.`,
      mistakes: [
        { wrong: py`n = input("Number: ")
print(n * 2)`, right: py`n = int(input("Number: "))
print(n * 2)`, why: 'Without int(), "5" * 2 gives "55" (string repetition), not 10.' },
      ],
      tryIt: py`
n = int(input("Pick a number: "))
print(n, "squared is", n ** 2)`,
      practice: [
        { prompt: "Read a whole number and print it multiplied by 10.", tests: [{ input: ["4"], expected: "40" }, { input: ["12"], expected: "120" }], hint: "n = int(input())", solution: py`
n = int(input())
print(n * 10)` },
        { prompt: "Read a birth year and print the age in 2030 (`2030 - year`).", tests: [{ input: ["2010"], expected: "20" }, { input: ["1999"], expected: "31" }], hint: "Convert with int() first.", solution: py`
year = int(input("Birth year: "))
print(2030 - year)` },
        { prompt: "Read a price (decimal) and print half of it.", tests: [{ input: ["9.0"], expected: "4.5" }, { input: ["3"], expected: "1.5" }], hint: "float(input())", solution: py`
price = float(input())
print(price / 2)` },
      ],
      quiz: [
        { q: "If the user types 5, what does `input() * 2` give?", options: ["10", "55", "Error", "5"], answer: 1, explain: "input() returns '5', and '5' * 2 is '55'." },
        { q: "Which correctly reads a decimal number?", options: ["input(float())", "float(input())", "input().float", "number(input())"], answer: 1, explain: "Wrap input() inside float()." },
      ],
    },
    {
      id: "m5-multiple-inputs",
      title: "Multiple inputs",
      minutes: 7,
      intro: `You can ask several questions one after another — each \`input()\` reads one line.

You can also read **several values from one line** using \`split()\`:

\`a, b = input("Two numbers: ").split()\`

If the user types \`3 7\`, then \`a\` is \`"3"\` and \`b\` is \`"7"\` (still strings!).

To convert them all at once: \`a, b = map(int, input().split())\`. \`map\` applies \`int\` to each piece. Don't worry if map feels new — we cover it later.`,
      syntax: py`
x = input()
y = input()
a, b = input().split()`,
      examples: [
        { title: "Two separate lines", code: py`
first = input("First name: ")
last = input("Last name: ")
print(f"Full name: {first} {last}")` },
        { title: "Two numbers on one line", code: py`
a, b = map(int, input("Two numbers: ").split())
print("Sum:", a + b)` },
      ],
      realWorld: `Programming competitions usually give all the numbers on one line separated by spaces — reading them with split() is a core skill.`,
      mistakes: [
        { wrong: py`a, b = input().split()
print(a + b)`, right: py`a, b = map(int, input().split())
print(a + b)`, why: "The pieces are strings, so + joins them. Convert them to int first." },
      ],
      tryIt: py`
w, h = map(int, input("Width and height: ").split())
print("Area:", w * h)`,
      practice: [
        { prompt: "Read two whole numbers on **separate lines** and print their sum.", tests: [{ input: ["3", "4"], expected: "7" }, { input: ["10", "-2"], expected: "8" }], hint: "Two int(input()) calls.", solution: py`
a = int(input())
b = int(input())
print(a + b)` },
        { prompt: "Read two whole numbers on **one line** (e.g. `6 7`) and print their product.", tests: [{ input: ["6 7"], expected: "42" }, { input: ["2 5"], expected: "10" }], hint: "map(int, input().split())", solution: py`
a, b = map(int, input().split())
print(a * b)` },
        { prompt: "Read a first name and a last name on separate lines and print them as `Last, First`.", tests: [{ input: ["Ada", "Lovelace"], expected: "Lovelace, Ada" }], hint: 'print(f"{last}, {first}")', solution: py`
first = input()
last = input()
print(f"{last}, {first}")` },
      ],
      quiz: [
        { q: "User types `4 9`. What is `a` after `a, b = input().split()`?", options: ["4", "'4'", "'4 9'", "Error"], answer: 1, explain: "split gives strings, so a is the string '4'." },
        { q: "How many lines does each input() call read?", options: ["One", "All of them", "Two", "Zero"], answer: 0, explain: "Each input() reads one line." },
      ],
    },
    {
      id: "m5-formatting-output",
      title: "Formatting output",
      minutes: 7,
      intro: `Good programs present results neatly. You already know the tools:

- **f-strings** to insert values: \`f"Total: {total}"\`
- **decimal places**: \`{value:.2f}\`
- **alignment** in columns: \`{name:<10}\` (left), \`{price:>8.2f}\` (right)
- \`sep\` and \`end\` in print()

Aligning text in columns turns messy output into a clean table, like a receipt.`,
      syntax: py`print(f"{'Item':<10}{'Price':>8}")`,
      examples: [
        { title: "A tidy receipt", code: py`
print(f"{'Item':<10}{'Price':>8}")
print(f"{'Tea':<10}{2.5:>8.2f}")
print(f"{'Cake':<10}{4:>8.2f}")
print("-" * 18)
print(f"{'Total':<10}{6.5:>8.2f}")` },
        { title: "Percentages", code: py`
correct = 17
total = 20
print(f"Score: {correct / total:.0%}")` },
      ],
      realWorld: `Bank statements, sports tables and invoices all rely on aligned columns and consistent decimal places.`,
      mistakes: [
        { wrong: py`print(f"{10/3}")`, right: py`print(f"{10/3:.2f}")`, why: "Without formatting you get 3.3333333333333335 — too many digits for users." },
      ],
      tryIt: py`
name = input("Name: ")
score = float(input("Score: "))
print(f"|{name:^12}|{score:^8.1f}|")`,
      practice: [
        { prompt: "Read a price and print it as `Price: $X.XX` with exactly two decimals.", tests: [{ input: ["5"], expected: "Price: $5.00" }, { input: ["3.14159"], expected: "Price: $3.14" }], hint: 'f"Price: ${price:.2f}"', solution: py`
price = float(input())
print(f"Price: ${"$"}{price:.2f}")` },
        { prompt: "Read a word and print it right-aligned in a field of 10 characters, between `|` characters. e.g. `|       cat|`", tests: [{ input: ["cat"], expected: "|       cat|" }], hint: 'f"|{word:>10}|"', solution: py`
word = input()
print(f"|{word:>10}|")` },
        { prompt: "Read correct answers and total questions (two lines) and print the score as a percentage with no decimals, e.g. `75%`.", tests: [{ input: ["3", "4"], expected: "75%" }, { input: ["1", "3"], expected: "33%" }], hint: 'f"{a / b:.0%}"', solution: py`
a = int(input())
b = int(input())
print(f"{a / b:.0%}")` },
      ],
      quiz: [
        { q: "What does `f\"{'hi':>5}\"` produce?", options: ["'hi   '", "'   hi'", "' hi  '", "'hi'"], answer: 1, explain: "> right-aligns in a field of 5 characters." },
        { q: "What does `f\"{0.256:.1%}\"` produce?", options: ["0.3%", "25.6%", "26%", "0.256%"], answer: 1, explain: "% multiplies by 100 and adds a percent sign." },
      ],
    },
    {
      id: "m5-calculator",
      title: "Project: a simple calculator",
      minutes: 12,
      intro: `Let's combine everything into a small **calculator**:

- Read the first number.
- Read an operator: \`+\`, \`-\`, \`*\` or \`/\`.
- Read the second number.
- Print the result.

To choose the right calculation we need to make decisions — that is the topic of the next module (\`if\` statements). Here is a sneak peek: \`if op == "+":\` runs the indented code only when the operator is plus.

Read the example carefully, run it with different inputs, then try the practice tasks.`,
      syntax: py`
if op == "+":
    result = a + b`,
      examples: [
        { title: "Calculator", code: py`
a = float(input("First number: "))
op = input("Operator (+ - * /): ")
b = float(input("Second number: "))

if op == "+":
    print(a + b)
elif op == "-":
    print(a - b)
elif op == "*":
    print(a * b)
elif op == "/":
    print(a / b)
else:
    print("Unknown operator")` },
        { title: "Sum and average of three numbers", code: py`
a = float(input())
b = float(input())
c = float(input())
total = a + b + c
print(f"Sum: {total}, Average: {total / 3:.2f}")` },
      ],
      realWorld: `Tip calculators, currency converters and unit converters are all variations of this exact program.`,
      mistakes: [
        { wrong: py`op = input()
if op == +:`, right: py`op = input()
if op == "+":`, why: "The operator the user types is a string, so compare it with a string in quotes." },
      ],
      tryIt: py`
a = float(input("First number: "))
b = float(input("Second number: "))
print("Sum:", a + b)
print("Difference:", a - b)
print("Product:", a * b)`,
      practice: [
        { prompt: "Read two numbers (decimals allowed) and print their sum, difference and product on three lines.", tests: [{ input: ["6", "2"], expected: out("8.0", "4.0", "12.0") }], hint: "Use float(input()) twice.", solution: py`
a = float(input())
b = float(input())
print(a + b)
print(a - b)
print(a * b)` },
        { prompt: "Tip calculator: read a bill amount and a tip percentage (two lines). Print the tip with 2 decimals, e.g. bill `50`, tip `10` → `5.00`.", tests: [{ input: ["50", "10"], expected: "5.00" }, { input: ["80", "15"], expected: "12.00" }], hint: "tip = bill * percent / 100", solution: py`
bill = float(input())
percent = float(input())
print(f"{bill * percent / 100:.2f}")` },
        { prompt: "Temperature converter: read Celsius and print Fahrenheit with 1 decimal (`F = C * 9 / 5 + 32`).", tests: [{ input: ["100"], expected: "212.0" }, { input: ["37"], expected: "98.6" }], hint: 'f"{c * 9 / 5 + 32:.1f}"', solution: py`
c = float(input())
print(f"{c * 9 / 5 + 32:.1f}")` },
      ],
      quiz: [
        { q: "Why do we use float() instead of int() in a calculator?", options: ["float is faster", "So users can type decimals like 2.5", "int does not exist", "To avoid using input()"], answer: 1, explain: "float() accepts decimal numbers." },
        { q: "The user types `+`. What is the type of `op` in `op = input()`?", options: ["operator", "str", "int", "bool"], answer: 1, explain: "input() always returns a string." },
      ],
    },
  ],
};
