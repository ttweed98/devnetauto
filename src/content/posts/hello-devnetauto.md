---
title: "Why this site exists"
description: "A place to write down what production network automation actually looks like — the failures included."
pubDate: 2026-06-18
tags: ["meta", "nautobot"]
draft: false
---

There is a lot of network automation content that stops at "I connected to a
switch with Netmiko." There is very little about what happens on day 400, when
the automation owns thousands of devices across multiple tenants and a single
list operation in a config generator silently reorders every RADIUS method list
in the estate.

This site is for the day-400 problems.

Most posts here will be a **war story**: one concrete problem, what I tried,
what actually fixed it, and the part that generalizes to your environment. The
ground I cover is Nautobot in production — Golden Config, SSoT, SD-WAN design
generation, ZTP — and the CI/CD that keeps it repeatable.

A few rules I hold myself to:

- **Real problems, real fixes.** No tutorials reposted from docs. If I didn't
  hit it in anger, I don't write it up.
- **Patterns, not proprietary details.** Everything here is about the lesson,
  reproduced or generalized. No employer's internal systems show up by name.
- **The failures stay in.** The wrong turn is usually the most useful part.

If that's your kind of thing, the [RSS feed](/rss.xml) is the honest way to
follow along. New writing roughly weekly.
