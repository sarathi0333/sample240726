---
name: git-undo
description: Safely undo or recover git mistakes — wrong commit message, committed to the wrong branch, staged the wrong file, bad merge, lost commits, deleted branch, dropped stash. Use when asked to "undo", "revert", "roll back", "uncommit", "I committed by mistake", or "I lost my changes".
---

# Undoing things in git

Most git mistakes are recoverable. The ones that aren't involve destroying work that was never committed. Bias every decision toward the reversible option.

## First: find out what state you're in

```bash
git status
git log --oneline -10
git reflog -20          # the safety net — every position HEAD has held
```

`git reflog` is how you find "lost" commits. Almost nothing committed is truly gone for ~90 days.

## Second: is it pushed?

This single question decides the approach.

| | Not pushed | Pushed |
|---|---|---|
| Rewriting history (`reset`, `amend`, `rebase`) | Fine | **Avoid** — breaks everyone who pulled |
| Adding a new commit that undoes it (`revert`) | Works, noisier | The correct answer |

Check with `git log --oneline origin/main..HEAD` — anything listed is unpushed.

## Recipes

**Fix the last commit message** (unpushed):
```bash
git commit --amend -m "Better message"
```

**Add a forgotten file to the last commit** (unpushed):
```bash
git add path/to/file && git commit --amend --no-edit
```

**Undo the last commit, keep the changes staged:**
```bash
git reset --soft HEAD~1
```

**Undo the last commit, keep changes as unstaged edits:**
```bash
git reset HEAD~1
```

**Undo a pushed commit** — new commit, no history rewrite:
```bash
git revert <sha>
```
For a merge commit: `git revert -m 1 <sha>`.

**Unstage a file** (keeps the edits):
```bash
git restore --staged path/to/file
```

**Discard edits to a file** — *destructive, uncommitted work is gone*:
```bash
git restore path/to/file
```

**Committed to the wrong branch** (commits not pushed):
```bash
git branch correct-branch          # bookmark the work
git reset --hard origin/main       # only after confirming the bookmark exists
git checkout correct-branch
```

**Recover a lost commit or a deleted branch:**
```bash
git reflog                         # find the sha
git branch recovered <sha>
```

**Recover a dropped stash:**
```bash
git fsck --no-reflog | grep commit
git stash apply <sha>
```

**Abort a mess in progress:**
```bash
git merge --abort
git rebase --abort
git cherry-pick --abort
```

## Guardrails

- **`git reset --hard` and `git clean -fd` destroy uncommitted work permanently.** Before either, run `git status`, show the user exactly what will be lost, and get confirmation. When in doubt, `git stash` first — it costs nothing.
- **Never force-push a shared branch** to clean up history. If a rewrite is genuinely needed on your own branch, `git push --force-with-lease`, never bare `--force`.
- **Don't rewrite `main`.** Use `revert`.
- Make one change at a time and re-check `git status` — don't chain three destructive commands hoping the end state is right.
- If you can't tell whether something is recoverable, say so and stop rather than guessing.
