import type { Module } from "../types";
import { out, py } from "../helpers";

export const m04: Module = {
  id: "m4",
  number: 4,
  title: "Strings",
  description: "Work with text: indexing, slicing, string methods and beautiful f-strings.",
  icon: "type",
  lessons: [
    {
      id: "m4-creating-strings",
      title: "Creating strings and quotes",
      minutes: 6,
      intro: `A **string** is text. You can create one with **single quotes** \`'hi'\` or **double quotes** \`"hi"\` — both work the same.

Why two kinds? So you can put one kind *inside* the other:

- \`"It's sunny"\` — an apostrophe inside double quotes.
- \`'She said "wow"'\` — double quotes inside single quotes.

**Triple quotes** \`"""..."""\` create strings that span several lines.

**Escape characters** start with a backslash: \`\\n\` is a new line, \`\\t\` is a tab, \`\\"\` is a quote character.`,
      syntax: py`
a = "double"
b = 'single'
c = """many
lines"""`,
      examples: [
        { title: "Quotes inside strings", code: py`
print("It's my book")
print('He said "hello"')` },
        { title: "New lines and tabs", code: py`
print("Line one\nLine two")
print("Name:\tAlex")` },
      ],
      realWorld: `Messages, usernames, emails, addresses, product descriptions — most data that people read is stored as strings.`,
      mistakes: [
        { wrong: py`print('It's fun')`, right: py`print("It's fun")`, why: "The apostrophe ends the single-quoted string early. Use double quotes around it." },
      ],
      tryIt: py`
poem = """Roses are red,
Python is cool."""
print(poem)`,
      practice: [
        { prompt: "Print exactly: `I'm learning Python` (with the apostrophe).", tests: [{ expected: "I'm learning Python" }], hint: "Use double quotes around the text.", solution: py`print("I'm learning Python")` },
        { prompt: "Using ONE print() and `\\n`, print `Hello` and `World` on two lines.", tests: [{ expected: out("Hello", "World") }], hint: 'print("Hello\\nWorld")', solution: py`print("Hello\nWorld")` },
        { prompt: 'Print: `She said "yes"` (including the double quotes).', tests: [{ expected: 'She said "yes"' }], hint: "Wrap it in single quotes.", solution: py`print('She said "yes"')` },
      ],
      quiz: [
        { q: "Which creates a valid string?", options: ["'hello\"", "\"hello'", "'hello'", "hello"], answer: 2, explain: "Opening and closing quotes must match." },
        { q: "What does `\\n` mean inside a string?", options: ["The letter n", "A new line", "Nothing", "A space"], answer: 1, explain: "\\n is the newline escape character." },
      ],
    },
    {
      id: "m4-indexing",
      title: "String indexing",
      minutes: 7,
      intro: `Each character in a string has a position number called an **index**. Python starts counting at **0**, not 1!

For \`word = "PYTHON"\`:

- \`word[0]\` → \`"P"\`
- \`word[1]\` → \`"Y"\`
- \`word[5]\` → \`"N"\`

**Negative indexes** count from the end: \`word[-1]\` is the last character \`"N"\`, \`word[-2]\` is \`"O"\`.

Asking for an index that does not exist, like \`word[10]\`, raises an **IndexError**.`,
      syntax: py`
word = "PYTHON"
print(word[0])
print(word[-1])`,
      examples: [
        { title: "First and last letters", code: py`
name = "Samira"
print(name[0])
print(name[-1])` },
        { title: "Initials", code: py`
first = "Ada"
last = "Lovelace"
print(first[0] + last[0])` },
      ],
      realWorld: `Apps show initials in avatar circles, check the first digit of a card number, or read the last character to check for punctuation.`,
      mistakes: [
        { wrong: py`print("cat"[3])`, right: py`print("cat"[2])`, why: '"cat" has indexes 0, 1, 2. Index 3 does not exist → IndexError.' },
      ],
      tryIt: py`
s = "Hello"
print(s[0], s[1], s[-1])`,
      practice: [
        { prompt: 'With `word = "banana"`, print its first character.', tests: [{ expected: "b" }], hint: "word[0]", solution: py`
word = "banana"
print(word[0])` },
        { prompt: 'With `word = "banana"`, print its last character using a negative index.', tests: [{ expected: "a" }], hint: "word[-1]", solution: py`
word = "banana"
print(word[-1])` },
        { prompt: 'With `first = "Grace"` and `last = "Hopper"`, print the initials `GH`.', tests: [{ expected: "GH" }], hint: "first[0] + last[0]", solution: py`
first = "Grace"
last = "Hopper"
print(first[0] + last[0])` },
      ],
      quiz: [
        { q: "What is `\"code\"[1]`?", options: ["c", "o", "d", "e"], answer: 1, explain: "Index 0 is c, index 1 is o." },
        { q: "What is `\"code\"[-1]`?", options: ["c", "e", "d", "Error"], answer: 1, explain: "-1 is the last character." },
      ],
    },
    {
      id: "m4-slicing",
      title: "String slicing",
      minutes: 8,
      intro: `**Slicing** takes a piece of a string: \`text[start:stop]\`.

- It starts **at** \`start\`.
- It stops **before** \`stop\` (stop is not included).

For \`s = "PYTHON"\`: \`s[0:3]\` → \`"PYT"\`, \`s[2:5]\` → \`"THO"\`.

You can leave parts out:

- \`s[:3]\` — from the beginning → \`"PYT"\`
- \`s[3:]\` — to the end → \`"HON"\`
- \`s[-3:]\` — the last three → \`"HON"\`

A third number is the **step**: \`s[::2]\` takes every second character, and \`s[::-1]\` **reverses** the string.`,
      syntax: py`text[start:stop:step]`,
      examples: [
        { title: "Pieces of a date", code: py`
date = "2026-11-23"
print(date[:4])
print(date[5:7])
print(date[8:])` },
        { title: "Reversing", code: py`print("stressed"[::-1])` },
      ],
      realWorld: `Slicing extracts a year from a date, an area code from a phone number, or a file extension from a file name.`,
      mistakes: [
        { wrong: py`print("hello"[1:3])  # expecting "ell"`, right: py`print("hello"[1:4])`, why: "The stop index is not included. To get 3 characters starting at 1, stop at 4." },
      ],
      tryIt: py`
s = "Programming"
print(s[0:7])
print(s[-4:])
print(s[::-1])`,
      practice: [
        { prompt: 'With `s = "watermelon"`, print `water` using slicing.', tests: [{ expected: "water" }], hint: "s[:5]", solution: py`
s = "watermelon"
print(s[:5])` },
        { prompt: 'With `s = "watermelon"`, print `melon` using slicing.', tests: [{ expected: "melon" }], hint: "s[5:] or s[-5:]", solution: py`
s = "watermelon"
print(s[5:])` },
        { prompt: 'Print `"level up"` reversed.', tests: [{ expected: "pu level" }], hint: "Use [::-1].", solution: py`print("level up"[::-1])` },
      ],
      quiz: [
        { q: "What is `\"abcdef\"[1:4]`?", options: ["abcd", "bcd", "bcde", "abc"], answer: 1, explain: "Starts at index 1, stops before 4." },
        { q: "What does `s[::-1]` do?", options: ["Removes the last letter", "Reverses the string", "Returns the last letter", "Error"], answer: 1, explain: "A step of -1 walks backwards." },
      ],
    },
    {
      id: "m4-concat-len",
      title: "Concatenation, repetition and len()",
      minutes: 6,
      intro: `**Concatenation** means joining strings with \`+\`: \`"sun" + "flower"\` → \`"sunflower"\`. Python does not add spaces for you — include them yourself.

**Repetition** uses \`*\`: \`"ha" * 3\` → \`"hahaha"\`. Handy for drawing lines like \`"-" * 20\`.

**\`len()\`** tells you how many characters a string has, including spaces: \`len("hi there")\` → \`8\`.`,
      syntax: py`
full = "Hello" + " " + "World"
line = "=" * 10
size = len(full)`,
      examples: [
        { title: "Building a greeting", code: py`
first = "Maya"
greeting = "Hi, " + first + "!"
print(greeting)
print(len(greeting))` },
        { title: "A simple banner", code: py`
print("*" * 15)
print("  WELCOME")
print("*" * 15)` },
      ],
      realWorld: `Websites check \`len(password) >= 8\`, social apps limit post length, and receipts use repeated characters for separator lines.`,
      mistakes: [
        { wrong: py`print("Age: " + 15)`, right: py`print("Age: " + str(15))`, why: "You can only + strings with strings." },
      ],
      tryIt: py`
word = "Py"
print(word * 4)
print(len("Python is fun"))`,
      practice: [
        { prompt: 'Join `"fire"` and `"fly"` with `+` and print the result.', tests: [{ expected: "firefly" }], hint: 'print("fire" + "fly")', solution: py`print("fire" + "fly")` },
        { prompt: "Print a line of 12 dashes using repetition.", tests: [{ expected: "------------" }], hint: 'print("-" * 12)', solution: py`print("-" * 12)` },
        { prompt: 'Print the length of `"Hello, World!"`.', tests: [{ expected: "13" }], hint: "len() counts every character.", solution: py`print(len("Hello, World!"))` },
      ],
      quiz: [
        { q: "What is `len(\"a b\")`?", options: ["2", "3", "1", "Error"], answer: 1, explain: "The space counts as a character." },
        { q: "What is printed?", code: py`print("ab" * 2 + "c")`, options: ["abc abc", "ababc", "abcabc", "Error"], answer: 1, explain: "Repetition happens first, then concatenation." },
      ],
    },
    {
      id: "m4-case-strip",
      title: "upper(), lower() and strip()",
      minutes: 6,
      intro: `Strings come with built-in tools called **methods**. You use them with a dot: \`text.method()\`.

- \`.upper()\` — ALL CAPITALS
- \`.lower()\` — all lowercase
- \`.title()\` — Capital Letter For Each Word
- \`.strip()\` — removes spaces (and new lines) from **both ends**

Important: methods **do not change the original** string. They return a **new** string. Save it if you need it: \`name = name.strip()\`.`,
      syntax: py`
"Hello".upper()
"  hi  ".strip()`,
      examples: [
        { title: "Case-insensitive comparison", code: py`
answer = "YES"
print(answer.lower() == "yes")` },
        { title: "Cleaning messy input", code: py`
raw = "   alex   "
clean = raw.strip().title()
print("[" + clean + "]")` },
      ],
      realWorld: `Email addresses are compared in lowercase, and extra spaces users accidentally type are removed with strip() before saving.`,
      mistakes: [
        { wrong: py`
name = "bob"
name.upper()
print(name)`, right: py`
name = "bob"
name = name.upper()
print(name)`, why: "upper() returns a new string; the variable stays the same unless you reassign it." },
      ],
      tryIt: py`
city = "  new york "
print(city.strip().upper())
print(city.strip().title())`,
      practice: [
        { prompt: 'Print `"python"` in uppercase.', tests: [{ expected: "PYTHON" }], hint: ".upper()", solution: py`print("python".upper())` },
        { prompt: 'Clean `text = "   hello   "` with strip() and print it inside brackets like `[hello]`.', tests: [{ expected: "[hello]" }], hint: 'print("[" + text.strip() + "]")', solution: py`
text = "   hello   "
print("[" + text.strip() + "]")` },
        { prompt: 'With `reply = "YeS"`, print whether it equals `"yes"` ignoring case.', tests: [{ expected: "True" }], hint: "Compare reply.lower() with 'yes'.", solution: py`
reply = "YeS"
print(reply.lower() == "yes")` },
      ],
      quiz: [
        { q: "What does `\"Hi\".lower()` return?", options: ["HI", "hi", "Hi", "hI"], answer: 1, explain: "lower() makes every letter lowercase." },
        { q: "What does strip() remove?", options: ["All spaces", "Spaces at the start and end", "Vowels", "The first letter"], answer: 1, explain: "Only leading and trailing whitespace." },
      ],
    },
    {
      id: "m4-replace-split-find",
      title: "replace(), split() and find()",
      minutes: 8,
      intro: `Three more very useful string methods:

- **\`.replace(old, new)\`** — swaps every \`old\` piece with \`new\`: \`"I like cats".replace("cats", "dogs")\`.
- **\`.split(sep)\`** — cuts a string into a **list** of pieces. With no argument it splits on spaces: \`"a b c".split()\` → \`['a', 'b', 'c']\`. With \`","\` it splits on commas.
- **\`.find(sub)\`** — returns the index where \`sub\` first appears, or \`-1\` if it is not there.

Bonus: \`"sub" in text\` gives \`True\`/\`False\`, and \`"-".join(list)\` glues a list of strings back together.`,
      syntax: py`
text.replace("a", "b")
text.split(",")
text.find("word")`,
      examples: [
        { title: "Counting words", code: py`
sentence = "Python is easy to learn"
words = sentence.split()
print(words)
print(len(words))` },
        { title: "Find and replace", code: py`
msg = "Hello Sam"
print(msg.find("Sam"))
print(msg.replace("Sam", "Lee"))` },
      ],
      realWorld: `Spreadsheet (CSV) rows are split by commas, search boxes use find(), and text editors offer "Find and Replace".`,
      mistakes: [
        { wrong: py`
s = "a-b"
s.replace("-", "+")
print(s)`, right: py`
s = "a-b"
s = s.replace("-", "+")
print(s)`, why: "Like all string methods, replace() returns a new string." },
      ],
      tryIt: py`
data = "red,green,blue"
colors = data.split(",")
print(colors)
print(" & ".join(colors))`,
      practice: [
        { prompt: 'Replace `"bad"` with `"good"` in `"a bad day"` and print it.', tests: [{ expected: "a good day" }], hint: '.replace("bad", "good")', solution: py`print("a bad day".replace("bad", "good"))` },
        { prompt: 'Split `"one two three four"` into words and print how many words there are.', tests: [{ expected: "4" }], hint: "len(text.split())", solution: py`print(len("one two three four".split()))` },
        { prompt: 'Print the index where `"world"` starts in `"hello world"`.', tests: [{ expected: "6" }], hint: '.find("world")', solution: py`print("hello world".find("world"))` },
      ],
      quiz: [
        { q: "What does `\"a,b,c\".split(\",\")` return?", options: ["'abc'", "['a', 'b', 'c']", "['a,b,c']", "3"], answer: 1, explain: "split returns a list of the pieces." },
        { q: "What does `\"cat\".find(\"z\")` return?", options: ["0", "None", "-1", "Error"], answer: 2, explain: "find returns -1 when the text is not found." },
      ],
    },
    {
      id: "m4-fstrings",
      title: "f-strings and string formatting",
      minutes: 9,
      intro: `Joining text with \`+\` and \`str()\` gets messy. **f-strings** are the modern, clean way to put values into text.

Put an \`f\` before the quotes and write variables inside **curly braces** \`{ }\`:

\`f"My name is {name} and I am {age}"\`

You can put **any expression** inside the braces: \`f"{price * 2}"\`.

**Formatting numbers:**

- \`{value:.2f}\` — 2 decimal places: \`3.14159\` → \`3.14\`
- \`{value:,}\` — thousands separator: \`1000000\` → \`1,000,000\`
- \`{text:>10}\` — right-align in 10 spaces, \`{text:<10}\` left-align, \`{text:^10}\` centre

The older \`"{}".format(x)\` method works too, but f-strings are easier.`,
      syntax: py`
name = "Ali"
print(f"Hello, {name}!")
print(f"{3.14159:.2f}")`,
      examples: [
        { title: "Receipt line", code: py`
item = "Coffee"
price = 3.5
qty = 3
print(f"{qty} x {item} = {price * qty:.2f}")` },
        { title: "Big numbers", code: py`
followers = 1534000
print(f"{followers:,} followers")` },
      ],
      realWorld: `Every app message with your name or a price — "Hi Sara, your total is $12.50" — is built with formatting like this.`,
      mistakes: [
        { wrong: py`print("Hello {name}")`, right: py`print(f"Hello {name}")`, why: "Without the f, Python prints the braces literally." },
      ],
      tryIt: py`
player = "Nova"
score = 1234.5678
print(f"{player} scored {score:.1f} points")
print(f"[{player:^10}]")`,
      practice: [
        { prompt: 'With `name = "Kai"` and `age = 12`, print `Kai is 12 years old` using an f-string.', tests: [{ expected: "Kai is 12 years old" }], hint: 'f"{name} is {age} years old"', solution: py`
name = "Kai"
age = 12
print(f"{name} is {age} years old")` },
        { prompt: "With `pi = 3.14159265`, print it with exactly 3 decimal places.", tests: [{ expected: "3.142" }], hint: 'f"{pi:.3f}"', solution: py`
pi = 3.14159265
print(f"{pi:.3f}")` },
        { prompt: "With `a = 7` and `b = 6`, print `7 x 6 = 42` using one f-string with a calculation inside.", tests: [{ expected: "7 x 6 = 42" }], hint: 'f"{a} x {b} = {a * b}"', solution: py`
a = 7
b = 6
print(f"{a} x {b} = {a * b}")` },
      ],
      quiz: [
        { q: "What is printed?", code: py`
x = 5
print(f"{x * 2}")`, options: ["x * 2", "10", "{x * 2}", "52"], answer: 1, explain: "Expressions in braces are evaluated." },
        { q: "What does `f\"{2.5:.2f}\"` produce?", options: ["2.5", "2.50", "3", "2.500"], answer: 1, explain: ".2f means exactly two decimal places." },
      ],
    },
    {
      id: "m4-string-mistakes",
      title: "Common string mistakes",
      minutes: 7,
      intro: `Let's review the string mistakes beginners make most often, so you can recognise them instantly:

- **Mixing str and int with +** → \`TypeError\`. Fix with \`str()\` or an f-string.
- **Forgetting methods return a new string** — \`text.upper()\` alone changes nothing.
- **Off-by-one in slicing** — the stop index is not included.
- **Index out of range** — the last index is \`len(s) - 1\`.
- **Strings are immutable** — you cannot change one character with \`s[0] = "X"\`. Build a new string instead: \`"X" + s[1:]\`.
- **Unmatched quotes** → \`SyntaxError\`.`,
      syntax: py`
s = "hello"
s = "H" + s[1:]   # build a new string
print(s)`,
      examples: [
        { title: "Strings cannot be changed in place", code: py`
word = "cat"
word = "b" + word[1:]
print(word)` },
        { title: "Safe last character", code: py`
s = "python"
print(s[len(s) - 1])
print(s[-1])` },
      ],
      realWorld: `Most bugs in beginner projects with text come from these six mistakes. Knowing them saves hours of debugging.`,
      mistakes: [
        { wrong: py`
s = "hat"
s[0] = "c"`, right: py`
s = "hat"
s = "c" + s[1:]`, why: "Strings are immutable: item assignment raises TypeError." },
      ],
      tryIt: py`
name = "sam"
name = name[0].upper() + name[1:]
print(name)`,
      practice: [
        { prompt: "Fix the TypeError so this prints `You have 3 messages`.", starter: py`
count = 3
print("You have " + count + " messages")`, tests: [{ expected: "You have 3 messages" }], hint: "Use str(count) or an f-string.", solution: py`
count = 3
print(f"You have {count} messages")` },
        { prompt: 'Change `word = "mouse"` into `"house"` by building a new string (strings cannot be edited in place). Print it.', starter: py`
word = "mouse"
`, tests: [{ expected: "house" }], hint: '"h" + word[1:]', solution: py`
word = "mouse"
word = "h" + word[1:]
print(word)` },
        { prompt: "This should print `HELLO` but prints `hello`. Fix it.", starter: py`
msg = "hello"
msg.upper()
print(msg)`, tests: [{ expected: "HELLO" }], hint: "Save the result: msg = msg.upper()", solution: py`
msg = "hello"
msg = msg.upper()
print(msg)` },
      ],
      quiz: [
        { q: "What happens with `s = \"abc\"; s[0] = \"z\"`?", options: ["s becomes zbc", "TypeError", "Nothing", "s becomes z"], answer: 1, explain: "Strings are immutable; item assignment is not allowed." },
        { q: "For `s = \"hello\"`, what is the last valid positive index?", options: ["5", "4", "6", "-1"], answer: 1, explain: "len is 5, so indexes are 0–4." },
      ],
    },
  ],
};
