import type { Module } from "../types";
import { out, py } from "../helpers";

export const m06: Module = {
  id: "m6",
  number: 6,
  title: "Conditional Statements",
  description: "Teach your programs to make decisions with if, elif and else.",
  icon: "git-branch",
  lessons: [
    {
      id: "m6-if",
      title: "What are conditions? The if statement",
      minutes: 8,
      intro: `A **condition** is a question with a yes/no answer — an expression that is \`True\` or \`False\`, like \`age >= 18\`.

An **if statement** runs some code **only when** the condition is True:

\`if temperature > 30:\`
\`    print("It's hot!")\`

Rules to remember:

- The line ends with a **colon** \`:\`.
- The code that belongs to the if is **indented** (4 spaces). This indented group is called a **block**.
- When the condition is False, Python **skips** the block and continues after it.`,
      syntax: py`
if condition:
    # runs only when condition is True
    do_something()`,
      examples: [
        { title: "Only when it is true", code: py`
battery = 15
if battery < 20:
    print("Low battery! Please charge.")
print("Done checking")` },
        { title: "Checking a password", code: py`
password = "open sesame"
if password == "open sesame":
    print("Access granted")` },
      ],
      realWorld: `"If the cart is empty, show a message." "If it is raining, show an umbrella icon." Apps make thousands of decisions like this every second.`,
      mistakes: [
        { wrong: py`if x > 5
    print("big")`, right: py`if x > 5:
    print("big")`, why: "Missing colon → SyntaxError." },
        { wrong: py`if x = 5:`, right: py`if x == 5:`, why: "Use == to compare inside a condition." },
      ],
      tryIt: py`
age = int(input("Age: "))
if age >= 18:
    print("You can vote!")
print("Thanks!")`,
      practice: [
        { prompt: "Read a number. If it is greater than 100, print `Big number`. (Print nothing otherwise.)", tests: [{ input: ["150"], expected: "Big number" }, { input: ["50"], expected: "" }], hint: "if n > 100:", solution: py`
n = int(input())
if n > 100:
    print("Big number")` },
        { prompt: "Read a word. If it equals `python`, print `Correct!`. Always print `Bye` at the end.", tests: [{ input: ["python"], expected: out("Correct!", "Bye") }, { input: ["java"], expected: "Bye" }], hint: "The Bye print must not be indented.", solution: py`
word = input()
if word == "python":
    print("Correct!")
print("Bye")` },
        { prompt: "Read a number. If it is negative, print `Negative`.", tests: [{ input: ["-3"], expected: "Negative" }, { input: ["4"], expected: "" }], hint: "if n < 0:", solution: py`
n = int(input())
if n < 0:
    print("Negative")` },
      ],
      quiz: [
        { q: "What is printed?", code: py`
x = 3
if x > 5:
    print("A")
print("B")`, options: ["A", "B", "A B", "Nothing"], answer: 1, explain: "3 > 5 is False, so only B prints." },
        { q: "What must end an if line?", options: [";", ":", ".", "{"], answer: 1, explain: "A colon starts the block." },
      ],
    },
    {
      id: "m6-else",
      title: "else statements",
      minutes: 6,
      intro: `**else** gives an alternative: code that runs when the if condition is **False**.

\`if age >= 18:\`
\`    print("Adult")\`
\`else:\`
\`    print("Minor")\`

Exactly **one** of the two blocks runs — never both, never neither.

\`else\` has no condition of its own and must line up with its \`if\`.`,
      syntax: py`
if condition:
    ...
else:
    ...`,
      examples: [
        { title: "Even or odd", code: py`
n = 7
if n % 2 == 0:
    print("Even")
else:
    print("Odd")` },
        { title: "Pass or fail", code: py`
score = 42
if score >= 50:
    print("Pass")
else:
    print("Try again")` },
      ],
      realWorld: `"If the payment succeeded, show the receipt; otherwise, show an error." Two-way decisions are the most common decision in software.`,
      mistakes: [
        { wrong: py`else x < 5:`, right: py`else:`, why: "else never has a condition." },
      ],
      tryIt: py`
n = int(input("Number: "))
if n % 2 == 0:
    print(n, "is even")
else:
    print(n, "is odd")`,
      practice: [
        { prompt: "Read a number and print `Even` or `Odd`.", tests: [{ input: ["4"], expected: "Even" }, { input: ["9"], expected: "Odd" }, { input: ["0"], expected: "Even" }], hint: "n % 2 == 0", solution: py`
n = int(input())
if n % 2 == 0:
    print("Even")
else:
    print("Odd")` },
        { prompt: "Read an age. Print `Adult` if 18 or older, otherwise `Minor`.", tests: [{ input: ["18"], expected: "Adult" }, { input: ["12"], expected: "Minor" }], hint: "age >= 18", solution: py`
age = int(input())
if age >= 18:
    print("Adult")
else:
    print("Minor")` },
        { prompt: "Read two numbers (two lines) and print the larger one. If equal, print either.", tests: [{ input: ["3", "8"], expected: "8" }, { input: ["10", "2"], expected: "10" }], hint: "if a > b: print(a) else: print(b)", solution: py`
a = int(input())
b = int(input())
if a > b:
    print(a)
else:
    print(b)` },
      ],
      quiz: [
        { q: "When does the else block run?", options: ["Always", "When the if condition is False", "When the if condition is True", "Never"], answer: 1, explain: "else is the 'otherwise' branch." },
        { q: "How many blocks of an if/else can run at once?", options: ["0", "1", "2", "Any number"], answer: 1, explain: "Exactly one branch runs." },
      ],
    },
    {
      id: "m6-elif",
      title: "elif statements",
      minutes: 8,
      intro: `What if there are **more than two** options? Use **elif** (short for "else if").

Python checks the conditions **from top to bottom** and runs the **first** block whose condition is True. The rest are skipped. If none are True, the \`else\` block runs (if there is one).

Because only the first match runs, **order matters**. Put the most specific conditions first.`,
      syntax: py`
if condition1:
    ...
elif condition2:
    ...
else:
    ...`,
      examples: [
        { title: "Traffic light", code: py`
light = "yellow"
if light == "green":
    print("Go")
elif light == "yellow":
    print("Slow down")
else:
    print("Stop")` },
        { title: "Temperature words", code: py`
t = 12
if t >= 30:
    print("Hot")
elif t >= 20:
    print("Warm")
elif t >= 10:
    print("Cool")
else:
    print("Cold")` },
      ],
      realWorld: `Shipping prices by weight, tax brackets, game difficulty levels and grades are all built with if/elif/else chains.`,
      mistakes: [
        { wrong: py`
if t >= 10:
    print("Cool")
elif t >= 30:
    print("Hot")`, right: py`
if t >= 30:
    print("Hot")
elif t >= 10:
    print("Cool")`, why: "35 is also >= 10, so the first version prints Cool. Check the biggest range first." },
      ],
      tryIt: py`
n = int(input("Number: "))
if n > 0:
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")`,
      practice: [
        { prompt: "Read a number and print `Positive`, `Negative` or `Zero`.", tests: [{ input: ["5"], expected: "Positive" }, { input: ["-2"], expected: "Negative" }, { input: ["0"], expected: "Zero" }], hint: "if / elif / else", solution: py`
n = int(input())
if n > 0:
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")` },
        { prompt: "Read a day number 1–3 and print `Mon`, `Tue` or `Wed`. For anything else print `Unknown`.", tests: [{ input: ["1"], expected: "Mon" }, { input: ["3"], expected: "Wed" }, { input: ["9"], expected: "Unknown" }], hint: "Compare with == 1, == 2, == 3.", solution: py`
d = int(input())
if d == 1:
    print("Mon")
elif d == 2:
    print("Tue")
elif d == 3:
    print("Wed")
else:
    print("Unknown")` },
        { prompt: "Read a speed. Print `Slow` if under 30, `Normal` if under 90, otherwise `Fast`.", tests: [{ input: ["20"], expected: "Slow" }, { input: ["60"], expected: "Normal" }, { input: ["120"], expected: "Fast" }, { input: ["30"], expected: "Normal" }], hint: "if s < 30 ... elif s < 90 ... else", solution: py`
s = int(input())
if s < 30:
    print("Slow")
elif s < 90:
    print("Normal")
else:
    print("Fast")` },
      ],
      quiz: [
        { q: "What is printed?", code: py`
x = 15
if x > 10:
    print("A")
elif x > 5:
    print("B")`, options: ["A", "B", "A and B", "Nothing"], answer: 0, explain: "Only the first True branch runs." },
        { q: "Can you have several elif blocks?", options: ["No, only one", "Yes, as many as you need"], answer: 1, explain: "Chains can have any number of elifs." },
      ],
    },
    {
      id: "m6-nested",
      title: "Nested conditions",
      minutes: 7,
      intro: `You can put an if **inside** another if. This is called **nesting**. The inner if only gets checked when the outer condition is True.

Each level of nesting adds **4 more spaces** of indentation.

Nesting is useful when a second question only makes sense after the first is answered: "Is the user logged in? If yes — are they an admin?"

Tip: deep nesting gets hard to read. Often you can flatten it using \`and\`.`,
      syntax: py`
if outer:
    if inner:
        ...`,
      examples: [
        { title: "Login then role", code: py`
logged_in = True
role = "admin"
if logged_in:
    if role == "admin":
        print("Welcome to the admin panel")
    else:
        print("Welcome, user")
else:
    print("Please log in")` },
        { title: "Same logic using and", code: py`
age = 20
has_ticket = True
if age >= 18 and has_ticket:
    print("Enjoy the concert")` },
      ],
      realWorld: `An ATM first checks your PIN; only if it is correct does it check whether you have enough money.`,
      mistakes: [
        { wrong: py`
if a:
    if b:
    print("both")`, right: py`
if a:
    if b:
        print("both")`, why: "Code inside the inner if needs one more level of indentation." },
      ],
      tryIt: py`
n = int(input("Number: "))
if n > 0:
    if n % 2 == 0:
        print("Positive and even")
    else:
        print("Positive and odd")
else:
    print("Not positive")`,
      practice: [
        { prompt: "Read a number. If it is positive, then print `Even` or `Odd`. If it is not positive, print `Not positive`.", tests: [{ input: ["4"], expected: "Even" }, { input: ["7"], expected: "Odd" }, { input: ["-2"], expected: "Not positive" }], hint: "Outer if n > 0, inner if n % 2 == 0.", solution: py`
n = int(input())
if n > 0:
    if n % 2 == 0:
        print("Even")
    else:
        print("Odd")
else:
    print("Not positive")` },
        { prompt: "Read a username and a password (two lines). If username is `admin`: print `Welcome` when password is `1234`, otherwise `Wrong password`. For any other username print `Unknown user`.", tests: [{ input: ["admin", "1234"], expected: "Welcome" }, { input: ["admin", "0000"], expected: "Wrong password" }, { input: ["bob", "1234"], expected: "Unknown user" }], hint: "Nest the password check inside the username check.", solution: py`
user = input()
pw = input()
if user == "admin":
    if pw == "1234":
        print("Welcome")
    else:
        print("Wrong password")
else:
    print("Unknown user")` },
        { prompt: "Read age and height (two lines). Print `Ride OK` if age >= 10 **and** height >= 140, otherwise `No ride`. Use `and` instead of nesting.", tests: [{ input: ["12", "150"], expected: "Ride OK" }, { input: ["12", "130"], expected: "No ride" }, { input: ["8", "150"], expected: "No ride" }], hint: "if age >= 10 and height >= 140:", solution: py`
age = int(input())
height = int(input())
if age >= 10 and height >= 140:
    print("Ride OK")
else:
    print("No ride")` },
      ],
      quiz: [
        { q: "When is an inner (nested) if checked?", options: ["Always", "Only when the outer condition is True", "Before the outer if", "Never"], answer: 1, explain: "The inner if lives inside the outer block." },
        { q: "What is printed?", code: py`
a, b = True, False
if a:
    if b:
        print("X")
    else:
        print("Y")`, options: ["X", "Y", "Nothing", "Error"], answer: 1, explain: "a is True so we enter; b is False so else runs." },
      ],
    },
    {
      id: "m6-logical-conditions",
      title: "Logical conditions: and, or, not",
      minutes: 7,
      intro: `Conditions become powerful when you combine them:

- \`and\` — **both** must be True: \`age >= 13 and age <= 19\` (teenager)
- \`or\` — **at least one** must be True: \`day == "Sat" or day == "Sun"\`
- \`not\` — reverses: \`not is_banned\`

Python also lets you **chain comparisons**: \`13 <= age <= 19\` means the same as the first example.

The \`in\` operator checks membership: \`day in ["Sat", "Sun"]\` or \`"@" in email\`.`,
      syntax: py`
if 13 <= age <= 19:
    print("Teen")
if letter in "aeiou":
    print("Vowel")`,
      examples: [
        { title: "Weekend checker", code: py`
day = "Sun"
if day == "Sat" or day == "Sun":
    print("Weekend!")
else:
    print("Weekday")` },
        { title: "Simple email check", code: py`
email = "me@site.com"
if "@" in email and "." in email:
    print("Looks valid")` },
      ],
      realWorld: `Sign-up forms validate input with combined conditions: the password must be long enough **and** contain a number, the email must contain "@".`,
      mistakes: [
        { wrong: py`if x == 1 or 2:`, right: py`if x == 1 or x == 2:`, why: "`or 2` is always True. Repeat the full comparison (or use `x in (1, 2)`)." },
      ],
      tryIt: py`
letter = input("A letter: ").lower()
if letter in "aeiou":
    print("Vowel")
else:
    print("Consonant")`,
      practice: [
        { prompt: "Read an age. Print `Teen` if it is between 13 and 19 inclusive, otherwise `Not teen`.", tests: [{ input: ["15"], expected: "Teen" }, { input: ["13"], expected: "Teen" }, { input: ["20"], expected: "Not teen" }], hint: "13 <= age <= 19", solution: py`
age = int(input())
if 13 <= age <= 19:
    print("Teen")
else:
    print("Not teen")` },
        { prompt: "Read a letter. Print `Vowel` if it is one of a, e, i, o, u (lowercase or uppercase), else `Consonant`.", tests: [{ input: ["a"], expected: "Vowel" }, { input: ["E"], expected: "Vowel" }, { input: ["z"], expected: "Consonant" }], hint: 'letter.lower() in "aeiou"', solution: py`
letter = input()
if letter.lower() in "aeiou":
    print("Vowel")
else:
    print("Consonant")` },
        { prompt: "Read a year and print `Leap` or `Not leap`. A leap year is divisible by 4 and not by 100, **or** divisible by 400.", tests: [{ input: ["2024"], expected: "Leap" }, { input: ["1900"], expected: "Not leap" }, { input: ["2000"], expected: "Leap" }, { input: ["2023"], expected: "Not leap" }], hint: "(y % 4 == 0 and y % 100 != 0) or y % 400 == 0", solution: py`
y = int(input())
if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0:
    print("Leap")
else:
    print("Not leap")` },
      ],
      quiz: [
        { q: "What is `not (3 > 1 and 2 > 5)`?", options: ["True", "False"], answer: 0, explain: "3 > 1 and 2 > 5 is False; not False is True." },
        { q: "What does `\"a\" in \"cat\"` return?", options: ["True", "False", "1", "Error"], answer: 0, explain: "in checks whether the text appears inside." },
      ],
    },
    {
      id: "m6-grading",
      title: "Project: a grading system",
      minutes: 12,
      intro: `Let's build a **grading system** that turns a score (0–100) into a letter grade:

- 90 and above → **A**
- 80–89 → **B**
- 70–79 → **C**
- 60–69 → **D**
- below 60 → **F**

We also want to **validate** the input: a score above 100 or below 0 is invalid.

This combines everything from this module: input, conversion, if/elif/else, logical operators and good ordering of conditions.`,
      syntax: py`
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"`,
      examples: [
        { title: "The grading system", code: py`
score = int(input("Score (0-100): "))
if score < 0 or score > 100:
    print("Invalid score")
elif score >= 90:
    print("A")
elif score >= 80:
    print("B")
elif score >= 70:
    print("C")
elif score >= 60:
    print("D")
else:
    print("F")` },
        { title: "Adding a message", code: py`
grade = "B"
if grade in ("A", "B"):
    print("Great work!")
else:
    print("Keep practising!")` },
      ],
      realWorld: `School report systems, driving test results and game rank badges (Bronze/Silver/Gold) all use this exact pattern.`,
      mistakes: [
        { wrong: py`
if score >= 60:
    print("D")
elif score >= 90:
    print("A")`, right: py`
if score >= 90:
    print("A")
elif score >= 60:
    print("D")`, why: "A score of 95 would match >= 60 first and wrongly get a D." },
      ],
      tryIt: py`
score = int(input("Score: "))
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("Below B")`,
      practice: [
        { prompt: "Read a score and print the letter grade (A/B/C/D/F) using the scale above. Print `Invalid` for scores outside 0–100.", tests: [{ input: ["95"], expected: "A" }, { input: ["85"], expected: "B" }, { input: ["70"], expected: "C" }, { input: ["61"], expected: "D" }, { input: ["10"], expected: "F" }, { input: ["101"], expected: "Invalid" }], hint: "Check invalid first, then from highest to lowest.", solution: py`
s = int(input())
if s < 0 or s > 100:
    print("Invalid")
elif s >= 90:
    print("A")
elif s >= 80:
    print("B")
elif s >= 70:
    print("C")
elif s >= 60:
    print("D")
else:
    print("F")` },
        { prompt: "Read a score and print `Pass` (>= 50) or `Fail`. Also print `Perfect!` on a second line if the score is exactly 100.", tests: [{ input: ["100"], expected: out("Pass", "Perfect!") }, { input: ["60"], expected: "Pass" }, { input: ["20"], expected: "Fail" }], hint: "Use a separate if for the perfect check.", solution: py`
s = int(input())
if s >= 50:
    print("Pass")
else:
    print("Fail")
if s == 100:
    print("Perfect!")` },
        { prompt: "Read three test scores (three lines), compute the average, and print `Honours` if the average is at least 85, otherwise `Regular`.", tests: [{ input: ["90", "85", "80"], expected: "Honours" }, { input: ["70", "80", "90"], expected: "Regular" }], hint: "avg = (a + b + c) / 3", solution: py`
a = int(input())
b = int(input())
c = int(input())
avg = (a + b + c) / 3
if avg >= 85:
    print("Honours")
else:
    print("Regular")` },
      ],
      quiz: [
        { q: "With the scale above, what grade is 80?", options: ["A", "B", "C"], answer: 1, explain: "80 is >= 80 but < 90." },
        { q: "Why do we check the highest grade first?", options: ["It is faster", "Because elif stops at the first True condition", "Python requires it", "It does not matter"], answer: 1, explain: "Later, wider ranges would otherwise catch high scores." },
      ],
    },
  ],
};
