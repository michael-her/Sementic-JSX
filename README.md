# Semantic JSX (.sjsx)

> Non-compiling JSX — a shared language for humans and agents.

**Languages:** [English](README.md) · [한국어](README.ko.md)

---

## Why it exists

Agentic coding has **no layer for persisting intent.**

Code captures *how*; comments drift; PR descriptions are not searchable. Each new agent session starts cold: it must **reverse-engineer meaning from implementation** — searching the codebase, inferring design decisions, and often re-asking questions humans already answered. That cost is paid in **tokens, time, and wrong guesses**.

`.sjsx` takes a different approach:

> Record **agreed intent first**; implementation comes second.

This is not documentation for humans only. It is a **contract surface** both humans and agents can read, diff, and extend — without executing anything.

---

## The cost of reverse-engineering

When intent lives only in `src/`, every agent session approximates:

```
tokens ≈ files explored + dependency hops + inferring intent from implementation noise
```

On a large codebase, that is not one file — it is Entwine, Qt, IPC, measure tools, and whatever else sits in the dependency graph. Worse, reverse-engineering **fails silently**: the agent produces a plausible story that may not match the original design decision.

Agentic systems optimize for *what works now*. They do not naturally preserve *what we agreed and why*. Without a persisted intent layer, semantics must be **re-extracted from code every time**.

---

## Why the agreement loop wins

The loop is cheaper than repeated full semantic extraction **when `.sjsx` is the authority for intent** and implementation follows it.

| | Reverse-engineer from `src/` | Read `design/*.sjsx` |
|---|---|---|
| Input size | O(codebase) or O(relevant subgraph) | O(design files) |
| Intent signal | Noisy — buried in *how* | Explicit — `[x]` agreed, `[ ]` open |
| History | Code diffs | Decision diffs |
| Re-ask cost | Every session | Once per agreement item |
| Failure mode | Silent mis-inference | Open items stay visible |

Per session:

```
cost(reverse) ≈ search + explore + infer + confirm (maybe wrong)
cost(loop)     ≈ read design/ + read local src/
```

You pay once to sketch and agree (`[ ]` → `[x]`). Each later session reads a **small, stable surface** instead of mining architecture from thousands of lines of implementation. That is **amortized intent** — the main economic reason `.sjsx` exists.

The product is not the file extension. It is **avoiding the repeated semantic-extraction tax**.

---

## How this differs

| Approach | What it captures | Gap |
|---|---|---|
| OpenAPI / protobuf | API contracts | Not UI or system topology |
| Mermaid / C4 | Diagrams | Not valid code syntax; weak agent tooling |
| Storybook | Component examples | Runtime-bound to one stack |
| `AGENTS.md` / Cursor rules | Prose guidance | No agreement state, no structured diff |
| **`.sjsx`** | JSX topology + agreement state + git history | Requires intent-before-implementation discipline |

The combination that matters: **valid JSX syntax**, an **agreement state machine** (`[ ]` / `[x]`), and **git-native semantic history** — without a new language or a running framework.

---

## What it is

`.sjsx` files use **valid JSX/TS syntax** but never enter the build pipeline.

- Passes lint (reuse existing eslint/tsconfig)
- Full editor syntax highlighting and autocomplete
- Never executed — and that is enough

Architecturally, `.sjsx` is **JSX as architecture IR**: a semantic tree that can lower to React DOM, Qt widgets, native UI, or other backends in `src/`. The design file stays stable; runtimes are disposable.

---

## Vocabulary layers

No new syntax. Reuse symbols the world already agrees on.

| Layer | Source | Examples |
|---|---|---|
| Design | Tailwind | `cx="flex-1 px-6 bg-neutral-950"` |
| System | Java/Rust abstractions | `ThreadPool`, `Result`, `Option` |
| UI/Event | React Native | `View`, `TouchableOpacity`, `onPress` |
| State | Redux (pre-16) | `Store`, `mapStateToProps`, `dispatch` |

Agents already know these symbols from training data. Humans sketch; agents fill the gaps — without learning a custom DSL.

---

## Agreement loop

```
Human: sketch .sjsx ([ ] = not yet agreed)
  ↓
Agent: fill gaps + ask questions
  ↓
Human: review diff → mark [x] when agreed
  ↓
Agreement complete → sjsx scaffold → implementation
```

The loop only beats reverse-engineering when intent is written here **before** or **alongside** implementation — not reconstructed afterward.

---

## Git as semantic history

Once `.sjsx` is committed:

- `commit` = snapshot of intent
- `diff` = evolution of design decisions
- `log` = timeline of *why* the project looks the way it does

No extra pipeline. No post-processing. Git is the semantic history store.

---

## Keeping intent authoritative

The loop stops being cheaper if `.sjsx` rots. Guard against drift:

1. **Intent first** — sketch in `design/` before large `src/` changes.
2. **Open items stay open** — do not mark `[x]` until the decision is real.
3. **Archive or update** — when implementation diverges, fix `.sjsx` or explicitly retire it; stale design is worse than no design.

For trivial, local changes (one obvious function), maintaining a design file may cost more than reading the code. `.sjsx` pays off on **features, boundaries, and cross-layer decisions** — where reverse-engineering is expensive.

---

## Example

```jsx
/**
 * @sjsx
 * domain: TodoApp
 * layer: system
 * status: design
 *
 * Agreement items:
 * [x] ThreadPool configuration
 * [x] DB job granularity
 * [ ] Error handling strategy (retry vs dead-letter?)
 */

const TodoSyncWorker = (
  <ThreadPool cx="threads4 affinity0 cancel-flag">
    {pendingTodos.forEach(todo =>
      <DbJob
        query="INSERT INTO todos (id, text, done) VALUES ({todo.id}, {todo.text}, {todo.done})"
        cx="retry3 transaction"
        onSuccess={id => TodoStore.dispatch(markSynced(id))}
        onFailure={id => TodoStore.dispatch(markError(id))}
      />
    )}
  </ThreadPool>
)
```

---

## CLI

```bash
# Install
npm install -g sjsx

# Agreement status for a directory
sjsx status ./design

# Show unagreed items
sjsx diff todo-system.sjsx

# Generate implementation scaffold
sjsx scaffold todo-system.sjsx
```

### `sjsx status` sample output

```
📁  design/

  todo-system.sjsx    ███████░░░ 67%  (2/3)
  todo-ui.sjsx        ████░░░░░░ 40%  (2/5)
```

### `sjsx scaffold` sample output

```
📄  todo-ui.sjsx
    domain : TodoApp
    layer  : ui
    status : design

⚠️  Unagreed items (3) — scaffold is generated but marked TODO:
    [ ] Empty-state UI design
    [ ] Error-state handling

✅  Scaffold written: todo-ui.scaffold.ts
```

---

## File layout convention

```
project/
├── design/
│   ├── todo-system.sjsx    ← system-layer design
│   ├── todo-ui.sjsx        ← UI-layer design
│   └── todo-ui.scaffold.ts ← generated scaffold
├── src/
│   └── ...                 ← implementation
```

Do **not** add `design/` to `.gitignore`. That directory *is* the project's semantic history.

---

## Core principle

> **Reading it should reveal the whole picture.**

Hooks hide state inside components. Implicit side effects break flow. `.sjsx` excludes anything that violates this principle — because a design artifact must be **legible in one pass** by humans and agents alike. Implementation may use hooks and indirection later; intent should not.

---

## License

MIT
