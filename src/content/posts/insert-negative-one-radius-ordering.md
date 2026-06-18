---
title: "The list insert that silently reversed every RADIUS method list"
description: "A one-character habit — list.insert(-1, x) — quietly broke authentication ordering across a fleet of wireless controllers. Here's how it hid, and why .append() was the fix."
pubDate: 2026-06-16
tags: ["python", "radius", "golden-config", "war-story"]
draft: false
---

A config-generation job had been running clean for months. Compliance was
green. Then a controller in a new region came up with its RADIUS server groups
in the wrong order — the secondary group was being tried first — and a handful
of authentications were landing on the wrong server before failing over.

The generated config looked almost right. That "almost" is the whole story.

## The intended state

A wireless controller's AAA config builds a *method list*: an ordered list of
server groups to try, in order. Order is not cosmetic. The first reachable
group wins, so if you flip primary and secondary, you've changed who
authenticates your users — without changing a single hostname or secret.

The generator built that list in Python, roughly like this (reconstructed in my
lab, names generic):

```python
group_names = ["radius-primary"]

# later, conditionally, a DMZ or fallback group gets added
if needs_fallback:
    group_names.insert(-1, "radius-fallback")
```

Read that `insert(-1, ...)` quickly and it looks like "add to the end." That's
the bug.

## Why insert(-1) is a trap

`list.insert(i, x)` inserts **before** index `i`. With `i = -1`, that means
"before the last element" — not "at the end."

```python
>>> g = ["radius-primary"]
>>> g.insert(-1, "radius-fallback")
>>> g
['radius-fallback', 'radius-primary']   # fallback is now FIRST
```

So the moment a second group entered the picture, the fallback group jumped
ahead of the primary. The rendered method list put the secondary server first.

It hid for months because **most sites only had one group.** With a single
element, `insert(-1)` and `append` produce visually identical output, and
compliance — which was diffing against an equally-wrong intended template —
stayed green. It only surfaced when a site needed a fallback group, which is
exactly the configuration where ordering matters most.

## The fix

The fix is the boring one-liner. If you mean "append," say `append`:

```python
group_names = ["radius-primary"]

if needs_fallback:
    group_names.append("radius-fallback")   # primary stays first
```

There was a second instance of the same pattern in the DMZ method-list loop, so
the real fix was: grep the whole job for `.insert(-1`, and replace every one
with `.append(`. There was no case in the codebase where inserting
before-the-last was actually intended.

## The lessons that generalize

- **`insert(-1, x)` almost never means what the author thought.** If you want
  the end of a list, `append`. If you ever see `insert(-1`, treat it as a smell
  and prove it's intentional.
- **A green compliance check is only as honest as the intended state.** This bug
  passed compliance because the template it diffed against was wrong in the same
  direction. Compliance tells you "actual matches intended." It cannot tell you
  "intended is correct." Those are different audits.
- **Bugs hide in the low-cardinality case.** Single-element lists, single-tenant
  sites, single-anything — they mask ordering and pluralization bugs. When you
  validate a generator, validate the case with *more than one* of the thing.
- **Order-sensitive config deserves an order-sensitive test.** A test that
  asserts the rendered method list equals `["primary", "fallback"]` exactly —
  not just "contains both" — would have caught this the day it was written.

One character. Months of green dashboards. A real authentication-path change in
production. The unglamorous fixes are the ones worth writing down.
