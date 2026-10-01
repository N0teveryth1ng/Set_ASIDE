# Reddit access: what is actually possible

Verified 2026-10-01 against Reddit's own announcements and help pages.

## Short version

Automated posting to Reddit is **not available** to us and should not be planned for.
This is a policy position, not a permissions setting we can change.

## Current state

**Self-service API access ended 1 December 2025.** Reddit closed registration for new
Data API apps. Any new token requires going through an approval process.

**Every new OAuth token requires explicit approval.** Under the Responsible Builder
Policy, announced by Reddit's own admin (u/redtaboo) on 2025-12-01, developers, mods,
and researchers must ask for approval rather than self-serving credentials.

**Commercial use additionally requires a contract.** Reddit's developer platform help
states that any use "by a business or on behalf of a business or as part of a monetized
product" counts as commercial. Monetization here would require a signed agreement, not
just an approved token.

**Third-party apps are being squeezed out gradually.** As of 2026-09-01, Reddit has
stated it will "gradually start restricting all new requests and third-party apps will be
required to port and operate through our Developer Platform." Existing apps were asked
to register by 30 September 2026.

## What this rules out

- Scheduled or automated posting to any subreddit
- Automated comment replies
- Automated DMs
- Automated voting
- Bulk reading of subreddit history at any useful volume

The marketing agent in this repo is deliberately configured with `bash: deny` for
exactly this reason. It can research with web search and web fetch, and nothing else.

## Approval path, if we ever want it

Apply through the Data Access Request form:
`https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=14868593862164`

The form distinguishes between "I'm a developer" and "I'm an enterprise
partner/commercial developer". Community reports indicate approval can take weeks, that
the credential set granted may be limited to the single approved use case, and that some
use cases are declined outright. Expect a contract for anything commercial.

**Verdict: not worth pursuing for a product this size.** The approval process is
designed to filter out small builders, and building on an unapproved token risks the
account.

## What we do instead

**Participate as a person.** A logged-in human posting in a community where self-promotion
is permitted is not an API question at all. This is normal, allowed behaviour.

Rules that keep it acceptable:

- Answer the question first. Link the product only when it genuinely answers what was asked.
- Read each subreddit's self-promotion rules before posting. Many ban it outright.
- No copy-paste replies across subreddits.
- Disclose that the product is ours.
- Do not use a throwaway account to evade limits.

If we ever need to read historical thread data at volume for research, the honest
options are a manual export by a logged-in human, or a Reddit dataset purchase. Both are
slower than an API and neither is worth automating for our current needs.

## Sources

- Responsible Builder Policy announcement, r/redditdev, 2025-12-01:
  `https://www.reddit.com/r/redditdev/comments/1oug31u/introducing_the_responsible_builder_policy_new/`
- Developer platform and access help, updated 2026-05-28:
  `https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data`
- Future of the public Data API, r/redditdev, 2026-09-01:
  `https://www.reddit.com/r/redditdev/comments/1vgbm9c/our_plans_for_the_future_of_reddits_public_data/`
- Data API Terms, last revised 2026-07-20:
  `https://redditinc.com/policies/data-api-terms`
- Application form:
  `https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=14868593862164`