/**
 * PyNest Arena problem bank (source of truth for the SQL seed).
 * `npm run build:problems` runs every reference solution in real Python (Pyodide),
 * checks the examples, computes expected outputs for every test and writes
 * supabase/migrations/0010_problems_seed.sql.
 */
export interface ProblemSource {
  id: number;
  title: string;
  rating: number;
  tags: string[];
  visibility: "public" | "hidden";
  statement: string;
  input: string;
  output: string;
  notes?: string;
  examples: { input: string; output: string }[];
  tests: string[]; // extra hidden test inputs (examples are always tests 1..k)
  solution: string;
  timeLimitMs?: number;
}

// Small deterministic RNG so tests are the same on every build.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const R = rng(20261124);
const int = (lo: number, hi: number) => lo + Math.floor(R() * (hi - lo + 1));
const arr = (n: number, lo: number, hi: number) => Array.from({ length: n }, () => int(lo, hi));
const word = (lo: number, hi: number, alpha = "abcdefghijklmnopqrstuvwxyz") =>
  Array.from({ length: int(lo, hi) }, () => alpha[int(0, alpha.length - 1)]).join("");
const lines = (...l: (string | number)[]) => l.join("\n") + "\n";

export const PROBLEMS: ProblemSource[] = [
  // ------------------------------------------------------------------ public problemset
  {
    id: 1001, title: "Hello, Nest", rating: 800, tags: ["implementation", "strings"], visibility: "public",
    statement: "Every new bird in the nest gets a greeting. Read a name and greet it.",
    input: "A single line with a name: 1 to 30 English letters.",
    output: "Print `Hello, NAME!` where NAME is the given name.",
    examples: [{ input: "Ada\n", output: "Hello, Ada!" }, { input: "Guido\n", output: "Hello, Guido!" }],
    tests: ["X\n", "Monty\n", "abcdefghijklmnopqrstuvwxyzABCD\n", "Pythonista\n"],
    solution: `name = input().strip()\nprint(f"Hello, {name}!")`,
  },
  {
    id: 1002, title: "Two Numbers", rating: 800, tags: ["math", "implementation"], visibility: "public",
    statement: "Read two integers and print their sum. Python integers never overflow, so the numbers can be huge.",
    input: "One line with two integers a and b (−10^18 ≤ a, b ≤ 10^18), separated by a space.",
    output: "Print a + b.",
    examples: [{ input: "2 3\n", output: "5" }, { input: "-7 7\n", output: "0" }],
    tests: ["200000000000000000 200000000000000000\n", "-200000000000000000 1\n", "0 0\n", `${int(-1e9, 1e9)} ${int(-1e9, 1e9)}\n`],
    solution: `a, b = map(int, input().split())\nprint(a + b)`,
  },
  {
    id: 1003, title: "Even or Odd", rating: 800, tags: ["math"], visibility: "public",
    statement: "Decide whether a number is even or odd.",
    input: "One integer n (−10^9 ≤ n ≤ 10^9).",
    output: "Print `EVEN` if n is even, otherwise print `ODD`.",
    examples: [{ input: "4\n", output: "EVEN" }, { input: "7\n", output: "ODD" }],
    tests: ["0\n", "-3\n", "-8\n", "200000000\n", "999999999\n"],
    solution: `n = int(input())\nprint("EVEN" if n % 2 == 0 else "ODD")`,
  },
  {
    id: 1004, title: "Tallest of Three", rating: 800, tags: ["implementation"], visibility: "public",
    statement: "Three friends measured their heights. Who is the tallest? Print the largest of three numbers.",
    input: "One line with three integers (1 ≤ each ≤ 300).",
    output: "Print the largest of the three.",
    examples: [{ input: "150 172 168\n", output: "172" }, { input: "5 5 5\n", output: "5" }],
    tests: ["300 1 2\n", "1 2 300\n", "2 300 1\n", "100 99 100\n"],
    solution: `print(max(map(int, input().split())))`,
  },
  {
    id: 1005, title: "Vowel Counter", rating: 800, tags: ["strings"], visibility: "public",
    statement: "Count how many vowels (a, e, i, o, u — upper or lower case) appear in a line of text.",
    input: "One line of text, 1 to 1000 characters long. It may contain spaces and punctuation.",
    output: "Print the number of vowels.",
    examples: [{ input: "Hello World\n", output: "3" }, { input: "Python\n", output: "1" }],
    tests: ["rhythm\n", "AEIOU aeiou\n", "The quick brown fox jumps over the lazy dog!\n", word(900, 1000) + "\n"],
    solution: `s = input()\nprint(sum(1 for c in s.lower() if c in "aeiou"))`,
  },
  {
    id: 1006, title: "Backwards Sentence", rating: 900, tags: ["strings"], visibility: "public",
    statement: "Print the words of a sentence in reverse order. Words are separated by single spaces.",
    input: "One line with 1 to 100 words made of letters.",
    output: "Print the same words in reverse order, separated by single spaces.",
    examples: [{ input: "I love Python\n", output: "Python love I" }, { input: "hello\n", output: "hello" }],
    tests: ["a b c d e f g\n", Array.from({ length: 100 }, () => word(1, 8)).join(" ") + "\n", "Nest\n"],
    solution: `print(" ".join(input().split()[::-1]))`,
  },
  {
    id: 1007, title: "Weather Report", rating: 800, tags: ["math", "implementation"], visibility: "public",
    statement: "Convert a temperature from Celsius to Fahrenheit using F = C × 9 / 5 + 32.",
    input: "One integer C (−100 ≤ C ≤ 100).",
    output: "Print F with exactly one digit after the decimal point.",
    examples: [{ input: "100\n", output: "212.0" }, { input: "-40\n", output: "-40.0" }],
    tests: ["0\n", "37\n", "-17\n", "1\n", "-100\n"],
    solution: `c = int(input())\nprint(f"{c * 9 / 5 + 32:.1f}")`,
  },
  {
    id: 1008, title: "FizzBuzz", rating: 900, tags: ["implementation"], visibility: "public",
    statement: "For every number from 1 to n print `Fizz` if it is divisible by 3, `Buzz` if it is divisible by 5, `FizzBuzz` if it is divisible by both, and the number itself otherwise.",
    input: "One integer n (1 ≤ n ≤ 1000).",
    output: "Print n lines.",
    examples: [{ input: "5\n", output: "1\n2\nFizz\n4\nBuzz" }],
    tests: ["1\n", "15\n", "100\n", "1000\n"],
    solution: `n = int(input())\nfor i in range(1, n + 1):\n    print("FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else i)`,
  },
  {
    id: 1009, title: "Sum and Max", rating: 800, tags: ["implementation"], visibility: "public",
    statement: "You are given n numbers. Print their sum and their maximum.",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers (−10^9 ≤ a_i ≤ 10^9).",
    output: "Print the sum and the maximum separated by a space.",
    examples: [{ input: "3\n1 5 2\n", output: "8 5" }, { input: "2\n-4 -9\n", output: "-13 -4" }],
    tests: ["1\n0\n", lines(1000, arr(1000, -1e9, 1e9).join(" ")), lines(10000, arr(10000, -1e9, 1e9).join(" "))],
    solution: `import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\na = list(map(int, data[1:1 + n]))\nprint(sum(a), max(a))`,
  },
  {
    id: 1010, title: "Runner-up", rating: 1000, tags: ["sortings", "implementation"], visibility: "public",
    statement: "Find the second largest distinct value in a list. If all values are equal there is no runner-up: print -1.",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers (1 ≤ a_i ≤ 10^9).",
    output: "Print the second largest distinct value, or -1.",
    examples: [{ input: "5\n2 3 6 6 5\n", output: "5" }, { input: "3\n7 7 7\n", output: "-1" }],
    tests: ["1\n4\n", "2\n1 2\n", "2\n9 9\n", lines(10000, arr(10000, 1, 1e9).join(" ")), lines(6, "1 1 1 1 1 2")],
    solution: `n = int(input())\na = sorted(set(map(int, input().split())))\nprint(a[-2] if len(a) > 1 else -1)`,
  },
  {
    id: 1011, title: "Mirror Word", rating: 900, tags: ["strings"], visibility: "public",
    statement: "A palindrome reads the same forwards and backwards. Check each word.",
    input: "The first line contains t (1 ≤ t ≤ 100). Each of the next t lines contains one word of lowercase letters (length 1 to 100).",
    output: "For each word print `YES` if it is a palindrome and `NO` otherwise.",
    examples: [{ input: "3\nlevel\npython\na\n", output: "YES\nNO\nYES" }],
    tests: [lines(4, "abba", "abca", "racecar", "ab"), lines(100, ...Array.from({ length: 100 }, (_, i) => { const w = word(1, 50, "ab"); return i % 2 ? w + [...w].reverse().join("") : w; }))],
    solution: `t = int(input())\nfor _ in range(t):\n    w = input().strip()\n    print("YES" if w == w[::-1] else "NO")`,
  },
  {
    id: 1012, title: "Digital Root", rating: 1000, tags: ["math", "implementation"], visibility: "public",
    statement: "Replace a number by the sum of its digits, again and again, until only one digit is left. Print that digit.",
    input: "One integer n (0 ≤ n ≤ 10^18).",
    output: "Print the final single digit.",
    examples: [{ input: "38\n", output: "2" }, { input: "7\n", output: "7" }],
    notes: "38 → 3 + 8 = 11 → 1 + 1 = 2.",
    tests: ["0\n", "999999999999999999\n", "200000000000000000\n", "123456789\n", `${int(1, 1e9)}${int(1, 1e9)}\n`],
    solution: `n = input().strip()\nwhile len(n) > 1:\n    n = str(sum(int(d) for d in n))\nprint(n)`,
  },
  {
    id: 1013, title: "Class Report", rating: 1000, tags: ["implementation"], visibility: "public",
    statement: "A teacher has the scores of n students. Print the name of the best student (the first one in the list if there is a tie) and the class average.",
    input: "The first line contains n (1 ≤ n ≤ 1000). Each of the next n lines contains a name (letters only) and a score (0 ≤ score ≤ 100).",
    output: "Print the best student's name on the first line and the average with exactly two digits after the decimal point on the second line.",
    examples: [{ input: "3\nAli 90\nMira 95\nTom 70\n", output: "Mira\n85.00" }],
    tests: [lines(2, "A 100", "B 100"), lines(1, "Solo 0"), lines(500, ...Array.from({ length: 500 }, () => `${word(3, 8)} ${int(0, 100)}`))],
    solution: `n = int(input())\nbest, best_score, total = "", -1, 0\nfor _ in range(n):\n    name, score = input().split()\n    score = int(score)\n    total += score\n    if score > best_score:\n        best, best_score = name, score\nprint(best)\nprint(f"{total / n:.2f}")`,
  },
  {
    id: 1014, title: "Word Popularity", rating: 1100, tags: ["strings", "sortings", "data structures"], visibility: "public",
    statement: "Count how many times each word appears in a text. Print the words from most to least frequent. Words with the same count are printed in alphabetical order.",
    input: "One line with 1 to 10^4 lowercase words separated by spaces.",
    output: "For each distinct word print the word and its count on its own line.",
    examples: [{ input: "the cat and the hat\n", output: "the 2\nand 1\ncat 1\nhat 1" }],
    tests: ["a\n", "b a b a c\n", Array.from({ length: 10000 }, () => word(1, 2, "abcd")).join(" ") + "\n"],
    solution: `from collections import Counter\nc = Counter(input().split())\nfor w, k in sorted(c.items(), key=lambda x: (-x[1], x[0])):\n    print(w, k)`,
  },
  {
    id: 1015, title: "Prime Detective", rating: 1200, tags: ["math", "number theory"], visibility: "public",
    statement: "For each number decide whether it is prime. A prime has exactly two divisors: 1 and itself.",
    input: "The first line contains q (1 ≤ q ≤ 20). Each of the next q lines contains n (1 ≤ n ≤ 10^9).",
    output: "For each n print `PRIME` or `NOT PRIME`.",
    examples: [{ input: "3\n2\n15\n1\n", output: "PRIME\nNOT PRIME\nNOT PRIME" }],
    tests: [lines(5, 999999937, 200000000, 97, 4, 3), lines(20, ...arr(20, 1, 1e9))],
    solution: `def is_prime(n):\n    if n < 2:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True\n\nq = int(input())\nfor _ in range(q):\n    print("PRIME" if is_prime(int(input())) else "NOT PRIME")`,
  },
  {
    id: 1016, title: "Balanced Brackets", rating: 1200, tags: ["data structures", "strings"], visibility: "public",
    statement: "A bracket string is balanced if every opening bracket `(`, `[` or `{` is closed by the matching bracket in the right order.",
    input: "One line with a string of brackets, length 1 to 2·10^4.",
    output: "Print `YES` if it is balanced, otherwise `NO`.",
    examples: [{ input: "([]{})\n", output: "YES" }, { input: "([)]\n", output: "NO" }, { input: "((\n", output: "NO" }],
    tests: [")\n", "{}\n", "(".repeat(10000) + ")".repeat(10000) + "\n", "([{}])".repeat(1000) + "]\n", "[".repeat(3) + "]".repeat(3) + "\n"],
    solution: `s = input().strip()\npairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nok = True\nfor ch in s:\n    if ch in "([{":\n        stack.append(ch)\n    elif not stack or stack.pop() != pairs[ch]:\n        ok = False\n        break\nprint("YES" if ok and not stack else "NO")`,
  },
  {
    id: 1017, title: "Range Sums", rating: 1200, tags: ["data structures", "implementation"], visibility: "public",
    statement: "Answer many questions of the form “what is the sum of elements from position l to position r?”. Positions are numbered from 1.",
    input: "The first line contains n and q (1 ≤ n, q ≤ 2·10^4). The second line contains n integers (|a_i| ≤ 10^9). Each of the next q lines contains l and r (1 ≤ l ≤ r ≤ n).",
    output: "For each question print the sum.",
    notes: "Adding up the range for every question can be too slow. Prefix sums answer each question in one step.",
    examples: [{ input: "5 3\n1 2 3 4 5\n1 5\n2 3\n4 4\n", output: "15\n5\n4" }],
    tests: [(() => { const n = 8000, q = 8000; const qs = Array.from({ length: q }, () => { const l = int(1, n); return `${l} ${int(l, n)}`; }); return lines(`${n} ${q}`, arr(n, -1e9, 1e9).join(" "), ...qs); })(), lines("1 1", "-5", "1 1")],
    solution: `import sys\ndata = sys.stdin.buffer.read().split()\nn, q = int(data[0]), int(data[1])\npre = [0] * (n + 1)\nfor i in range(n):\n    pre[i + 1] = pre[i] + int(data[2 + i])\nout = []\npos = 2 + n\nfor _ in range(q):\n    l, r = int(data[pos]), int(data[pos + 1])\n    pos += 2\n    out.append(pre[r] - pre[l - 1])\nprint("\\n".join(map(str, out)))`,
  },
  {
    id: 1018, title: "Pair With Target", rating: 1300, tags: ["data structures", "brute force"], visibility: "public",
    statement: "Is there a pair of different positions i < j such that a_i + a_j equals the target t?",
    input: "The first line contains n and t (2 ≤ n ≤ 2·10^4, |t| ≤ 2·10^9). The second line contains n integers (|a_i| ≤ 10^9).",
    output: "Print `YES` or `NO`.",
    notes: "Checking every pair is too slow for n = 2·10^4. Remember the numbers you have already seen in a set.",
    examples: [{ input: "4 9\n2 7 11 15\n", output: "YES" }, { input: "3 10\n5 1 2\n", output: "NO" }],
    tests: [lines("2 10", "5 5"), lines("2 10", "5 6"), lines("10000 3", arr(10000, 2, 1e9).join(" ")), lines("10000 1999999999", [...arr(9998, 1, 1e8), 999999999, 200000000].join(" "))],
    solution: `n, t = map(int, input().split())\nseen = set()\nfound = False\nfor x in map(int, input().split()):\n    if t - x in seen:\n        found = True\n        break\n    seen.add(x)\nprint("YES" if found else "NO")`,
  },
  {
    id: 1019, title: "Squeeze the Letters", rating: 1000, tags: ["strings", "implementation"], visibility: "public",
    statement: "Run-length encoding writes each group of equal letters in a row as the letter followed by the length of the group. For example, `aaabcc` becomes `a3b1c2`.",
    input: "One line with a string of lowercase letters, length 1 to 2·10^4.",
    output: "Print the encoded string.",
    examples: [{ input: "aaabcc\n", output: "a3b1c2" }, { input: "z\n", output: "z1" }],
    tests: ["abc\n", "a".repeat(20000) + "\n", word(5000, 6000, "ab") + "\n", "zzzzzzzzzzyy\n"],
    solution: `s = input().strip()\nout = []\ni = 0\nwhile i < len(s):\n    j = i\n    while j < len(s) and s[j] == s[i]:\n        j += 1\n    out.append(s[i] + str(j - i))\n    i = j\nprint("".join(out))`,
  },
  {
    id: 1020, title: "Staircase", rating: 800, tags: ["implementation"], visibility: "public",
    statement: "Draw a staircase of height n using `#`. Line i (counting from 1) has exactly i `#` characters.",
    input: "One integer n (1 ≤ n ≤ 100).",
    output: "Print n lines.",
    examples: [{ input: "3\n", output: "#\n##\n###" }],
    tests: ["1\n", "10\n", "100\n"],
    solution: `n = int(input())\nfor i in range(1, n + 1):\n    print("#" * i)`,
  },
  {
    id: 1021, title: "Fewest Coins", rating: 1500, tags: ["dp"], visibility: "public",
    statement: "You have coins of several values (unlimited of each). What is the smallest number of coins that adds up to exactly S? If it is impossible print -1.",
    input: "The first line contains k and S (1 ≤ k ≤ 50, 0 ≤ S ≤ 10^4). The second line contains k coin values (1 ≤ c_i ≤ 10^4).",
    output: "Print the minimum number of coins, or -1.",
    notes: "Greedy (always take the biggest coin) is wrong: with coins 1, 3, 4 and S = 6 the answer is 3 + 3 (2 coins), not 4 + 1 + 1.",
    examples: [{ input: "3 6\n1 3 4\n", output: "2" }, { input: "1 3\n2\n", output: "-1" }],
    tests: [lines("2 0", "5 7"), lines("3 10000", "7 13 29"), lines("50 9999", arr(50, 50, 10000).join(" ")), lines("4 9973", "2 4 6 8")],
    solution: `k, S = map(int, input().split())\ncoins = list(map(int, input().split()))\nINF = float("inf")\ndp = [0] + [INF] * S\nfor v in range(1, S + 1):\n    for c in coins:\n        if c <= v and dp[v - c] + 1 < dp[v]:\n            dp[v] = dp[v - c] + 1\nprint(dp[S] if dp[S] != INF else -1)`,
  },
  {
    id: 1022, title: "Longest Climb", rating: 1100, tags: ["implementation", "greedy"], visibility: "public",
    statement: "Find the length of the longest run of consecutive elements where each element is strictly greater than the one before it.",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers.",
    output: "Print the length of the longest strictly increasing run.",
    examples: [{ input: "6\n1 2 2 3 4 5\n", output: "4" }, { input: "3\n3 2 1\n", output: "1" }],
    tests: ["1\n5\n", lines(20000, Array.from({ length: 20000 }, (_, i) => i).join(" ")), lines(20000, arr(20000, 1, 10).join(" "))],
    solution: `n = int(input())\na = list(map(int, input().split()))\nbest = cur = 1\nfor i in range(1, n):\n    cur = cur + 1 if a[i] > a[i - 1] else 1\n    best = max(best, cur)\nprint(best)`,
  },
  {
    id: 1023, title: "Garden Paths", rating: 1400, tags: ["dp"], visibility: "public",
    statement: "A garden is an n × m grid. `.` is grass and `#` is a rock. Starting in the top-left cell you can only move right or down. How many different paths reach the bottom-right cell? Print the answer modulo 1 000 000 007.",
    input: "The first line contains n and m (1 ≤ n, m ≤ 100). The next n lines contain m characters each.",
    output: "Print the number of paths modulo 10^9 + 7 (0 if the start or the finish is a rock).",
    examples: [{ input: "3 3\n...\n.#.\n...\n", output: "2" }, { input: "1 1\n#\n", output: "0" }],
    tests: [lines("1 5", "....."), lines("100 100", ...Array.from({ length: 100 }, () => ".".repeat(100))), lines("50 60", ...Array.from({ length: 50 }, () => Array.from({ length: 60 }, () => (R() < 0.1 ? "#" : ".")).join("")).map((r, i) => (i === 0 ? "." + r.slice(1) : i === 49 ? r.slice(0, 59) + "." : r)))],
    solution: `MOD = 10**9 + 7\nn, m = map(int, input().split())\ng = [input().strip() for _ in range(n)]\ndp = [[0] * m for _ in range(n)]\nfor i in range(n):\n    for j in range(m):\n        if g[i][j] == "#":\n            continue\n        if i == 0 and j == 0:\n            dp[i][j] = 1\n            continue\n        v = 0\n        if i > 0:\n            v += dp[i - 1][j]\n        if j > 0:\n            v += dp[i][j - 1]\n        dp[i][j] = v % MOD\nprint(dp[n - 1][m - 1])`,
  },
  {
    id: 1024, title: "How Many Below", rating: 1300, tags: ["sortings", "binary search"], visibility: "public",
    statement: "You are given n numbers and q questions. For each question x, count how many of the numbers are less than or equal to x.",
    input: "The first line contains n and q (1 ≤ n, q ≤ 2·10^4). The second line contains n integers. Each of the next q lines contains one integer x. All values are between −10^9 and 10^9.",
    output: "For each question print the count.",
    notes: "Sort once, then use the bisect module for every question.",
    examples: [{ input: "5 3\n4 1 3 1 5\n1\n3\n10\n", output: "2\n3\n5" }],
    tests: [lines("1 2", "0", "-1", "0"), lines("8000 8000", arr(8000, -1e9, 1e9).join(" "), ...arr(8000, -1e9, 1e9))],
    solution: `import sys\nfrom bisect import bisect_right\ndata = sys.stdin.buffer.read().split()\nn, q = int(data[0]), int(data[1])\na = sorted(map(int, data[2:2 + n]))\nprint("\\n".join(str(bisect_right(a, int(x))) for x in data[2 + n:2 + n + q]))`,
  },

  // ------------------------------------------------------------------ contest pool (hidden until their round starts)
  {
    id: 1101, title: "Nest Eggs", rating: 800, tags: ["math"], visibility: "hidden",
    statement: "A bird has n eggs. One nest holds at most k eggs. What is the smallest number of nests needed?",
    input: "One line with n and k (0 ≤ n ≤ 10^18, 1 ≤ k ≤ 10^18).",
    output: "Print the number of nests.",
    examples: [{ input: "10 3\n", output: "4" }, { input: "6 3\n", output: "2" }],
    tests: ["0 5\n", "1 1\n", "200000000000000000 1\n", "999999999999999999 200000000000000000\n", "7 7\n"],
    solution: `n, k = map(int, input().split())\nprint((n + k - 1) // k)`,
  },
  {
    id: 1102, title: "Snake Case", rating: 900, tags: ["strings"], visibility: "hidden",
    statement: "Python programmers name variables in snake_case, Java programmers in camelCase. Convert a camelCase name to snake_case: put `_` before every capital letter and make it lowercase.",
    input: "One word of English letters (length 1 to 100). The first letter is lowercase.",
    output: "Print the name in snake_case.",
    examples: [{ input: "userName\n", output: "user_name" }, { input: "x\n", output: "x" }],
    tests: ["getHTTPResponse\n", "aB\n", "already\n", "oneTwoThreeFourFive\n"],
    solution: `s = input().strip()\nprint("".join("_" + c.lower() if c.isupper() else c for c in s))`,
  },
  {
    id: 1103, title: "Lucky Tickets", rating: 1000, tags: ["implementation"], visibility: "hidden",
    statement: "A bus ticket has a 6-digit number. It is lucky if the sum of the first three digits equals the sum of the last three.",
    input: "The first line contains t (1 ≤ t ≤ 1000). Each of the next t lines contains a ticket: exactly 6 digits (it may start with zeros).",
    output: "For each ticket print `LUCKY` or `UNLUCKY`.",
    examples: [{ input: "3\n123321\n000000\n123456\n", output: "LUCKY\nLUCKY\nUNLUCKY" }],
    tests: [lines(1000, ...Array.from({ length: 1000 }, () => String(int(0, 999999)).padStart(6, "0"))), lines(2, "990009", "100001")],
    solution: `t = int(input())\nfor _ in range(t):\n    s = input().strip()\n    a = sum(map(int, s[:3]))\n    b = sum(map(int, s[3:]))\n    print("LUCKY" if a == b else "UNLUCKY")`,
  },
  {
    id: 1104, title: "Ticket Queue", rating: 1200, tags: ["data structures", "implementation"], visibility: "hidden",
    statement: "Simulate a queue. `push x` adds x to the back, `pop` removes the front person, `front` prints the front person. If the queue is empty, `pop` does nothing and `front` prints `EMPTY`.",
    input: "The first line contains q (1 ≤ q ≤ 2·10^4). Each of the next q lines contains one operation (1 ≤ x ≤ 10^9).",
    output: "Print the answer to every `front` operation.",
    notes: "Removing from the front of a list is slow. collections.deque has a fast popleft().",
    examples: [{ input: "6\npush 5\npush 8\nfront\npop\nfront\npop\n", output: "5\n8" }],
    tests: [lines(3, "front", "pop", "front"), lines(10000, ...Array.from({ length: 10000 }, () => { const r = R(); return r < 0.5 ? `push ${int(1, 1e9)}` : r < 0.75 ? "pop" : "front"; }))],
    solution: `import sys\nfrom collections import deque\ninput = sys.stdin.readline\nq = deque()\nout = []\nfor _ in range(int(input())):\n    op = input().split()\n    if op[0] == "push":\n        q.append(op[1])\n    elif op[0] == "pop":\n        if q:\n            q.popleft()\n    else:\n        out.append(q[0] if q else "EMPTY")\nprint("\\n".join(out))`,
  },
  {
    id: 1105, title: "Anagram Families", rating: 1300, tags: ["strings", "sortings", "data structures"], visibility: "hidden",
    statement: "Two words are in the same family if they are anagrams — made of exactly the same letters. How many families are there?",
    input: "The first line contains n (1 ≤ n ≤ 10^4). Each of the next n lines contains a lowercase word (length 1 to 20).",
    output: "Print the number of families.",
    examples: [{ input: "5\nlisten\nsilent\nenlist\ngoogle\ncat\n", output: "3" }],
    tests: [lines(1, "a"), lines(3, "ab", "ba", "ab"), lines(10000, ...Array.from({ length: 10000 }, () => word(1, 4, "abc")))],
    solution: `n = int(input())\nprint(len({"".join(sorted(input().strip())) for _ in range(n)}))`,
  },
  {
    id: 1106, title: "Best Streak", rating: 1500, tags: ["dp", "greedy"], visibility: "hidden",
    statement: "A trader writes down the profit (possibly negative) of every day. Find the largest total profit of a block of consecutive days. The block must contain at least one day.",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers (|a_i| ≤ 10^9).",
    output: "Print the maximum sum of a non-empty contiguous block.",
    notes: "Try Kadane's algorithm: keep the best sum of a block that ends today.",
    examples: [{ input: "8\n-2 1 -3 4 -1 2 1 -5\n", output: "6" }, { input: "2\n-3 -1\n", output: "-1" }],
    tests: [lines(1, "-200000000"), lines(10000, arr(10000, -1e9, 1e9).join(" ")), lines(5000, arr(5000, 1, 1e9).join(" "))],
    solution: `n = int(input())\nbest = cur = None\nfor x in map(int, input().split()):\n    cur = x if cur is None or cur < 0 else cur + x\n    best = cur if best is None else max(best, cur)\nprint(best)`,
  },
  {
    id: 1107, title: "Clock Hands", rating: 1000, tags: ["math", "geometry"], visibility: "hidden",
    statement: "Find the smaller angle (in degrees) between the hour hand and the minute hand of a clock. The hour hand moves smoothly: at 1:30 it is halfway between 1 and 2.",
    input: "One line with the time as HH:MM (00 ≤ HH ≤ 23, 00 ≤ MM ≤ 59).",
    output: "Print the angle with exactly one digit after the decimal point.",
    examples: [{ input: "03:00\n", output: "90.0" }, { input: "12:30\n", output: "165.0" }],
    tests: ["00:00\n", "23:59\n", "06:00\n", "09:45\n", "17:23\n"],
    solution: `h, m = map(int, input().split(":"))\nangle = abs(30 * (h % 12) + 0.5 * m - 6 * m)\nprint(f"{min(angle, 360 - angle):.1f}")`,
  },
  {
    id: 1108, title: "Sock Drawer", rating: 800, tags: ["implementation", "data structures"], visibility: "hidden",
    statement: "A drawer has n socks; each has a colour number. Two socks of the same colour make a pair. How many pairs can you make?",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n colours (1 ≤ c_i ≤ 100).",
    output: "Print the number of pairs.",
    examples: [{ input: "7\n1 2 1 2 1 3 2\n", output: "2" }],
    tests: ["1\n5\n", lines(20000, arr(20000, 1, 100).join(" ")), lines(4, "9 9 9 9")],
    solution: `from collections import Counter\ninput()\nprint(sum(v // 2 for v in Counter(input().split()).values()))`,
  },
  {
    id: 1109, title: "Flip the Table", rating: 900, tags: ["implementation"], visibility: "hidden",
    statement: "Transpose a table: rows become columns and columns become rows.",
    input: "The first line contains n and m (1 ≤ n, m ≤ 100). The next n lines contain m integers each.",
    output: "Print m lines with n integers each.",
    examples: [{ input: "2 3\n1 2 3\n4 5 6\n", output: "1 4\n2 5\n3 6" }],
    tests: [lines("1 1", "7"), lines("1 4", "1 2 3 4"), lines("100 100", ...Array.from({ length: 100 }, () => arr(100, -99, 99).join(" ")))],
    solution: `n, m = map(int, input().split())\nrows = [input().split() for _ in range(n)]\nfor col in zip(*rows):\n    print(" ".join(col))`,
  },
  {
    id: 1110, title: "Common Divisor", rating: 1100, tags: ["math", "number theory"], visibility: "hidden",
    statement: "Find the greatest number that divides every element of the list (the GCD of the list).",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers (1 ≤ a_i ≤ 10^18).",
    output: "Print the GCD.",
    examples: [{ input: "3\n12 18 24\n", output: "6" }, { input: "2\n7 13\n", output: "1" }],
    tests: ["1\n200000000000000000\n", lines(8000, Array.from({ length: 8000 }, () => 360 * int(1, 1e6)).join(" ")), lines(3, "200000000000000000 200000000000000000 220000000000000000")],
    solution: `from math import gcd\nfrom functools import reduce\ninput()\nprint(reduce(gcd, map(int, input().split())))`,
  },
  {
    id: 1111, title: "Robot Walk", rating: 1200, tags: ["implementation", "data structures"], visibility: "hidden",
    statement: "A robot starts at (0, 0). Each letter moves it one step: `U` y+1, `D` y−1, `L` x−1, `R` x+1. Print its final position and the number of different cells it visited (including the start).",
    input: "One line with the moves, length 1 to 2·10^4.",
    output: "Print x, y and the number of visited cells, separated by spaces.",
    examples: [{ input: "URDL\n", output: "0 0 4" }, { input: "RRR\n", output: "3 0 4" }],
    tests: ["U\n", "UDUDUD\n", Array.from({ length: 20000 }, () => "UDLR"[int(0, 3)]).join("") + "\n", "R".repeat(20000) + "\n"],
    solution: `x = y = 0\nseen = {(0, 0)}\nstep = {"U": (0, 1), "D": (0, -1), "L": (-1, 0), "R": (1, 0)}\nfor c in input().strip():\n    dx, dy = step[c]\n    x += dx\n    y += dy\n    seen.add((x, y))\nprint(x, y, len(seen))`,
  },
  {
    id: 1112, title: "Booking Calendar", rating: 1500, tags: ["sortings", "greedy"], visibility: "hidden",
    statement: "A room has n bookings, each from day l to day r inclusive. Merge bookings that overlap or touch (e.g. [1, 3] and [4, 6] touch because day 4 follows day 3) and print the merged bookings in order.",
    input: "The first line contains n (1 ≤ n ≤ 2·10^4). Each of the next n lines contains l and r (1 ≤ l ≤ r ≤ 10^9).",
    output: "Print the number of merged bookings, then each one as `l r` on its own line, sorted by l.",
    examples: [{ input: "4\n1 3\n8 10\n2 5\n6 6\n", output: "2\n1 6\n8 10" }],
    tests: [lines(1, "5 5"), lines(2, "1 2", "4 5"), lines(5000, ...Array.from({ length: 5000 }, () => { const l = int(1, 1e9 - 1000); return `${l} ${l + int(0, 1000)}`; }))],
    solution: `import sys\ndata = sys.stdin.buffer.read().split()\nn = int(data[0])\niv = sorted((int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(n))\nout = []\nfor l, r in iv:\n    if out and l <= out[-1][1] + 1:\n        out[-1][1] = max(out[-1][1], r)\n    else:\n        out.append([l, r])\nprint(len(out))\nprint("\\n".join(f"{l} {r}" for l, r in out))`,
  },
];

/** Rounds created by the seed (start times are set relative to when the migration runs). */
export const SEED_CONTESTS = [
  { title: "PyNest Round #1 (Div. 3)", description: "Our first rated round! Six problems for beginners and up. Problems are sorted by difficulty — read them all.", problems: [1101, 1102, 1103, 1104, 1105, 1106], dayOffset: 0, durationMinutes: 120 },
  { title: "PyNest Round #2 (Div. 3)", description: "Six new problems. Solve as many as you can in two hours.", problems: [1108, 1109, 1107, 1110, 1111, 1112], dayOffset: 7, durationMinutes: 120 },
];
