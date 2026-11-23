import type { Module } from "../types";
import { out, py } from "../helpers";

/**
 * Projects 1–3 are free, 4–7 need Pro, 8–10 need Max.
 * Gating is enforced on the server (the lesson page is a Server Component
 * that only sends project content to users whose plan allows it).
 */
export const m15: Module = {
  id: "m15",
  number: 15,
  title: "Practical Projects",
  description: "Build ten real programs that combine everything you have learned.",
  icon: "hammer",
  lessons: [
    {
      id: "m15-number-guessing",
      title: "Project: Number guessing game",
      kind: "project",
      minutes: 20,
      intro: `Build a classic game: the computer picks a secret number from 1 to 100 and the player guesses until they get it. After each guess, the program says **Too low**, **Too high** or **Correct**.

**Skills used:** \`random\`, \`while\` loops, \`input()\`, conversion, \`if/elif/else\`, counters.

**Plan:**

- Pick the secret with \`random.randint(1, 100)\`.
- Loop: read a guess, compare, give a hint.
- Count attempts and stop when the guess is right.

We'll build it from small testable pieces: a function that judges one guess, then the full game loop.`,
      syntax: py`
import random
secret = random.randint(1, 100)`,
      examples: [
        { title: "The complete game", code: py`
import random

def check_guess(secret, guess):
    if guess < secret:
        return "Too low"
    if guess > secret:
        return "Too high"
    return "Correct"

secret = random.randint(1, 100)
attempts = 0
while True:
    guess = int(input("Guess (1-100): "))
    attempts += 1
    result = check_guess(secret, guess)
    print(result)
    if result == "Correct":
        print(f"You won in {attempts} attempts!")
        break`, note: "Put several guesses in the Input box (one per line) before running." },
        { title: "Testing with a fixed secret", code: py`
def check_guess(secret, guess):
    if guess < secret:
        return "Too low"
    if guess > secret:
        return "Too high"
    return "Correct"

for g in [50, 75, 62]:
    print(g, check_guess(62, g))` },
      ],
      realWorld: `Many games use this hot/cold feedback loop. It also teaches binary search — always guessing the middle finds any number from 1 to 100 in 7 guesses or fewer.`,
      mistakes: [
        { wrong: py`guess = input("Guess: ")
if guess < secret:`, right: py`guess = int(input("Guess: "))
if guess < secret:`, why: "Comparing a string with an int raises TypeError." },
      ],
      tryIt: py`
import random
secret = random.randint(1, 10)
guess = int(input("Guess 1-10: "))
print("Secret was", secret)
print("Correct!" if guess == secret else "Not this time")`,
      practice: [
        { prompt: 'Write `check_guess(secret, guess)` returning `"Too low"`, `"Too high"` or `"Correct"`.', tests: [{ append: 'print(check_guess(50, 20))\nprint(check_guess(50, 80))\nprint(check_guess(50, 50))', expected: out("Too low", "Too high", "Correct") }], hint: "Compare guess with secret.", solution: py`
def check_guess(secret, guess):
    if guess < secret:
        return "Too low"
    if guess > secret:
        return "Too high"
    return "Correct"` },
        { prompt: "The secret is `37`. Read guesses (one per line) until correct, print the hint after each guess, then print `Attempts: N`.", tests: [{ input: ["50", "25", "37"], expected: out("Too high", "Too low", "Correct", "Attempts: 3") }, { input: ["37"], expected: out("Correct", "Attempts: 1") }], hint: "Use while True with a counter and break.", solution: py`
secret = 37
attempts = 0
while True:
    guess = int(input())
    attempts += 1
    if guess < secret:
        print("Too low")
    elif guess > secret:
        print("Too high")
    else:
        print("Correct")
        break
print(f"Attempts: {attempts}")` },
        { prompt: "Write `best_guess(low, high)` returning the middle number `(low + high) // 2` — the optimal strategy.", tests: [{ append: "print(best_guess(1, 100))\nprint(best_guess(51, 100))", expected: out(50, 75) }], hint: "Floor division.", solution: py`
def best_guess(low, high):
    return (low + high) // 2` },
      ],
      quiz: [
        { q: "Which function picks the secret number from 1 to 100 inclusive?", options: ["random.random()", "random.randint(1, 100)", "range(1, 100)"], answer: 1, explain: "randint includes both ends." },
        { q: "Which loop fits 'keep asking until correct'?", options: ["for i in range(10)", "while True with break", "No loop"], answer: 1, explain: "We don't know how many guesses are needed." },
      ],
    },
    {
      id: "m15-calculator",
      title: "Project: Simple calculator",
      kind: "project",
      minutes: 20,
      intro: `Build a reusable calculator with **functions** and **error handling**.

**Features:**

- A \`calculate(a, op, b)\` function supporting \`+ - * /\` and \`**\`.
- Friendly errors: division by zero and unknown operators.
- A loop that keeps calculating until the user types \`q\`.

**Skills used:** functions, dictionaries of operations, try/except, loops.`,
      syntax: py`
def calculate(a, op, b):
    ...`,
      examples: [
        { title: "Calculator with a loop", code: py`
def calculate(a, op, b):
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    if op == "/":
        if b == 0:
            return "Error: division by zero"
        return a / b
    return "Error: unknown operator"

while True:
    line = input("a op b (or q): ")
    if line == "q":
        break
    a, op, b = line.split()
    print(calculate(float(a), op, float(b)))`, note: "Input example: 3 + 4, then 10 / 0, then q" },
        { title: "Operations in a dictionary", code: py`
ops = {
    "+": lambda a, b: a + b,
    "-": lambda a, b: a - b,
    "*": lambda a, b: a * b,
}
print(ops["*"](6, 7))` },
      ],
      realWorld: `This "parse input → dispatch to the right function → handle errors" pattern is how command-line tools and chatbots work.`,
      mistakes: [
        { wrong: py`a, op, b = "3+4".split()`, right: py`a, op, b = "3 + 4".split()`, why: "split() splits on spaces; without spaces you get one piece and a ValueError." },
      ],
      tryIt: py`
def calculate(a, op, b):
    ops = {"+": a + b, "-": a - b, "*": a * b}
    return ops.get(op, "unknown")

print(calculate(8, "*", 5))
print(calculate(8, "%", 5))`,
      practice: [
        { prompt: 'Write `calculate(a, op, b)` for `+ - * /`. Return `"Error"` for division by zero or an unknown operator.', tests: [{ append: 'print(calculate(2, "+", 3))\nprint(calculate(9, "/", 3))\nprint(calculate(1, "/", 0))\nprint(calculate(1, "?", 1))', expected: out(5, "3.0", "Error", "Error") }], hint: "Check op with if/elif.", solution: py`
def calculate(a, op, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        if b == 0:
            return "Error"
        return a / b
    return "Error"` },
        { prompt: "Read lines like `3 * 4` until `q`. For each, print the result as an integer if it is whole, else as a float. (Only + - * are used in the tests.)", tests: [{ input: ["3 * 4", "10 - 15", "q"], expected: out(12, -5) }], hint: "Use int() for both numbers since inputs are whole numbers.", solution: py`
while True:
    line = input()
    if line == "q":
        break
    a, op, b = line.split()
    a, b = int(a), int(b)
    if op == "+":
        print(a + b)
    elif op == "-":
        print(a - b)
    elif op == "*":
        print(a * b)` },
        { prompt: "Write `safe_number(text)` that returns float(text), or `None` if it is not a valid number (use try/except).", tests: [{ append: 'print(safe_number("2.5"))\nprint(safe_number("two"))', expected: out("2.5", "None") }], hint: "except ValueError: return None", solution: py`
def safe_number(text):
    try:
        return float(text)
    except ValueError:
        return None` },
      ],
      quiz: [
        { q: "What should the calculator do for `5 / 0`?", options: ["Crash", "Show a friendly error", "Return 0"], answer: 1, explain: "Handle it gracefully." },
        { q: "What does `\"7 * 2\".split()` return?", options: ["['7 * 2']", "['7', '*', '2']", "14"], answer: 1, explain: "split on spaces." },
      ],
    },
    {
      id: "m15-password-generator",
      title: "Project: Password generator",
      kind: "project",
      minutes: 20,
      intro: `Build a tool that creates **strong random passwords** and checks password strength.

**Features:**

- Choose a length and which character groups to use (letters, digits, symbols).
- Guarantee at least one character from each chosen group.
- A \`strength(password)\` checker.

**Skills used:** \`random\` (or the safer \`secrets\` module), the \`string\` module, lists, loops, functions.

**Security note:** for real passwords use \`secrets.choice\`, which is designed for security. \`random\` is fine for games but predictable.`,
      syntax: py`
import secrets, string
chars = string.ascii_letters + string.digits
password = "".join(secrets.choice(chars) for _ in range(12))`,
      examples: [
        { title: "A password generator", code: py`
import secrets, string

def generate(length=12, digits=True, symbols=True):
    pools = [string.ascii_lowercase, string.ascii_uppercase]
    if digits:
        pools.append(string.digits)
    if symbols:
        pools.append("!@#$%^&*")
    chars = [secrets.choice(p) for p in pools]          # one from each group
    all_chars = "".join(pools)
    chars += [secrets.choice(all_chars) for _ in range(length - len(chars))]
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)

print(generate())
print(generate(8, symbols=False))` },
        { title: "Strength checker", code: py`
def strength(pw):
    score = 0
    score += len(pw) >= 8
    score += any(c.isdigit() for c in pw)
    score += any(c.isupper() for c in pw)
    score += any(not c.isalnum() for c in pw)
    return ["Very weak", "Weak", "OK", "Good", "Strong"][score]

print(strength("abc"))
print(strength("Abcdef12!"))` },
      ],
      realWorld: `Password managers like Bitwarden and 1Password generate passwords using exactly this approach with cryptographically secure randomness.`,
      mistakes: [
        { wrong: py`random.seed(1)  # in a real password generator`, right: py`import secrets`, why: "Seeded or predictable randomness makes passwords guessable." },
      ],
      tryIt: py`
import secrets, string
pool = string.ascii_letters + string.digits
print("".join(secrets.choice(pool) for _ in range(16)))`,
      practice: [
        { prompt: "Write `strength(pw)` that returns the number of rules met (0–4): length >= 8, has a digit, has an uppercase letter, has a non-alphanumeric symbol.", tests: [{ append: 'print(strength("abc"))\nprint(strength("abcdefgh"))\nprint(strength("Abcdefg1!"))', expected: out(0, 1, 4) }], hint: "Use any() with str methods.", solution: py`
def strength(pw):
    score = 0
    if len(pw) >= 8:
        score += 1
    if any(c.isdigit() for c in pw):
        score += 1
    if any(c.isupper() for c in pw):
        score += 1
    if any(not c.isalnum() for c in pw):
        score += 1
    return score` },
        { prompt: "Write `generate(length)` that returns a random password of that length using letters and digits. The tests check the length and characters.", tests: [{ append: 'p = generate(12)\nprint(len(p))\nprint(p.isalnum())', expected: out(12, "True") }], hint: '"".join(secrets.choice(chars) for _ in range(length))', solution: py`
import secrets, string

def generate(length):
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))` },
        { prompt: "Write `has_all_groups(pw)` returning True if pw has a lowercase letter, an uppercase letter and a digit.", tests: [{ append: 'print(has_all_groups("aB3"))\nprint(has_all_groups("abc3"))', expected: out("True", "False") }], hint: "Three any() checks joined with and.", solution: py`
def has_all_groups(pw):
    return (any(c.islower() for c in pw)
            and any(c.isupper() for c in pw)
            and any(c.isdigit() for c in pw))` },
      ],
      quiz: [
        { q: "Which module is designed for security-sensitive randomness?", options: ["random", "secrets", "math"], answer: 1, explain: "secrets uses a cryptographically secure source." },
        { q: "What does `\"\".join([\"a\", \"b\"])` return?", options: ["'a b'", "'ab'", "['ab']"], answer: 1, explain: "join glues strings with the separator (empty here)." },
      ],
    },
    {
      id: "m15-quiz-app",
      title: "Project: Quiz application",
      kind: "project",
      minPlan: "PRO",
      minutes: 25,
      intro: `Build a **quiz app** that asks questions, checks answers, keeps score and shows a result at the end — a mini version of the quizzes on PyNest!

**Features:**

- Questions stored as a **list of dictionaries** (question, options, answer).
- Case-insensitive answer checking.
- A final score and percentage, with a message depending on the result.

**Skills used:** data structures, loops, functions, string methods, formatting.`,
      syntax: py`
questions = [
    {"q": "2 + 2?", "answer": "4"},
]`,
      examples: [
        { title: "The quiz app", code: py`
questions = [
    {"q": "Capital of France?", "answer": "paris"},
    {"q": "5 * 6?", "answer": "30"},
    {"q": "Python creator's first name?", "answer": "guido"},
]

def run_quiz(questions):
    score = 0
    for i, item in enumerate(questions, start=1):
        reply = input(f"Q{i}. {item['q']} ").strip().lower()
        if reply == item["answer"]:
            print("Correct!")
            score += 1
        else:
            print(f"Wrong. Answer: {item['answer']}")
    return score

score = run_quiz(questions)
print(f"Score: {score}/{len(questions)} ({score / len(questions):.0%})")`, note: "Input: Paris, 30, guido" },
        { title: "Result message", code: py`
def verdict(pct):
    if pct >= 0.8:
        return "Excellent"
    if pct >= 0.5:
        return "Good"
    return "Keep practising"

print(verdict(2 / 3))` },
      ],
      realWorld: `Learning platforms, driving-theory apps and trivia games are built on this same data-driven structure.`,
      mistakes: [
        { wrong: py`if reply == item["answer"]:  # user typed " Paris"`, right: py`if reply.strip().lower() == item["answer"]:`, why: "Normalise user input before comparing." },
      ],
      tryIt: py`
quiz = {"Largest planet?": "jupiter", "H2O is?": "water"}
score = 0
for q, a in quiz.items():
    if input(q + " ").strip().lower() == a:
        score += 1
print("Score:", score)`,
      practice: [
        { prompt: "Write `check(reply, answer)` that returns True when they match ignoring case and surrounding spaces.", tests: [{ append: 'print(check("  Paris ", "paris"))\nprint(check("Rome", "paris"))', expected: out("True", "False") }], hint: "reply.strip().lower() == answer.lower()", solution: py`
def check(reply, answer):
    return reply.strip().lower() == answer.strip().lower()` },
        { prompt: 'Using `qs = [("2+2", "4"), ("3*3", "9"), ("10-7", "3")]`, read three answers and print `Score: X/3`.', tests: [{ input: ["4", "8", "3"], expected: "Score: 2/3" }, { input: ["4", "9", "3"], expected: "Score: 3/3" }], hint: "Loop over qs with input() each time.", solution: py`
qs = [("2+2", "4"), ("3*3", "9"), ("10-7", "3")]
score = 0
for q, a in qs:
    if input().strip() == a:
        score += 1
print(f"Score: {score}/{len(qs)}")` },
        { prompt: 'Write `verdict(score, total)` returning `"Excellent"` (>= 80%), `"Good"` (>= 50%) or `"Keep practising"`.', tests: [{ append: "print(verdict(9, 10))\nprint(verdict(5, 10))\nprint(verdict(1, 10))", expected: out("Excellent", "Good", "Keep practising") }], hint: "pct = score / total", solution: py`
def verdict(score, total):
    pct = score / total
    if pct >= 0.8:
        return "Excellent"
    if pct >= 0.5:
        return "Good"
    return "Keep practising"` },
      ],
      quiz: [
        { q: "Why store questions in a list of dicts?", options: ["It is required", "Data and logic stay separate; adding questions needs no new code", "It is faster to type"], answer: 1, explain: "Data-driven design scales." },
        { q: "Why call .strip().lower() on answers?", options: ["To be forgiving of spaces and capitals", "To encrypt them", "No reason"], answer: 0, explain: "Normalising input avoids false 'wrong' answers." },
      ],
    },
    {
      id: "m15-todo-list",
      title: "Project: To-do list",
      kind: "project",
      minPlan: "PRO",
      minutes: 25,
      intro: `Build a **command-based to-do list** that saves tasks to a file so they survive restarts.

**Commands:** \`add <task>\`, \`done <number>\`, \`list\`, \`quit\`.

**Features:**

- Tasks stored as a list of dicts: \`{"title": ..., "done": False}\`.
- Saved to and loaded from \`todo.json\` with the \`json\` module.
- Numbered display with ✓ for completed tasks.

**Skills used:** lists, dicts, string parsing, files, JSON, functions.`,
      syntax: py`
import json
with open("todo.json", "w") as f:
    json.dump(tasks, f)`,
      examples: [
        { title: "The to-do app", code: py`
import json, os

FILE = "todo.json"

def load():
    if os.path.exists(FILE):
        with open(FILE) as f:
            return json.load(f)
    return []

def save(tasks):
    with open(FILE, "w") as f:
        json.dump(tasks, f)

def show(tasks):
    for i, t in enumerate(tasks, start=1):
        mark = "x" if t["done"] else " "
        print(f"{i}. [{mark}] {t['title']}")

tasks = load()
while True:
    cmd = input("> ").strip()
    if cmd == "quit":
        break
    elif cmd.startswith("add "):
        tasks.append({"title": cmd[4:], "done": False})
    elif cmd.startswith("done "):
        tasks[int(cmd[5:]) - 1]["done"] = True
    elif cmd == "list":
        show(tasks)
    save(tasks)`, note: "Input: add Buy milk, add Study Python, done 1, list, quit" },
        { title: "Counting remaining tasks", code: py`
tasks = [{"title": "a", "done": True}, {"title": "b", "done": False}]
print(sum(1 for t in tasks if not t["done"]), "left")` },
      ],
      realWorld: `Apps like Todoist started as exactly this: a list of task objects, commands to change them, and persistent storage.`,
      mistakes: [
        { wrong: py`tasks[int(cmd[5:])]["done"] = True`, right: py`tasks[int(cmd[5:]) - 1]["done"] = True`, why: "Users count from 1, lists from 0." },
      ],
      tryIt: py`
tasks = []
for title in ["Read", "Code", "Sleep"]:
    tasks.append({"title": title, "done": False})
tasks[1]["done"] = True
for i, t in enumerate(tasks, 1):
    print(i, "✓" if t["done"] else "·", t["title"])`,
      practice: [
        { prompt: 'Write `add_task(tasks, title)` that appends `{"title": title, "done": False}` and `complete(tasks, n)` that marks task number n (1-based) done.', tests: [{ append: 't = []\nadd_task(t, "a")\nadd_task(t, "b")\ncomplete(t, 2)\nprint(t)', expected: "[{'title': 'a', 'done': False}, {'title': 'b', 'done': True}]" }], hint: "tasks[n - 1]['done'] = True", solution: py`
def add_task(tasks, title):
    tasks.append({"title": title, "done": False})

def complete(tasks, n):
    tasks[n - 1]["done"] = True` },
        { prompt: "Process commands from input until `quit`: `add X` adds a task, `list` prints tasks as `1. X` (one per line).", tests: [{ input: ["add Milk", "add Code", "list", "quit"], expected: out("1. Milk", "2. Code") }], hint: 'if cmd.startswith("add "): tasks.append(cmd[4:])', solution: py`
tasks = []
while True:
    cmd = input()
    if cmd == "quit":
        break
    if cmd.startswith("add "):
        tasks.append(cmd[4:])
    elif cmd == "list":
        for i, t in enumerate(tasks, start=1):
            print(f"{i}. {t}")` },
        { prompt: "Save `[\"a\", \"b\"]` to `tasks.json` with json.dump, load it back with json.load and print it.", tests: [{ expected: "['a', 'b']" }], hint: "with open(..., 'w') as f: json.dump(data, f)", solution: py`
import json
with open("tasks.json", "w") as f:
    json.dump(["a", "b"], f)
with open("tasks.json") as f:
    print(json.load(f))` },
      ],
      quiz: [
        { q: "Why save tasks to a file?", options: ["To make the program faster", "So tasks survive after the program ends", "Python requires it"], answer: 1, explain: "Persistence." },
        { q: "What does `\"add milk\"[4:]` give?", options: ["'add '", "'milk'", "'add milk'"], answer: 1, explain: "Slicing skips the command prefix." },
      ],
    },
    {
      id: "m15-rock-paper-scissors",
      title: "Project: Rock Paper Scissors",
      kind: "project",
      minPlan: "PRO",
      minutes: 20,
      intro: `Build **Rock Paper Scissors** against the computer, best of several rounds.

**Features:**

- The computer chooses with \`random.choice\`.
- A \`winner(player, computer)\` function using a dictionary of what beats what.
- Score tracking across rounds and a final result.

**Skills used:** random, dictionaries, functions, loops, input validation.`,
      syntax: py`
BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}`,
      examples: [
        { title: "The game", code: py`
import random

BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}

def winner(player, computer):
    if player == computer:
        return "draw"
    return "player" if BEATS[player] == computer else "computer"

score = {"player": 0, "computer": 0, "draw": 0}
for _ in range(3):
    p = input("rock/paper/scissors: ").strip().lower()
    if p not in BEATS:
        print("Invalid choice")
        continue
    c = random.choice(list(BEATS))
    w = winner(p, c)
    score[w] += 1
    print(f"Computer chose {c} -> {w}")
print(score)`, note: "Input three moves, e.g. rock, paper, scissors" },
        { title: "Checking the rules", code: py`
BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}
for a in BEATS:
    print(a, "beats", BEATS[a])` },
      ],
      realWorld: `Using a dictionary for rules instead of nine if-statements is a technique called "table-driven logic" — common in game engines.`,
      mistakes: [
        { wrong: "Nine separate if statements for every combination", right: "One rules dictionary and one comparison", why: "Less code, fewer bugs, and easy to extend (e.g. Rock-Paper-Scissors-Lizard-Spock)." },
      ],
      tryIt: py`
import random
moves = ["rock", "paper", "scissors"]
print("Computer plays:", random.choice(moves))`,
      practice: [
        { prompt: 'Write `winner(player, computer)` returning `"draw"`, `"player"` or `"computer"`.', tests: [{ append: 'print(winner("rock", "scissors"))\nprint(winner("rock", "paper"))\nprint(winner("paper", "paper"))', expected: out("player", "computer", "draw") }], hint: "Use a BEATS dictionary.", solution: py`
BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}

def winner(player, computer):
    if player == computer:
        return "draw"
    if BEATS[player] == computer:
        return "player"
    return "computer"` },
        { prompt: "Read player moves and computer moves on two lines (space-separated, same count). Print the final score as `Player X - Computer Y`.", tests: [{ input: ["rock paper scissors", "scissors scissors scissors"], expected: "Player 1 - Computer 1" }], hint: "zip the two lists and count winners.", solution: py`
BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}
players = input().split()
comps = input().split()
p_score = c_score = 0
for p, c in zip(players, comps):
    if p == c:
        continue
    if BEATS[p] == c:
        p_score += 1
    else:
        c_score += 1
print(f"Player {p_score} - Computer {c_score}")` },
        { prompt: 'Write `valid_move(text)` returning the cleaned move (lowercase, stripped) if it is rock/paper/scissors, otherwise `None`.', tests: [{ append: 'print(valid_move(" Rock "))\nprint(valid_move("lizard"))', expected: out("rock", "None") }], hint: "Normalise then check membership.", solution: py`
def valid_move(text):
    move = text.strip().lower()
    if move in ("rock", "paper", "scissors"):
        return move
    return None` },
      ],
      quiz: [
        { q: "What does `random.choice([\"a\", \"b\"])` return?", options: ["Both", "One random item", "An index"], answer: 1, explain: "A single random element." },
        { q: "With BEATS = {\"rock\": \"scissors\", ...}, BEATS[\"rock\"] is…", options: ["What rock loses to", "What rock beats", "rock"], answer: 1, explain: "The value is the move that the key beats." },
      ],
    },
    {
      id: "m15-number-analyzer",
      title: "Project: Number analyzer",
      kind: "project",
      minPlan: "PRO",
      minutes: 20,
      intro: `Build a tool that reads a list of numbers and reports useful statistics.

**Report:**

- count, sum, minimum, maximum
- mean (average) and median
- how many are even/odd, positive/negative
- whether a number is prime

**Skills used:** lists, loops, functions, sorting, math, formatting.`,
      syntax: py`
nums = list(map(int, input().split()))`,
      examples: [
        { title: "The analyzer", code: py`
def median(nums):
    s = sorted(nums)
    mid = len(s) // 2
    return s[mid] if len(s) % 2 else (s[mid - 1] + s[mid]) / 2

def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            return False
    return True

nums = [12, 7, 3, 20, 7, 1]
print("Count:", len(nums))
print("Sum:", sum(nums))
print("Min/Max:", min(nums), max(nums))
print(f"Mean: {sum(nums) / len(nums):.2f}")
print("Median:", median(nums))
print("Even:", sum(1 for n in nums if n % 2 == 0))
print("Primes:", [n for n in nums if is_prime(n)])` },
        { title: "Reading numbers from input", code: py`
nums = list(map(int, input("Numbers: ").split()))
print(sorted(nums))`, note: "Input example: 5 3 9 1" },
      ],
      realWorld: `Spreadsheets, fitness apps and school report systems compute these exact statistics.`,
      mistakes: [
        { wrong: py`median = nums[len(nums) // 2]`, right: py`median = sorted(nums)[len(nums) // 2]  # plus even-length handling`, why: "The median requires sorted data." },
      ],
      tryIt: py`
nums = [4, 8, 15, 16, 23, 42]
print("Average:", sum(nums) / len(nums))
print("Range:", max(nums) - min(nums))`,
      practice: [
        { prompt: "Write `is_prime(n)`.", tests: [{ append: "print([n for n in range(20) if is_prime(n)])", expected: "[2, 3, 5, 7, 11, 13, 17, 19]" }], hint: "Check divisors from 2 up to the square root.", solution: py`
def is_prime(n):
    if n < 2:
        return False
    for d in range(2, int(n ** 0.5) + 1):
        if n % d == 0:
            return False
    return True` },
        { prompt: "Write `median(nums)` (for even counts, average the two middle values).", tests: [{ append: "print(median([3, 1, 2]))\nprint(median([4, 1, 3, 2]))", expected: out(2, "2.5") }], hint: "Sort first.", solution: py`
def median(nums):
    s = sorted(nums)
    mid = len(s) // 2
    if len(s) % 2 == 1:
        return s[mid]
    return (s[mid - 1] + s[mid]) / 2` },
        { prompt: "Read numbers on one line. Print `min max mean` with the mean rounded to 1 decimal, e.g. `1 9 4.3`.", tests: [{ input: ["1 3 9"], expected: "1 9 4.3" }, { input: ["5 5"], expected: "5 5 5.0" }], hint: 'f"{min(nums)} {max(nums)} {mean:.1f}"', solution: py`
nums = list(map(int, input().split()))
mean = sum(nums) / len(nums)
print(f"{min(nums)} {max(nums)} {mean:.1f}")` },
      ],
      quiz: [
        { q: "Median of [5, 1, 3]?", options: ["1", "3", "5", "3.0"], answer: 1, explain: "Sorted: 1, 3, 5 → middle is 3." },
        { q: "Why check divisors only up to √n for primes?", options: ["Tradition", "Any factor above √n pairs with one below it", "It is wrong"], answer: 1, explain: "It makes the check much faster." },
      ],
    },
    {
      id: "m15-contact-book",
      title: "Project: Contact book",
      kind: "project",
      minPlan: "MAX",
      minutes: 30,
      intro: `Build a **contact book** using **OOP**: a \`Contact\` class and a \`ContactBook\` class that adds, searches, deletes and saves contacts.

**Features:**

- \`Contact(name, phone, email)\` with \`__str__\`.
- \`ContactBook\` with \`add\`, \`find\` (partial, case-insensitive), \`delete\`.
- Validation: refuse duplicate names and emails without "@".
- Save/load to CSV.

**Skills used:** classes, methods, encapsulation, exceptions, files, CSV.`,
      syntax: py`
class Contact:
    def __init__(self, name, phone, email):
        ...`,
      examples: [
        { title: "Contact book", code: py`
class Contact:
    def __init__(self, name, phone, email):
        if "@" not in email:
            raise ValueError("invalid email")
        self.name, self.phone, self.email = name, phone, email

    def __str__(self):
        return f"{self.name} | {self.phone} | {self.email}"

class ContactBook:
    def __init__(self):
        self._contacts = {}

    def add(self, contact):
        key = contact.name.lower()
        if key in self._contacts:
            raise ValueError("contact already exists")
        self._contacts[key] = contact

    def find(self, text):
        text = text.lower()
        return [c for k, c in sorted(self._contacts.items()) if text in k]

    def delete(self, name):
        return self._contacts.pop(name.lower(), None) is not None

book = ContactBook()
book.add(Contact("Ana Lee", "555-1", "ana@mail.com"))
book.add(Contact("Ben Park", "555-2", "ben@mail.com"))
for c in book.find("an"):
    print(c)` },
        { title: "Saving to CSV", code: py`
import csv
rows = [("Ana", "555-1", "ana@mail.com")]
with open("contacts.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)
print(open("contacts.csv").read().strip())` },
      ],
      realWorld: `Every phone has a contact app built on this model: objects for contacts, a collection with search, and persistent storage.`,
      mistakes: [
        { wrong: py`self.contacts.append(contact)  # list, search by looping every time`, right: py`self._contacts[contact.name.lower()] = contact`, why: "A dict keyed by name gives instant lookups and prevents duplicates." },
      ],
      tryIt: py`
contacts = {"ana": "555-1", "ben": "555-2"}
query = input("Search: ").lower()
for name, phone in contacts.items():
    if query in name:
        print(name, phone)`,
      practice: [
        { prompt: 'Write class `Contact(name, phone)` with `__str__` returning `"<name>: <phone>"`.', tests: [{ append: 'print(Contact("Ana", "555-1234"))', expected: "Ana: 555-1234" }], hint: "Store attributes in __init__.", solution: py`
class Contact:
    def __init__(self, name, phone):
        self.name = name
        self.phone = phone

    def __str__(self):
        return f"{self.name}: {self.phone}"` },
        { prompt: "Write class `ContactBook` with `add(name, phone)`, `find(text)` returning a sorted list of names containing text (case-insensitive), and `count()`.", tests: [{ append: 'b = ContactBook()\nb.add("Ana", "1")\nb.add("Hannah", "2")\nb.add("Ben", "3")\nprint(b.find("AN"))\nprint(b.count())', expected: out("['Ana', 'Hannah']", 3) }], hint: "Store in a dict name -> phone.", solution: py`
class ContactBook:
    def __init__(self):
        self.contacts = {}

    def add(self, name, phone):
        self.contacts[name] = phone

    def find(self, text):
        return sorted(n for n in self.contacts if text.lower() in n.lower())

    def count(self):
        return len(self.contacts)` },
        { prompt: 'Write `validate_email(email)` that raises `ValueError("invalid email")` if there is no "@" or no "." after the "@"; otherwise returns True.', tests: [{ append: 'print(validate_email("a@b.com"))\nfor e in ["ab.com", "a@bcom"]:\n    try:\n        validate_email(e)\n    except ValueError as err:\n        print(err)', expected: out("True", "invalid email", "invalid email") }], hint: 'Check "@" in email, then "." in email.split("@")[1].', solution: py`
def validate_email(email):
    if "@" not in email or "." not in email.split("@")[1]:
        raise ValueError("invalid email")
    return True` },
      ],
      quiz: [
        { q: "Why key contacts by lowercase name?", options: ["Looks nicer", "Case-insensitive lookups and duplicate detection", "Required by Python"], answer: 1, explain: "'Ana' and 'ana' become the same key." },
        { q: "Which class should validate the email format?", options: ["Contact (it owns the data)", "Nobody", "The print function"], answer: 0, explain: "Encapsulate rules with the data." },
      ],
    },
    {
      id: "m15-text-adventure",
      title: "Project: Text-based adventure game",
      kind: "project",
      minPlan: "MAX",
      minutes: 35,
      intro: `Build an **interactive story** where the player moves between rooms, picks up items and wins by reaching the treasure.

**Design:**

- Rooms stored in a **dictionary**: each room has a description, exits and maybe an item.
- The player has a **current room** and an **inventory** (a list).
- Commands: \`go north\`, \`take key\`, \`inventory\`, \`quit\`.
- A locked door that needs the key.

**Skills used:** nested dictionaries, loops, string parsing, game state, functions.`,
      syntax: py`
rooms = {
    "hall": {"desc": "...", "exits": {"north": "library"}, "item": None},
}`,
      examples: [
        { title: "Adventure engine", code: py`
rooms = {
    "hall": {"desc": "A dusty hall.", "exits": {"north": "library", "east": "vault"}, "item": None},
    "library": {"desc": "Old books everywhere.", "exits": {"south": "hall"}, "item": "key"},
    "vault": {"desc": "A heavy locked door.", "exits": {"west": "hall"}, "item": None, "locked": True},
}

room = "hall"
inventory = []
print(rooms[room]["desc"])
while True:
    cmd = input("> ").strip().lower()
    if cmd == "quit":
        break
    if cmd.startswith("go "):
        direction = cmd[3:]
        target = rooms[room]["exits"].get(direction)
        if not target:
            print("You can't go that way.")
        elif rooms[target].get("locked") and "key" not in inventory:
            print("The door is locked.")
        else:
            room = target
            print(rooms[room]["desc"])
            if room == "vault":
                print("You found the treasure! You win!")
                break
    elif cmd.startswith("take "):
        item = cmd[5:]
        if rooms[room]["item"] == item:
            inventory.append(item)
            rooms[room]["item"] = None
            print("Taken:", item)
        else:
            print("No", item, "here.")
    elif cmd == "inventory":
        print(inventory)`, note: "Input: go east, go north, take key, go south, go east" },
        { title: "Room exits", code: py`
exits = {"north": "garden", "west": "kitchen"}
print("Exits:", ", ".join(sorted(exits)))` },
      ],
      realWorld: `Text adventures like Zork were among the first computer games, and the same "state machine" idea runs chatbots and game AI today.`,
      mistakes: [
        { wrong: py`room = rooms[room]["exits"][direction]`, right: py`room = rooms[room]["exits"].get(direction, room)`, why: "An invalid direction would raise KeyError and crash the game." },
      ],
      tryIt: py`
rooms = {"start": {"north": "cave"}, "cave": {"south": "start"}}
room = "start"
for move in ["north", "south", "east"]:
    room = rooms[room].get(move, room)
    print(move, "->", room)`,
      practice: [
        { prompt: "Write `move(rooms, room, direction)` returning the new room, or the same room if the direction is not an exit.", tests: [{ append: 'r = {"a": {"n": "b"}, "b": {"s": "a"}}\nprint(move(r, "a", "n"))\nprint(move(r, "a", "w"))', expected: out("b", "a") }], hint: "rooms[room].get(direction, room)", solution: py`
def move(rooms, room, direction):
    return rooms[room].get(direction, room)` },
        { prompt: "Write `parse(cmd)` that splits a command into (verb, noun). For a one-word command, noun is `None`. Normalise to lowercase.", tests: [{ append: 'print(parse("GO North"))\nprint(parse("inventory"))', expected: out("('go', 'north')", "('inventory', None)") }], hint: "parts = cmd.lower().split(maxsplit=1)", solution: py`
def parse(cmd):
    parts = cmd.strip().lower().split(maxsplit=1)
    if len(parts) == 1:
        return (parts[0], None)
    return (parts[0], parts[1])` },
        { prompt: 'Simulate: start in `hall`. Rooms: hall→north→library, library→south→hall. Read commands until `quit`; for `go X` move if possible, then print the current room name after each command.', tests: [{ input: ["go north", "go west", "go south", "quit"], expected: out("library", "library", "hall") }], hint: "Use a dict of exits and a loop.", solution: py`
exits = {"hall": {"north": "library"}, "library": {"south": "hall"}}
room = "hall"
while True:
    cmd = input()
    if cmd == "quit":
        break
    if cmd.startswith("go "):
        room = exits[room].get(cmd[3:], room)
    print(room)` },
      ],
      quiz: [
        { q: "What is the player's 'state' in this game?", options: ["Only the score", "Current room and inventory", "The rooms dictionary only"], answer: 1, explain: "State is what changes as the player acts." },
        { q: "Why use `.get(direction)` for exits?", options: ["It is required", "It avoids KeyError for invalid directions", "It is slower"], answer: 1, explain: "get returns None (or a default) safely." },
      ],
    },
    {
      id: "m15-expense-tracker",
      title: "Project: Basic expense tracker",
      kind: "project",
      minPlan: "MAX",
      minutes: 35,
      intro: `Build an **expense tracker** that records spending, shows totals per category and saves everything to CSV.

**Features:**

- An \`Expense\` (date, category, amount, note).
- Add expenses, list them, total by category, find the biggest expense.
- Monthly budget warnings.
- Save/load with the \`csv\` module.

**Skills used:** classes or dicts, datetime, dictionaries for grouping, CSV files, formatting, error handling. This is your capstone — it uses almost everything in the course!`,
      syntax: py`
from collections import defaultdict
totals = defaultdict(float)
totals["food"] += 12.5`,
      examples: [
        { title: "Expense tracker", code: py`
import csv
from collections import defaultdict
from datetime import date

class Tracker:
    def __init__(self, budget):
        self.budget = budget
        self.expenses = []

    def add(self, category, amount, note=""):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.expenses.append({"date": date.today().isoformat(), "category": category,
                              "amount": amount, "note": note})

    def total(self):
        return sum(e["amount"] for e in self.expenses)

    def by_category(self):
        totals = defaultdict(float)
        for e in self.expenses:
            totals[e["category"]] += e["amount"]
        return dict(totals)

    def save(self, path):
        with open(path, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=["date", "category", "amount", "note"])
            w.writeheader()
            w.writerows(self.expenses)

t = Tracker(budget=100)
t.add("food", 12.5, "lunch")
t.add("transport", 3.2)
t.add("food", 40, "groceries")
for cat, amt in sorted(t.by_category().items()):
    print(f"{cat:<10} {amt:>7.2f}")
print(f"{'TOTAL':<10} {t.total():>7.2f}")
if t.total() > t.budget * 0.5:
    print("Warning: over 50% of budget used")
t.save("expenses.csv")` },
        { title: "Biggest expense", code: py`
expenses = [("food", 12.5), ("rent", 300), ("fun", 25)]
print(max(expenses, key=lambda e: e[1]))` },
      ],
      realWorld: `Budgeting apps like YNAB or your bank's spending insights are built around exactly these operations: record, group, total, warn.`,
      mistakes: [
        { wrong: py`totals[cat] += amount  # with a normal dict, first time`, right: py`totals[cat] = totals.get(cat, 0) + amount`, why: "A plain dict raises KeyError on the first += for a new key. Use get() or defaultdict." },
      ],
      tryIt: py`
spent = {}
for cat, amt in [("food", 10), ("fun", 5), ("food", 7.5)]:
    spent[cat] = spent.get(cat, 0) + amt
print(spent)`,
      practice: [
        { prompt: "Write `totals_by_category(expenses)` where expenses is a list of `(category, amount)` tuples; return a dict of totals.", tests: [{ append: 'print(totals_by_category([("food", 10), ("fun", 5), ("food", 2.5)]))', expected: "{'food': 12.5, 'fun': 5}" }], hint: "totals[cat] = totals.get(cat, 0) + amount", solution: py`
def totals_by_category(expenses):
    totals = {}
    for cat, amount in expenses:
        totals[cat] = totals.get(cat, 0) + amount
    return totals` },
        { prompt: "Read lines `category amount` until `done`. Then print each category and total, sorted by category, formatted like `food 12.50`.", tests: [{ input: ["food 10", "bus 2.5", "food 2.5", "done"], expected: out("bus 2.50", "food 12.50") }], hint: "Split each line, convert amount with float().", solution: py`
totals = {}
while True:
    line = input()
    if line == "done":
        break
    cat, amount = line.split()
    totals[cat] = totals.get(cat, 0) + float(amount)
for cat in sorted(totals):
    print(f"{cat} {totals[cat]:.2f}")` },
        { prompt: 'Write `budget_status(spent, budget)` returning `"OK"` under 80%, `"Warning"` from 80% up to 100%, and `"Over budget"` above 100%.', tests: [{ append: "print(budget_status(50, 100))\nprint(budget_status(85, 100))\nprint(budget_status(100, 100))\nprint(budget_status(120, 100))", expected: out("OK", "Warning", "Warning", "Over budget") }], hint: "Compare spent / budget with 0.8 and 1.0.", solution: py`
def budget_status(spent, budget):
    ratio = spent / budget
    if ratio > 1:
        return "Over budget"
    if ratio >= 0.8:
        return "Warning"
    return "OK"` },
      ],
      quiz: [
        { q: "What does defaultdict(float) do for a missing key?", options: ["Raises KeyError", "Starts it at 0.0", "Returns None"], answer: 1, explain: "It creates a default value automatically." },
        { q: "Which module writes CSV rows from dictionaries?", options: ["csv.DictWriter", "json.dump", "os.write"], answer: 0, explain: "DictWriter uses fieldnames for columns." },
      ],
    },
  ],
};
