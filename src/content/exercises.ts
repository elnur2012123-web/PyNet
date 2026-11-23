import type { Exercise } from "./types";
import { out, py } from "./helpers";

export const EXERCISES: Exercise[] = [
  // ------------------------------------------------------------------ VERY EASY
  {
    id: "ve-hello-world", title: "Print Hello World", difficulty: "very-easy", topic: "Basics",
    description: "Write a program that prints exactly `Hello, World!`.",
    exampleOutput: "Hello, World!", starter: "# Your code here\n",
    tests: [{ expected: "Hello, World!" }],
    hints: ["Use the print() function.", "Text must be inside quotes, and capitals and punctuation must match exactly."],
    solution: py`print("Hello, World!")`,
    explanation: "print() displays whatever you give it. Quotes mark the text as a string.",
  },
  {
    id: "ve-create-variable", title: "Create a variable", difficulty: "very-easy", topic: "Variables",
    description: "Create a variable called `language` holding the text `Python`, then print the variable.",
    exampleOutput: "Python", starter: "",
    tests: [{ expected: "Python" }],
    hints: ["Use = to store a value: name = value", "Print the variable without quotes."],
    solution: py`
language = "Python"
print(language)`,
    explanation: "The = sign stores the string in the variable; print(language) shows what is inside it.",
  },
  {
    id: "ve-add-two", title: "Add two numbers", difficulty: "very-easy", topic: "Input & operators",
    description: "Read two whole numbers, each on its own line, and print their sum.",
    exampleInput: "3\n4", exampleOutput: "7", starter: "a = int(input())\n",
    tests: [{ input: ["3", "4"], expected: "7" }, { input: ["-10", "25"], expected: "15" }, { input: ["0", "0"], expected: "0", hidden: true }],
    hints: ["input() returns text — convert it with int().", "Read the second number the same way, then print(a + b)."],
    solution: py`
a = int(input())
b = int(input())
print(a + b)`,
    explanation: "Each input() reads one line. int() turns the text into a number so + adds instead of joining.",
  },
  {
    id: "ve-display-name", title: "Display your name", difficulty: "very-easy", topic: "Input & strings",
    description: "Read a name and print `My name is <name>`.",
    exampleInput: "Ada", exampleOutput: "My name is Ada", starter: "",
    tests: [{ input: ["Ada"], expected: "My name is Ada" }, { input: ["Grace Hopper"], expected: "My name is Grace Hopper" }],
    hints: ["Store input() in a variable.", 'Use an f-string: f"My name is {name}"'],
    solution: py`
name = input()
print(f"My name is {name}")`,
    explanation: "f-strings insert the variable's value where the braces are.",
  },
  {
    id: "ve-type-of", title: "Find the type of a variable", difficulty: "very-easy", topic: "Data types",
    description: "Given `x = 3.5`, print the name of its type (just `float`, not `<class 'float'>`).",
    exampleOutput: "float", starter: "x = 3.5\n",
    tests: [{ expected: "float" }],
    hints: ["type(x) gives the class.", "The class has a __name__ attribute."],
    solution: py`
x = 3.5
print(type(x).__name__)`,
    explanation: "type(x) returns the class float; .__name__ gives its name as a string.",
  },
  // ------------------------------------------------------------------ EASY
  {
    id: "e-positive", title: "Is the number positive?", difficulty: "easy", topic: "Conditions",
    description: "Read an integer. Print `Positive`, `Negative` or `Zero`.",
    exampleInput: "-4", exampleOutput: "Negative", starter: "n = int(input())\n",
    tests: [{ input: ["5"], expected: "Positive" }, { input: ["-4"], expected: "Negative" }, { input: ["0"], expected: "Zero" }],
    hints: ["Use if / elif / else.", "Check n > 0 first, then n < 0."],
    solution: py`
n = int(input())
if n > 0:
    print("Positive")
elif n < 0:
    print("Negative")
else:
    print("Zero")`,
    explanation: "Three cases need if, elif and else. Zero is neither positive nor negative, so it goes in else.",
  },
  {
    id: "e-largest-two", title: "Largest of two numbers", difficulty: "easy", topic: "Conditions",
    description: "Read two integers (two lines) and print the larger. If they are equal, print `Equal`.",
    exampleInput: "8\n3", exampleOutput: "8", starter: "",
    tests: [{ input: ["8", "3"], expected: "8" }, { input: ["2", "9"], expected: "9" }, { input: ["4", "4"], expected: "Equal" }],
    hints: ["Compare with > and ==.", "Handle the equal case explicitly."],
    solution: py`
a = int(input())
b = int(input())
if a == b:
    print("Equal")
elif a > b:
    print(a)
else:
    print(b)`,
    explanation: "Checking equality first keeps the other branches simple.",
  },
  {
    id: "e-rectangle-area", title: "Area of a rectangle", difficulty: "easy", topic: "Operators",
    description: "Read width and height (decimals allowed, two lines). Print the area rounded to 2 decimals.",
    exampleInput: "2.5\n4", exampleOutput: "10.00", starter: "",
    tests: [{ input: ["2.5", "4"], expected: "10.00" }, { input: ["3", "3.333"], expected: "10.00" }, { input: ["1.25", "1.5"], expected: "1.88" }],
    constraints: ["0 < width, height ≤ 1000"],
    hints: ["Use float(input()).", 'Format with f"{area:.2f}".'],
    solution: py`
w = float(input())
h = float(input())
print(f"{w * h:.2f}")`,
    explanation: "Area = width × height. The :.2f format shows exactly two decimals.",
  },
  {
    id: "e-count-chars", title: "Count characters", difficulty: "easy", topic: "Strings",
    description: "Read a line of text and print how many characters it has **not counting spaces**.",
    exampleInput: "hi there", exampleOutput: "7", starter: "",
    tests: [{ input: ["hi there"], expected: "7" }, { input: ["Python"], expected: "6" }, { input: ["a b c"], expected: "3" }],
    hints: ["len() counts characters.", 'Remove spaces first with .replace(" ", "").'],
    solution: py`
text = input()
print(len(text.replace(" ", "")))`,
    explanation: "replace removes every space, then len counts what is left.",
  },
  {
    id: "e-multiplication-table", title: "Multiplication table", difficulty: "easy", topic: "Loops",
    description: "Read n and print its multiplication table from 1 to 10 in the format `n x i = result`.",
    exampleInput: "3", exampleOutput: "3 x 1 = 3\n3 x 2 = 6\n...\n3 x 10 = 30", starter: "n = int(input())\n",
    tests: [{ input: ["3"], expected: Array.from({ length: 10 }, (_, i) => `3 x ${i + 1} = ${3 * (i + 1)}`).join("\n") }, { input: ["7"], expected: Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join("\n"), hidden: true }],
    hints: ["for i in range(1, 11):", 'print(f"{n} x {i} = {n * i}")'],
    solution: py`
n = int(input())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")`,
    explanation: "range(1, 11) produces 1 to 10; each iteration prints one line of the table.",
  },
  {
    id: "e-even-numbers", title: "Even numbers up to n", difficulty: "easy", topic: "Loops",
    description: "Read n and print all even numbers from 2 to n (inclusive) on one line separated by spaces.",
    exampleInput: "9", exampleOutput: "2 4 6 8", starter: "",
    tests: [{ input: ["9"], expected: "2 4 6 8" }, { input: ["2"], expected: "2" }, { input: ["12"], expected: "2 4 6 8 10 12" }],
    hints: ["range(2, n + 1, 2)", "print(*range(...)) prints items separated by spaces."],
    solution: py`
n = int(input())
print(*range(2, n + 1, 2))`,
    explanation: "A step of 2 starting from 2 gives only even numbers; * unpacks them into print.",
  },
  {
    id: "e-sum-list", title: "Sum of numbers", difficulty: "easy", topic: "Lists",
    description: "Read numbers on one line separated by spaces and print their sum and average (1 decimal).",
    exampleInput: "4 8 6", exampleOutput: "18\n6.0", starter: "",
    tests: [{ input: ["4 8 6"], expected: out(18, "6.0") }, { input: ["10"], expected: out(10, "10.0") }, { input: ["1 2"], expected: out(3, "1.5") }],
    hints: ["list(map(int, input().split()))", "sum(nums) / len(nums)"],
    solution: py`
nums = list(map(int, input().split()))
print(sum(nums))
print(f"{sum(nums) / len(nums):.1f}")`,
    explanation: "split breaks the line into pieces, map(int, ...) converts each, sum and len do the rest.",
  },
  // ------------------------------------------------------------------ MEDIUM
  {
    id: "m-reverse-string", title: "Reverse a string", difficulty: "medium", topic: "Strings",
    description: "Read a line of text and print it reversed. Then on the next line print `Palindrome` if the text (ignoring case and spaces) reads the same backwards, otherwise `Not palindrome`.",
    exampleInput: "Never odd or even", exampleOutput: "neve ro ddo reveN\nPalindrome", starter: "",
    tests: [{ input: ["Never odd or even"], expected: out("neve ro ddo reveN", "Palindrome") }, { input: ["Python"], expected: out("nohtyP", "Not palindrome") }, { input: ["Abba"], expected: out("abbA", "Palindrome") }],
    hints: ["text[::-1] reverses a string.", 'For the check, compare clean == clean[::-1] where clean = text.replace(" ", "").lower().'],
    solution: py`
text = input()
print(text[::-1])
clean = text.replace(" ", "").lower()
print("Palindrome" if clean == clean[::-1] else "Not palindrome")`,
    explanation: "Slicing with step -1 walks the string backwards. Normalising case and spaces makes the palindrome check fair.",
  },
  {
    id: "m-duplicates", title: "Find duplicate elements", difficulty: "medium", topic: "Lists & sets",
    description: "Read numbers on one line. Print the values that appear more than once, sorted ascending, separated by spaces. If none, print `None`.",
    exampleInput: "4 1 4 2 1 9", exampleOutput: "1 4", starter: "",
    tests: [{ input: ["4 1 4 2 1 9"], expected: "1 4" }, { input: ["1 2 3"], expected: "None" }, { input: ["7 7 7"], expected: "7" }],
    hints: ["Track numbers you've seen in a set.", "When you see a number again, add it to a duplicates set."],
    solution: py`
nums = input().split()
seen, dups = set(), set()
for n in map(int, nums):
    if n in seen:
        dups.add(n)
    seen.add(n)
print(" ".join(map(str, sorted(dups))) if dups else "None")`,
    explanation: "Sets give fast membership checks. A second sighting means a duplicate; sets also prevent listing it twice.",
  },
  {
    id: "m-word-frequency", title: "Count word frequency", difficulty: "medium", topic: "Dictionaries",
    description: "Read a sentence. Count each word (case-insensitive) and print `word: count` lines sorted by count (highest first), then alphabetically for ties.",
    exampleInput: "the cat and the hat", exampleOutput: "the: 2\nand: 1\ncat: 1\nhat: 1", starter: "",
    tests: [{ input: ["the cat and the hat"], expected: out("the: 2", "and: 1", "cat: 1", "hat: 1") }, { input: ["Go go GO stop"], expected: out("go: 3", "stop: 1") }],
    hints: ["counts[w] = counts.get(w, 0) + 1", "sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))"],
    solution: py`
counts = {}
for w in input().lower().split():
    counts[w] = counts.get(w, 0) + 1
for word, c in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(f"{word}: {c}")`,
    explanation: "A dictionary maps each word to its count. Sorting by (-count, word) gives highest counts first and alphabetical ties.",
  },
  {
    id: "m-second-largest", title: "Second-largest number", difficulty: "medium", topic: "Lists",
    description: "Read numbers on one line and print the second-largest **distinct** value. If it does not exist, print `None`.",
    exampleInput: "5 9 2 9 7", exampleOutput: "7", starter: "",
    tests: [{ input: ["5 9 2 9 7"], expected: "7" }, { input: ["4 4 4"], expected: "None" }, { input: ["-1 -5"], expected: "-5" }],
    hints: ["Remove duplicates with set().", "Sort the unique values and take [-2]."],
    solution: py`
nums = sorted(set(map(int, input().split())))
print(nums[-2] if len(nums) >= 2 else "None")`,
    explanation: "Duplicates of the maximum would otherwise be counted as 'second largest'; a set removes them.",
  },
  {
    id: "m-calculator", title: "Build a simple calculator", difficulty: "medium", topic: "Functions",
    description: "Read an expression like `12 * 4` (number, operator, number separated by spaces) and print the result. Support `+ - * /`. Print integers without `.0`. For division by zero print `Error`.",
    exampleInput: "12 * 4", exampleOutput: "48", starter: "",
    tests: [{ input: ["12 * 4"], expected: "48" }, { input: ["7 / 2"], expected: "3.5" }, { input: ["9 / 3"], expected: "3" }, { input: ["5 / 0"], expected: "Error" }, { input: ["2.5 + 2.5"], expected: "5" }],
    hints: ["a, op, b = input().split()", "If result == int(result), print int(result)."],
    solution: py`
a, op, b = input().split()
a, b = float(a), float(b)
if op == "/" and b == 0:
    print("Error")
else:
    result = {"+": a + b, "-": a - b, "*": a * b}.get(op) if op != "/" else a / b
    print(int(result) if result == int(result) else result)`,
    explanation: "Converting to float supports decimals; the final check prints whole numbers neatly.",
  },
  {
    id: "m-fizzbuzz", title: "FizzBuzz", difficulty: "medium", topic: "Loops",
    description: "Read n. For each number 1..n print `Fizz` if divisible by 3, `Buzz` if by 5, `FizzBuzz` if by both, else the number.",
    exampleInput: "5", exampleOutput: "1\n2\nFizz\n4\nBuzz", starter: "",
    tests: [{ input: ["5"], expected: out(1, 2, "Fizz", 4, "Buzz") }, { input: ["15"], expected: out(1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz") }],
    hints: ["Check divisible by 15 (both) first.", "Use % to test divisibility."],
    solution: py`
n = int(input())
for i in range(1, n + 1):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
    explanation: "Order matters: test the most specific case (15) first, or it would print Fizz instead of FizzBuzz.",
  },
  {
    id: "m-vowel-counter", title: "Vowel counter", difficulty: "medium", topic: "Strings & dicts",
    description: "Read a line and print how many times each vowel (a, e, i, o, u) appears, case-insensitive, as `a:X e:X i:X o:X u:X`.",
    exampleInput: "Programming is fun", exampleOutput: "a:1 e:0 i:2 o:1 u:1", starter: "",
    tests: [{ input: ["Programming is fun"], expected: "a:1 e:0 i:2 o:1 u:1" }, { input: ["AEIOU aeiou"], expected: "a:2 e:2 i:2 o:2 u:2" }],
    hints: ["text.lower().count(v)", '" ".join(...)'],
    solution: py`
text = input().lower()
print(" ".join(f"{v}:{text.count(v)}" for v in "aeiou"))`,
    explanation: "str.count counts occurrences; a generator inside join builds the line.",
  },
  // ------------------------------------------------------------------ HARD
  {
    id: "h-anagrams", title: "Group anagrams", difficulty: "hard", topic: "Dictionaries",
    description: "Read words on one line. Group words that are anagrams of each other. Print each group on its own line: words sorted alphabetically and joined by spaces; groups ordered by their first word.",
    exampleInput: "listen silent enlist google tinsel cat act", exampleOutput: "act cat\nenlist listen silent tinsel\ngoogle", starter: "",
    tests: [{ input: ["listen silent enlist google tinsel cat act"], expected: out("act cat", "enlist listen silent tinsel", "google") }, { input: ["abc"], expected: "abc" }],
    hints: ["Two words are anagrams if sorted(word) is equal.", "Use \"\".join(sorted(w)) as a dictionary key."],
    solution: py`
groups = {}
for w in input().split():
    key = "".join(sorted(w))
    groups.setdefault(key, []).append(w)
for g in sorted((sorted(v) for v in groups.values()), key=lambda g: g[0]):
    print(" ".join(g))`,
    explanation: "Sorting letters gives every anagram the same signature, which becomes the dict key grouping them.",
  },
  {
    id: "h-balanced-brackets", title: "Balanced brackets", difficulty: "hard", topic: "Stacks",
    description: "Read a string containing `()[]{}` and other characters. Print `Balanced` if every bracket is closed in the correct order, else `Not balanced`.",
    exampleInput: "{[a+b]*(c)}", exampleOutput: "Balanced", starter: "",
    tests: [{ input: ["{[a+b]*(c)}"], expected: "Balanced" }, { input: ["(]"], expected: "Not balanced" }, { input: ["(("], expected: "Not balanced" }, { input: ["no brackets"], expected: "Balanced" }, { input: ["())("], expected: "Not balanced" }],
    hints: ["Use a list as a stack: push opening brackets.", "On a closing bracket, the top of the stack must be its partner."],
    solution: py`
pairs = {")": "(", "]": "[", "}": "{"}
stack = []
ok = True
for ch in input():
    if ch in "([{":
        stack.append(ch)
    elif ch in pairs:
        if not stack or stack.pop() != pairs[ch]:
            ok = False
            break
print("Balanced" if ok and not stack else "Not balanced")`,
    explanation: "A stack remembers the most recent unclosed bracket. Leftover items at the end mean something was never closed.",
  },
  {
    id: "h-primes-sieve", title: "Primes up to n (sieve)", difficulty: "hard", topic: "Algorithms",
    description: "Read n (2 ≤ n ≤ 100000) and print how many primes are ≤ n, then the largest one. Use an efficient method — a slow solution may time out.",
    exampleInput: "30", exampleOutput: "10\n29", starter: "",
    constraints: ["2 ≤ n ≤ 100000"],
    tests: [{ input: ["30"], expected: out(10, 29) }, { input: ["2"], expected: out(1, 2) }, { input: ["100000"], expected: out(9592, 99991) }],
    hints: ["Sieve of Eratosthenes: mark multiples of each prime as not prime.", "Start crossing out from p*p."],
    solution: py`
n = int(input())
is_p = [True] * (n + 1)
is_p[0] = is_p[1] = False
p = 2
while p * p <= n:
    if is_p[p]:
        for m in range(p * p, n + 1, p):
            is_p[m] = False
    p += 1
primes = [i for i, v in enumerate(is_p) if v]
print(len(primes))
print(primes[-1])`,
    explanation: "The sieve crosses out multiples instead of testing each number separately, running in roughly n log log n time.",
  },
  {
    id: "h-matrix-transpose", title: "Matrix transpose", difficulty: "hard", topic: "Nested lists",
    description: "Read r and c on the first line, then r lines of c integers. Print the transposed matrix (c lines of r integers).",
    exampleInput: "2 3\n1 2 3\n4 5 6", exampleOutput: "1 4\n2 5\n3 6", starter: "",
    tests: [{ input: ["2 3", "1 2 3", "4 5 6"], expected: out("1 4", "2 5", "3 6") }, { input: ["1 1", "9"], expected: "9" }],
    hints: ["Read rows into a list of lists.", "zip(*matrix) transposes."],
    solution: py`
r, c = map(int, input().split())
m = [input().split() for _ in range(r)]
for col in zip(*m):
    print(" ".join(col))`,
    explanation: "zip(*m) takes the i-th item of every row together — exactly the i-th column.",
  },
  {
    id: "h-run-length", title: "Run-length encoding", difficulty: "hard", topic: "Strings",
    description: "Read a string and compress runs of the same character: `aaabcc` → `a3b1c2`. Then print the original length and the compressed length on a second line as `X -> Y`.",
    exampleInput: "aaabcc", exampleOutput: "a3b1c2\n6 -> 6", starter: "",
    tests: [{ input: ["aaabcc"], expected: out("a3b1c2", "6 -> 6") }, { input: ["wwwwwwwwww"], expected: out("w10", "10 -> 3") }, { input: ["x"], expected: out("x1", "1 -> 2") }],
    hints: ["Track the current character and a counter.", "When the character changes, append char+count."],
    solution: py`
s = input()
out = []
i = 0
while i < len(s):
    j = i
    while j < len(s) and s[j] == s[i]:
        j += 1
    out.append(f"{s[i]}{j - i}")
    i = j
enc = "".join(out)
print(enc)
print(f"{len(s)} -> {len(enc)}")`,
    explanation: "The inner loop finds the end of each run; its length is j - i.",
  },
  {
    id: "h-binary-search", title: "Binary search", difficulty: "hard", topic: "Algorithms",
    description: "Read a sorted list of integers on line 1 and a target on line 2. Print the index of the target using binary search, or `-1`. On a second line print how many comparisons you made.",
    exampleInput: "1 3 5 7 9 11\n9", exampleOutput: "4\n2", starter: "",
    tests: [{ input: ["1 3 5 7 9 11", "9"], expected: out(4, 2) }, { input: ["2 4 6", "5"], expected: out(-1, 2) }, { input: ["10", "10"], expected: out(0, 1) }],
    hints: ["Keep low and high indexes; check the middle each step.", "Count one comparison per middle check."],
    solution: py`
nums = list(map(int, input().split()))
target = int(input())
low, high, steps, found = 0, len(nums) - 1, 0, -1
while low <= high:
    mid = (low + high) // 2
    steps += 1
    if nums[mid] == target:
        found = mid
        break
    if nums[mid] < target:
        low = mid + 1
    else:
        high = mid - 1
print(found)
print(steps)`,
    explanation: "Each step halves the search space, so even a million items need only about 20 comparisons.",
  },
];

export const EXERCISE_DIFFICULTIES = [
  { id: "very-easy", label: "Very Easy" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
] as const;
