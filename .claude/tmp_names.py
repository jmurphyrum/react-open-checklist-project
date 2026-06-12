
import os, re, glob
names = {}
for f in glob.glob("data/baseball/**/*.yaml", recursive=True):
    text = open(f, encoding="utf-8").read()
    for m in re.finditer(r"- name: [^
]+", text):
        n = m.group(0).replace("- name: ","").strip().strip(chr(34)).strip(chr(39))
        if n and len(n) > 3:
            names[n] = names.get(n, 0) + 1
top = sorted(names.items(), key=lambda x: -x[1])[:20]
for name, count in top:
    print(f"{count:4d}  {name}")
