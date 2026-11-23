import type { Module } from "../types";
import { out, py } from "../helpers";

export const m08: Module = {
  id: "m8",
  number: 8,
  title: "Data Structures",
  description: "Organise data with lists, tuples, sets and dictionaries.",
  icon: "layers",
  lessons: [
    {
      id: "m8-lists",
      title: "Lists and accessing elements",
      minutes: 8,
      intro: `A **list** stores many values in **one** variable, in order. Write it with square brackets and commas:

\`fruits = ["apple", "banana", "cherry"]\`

- Lists can hold any type, even mixed: \`[1, "two", 3.0, True]\`.
- Items are accessed by **index**, starting at 0: \`fruits[0]\` → \`"apple"\`.
- Negative indexes count from the end: \`fruits[-1]\` → \`"cherry"\`.
- \`len(fruits)\` gives the number of items.
- Lists are **mutable**: you can change an item: \`fruits[1] = "kiwi"\`.
- \`"apple" in fruits\` checks if a value is in the list.`,
      syntax: py`
my_list = [item1, item2, item3]
my_list[0]
my_list[1] = new_value`,
      examples: [
        { title: "Accessing and changing", code: py`
colors = ["red", "green", "blue"]
print(colors[0])
colors[2] = "purple"
print(colors)
print(len(colors))` },
        { title: "Membership", code: py`
guests = ["Ana", "Ben", "Chen"]
print("Ben" in guests)
print("Dan" in guests)` },
      ],
      realWorld: `A playlist of songs, the messages in a chat, the products in a cart — all naturally stored as lists.`,
      mistakes: [
        { wrong: py`
nums = [10, 20, 30]
print(nums[3])`, right: py`
nums = [10, 20, 30]
print(nums[2])`, why: "A list of 3 items has indexes 0, 1, 2. nums[3] raises IndexError." },
      ],
      tryIt: py`
scores = [88, 92, 79]
print("First:", scores[0])
print("Last:", scores[-1])
scores[0] = 90
print(scores)`,
      practice: [
        { prompt: "Create a list `planets` with `Mercury`, `Venus`, `Earth` and print the third planet.", tests: [{ expected: "Earth" }], hint: "Index 2.", solution: py`
planets = ["Mercury", "Venus", "Earth"]
print(planets[2])` },
        { prompt: 'Given `pets = ["cat", "dog", "fish"]`, change `"dog"` to `"hamster"` and print the list.', tests: [{ expected: "['cat', 'hamster', 'fish']" }], hint: 'pets[1] = "hamster"', solution: py`
pets = ["cat", "dog", "fish"]
pets[1] = "hamster"
print(pets)` },
        { prompt: 'Given `nums = [3, 1, 4, 1, 5, 9]`, print how many items it has and its last item, on two lines.', tests: [{ expected: out(6, 9) }], hint: "len(nums) and nums[-1]", solution: py`
nums = [3, 1, 4, 1, 5, 9]
print(len(nums))
print(nums[-1])` },
      ],
      quiz: [
        { q: "What is `[\"a\", \"b\", \"c\"][1]`?", options: ["a", "b", "c", "Error"], answer: 1, explain: "Index 1 is the second item." },
        { q: "Can you change an item in a list?", options: ["Yes, lists are mutable", "No, lists are immutable"], answer: 0, explain: "Unlike strings, lists can be changed." },
      ],
    },
    {
      id: "m8-list-slicing",
      title: "List indexing and slicing",
      minutes: 6,
      intro: `Slicing works on lists exactly like on strings: \`my_list[start:stop:step]\`.

- \`nums[1:4]\` → items at index 1, 2, 3
- \`nums[:3]\` → first three
- \`nums[-2:]\` → last two
- \`nums[::-1]\` → reversed copy

A slice gives you a **new list**. The original is unchanged.

\`nums[:]\` is a quick way to make a **copy** of a list.`,
      syntax: py`
part = nums[1:4]
copy = nums[:]`,
      examples: [
        { title: "Top three", code: py`
ranking = ["Ann", "Bo", "Cy", "Di", "Ed"]
print(ranking[:3])
print(ranking[-2:])` },
        { title: "Every other item", code: py`
nums = [0, 1, 2, 3, 4, 5, 6]
print(nums[::2])
print(nums[::-1])` },
      ],
      realWorld: `Showing "the latest 10 messages" or "page 2 of search results" is done with slicing.`,
      mistakes: [
        { wrong: py`
a = [1, 2, 3]
b = a
b.append(4)
print(a)`, right: py`
a = [1, 2, 3]
b = a[:]
b.append(4)
print(a)`, why: "b = a does not copy — both names point to the same list. Use a[:] to copy." },
      ],
      tryIt: py`
days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
print("Weekdays:", days[:5])
print("Weekend:", days[5:])`,
      practice: [
        { prompt: "Given `nums = [10, 20, 30, 40, 50]`, print the middle three items as a list.", tests: [{ expected: "[20, 30, 40]" }], hint: "nums[1:4]", solution: py`
nums = [10, 20, 30, 40, 50]
print(nums[1:4])` },
        { prompt: "Given `letters = ['a', 'b', 'c', 'd']`, print the list reversed using slicing.", tests: [{ expected: "['d', 'c', 'b', 'a']" }], hint: "[::-1]", solution: py`
letters = ['a', 'b', 'c', 'd']
print(letters[::-1])` },
        { prompt: "Given `scores = [5, 8, 2, 9, 7, 3]`, print the last three scores.", tests: [{ expected: "[9, 7, 3]" }], hint: "scores[-3:]", solution: py`
scores = [5, 8, 2, 9, 7, 3]
print(scores[-3:])` },
      ],
      quiz: [
        { q: "What is `[1, 2, 3, 4][:2]`?", options: ["[1, 2]", "[1, 2, 3]", "[3, 4]", "2"], answer: 0, explain: "From the start up to (not including) index 2." },
        { q: "Does slicing change the original list?", options: ["Yes", "No, it creates a new list"], answer: 1, explain: "Slices are new lists." },
      ],
    },
    {
      id: "m8-adding-items",
      title: "Adding items: append() and insert()",
      minutes: 6,
      intro: `Lists can grow:

- **\`.append(x)\`** adds \`x\` to the **end**.
- **\`.insert(i, x)\`** puts \`x\` at position \`i\`, shifting the rest to the right.
- **\`.extend(other)\`** adds every item of another list.

A very common pattern: start with an **empty list** \`[]\` and \`append\` items in a loop.

Note: these methods change the list **in place** and return \`None\`. So write \`nums.append(5)\`, not \`nums = nums.append(5)\`.`,
      syntax: py`
items = []
items.append("x")
items.insert(0, "first")`,
      examples: [
        { title: "Building a list", code: py`
squares = []
for n in range(1, 6):
    squares.append(n * n)
print(squares)` },
        { title: "Insert at the front", code: py`
queue = ["Ben", "Cara"]
queue.insert(0, "Ava")
print(queue)` },
      ],
      realWorld: `Adding a song to a playlist (append) or putting an urgent task at the top of a to-do list (insert at 0).`,
      mistakes: [
        { wrong: py`
nums = [1, 2]
nums = nums.append(3)
print(nums)`, right: py`
nums = [1, 2]
nums.append(3)
print(nums)`, why: "append returns None, so the first version replaces your list with None." },
      ],
      tryIt: py`
todo = []
todo.append("study")
todo.append("exercise")
todo.insert(0, "breakfast")
print(todo)`,
      practice: [
        { prompt: 'Start with `cart = ["milk"]`, append `"eggs"` and `"bread"`, then print the list.', tests: [{ expected: "['milk', 'eggs', 'bread']" }], hint: "Two .append() calls.", solution: py`
cart = ["milk"]
cart.append("eggs")
cart.append("bread")
print(cart)` },
        { prompt: "Read n and build a list of the numbers 1..n using append in a loop. Print the list.", tests: [{ input: ["4"], expected: "[1, 2, 3, 4]" }, { input: ["1"], expected: "[1]" }], hint: "nums = [] then for i in range(1, n + 1): nums.append(i)", solution: py`
n = int(input())
nums = []
for i in range(1, n + 1):
    nums.append(i)
print(nums)` },
        { prompt: 'Given `line = ["B", "C"]`, insert `"A"` at the start and print the list.', tests: [{ expected: "['A', 'B', 'C']" }], hint: 'line.insert(0, "A")', solution: py`
line = ["B", "C"]
line.insert(0, "A")
print(line)` },
      ],
      quiz: [
        { q: "Where does append() add an item?", options: ["At the start", "At the end", "In the middle", "Randomly"], answer: 1, explain: "append always adds to the end." },
        { q: "What does `[1, 3].insert(1, 2)` produce for the list?", options: ["[2, 1, 3]", "[1, 2, 3]", "[1, 3, 2]"], answer: 1, explain: "Inserts 2 at index 1." },
      ],
    },
    {
      id: "m8-removing-items",
      title: "Removing items: remove() and pop()",
      minutes: 6,
      intro: `Lists can shrink too:

- **\`.remove(x)\`** removes the **first item equal to** \`x\`. If \`x\` is not there → **ValueError**.
- **\`.pop()\`** removes and **returns** the **last** item.
- **\`.pop(i)\`** removes and returns the item at index \`i\`.
- **\`del nums[i]\`** deletes the item at index \`i\`.
- **\`.clear()\`** empties the list.

Use \`remove\` when you know the **value**, \`pop\` when you know the **position** (or want the item back).`,
      syntax: py`
items.remove("apple")
last = items.pop()
first = items.pop(0)`,
      examples: [
        { title: "remove by value", code: py`
pets = ["cat", "dog", "cat"]
pets.remove("cat")
print(pets)`, note: "Only the first cat is removed." },
        { title: "pop to take items", code: py`
stack = ["a", "b", "c"]
top = stack.pop()
print(top)
print(stack)` },
      ],
      realWorld: `Removing an item from a cart (remove), or an "undo" feature that takes the last action off a stack (pop).`,
      mistakes: [
        { wrong: py`
nums = [1, 2, 3]
nums.remove(5)`, right: py`
nums = [1, 2, 3]
if 5 in nums:
    nums.remove(5)`, why: "Removing a value that is not in the list raises ValueError. Check with in first." },
      ],
      tryIt: py`
tasks = ["wash", "cook", "read"]
done = tasks.pop(0)
print("Done:", done)
tasks.remove("read")
print("Left:", tasks)`,
      practice: [
        { prompt: 'Given `fruits = ["apple", "banana", "cherry"]`, remove `"banana"` and print the list.', tests: [{ expected: "['apple', 'cherry']" }], hint: '.remove("banana")', solution: py`
fruits = ["apple", "banana", "cherry"]
fruits.remove("banana")
print(fruits)` },
        { prompt: "Given `nums = [5, 10, 15]`, pop the last item, print the popped item, then print the list.", tests: [{ expected: out(15, "[5, 10]") }], hint: "x = nums.pop()", solution: py`
nums = [5, 10, 15]
x = nums.pop()
print(x)
print(nums)` },
        { prompt: 'Read a name. If it is in `guests = ["Ana", "Ben", "Cy"]`, remove it. Print the list either way.', tests: [{ input: ["Ben"], expected: "['Ana', 'Cy']" }, { input: ["Zoe"], expected: "['Ana', 'Ben', 'Cy']" }], hint: "if name in guests: guests.remove(name)", solution: py`
guests = ["Ana", "Ben", "Cy"]
name = input()
if name in guests:
    guests.remove(name)
print(guests)` },
      ],
      quiz: [
        { q: "What does `pop()` return?", options: ["Nothing", "The removed item", "The new length", "True"], answer: 1, explain: "pop removes the item and gives it back." },
        { q: "What happens with `[1, 2].remove(3)`?", options: ["Nothing", "ValueError", "IndexError", "Removes the last item"], answer: 1, explain: "3 is not in the list." },
      ],
    },
    {
      id: "m8-sort-reverse",
      title: "sort() and reverse()",
      minutes: 6,
      intro: `Ordering lists:

- **\`.sort()\`** sorts the list **in place** from smallest to largest (or A→Z).
- **\`.sort(reverse=True)\`** sorts from largest to smallest.
- **\`.reverse()\`** flips the current order (it does not sort).
- **\`sorted(list)\`** returns a **new** sorted list and leaves the original unchanged.

Useful helpers: \`min(list)\`, \`max(list)\`, \`sum(list)\`.

Note: uppercase letters sort before lowercase letters (\`"Z" < "a"\`).`,
      syntax: py`
nums.sort()
nums.sort(reverse=True)
new_list = sorted(nums)`,
      examples: [
        { title: "Sorting scores", code: py`
scores = [72, 95, 88, 60]
scores.sort(reverse=True)
print(scores)
print("Best:", max(scores), "Total:", sum(scores))` },
        { title: "sorted() keeps the original", code: py`
names = ["Zoe", "adam", "Mia"]
print(sorted(names))
print(names)` },
      ],
      realWorld: `Leaderboards sort by score, shops sort by price, and file explorers sort by name or date.`,
      mistakes: [
        { wrong: py`
nums = [3, 1, 2]
nums = nums.sort()
print(nums)`, right: py`
nums = [3, 1, 2]
nums.sort()
print(nums)`, why: "sort() returns None. Either sort in place, or use sorted(nums)." },
      ],
      tryIt: py`
words = ["pear", "apple", "fig"]
print(sorted(words))
words.reverse()
print(words)`,
      practice: [
        { prompt: "Given `nums = [9, 2, 7, 4]`, sort it in ascending order and print it.", tests: [{ expected: "[2, 4, 7, 9]" }], hint: "nums.sort()", solution: py`
nums = [9, 2, 7, 4]
nums.sort()
print(nums)` },
        { prompt: "Given `scores = [50, 80, 65]`, print it sorted from highest to lowest.", tests: [{ expected: "[80, 65, 50]" }], hint: "sort(reverse=True)", solution: py`
scores = [50, 80, 65]
scores.sort(reverse=True)
print(scores)` },
        { prompt: "Given `temps = [21, 25, 19, 30, 22]`, print the min, the max and the average (sum / len) on three lines.", tests: [{ expected: out(19, 30, "23.4") }], hint: "min(), max(), sum(temps) / len(temps)", solution: py`
temps = [21, 25, 19, 30, 22]
print(min(temps))
print(max(temps))
print(sum(temps) / len(temps))` },
      ],
      quiz: [
        { q: "What is the difference between sort() and sorted()?", options: ["No difference", "sort() changes the list; sorted() returns a new list", "sorted() changes the list", "sort() only works on strings"], answer: 1, explain: "sort is in place; sorted creates a new list." },
        { q: "What does reverse() do to [1, 3, 2]?", options: ["[3, 2, 1]", "[2, 3, 1]", "[1, 2, 3]"], answer: 1, explain: "reverse flips the order without sorting." },
      ],
    },
    {
      id: "m8-tuples",
      title: "Tuples",
      minutes: 6,
      intro: `A **tuple** is like a list that **cannot be changed** (it is **immutable**). Use round brackets:

\`point = (3, 5)\`

- Access items by index: \`point[0]\` → \`3\`.
- You cannot add, remove or change items — trying gives a TypeError.
- **Unpacking**: \`x, y = point\` puts 3 in x and 5 in y.
- A tuple with one item needs a comma: \`(7,)\`.

Use tuples for data that belongs together and should stay fixed: coordinates, RGB colours, dates.`,
      syntax: py`
point = (3, 5)
x, y = point`,
      examples: [
        { title: "Coordinates", code: py`
location = (41.3, 69.2)
lat, lon = location
print("Latitude:", lat)
print("Longitude:", lon)` },
        { title: "A function-style result", code: py`
size = (1920, 1080)
print(f"{size[0]}x{size[1]}")
print(len(size))` },
      ],
      realWorld: `Map apps store a location as a (latitude, longitude) tuple; colours are stored as (red, green, blue).`,
      mistakes: [
        { wrong: py`
rgb = (255, 0, 0)
rgb[1] = 128`, right: py`
rgb = (255, 0, 0)
rgb = (255, 128, 0)`, why: "Tuples cannot be modified. Create a new tuple instead." },
      ],
      tryIt: py`
person = ("Ava", 14, "Tashkent")
name, age, city = person
print(name, "is", age, "and lives in", city)`,
      practice: [
        { prompt: "Create a tuple `rgb = (255, 165, 0)` and print its second value.", tests: [{ expected: "165" }], hint: "rgb[1]", solution: py`
rgb = (255, 165, 0)
print(rgb[1])` },
        { prompt: "Unpack `point = (4, 9)` into `x` and `y` and print `x=4 y=9`.", tests: [{ expected: "x=4 y=9" }], hint: "x, y = point", solution: py`
point = (4, 9)
x, y = point
print(f"x={x} y={y}")` },
        { prompt: "Given `days = (\"Mon\", \"Tue\", \"Wed\")`, print how many items it has and whether `\"Tue\"` is in it.", tests: [{ expected: out(3, "True") }], hint: "len() and in work on tuples.", solution: py`
days = ("Mon", "Tue", "Wed")
print(len(days))
print("Tue" in days)` },
      ],
      quiz: [
        { q: "What is the main difference between a tuple and a list?", options: ["Tuples are faster to type", "Tuples cannot be changed", "Tuples hold only numbers", "Lists use round brackets"], answer: 1, explain: "Tuples are immutable." },
        { q: "Which is a one-item tuple?", options: ["(5)", "(5,)", "[5]", "{5}"], answer: 1, explain: "The comma makes it a tuple; (5) is just the number 5." },
      ],
    },
    {
      id: "m8-sets",
      title: "Sets",
      minutes: 6,
      intro: `A **set** is a collection of **unique** items with **no order**. Use curly braces:

\`tags = {"python", "code", "python"}\` → \`{"python", "code"}\` (duplicates disappear).

- \`.add(x)\` adds an item, \`.remove(x)\` / \`.discard(x)\` removes one.
- Sets have no indexes — \`tags[0]\` does not work.
- \`set(my_list)\` quickly removes duplicates from a list.
- Set math: \`a | b\` (union, all items), \`a & b\` (intersection, items in both), \`a - b\` (difference).

An empty set is \`set()\` — \`{}\` creates an empty dictionary!`,
      syntax: py`
s = {1, 2, 3}
s.add(4)
unique = set([1, 1, 2])`,
      examples: [
        { title: "Removing duplicates", code: py`
visits = ["ana", "ben", "ana", "cy", "ben"]
unique = set(visits)
print(len(unique))` },
        { title: "Common friends", code: py`
mine = {"Ali", "Bea", "Cal"}
yours = {"Bea", "Cal", "Dov"}
print(sorted(mine & yours))
print(sorted(mine | yours))` },
      ],
      realWorld: `Counting unique visitors to a website, or finding mutual friends on a social network, are classic set problems.`,
      mistakes: [
        { wrong: py`empty = {}`, right: py`empty = set()`, why: "{} is an empty dictionary, not a set." },
      ],
      tryIt: py`
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(a & b)
print(a - b)`,
      practice: [
        { prompt: "Given `nums = [1, 2, 2, 3, 3, 3]`, print how many **unique** values there are.", tests: [{ expected: "3" }], hint: "len(set(nums))", solution: py`
nums = [1, 2, 2, 3, 3, 3]
print(len(set(nums)))` },
        { prompt: "Given `a = {1, 2, 3}` and `b = {2, 3, 4}`, print the items in both as a sorted list.", tests: [{ expected: "[2, 3]" }], hint: "sorted(a & b)", solution: py`
a = {1, 2, 3}
b = {2, 3, 4}
print(sorted(a & b))` },
        { prompt: "Read a sentence and print the number of **different** words in it.", tests: [{ input: ["the cat and the hat"], expected: "4" }, { input: ["a a a"], expected: "1" }], hint: "len(set(sentence.split()))", solution: py`
s = input()
print(len(set(s.split())))` },
      ],
      quiz: [
        { q: "What is `len({1, 1, 2})`?", options: ["3", "2", "1"], answer: 1, explain: "Duplicates are removed in a set." },
        { q: "How do you create an empty set?", options: ["{}", "set()", "[]", "()"], answer: 1, explain: "{} is an empty dict." },
      ],
    },
    {
      id: "m8-dictionaries",
      title: "Dictionaries, keys and values",
      minutes: 10,
      intro: `A **dictionary** (\`dict\`) stores **key → value** pairs, like a real dictionary stores word → meaning.

\`student = {"name": "Ana", "age": 15}\`

- Get a value by its **key**: \`student["name"]\` → \`"Ana"\`.
- Add or change: \`student["grade"] = 10\`.
- A missing key raises **KeyError**. Use \`student.get("email")\` to get \`None\` instead, or \`.get("email", "none")\` for a default.
- Remove: \`del student["age"]\` or \`student.pop("age")\`.
- \`"name" in student\` checks if a **key** exists.

Looping:

- \`for key in d:\` — keys
- \`d.values()\` — values
- \`for key, value in d.items():\` — both`,
      syntax: py`
d = {"key": "value"}
d["new_key"] = 42
for k, v in d.items():
    print(k, v)`,
      examples: [
        { title: "A phone book", code: py`
phones = {"Ana": "555-1234", "Ben": "555-9876"}
print(phones["Ana"])
phones["Cy"] = "555-0000"
print(len(phones))` },
        { title: "Counting with a dict", code: py`
counts = {}
for fruit in ["apple", "kiwi", "apple"]:
    counts[fruit] = counts.get(fruit, 0) + 1
print(counts)` },
      ],
      realWorld: `User profiles, product details, settings and almost all data sent between websites (JSON) are dictionaries.`,
      mistakes: [
        { wrong: py`
user = {"name": "Ana"}
print(user["email"])`, right: py`
user = {"name": "Ana"}
print(user.get("email", "no email"))`, why: "Accessing a missing key raises KeyError. get() returns a default instead." },
      ],
      tryIt: py`
prices = {"tea": 2.5, "cake": 4.0}
for item, price in prices.items():
    print(f"{item}: {price:.2f}")`,
      practice: [
        { prompt: 'Create `capitals = {"France": "Paris", "Japan": "Tokyo"}` and print the capital of Japan.', tests: [{ expected: "Tokyo" }], hint: 'capitals["Japan"]', solution: py`
capitals = {"France": "Paris", "Japan": "Tokyo"}
print(capitals["Japan"])` },
        { prompt: 'Given `stock = {"apples": 5}`, add `"pears": 3`, change apples to 10, and print the dict.', tests: [{ expected: "{'apples': 10, 'pears': 3}" }], hint: 'stock["pears"] = 3', solution: py`
stock = {"apples": 5}
stock["pears"] = 3
stock["apples"] = 10
print(stock)` },
        { prompt: 'Read a word. Using `ages = {"ana": 15, "ben": 17}`, print the age, or `unknown` if the name is not a key.', tests: [{ input: ["ben"], expected: "17" }, { input: ["zed"], expected: "unknown" }], hint: 'ages.get(name, "unknown")', solution: py`
ages = {"ana": 15, "ben": 17}
name = input()
print(ages.get(name, "unknown"))` },
      ],
      quiz: [
        { q: "What does `{\"a\": 1}[\"b\"]` raise?", options: ["IndexError", "KeyError", "ValueError", "Nothing"], answer: 1, explain: "Missing keys raise KeyError." },
        { q: "What does `.items()` give you when looping?", options: ["Only keys", "Only values", "Key and value pairs", "Indexes"], answer: 2, explain: "items() yields (key, value) pairs." },
      ],
    },
    {
      id: "m8-nested-choosing",
      title: "Nested data and choosing the right structure",
      minutes: 9,
      intro: `Data structures can contain other data structures — this is **nesting**:

- A **list of dicts**: many records, e.g. many students.
- A **dict of lists**: each key has several values, e.g. a student's grades.

Access nested data step by step: \`students[0]["name"]\` → first student's name.

**Which structure should I use?**

- **list** — ordered items, duplicates allowed, will change (to-do list).
- **tuple** — fixed group of values that should not change (coordinates).
- **set** — unique items, fast "is it in there?" checks (visited pages).
- **dict** — look things up by a name/key (phone book, user profile).`,
      syntax: py`
students = [
    {"name": "Ana", "grades": [90, 85]},
    {"name": "Ben", "grades": [70, 95]},
]
print(students[1]["grades"][0])`,
      examples: [
        { title: "List of dictionaries", code: py`
books = [
    {"title": "Dune", "year": 1965},
    {"title": "Neuromancer", "year": 1984},
]
for b in books:
    print(f"{b['title']} ({b['year']})")` },
        { title: "Dictionary of lists", code: py`
grades = {"Ana": [90, 85, 77], "Ben": [60, 75]}
for name, marks in grades.items():
    print(name, sum(marks) / len(marks))` },
      ],
      realWorld: `A music app stores playlists (dict) that contain lists of songs, where each song is a dict with title, artist and length.`,
      mistakes: [
        { wrong: py`print(books["title"])`, right: py`print(books[0]["title"])`, why: "books is a list: first pick an item by index, then a key." },
      ],
      tryIt: py`
team = {"name": "Owls", "players": ["Ann", "Raj", "Li"]}
print(team["name"], "has", len(team["players"]), "players")
print("Captain:", team["players"][0])`,
      practice: [
        { prompt: 'Given `people = [{"name": "Ana", "age": 15}, {"name": "Ben", "age": 17}]`, print the second person\'s name.', tests: [{ expected: "Ben" }], hint: 'people[1]["name"]', solution: py`
people = [{"name": "Ana", "age": 15}, {"name": "Ben", "age": 17}]
print(people[1]["name"])` },
        { prompt: 'Given `scores = {"math": [80, 90], "art": [70, 100, 85]}`, print the total of all art scores.', tests: [{ expected: "255" }], hint: 'sum(scores["art"])', solution: py`
scores = {"math": [80, 90], "art": [70, 100, 85]}
print(sum(scores["art"]))` },
        { prompt: 'Given the people list from task 1, loop through it and print each name followed by the age, like `Ana 15`.', tests: [{ expected: out("Ana 15", "Ben 17") }], hint: 'for p in people: print(p["name"], p["age"])', solution: py`
people = [{"name": "Ana", "age": 15}, {"name": "Ben", "age": 17}]
for p in people:
    print(p["name"], p["age"])` },
      ],
      quiz: [
        { q: "Which structure is best for storing unique visitor IDs?", options: ["list", "tuple", "set", "string"], answer: 2, explain: "Sets automatically keep items unique." },
        { q: "Which is best for looking up a phone number by name?", options: ["list", "dict", "tuple", "set"], answer: 1, explain: "Dicts map keys (names) to values (numbers)." },
      ],
    },
  ],
};
