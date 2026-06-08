# Semantic JSX (.sjsx)

> 컴파일되지 않는 JSX. 인간과 Agent가 합의하는 언어.

**Languages:** [English](README.md) · [한국어](README.ko.md)

### ⚡ TL;DR

1. **문제:** Agentic coding에는 의도를 저장하는 레이어가 없다. Agent는 예산의 90%를 `src/` 노이즈에서 설계 결정을 **역산**하는 데 낭비한다.
2. **해답:** `.sjsx`는 컴파일되지 않는, 유효한 JSX **계약 표면**이다. 구현 **전에** 인간과 Agent가 아키텍처에 명시적으로 합의한다.
3. **회수:** 스케치하고 확정(`[ ]` → `[x]`)하는 비용은 **한 번만** 지불한다. 토큰 비용을 **상각**하고, 환각 없는·언어에 구애 없는 코드 생성을 달성한다.

---

## 왜 존재하는가

Agentic coding에는 **의도를 저장하는 레이어가 없다.**

코드는 *어떻게*를 담고, 주석은 유실되고, PR description은 검색되지 않는다. Agent 세션이 시작될 때마다 **구현 코드에서 의미를 역산**해야 한다 — 코드베이스를 탐색하고, 설계 결정을 추론하고, 이미 답한 질문을 다시 묻기도 한다. 그 비용은 **토큰, 시간, 그리고 틀린 추론**으로 지불된다.

`.sjsx`는 이 문제를 다른 방향에서 푼다.

> 합의된 의도를 **먼저** 기록하고, 구현은 그 다음에.

이것은 사람만을 위한 문서가 아니다. 실행하지 않으면서도 **인간과 Agent가 함께 읽고, diff하고, 확장할 수 있는 계약 표면**이다.

---

## 역산(reverse-engineering)의 비용

의도가 `src/`에만 있으면, Agent 세션마다 대략 다음 비용이 든다:

```
토큰 ≈ 탐색한 파일 수 + 의존성 hop + 구현 노이즈에서 의도 추론
```

대형 코드베이스에서는 파일 하나가 아니다 — Entwine, Qt, IPC, measure tool 등 **의존 그래프 전체**가 탐색 대상이 된다. 더 나쁜 점은, 역산이 **조용히 실패**한다는 것이다. Agent는 그럴듯한 설명을 만들지만, 원래 설계 결정과 다를 수 있다.

Agentic 시스템은 *지금 동작하는 것*에 최적화되어 있다. *무엇에 합의했고 왜 그랬는지*는 자연스럽게 보존되지 않는다. 의도 레이어가 없으면, 의미는 **매번 코드에서 다시 추출**해야 한다.

---

## 합의 루프가 이기는 이유

합의 루프는 **`.sjsx`가 의도의 기준(authority)이고, 구현이 그를 따를 때** 반복적인 전체 역산보다 항상 싸다.

| | `src/`에서 역산 | `design/*.sjsx` 읽기 |
|---|---|---|
| 입력 크기 | O(코드베이스) 또는 O(관련 그래프) | O(design 파일) |
| 의도 신호 | 노이즈 많음 — *어떻게*에 묻힘 | 명시적 — `[x]` 합의, `[ ]` 미결 |
| 이력 | 코드 diff | **결정** diff |
| 재질문 비용 | 매 세션 | 항목당 한 번 |
| 실패 양상 | 조용한 오추론 | 미결 항목이 그대로 보임 |

세션당:

```
비용(역산) ≈ 검색 + 탐색 + 추론 + 확인 (틀릴 수 있음)
비용(루프) ≈ design/ 읽기 + 국소 src/ 읽기
```

스케치와 합의(`[ ]` → `[x]`)는 **한 번** 지불한다. 이후 세션은 수천 줄의 구현에서 아키텍처를 캐내는 대신 **작고 안정적인 표면**을 읽는다. 이것이 **상각된 의도(amortized intent)** — `.sjsx`가 존재하는 핵심 경제적 이유다.

제품은 파일 확장자가 아니다. **반복적인 semantic extraction tax를 피하는 것**이 본질이다.

---

## 기존 도구와의 차이

| 접근 | 담는 것 | 한계 |
|---|---|---|
| OpenAPI / protobuf | API 계약 | UI·시스템 topology 아님 |
| Mermaid / C4 | 다이어그램 | 실행 가능 문법 아님; Agent 도구 약함 |
| Storybook | 컴포넌트 예제 | 특정 스택 runtime에 묶임 |
| `AGENTS.md` / Cursor rules | 산문 가이드 | 합의 상태·구조화 diff 없음 |
| **`.sjsx`** | JSX topology + 합의 상태 + git 이력 | intent-first 규율 필요 |

중요한 조합: **유효한 JSX 문법**, **합의 상태 머신**(`[ ]` / `[x]`), **git-native semantic history** — 새 언어나 실행 프레임워크 없이.

---

## 무엇인가

`.sjsx`는 **유효한 JSX/TS 문법**이지만 빌드 파이프라인에 들어가지 않는다.

- lint는 통과한다 (기존 eslint/tsconfig 설정 그대로)
- 에디터 syntax highlight, 자동완성 전부 작동한다
- 실행은 되지 않는다
- 그것으로 충분하다

아키텍처적으로 `.sjsx`는 **JSX를 architecture IR로 쓰는 것**이다. semantic tree는 안정적으로 두고, React DOM·Qt widget·native UI 등 **lowering backend**는 `src/`에서 교체 가능하다.

---

## 어휘 레이어

새로운 문법은 없다. 이미 전 세계적으로 합의된 심볼들을 쓴다.

| 레이어 | 출처 | 예시 |
|---|---|---|
| 디자인 | Tailwind | `cx="flex-1 px-6 bg-neutral-950"` |
| 시스템 | Java/Rust 추상화 | `ThreadPool`, `Result`, `Option` |
| UI/Event | React Native | `View`, `TouchableOpacity`, `onPress` |
| 상태 | Redux (pre-16) | `Store`, `mapStateToProps`, `dispatch` |

Agent는 학습 데이터에서 이미 이 심볼들을 안다. 인간이 스케치하면 Agent는 공백만 채우면 된다 — custom DSL을 배울 필요가 없다.

---

## 합의 루프

```
인간: .sjsx 스케치 ([ ] 항목 = 미합의)
  ↓
Agent: 공백 채우기 + 질문
  ↓
인간: diff 확인 → [x] 항목으로 변경
  ↓
합의 완료 → sjsx scaffold → 구현 시작
```

루프가 역산을 이기려면, 의도를 구현 **이후**에 복원하는 게 아니라 **이전 또는 동시**에 `design/`에 써야 한다.

---

## Git이 Semantic History가 된다

`.sjsx`가 git에 커밋되는 순간:

- `commit` = 의도의 스냅샷
- `diff` = 설계 결정의 변화
- `log` = 프로젝트가 *왜* 이렇게 만들어졌는지의 타임라인

별도 파이프라인 없이. 사후 처리 없이. Git 자체가 semantic history 저장소다.

---

## 의도의 authority 유지

`.sjsx`가 낡으면 루프도 역산만큼 비싸진다. drift를 막는다:

1. **Intent first** — 큰 `src/` 변경 전에 `design/`에 스케치한다.
2. **미결은 미결로** — 결정이 실제로 끝나기 전까지 `[x]`로 표시하지 않는다.
3. **갱신 또는 아카이브** — 구현이 어긋나면 `.sjsx`를 고치거나 명시적으로 폐기한다. 낡은 design은 design 없음보다 나쁘다.

함수 하나 수준의 자명한 변경에는 design 파일 유지 비용이 더 클 수 있다. `.sjsx`는 **기능, 경계, 레이어 간 결정** — 역산이 비싼 지점에서 가치가 난다.

---

## 예제

```jsx
/**
 * @sjsx
 * domain: TodoApp
 * layer: system
 * status: design
 *
 * 합의 항목:
 * [x] ThreadPool 설정
 * [x] DB 작업 단위
 * [ ] 에러 핸들링 전략 (retry vs dead-letter?)
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
# 설치
npm install -g sjsx

# 합의 현황 확인
sjsx status ./design

# 미합의 항목 보기
sjsx diff todo-system.sjsx

# 구현 scaffold 생성
sjsx scaffold todo-system.sjsx
```

### `sjsx status` 출력 예시

```
📁  design/

  todo-system.sjsx    ███████░░░ 67%  (2/3)
  todo-ui.sjsx        ████░░░░░░ 40%  (2/5)
```

### `sjsx scaffold` 출력 예시

```
📄  todo-ui.sjsx
    domain : TodoApp
    layer  : ui
    status : design

⚠️  미합의 항목 (3개) — scaffold는 생성되나 TODO로 마킹됨:
    [ ] 빈 상태 UI 디자인
    [ ] 에러 상태 처리

✅  Scaffold 생성: todo-ui.scaffold.ts
```

---

## 파일 구조 관례

```
project/
├── design/
│   ├── todo-system.sjsx    ← 시스템 레이어 설계
│   ├── todo-ui.sjsx        ← UI 레이어 설계
│   └── todo-ui.scaffold.ts ← 생성된 scaffold
├── src/
│   └── ...                 ← 실제 구현
```

`design/` 디렉토리는 `.gitignore`에 넣지 않는다. 그것이 이 프로젝트의 semantic history다.

---

## 핵심 원칙

> **읽으면 전체가 보여야 한다.**

Hook은 상태를 컴포넌트 안으로 숨긴다. 암묵적 사이드이펙트는 흐름을 끊는다. `.sjsx`는 그 원칙을 깨는 모든 것을 배제한다 — design artifact는 **한 번에 읽혀야** 인간과 Agent 모두에게 legible하기 때문이다. 구현(`src/`)에서 hook과 간접층을 쓰는 것과 별개로, **의도**는 평평하고 명시적이어야 한다.

---

## License

MIT
