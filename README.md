# Semantic JSX (.sjsx)

> 컴파일되지 않는 JSX. 인간과 Agent가 합의하는 언어.

---

## 왜 존재하는가

Agentic coding에는 **의도를 저장하는 레이어가 없다.**

코드는 *어떻게*를 담고, 주석은 유실되고, PR description은 검색되지 않는다.
Agent는 매번 코드를 역산해서 의미를 복원해야 하고, 그 비용은 토큰으로 지불된다.

`.sjsx`는 이 문제를 다른 방향에서 푼다.

> 합의된 의도를 **먼저** 기록하고, 구현은 그 다음에.

---

## 무엇인가

`.sjsx`는 **유효한 JSX/TS 문법**이지만 빌드 파이프라인에 들어가지 않는다.

- lint는 통과한다 (기존 eslint/tsconfig 설정 그대로)
- 에디터 syntax highlight, 자동완성 전부 작동한다
- 실행은 되지 않는다
- 그것으로 충분하다

---

## 어휘 레이어

새로운 문법은 없다. 이미 전 세계적으로 합의된 심볼들을 쓴다.

| 레이어 | 출처 | 예시 |
|---|---|---|
| 디자인 | Tailwind | `cx="flex-1 px-6 bg-neutral-950"` |
| 시스템 | Java/Rust 추상화 | `ThreadPool`, `Result`, `Option` |
| UI/Event | React Native | `View`, `TouchableOpacity`, `onPress` |
| 상태 | Redux (pre-16) | `Store`, `mapStateToProps`, `dispatch` |

Agent는 이 심볼들의 의미를 이미 알고 있다.
인간이 스케치하면 Agent는 공백만 채우면 된다.

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

---

## Git이 Semantic History가 된다

`.sjsx`가 git에 커밋되는 순간:

- `commit` = 의도의 스냅샷
- `diff` = 설계 결정의 변화
- `log` = 프로젝트가 *왜* 이렇게 만들어졌는지의 타임라인

별도 파이프라인 없이. 사후 처리 없이.

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

`design/` 디렉토리는 `.gitignore`에 넣지 않는다.
그것이 이 프로젝트의 semantic history다.

---

## 핵심 원칙

> **읽으면 전체가 보여야 한다.**

Hook은 상태를 컴포넌트 안으로 숨긴다.
암묵적 사이드이펙트는 흐름을 끊는다.
`.sjsx`는 그 원칙을 깨는 모든 것을 배제한다.

---

## License

MIT
