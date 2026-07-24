---
name: git-commit
description: Stage and commit work as a clean, reviewable history — inspect the changes, split them into logical commits, and write messages that match this repo's style. Use when asked to "commit", "commit my changes", "save this to git", or when finishing a piece of work that should land as one or more commits.
---

# Committing changes

The goal is a history someone can read six months from now. That means each commit is one coherent change, and its message says *why*.

## 1. Look before staging

Never commit blind. Run these together and read the output:

```bash
git status --short
git diff                # unstaged
git diff --staged       # already staged — someone may have staged something you didn't expect
git log --oneline -10
```

If anything is already staged that isn't yours, stop and ask before you fold it into a commit.

## 2. Decide the split

Group the changes by intent, not by file. Ask: *would a reviewer want to look at these hunks together?*

- One commit when the changes serve a single purpose, even across many files.
- Separate commits when unrelated things happened in the same working tree — a bug fix and a dependency bump are two commits, not one.
- Mechanical changes (formatting, rename, generated files) go in their own commit so the substantive diff stays readable.

Don't over-split. Three commits that only make sense applied together is worse than one honest commit.

## 3. Stage precisely

```bash
git add <specific paths>
```

Prefer explicit paths. `git add -A` is fine only when you've confirmed everything untracked belongs in this commit — check `git status` for stray files first.

**Never stage:** `.env` or any credential file, API keys or tokens found in the diff, `node_modules/`, build output (`www/`, `dist/`), editor scratch files, or `.claude/settings.local.json`. If one of these shows as untracked, add it to `.gitignore` in the same commit rather than ignoring the problem.

Scan the actual diff for secrets before committing — a key pasted into a source file won't be caught by `.gitignore`.

## 4. Write the message

Format used in this repo:

```
Short imperative subject, under ~72 chars

Why the change was needed and what approach it takes. Wrap at ~72.
Skip this paragraph only when the subject genuinely says everything.

- specific change one
- specific change two

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

Rules that matter:

- Subject in the imperative: "Add dark mode toggle", not "Added" or "Adds".
- The body explains **why**. The diff already shows what changed; don't narrate it line by line.
- No "as requested", no "per user", no ticket-less filler. If there's an issue number, reference it.
- Bullet list only when there are genuinely several distinct pieces.

Use a heredoc so the formatting survives:

```bash
git commit -q -m "$(cat <<'EOF'
Subject line here

Body here.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

## 5. Verify

```bash
git log --oneline -3
git status --short
```

Confirm the commit landed and nothing intended was left behind. Report the short SHA.

## Guardrails

- **Don't push** unless the user asked. Committing and publishing are separate decisions.
- **Don't amend or rebase a commit that's already pushed** — it rewrites shared history. Amend only your own unpushed HEAD, and say so when you do.
- **Don't `git checkout`/`restore` over uncommitted work** to "clean up" — that's unrecoverable.
- If pre-commit hooks modify files, re-stage and note it; if a hook fails, fix the cause rather than passing `--no-verify`.
- If the working tree is clean, say so instead of manufacturing a commit.
