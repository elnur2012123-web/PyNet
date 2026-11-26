"""Writes scripts/i18n/content-work/problems2.json (uz/ru in the order of content-todo/problems2.json)
from pack2.py (English) and pack2_i18n.py (Uzbek, Russian). Then run:
  npx tsx scripts/i18n/content-merge.ts problems2"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pack2, pack2_i18n

en2 = {}
for p in pack2.P:
    en = [p["title"], p["statement"], p["input"], p["output"], p.get("notes", "")]
    uz, ru = pack2_i18n.UZ[p["id"]], pack2_i18n.RU[p["id"]]
    for e, u, r in zip(en, uz, ru):
        if e:
            assert u and r, (p["id"], e)
            en2[e] = (u, r)
root = os.path.join(HERE, "..", "i18n")
todo = json.load(open(os.path.join(root, "content-todo", "problems2.json"), encoding="utf8"))
missing = [t for t in todo if t not in en2]
assert not missing, missing
json.dump({"uz": [en2[t][0] for t in todo], "ru": [en2[t][1] for t in todo]},
          open(os.path.join(root, "content-work", "problems2.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(f"problems2: {len(todo)} strings")
