import type { Module } from "../types";
import { out, py } from "../helpers";

export const m07: Module = {
  id: "m7",
  number: 7,
  title: "Loops",
  description: "Repeat actions with while and for loops, range(), break and continue.",
  icon: "repeat",
  lessons: [
    {
      id: "m7-while",
      title: "What are loops? while loops",
      minutes: 8,
      intro: `A **loop** repeats code. Instead of writing \`print("Hi")\` 100 times, you write it once inside a loop.

A **while loop** repeats **as long as** its condition is True:

\`count = 1\`
\`while count <= 3:\`
\`    print(count)\`
\`    count += 1\`

Each repetition is called an **iteration**. Before every iteration Python checks the condition again. When it becomes False, the loop ends and the program continues after it.

**Important:** something inside the loop must eventually make the condition False — here, \`count += 1\`. Otherwise the loop never ends.`,
      syntax: py`
while condition:
    # repeated code`,
      examples: [
        { title: "Counting up", code: py`
n = 1
while n <= 5:
    print(n)
    n += 1` },
        { title: "Countdown", code: py`
seconds = 3
while seconds > 0:
    print(seconds)
    seconds -= 1
print("Liftoff!")` },
      ],
      realWorld: `Games run a "game loop" while the player is alive. A chat app keeps waiting for messages while it is open.`,
      mistakes: [
        { wrong: py`
i = 0
while i < 3:
    print(i)`, right: py`
i = 0
while i < 3:
    print(i)
    i += 1`, why: "Forgetting to update i creates an infinite loop." },
      ],
      tryIt: py`
total = 0
n = 1
while n <= 10:
    total += n
    n += 1
print("Sum of 1..10 =", total)`,
      practice: [
        { prompt: "Use a while loop to print the numbers 1 to 5, each on its own line.", tests: [{ expected: out(1, 2, 3, 4, 5) }], hint: "Start at 1, loop while n <= 5, add 1 each time.", solution: py`
n = 1
while n <= 5:
    print(n)
    n += 1` },
        { prompt: "Read a number n and print a countdown from n to 1, then `Go!`.", tests: [{ input: ["3"], expected: out(3, 2, 1, "Go!") }, { input: ["1"], expected: out(1, "Go!") }], hint: "while n > 0: print(n); n -= 1", solution: py`
n = int(input())
while n > 0:
    print(n)
    n -= 1
print("Go!")` },
        { prompt: "Read n and print the sum of all numbers from 1 to n using a while loop.", tests: [{ input: ["10"], expected: "55" }, { input: ["3"], expected: "6" }], hint: "Keep a total variable and add i each iteration.", solution: py`
n = int(input())
total = 0
i = 1
while i <= n:
    total += i
    i += 1
print(total)` },
      ],
      quiz: [
        { q: "How many times does this print?", code: py`
i = 0
while i < 4:
    print("hi")
    i += 1`, options: ["3", "4", "5", "Forever"], answer: 1, explain: "i takes values 0, 1, 2, 3." },
        { q: "When does a while loop stop?", options: ["After 10 runs", "When its condition becomes False", "When it prints something", "Never"], answer: 1, explain: "The condition is checked before every iteration." },
      ],
    },
    {
      id: "m7-for-range",
      title: "for loops and range()",
      minutes: 9,
      intro: `A **for loop** repeats once for **each item** in a sequence. It is perfect when you know how many times to repeat.

**\`range()\`** produces a sequence of numbers:

- \`range(5)\` → 0, 1, 2, 3, 4 (starts at 0, stops **before** 5)
- \`range(1, 6)\` → 1, 2, 3, 4, 5
- \`range(0, 10, 2)\` → 0, 2, 4, 6, 8 (step of 2)
- \`range(5, 0, -1)\` → 5, 4, 3, 2, 1 (counting down)

In \`for i in range(5):\`, the variable \`i\` takes each value in turn. You do not need to update it yourself — the for loop does it.`,
      syntax: py`
for i in range(start, stop, step):
    ...`,
      examples: [
        { title: "Repeat 3 times", code: py`
for i in range(3):
    print("Hip hip hooray!")` },
        { title: "Multiplication table", code: py`
n = 7
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")` },
      ],
      realWorld: `Sending a notification to each user, processing each photo in an album, or drawing each row of a table — all for loops.`,
      mistakes: [
        { wrong: py`for i in range(1, 10):  # wants 1..10`, right: py`for i in range(1, 11):`, why: "The stop value is not included. To include 10, stop at 11." },
      ],
      tryIt: py`
for i in range(10, 0, -2):
    print(i)`,
      practice: [
        { prompt: "Print the numbers 0 to 4 using `for` and `range`.", tests: [{ expected: out(0, 1, 2, 3, 4) }], hint: "range(5)", solution: py`
for i in range(5):
    print(i)` },
        { prompt: "Read n and print the multiplication table of n from 1 to 5 in the format `n x i = result`.", tests: [{ input: ["3"], expected: out("3 x 1 = 3", "3 x 2 = 6", "3 x 3 = 9", "3 x 4 = 12", "3 x 5 = 15") }], hint: "for i in range(1, 6):", solution: py`
n = int(input())
for i in range(1, 6):
    print(f"{n} x {i} = {n * i}")` },
        { prompt: "Print the even numbers from 2 to 10 using range with a step.", tests: [{ expected: out(2, 4, 6, 8, 10) }], hint: "range(2, 11, 2)", solution: py`
for i in range(2, 11, 2):
    print(i)` },
      ],
      quiz: [
        { q: "What numbers does `range(2, 6)` produce?", options: ["2,3,4,5,6", "2,3,4,5", "3,4,5,6", "0..6"], answer: 1, explain: "Starts at 2, stops before 6." },
        { q: "How many times does `for i in range(10):` repeat?", options: ["9", "10", "11"], answer: 1, explain: "0 through 9 is ten values." },
      ],
    },
    {
      id: "m7-break-continue",
      title: "break and continue",
      minutes: 7,
      intro: `Two keywords control loops from the inside:

- **\`break\`** — stops the loop **immediately**. The program continues after the loop.
- **\`continue\`** — skips the **rest of this iteration** and jumps to the next one.

Use \`break\` when you have found what you were looking for. Use \`continue\` to skip items you do not care about.

A common pattern is \`while True:\` with a \`break\` inside — a loop that runs until some condition inside tells it to stop.`,
      syntax: py`
for x in items:
    if skip_it:
        continue
    if done:
        break`,
      examples: [
        { title: "Stop at the first multiple of 7", code: py`
for n in range(1, 100):
    if n % 7 == 0:
        print("Found:", n)
        break` },
        { title: "Skip odd numbers", code: py`
for n in range(1, 8):
    if n % 2 == 1:
        continue
    print(n)` },
      ],
      realWorld: `A search stops (break) when it finds the result. A spam filter skips (continue) messages from blocked users.`,
      mistakes: [
        { wrong: py`
i = 0
while i < 5:
    if i == 2:
        continue
    print(i)
    i += 1`, right: py`
i = 0
while i < 5:
    i += 1
    if i == 3:
        continue
    print(i)`, why: "If continue jumps over the i += 1, the loop gets stuck forever." },
      ],
      tryIt: py`
while True:
    word = input("Type a word (or quit): ")
    if word == "quit":
        break
    print("You typed", word)`,
      practice: [
        { prompt: "Print numbers 1 to 10 but stop the loop (using break) when you reach 6. Output: 1..5.", tests: [{ expected: out(1, 2, 3, 4, 5) }], hint: "if n == 6: break — before printing.", solution: py`
for n in range(1, 11):
    if n == 6:
        break
    print(n)` },
        { prompt: "Print numbers 1 to 10 but skip multiples of 3 using continue.", tests: [{ expected: out(1, 2, 4, 5, 7, 8, 10) }], hint: "if n % 3 == 0: continue", solution: py`
for n in range(1, 11):
    if n % 3 == 0:
        continue
    print(n)` },
        { prompt: "Keep reading words until the word `stop`. Then print how many words were read before it.", tests: [{ input: ["a", "b", "c", "stop"], expected: "3" }, { input: ["stop"], expected: "0" }], hint: "while True with a counter and break.", solution: py`
count = 0
while True:
    w = input()
    if w == "stop":
        break
    count += 1
print(count)` },
      ],
      quiz: [
        { q: "What does `continue` do?", options: ["Ends the loop", "Skips to the next iteration", "Pauses for a second", "Restarts the program"], answer: 1, explain: "continue jumps to the next iteration." },
        { q: "What is printed?", code: py`
for i in range(5):
    if i == 3:
        break
    print(i)`, options: ["0 1 2", "0 1 2 3", "3 4", "0 1 2 4"], answer: 0, explain: "break stops before printing 3." },
      ],
    },
    {
      id: "m7-nested",
      title: "Nested loops",
      minutes: 7,
      intro: `A loop inside another loop is a **nested loop**. For **each** iteration of the outer loop, the inner loop runs **completely**.

If the outer loop runs 3 times and the inner loop runs 4 times, the inner code runs 3 × 4 = **12** times.

Nested loops are great for grids, tables and patterns: rows (outer) and columns (inner).

Tip: \`print(..., end="")\` keeps output on the same line, and an empty \`print()\` moves to the next line.`,
      syntax: py`
for row in range(3):
    for col in range(4):
        ...`,
      examples: [
        { title: "A star rectangle", code: py`
for row in range(3):
    for col in range(5):
        print("*", end="")
    print()` },
        { title: "A triangle", code: py`
for i in range(1, 5):
    print("#" * i)` },
      ],
      realWorld: `Images are grids of pixels, spreadsheets are grids of cells, and board games are grids of squares — all processed with nested loops.`,
      mistakes: [
        { wrong: py`
for i in range(3):
    for i in range(3):
        print(i)`, right: py`
for row in range(3):
    for col in range(3):
        print(row, col)`, why: "Using the same variable name for both loops causes confusion. Use different names." },
      ],
      tryIt: py`
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end="\t")
    print()`,
      practice: [
        { prompt: "Print a 3-row by 4-column rectangle of `#` characters.", tests: [{ expected: out("####", "####", "####") }], hint: 'Inner loop: print("#", end=""). After it: print().', solution: py`
for r in range(3):
    for c in range(4):
        print("#", end="")
    print()` },
        { prompt: "Read n and print a right triangle of `*` with n rows (row i has i stars).", tests: [{ input: ["3"], expected: out("*", "**", "***") }, { input: ["1"], expected: "*" }], hint: 'for i in range(1, n + 1): print("*" * i)', solution: py`
n = int(input())
for i in range(1, n + 1):
    print("*" * i)` },
        { prompt: "Print all pairs `i j` for i in 1..2 and j in 1..3, one pair per line.", tests: [{ expected: out("1 1", "1 2", "1 3", "2 1", "2 2", "2 3") }], hint: "Two nested for loops, print(i, j).", solution: py`
for i in range(1, 3):
    for j in range(1, 4):
        print(i, j)` },
      ],
      quiz: [
        { q: "How many times is 'x' printed?", code: py`
for a in range(2):
    for b in range(5):
        print("x")`, options: ["7", "10", "5", "2"], answer: 1, explain: "2 × 5 = 10." },
        { q: "In a grid, the outer loop usually goes over…", options: ["Columns", "Rows", "Pixels", "Nothing"], answer: 1, explain: "Outer = rows, inner = columns, by convention." },
      ],
    },
    {
      id: "m7-loop-strings-lists",
      title: "Looping through strings and lists",
      minutes: 8,
      intro: `A for loop can walk through **any sequence**, not just range:

- Over a **string**: each iteration gives one **character**.
- Over a **list**: each iteration gives one **item**.

\`for letter in "hi":\` → \`"h"\`, then \`"i"\`.

\`for fruit in ["apple", "kiwi"]:\` → \`"apple"\`, then \`"kiwi"\`.

This is the most "Pythonic" way to loop: you get the items directly, no index needed. If you do need the position too, use \`enumerate()\` (covered in Intermediate Python).`,
      syntax: py`
for item in my_list:
    print(item)`,
      examples: [
        { title: "Counting vowels", code: py`
word = "education"
vowels = 0
for ch in word:
    if ch in "aeiou":
        vowels += 1
print(vowels)` },
        { title: "Shopping list", code: py`
items = ["milk", "bread", "eggs"]
for item in items:
    print("- " + item)` },
      ],
      realWorld: `Checking every character of a password for digits, or every product in a cart to calculate the total.`,
      mistakes: [
        { wrong: py`
nums = [1, 2, 3]
for n in range(nums):
    print(n)`, right: py`
nums = [1, 2, 3]
for n in nums:
    print(n)`, why: "range() needs a number. To loop over a list, loop over it directly." },
      ],
      tryIt: py`
prices = [3.5, 2.0, 7.25]
total = 0
for p in prices:
    total += p
print("Total:", total)`,
      practice: [
        { prompt: "Read a word and print each character on its own line.", tests: [{ input: ["cat"], expected: out("c", "a", "t") }], hint: "for ch in word: print(ch)", solution: py`
word = input()
for ch in word:
    print(ch)` },
        { prompt: "Given `nums = [4, 8, 15, 16, 23, 42]`, print their total using a for loop.", tests: [{ expected: "108" }], hint: "total += n inside the loop.", solution: py`
nums = [4, 8, 15, 16, 23, 42]
total = 0
for n in nums:
    total += n
print(total)` },
        { prompt: "Read a sentence and print how many times the letter `a` appears (lowercase only).", tests: [{ input: ["banana bread"], expected: "4" }, { input: ["hello"], expected: "0" }], hint: 'if ch == "a": count += 1', solution: py`
s = input()
count = 0
for ch in s:
    if ch == "a":
        count += 1
print(count)` },
      ],
      quiz: [
        { q: "What is `ch` on the 2nd iteration of `for ch in \"dog\":`?", options: ["d", "o", "g", "1"], answer: 1, explain: "Characters come one at a time in order." },
        { q: "What is printed?", code: py`
for x in [10, 20]:
    print(x + 1)`, options: ["10 20", "11 21", "1 2", "Error"], answer: 1, explain: "Each item is used directly." },
      ],
    },
    {
      id: "m7-infinite-mistakes",
      title: "Infinite loops and common loop mistakes",
      minutes: 7,
      intro: `An **infinite loop** never stops because its condition never becomes False. Your program freezes (in PyNest the editor stops it after a few seconds and shows a warning).

Common causes and fixes:

- **Forgot to update the variable** in a while loop → add \`i += 1\`.
- **Updating in the wrong direction** (\`i -= 1\` when counting up).
- **\`while True:\` with no reachable \`break\`.**

Other common loop mistakes:

- **Off-by-one errors** — \`range(1, 10)\` stops at 9.
- **Wrong indentation** — code meant to run once ends up inside the loop (or the reverse).
- **Resetting a total inside the loop** — \`total = 0\` must come **before** the loop.`,
      syntax: py`
i = 0
while i < 5:
    i += 1   # the update that ends the loop`,
      examples: [
        { title: "Total set up correctly", code: py`
total = 0            # before the loop
for n in [5, 10, 15]:
    total += n
print(total)         # after the loop` },
        { title: "Intentional while True with break", code: py`
attempts = 0
while True:
    attempts += 1
    if attempts == 3:
        break
print("Stopped after", attempts)` },
      ],
      realWorld: `Real servers have crashed because of infinite loops. Developers add safety limits (like max attempts) to protect against them.`,
      mistakes: [
        { wrong: py`
for n in [1, 2, 3]:
    total = 0
    total += n
print(total)`, right: py`
total = 0
for n in [1, 2, 3]:
    total += n
print(total)`, why: "Resetting total inside the loop throws away the previous sum." },
      ],
      tryIt: py`
i = 10
while i > 0:
    print(i)
    i -= 3`,
      practice: [
        { prompt: "This loop never ends. Fix it so it prints 1, 2, 3.", starter: py`
i = 1
while i <= 3:
    print(i)`, tests: [{ expected: out(1, 2, 3) }], hint: "Add i += 1 inside the loop.", solution: py`
i = 1
while i <= 3:
    print(i)
    i += 1` },
        { prompt: "This should print the total `60` once, but it is wrong. Fix it.", starter: py`
for n in [10, 20, 30]:
    total = 0
    total += n
    print(total)`, tests: [{ expected: "60" }], hint: "Move total = 0 before the loop and the print after it.", solution: py`
total = 0
for n in [10, 20, 30]:
    total += n
print(total)` },
        { prompt: "Fix the off-by-one error so it prints 1 to 10.", starter: py`
for i in range(1, 10):
    print(i)`, tests: [{ expected: out(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) }], hint: "The stop value is excluded.", solution: py`
for i in range(1, 11):
    print(i)` },
      ],
      quiz: [
        { q: "Why is this an infinite loop?", code: py`
x = 5
while x > 0:
    x += 1`, options: ["x never changes", "x moves away from the stop condition", "while loops are always infinite", "It is not infinite"], answer: 1, explain: "x grows, so x > 0 stays True forever." },
        { q: "Where should `total = 0` go when summing in a loop?", options: ["Inside the loop", "Before the loop", "After the loop"], answer: 1, explain: "Initialise once, before looping." },
      ],
    },
  ],
};
