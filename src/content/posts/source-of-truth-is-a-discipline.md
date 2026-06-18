---
title: "A source of truth is a discipline, not a database"
description: "Automation is only as good as the data you feed it. After years of building on network sources of truth — and finding out how wrong 'trusted' data can be — I've come to think the database is the easy part. The discipline of keeping it true is the whole job."
pubDate: 2026-06-18
tags: ["nautobot", "source-of-truth", "network-automation"]
draft: false
---

Automation is only as good as the information you give it.

It's the same with anything that turns input into output. A search engine returns what your query deserves. An AI chat gives you an answer shaped entirely by the context you fed it — give it vague, thin input and you get a confident, generic, forgettable response; give it the right material and it can do real work. The engine isn't the variable. The data is.

The same law governs everything we build in network automation. When you build an automated solution, the first thing you need is a set of requirements — instructions for what the automation must do. You might call them Acceptance Criteria. The AC tells you not just what to produce, but implicitly how the results have to come out. You write your code against those criteria, and it works. Things look right.

Then, over time, you want more. You want it more dynamic, more broadly useful across the company. So you start importing data from a source — one you've been told is the most accurate available. And as you build the variables and methods to parse it, something stops adding up. The values in one system should match the values in another, but small things just... don't. You dig in. Eventually you find it: somewhere along the line, the data was entered wrong. The source you were promised was accurate has issues.

This is what we all face, every day. The deeper you build on top of one of these "sources," the more problems you surface. Maybe the data was built ten years ago and the network changed underneath it. Maybe it's updated by hand, so it carries every typo anyone ever made. Maybe a value landed in the wrong field and nobody noticed. Each one is small. They accumulate. And you're left with the problem the whole industry quietly lives with: an inaccurate source of truth.

## How deep does the rabbit hole go?

Here's the uncomfortable part: an inaccurate source of truth is almost never a single wrong value you can find and fix. It's structural. The deeper you dig, the more you find that the data isn't just wrong — sometimes the place to *put* the right data doesn't even exist.

I ran into this years ago on a project for a large, multi-region environment. Each region needed its own precise set of configuration data — NTP, logging, SNMP, TACACS, RADIUS, and more. None of it was cosmetic; get a region's AAA servers wrong and you've changed who authenticates your users. Some of it had to carry redundancy too — primary and backup servers — so the data didn't just have to be correct, it had to be correct *and* complete *and* in the right order. A lot of thought had to go into building it.

When I picked up the project, the first thing I found was that someone before me had hard-coded a list of sites for each region. I flagged it immediately, because I knew exactly how it would fail: the moment a site was decommissioned or a new one was built, the automation would break or quietly skip it. It couldn't sustain itself. It was a snapshot pretending to be a system.

So I went looking at the source of truth itself, expecting to just read the region off each site. This is where the floor dropped out: there was no region field. None. The regional information existed, technically — but it had been stuffed into a field that had nothing to do with regions, because that was the only place someone could make it fit at the time.

It got worse. That same field was used *differently* by another business unit sharing the same platform. So the one place the regional data lived didn't even mean the same thing across the estate. There was no reliable way to programmatically ask "what region is this site in?" and trust the answer — the answer depended on who had entered it and which group they belonged to.

So I did the obvious thing and went to the people who owned the data. What I thought was a simple ask — "can we get a real, consistent region value on these sites?" — turned into weeks, then months, with no resolution.

That's the rabbit hole. It isn't one typo. It's a missing model, an overloaded field, a collision in meaning between two teams, and an ownership gap, all stacked on top of each other — and every layer was created by a reasonable person making a reasonable decision in the moment, with no field built to hold what they actually needed.

Because that's the root of all of it: data entered by hand is at the mercy of the end user's judgment at the moment they enter it. They decide, right then, what they think the best answer is. Sometimes that judgment is exactly right. Sometimes it quietly corrupts an entry that won't cause a problem until something downstream depends on it — and by then you're three systems and two years removed from the decision that caused it.

## So what do we actually do about it?

You don't start by trusting the source. You start by *verifying* it against the one thing that can't lie: the running network. Pull the actual state off the devices and compare it to what the source of truth claims. Every mismatch is either drift to correct or — as in my region problem — a gap in the model you didn't know you had. The first job of automation isn't to automate. It's to understand what you're automating against.

A few principles I've earned the hard way:

**Fix the model before the values.** If there's no field for the truth, no amount of careful data entry will save you — you'll just get carefully-entered data in the wrong place. My region problem was never a data problem. It was a schema problem wearing a data problem's clothes. Build the model to hold reality first, then populate it.

**Reconcile against reality, and keep doing it.** Comparing the source of truth to the live network isn't a one-time cleanup you finish and forget. Data decays. Reconciliation is a standing process, not a project with an end date.

**Give every field an owner and a single authority.** The fastest way back into this mess is to let two teams or two systems both believe they own the same field. For every value that matters, there should be one clear answer to "which system is authoritative for this?"

**Validate at the point of entry.** The cheapest place to stop bad data is before it ever lands — naming standards, required fields, rules that simply reject the impossible. The most expensive place to catch it is three systems downstream, in an outage.

## A source of truth is a discipline, not a database

All of that is why I push back on the way these platforms usually get pitched. The story goes: stand up Nautobot, or NetBox, or Infrahub, centralize your data, and automation flows from it. That part is true. But it frames a source of truth as a *database* — a thing you install and fill. In my experience the database is the easy 10%. The other 90% is the discipline of keeping it true, and that part has no install button.

There's research that says it more bluntly than I can: documentation that's accurate the day it's built tends to decay to a fraction of that within a month or two if nothing actively keeps it synchronized. A source of truth doesn't break. It rots, and it rots quietly — one reasonable 2 a.m. fix, one undocumented exception, one manual tweak nobody logged. Each change is harmless on its own. Stacked over months across thousands of devices, they add up to an environment that no longer matches anything you've written down. The network still runs. It just runs in a state nobody can fully describe — which is exactly the state you can't safely automate against.

## The "single" in single source of truth is mostly aspirational

Here's something else experience changed my mind about. Real estates don't have one authoritative system — they have many. Your IPAM is authoritative for addressing. Your ITSM platform is authoritative for tickets and change records. Your wireless controller knows the live RF truth. Each is a *system of record* for its own domain, and none of them is the whole picture.

A real source of truth isn't a magic table that replaces all of them. It's the layer that aggregates and reconciles them into one coherent view you can drive automation from. The goal isn't one truth — it's *synchronized* truths. Which is exactly why every field needs one clear authority, the principle from earlier, now with a reason behind it: the moment two systems both think they own the same field, you don't have a source of truth anymore. You have a source of arguments.

## Intended state vs. actual state is the whole game

If you take one idea from this, take this one: **intended state versus actual state.**

Intended state is what the network is *supposed* to be — the design, the standards, the policy, the values you've modeled and committed. Actual state is what the devices are *actually* running right now. A source of truth holds the intended state. The network holds the actual state. And the entire discipline of network automation is the continuous work of reconciling the two.

That's why I think of the whole job as a diff. Golden Config compliance is literally a diff: render the intended config from the source of truth, pull the actual config off the device, compare. Every line that differs is either drift to remediate or a gap in your intended state you didn't know you had. The diff is where truth gets enforced — or where it gets exposed as fiction.

And it cuts both ways, which is the part that's easy to miss. A clean compliance result does **not** mean your network is correct. It means your actual state matches your intended state. If the intended state in your source of truth is wrong — if the template encodes the mistake — compliance will cheerfully confirm that your entire fleet is consistently, uniformly wrong. I've watched a single bad assumption in a template sail through compliance across a whole region: green dashboards, real outage. "Actual matches intended" and "intended is correct" are two different audits, and you need both.

## Where Nautobot actually fits

This is the frame I'd put Nautobot in — not as "an IPAM/DCIM tool," and not as "the open-source thing that looks like NetBox," but as the place you *do this discipline*.

It models intended state with a data model you can shape to your network instead of bending your network to fit the tool — which, if you remember my missing region field, is the difference between having somewhere to put the truth and not. Its SSoT framework is built for exactly the aggregation problem above: pulling from your ITSM, your IPAM, your controllers, and reconciling them, rather than pretending any one of them is the whole truth. And its jobs framework is where you run the diffs — generate intended config, compare against actual, surface the drift.

The tool is good. But the tool isn't the point. The tool is where the discipline lives.

## What living with it actually taught me

**The data will be wrong.** Not might be — will be. Your first sync from a "trusted" system will surface duplicates, stale records, and devices that exist in three systems under three names and in reality as one box. That cleanup isn't a one-time onboarding task. It's the job. Budget for it permanently.

**Authority is a habit, not a setting.** A source of truth has authority only as long as it's the path of least resistance for making a change. The first time a manual change on a device is faster than going through the system — and nobody reconciles it back — you've reintroduced drift, and worse, you've taught people the source of truth is optional.

**A source of truth nobody trusts is worse than none.** If engineers don't believe the data, they'll check the device "just to be sure" before every change — and now you've added a system without removing any work. Trust is the actual product. You earn it by making the data right and keeping it right, visibly, until checking the device feels redundant.

**Start small and earn the right to grow.** The failed efforts I've seen tried to model the entire network perfectly before automating anything. The ones that worked picked one painful, repeatable workflow, made the source of truth authoritative for just the data that workflow needed, and grew from there. Let the data model follow reality, not an architecture diagram.

## The mental shift

So when someone asks me where to start with network automation, I don't start with the automation. Automation is an amplifier. Point it at truth and it makes you faster at being right. Point it at a database full of confident, stale, unreconciled data and it makes you faster at being *wrong* — at scale, across thousands of devices, with a clean green dashboard insisting everything is fine.

The tool you choose matters less than the discipline you're willing to maintain. A source of truth isn't the database. It's the promise that the database is true — and the work, every day, of keeping that promise.
