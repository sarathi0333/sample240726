---
name: git-pr
description: Open a pull request on GitHub — branch if needed, push, and write a PR description covering the whole branch, not just the last commit. Use when asked to "open a PR", "create a pull request", "put this up for review", or to update an existing PR's description.
---

# Opening a pull request

A PR description is read by someone who wasn't there. Write for them.

## 1. Establish what's actually in the PR

The diff of the PR is the branch against its merge base — not the last commit, and not the working tree.

```bash
git status --short
git branch --show-current
git log --oneline main..HEAD          # every commit that will be in the PR
git diff main...HEAD --stat           # three dots: changes on this branch only
```

Read the full `git diff main...HEAD` before writing the description. If the branch has commits you didn't make in this session, they still belong in the summary.

Uncommitted changes are not in the PR. Either commit them first (see the `git-commit` skill) or tell the user they're being left out.

## 2. Get onto a branch

Never open a PR from `main`. If `git branch --show-current` says `main`:

```bash
git checkout -b <descriptive-branch-name>
```

Name it for the change: `add-settings-page`, `fix-router-guard`. Commits already made on `main` locally come along with the new branch — then confirm `main` still points where the remote expects.

## 3. Push

```bash
git push -u origin HEAD
```

If the remote rejects it as non-fast-forward, don't force. Read the `git-sync` skill and reconcile first.

## 4. Create the PR

```bash
gh pr create --title "<imperative summary>" --body "$(cat <<'EOF'
## Summary

One or two sentences on what this changes and why it was needed.

- specific change
- specific change

## Test plan

- [ ] `npm run lint`
- [ ] `npx ng test --watch false`
- [ ] steps to exercise the change by hand

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- Title in the imperative, no trailing period.
- The summary explains the motivation; reviewers can read the diff for mechanics.
- The test plan lists what you actually ran or what the reviewer should run — not aspirational checkboxes.
- Add `--draft` when the work is incomplete, `--base <branch>` when the target isn't the default branch.

Report the PR URL when it returns.

## Updating an existing PR

New commits pushed to the branch update the PR automatically. To revise the description:

```bash
gh pr view --json number,title,body
gh pr edit --body "$(cat <<'EOF'
...
EOF
)"
```

Re-read the current body first and merge your changes into it — don't clobber notes a human added.

## Guardrails

- **Ask before creating** if the user only said "commit" — opening a PR is outward-facing and notifies people.
- Check `gh auth status` if `gh` fails; don't try to work around a missing login.
- Don't merge the PR unless explicitly asked. Approving your own PR is not your call.
- If CI is configured, mention that it's running rather than declaring the change verified.
