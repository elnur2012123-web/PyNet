import type { Module } from "../types";
import { out, py } from "../helpers";

export const m02: Module = {
  id: "m2",
  number: 2,
  title: "Variables and Data Types",
  description: "Store information in variables and learn the basic kinds of data: text, numbers and True/False.",
  icon: "box",
  lessons: [
    {
      id: "m2-variables",
      title: "What are variables?",
      minutes: 7,
      intro: `Imagine a **variable** as a labelled box where you store information. You give the box a name, put something inside, and later you can look inside or replace what is there.

\`name = "Alex"\`

This line creates a box called \`name\` and puts the text \`Alex\` inside it.

The \`=\` sign does **not** mean "equals" like in math. In Python it means **"store this value in this name"**. We call it the **assignment operator**.

You can change what is inside a variable at any time. The old value is replaced.`,
      syntax: py`variable_name = value`,
      examples: [
        {
          title: "Creating and using variables",
          code: py`
name = "Alex"
age = 16
print(name)
print(age)`,
        },
        {
          title: "Changing a variable",
          code: py`
score = 10
print(score)
score = 25
print(score)`,
          note: "First 10, then 25. The box now holds the new value.",
        },
      ],
      realWorld: `A game stores your score, lives and level in variables. A shopping app stores the items in your cart and the total price in variables.`,
      mistakes: [
        { wrong: py`print("name")`, right: py`print(name)`, why: 'With quotes you print the text "name". Without quotes you print what is stored in the variable.' },
        { wrong: py`10 = score`, right: py`score = 10`, why: "The name always goes on the left, the value on the right." },
      ],
      tryIt: py`
city = "Tashkent"
print("I live in", city)
city = "Samarkand"
print("Now I live in", city)`,
      practice: [
        {
          prompt: "Create a variable `food` that stores `pizza`, then print it.",
          tests: [{ expected: "pizza" }],
          hint: 'food = "pizza" then print(food)',
          solution: py`
food = "pizza"
print(food)`,
        },
        {
          prompt: "Create `lives = 3`, print it, change it to `2`, print it again.",
          tests: [{ expected: out(3, 2) }],
          hint: "Use = twice and print twice.",
          solution: py`
lives = 3
print(lives)
lives = 2
print(lives)`,
        },
        {
          prompt: "Store your favourite number `7` in `fav` and print `My favourite number is 7` using the variable.",
          tests: [{ expected: "My favourite number is 7" }],
          hint: 'print("My favourite number is", fav)',
          solution: py`
fav = 7
print("My favourite number is", fav)`,
        },
      ],
      quiz: [
        { q: "What does `=` do in Python?", options: ["Checks if two things are equal", "Stores a value in a variable", "Adds numbers", "Prints text"], answer: 1, explain: "= is the assignment operator." },
        { q: "What is printed?", code: py`
x = 4
x = 9
print(x)`, options: ["4", "9", "4 9", "13"], answer: 1, explain: "The second assignment replaces 4 with 9." },
      ],
    },
    {
      id: "m2-naming",
      title: "Variable naming rules",
      minutes: 6,
      intro: `Python has rules for variable names:

- Can contain **letters, numbers and underscores** (\`_\`).
- **Cannot start with a number**: \`2name\` is not allowed, \`name2\` is fine.
- **No spaces**: use \`first_name\`, not \`first name\`.
- **Case-sensitive**: \`age\`, \`Age\` and \`AGE\` are three different variables.
- Cannot be a **keyword** — a word Python already uses, like \`if\`, \`for\`, \`class\`, \`True\`.

**Good style:** Python programmers use **snake_case** — lowercase words joined with underscores — and choose names that explain what is stored, like \`total_price\` instead of \`tp\`.`,
      syntax: py`
first_name = "Lina"
total_price = 99.5
player2_score = 40`,
      examples: [
        { title: "Good, descriptive names", code: py`
student_name = "Omar"
number_of_lessons = 12
print(student_name, number_of_lessons)` },
        { title: "Case matters", code: py`
color = "red"
Color = "blue"
print(color)
print(Color)` },
      ],
      realWorld: `Professional code is read far more often than it is written. Clear names like \`days_until_exam\` save teams hours of confusion.`,
      mistakes: [
        { wrong: py`2nd_place = "Kim"`, right: py`second_place = "Kim"`, why: "Names cannot start with a digit." },
        { wrong: py`my score = 5`, right: py`my_score = 5`, why: "Spaces are not allowed. Use underscores." },
      ],
      tryIt: py`
user_name = "Zara"
user_age = 14
print(user_name, "is", user_age)`,
      practice: [
        {
          prompt: "This code has an invalid variable name. Fix it so it prints `Gold`.",
          starter: py`
1st_prize = "Gold"
print(1st_prize)`,
          tests: [{ expected: "Gold" }],
          hint: "Rename it to first_prize everywhere.",
          solution: py`
first_prize = "Gold"
print(first_prize)`,
        },
        {
          prompt: "Fix the name with a space so it prints `blue`.",
          starter: py`
favorite color = "blue"
print(favorite color)`,
          tests: [{ expected: "blue" }],
          hint: "Use favorite_color.",
          solution: py`
favorite_color = "blue"
print(favorite_color)`,
        },
        {
          prompt: "Create a snake_case variable `days_in_week` with value 7 and print it.",
          tests: [{ expected: "7" }],
          hint: "days_in_week = 7",
          solution: py`
days_in_week = 7
print(days_in_week)`,
        },
      ],
      quiz: [
        { q: "Which variable name is valid?", options: ["2players", "player-name", "player_name", "player name"], answer: 2, explain: "Only letters, digits and underscores, not starting with a digit." },
        { q: "Are `score` and `Score` the same variable?", options: ["Yes", "No, names are case-sensitive"], answer: 1, explain: "Python treats uppercase and lowercase letters as different." },
      ],
    },
    {
      id: "m2-strings-numbers",
      title: "Strings, integers and floats",
      minutes: 9,
      intro: `Every value in Python has a **data type**. The three you will use most:

- **String (\`str\`)** — text, always inside quotes: \`"hello"\`, \`'Python'\`, \`"123"\`.
- **Integer (\`int\`)** — whole numbers without a decimal point: \`7\`, \`-3\`, \`2026\`.
- **Float (\`float\`)** — numbers with a decimal point: \`3.14\`, \`0.5\`, \`-2.0\`.

The type decides what you can do. You can do math with numbers. With strings, \`+\` joins text together.

Careful: \`"5"\` (with quotes) is a **string**, not a number! \`"5" + "5"\` gives \`"55"\`, while \`5 + 5\` gives \`10\`.`,
      syntax: py`
text = "Hello"     # str
count = 42         # int
price = 9.99       # float`,
      examples: [
        { title: "Math with ints and floats", code: py`
apples = 3
price = 0.5
print(apples * price)` },
        { title: "Strings vs numbers", code: py`
print(5 + 5)
print("5" + "5")`, note: "10 and 55 — the type changes the meaning of +." },
      ],
      realWorld: `A shop app stores a product name as a string, the quantity in stock as an integer, and the price as a float.`,
      mistakes: [
        { wrong: py`age = "15"
print(age + 1)`, right: py`age = 15
print(age + 1)`, why: '"15" is text, so adding the number 1 causes a TypeError.' },
      ],
      tryIt: py`
product = "Notebook"
quantity = 3
price = 2.5
print(product, quantity * price)`,
      practice: [
        {
          prompt: "Create `city` (a string `Paris`), `population` (int `2100000`) and `area` (float `105.4`). Print each on its own line.",
          tests: [{ expected: out("Paris", 2100000, 105.4) }],
          hint: "Three variables, three prints.",
          solution: py`
city = "Paris"
population = 2100000
area = 105.4
print(city)
print(population)
print(area)`,
        },
        {
          prompt: "A ticket costs `12.5`. Store it in `ticket` and print the cost of 4 tickets.",
          tests: [{ expected: "50.0" }],
          hint: "print(ticket * 4)",
          solution: py`
ticket = 12.5
print(ticket * 4)`,
        },
        {
          prompt: 'Print the result of joining the strings `"3"` and `"4"` with `+`.',
          tests: [{ expected: "34" }],
          hint: 'print("3" + "4")',
          solution: py`print("3" + "4")`,
        },
      ],
      quiz: [
        { q: "What type is `3.0`?", options: ["int", "float", "str", "bool"], answer: 1, explain: "It has a decimal point, so it is a float." },
        { q: "What is printed?", code: py`print("2" + "2")`, options: ["4", "22", "Error", "2 2"], answer: 1, explain: "These are strings, so + joins them." },
      ],
    },
    {
      id: "m2-booleans",
      title: "Booleans",
      minutes: 6,
      intro: `A **boolean** (\`bool\`) has only two possible values: **\`True\`** or **\`False\`**. Think of a light switch: on or off.

Booleans are the answers to yes/no questions. Comparisons produce booleans:

- \`5 > 3\` is \`True\`
- \`2 == 7\` is \`False\`

Note: \`True\` and \`False\` start with a **capital letter** and have **no quotes**.

Later, booleans will decide which code runs (with \`if\`) and how long loops repeat.`,
      syntax: py`
is_logged_in = True
has_paid = False`,
      examples: [
        { title: "Storing yes/no facts", code: py`
is_raining = False
likes_python = True
print(is_raining, likes_python)` },
        { title: "Comparisons give booleans", code: py`
age = 17
print(age >= 18)
print(age < 18)` },
      ],
      realWorld: `Apps use booleans constantly: is the user logged in? Is dark mode on? Has the order shipped?`,
      mistakes: [
        { wrong: py`is_ready = true`, right: py`is_ready = True`, why: "true (lowercase) is not defined in Python. Use True." },
        { wrong: py`is_ready = "True"`, right: py`is_ready = True`, why: 'With quotes it is a string, not a boolean.' },
      ],
      tryIt: py`
has_ticket = True
age = 12
print("Has ticket:", has_ticket)
print("Adult:", age >= 18)`,
      practice: [
        { prompt: "Create `is_student = True` and print it.", tests: [{ expected: "True" }], hint: "No quotes, capital T.", solution: py`
is_student = True
print(is_student)` },
        { prompt: "Print whether `10` is greater than `20` (Python should print the boolean result).", tests: [{ expected: "False" }], hint: "print(10 > 20)", solution: py`print(10 > 20)` },
        { prompt: "Fix the code so it prints `False`.", starter: py`
game_over = false
print(game_over)`, tests: [{ expected: "False" }], hint: "Booleans start with a capital letter.", solution: py`
game_over = False
print(game_over)` },
      ],
      quiz: [
        { q: "Which is a valid boolean value?", options: ["true", "TRUE", "True", '"True"'], answer: 2, explain: "Python booleans are True and False, capitalised, no quotes." },
        { q: "What is printed?", code: py`print(3 == 3)`, options: ["3", "True", "False", "Error"], answer: 1, explain: "3 equals 3, so the result is True." },
      ],
    },
    {
      id: "m2-type",
      title: "Checking data types with type()",
      minutes: 5,
      intro: `Not sure what type a value is? Ask Python with **\`type()\`**.

\`print(type(42))\` shows \`<class 'int'>\`.

The word after \`class\` is the type name: \`int\`, \`float\`, \`str\` or \`bool\`.

This is very useful when something behaves strangely. For example, if \`+\` is joining instead of adding, check the type — you probably have strings instead of numbers.`,
      syntax: py`print(type(value))`,
      examples: [
        { title: "Four basic types", code: py`
print(type("hi"))
print(type(7))
print(type(7.5))
print(type(False))` },
        { title: "Checking a variable", code: py`
answer = "42"
print(type(answer))`, note: "It is a str because of the quotes." },
      ],
      realWorld: `When data comes from a form or a file, it often arrives as text. Programmers use type() while debugging to check what they really have.`,
      mistakes: [
        { wrong: py`type("hi")`, right: py`print(type("hi"))`, why: "In a script, type() on its own shows nothing. Wrap it in print()." },
      ],
      tryIt: py`
mystery = 3.0
print(type(mystery))`,
      practice: [
        { prompt: "Print the type of `100`.", tests: [{ expected: "<class 'int'>" }], hint: "print(type(100))", solution: py`print(type(100))` },
        { prompt: 'Print the type of `"100"`.', tests: [{ expected: "<class 'str'>" }], hint: "Quotes make it a string.", solution: py`print(type("100"))` },
        { prompt: "Create `ok = True` and print its type.", tests: [{ expected: "<class 'bool'>" }], hint: "print(type(ok))", solution: py`
ok = True
print(type(ok))` },
      ],
      quiz: [
        { q: "What does `type(2.5)` return?", options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'number'>"], answer: 1, explain: "2.5 has a decimal point." },
        { q: "What does `type(\"False\")` return?", options: ["<class 'bool'>", "<class 'str'>"], answer: 1, explain: "It is in quotes, so it is a string." },
      ],
    },
    {
      id: "m2-conversion",
      title: "Type conversion",
      minutes: 8,
      intro: `Sometimes you need to change a value from one type to another. This is called **type conversion** (or **casting**).

- \`int(x)\` — converts to a whole number: \`int("25")\` → \`25\`, \`int(9.8)\` → \`9\` (it cuts off the decimals, it does not round).
- \`float(x)\` — converts to a decimal number: \`float("2.5")\` → \`2.5\`, \`float(3)\` → \`3.0\`.
- \`str(x)\` — converts to text: \`str(10)\` → \`"10"\`.
- \`bool(x)\` — \`0\`, \`""\` (empty) become \`False\`; almost everything else becomes \`True\`.

If the conversion makes no sense, Python raises a **ValueError**: \`int("hello")\` fails.`,
      syntax: py`
number = int("42")
text = str(3.5)
decimal = float("7")`,
      examples: [
        { title: "Adding numbers that arrived as text", code: py`
a = "10"
b = "5"
print(int(a) + int(b))` },
        { title: "Joining a number into a sentence", code: py`
age = 20
print("I am " + str(age) + " years old")` },
      ],
      realWorld: `Everything a user types into a website arrives as text. Converting it to a number is the first step before calculating prices, ages or scores.`,
      mistakes: [
        { wrong: py`print("Total: " + 50)`, right: py`print("Total: " + str(50))`, why: "You cannot join a string and an int with +. Convert the number with str() first." },
        { wrong: py`int("3.7")`, right: py`int(float("3.7"))`, why: 'int() cannot read a string with a decimal point. Convert to float first.' },
      ],
      tryIt: py`
price_text = "19.99"
price = float(price_text)
print(price * 2)
print(int(price))`,
      practice: [
        { prompt: 'Convert the strings `"7"` and `"8"` to integers and print their sum.', tests: [{ expected: "15" }], hint: 'print(int("7") + int("8"))', solution: py`print(int("7") + int("8"))` },
        { prompt: "Fix the error so it prints `Level 5`.", starter: py`
level = 5
print("Level " + level)`, tests: [{ expected: "Level 5" }], hint: "Wrap level in str().", solution: py`
level = 5
print("Level " + str(level))` },
        { prompt: "Print `int(9.99)`. Notice it does not round!", tests: [{ expected: "9" }], hint: "print(int(9.99))", solution: py`print(int(9.99))` },
      ],
      quiz: [
        { q: "What is `int(4.9)`?", options: ["5", "4", "4.9", "Error"], answer: 1, explain: "int() removes the decimal part; it does not round." },
        { q: "What happens with `int(\"abc\")`?", options: ["0", "ValueError", "\"abc\"", "None"], answer: 1, explain: "Python cannot turn letters into a number." },
      ],
    },
    {
      id: "m2-multiple-constants",
      title: "Multiple assignment and constants",
      minutes: 6,
      intro: `**Multiple assignment** lets you create several variables in one line:

\`x, y, z = 1, 2, 3\`

You can also give several variables the same value: \`a = b = 0\`.

A neat trick: **swap** two variables with \`a, b = b, a\`.

**Constants** are values that should never change, like the number of days in a week. Python has no special keyword for them; instead programmers write the name in **ALL_CAPS** to say "please do not change this".`,
      syntax: py`
x, y = 10, 20
a = b = 0
MAX_PLAYERS = 4`,
      examples: [
        { title: "Several at once", code: py`
name, age, city = "Mia", 15, "Rome"
print(name, age, city)` },
        { title: "Swapping values", code: py`
left = "cat"
right = "dog"
left, right = right, left
print(left, right)` },
      ],
      realWorld: `Games use constants like \`MAX_LIVES = 3\` or \`GRAVITY = 9.8\`. Putting them in one place makes them easy to tweak later.`,
      mistakes: [
        { wrong: py`a, b = 1, 2, 3`, right: py`a, b, c = 1, 2, 3`, why: "The number of names must match the number of values, otherwise you get a ValueError." },
      ],
      tryIt: py`
WIDTH, HEIGHT = 800, 600
print("Screen:", WIDTH, "x", HEIGHT)`,
      practice: [
        { prompt: "In one line, create `a`, `b`, `c` with values `1`, `2`, `3`. Then print them with one print().", tests: [{ expected: "1 2 3" }], hint: "a, b, c = 1, 2, 3", solution: py`
a, b, c = 1, 2, 3
print(a, b, c)` },
        { prompt: "Swap the two variables so the program prints `second first`.", starter: py`
x = "first"
y = "second"
# swap here
print(x, y)`, tests: [{ expected: "second first" }], hint: "x, y = y, x", solution: py`
x = "first"
y = "second"
x, y = y, x
print(x, y)` },
        { prompt: "Create a constant `HOURS_IN_DAY = 24` and print how many hours are in 7 days.", tests: [{ expected: "168" }], hint: "print(HOURS_IN_DAY * 7)", solution: py`
HOURS_IN_DAY = 24
print(HOURS_IN_DAY * 7)` },
      ],
      quiz: [
        { q: "What is printed?", code: py`
a, b = 3, 8
a, b = b, a
print(a)`, options: ["3", "8", "11", "Error"], answer: 1, explain: "The values are swapped, so a becomes 8." },
        { q: "How do programmers mark a constant in Python?", options: ["const keyword", "ALL_CAPS name", "Starting with $", "Python forbids constants"], answer: 1, explain: "By convention constants use uppercase names." },
      ],
    },
  ],
};
