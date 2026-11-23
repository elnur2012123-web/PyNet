import type { Module } from "../types";
import { out, py } from "../helpers";

export const m03: Module = {
  id: "m3",
  number: 3,
  title: "Operators",
  description: "Do math, compare values and combine conditions with Python's operators.",
  icon: "calculator",
  lessons: [
    {
      id: "m3-arithmetic",
      title: "Arithmetic: +, - and *",
      minutes: 6,
      intro: `**Operators** are symbols that do something with values. The arithmetic operators do math:

- \`+\` addition
- \`-\` subtraction
- \`*\` multiplication (a star, not ×)

You can use them with numbers directly or with variables. If you mix an \`int\` and a \`float\`, the answer is a \`float\`: \`2 * 1.5\` → \`3.0\`.

\`+\` and \`*\` also work on strings: \`+\` joins them and \`"ha" * 3\` repeats the text.`,
      syntax: py`
result = 5 + 3
result = 10 - 4
result = 6 * 7`,
      examples: [
        { title: "A shopping bill", code: py`
apples = 4
price = 0.75
total = apples * price
print("Total:", total)` },
        { title: "Changing a score", code: py`
score = 100
score = score - 15
print(score)` },
      ],
      realWorld: `Every app that shows a total — a cart, a bank balance, a fitness tracker — uses these operators behind the scenes.`,
      mistakes: [
        { wrong: py`print(3 x 4)`, right: py`print(3 * 4)`, why: "Use * for multiplication, not x." },
      ],
      tryIt: py`
a = 12
b = 5
print(a + b)
print(a - b)
print(a * b)`,
      practice: [
        { prompt: "Print the sum of 128 and 72.", tests: [{ expected: "200" }], hint: "print(128 + 72)", solution: py`print(128 + 72)` },
        { prompt: "You have `money = 50` and spend `18`. Print how much is left.", tests: [{ expected: "32" }], hint: "Store money = 50, then print(money - 18).", solution: py`
money = 50
print(money - 18)` },
        { prompt: "A rectangle has `width = 7` and `height = 9`. Print its area (width × height).", tests: [{ expected: "63" }], hint: "print(width * height)", solution: py`
width = 7
height = 9
print(width * height)` },
      ],
      quiz: [
        { q: "What is printed?", code: py`print(2 + 3 * 1.0)`, options: ["5", "5.0", "6.0", "Error"], answer: 1, explain: "Mixing int and float gives a float: 5.0." },
        { q: "Which symbol multiplies?", options: ["x", "×", "*", "^"], answer: 2, explain: "Python uses *." },
      ],
    },
    {
      id: "m3-division",
      title: "Division and floor division",
      minutes: 7,
      intro: `Python has **two** kinds of division:

- \`/\` — **normal division**. The result is **always a float**: \`10 / 2\` → \`5.0\`, \`7 / 2\` → \`3.5\`.
- \`//\` — **floor division**. It divides and then throws away the decimal part (rounds down): \`7 // 2\` → \`3\`.

Floor division answers questions like "how many **full** groups can I make?". If 17 students sit at tables of 4, \`17 // 4\` → \`4\` full tables.

Dividing by zero is impossible, so Python raises a **ZeroDivisionError**.`,
      syntax: py`
print(7 / 2)    # 3.5
print(7 // 2)   # 3`,
      examples: [
        { title: "Splitting a bill", code: py`
bill = 90
people = 4
print(bill / people)` },
        { title: "Full boxes", code: py`
eggs = 26
per_box = 6
print(eggs // per_box, "full boxes")` },
      ],
      realWorld: `Converting seconds to minutes (\`seconds // 60\`), counting pages, or splitting items into groups all use floor division.`,
      mistakes: [
        { wrong: py`print(10 / 0)`, right: py`print(10 / 2)`, why: "Dividing by zero raises ZeroDivisionError. Always make sure the divisor is not 0." },
      ],
      tryIt: py`
print(20 / 6)
print(20 // 6)
print(10 / 5)`,
      practice: [
        { prompt: "Print `15 / 4`.", tests: [{ expected: "3.75" }], hint: "Normal division with /.", solution: py`print(15 / 4)` },
        { prompt: "There are `125` minutes. Print how many **full hours** that is.", tests: [{ expected: "2" }], hint: "Use // 60.", solution: py`
minutes = 125
print(minutes // 60)` },
        { prompt: "Print `9 / 3`. Notice the type of the result.", tests: [{ expected: "3.0" }], hint: "/ always gives a float.", solution: py`print(9 / 3)` },
      ],
      quiz: [
        { q: "What is `9 // 2`?", options: ["4.5", "4", "5", "4.0"], answer: 1, explain: "Floor division drops the decimal part." },
        { q: "What is `8 / 4`?", options: ["2", "2.0", "0.5", "32"], answer: 1, explain: "/ always returns a float." },
      ],
    },
    {
      id: "m3-modulus-power",
      title: "Modulus and exponentiation",
      minutes: 7,
      intro: `**Modulus** \`%\` gives the **remainder** after division.

\`17 % 5\` → \`2\` because 17 = 5 × 3 + **2**.

The most famous use: checking if a number is **even**. If \`n % 2\` is \`0\`, the number is even; if it is \`1\`, it is odd.

**Exponentiation** \`**\` means "to the power of": \`2 ** 3\` → \`8\` (2 × 2 × 2). \`9 ** 0.5\` gives the square root, \`3.0\`.`,
      syntax: py`
print(17 % 5)   # 2
print(2 ** 10)  # 1024`,
      examples: [
        { title: "Even or odd?", code: py`
print(10 % 2)
print(7 % 2)`, note: "0 means even, 1 means odd." },
        { title: "Powers", code: py`
side = 5
print("Square area:", side ** 2)
print("Cube volume:", side ** 3)` },
      ],
      realWorld: `Modulus is used for clocks (hours wrap around after 12 or 24), alternating row colours in tables, and checking divisibility. Powers appear in compound interest and physics formulas.`,
      mistakes: [
        { wrong: py`print(2 ^ 3)`, right: py`print(2 ** 3)`, why: "^ is not power in Python (it is a bitwise operator). Use **." },
      ],
      tryIt: py`
n = 23
print(n % 2)
print(n % 10)
print(n ** 2)`,
      practice: [
        { prompt: "Print the remainder of 47 divided by 6.", tests: [{ expected: "5" }], hint: "print(47 % 6)", solution: py`print(47 % 6)` },
        { prompt: "Print 3 to the power of 4.", tests: [{ expected: "81" }], hint: "print(3 ** 4)", solution: py`print(3 ** 4)` },
        { prompt: "Print the last digit of `98765` using `%`.", tests: [{ expected: "5" }], hint: "Any number % 10 gives its last digit.", solution: py`print(98765 % 10)` },
      ],
      quiz: [
        { q: "What is `20 % 6`?", options: ["3", "2", "3.33", "0"], answer: 1, explain: "6 × 3 = 18, remainder 2." },
        { q: "What is `4 ** 2`?", options: ["8", "16", "6", "42"], answer: 1, explain: "4 × 4 = 16." },
      ],
    },
    {
      id: "m3-comparison",
      title: "Comparison operators",
      minutes: 6,
      intro: `**Comparison operators** compare two values and give back \`True\` or \`False\`:

- \`==\` equal to
- \`!=\` not equal to
- \`>\` greater than, \`<\` less than
- \`>=\` greater than or equal, \`<=\` less than or equal

Remember: **one** \`=\` stores a value, **two** \`==\` compare values.

You can compare strings too: \`"cat" == "cat"\` is \`True\`, and \`"Cat" == "cat"\` is \`False\` (case matters).`,
      syntax: py`
print(5 == 5)
print(5 != 3)
print(10 >= 11)`,
      examples: [
        { title: "Checking age", code: py`
age = 16
print(age >= 18)
print(age < 18)` },
        { title: "Comparing text", code: py`
password = "pyth0n"
print(password == "pyth0n")
print(password == "Pyth0n")` },
      ],
      realWorld: `Login systems compare the password you type with the stored one. Games compare your score with the high score.`,
      mistakes: [
        { wrong: py`print(5 = 5)`, right: py`print(5 == 5)`, why: "= is assignment. Comparing needs ==." },
      ],
      tryIt: py`
score = 75
print(score > 50)
print(score == 100)
print(score != 0)`,
      practice: [
        { prompt: "Print whether `42` is equal to `42`.", tests: [{ expected: "True" }], hint: "Use ==.", solution: py`print(42 == 42)` },
        { prompt: "With `temp = 18`, print whether temp is less than or equal to 20.", tests: [{ expected: "True" }], hint: "<=", solution: py`
temp = 18
print(temp <= 20)` },
        { prompt: 'Print whether `"apple"` is not equal to `"Apple"`.', tests: [{ expected: "True" }], hint: "!= and remember case matters.", solution: py`print("apple" != "Apple")` },
      ],
      quiz: [
        { q: "What is `7 != 7`?", options: ["True", "False"], answer: 1, explain: "7 is equal to 7, so 'not equal' is False." },
        { q: "Which operator checks equality?", options: ["=", "==", "===", "eq"], answer: 1, explain: "Python uses == to compare." },
      ],
    },
    {
      id: "m3-logical",
      title: "Logical operators",
      minutes: 7,
      intro: `**Logical operators** combine \`True\`/\`False\` values:

- \`and\` — True only if **both** sides are True.
- \`or\` — True if **at least one** side is True.
- \`not\` — flips the value: \`not True\` → \`False\`.

Example: to ride a roller coaster you must be tall enough **and** old enough. To get a discount you can be a student **or** a senior.`,
      syntax: py`
print(True and False)  # False
print(True or False)   # True
print(not True)        # False`,
      examples: [
        { title: "Roller coaster rules", code: py`
height = 150
age = 12
print(height >= 140 and age >= 10)` },
        { title: "Weekend check", code: py`
day = "Sunday"
print(day == "Saturday" or day == "Sunday")` },
      ],
      realWorld: `Search filters use these: "price under 50 **and** in stock", "red **or** blue", "**not** sold out".`,
      mistakes: [
        { wrong: py`print(day == "Sat" or "Sun")`, right: py`print(day == "Sat" or day == "Sun")`, why: 'Each side of or must be a full comparison. "Sun" on its own is always truthy.' },
      ],
      tryIt: py`
has_ticket = True
is_vip = False
print(has_ticket and is_vip)
print(has_ticket or is_vip)
print(not is_vip)`,
      practice: [
        { prompt: "With `age = 20` and `has_id = True`, print whether age is at least 18 **and** has_id is True.", tests: [{ expected: "True" }], hint: "age >= 18 and has_id", solution: py`
age = 20
has_id = True
print(age >= 18 and has_id)` },
        { prompt: "Print `not (5 > 3)`.", tests: [{ expected: "False" }], hint: "5 > 3 is True; not flips it.", solution: py`print(not (5 > 3))` },
        { prompt: "With `n = 15`, print whether n is less than 10 **or** greater than 12.", tests: [{ expected: "True" }], hint: "n < 10 or n > 12", solution: py`
n = 15
print(n < 10 or n > 12)` },
      ],
      quiz: [
        { q: "What is `True and False`?", options: ["True", "False"], answer: 1, explain: "and needs both to be True." },
        { q: "What is `False or True`?", options: ["True", "False"], answer: 0, explain: "or needs at least one True." },
      ],
    },
    {
      id: "m3-assignment",
      title: "Assignment operators",
      minutes: 5,
      intro: `Often you want to update a variable using its own value: \`score = score + 10\`. Python has a shortcut:

- \`x += 5\` means \`x = x + 5\`
- \`x -= 5\` means \`x = x - 5\`
- \`x *= 2\` means \`x = x * 2\`
- \`x /= 2\` means \`x = x / 2\`
- also \`//=\`, \`%=\` and \`**=\`

These are called **augmented assignment operators**. They make code shorter and easier to read.`,
      syntax: py`
points = 0
points += 10
points *= 2`,
      examples: [
        { title: "Collecting coins", code: py`
coins = 0
coins += 5
coins += 3
print(coins)` },
        { title: "Halving", code: py`
size = 64
size //= 2
size //= 2
print(size)` },
      ],
      realWorld: `Counters are everywhere: likes on a post, items in a cart, steps walked today. They are usually updated with +=.`,
      mistakes: [
        { wrong: py`count =+ 1`, right: py`count += 1`, why: "=+ 1 just sets count to +1. The operator is +=." },
      ],
      tryIt: py`
balance = 100
balance -= 30
balance += 15
print(balance)`,
      practice: [
        { prompt: "Start with `steps = 1000`. Use `+=` to add `250`, then print steps.", tests: [{ expected: "1250" }], hint: "steps += 250", solution: py`
steps = 1000
steps += 250
print(steps)` },
        { prompt: "Start with `money = 10`. Double it twice using `*=` and print it.", tests: [{ expected: "40" }], hint: "money *= 2 two times.", solution: py`
money = 10
money *= 2
money *= 2
print(money)` },
        { prompt: "Start with `lives = 3`, lose one life with `-=`, and print it.", tests: [{ expected: "2" }], hint: "lives -= 1", solution: py`
lives = 3
lives -= 1
print(lives)` },
      ],
      quiz: [
        { q: "What is printed?", code: py`
x = 5
x += 3
x *= 2
print(x)`, options: ["16", "13", "11", "10"], answer: 0, explain: "5 + 3 = 8, then 8 × 2 = 16." },
        { q: "`x -= 4` is the same as…", options: ["x = 4 - x", "x = x - 4", "x == x - 4", "x = -4"], answer: 1, explain: "Augmented assignment uses the current value." },
      ],
    },
    {
      id: "m3-precedence",
      title: "Operator precedence",
      minutes: 6,
      intro: `When an expression has several operators, Python follows an order — just like in school math:

- \`( )\` brackets first
- \`**\` powers
- \`*\`, \`/\`, \`//\`, \`%\`
- \`+\`, \`-\`
- comparisons (\`==\`, \`<\` …)
- \`not\`, then \`and\`, then \`or\`

So \`2 + 3 * 4\` is \`14\`, not \`20\`. If you want the addition first, use brackets: \`(2 + 3) * 4\` → \`20\`.

**Tip:** when in doubt, add brackets. They make code clearer for humans too.`,
      syntax: py`
print(2 + 3 * 4)     # 14
print((2 + 3) * 4)   # 20`,
      examples: [
        { title: "Average of three numbers", code: py`
a, b, c = 8, 6, 10
print((a + b + c) / 3)`, note: "Without brackets, only c would be divided by 3." },
        { title: "Power before minus", code: py`print(-2 ** 2)`, note: "Prints -4: the power happens before the minus sign." },
      ],
      realWorld: `A wrong order in a price formula — for example applying a discount before adding tax — could charge customers the wrong amount.`,
      mistakes: [
        { wrong: py`average = 10 + 20 / 2`, right: py`average = (10 + 20) / 2`, why: "Division happens first, so the first version gives 20.0 instead of 15.0." },
      ],
      tryIt: py`
print(10 - 2 * 3)
print((10 - 2) * 3)
print(2 ** 3 * 2)`,
      practice: [
        { prompt: "Print the average of 4, 8 and 12 (should be `8.0`).", tests: [{ expected: "8.0" }], hint: "Put the sum in brackets before dividing by 3.", solution: py`print((4 + 8 + 12) / 3)` },
        { prompt: "Fix the formula so it prints `30` (add 5 and 10 first, then multiply by 2).", starter: py`print(5 + 10 * 2)`, tests: [{ expected: "30" }], hint: "Use brackets.", solution: py`print((5 + 10) * 2)` },
        { prompt: "Print the result of `100 - 5 ** 2`.", tests: [{ expected: "75" }], hint: "Power first: 5 ** 2 = 25.", solution: py`print(100 - 5 ** 2)` },
      ],
      quiz: [
        { q: "What is `3 + 2 * 2`?", options: ["10", "7", "12", "9"], answer: 1, explain: "Multiplication first: 2 × 2 = 4, then 3 + 4 = 7." },
        { q: "What is `(3 + 2) * 2`?", options: ["10", "7"], answer: 0, explain: "Brackets first." },
      ],
    },
  ],
};
