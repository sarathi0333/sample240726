---
name: git-sync
description: Bring a branch up to date with the remote — fetch, choose rebase vs merge, resolve conflicts, and handle diverged or rejected pushes. Use when asked to "pull", "sync with main", "rebase on main", "update my branch", or when a push is rejected as non-fast-forward.
---

# Syncing a branch

## 1. See where you stand before touching anything

```bash
git status --short
git fetch origin
git log --oneline --graph --left-right HEAD...@{upstream} -20
```

That last command shows exactly how the two sides diverged: `<` commits are yours, `>` are theirs.

If the working tree is dirty, deal with it first — commit it, or `git stash push -m "wip before sync"` and remember to pop it afterward. Never start a rebase or merge on top of uncommitted work.

## 2. Pick rebase or merge

| Situation                                         | Do this                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Your commits are local-only (unpushed)            | `git rebase origin/main` — linear history, no noise                                     |
| Your branch is pushed but nobody else works on it | Rebase is still fine; the push needs `--force-with-lease`                               |
| Others have the branch checked out                | `git merge origin/main` — never rewrite under them                                      |
| Updating `main` itself                            | `git pull --ff-only` — if it fails, you have local commits on `main` that need a branch |

```bash
git rebase origin/main
# or
git merge origin/main
```

## 3. Resolve conflicts deliberately

```bash
git status                    # lists "both modified" files
git diff --diff-filter=U      # the conflicting hunks
```

For each conflicted file: open it, understand _both_ sides, and write the version that's actually correct. Do not blindly take `--ours` or `--theirs` — a conflict means two people changed the same logic, and the right answer is usually neither side verbatim.

**During a rebase, "ours" and "theirs" are swapped** relative to a merge: `--ours` is the upstream branch you're replaying onto, `--theirs` is your commit. Check with `git status` if unsure.

Then:

```bash
git add <resolved files>
git rebase --continue         # or: git merge --continue
```

Bail out cleanly at any point with `git rebase --abort` / `git merge --abort` — the tree returns to exactly where it started.

After resolving, **build and test before pushing**. A conflict resolution that compiles is not the same as one that's correct:

```bash
npm run lint && npx ng test --watch false
```

## 4. Push

```bash
git push                                  # after a merge
git push --force-with-lease               # after rebasing an already-pushed branch
```

`--force-with-lease` refuses if the remote moved since your last fetch, so it can't silently delete a teammate's commits. Bare `--force` can — don't use it.

## When a push is rejected

`! [rejected] ... (non-fast-forward)` means the remote has commits you don't. Fetch, inspect, reconcile per the table above, then push again. Never respond to a rejection by force-pushing — that's exactly the case where you'd destroy someone's work.

## Guardrails

- **Don't rebase commits that others have pulled.** Merge instead.
- **`git pull` with no flags can create surprise merge commits.** Prefer `git fetch` + an explicit `rebase`/`merge`, or configure `pull.ff only`.
- Confirm before force-pushing anything, even with `--force-with-lease`.
- If a rebase produces conflicts in more than a few commits, stop and ask — a merge is often the better trade.
- Report what actually happened: commits replayed, conflicts hit and how you resolved them, whether tests were run.
