# Copilot Rules & Specifications for SpaceEvaders

This document defines how to responsibly use GitHub Copilot (and similar AI assistants) with this repository so suggestions are useful, safe, and legally compliant.

## Purpose
- Provide clear, consistent rules for using Copilot while developing SpaceEvaders.
- Encourage high-quality suggestions, test-first changes, and explicit attribution when needed.

## Scope
Applies to all contributors and any automated tooling that records or stores Copilot prompts/outputs for this repository.

## Rules
1. No secrets in prompts
   - Never paste API keys, passwords, or any private credentials into prompts. If you must include sensitive context, redact it.
2. License & attribution
   - Do not accept suggestions that copy large blocks of code that might be under restrictive licenses. If a suggestion looks like copied code from an external project, prefer re-implementing or add a comment with the source and confirm license compatibility.
3. Tests first
   - For non-trivial changes (bug fixes, new features), create or update unit tests before or alongside the change. Prefer small, focused tests that validate behavior.
4. Small, reviewed commits
   - Treat Copilot suggestions as one-person drafts. Review, run tests, and refactor before merging. When a suggestion adds >= 10 lines or a new dependency, add a short note in the commit message with the prompt used.
5. Sensitive file exclusions
   - Avoid running Copilot suggestions in binary or large data directories (see `.github/copilot.yml` exclude list).
6. Security & data handling
   - Do not send any highscore files or user data that contain PII to third-party services during development.

## Developer workflow suggestions
- Start with a one-line prompting context, then iterate.
- Example prompt pattern:
  - Context: "Project: SpaceEvaders - lightweight Flask server that stores highscores in highscore.json. File: server.py"
  - Instruction: "Add unit tests for the POST /api/highscores endpoint covering single submission and bulk save. Use pytest and keep tests isolated."
- Always run tests locally after accepting suggestions.

## Prompt templates (copy & adapt)
- "Write pytest unit tests for server.py covering GET /api/highscores and POST single highscore; mock filesystem reads/writes."
- "Refactor server.py to limit stored highscores to top 50 and keep timestamps in ISO format; preserve current API contract." 
- "Add input validation to POST /api/highscores: name (max 15 chars), score (non-negative int); return 400 on invalid input. Include unit tests."

## Commit message guideline for Copilot changes
- Short summary line (50 chars max)
- Body with:
  - "Copilot prompt:" and the prompt (one line or short paragraph)
  - "Tests added/updated:" list
  - "Notes:" any manual edits or license attribution

Example:

    Add validation to /api/highscores

    Copilot prompt: "Validate name (<=15 chars) and score (non-negative int) in POST /api/highscores. Return 400 on invalid. Add tests."
    Tests added: tests/test_server_post_validation.py
    Notes: adjusted error messages for consistency

## Review checklist
- [ ] Tests pass locally
- [ ] No secrets leaked in prompt history
- [ ] Third-party code or suggestions reviewed for license issues
- [ ] Commit message includes prompt when required

## Helpful links
- GitHub Copilot docs: https://docs.github.com/en/copilot

---

If you want, I can also add a small set of sample prompts as files under `.github/copilot-prompts/`. Say the word and I'll add them next.
