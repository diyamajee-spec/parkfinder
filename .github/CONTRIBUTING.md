# Contributing Guide

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit with a conventional commit message (see below)
5. Push and open a Pull Request

Please check open issues before starting work.

---

## Commit Message Convention

This project enforces [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook will reject non-conforming messages automatically.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code change that is neither feat nor fix |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |
| `revert` | Revert a previous commit |

### Rules

- Description must be **lowercase**
- Description must be **72 characters or fewer**
- Scope must be **kebab-case** (e.g. `ev-charging`, `parking-map`)
- Use **imperative mood** — "add" not "added" or "adds"
- No period at the end

---

### Good Commits

```
feat: add EV charging indicator to parking slots
```
```
fix(auth): resolve session expiration on mobile browsers
```
```
docs(readme): update local setup instructions
```
```
refactor(parking-map): extract slot availability logic to service
```
```
feat(api)!: change booking response format

BREAKING CHANGE: Response now returns `slotId` instead of `slot_id`.
Update all clients before deploying.

Closes #102
```

---

### Bad Commits

```
# Too vague
fix: fixed it

# Wrong tense
feat: added new feature

# Uppercase description
feat: Add parking filter

# Invalid type
update: changed some stuff

# Description too long (over 72 chars)
feat: add a new feature that allows users to filter parking slots by EV charging availability and price range

# No type prefix at all
changed the booking flow
```
