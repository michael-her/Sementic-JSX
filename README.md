# Semantic JSX (.sjsx)

> Non-compiling JSX — a shared language for humans and agents.

**Languages:** [English](README.md) · [한국어](README.ko.md)

---

## Why it exists

Agentic coding has **no layer for persisting intent.**

Code captures *how*; comments drift; PR descriptions are not searchable. Agents must reverse-engineer meaning from implementation every time — and pay for that in tokens.

`.sjsx` takes a different approach:

> Record **agreed intent first**; implementation comes second.

---

## What it is

`.sjsx` files use **valid JSX/TS syntax** but never enter the build pipeline.

- Passes lint (reuse existing eslint/tsconfig)
- Full editor syntax highlighting and autocomplete
- Never executed — and that is enough

---

## Vocabulary layers

No new syntax. Reuse symbols the world already agrees on.

| Layer | Source | Examples |
|---|---|---|
| Design | Tailwind | `cx="flex-1 px-6 bg-neutral-950"` |
| System | Java/Rust abstractions | `ThreadPool`, `Result`, `Option` |
| UI/Event | React Native | `View`, `TouchableOpacity`, `onPress` |
| State | Redux (pre-16) | `Store`, `mapStateToProps`, `dispatch` |

Agents already know these symbols. Humans sketch; agents fill the gaps.

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

---

## Git as semantic history

Once `.sjsx` is committed:

- `commit` = snapshot of intent
- `diff` = evolution of design decisions
- `log` = timeline of *why* the project looks the way it does

No extra pipeline. No post-processing.

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

Hooks hide state inside components. Implicit side effects break flow. `.sjsx` excludes anything that violates this principle.

---

## License

MIT
