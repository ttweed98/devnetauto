---
title: "When you can't fix the source, fix the sync"
description: "Most of us don't get to design our source of truth &#8212; we inherit it, flawed and inconsistent. Here's what I did when the data was wrong, the people who owned it wouldn't fix it, and I needed accurate data anyway."
pubDate: 2026-06-23
tags: ["nautobot", "source-of-truth", "servicenow", "war-story"]
draft: false
---

In the last post I argued that a source of truth is a discipline, not a database &#8212; and that an inaccurate one doesn't break, it rots. This is the post about what you actually do when you're the one holding the rotting data, and the people who own it won't fix it.

Because that's the situation most of us are really in. We don't get to design the source of truth from scratch. We inherit it &#8212; inconsistent, full of flaws, data that's sometimes wrong and sometimes just sitting in the wrong field where nothing can parse it. If you haven't hit this yet, you will.

## A CMDB full of surprises

In my case, the data lived in a ServiceNow CMDB. Records land in a CMDB from two main directions: automation feeds it, and people type into it. The automated feeds are usually consistent &#8212; they do the same thing every time. The human input is where it falls apart, and not because people are careless. It's because they're handed a field to fill in with no documentation telling them what belongs there. So they make their best guess. One person guesses one way, the next person guesses another, and over enough entries you've got the same kind of information scattered across different fields in different formats, none of it agreed upon.

That's the root of most of what I found, and it was everywhere. Devices with the wrong IP in the IP field. Wrong hostnames. Duplicates of the same physical box under different names. It was a mess &#8212; and almost none of it was malice. It was just hundreds of small, undocumented judgment calls piling up over years.

## My first hard look: regions

The first thing I really dug into was regions. I was supporting business units that scope their configuration by region &#8212; one region gets one set of infrastructure values (DNS, NTP, logging, AAA servers), another region gets a different set. I needed a reliable way to know, for any given site, which set it should get.

What I found was the rabbit hole from the last post, in the flesh. The regional data wasn't consistently placed in the right field. And even where it existed, it wasn't reliably accurate for the site it described. There was no clean, trustworthy "this site belongs to this region" answer anywhere in the system.

So I went looking for whoever owned that data. I never found a single person responsible &#8212; but I did find documentation that looked reliable. I didn't take it on faith; I validated it against multiple other sources, and it held up as mostly accurate. That gave me something solid to anchor on &#8212; a ground truth to measure the CMDB against.

## Months of asking, nothing to show

So I did the responsible thing first. I went to the people who touched that data and asked them to add a proper region field. It seems like a small ask. A single field. I spent months on it. Months. And in the end, nothing happened.

That's a moment a lot of engineers will recognize, and it's worth saying plainly: sometimes you cannot fix the source. The owners are too busy, too scattered, or too far from the problem to care about your one field. Waiting on them is not a plan.

## So I moved the fix to where I had control

I stopped waiting and moved the fix to the one place I *did* control: the sync.

We had an app in Nautobot that synchronized data out of the CMDB to keep our source of truth current. That sync was the single chokepoint every downstream automation depended on &#8212; which made it the perfect place to correct the data on its way in, instead of trying to fix it at the source or patch around it in a dozen places downstream.

![A diagram of the sync as the correction layer: messy incoming CMDB data on the left, the sync normalizing and correcting it in the middle, a trusted source of truth on the right](/images/flow-correction-layer.svg)

The breakthrough was realizing I didn't have to repair the broken field at all. I could derive each site's region from a field that *was* reliable &#8212; the site's country &#8212; and let the sync compute the right answer every time, instead of trusting the field that was supposed to hold it. After a few weeks of work and a fair number of bugs, the regional data started coming back clean and accurate. That was our first real breakthrough toward a source of truth we could trust.


## Cisco by a hundred names

Devices brought their own special chaos: the manufacturer field. Every time a new software train or hardware line comes out, the vendor seems to label itself a little differently in the asset data. By the time I looked, we had more than forty different spellings that all meant "Cisco." On their own, harmless. But when the sync pulled them in, it treated each distinct string as a distinct vendor &#8212; and dutifully created a brand-new manufacturer entry for every one. We ended up with dozens of "Ciscos" cluttering the source of truth, none of them agreeing.

So we taught the sync to normalize them: collapse all forty-plus variants back down to a single canonical Cisco on the way in. Same move as before &#8212; meet the mess where it enters, and clean it before it lands.

The platforms had the same disease. The sync was passing the raw platform string straight through from the CMDB, which sent some devices to the wrong driver entirely &#8212; and a device on the wrong driver doesn't just look untidy, it fails to back up at all. We had to give the sync real logic to route each device onto the *correct* platform, not just whatever string it happened to find. And beyond that were devices sitting in the wrong place outright &#8212; wrong location, wrong region, wrong tenant &#8212; which quietly meant the wrong configuration was being scoped to them downstream.

The same move handled the rest. Duplicate records &#8212; the same device entered two or three times &#8212; got collapsed into one canonical entry. Stacked switches, where member units kept showing up as phantom standalone devices, got folded into their master. Every one of these was the identical pattern: meet the messy reality at the point it enters, and correct it on the way in.

## A start, not a finish

I want to be honest about where this lands: we are still cleaning this up. The manufacturer normalization, the platform routing, the duplicates, the stacks, the misplaced devices &#8212; it's not a project with a finish line. It's ongoing work, and we're still finding things.

But that's the nature of it. A source of truth doesn't get fixed once and stay fixed; it gets *tended*. What we have now is something we couldn't say before: data we can increasingly trust, with mechanisms in place to keep making it better. It's not perfect. It's a start &#8212; and it's a far better source of truth than what we began with.

## This isn't just my problem

If any of this sounds familiar, it should &#8212; it's the norm, not the exception. People who manage these systems for a living will tell you a source of truth rarely fails on day one. It fails a few months in, quietly, usually at the moment nobody can say for certain who owns a given record. That was my months of chasing a phantom owner, described back to me by an entire industry. And the fix I reached for by instinct &#8212; trust the reliable source over the unreliable one, and correct the data on its way in &#8212; turns out to be the textbook answer. When two sources disagree about a field, you decide which one is authoritative and let it win. I just arrived at it the hard way.

The other thing the field agrees on is the part I want to leave you with: this is never finished. A source of truth isn't a project with a ship date &#8212; it's an ongoing program. You keep reconciling it against reality, you keep tightening the rules, and ideally you push the fix all the way back upstream &#8212; clear fields, documented standards, validation that rejects the impossible &#8212; so the next person entering data isn't guessing in the first place. The filter on the sync is the workaround. Removing the guesswork at the source is the cure.

## The point

Here's why all of this matters more than it might seem. Everything downstream inherits whatever the source of truth hands it. Every config your automation generates, every compliance check, every decision a tool makes on your behalf &#8212; all of it is only as good as that data. Without it, every one of those processes is just running on guesswork. It's the same lesson from the first post, and it's the same lesson the whole industry keeps relearning as it pushes into AI: the model, the automation, the tool was never the hard part. The data is.

So the data most of us inherit isn't the data we'd have designed. It will be inconsistent, misplaced, and partly wrong &#8212; usually because someone upstream was handed a field and no guidance, and made their best guess. Our job isn't to wait for it to become perfect. It never will. Our job is to find out what's actually accurate, validate it against every source we can, make the best call we can, and build the mechanism to keep improving it &#8212; even when that means filtering and correcting data we don't own and can't fix at the source.

It's an evolution, not a one-time cleanup. And it's the single most important piece of building real network automation. Get the data right, and your automation makes you faster at being right. Get it wrong, and you already know how that ends.
