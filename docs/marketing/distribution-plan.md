# Distribution plan

Compiled 2026-10-01 from the marketing agent's Reddit/competitor research plus a live
verification pass. No domain is available, so nothing here depends on domain authority.

## The constraint

The site runs on `set-aside-nine.vercel.app`. A subdomain carries almost no link equity,
so rank-based discovery is capped regardless of how good the copy is. Everything below
is chosen because it does not care how old or strong a domain is.

## 1. The name collision (read this first)

"Set-Aside" is not a clean name. At least five distinct products use it, and three are
in our exact category or adjacent to it.

| Product | URL | What it is | Status |
| --- | --- | --- | --- |
| SetAside (Shrpn) | setaside.app | Bookkeeping for independent contractors and freelancers. Founded 2021, Marietta GA. | DNS resolves, TLS failing, LinkedIn page live |
| Set Aside: Freelancer Tax QC | appstor.io listing | Freelancer tax reserve app, bilingual EN/FR, USD 2.99 | Listing indexed |
| SetAside, virtual tax jar | allthingsn.com/apps/setaside | Offline iOS tax jar for 1099 income, tracks all four 1040-ES deadlines, no bank link | Live, updated 2026-06-20 |
| Set-Aside Pro | setasidepro.com | Federal set-aside contract translator, SAM.gov. **Selling at USD 299/year.** | Live, HTTP 200 |
| MySetAside | mysetaside.com | Federal/state/local contracting opportunities | Live, HTTP 200 |

The first and third are the dangerous ones. Both pitch the same promise to the same
person: a freelancer, no bank connection, money you keep is money you can spend. The
third even runs a "Set Aside" tax jar with a rolling ledger, which is close to a
description of our own dashboard.

Set-Aside Pro and MySetAside are a different market (government contracting, not
freelance tax) but they own the hyphenated form of the name and have more domain
authority than we will ever have.

**What this means:** renaming the GitHub repo does not fix this. Only a product rename
does. See "Decision needed" below.

## 2. Where the actual pain is (verified 2026-10-01)

These are the recurring complaints in r/freelance and r/selfemployed threads:

- Not knowing the right percentage, with the "is 30% right for me" question unanswered
- Fear of the April bill after spending everything as it arrived
- Quitting a bank connection over the intrusive read-only-access consent screen
- Spreadsheet fatigue, and losing the file
- Not knowing if a spreadsheet calculation is even correct

The strongest single hook: **nobody withholds tax from a freelancer's payment, and
freelancers usually find out in April.** Everyone already understands this problem.
They do not agree on the number.

### Communities worth showing up in

| Community | Why | Self-promo rules |
| --- | --- | --- |
| r/freelance | Largest pool of the exact user | Strict. Answers, not ads |
| r/selfemployed | Same user, tax-heavy | Strict |
| r/Entrepreneur, r/smallbusiness | Adjacent, wider | Moderate |
| Indie Hackers | Build-in-public friendly, tax pain discussed often | Welcoming |
| Freelancers Slack / Discord communities | Lower competition, real conversation | Varies |

Direct Reddit API access was blocked during research, so thread titles and scores were
not verified. Recheck before posting. See `docs/marketing/reddit-policy.md` for the
current API access rules.

## 3. Launch directories

One-shot bursts of real visitors and a backlink each. No sustained effort.

| Directory | Notes |
| --- | --- |
| Product Hunt | **Freelance tag has 757 products.** Crowded, but the tag is where the audience is. Use a tag set rather than betting on the name |
| BetaList | Early adopters, good for a finance tool, low volume |
| Indie Hackers | Build-in-public, longer tail |
| AppSumo | Fits a one-time-purchase model, needs pricing decided first |

## 4. Ownable pages

Each page built to be quoted and linked, not to outrank the head terms.

- `/works-on-every-device` - **live.** Browser-only storage risks, quoting each
  competitor's own published limitations, labelled with a check date
- "How much should I set aside" - the highest-intent query we have not yet written for
- Spreadsheet-to-app migration guide, aimed at Wave's displaced users
- "No bank login" angle, aimed at people who cancelled a bank connection

Rule for all of them: re-verify competitor claims quarterly, or the page starts making
false statements on our behalf.

## 5. Realistic expectation

Directory launches and Reddit participation produce tens to low hundreds of real
visitors. That is worth more than the SEO work so far, because those visitors actually
click. None of it compounds the way a domain would.

## Decision needed

Whether to rename the product. It is a real cost: every string in the repo, the
Vercel project, the metadata, and the screenshots. It buys a name that can rank for
itself and stops competing with three live products for one exact term.

Not doing it is also fine. Plenty of products outgrow an awkward name, and "Set-Aside"
is descriptive, which is good for SEO on the description side. The cost is permanent
ambiguity on the brand side.

If we do rename, the constraint is that it must not collide with the freelancer-tax
category. "Tax jar", "set aside", "reserve", "keep" are all taken in this space.