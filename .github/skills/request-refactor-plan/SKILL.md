---
name: request-refactor-plan
description: Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue. Use when user wants to plan a refactor, create a refactoring RFC, or break a refactor into safe incremental steps.
---
trig: plan-refactor·refactor-RFC·safe-incremental-refactor
in: problem-description·codebase

Go through the steps below. You may skip steps if not necessary.

1. Ask the user for a long, detailed description of the problem and any potential solution ideas.
2. Explore the repo to verify their assertions and understand the current state of the codebase.
3. Ask whether they have considered other options, and present alternatives.
4. Interview the user about the implementation — be extremely detailed and thorough.
5. Hammer out the exact scope: what you plan to change and what you plan NOT to change.
6. Check test coverage of the affected area. If insufficient, ask what their testing plans are.
7. Break the implementation into a plan of **tiny commits**. Each commit must leave the codebase in a working state. Remember: "make each refactoring step as small as possible, so that you can always see the program working."
8. Create a GitHub issue using `gh issue create` with the refactor plan. Use the template in [templates/refactor-plan-issue.md](templates/refactor-plan-issue.md).
