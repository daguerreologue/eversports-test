# General Notes

I tried to follow implicit coding, naming, and directory structure conventions, though this would of course be aligned with the team in real life. The rest I filled in with my preferred way of doing things, but that does not reflect on being able to stick to agreed-upon coding conventions.

# To run

### Task 1

These should give you all that you need to check:
    
    `npm run test`
    
    `npm run start`

Server still running at predefined port 3099.

### Task 2

You will find the architecture diagram and flow (as barebones as it is) in the root directory as `csv-email-export-test-architecture-diagram.pdf`.

# Further notes

## Typing and bugs (and getting lost in meta-thinking)
Once strict typing is introduced, there are obvious bugs in the legacy implementation - for those specific cases, I intentionally broke with backwards compatibility, with hopes this is considered reasonable by everyone (as I judged these to be most likely mistakes of the test). If that meta-thinking is not acceptable, and bug-for-bug compatibility is desired, we can roll these back. A list of such bugs:
    - req.billingPeriods < 6 // <- should be req.body.billingPeriods < 6
    - membershipPeriods.filter(p => p.membershipId === membership.id) // <- should be membership, not membershipId - causes returned membership periods to be empty in the legacy API
    - in billingPeriods input validation, the canoncial "weekly" billing interval is rejected completely by the legacy code
Crucially, I would note that I fixed these bugs in the legacy as well for this submission, as my automated tests depend on comparing the results of API calls from both implementations, and this would have meant most if not all tests failing as response bodies would not have matched.

## Validation
If the IRL project would have enough time and runtime constraints of the product allow it, I would advocate for something first class like (but not necessarily precisely) Zod to solve a lot of these validation problems, as it has the following benefits:
    - Gets rid of the "shotgun parsing", already starting to be visible in the legacy implementation, has the potential to get worse.
    - Available at runtime (not only invaluable at the production validation border proper, but in REPL-based debugging, which is almost inevitable in real systems).
    - Can reify conditions that cannot be encoded in the type system, and will inevitably appear out-of-band in application code.
    - It can auto-generate types, being the single source of truth (no more "types exist here, validation of fields exists here, and we can waste our time keeping them in sync - or worse, failing to do so").
    - In short: it's scalable, composable, reusable.

## Date manipulation
I would also use a datetime lib such as luxon instead of raw JS Dates - I stuck with Dates and the legacy date manipulations as a presumed preference of the team/project in lieu of a coding standard.

## PS
But I understand these things are limitations of a take-home test, I've been on both sides of these, so I get how it's a balancing act of mocking a project and actually presenting a scenario where candidates' reasoning and style can be gleaned.

Hope the code isn't too messy, I'm doing multiple of these at the moment.
