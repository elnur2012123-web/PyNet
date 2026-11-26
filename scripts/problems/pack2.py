"""
PyNest problem pack 2: 40 problems rated 900-2500 (ids 1201-1240).

  python3 scripts/problems/pack2.py          # check every solution, write pack2.json
  python3 scripts/problems/pack2.py --quick  # fewer random checks

Each problem has a reference solution `sol` and, where a simpler algorithm exists,
a slow `brute` solution. Both run on hundreds of random small inputs and must agree.
Expected outputs are computed from `sol` (again, in Pyodide, by build-problems.ts).
"""
import io, json, random, sys, builtins, time, os

HERE = os.path.dirname(os.path.abspath(__file__))
P = []


def problem(**kw):
    P.append(kw)


def L(*rows):
    return "\n".join(" ".join(map(str, r)) if isinstance(r, (list, tuple)) else str(r) for r in rows) + "\n"


# --------------------------------------------------------------------------- 900
problem(
    id=1201, title="Above Average", rating=900, tags=["implementation", "math"],
    statement="The birds in the nest compare their wingspans. How many birds have a wingspan strictly greater than the average wingspan of all the birds?",
    input="The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers a_1 … a_n (1 ≤ a_i ≤ 10^9).",
    output="Print the number of birds whose wingspan is strictly greater than the average.",
    examples=["5\n1 2 3 4 5\n", "3\n7 7 7\n"],
    sol="""n = int(input())
a = list(map(int, input().split()))
s = sum(a)
print(sum(1 for x in a if x * n > s))""",
    brute="""from fractions import Fraction
n = int(input())
a = list(map(int, input().split()))
avg = Fraction(sum(a), n)
print(len([x for x in a if x > avg]))""",
    small=lambda r: (lambda n: L(n, [r.randint(1, 6) for _ in range(n)]))(r.randint(1, 8)),
    tests=lambda r: ["1\n5\n", "2\n1 1000000000\n", L(2000, [r.randint(1, 10**9) for _ in range(2000)])],
)

problem(
    id=1202, title="Zigzag Letters", rating=900, tags=["strings", "implementation"],
    statement="Make a word look playful: its 1st, 3rd, 5th, … letters become uppercase and its 2nd, 4th, 6th, … letters become lowercase.",
    input="One word of 1 to 100 English letters.",
    output="Print the changed word.",
    examples=["python\n", "HELLO\n"],
    sol="""s = input().strip()
print("".join(c.upper() if i % 2 == 0 else c.lower() for i, c in enumerate(s)))""",
    brute="""s = input().strip()
out = ""
for i in range(len(s)):
    out += s[i].upper() if (i + 1) % 2 == 1 else s[i].lower()
print(out)""",
    small=lambda r: "".join(r.choice("aBcDeF") for _ in range(r.randint(1, 10))) + "\n",
    tests=lambda r: ["a\n", "Z\n", "".join(r.choice("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(100)) + "\n"],
)

# --------------------------------------------------------------------------- 1000
def tram_gen(r, n, cap):
    rows, cur = [], 0
    for i in range(n):
        if i == n - 1:
            rows.append((cur, 0))
            break
        off = 0 if i == 0 else r.randint(0, cur)
        cur -= off
        on = r.randint(0, cap)
        cur += on
        rows.append((off, on))
    return L(n, *rows)


problem(
    id=1203, title="Tram Capacity", rating=1000, tags=["implementation"],
    statement="A tram stops at n stops in order. At stop i, first a_i passengers get off and then b_i passengers get on. The tram is empty before the first stop, and everyone gets off at the last stop. What is the smallest capacity the tram needs, that is, the largest number of passengers inside it at any moment?",
    input="The first line contains n (2 ≤ n ≤ 1000). Each of the next n lines contains a_i and b_i (0 ≤ a_i, b_i ≤ 1000). Nobody gets off who is not on the tram, a_1 = 0, and at the last stop b_n = 0 and everyone gets off.",
    output="Print the required capacity.",
    examples=["4\n0 3\n2 5\n4 2\n4 0\n", "2\n0 0\n0 0\n"],
    sol="""n = int(input())
cur = best = 0
for _ in range(n):
    a, b = map(int, input().split())
    cur += b - a
    best = max(best, cur)
print(best)""",
    brute="""n = int(input())
rows = [tuple(map(int, input().split())) for _ in range(n)]
loads = []
for i in range(n):
    loads.append(sum(b - a for a, b in rows[: i + 1]))
print(max([0] + loads))""",
    small=lambda r: tram_gen(r, r.randint(2, 6), 5),
    tests=lambda r: [tram_gen(r, 1000, 1000), tram_gen(r, 1000, 3), tram_gen(r, 2, 1000)],
)

problem(
    id=1204, title="Alarm Clock", rating=1000, tags=["math", "implementation"],
    statement="It is HH:MM now, and the alarm rings in m minutes. What time will the clock show then? The clock uses the 24-hour format and goes from 23:59 to 00:00.",
    input="The first line contains the time as HH:MM (00 ≤ HH ≤ 23, 00 ≤ MM ≤ 59). The second line contains m (0 ≤ m ≤ 10^9).",
    output="Print the time in the same HH:MM format.",
    examples=["23:30\n45\n", "08:05\n1440\n"],
    sol="""h, mm = map(int, input().split(":"))
m = int(input())
t = (h * 60 + mm + m) % 1440
print(f"{t // 60:02d}:{t % 60:02d}")""",
    brute="""h, mm = map(int, input().split(":"))
m = int(input()) % (1440 * 7)
for _ in range(m):
    mm += 1
    if mm == 60:
        mm = 0
        h = (h + 1) % 24
print(str(h).zfill(2) + ":" + str(mm).zfill(2))""",
    small=lambda r: f"{r.randint(0, 23):02d}:{r.randint(0, 59):02d}\n{r.randint(0, 5000)}\n",
    tests=lambda r: ["00:00\n0\n", "23:59\n1\n", "12:00\n1000000000\n", "00:01\n1439\n", "17:45\n987654321\n"],
)

# --------------------------------------------------------------------------- 1100
problem(
    id=1205, title="Lonely Letters", rating=1100, tags=["strings", "hashing"],
    statement="Find all the letters that appear in a word exactly once. Print them in the order in which they appear in the word.",
    input="One word of 1 to 10^5 lowercase English letters.",
    output="Print the lonely letters together as one word, or `NONE` if there are none.",
    examples=["programming\n", "aabb\n"],
    sol="""from collections import Counter
s = input().strip()
c = Counter(s)
r = "".join(ch for ch in s if c[ch] == 1)
print(r or "NONE")""",
    brute="""s = input().strip()
r = ""
for ch in s:
    if s.count(ch) == 1:
        r += ch
print(r if r else "NONE")""",
    small=lambda r: "".join(r.choice("abcde") for _ in range(r.randint(1, 9))) + "\n",
    tests=lambda r: ["z\n", "abcdefghijklmnopqrstuvwxyz\n", "".join(r.choice("abcdefghijklmnopqrstuvwxy") for _ in range(2500)) + "z\n"],
)

problem(
    id=1206, title="Equal Heights", rating=1100, tags=["math", "sortings"],
    statement="There are n towers of blocks. In one move you can add one block to a tower or remove one block from a tower. What is the smallest number of moves needed to make all the towers the same height?",
    input="The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers h_1 … h_n (0 ≤ h_i ≤ 10^9).",
    output="Print the minimum number of moves.",
    notes="In the first example make every tower 3 blocks tall: 2 + 0 + 2 = 4 moves.",
    examples=["3\n1 3 5\n", "4\n1 2 3 10\n"],
    sol="""n = int(input())
h = sorted(map(int, input().split()))
m = h[n // 2]
print(sum(abs(x - m) for x in h))""",
    brute="""n = int(input())
h = list(map(int, input().split()))
print(min(sum(abs(x - t) for x in h) for t in range(min(h), max(h) + 1)))""",
    small=lambda r: (lambda n: L(n, [r.randint(0, 12) for _ in range(n)]))(r.randint(1, 7)),
    tests=lambda r: ["1\n7\n", "2\n0 1000000000\n", L(2500, [r.randint(0, 10**9) for _ in range(2500)])],
)

# --------------------------------------------------------------------------- 1200
problem(
    id=1207, title="Flip a Segment", rating=1200, tags=["dp", "greedy"],
    statement="A row of coins lies on the table; each coin shows heads `H` or tails `T`. You may choose one block of neighbouring coins and turn all of them over (heads become tails and tails become heads). You may also choose not to turn anything. What is the largest possible number of heads?",
    input="One line with a string of `H` and `T`, length 1 to 2·10^4.",
    output="Print the maximum number of heads.",
    examples=["HTTH\n", "HHH\n", "TTHT\n"],
    sol="""s = input().strip()
best = cur = 0
for c in s:
    cur = max(0, cur + (1 if c == "T" else -1))
    best = max(best, cur)
print(s.count("H") + best)""",
    brute="""s = input().strip()
n = len(s)
best = s.count("H")
for i in range(n):
    for j in range(i, n):
        t = s[:i] + "".join("H" if c == "T" else "T" for c in s[i:j + 1]) + s[j + 1:]
        best = max(best, t.count("H"))
print(best)""",
    small=lambda r: "".join(r.choice("HT") for _ in range(r.randint(1, 10))) + "\n",
    tests=lambda r: ["H\n", "T\n", "T" * 2500 + "\n", "".join(r.choice("HT") for _ in range(2500)) + "\n", "".join(r.choice("HHHT") for _ in range(2500)) + "\n"],
)

problem(
    id=1208, title="Best Swap", rating=1200, tags=["greedy", "strings"],
    statement="You are given a positive integer. You may swap two of its digits, at most once. What is the largest number you can get?",
    input="One integer n (1 ≤ n ≤ 10^18).",
    output="Print the largest number you can get.",
    examples=["2736\n", "9973\n", "1993\n"],
    sol="""s = list(input().strip())
for i in range(len(s)):
    m = max(s[i:])
    if m > s[i]:
        j = len(s) - 1 - s[::-1].index(m)
        s[i], s[j] = s[j], s[i]
        break
print("".join(s))""",
    brute="""s = input().strip()
best = int(s)
for i in range(len(s)):
    for j in range(i + 1, len(s)):
        t = list(s)
        t[i], t[j] = t[j], t[i]
        best = max(best, int("".join(t)))
print(best)""",
    small=lambda r: str(r.randint(1, 10 ** r.randint(1, 7))) + "\n",
    tests=lambda r: ["1\n", "10\n", "1000000000000000000\n", "987654321987654321\n", "111111111111111119\n", "120120120120120120\n"],
)

problem(
    id=1209, title="Spiral Walk", rating=1200, tags=["implementation"],
    statement="A snail crawls over an n × m table, starting in the top-left cell. It moves right along the top edge, then down, then left, then up, and so on, turning inwards every time it reaches the edge of the table or a cell it has already visited, until it has visited every cell. Print the numbers in the order the snail visits them.",
    input="The first line contains n and m (1 ≤ n, m ≤ 100). The next n lines contain m integers each (0 ≤ value ≤ 10^9).",
    output="Print all n·m numbers on one line, separated by spaces.",
    examples=["3 3\n1 2 3\n4 5 6\n7 8 9\n", "2 4\n1 2 3 4\n5 6 7 8\n"],
    sol="""n, m = map(int, input().split())
g = [input().split() for _ in range(n)]
top, bottom, left, right = 0, n - 1, 0, m - 1
out = []
while top <= bottom and left <= right:
    for j in range(left, right + 1):
        out.append(g[top][j])
    for i in range(top + 1, bottom + 1):
        out.append(g[i][right])
    if top < bottom:
        for j in range(right - 1, left - 1, -1):
            out.append(g[bottom][j])
    if left < right:
        for i in range(bottom - 1, top, -1):
            out.append(g[i][left])
    top += 1; bottom -= 1; left += 1; right -= 1
print(" ".join(out))""",
    brute="""n, m = map(int, input().split())
g = [input().split() for _ in range(n)]
seen = [[False] * m for _ in range(n)]
dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
r = c = d = 0
out = []
for _ in range(n * m):
    out.append(g[r][c]); seen[r][c] = True
    nr, nc = r + dirs[d][0], c + dirs[d][1]
    if not (0 <= nr < n and 0 <= nc < m) or seen[nr][nc]:
        d = (d + 1) % 4
        nr, nc = r + dirs[d][0], c + dirs[d][1]
    r, c = nr, nc
print(" ".join(out))""",
    small=lambda r: (lambda n, m: L((n, m), *[[r.randint(0, 9) for _ in range(m)] for _ in range(n)]))(r.randint(1, 6), r.randint(1, 6)),
    tests=lambda r: ["1 1\n5\n", "1 5\n1 2 3 4 5\n", "5 1\n1\n2\n3\n4\n5\n", L((40, 37), *[[r.randint(0, 999) for _ in range(37)] for _ in range(40)])],
)

# --------------------------------------------------------------------------- 1300
problem(
    id=1210, title="No Repeats", rating=1300, tags=["two pointers", "strings"],
    statement="Find the length of the longest block of consecutive characters of a string in which no character appears twice.",
    input="One line with a string of lowercase English letters, length 1 to 2·10^4.",
    output="Print the length.",
    examples=["nestegg\n", "aaaa\n"],
    sol="""s = input().strip()
last = {}
start = best = 0
for i, c in enumerate(s):
    if c in last and last[c] >= start:
        start = last[c] + 1
    last[c] = i
    best = max(best, i - start + 1)
print(best)""",
    brute="""s = input().strip()
best = 0
for i in range(len(s)):
    for j in range(i, len(s)):
        if len(set(s[i:j + 1])) == j - i + 1:
            best = max(best, j - i + 1)
print(best)""",
    small=lambda r: "".join(r.choice("abcd") for _ in range(r.randint(1, 12))) + "\n",
    tests=lambda r: ["z\n", "abcdefghijklmnopqrstuvwxyz" * 3 + "\n", "".join(r.choice("abcdefghijklmnopqrst") for _ in range(2500)) + "\n", "".join(r.choice("ab") for _ in range(2500)) + "\n"],
)

def fence_gen(r, n, q, wide=False):
    rows = []
    for _ in range(q):
        if wide:
            l = r.randint(1, max(1, n // 10)); rr = r.randint(n - n // 10, n)
        else:
            l = r.randint(1, n); rr = r.randint(l, n)
        rows.append((l, rr))
    return L((n, q), *rows)


problem(
    id=1211, title="Paint the Fence", rating=1300, tags=["prefix sums", "implementation"],
    statement="A fence has n boards, numbered from 1 to n, and none of them is painted yet. There are q painters; painter j adds one layer of paint to every board from l_j to r_j. After all the painters have finished, how many layers of paint does each board have?",
    input="The first line contains n and q (1 ≤ n, q ≤ 2·10^4). Each of the next q lines contains l_j and r_j (1 ≤ l_j ≤ r_j ≤ n).",
    output="Print n numbers separated by spaces: the number of layers on each board.",
    examples=["5 3\n1 3\n2 5\n3 3\n", "3 1\n1 3\n"],
    sol="""import sys
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
d = [0] * (n + 2)
for j in range(q):
    l, r = int(data[2 + 2 * j]), int(data[3 + 2 * j])
    d[l] += 1
    d[r + 1] -= 1
out, cur = [], 0
for i in range(1, n + 1):
    cur += d[i]
    out.append(cur)
print(" ".join(map(str, out)))""",
    brute="""n, q = map(int, input().split())
a = [0] * (n + 1)
for _ in range(q):
    l, r = map(int, input().split())
    for i in range(l, r + 1):
        a[i] += 1
print(" ".join(map(str, a[1:])))""",
    small=lambda r: fence_gen(r, r.randint(1, 8), r.randint(1, 6)),
    tests=lambda r: ["1 1\n1 1\n", fence_gen(r, 3000, 3000, wide=True), fence_gen(r, 3000, 3000)],
)

def island_grid(r, n, m, p):
    return L((n, m), *["".join("#" if r.random() < p else "." for _ in range(m)) for _ in range(n)])


problem(
    id=1212, title="Island Count", rating=1300, tags=["graphs", "dfs and similar"],
    statement="A map is an n × m grid of land `#` and water `.`. Two land cells belong to the same island if they share a side. How many islands are on the map?",
    input="The first line contains n and m (1 ≤ n, m ≤ 200). The next n lines contain m characters each.",
    output="Print the number of islands.",
    examples=["4 5\n##..#\n#...#\n..#..\n.....\n", "2 2\n..\n..\n"],
    sol="""from collections import deque
n, m = map(int, input().split())
g = [list(input().strip()) for _ in range(n)]
count = 0
for i in range(n):
    for j in range(m):
        if g[i][j] == "#":
            count += 1
            g[i][j] = "."
            q = deque([(i, j)])
            while q:
                r, c = q.popleft()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < n and 0 <= nc < m and g[nr][nc] == "#":
                        g[nr][nc] = "."
                        q.append((nr, nc))
print(count)""",
    brute="""n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
p = list(range(n * m))
def f(x):
    while p[x] != x:
        x = p[x]
    return x
for i in range(n):
    for j in range(m):
        if g[i][j] == "#":
            if i + 1 < n and g[i + 1][j] == "#": p[f(i * m + j)] = f((i + 1) * m + j)
            if j + 1 < m and g[i][j + 1] == "#": p[f(i * m + j)] = f(i * m + j + 1)
print(len({f(i * m + j) for i in range(n) for j in range(m) if g[i][j] == "#"}))""",
    small=lambda r: island_grid(r, r.randint(1, 6), r.randint(1, 6), 0.45),
    tests=lambda r: ["1 1\n#\n", "1 1\n.\n", island_grid(r, 200, 200, 0.45), L((60, 60), *["#" * 60] * 60), L((50, 50), *[("#." * 25) if i % 2 == 0 else ("." * 50) for i in range(50)])],
)

# --------------------------------------------------------------------------- 1400
problem(
    id=1213, title="Exact Sum Segments", rating=1400, tags=["prefix sums", "hashing"],
    statement="Count the blocks of consecutive elements a_l, a_{l+1}, …, a_r (with l ≤ r) whose sum is exactly k. The numbers may be negative.",
    input="The first line contains n and k (1 ≤ n ≤ 2·10^4, |k| ≤ 10^9). The second line contains n integers (|a_i| ≤ 10^4).",
    output="Print the number of such blocks.",
    examples=["5 3\n1 2 1 2 1\n", "3 0\n0 0 0\n"],
    sol="""n, k = map(int, input().split())
a = list(map(int, input().split()))
seen = {0: 1}
s = ans = 0
for x in a:
    s += x
    ans += seen.get(s - k, 0)
    seen[s] = seen.get(s, 0) + 1
print(ans)""",
    brute="""n, k = map(int, input().split())
a = list(map(int, input().split()))
print(sum(1 for i in range(n) for j in range(i, n) if sum(a[i:j + 1]) == k))""",
    small=lambda r: (lambda n: L((n, r.randint(-3, 3)), [r.randint(-2, 2) for _ in range(n)]))(r.randint(1, 9)),
    tests=lambda r: ["1 5\n5\n", "1 5\n4\n", L((2500, 0), [0] * 2500), L((2500, 7), [r.randint(-3, 3) for _ in range(2500)])],
)

def rooms_gen(r, n, hi):
    rows = []
    for _ in range(n):
        s = r.randint(0, hi - 1); e = r.randint(s + 1, min(hi, s + max(1, hi // 5)))
        rows.append((s, e))
    return L(n, *rows)


problem(
    id=1214, title="Meeting Rooms", rating=1400, tags=["sortings", "greedy"],
    statement="The nest school has n lessons today. Lesson i starts at minute s_i and ends at minute e_i: it uses a room from s_i up to, but not including, e_i, so a lesson that starts exactly when another one ends can use the same room. What is the smallest number of rooms needed so that two lessons never share a room at the same time?",
    input="The first line contains n (1 ≤ n ≤ 2·10^4). Each of the next n lines contains s_i and e_i (0 ≤ s_i < e_i ≤ 10^9).",
    output="Print the minimum number of rooms.",
    examples=["3\n0 30\n5 10\n15 20\n", "2\n1 5\n5 8\n"],
    sol="""import sys
data = sys.stdin.read().split()
n = int(data[0])
ev = []
for i in range(n):
    s, e = int(data[1 + 2 * i]), int(data[2 + 2 * i])
    ev.append((s, 1))
    ev.append((e, -1))
ev.sort()
cur = best = 0
for _, d in ev:
    cur += d
    best = max(best, cur)
print(best)""",
    brute="""n = int(input())
iv = [tuple(map(int, input().split())) for _ in range(n)]
print(max(sum(1 for s, e in iv if s <= t < e) for t, _ in iv))""",
    small=lambda r: rooms_gen(r, r.randint(1, 7), 12),
    tests=lambda r: ["1\n0 1\n", L(3, (1, 2), (2, 3), (3, 4)), L(4, *[(0, 10)] * 4), rooms_gen(r, 3000, 10**6), rooms_gen(r, 3000, 3000)],
)

problem(
    id=1215, title="Bracket Repair", rating=1400, tags=["greedy", "strings"],
    statement="You are given a string of round brackets. What is the smallest number of brackets you have to insert (anywhere in the string) to make it balanced? In a balanced string every `(` has a matching `)` after it.",
    input="One line with a string of `(` and `)`, length 1 to 2·10^4.",
    output="Print the minimum number of brackets to insert.",
    examples=["())\n", "(((\n", "()()\n", ")(\n"],
    sol="""s = input().strip()
bal = need = 0
for c in s:
    if c == "(":
        bal += 1
    elif bal:
        bal -= 1
    else:
        need += 1
print(need + bal)""",
    brute="""s = input().strip()
n = len(s)
# longest balanced subsequence by interval DP; every other bracket needs a partner
best = [[0] * (n + 1) for _ in range(n + 1)]
for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length
        b = max(best[i + 1][j], best[i][j - 1])
        if s[i] == "(":
            for k in range(i + 1, j):
                if s[k] == ")":
                    b = max(b, 2 + best[i + 1][k] + best[k + 1][j])
        best[i][j] = b
print(n - best[0][n])""",
    small=lambda r: "".join(r.choice("()") for _ in range(r.randint(1, 10))) + "\n",
    tests=lambda r: ["(\n", ")\n", ")" * 2500 + "\n", "".join(r.choice("()") for _ in range(2500)) + "\n", "(" * 2000 + ")" * 2000 + "\n"],
)

# --------------------------------------------------------------------------- 1500
problem(
    id=1216, title="Pair Distances", rating=1500, tags=["math", "sortings", "prefix sums"],
    statement="n birds sit on a wire at positions x_1 … x_n. Find the sum of the distances between all pairs of birds, that is, the sum of |x_i − x_j| over all pairs i < j.",
    input="The first line contains n (2 ≤ n ≤ 2·10^4). The second line contains n integers (0 ≤ x_i ≤ 10^9).",
    output="Print the sum.",
    examples=["3\n1 3 6\n", "4\n5 5 5 5\n"],
    sol="""n = int(input())
x = sorted(map(int, input().split()))
total = pref = 0
for i, v in enumerate(x):
    total += v * i - pref
    pref += v
print(total)""",
    brute="""n = int(input())
x = list(map(int, input().split()))
print(sum(abs(x[i] - x[j]) for i in range(n) for j in range(i + 1, n)))""",
    small=lambda r: (lambda n: L(n, [r.randint(0, 20) for _ in range(n)]))(r.randint(2, 9)),
    tests=lambda r: ["2\n0 1000000000\n", L(2500, [r.randint(0, 10**9) for _ in range(2500)])],
)

problem(
    id=1217, title="Circle of Birds", rating=1500, tags=["math", "dp"],
    statement="n birds sit in a circle, numbered from 1 to n clockwise. Starting from bird 1, they count 1, 2, …, k clockwise; the bird that says k flies away, and the next bird starts counting from 1 again. This repeats until only one bird is left. Which bird is it?",
    input="One line with n and k (1 ≤ n ≤ 10^6, 1 ≤ k ≤ 10^9).",
    output="Print the number of the last bird.",
    examples=["5 2\n", "7 3\n"],
    sol="""n, k = map(int, input().split())
r = 0
for i in range(2, n + 1):
    r = (r + k) % i
print(r + 1)""",
    brute="""n, k = map(int, input().split())
birds = list(range(1, n + 1))
i = 0
while len(birds) > 1:
    i = (i + k - 1) % len(birds)
    birds.pop(i)
print(birds[0])""",
    small=lambda r: f"{r.randint(1, 12)} {r.randint(1, 15)}\n",
    tests=lambda r: ["1 1\n", "1 1000000000\n", "1000000 2\n", "1000000 1000000000\n", "999983 7\n"],
)

def prime_q(r, q, hi):
    rows = []
    for _ in range(q):
        a = r.randint(1, hi); b = r.randint(1, hi)
        rows.append((min(a, b), max(a, b)))
    return L(q, *rows)


problem(
    id=1218, title="Prime Ranges", rating=1500, tags=["math", "number theory", "prefix sums"],
    statement="Answer q questions: how many prime numbers are there between l and r, inclusive?",
    input="The first line contains q (1 ≤ q ≤ 2·10^4). Each of the next q lines contains l and r (1 ≤ l ≤ r ≤ 10^6).",
    output="For each question print the count on its own line.",
    examples=["3\n1 10\n11 19\n20 22\n"],
    sol="""import sys
data = sys.stdin.read().split()
q = int(data[0])
N = 10 ** 6
is_p = bytearray([1]) * (N + 1)
is_p[0] = is_p[1] = 0
for p in range(2, int(N ** 0.5) + 1):
    if is_p[p]:
        is_p[p * p :: p] = bytearray(len(range(p * p, N + 1, p)))
pref = [0] * (N + 1)
c = 0
for i in range(N + 1):
    c += is_p[i]
    pref[i] = c
out = []
for j in range(q):
    l, r = int(data[1 + 2 * j]), int(data[2 + 2 * j])
    out.append(pref[r] - pref[l - 1])
print("\\n".join(map(str, out)))""",
    brute="""q = int(input())
def prime(x):
    if x < 2: return False
    d = 2
    while d * d <= x:
        if x % d == 0: return False
        d += 1
    return True
for _ in range(q):
    l, r = map(int, input().split())
    print(sum(1 for x in range(l, r + 1) if prime(x)))""",
    small=lambda r: prime_q(r, r.randint(1, 4), 200),
    tests=lambda r: [L(2, (1, 1), (1000000, 1000000)), L(1, (1, 1000000)), prime_q(r, 2500, 10**6)],
)

problem(
    id=1219, title="Coin Ways", rating=1500, tags=["dp"],
    statement="In how many different ways can you pay exactly S using coins of the given values? You have as many coins of each value as you want. Two ways are different if some value is used a different number of times; the order of the coins does not matter. Print the answer modulo 1 000 000 007.",
    input="The first line contains k and S (1 ≤ k ≤ 50, 0 ≤ S ≤ 10^4). The second line contains k different coin values (1 ≤ c_i ≤ 10^4).",
    output="Print the number of ways modulo 10^9 + 7.",
    examples=["3 5\n1 2 5\n", "1 3\n2\n"],
    sol="""k, S = map(int, input().split())
coins = list(map(int, input().split()))
MOD = 10 ** 9 + 7
dp = [0] * (S + 1)
dp[0] = 1
for c in coins:
    for s in range(c, S + 1):
        dp[s] = (dp[s] + dp[s - c]) % MOD
print(dp[S])""",
    brute="""k, S = map(int, input().split())
coins = list(map(int, input().split()))
def ways(i, s):
    if s == 0: return 1
    if i == len(coins): return 0
    return sum(ways(i + 1, s - t * coins[i]) for t in range(s // coins[i] + 1))
print(ways(0, S) % (10 ** 9 + 7))""",
    small=lambda r: (lambda cs: L((len(cs), r.randint(0, 25)), cs))(r.sample(range(1, 9), r.randint(1, 4))),
    tests=lambda r: ["1 0\n7\n", "2 2000\n1 2\n", L((50, 2000), r.sample(range(1, 200), 50)), L((10, 9999), [2, 4, 6, 8, 10, 12, 14, 16, 18, 20])],
)

# --------------------------------------------------------------------------- 1600
problem(
    id=1220, title="Rising Sequence", rating=1600, tags=["dp", "binary search"],
    statement="Find the length of the longest strictly increasing subsequence. A subsequence keeps the order of the elements but may skip some of them.",
    input="The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers (|a_i| ≤ 10^9).",
    output="Print the length.",
    examples=["6\n3 1 4 1 5 9\n", "4\n5 5 5 5\n"],
    sol="""from bisect import bisect_left
n = int(input())
tails = []
for x in map(int, input().split()):
    i = bisect_left(tails, x)
    if i == len(tails):
        tails.append(x)
    else:
        tails[i] = x
print(len(tails))""",
    brute="""n = int(input())
a = list(map(int, input().split()))
best = [1] * n
for i in range(n):
    for j in range(i):
        if a[j] < a[i]:
            best[i] = max(best[i], best[j] + 1)
print(max(best))""",
    small=lambda r: (lambda n: L(n, [r.randint(-5, 5) for _ in range(n)]))(r.randint(1, 10)),
    tests=lambda r: ["1\n0\n", L(2500, list(range(2500))), L(2500, list(range(2500, 0, -1))), L(2500, [r.randint(-10**9, 10**9) for _ in range(2500)])],
)

def knap_gen(r, n, W, wmax):
    return L((n, W), *[(r.randint(1, wmax), r.randint(1, 10**9)) for _ in range(n)])


problem(
    id=1221, title="Light Backpack", rating=1600, tags=["dp"],
    statement="You have n items; item i weighs w_i and is worth v_i. Your backpack can carry a total weight of at most W. Each item can be taken at most once. What is the largest total value you can carry?",
    input="The first line contains n and W (1 ≤ n ≤ 100, 1 ≤ W ≤ 5000). Each of the next n lines contains w_i and v_i (1 ≤ w_i ≤ 5000, 1 ≤ v_i ≤ 10^9).",
    output="Print the largest total value.",
    examples=["3 5\n2 3\n3 4\n4 5\n", "1 3\n4 100\n"],
    sol="""n, W = map(int, input().split())
dp = [0] * (W + 1)
for _ in range(n):
    w, v = map(int, input().split())
    for c in range(W, w - 1, -1):
        t = dp[c - w] + v
        if t > dp[c]:
            dp[c] = t
print(dp[W])""",
    brute="""n, W = map(int, input().split())
items = [tuple(map(int, input().split())) for _ in range(n)]
best = 0
for mask in range(1 << n):
    w = sum(items[i][0] for i in range(n) if mask >> i & 1)
    if w <= W:
        best = max(best, sum(items[i][1] for i in range(n) if mask >> i & 1))
print(best)""",
    small=lambda r: (lambda n: L((n, r.randint(1, 20)), *[(r.randint(1, 10), r.randint(1, 30)) for _ in range(n)]))(r.randint(1, 8)),
    tests=lambda r: ["1 1\n1 1000000000\n", knap_gen(r, 100, 2500, 2500), knap_gen(r, 100, 2500, 200)],
)

def maze_gen(r, n, m, p):
    g = [["#" if r.random() < p else "." for _ in range(m)] for _ in range(n)]
    cells = [(i, j) for i in range(n) for j in range(m)]
    a, b = r.sample(cells, 2) if len(cells) > 1 else (cells[0], cells[0])
    g[a[0]][a[1]] = "S"; g[b[0]][b[1]] = "E"
    return L((n, m), *["".join(row) for row in g])


problem(
    id=1222, title="Maze Runner", rating=1600, tags=["graphs", "shortest paths", "bfs"],
    statement="A maze is an n × m grid: `.` is a free cell, `#` is a wall, `S` is the start and `E` is the exit. In one step you can move to a neighbouring free cell (up, down, left or right). What is the smallest number of steps from S to E? Print -1 if E cannot be reached.",
    input="The first line contains n and m (1 ≤ n, m ≤ 200, n·m ≥ 2). The next n lines contain m characters each. There is exactly one `S` and exactly one `E`.",
    output="Print the minimum number of steps, or -1.",
    examples=["3 4\nS.#.\n.##E\n....\n", "2 3\nS#E\n.#.\n"],
    sol="""from collections import deque
n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
for i in range(n):
    for j in range(m):
        if g[i][j] == "S": s = (i, j)
        if g[i][j] == "E": e = (i, j)
dist = [[-1] * m for _ in range(n)]
dist[s[0]][s[1]] = 0
q = deque([s])
while q:
    r, c = q.popleft()
    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
        if 0 <= nr < n and 0 <= nc < m and g[nr][nc] != "#" and dist[nr][nc] < 0:
            dist[nr][nc] = dist[r][c] + 1
            q.append((nr, nc))
print(dist[e[0]][e[1]])""",
    brute="""n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
INF = 10 ** 9
d = [[INF] * m for _ in range(n)]
for i in range(n):
    for j in range(m):
        if g[i][j] == "S": d[i][j] = 0
        if g[i][j] == "E": e = (i, j)
changed = True
while changed:
    changed = False
    for i in range(n):
        for j in range(m):
            if g[i][j] == "#": continue
            for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if 0 <= a < n and 0 <= b < m and d[a][b] + 1 < d[i][j]:
                    d[i][j] = d[a][b] + 1; changed = True
print(d[e[0]][e[1]] if d[e[0]][e[1]] < INF else -1)""",
    small=lambda r: maze_gen(r, r.randint(1, 6), r.randint(2, 6), 0.3),
    tests=lambda r: ["1 2\nSE\n", "1 3\nS#E\n", maze_gen(r, 200, 200, 0.25), maze_gen(r, 200, 200, 0.45), L((100, 100), *(["S" + "." * 99] + ["." * 100] * 98 + ["." * 99 + "E"]))],
)

def friends_gen(r, n, q):
    return L((n, q), *[(r.randint(1, n), r.randint(1, n)) for _ in range(q)])


problem(
    id=1223, title="Friend Groups", rating=1600, tags=["dsu", "graphs"],
    statement="There are n birds and, at first, no friendships. Then q friendships appear one by one. After each new friendship, print how many friend groups there are. Two birds are in the same group if they are connected by a chain of friendships.",
    input="The first line contains n and q (1 ≤ n, q ≤ 2·10^4). Each of the next q lines contains a and b (1 ≤ a, b ≤ n). A friendship may repeat, and a may be equal to b.",
    output="Print q lines: the number of groups after each friendship.",
    examples=["4 3\n1 2\n3 4\n2 1\n", "3 2\n1 1\n1 3\n"],
    sol="""import sys
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
parent = list(range(n + 1))
def find(x):
    root = x
    while parent[root] != root:
        root = parent[root]
    while parent[x] != root:
        parent[x], x = root, parent[x]
    return root
groups = n
out = []
for j in range(q):
    a, b = find(int(data[2 + 2 * j])), find(int(data[3 + 2 * j]))
    if a != b:
        parent[a] = b
        groups -= 1
    out.append(groups)
print("\\n".join(map(str, out)))""",
    brute="""n, q = map(int, input().split())
adj = [set() for _ in range(n + 1)]
for _ in range(q):
    a, b = map(int, input().split())
    adj[a].add(b); adj[b].add(a)
    seen = [False] * (n + 1); g = 0
    for s in range(1, n + 1):
        if not seen[s]:
            g += 1; st = [s]; seen[s] = True
            while st:
                x = st.pop()
                for y in adj[x]:
                    if not seen[y]: seen[y] = True; st.append(y)
    print(g)""",
    small=lambda r: friends_gen(r, r.randint(1, 7), r.randint(1, 7)),
    tests=lambda r: ["1 1\n1 1\n", friends_gen(r, 2500, 2500), friends_gen(r, 500, 3000), L((3000, 2999), *[(i, i + 1) for i in range(1, 3000)])],
)

# --------------------------------------------------------------------------- 1700
def rnd_word(r, n, alpha):
    return "".join(r.choice(alpha) for _ in range(n))


problem(
    id=1224, title="Common Thread", rating=1700, tags=["dp", "strings"],
    statement="Find the length of the longest common subsequence of two strings: the longest string that can be obtained from both of them by deleting some characters (possibly none) without changing the order of the rest.",
    input="Two lines, each with a string of 1 to 500 lowercase English letters.",
    output="Print the length of the longest common subsequence.",
    examples=["nestling\nwrestling\n", "abc\nxyz\n"],
    sol="""a = input().strip()
b = input().strip()
prev = [0] * (len(b) + 1)
for ca in a:
    cur = [0]
    for j, cb in enumerate(b):
        if ca == cb:
            cur.append(prev[j] + 1)
        else:
            cur.append(cur[j] if cur[j] > prev[j + 1] else prev[j + 1])
    prev = cur
print(prev[-1])""",
    brute="""from itertools import combinations
a = input().strip(); b = input().strip()
if len(a) > len(b): a, b = b, a
def sub(t, s):
    it = iter(s)
    return all(c in it for c in t)
best = 0
for k in range(len(a), 0, -1):
    if any(sub("".join(c), b) for c in combinations(a, k)):
        best = k; break
print(best)""",
    small=lambda r: rnd_word(r, r.randint(1, 7), "abc") + "\n" + rnd_word(r, r.randint(1, 8), "abc") + "\n",
    tests=lambda r: ["a\na\n", "a\nb\n", rnd_word(r, 500, "abcd") + "\n" + rnd_word(r, 500, "abcd") + "\n", rnd_word(r, 500, "abcdefghijklmnopqrstuvwxyz") + "\n" + rnd_word(r, 500, "abcdefghijklmnopqrstuvwxyz") + "\n"],
)

problem(
    id=1225, title="Word Repair", rating=1700, tags=["dp", "strings"],
    statement="In one operation you can insert a letter, delete a letter or replace a letter with another one. What is the smallest number of operations that turns the first word into the second word?",
    input="Two lines, each with a word of 1 to 500 lowercase English letters.",
    output="Print the minimum number of operations.",
    examples=["bird\nbeard\n", "nest\nnest\n", "kitten\nsitting\n"],
    sol="""a = input().strip()
b = input().strip()
prev = list(range(len(b) + 1))
for i, ca in enumerate(a, 1):
    cur = [i]
    for j, cb in enumerate(b, 1):
        cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
    prev = cur
print(prev[-1])""",
    brute="""from collections import deque
a = input().strip(); b = input().strip()
alpha = sorted(set(a + b))
dist = {a: 0}; q = deque([a])
while q:
    s = q.popleft()
    if s == b: break
    nxt = set()
    for i in range(len(s) + 1):
        for c in alpha: nxt.add(s[:i] + c + s[i:])
    for i in range(len(s)):
        nxt.add(s[:i] + s[i + 1:])
        for c in alpha: nxt.add(s[:i] + c + s[i + 1:])
    for t in nxt:
        if t not in dist and len(t) <= max(len(a), len(b)):
            dist[t] = dist[s] + 1; q.append(t)
print(dist[b])""",
    small=lambda r: rnd_word(r, r.randint(1, 4), "ab") + "\n" + rnd_word(r, r.randint(1, 4), "ab") + "\n",
    tests=lambda r: ["a\nb\n", "a\naaaaaaaaaa\n", rnd_word(r, 500, "abc") + "\n" + rnd_word(r, 480, "abc") + "\n", rnd_word(r, 500, "abcdefghijklmnopqrstuvwxyz") + "\n" + rnd_word(r, 500, "abcdefghijklmnopqrstuvwxyz") + "\n"],
)

def dag_gen(r, n, m, cycle=False):
    perm = list(range(1, n + 1)); r.shuffle(perm)
    rows = set()
    while len(rows) < m:
        i, j = sorted(r.sample(range(n), 2))
        rows.add((perm[i], perm[j]))
    rows = list(rows)
    if cycle and rows:
        a, b = rows[0]; rows.append((b, a))
    r.shuffle(rows)
    return L((n, len(rows)), *rows)


problem(
    id=1226, title="Course Order", rating=1700, tags=["graphs", "topological sort", "data structures"],
    statement="There are n courses, numbered from 1 to n, and m rules of the form \"course a must be taken before course b\". Find an order in which to take all the courses that respects every rule. If there are several such orders, print the one that is smallest in dictionary order (compare the first course, then the second, and so on). If no order exists, print `IMPOSSIBLE`.",
    input="The first line contains n and m (1 ≤ n ≤ 2·10^4, 0 ≤ m ≤ 2·10^4). Each of the next m lines contains a and b (1 ≤ a, b ≤ n, a ≠ b).",
    output="Print n course numbers separated by spaces, or `IMPOSSIBLE`.",
    examples=["4 3\n2 1\n3 1\n4 3\n", "2 2\n1 2\n2 1\n"],
    sol="""import sys, heapq
data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
indeg = [0] * (n + 1)
for j in range(m):
    a, b = int(data[2 + 2 * j]), int(data[3 + 2 * j])
    adj[a].append(b)
    indeg[b] += 1
heap = [v for v in range(1, n + 1) if indeg[v] == 0]
heapq.heapify(heap)
order = []
while heap:
    v = heapq.heappop(heap)
    order.append(v)
    for w in adj[v]:
        indeg[w] -= 1
        if indeg[w] == 0:
            heapq.heappush(heap, w)
print(" ".join(map(str, order)) if len(order) == n else "IMPOSSIBLE")""",
    brute="""from itertools import permutations
n, m = map(int, input().split())
rules = [tuple(map(int, input().split())) for _ in range(m)]
for p in permutations(range(1, n + 1)):
    pos = {v: i for i, v in enumerate(p)}
    if all(pos[a] < pos[b] for a, b in rules):
        print(" ".join(map(str, p))); break
else:
    print("IMPOSSIBLE")""",
    small=lambda r: (lambda n: dag_gen(r, n, r.randint(0, min(6, n * (n - 1) // 2)), cycle=r.random() < 0.2))(r.randint(1, 6)),
    tests=lambda r: ["1 0\n", "3 0\n", dag_gen(r, 2500, 2500), dag_gen(r, 2500, 3000, cycle=True), L((3000, 2999), *[(i + 1, i) for i in range(1, 3000)])],
)

problem(
    id=1227, title="Window Maximum", rating=1700, tags=["data structures", "two pointers"],
    statement="For every block of k consecutive elements, print the largest element of that block, going from left to right.",
    input="The first line contains n and k (1 ≤ k ≤ n ≤ 2·10^4). The second line contains n integers (|a_i| ≤ 10^9).",
    output="Print n − k + 1 numbers separated by spaces.",
    examples=["8 3\n1 3 -1 -3 5 3 6 7\n", "3 3\n4 2 9\n"],
    sol="""from collections import deque
n, k = map(int, input().split())
a = list(map(int, input().split()))
dq = deque()
out = []
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()
    if i >= k - 1:
        out.append(a[dq[0]])
print(" ".join(map(str, out)))""",
    brute="""n, k = map(int, input().split())
a = list(map(int, input().split()))
print(" ".join(str(max(a[i:i + k])) for i in range(n - k + 1)))""",
    small=lambda r: (lambda n: L((n, r.randint(1, n)), [r.randint(-5, 5) for _ in range(n)]))(r.randint(1, 10)),
    tests=lambda r: ["1 1\n-7\n", L((2500, 2000), [r.randint(0, 99999) for _ in range(2500)]), L((3000, 1), [r.randint(-9, 9) for _ in range(3000)]), L((3000, 50), list(range(3000, 0, -1)))],
)

# --------------------------------------------------------------------------- 1800
problem(
    id=1228, title="Inversion Count", rating=1800, tags=["data structures", "sortings", "divide and conquer"],
    statement="An inversion is a pair of positions i < j such that a_i > a_j. Count the inversions in the list.",
    input="The first line contains n (1 ≤ n ≤ 2·10^4). The second line contains n integers (1 ≤ a_i ≤ 10^9).",
    output="Print the number of inversions.",
    examples=["5\n2 4 1 3 5\n", "4\n4 3 2 1\n"],
    sol="""n = int(input())
a = list(map(int, input().split()))
rank = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
size = len(rank)
tree = [0] * (size + 1)
inv = 0
for seen, x in enumerate(a):
    r = rank[x]
    i, less_or_eq = r, 0
    while i:
        less_or_eq += tree[i]
        i -= i & -i
    inv += seen - less_or_eq
    i = r
    while i <= size:
        tree[i] += 1
        i += i & -i
print(inv)""",
    brute="""n = int(input())
a = list(map(int, input().split()))
print(sum(1 for i in range(n) for j in range(i + 1, n) if a[i] > a[j]))""",
    small=lambda r: (lambda n: L(n, [r.randint(1, 6) for _ in range(n)]))(r.randint(1, 10)),
    tests=lambda r: ["1\n5\n", L(2500, list(range(2500, 0, -1))), L(2500, [r.randint(1, 10**9) for _ in range(2500)]), L(2500, [r.randint(1, 3) for _ in range(2500)])],
)

def graph_gen(r, n, m, wmax, connected=True):
    rows = []
    if n == 1:
        m = 0
    if connected:
        for v in range(2, n + 1):
            rows.append((r.randint(1, v - 1), v, r.randint(1, wmax)))
    while len(rows) < m:
        u, v = r.randint(1, n), r.randint(1, n)
        if u != v:
            rows.append((u, v, r.randint(1, wmax)))
    r.shuffle(rows)
    rows = [(v, u, w) if r.random() < 0.5 else (u, v, w) for u, v, w in rows]
    return L((n, len(rows)), *rows)


problem(
    id=1229, title="Road Trip", rating=1800, tags=["graphs", "shortest paths"],
    statement="There are n towns and m two-way roads. Road i connects towns u_i and v_i and takes w_i minutes to drive. What is the shortest travel time from town 1 to town n? Print -1 if town n cannot be reached.",
    input="The first line contains n and m (2 ≤ n ≤ 10^4, 0 ≤ m ≤ 2·10^4). Each of the next m lines contains u_i, v_i and w_i (1 ≤ u_i, v_i ≤ n, u_i ≠ v_i, 1 ≤ w_i ≤ 10^6).",
    output="Print the shortest time, or -1.",
    examples=["4 4\n1 2 5\n2 4 5\n1 3 2\n3 4 9\n", "3 1\n1 2 7\n"],
    sol="""import sys, heapq
data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
for j in range(m):
    u, v, w = int(data[2 + 3 * j]), int(data[3 + 3 * j]), int(data[4 + 3 * j])
    adj[u].append((v, w))
    adj[v].append((u, w))
INF = float("inf")
dist = [INF] * (n + 1)
dist[1] = 0
pq = [(0, 1)]
while pq:
    d, u = heapq.heappop(pq)
    if d > dist[u]:
        continue
    for v, w in adj[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heapq.heappush(pq, (dist[v], v))
print(dist[n] if dist[n] < INF else -1)""",
    brute="""n, m = map(int, input().split())
edges = [tuple(map(int, input().split())) for _ in range(m)]
INF = 10 ** 18
d = [INF] * (n + 1); d[1] = 0
for _ in range(n):
    for u, v, w in edges:
        if d[u] + w < d[v]: d[v] = d[u] + w
        if d[v] + w < d[u]: d[u] = d[v] + w
print(d[n] if d[n] < INF else -1)""",
    small=lambda r: (lambda n: graph_gen(r, n, r.randint(0, 8), 9, connected=r.random() < 0.6))(r.randint(2, 6)),
    tests=lambda r: ["2 0\n", "2 1\n1 2 1000000\n", graph_gen(r, 2000, 2500, 10**6), graph_gen(r, 2000, 4000, 10, connected=False), L((2500, 2499), *[(i, i + 1, 1000000) for i in range(1, 2500)])],
)

problem(
    id=1230, title="Cheapest Network", rating=1800, tags=["graphs", "dsu", "greedy"],
    statement="n computers have to be connected into one network. There are m cables you can lay; cable i connects computers u_i and v_i and costs w_i. What is the smallest total cost to connect all the computers, directly or through other computers? Print -1 if it is impossible.",
    input="The first line contains n and m (1 ≤ n ≤ 10^4, 0 ≤ m ≤ 2·10^4). Each of the next m lines contains u_i, v_i and w_i (1 ≤ u_i, v_i ≤ n, u_i ≠ v_i, 1 ≤ w_i ≤ 10^6).",
    output="Print the minimum total cost, or -1.",
    examples=["4 5\n1 2 3\n2 3 1\n3 4 4\n1 4 2\n1 3 5\n", "3 1\n1 2 5\n"],
    sol="""import sys
data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
edges = sorted((int(data[4 + 3 * j]), int(data[2 + 3 * j]), int(data[3 + 3 * j])) for j in range(m))
parent = list(range(n + 1))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
total, used = 0, 0
for w, u, v in edges:
    a, b = find(u), find(v)
    if a != b:
        parent[a] = b
        total += w
        used += 1
print(total if used == n - 1 else -1)""",
    brute="""n, m = map(int, input().split())
INF = 10 ** 18
best = [[INF] * (n + 1) for _ in range(n + 1)]
for _ in range(m):
    u, v, w = map(int, input().split())
    best[u][v] = best[v][u] = min(best[u][v], w)
inside = [False] * (n + 1); key = [INF] * (n + 1); key[1] = 0; total = 0
for _ in range(n):
    u = min((v for v in range(1, n + 1) if not inside[v]), key=lambda v: key[v])
    if key[u] >= INF: print(-1); break
    inside[u] = True; total += key[u]
    for v in range(1, n + 1):
        if not inside[v] and best[u][v] < key[v]: key[v] = best[u][v]
else:
    print(total)""",
    small=lambda r: (lambda n: graph_gen(r, n, r.randint(0, 8), 9, connected=r.random() < 0.7))(r.randint(1, 6)),
    tests=lambda r: ["1 0\n", "2 0\n", graph_gen(r, 2000, 2500, 10**6), graph_gen(r, 2000, 3000, 5, connected=False)],
)

# --------------------------------------------------------------------------- 1900
problem(
    id=1231, title="Fair Split", rating=1900, tags=["binary search", "greedy"],
    statement="n boxes stand in a row; box i weighs a_i. Split the row into exactly k groups of neighbouring boxes (every group gets at least one box) so that the heaviest group is as light as possible. Print the weight of the heaviest group in the best split.",
    input="The first line contains n and k (1 ≤ k ≤ n ≤ 2·10^4). The second line contains n integers (1 ≤ a_i ≤ 10^9).",
    output="Print the smallest possible weight of the heaviest group.",
    examples=["5 2\n7 2 5 10 8\n", "4 4\n1 2 3 4\n"],
    sol="""n, k = map(int, input().split())
a = list(map(int, input().split()))
def groups(limit):
    g, cur = 1, 0
    for x in a:
        if cur + x > limit:
            g += 1
            cur = x
        else:
            cur += x
    return g
lo, hi = max(a), sum(a)
while lo < hi:
    mid = (lo + hi) // 2
    if groups(mid) <= k:
        hi = mid
    else:
        lo = mid + 1
print(lo)""",
    brute="""n, k = map(int, input().split())
a = list(map(int, input().split()))
INF = float("inf")
pre = [0]
for x in a: pre.append(pre[-1] + x)
f = [[INF] * (k + 1) for _ in range(n + 1)]; f[0][0] = 0
for i in range(1, n + 1):
    for g in range(1, k + 1):
        for j in range(i):
            f[i][g] = min(f[i][g], max(f[j][g - 1], pre[i] - pre[j]))
print(f[n][k])""",
    small=lambda r: (lambda n: L((n, r.randint(1, n)), [r.randint(1, 9) for _ in range(n)]))(r.randint(1, 8)),
    tests=lambda r: ["1 1\n1000000000\n", L((2500, 1), [10**9] * 2500), L((2500, 137), [r.randint(1, 10**9) for _ in range(2500)]), L((2500, 2500), [r.randint(1, 100) for _ in range(2500)])],
)

problem(
    id=1232, title="Far Apart Nests", rating=1900, tags=["binary search", "greedy", "sortings"],
    statement="There are n free spots on a long branch at positions x_1 … x_n. k birds want to sit on different spots and stay as far from each other as possible. Choose the spots so that the smallest distance between two of the birds is as large as possible, and print that distance.",
    input="The first line contains n and k (2 ≤ k ≤ n ≤ 2·10^4). The second line contains n different integers (0 ≤ x_i ≤ 10^9).",
    output="Print the largest possible smallest distance.",
    examples=["5 3\n1 2 8 4 9\n", "2 2\n0 1000000000\n"],
    sol="""n, k = map(int, input().split())
x = sorted(map(int, input().split()))
def fits(d):
    cnt, last = 1, x[0]
    for v in x[1:]:
        if v - last >= d:
            cnt += 1
            last = v
    return cnt >= k
lo, hi = 0, x[-1] - x[0]
while lo < hi:
    mid = (lo + hi + 1) // 2
    if fits(mid):
        lo = mid
    else:
        hi = mid - 1
print(lo)""",
    brute="""from itertools import combinations
n, k = map(int, input().split())
x = sorted(map(int, input().split()))
print(max(min(c[i + 1] - c[i] for i in range(k - 1)) for c in combinations(x, k)))""",
    small=lambda r: (lambda n: L((n, r.randint(2, n)), r.sample(range(0, 30), n)))(r.randint(2, 8)),
    tests=lambda r: [L((2500, 2), r.sample(range(10**9), 2500)), L((2500, 2500), r.sample(range(10**9), 2500)), L((2500, 777), r.sample(range(10**9), 2500))],
)

# --------------------------------------------------------------------------- 2000
def rmq_gen(r, n, q, vmax):
    a = [r.randint(-vmax, vmax) for _ in range(n)]
    ops = []
    for _ in range(q):
        if r.random() < 0.5:
            ops.append((1, r.randint(1, n), r.randint(-vmax, vmax)))
        else:
            l = r.randint(1, n); ops.append((2, l, r.randint(l, n)))
    return L((n, q), a, *ops)


problem(
    id=1233, title="Changing Minimum", rating=2000, tags=["data structures"],
    statement="You are given a list of n numbers and q operations of two kinds: `1 i x` sets a_i to x, and `2 l r` asks for the smallest of a_l, a_{l+1}, …, a_r. Answer all the questions.",
    input="The first line contains n and q (1 ≤ n, q ≤ 2·10^4). The second line contains a_1 … a_n. Each of the next q lines contains one operation (1 ≤ i ≤ n, 1 ≤ l ≤ r ≤ n). All values are between −10^9 and 10^9.",
    output="For each operation of the second kind print the answer on its own line.",
    examples=["5 5\n4 2 7 1 9\n2 1 3\n1 2 8\n2 1 3\n2 4 5\n1 4 10\n"],
    sol="""import sys
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
size = 1
while size < n:
    size *= 2
INF = float("inf")
t = [INF] * (2 * size)
for i in range(n):
    t[size + i] = int(data[2 + i])
for i in range(size - 1, 0, -1):
    t[i] = min(t[2 * i], t[2 * i + 1])
pos = 2 + n
out = []
for _ in range(q):
    kind, x, y = data[pos], int(data[pos + 1]), int(data[pos + 2])
    pos += 3
    if kind == "1":
        i = size + x - 1
        t[i] = y
        i //= 2
        while i:
            t[i] = min(t[2 * i], t[2 * i + 1])
            i //= 2
    else:
        l, r, res = x - 1 + size, y + size, INF
        while l < r:
            if l & 1:
                res = min(res, t[l]); l += 1
            if r & 1:
                r -= 1; res = min(res, t[r])
            l //= 2; r //= 2
        out.append(res)
print("\\n".join(map(str, out)))""",
    brute="""n, q = map(int, input().split())
a = list(map(int, input().split()))
for _ in range(q):
    k, x, y = map(int, input().split())
    if k == 1: a[x - 1] = y
    else: print(min(a[x - 1:y]))""",
    small=lambda r: rmq_gen(r, r.randint(1, 7), r.randint(1, 7), 9),
    tests=lambda r: [L((1, 2), [5], (2, 1, 1), (1, 1, -5)) + "", rmq_gen(r, 2500, 2500, 10**9), rmq_gen(r, 3000, 3000, 5)],
)

problem(
    id=1234, title="Grand Tour", rating=2000, tags=["dp", "bitmasks"],
    statement="A courier has to visit n cities. The tour starts and ends in city 1 and visits every other city exactly once. Driving from city i to city j takes d_ij minutes, which may be different from d_ji. What is the shortest total time of such a tour?",
    input="The first line contains n (2 ≤ n ≤ 12). Each of the next n lines contains n integers d_i1 … d_in (0 ≤ d_ij ≤ 10^6, d_ii = 0).",
    output="Print the minimum total time.",
    examples=["4\n0 10 15 20\n5 0 9 10\n6 13 0 12\n8 8 9 0\n", "2\n0 3\n4 0\n"],
    sol="""n = int(input())
d = [list(map(int, input().split())) for _ in range(n)]
m = n - 1
FULL = 1 << m
INF = float("inf")
dp = [[INF] * m for _ in range(FULL)]
for j in range(m):
    dp[1 << j][j] = d[0][j + 1]
for mask in range(1, FULL):
    row = dp[mask]
    for j in range(m):
        cur = row[j]
        if cur == INF or not mask >> j & 1:
            continue
        dj = d[j + 1]
        for k in range(m):
            if not mask >> k & 1:
                nm = mask | 1 << k
                v = cur + dj[k + 1]
                if v < dp[nm][k]:
                    dp[nm][k] = v
print(min(dp[FULL - 1][j] + d[j + 1][0] for j in range(m)))""",
    brute="""from itertools import permutations
n = int(input())
d = [list(map(int, input().split())) for _ in range(n)]
best = None
for p in permutations(range(1, n)):
    route = (0,) + p + (0,)
    c = sum(d[route[i]][route[i + 1]] for i in range(n))
    best = c if best is None else min(best, c)
print(best)""",
    small=lambda r: (lambda n: L(n, *[[0 if i == j else r.randint(0, 20) for j in range(n)] for i in range(n)]))(r.randint(2, 7)),
    tests=lambda r: [L(12, *[[0 if i == j else r.randint(0, 10**6) for j in range(12)] for i in range(12)]), L(12, *[[0 if i == j else r.randint(1, 9) for j in range(12)] for i in range(12)]), L(11, *[[0 if i == j else (i * 7 + j * 13) % 100 for j in range(11)] for i in range(11)])],
)

# --------------------------------------------------------------------------- 2100
def free_gen(r, n, m, k, wmax, connected=True):
    g = graph_gen(r, n, m, wmax, connected)
    head, rest = g.split("\n", 1)
    nn, mm = head.split()
    return f"{nn} {mm} {k}\n" + rest


problem(
    id=1235, title="Free Tickets", rating=2100, tags=["graphs", "shortest paths"],
    statement="There are n towns and m two-way roads. Road i connects towns u_i and v_i and takes w_i minutes to drive. You also have k free tickets: using a ticket on a road makes that drive take 0 minutes. Each ticket can be used only once. What is the shortest travel time from town 1 to town n? Print -1 if town n cannot be reached.",
    input="The first line contains n, m and k (2 ≤ n ≤ 5000, 0 ≤ m ≤ 10^4, 0 ≤ k ≤ 10). Each of the next m lines contains u_i, v_i and w_i (1 ≤ u_i, v_i ≤ n, u_i ≠ v_i, 1 ≤ w_i ≤ 10^6).",
    output="Print the shortest time, or -1.",
    examples=["4 4 1\n1 2 5\n2 4 5\n1 3 2\n3 4 9\n", "3 2 0\n1 2 4\n2 3 4\n"],
    notes="In the first example use the ticket on the road from 3 to 4: 2 + 0 = 2 minutes.",
    sol="""import sys, heapq
data = sys.stdin.read().split()
n, m, k = int(data[0]), int(data[1]), int(data[2])
adj = [[] for _ in range(n + 1)]
for j in range(m):
    u, v, w = int(data[3 + 3 * j]), int(data[4 + 3 * j]), int(data[5 + 3 * j])
    adj[u].append((v, w))
    adj[v].append((u, w))
INF = float("inf")
dist = [[INF] * (k + 1) for _ in range(n + 1)]
dist[1][0] = 0
pq = [(0, 1, 0)]
while pq:
    d, u, used = heapq.heappop(pq)
    if d > dist[u][used]:
        continue
    for v, w in adj[u]:
        if d + w < dist[v][used]:
            dist[v][used] = d + w
            heapq.heappush(pq, (d + w, v, used))
        if used < k and d < dist[v][used + 1]:
            dist[v][used + 1] = d
            heapq.heappush(pq, (d, v, used + 1))
best = min(dist[n])
print(best if best < INF else -1)""",
    brute="""n, m, k = map(int, input().split())
edges = [tuple(map(int, input().split())) for _ in range(m)]
INF = 10 ** 18
d = [[INF] * (k + 1) for _ in range(n + 1)]; d[1][0] = 0
for _ in range(n * (k + 1) + 1):
    for u, v, w in edges:
        for a, b in ((u, v), (v, u)):
            for t in range(k + 1):
                if d[a][t] + w < d[b][t]: d[b][t] = d[a][t] + w
                if t < k and d[a][t] < d[b][t + 1]: d[b][t + 1] = d[a][t]
best = min(d[n])
print(best if best < INF else -1)""",
    small=lambda r: (lambda n: free_gen(r, n, r.randint(0, 7), r.randint(0, 2), 9, connected=r.random() < 0.7))(r.randint(2, 5)),
    tests=lambda r: ["2 0 5\n", "2 1 0\n1 2 1000000\n", free_gen(r, 2500, 4000, 10, 10**6), free_gen(r, 2500, 4000, 3, 10**6), free_gen(r, 3000, 2500, 0, 100, connected=False)],
)

def tree_gen(r, n, q, line=False):
    rows = []
    for v in range(2, n + 1):
        p = v - 1 if line else r.randint(max(1, v - 50), v - 1) if r.random() < 0.5 else r.randint(1, v - 1)
        rows.append((p, v, r.randint(1, 10**6)) if r.random() < 0.5 else (v, p, r.randint(1, 10**6)))
    r.shuffle(rows)
    qs = [(r.randint(1, n), r.randint(1, n)) for _ in range(q)]
    return L((n, q), *rows, *qs)


problem(
    id=1236, title="Tree Distances", rating=2100, tags=["trees", "graphs", "binary lifting"],
    statement="A tree has n nodes and n − 1 roads with lengths. Answer q questions: what is the distance between nodes u and v, that is, the total length of the roads on the path between them?",
    input="The first line contains n and q (1 ≤ n, q ≤ 2·10^4). Each of the next n − 1 lines contains u, v and w: a road of length w (1 ≤ w ≤ 10^6) between u and v. Each of the next q lines contains a question u v (1 ≤ u, v ≤ n).",
    output="For each question print the distance on its own line.",
    examples=["5 3\n1 2 3\n1 3 4\n3 4 2\n3 5 6\n2 4\n4 5\n1 1\n"],
    sol="""import sys
from collections import deque
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
p = 2
for _ in range(n - 1):
    u, v, w = int(data[p]), int(data[p + 1]), int(data[p + 2]); p += 3
    adj[u].append((v, w))
    adj[v].append((u, w))
LOG = max(1, n.bit_length())
up = [[0] * (n + 1) for _ in range(LOG)]
depth = [0] * (n + 1)
dist = [0] * (n + 1)
seen = [False] * (n + 1)
seen[1] = True
up[0][1] = 1
dq = deque([1])
while dq:
    u = dq.popleft()
    for v, w in adj[u]:
        if not seen[v]:
            seen[v] = True
            up[0][v] = u
            depth[v] = depth[u] + 1
            dist[v] = dist[u] + w
            dq.append(v)
for j in range(1, LOG):
    prev, cur = up[j - 1], up[j]
    for v in range(1, n + 1):
        cur[v] = prev[prev[v]]
def lca(a, b):
    if depth[a] < depth[b]:
        a, b = b, a
    diff = depth[a] - depth[b]
    j = 0
    while diff:
        if diff & 1:
            a = up[j][a]
        diff >>= 1; j += 1
    if a == b:
        return a
    for j in range(LOG - 1, -1, -1):
        if up[j][a] != up[j][b]:
            a, b = up[j][a], up[j][b]
    return up[0][a]
out = []
for _ in range(q):
    u, v = int(data[p]), int(data[p + 1]); p += 2
    out.append(dist[u] + dist[v] - 2 * dist[lca(u, v)])
print("\\n".join(map(str, out)))""",
    brute="""n, q = map(int, input().split())
adj = [[] for _ in range(n + 1)]
for _ in range(n - 1):
    u, v, w = map(int, input().split())
    adj[u].append((v, w)); adj[v].append((u, w))
for _ in range(q):
    u, v = map(int, input().split())
    d = {u: 0}; st = [u]
    while st:
        x = st.pop()
        for y, w in adj[x]:
            if y not in d: d[y] = d[x] + w; st.append(y)
    print(d[v])""",
    small=lambda r: tree_gen(r, r.randint(1, 8), r.randint(1, 5)),
    tests=lambda r: ["1 1\n1 1\n", tree_gen(r, 2500, 2500), tree_gen(r, 2500, 2500, line=True)],
)

# --------------------------------------------------------------------------- 2200
problem(
    id=1237, title="No Twin Digits", rating=2200, tags=["dp", "math"],
    statement="How many integers from 1 to N have no two equal neighbouring digits? For example, 121 and 7 count, but 112 does not. Answer t such questions.",
    input="The first line contains t (1 ≤ t ≤ 100). Each of the next t lines contains one integer N (1 ≤ N ≤ 10^18).",
    output="For each N print the answer on its own line.",
    examples=["3\n10\n100\n121\n"],
    sol="""def count(N):
    s = str(N)
    L = len(s)
    total = sum(9 ** length for length in range(1, L))
    prev = -1
    for i, ch in enumerate(s):
        d = int(ch)
        for x in range(1 if i == 0 else 0, d):
            if x != prev:
                total += 9 ** (L - i - 1)
        if d == prev:
            return total
        prev = d
    return total + 1
t = int(input())
for _ in range(t):
    print(count(int(input())))""",
    brute="""t = int(input())
for _ in range(t):
    N = int(input())
    c = 0
    for x in range(1, N + 1):
        s = str(x)
        if all(s[i] != s[i + 1] for i in range(len(s) - 1)): c += 1
    print(c)""",
    small=lambda r: L(3, r.randint(1, 3000), r.randint(1, 20000), r.choice([9, 10, 11, 99, 100, 101, 110, 1000, 1010, 1100, 9898])),
    tests=lambda r: [L(5, 1, 9, 10, 11, 1000000000000000000), L(100, *[r.randint(1, 10**18) for _ in range(100)]), L(6, 999999999999999999, 989898989898989898, 112233445566778899, 100000000000000000, 121212121212121212, 543210)],
)

# --------------------------------------------------------------------------- 2300
def bridge_gen(r, n, m):
    rows = []
    # a chain of small blobs: blobs have cycles, chain links are bridges
    v = 1
    blobs = []
    while v <= n:
        size = r.randint(1, 5)
        blob = list(range(v, min(n, v + size - 1) + 1))
        blobs.append(blob); v += size
    for b in blobs:
        for i in range(1, len(b)):
            rows.append((b[i - 1], b[i]))
        if len(b) > 2:
            rows.append((b[0], b[-1]))
        if len(b) == 2 and r.random() < 0.3:
            rows.append((b[0], b[1]))
    for i in range(1, len(blobs)):
        rows.append((r.choice(blobs[r.randint(max(0, i - 3), i - 1)]), r.choice(blobs[i])))
    while len(rows) < m:
        a, b = r.randint(1, n), r.randint(1, n)
        if a != b and r.random() < 0.02:
            rows.append((a, b))
        elif a != b and abs(a - b) < 6:
            rows.append((a, b))
    rows = rows[:max(m, 0)] if len(rows) > m else rows
    r.shuffle(rows)
    return L((n, len(rows)), *rows)


problem(
    id=1238, title="Weak Bridges", rating=2300, tags=["graphs", "dfs and similar"],
    statement="A road network has n towns and m two-way roads. A road is critical if, after closing it, some two towns that could reach each other before can no longer reach each other. How many critical roads are there? There may be several roads between the same two towns, but no road connects a town to itself.",
    input="The first line contains n and m (1 ≤ n ≤ 2·10^4, 0 ≤ m ≤ 2·10^4). Each of the next m lines contains u and v (1 ≤ u, v ≤ n, u ≠ v).",
    output="Print the number of critical roads.",
    examples=["5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n", "2 2\n1 2\n2 1\n"],
    sol="""import sys
data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
adj = [[] for _ in range(n + 1)]
for j in range(m):
    u, v = int(data[2 + 2 * j]), int(data[3 + 2 * j])
    adj[u].append((v, j))
    adj[v].append((u, j))
tin = [0] * (n + 1)
low = [0] * (n + 1)
timer = 0
bridges = 0
for s in range(1, n + 1):
    if tin[s]:
        continue
    timer += 1
    tin[s] = low[s] = timer
    stack = [(s, -1, 0)]
    while stack:
        u, pe, i = stack[-1]
        if i < len(adj[u]):
            stack[-1] = (u, pe, i + 1)
            v, e = adj[u][i]
            if e == pe:
                continue
            if tin[v]:
                low[u] = min(low[u], tin[v])
            else:
                timer += 1
                tin[v] = low[v] = timer
                stack.append((v, e, 0))
        else:
            stack.pop()
            if stack:
                p = stack[-1][0]
                low[p] = min(low[p], low[u])
                if low[u] > tin[p]:
                    bridges += 1
print(bridges)""",
    brute="""n, m = map(int, input().split())
edges = [tuple(map(int, input().split())) for _ in range(m)]
def comps(skip):
    p = list(range(n + 1))
    def f(x):
        while p[x] != x: x = p[x]
        return x
    for i, (u, v) in enumerate(edges):
        if i != skip: p[f(u)] = f(v)
    return len({f(v) for v in range(1, n + 1)})
base = comps(-1)
print(sum(1 for i in range(m) if comps(i) > base))""",
    small=lambda r: (lambda n: L((n, 0)) if n == 1 else (lambda rows: L((n, len(rows)), *rows))([(a, b) for a, b in ((r.randint(1, n), r.randint(1, n)) for _ in range(r.randint(0, 9))) if a != b]))(r.randint(1, 7)),
    tests=lambda r: ["1 0\n", "2 1\n1 2\n", bridge_gen(r, 2500, 2500), L((3000, 2999), *[(i, i + 1) for i in range(1, 3000)]), L((3000, 3000), *([(i, i + 1) for i in range(1, 3000)] + [(3000, 1)]))],
)

# --------------------------------------------------------------------------- 2400
problem(
    id=1239, title="Merge Piles", rating=2400, tags=["dp"],
    statement="n piles of stones stand in a row; pile i has a_i stones. In one move you merge two neighbouring piles into one pile, and the move costs the total number of stones in the new pile. You keep merging until only one pile is left. What is the smallest possible total cost?",
    input="The first line contains n (1 ≤ n ≤ 400). The second line contains n integers (1 ≤ a_i ≤ 10^6).",
    output="Print the minimum total cost.",
    examples=["4\n1 2 3 4\n", "3\n5 5 5\n", "1\n7\n"],
    notes="In the first example merge 1 and 2 (cost 3), then 3 and 3 (cost 6), then 6 and 4 (cost 10): 19 in total.",
    sol="""n = int(input())
a = list(map(int, input().split()))
pre = [0]
for x in a:
    pre.append(pre[-1] + x)
INF = float("inf")
dp = [[0] * n for _ in range(n)]
opt = [[0] * n for _ in range(n)]
for i in range(n):
    opt[i][i] = i
for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length - 1
        best, arg = INF, i
        lo = opt[i][j - 1]
        hi = min(opt[i + 1][j], j - 1)
        row_i = dp[i]
        for k in range(lo, hi + 1):
            v = row_i[k] + dp[k + 1][j]
            if v < best:
                best, arg = v, k
        dp[i][j] = best + pre[j + 1] - pre[i]
        opt[i][j] = arg
print(dp[0][n - 1])""",
    brute="""n = int(input())
a = list(map(int, input().split()))
pre = [0]
for x in a: pre.append(pre[-1] + x)
dp = [[0] * n for _ in range(n)]
for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length - 1
        dp[i][j] = min(dp[i][k] + dp[k + 1][j] for k in range(i, j)) + pre[j + 1] - pre[i]
print(dp[0][n - 1])""",
    small=lambda r: (lambda n: L(n, [r.randint(1, 20) for _ in range(n)]))(r.randint(1, 12)),
    tests=lambda r: [L(400, [r.randint(1, 10**6) for _ in range(400)]), L(400, [1] * 400), L(400, [r.choice([1, 1000000]) for _ in range(400)]), L(2, [1000000, 1000000])],
)

# --------------------------------------------------------------------------- 2500
def distinct_gen(r, n, q, vmax):
    a = [r.randint(1, vmax) for _ in range(n)]
    qs = []
    for _ in range(q):
        l = r.randint(1, n); qs.append((l, r.randint(l, n)))
    return L((n, q), a, *qs)


problem(
    id=1240, title="Distinct in Range", rating=2500, tags=["data structures", "sortings"],
    statement="You are given n numbers. Answer q questions: how many different values are there among a_l, a_{l+1}, …, a_r?",
    input="The first line contains n and q (1 ≤ n, q ≤ 2·10^4). The second line contains n integers (1 ≤ a_i ≤ 10^9). Each of the next q lines contains l and r (1 ≤ l ≤ r ≤ n).",
    output="For each question print the answer on its own line.",
    examples=["6 4\n1 2 1 3 2 2\n1 3\n2 5\n4 4\n1 6\n"],
    sol="""import sys
data = sys.stdin.read().split()
n, q = int(data[0]), int(data[1])
a = data[2:2 + n]
queries = []
p = 2 + n
for idx in range(q):
    l, r = int(data[p]), int(data[p + 1]); p += 2
    queries.append((r, l, idx))
queries.sort()
tree = [0] * (n + 1)
def add(i, v):
    while i <= n:
        tree[i] += v
        i += i & -i
def total(i):
    s = 0
    while i:
        s += tree[i]
        i -= i & -i
    return s
last = {}
ans = [0] * q
qi = 0
for i in range(1, n + 1):
    x = a[i - 1]
    if x in last:
        add(last[x], -1)
    last[x] = i
    add(i, 1)
    while qi < q and queries[qi][0] == i:
        r, l, idx = queries[qi]
        ans[idx] = total(r) - total(l - 1)
        qi += 1
print("\\n".join(map(str, ans)))""",
    brute="""n, q = map(int, input().split())
a = input().split()
for _ in range(q):
    l, r = map(int, input().split())
    print(len(set(a[l - 1:r])))""",
    small=lambda r: distinct_gen(r, r.randint(1, 8), r.randint(1, 6), 4),
    tests=lambda r: ["1 1\n5\n1 1\n", distinct_gen(r, 2500, 2500, 10**9), distinct_gen(r, 2500, 2500, 50)],
)


# =========================================================================== runner
def run(code, inp):
    old_in, old_out, old_input = sys.stdin, sys.stdout, builtins.input
    sys.stdin = io.StringIO(inp)
    buf = io.StringIO()
    sys.stdout = buf
    def _input(prompt=""):
        line = sys.stdin.readline()
        if not line:
            raise EOFError
        return line.rstrip("\n")
    builtins.input = _input
    try:
        exec(compile(code, "<sol>", "exec"), {"__name__": "__main__"})
    finally:
        sys.stdin, sys.stdout, builtins.input = old_in, old_out, old_input
    return "\n".join(l.rstrip() for l in buf.getvalue().rstrip("\n").split("\n"))


def main():
    quick = "--quick" in sys.argv
    only = [int(a) for a in sys.argv[1:] if a.isdigit()]
    out, bad = [], 0
    ids = set()
    for p in P:
        if only and p["id"] not in only:
            continue
        assert p["id"] not in ids, p["id"]; ids.add(p["id"])
        r = random.Random(p["id"] * 7919)
        rounds = 40 if quick else 300
        if p.get("brute"):
            for _ in range(rounds):
                inp = p["small"](r)
                a, b = run(p["sol"], inp), run(p["brute"], inp)
                if a != b:
                    bad += 1
                    print(f"✗ {p['id']} {p['title']}: sol {a!r} brute {b!r} on\n{inp}")
                    break
        examples = []
        for e in p["examples"]:
            o = run(p["sol"], e)
            if p.get("brute"):
                assert o == run(p["brute"], e), (p["id"], e)
            examples.append({"input": e, "output": o})
        tests = p["tests"](random.Random(p["id"]))
        slow = 0
        for t in tests:
            t0 = time.time(); run(p["sol"], t); slow = max(slow, time.time() - t0)
        size = sum(len(t) for t in tests)
        print(f"✓ {p['id']} {p['title']:<20} {p['rating']}  {len(tests)} tests, {size // 1024} KB in, slowest {slow * 1000:.0f} ms")
        out.append({k: p[k] for k in ("id", "title", "rating", "tags", "statement", "input", "output")} |
                   ({"notes": p["notes"]} if p.get("notes") else {}) |
                   {"visibility": "public", "examples": examples, "tests": tests, "solution": p["sol"]})
    if bad:
        sys.exit(1)
    if not only:
        with open(os.path.join(HERE, "pack2.json"), "w", encoding="utf8") as f:
            json.dump(out, f, ensure_ascii=False)
        print(f"\nwrote pack2.json with {len(out)} problems")


if __name__ == "__main__":
    main()
