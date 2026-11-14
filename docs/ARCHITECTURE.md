# 바로잡길 MVP 아키텍처

- 문서 상태: 현재 MVP 구현 및 확장 설계
- 최종 갱신: 2026-11-14

## 1. 설계 목표

이 문서는 현재의 mock/실제 OpenAI 이미지 분석 기반 MVP에서 향후 Supabase와 영상 분석으로 확장할 때 UI와 도메인 로직을 크게 다시 쓰지 않도록 경계를 정의한다.

핵심 목표:

- 모바일 우선 App Router 화면과 서버 로직의 책임을 분리한다.
- AI 제안값, 사용자 확정값, 공개 지도 집계값을 구조적으로 분리한다.
- 긴 영상 분석을 재시도 가능한 비동기 작업으로 다룬다.
- mock, Supabase, 실제 AI가 같은 애플리케이션 계약을 구현하게 한다.
- 원본 미디어와 차량번호가 공개 경로로 새지 않게 한다.
- 자동 신고가 아키텍처상 발생할 수 없게 외부 신고 경계를 명확히 둔다.

## 2. 현재 프로젝트 기준

현재 저장소에는 모바일 UI 흐름과 provider 기반 이미지 분석이 구현되어 있다. `POST /api/analyze-image`가 서버에서 이미지 검증과 provider 선택을 수행하며, mock과 OpenAI provider가 같은 Structured Output 계약을 반환한다.

| 항목 | 현재 값 |
| --- | --- |
| Next.js | 16.3.4, App Router |
| React / React DOM | 19.2.8 |
| TypeScript | 5, `strict: true` |
| Tailwind CSS | 4 |
| 소스 루트 | `src/`, `@/* -> ./src/*` |
| 이미지 AI | OpenAI Responses API, `gpt-6-astra`, Zod Structured Output, mock/openai provider |
| 현재 검증 명령 | `npm run lint`, `npm run build` |

Next.js 코드를 작성하기 전에는 저장소에 설치된 `node_modules/next/dist/docs/`의 관련 문서를 다시 확인한다. 이 설계에 반영한 Next.js 16 기준은 다음과 같다.

- 페이지와 레이아웃은 기본적으로 Server Component다.
- 상태, 이벤트, File API, 미디어 플레이어, 지도 등 브라우저 기능이 필요한 작은 경계만 Client Component로 만든다.
- Server Component는 자체 Route Handler를 HTTP로 다시 호출하지 않고 server-only 데이터 계층을 직접 호출한다.
- Route Handler와 Server Action은 외부에서 호출 가능한 공개 경계로 보고 매번 인증·인가·입력 검증을 수행한다.
- 긴 작업은 서버리스 Route Handler에서 동기 처리하지 않는다.
- Next.js 16의 `params`, `searchParams`, `cookies()`, `headers()` 등 비동기 API와 생성 타입을 해당 시점의 로컬 문서대로 사용한다.
- 대용량 영상은 Server Action 본문으로 전달하지 않고, 브라우저가 비공개 객체 저장소로 직접 업로드하게 한다.

## 3. 전체 구성

`app`은 URL, 레이아웃, 로딩·오류 UI와 서버 데이터 조합만 담당한다. 업무 규칙은 순수 도메인과 use case에 두고 외부 기술은 포트 뒤에 둔다.

```mermaid
flowchart LR
  B[모바일 브라우저] --> N[Next.js App Router]
  N --> U[Application use cases]
  U --> D[Domain rules]
  U --> P[Ports]
  P --> M[Mock adapters]
  P --> S[Supabase adapters]
  P --> A[AI / Worker adapters]
  S --> DB[(Postgres + RLS)]
  S --> ST[(Private Storage)]
  A --> Q[Durable queue / worker]
  Q --> AI[AI providers]
  DB --> R[비식별 집계]
  R --> MAP[공개 위험지도 DTO]
```

의존성 방향은 `UI -> application -> domain/ports <- infrastructure`로 고정한다. 도메인과 application은 Supabase SDK, AI SDK, React를 직접 알지 않는다.

## 4. 추천 디렉터리 구조

아래는 구현 시 생성할 권장 구조이며 현재 생성된 구조가 아니다.

```text
src/
  app/
    (public)/
      page.tsx
      risk-map/
        page.tsx
      privacy/
        page.tsx
    (workspace)/
      cases/
        page.tsx
        new/
          page.tsx
        [caseId]/
          page.tsx
          analyzing/
            page.tsx
          candidates/
            page.tsx
          review/
            page.tsx
          package/
            page.tsx
          loading.tsx
          error.tsx
    api/
      uploads/
        sign/route.ts
        complete/route.ts
      analyses/
        [jobId]/route.ts
      webhooks/
        ai/route.ts
      packages/
        [packageId]/download/route.ts
      risk-map/route.ts
      auth/
        callback/route.ts
    layout.tsx
    globals.css

  components/
    ui/

  features/
    upload/
    analysis-status/
    candidate-timeline/
    media-review/
    incident-facts/
    violation-review/
    evidence/
    report-package/
    risk-map/

  domain/
    report-case/
    violation/
    evidence/
    risk-map/

  application/
    ports/
    use-cases/
    dto/

  contracts/
    analysis-v1/
    public-api/

  infrastructure/
    mock/
    supabase/
    ai/

  server/
    auth/
    dal/
    env/
    container/

  mocks/
    fixtures/

supabase/
  migrations/
  seed/
```

### 폴더 책임

- `src/app`: 라우팅, 메타데이터, 서버 데이터 조합, loading/error boundary
- `src/components/ui`: Button, Field, Card, Dialog처럼 도메인을 모르는 재사용 UI
- `src/features`: 한 기능에 필요한 작은 Client Component, 폼, hook, 표시 컴포넌트
- `src/domain`: 순수 TypeScript 타입, 불변식, 상태 전이, 증거 정책
- `src/application`: 사용 사례와 외부 의존성 포트, 화면에 필요한 최소 DTO
- `src/contracts`: AI 결과, webhook, 공개 응답의 버전형 런타임 스키마
- `src/infrastructure`: mock, Supabase, AI 제공자별 포트 구현
- `src/server`: `server-only` DAL, 세션 확인, 환경변수 검증, 구현체 조립
- `src/mocks/fixtures`: 번호판·얼굴·실제 위치가 없는 합성 fixture

큰 공용 `utils` 폴더에 업무 로직을 모으지 않는다. 특정 기능에서만 쓰는 코드는 해당 feature에 두고, 두 기능 이상에서 안정적으로 공유될 때만 domain 또는 공용 UI로 올린다.

## 5. 페이지와 라우팅

| 경로 | 책임 | 주 렌더링 |
| --- | --- | --- |
| `/` | 서비스 설명, AI 한계, 시작 CTA | Server |
| `/cases` | 사용자의 초안과 분석·신고 준비 상태 목록 | Server |
| `/cases/new` | 파일 선택, 검증, 업로드 시작 | Server shell + Client uploader |
| `/cases/[caseId]` | 저장된 상태를 읽고 올바른 다음 단계로 재개 | Server |
| `/cases/[caseId]/analyzing` | 업로드·분석 진행, 후보 없음, 실패·재시도 | Server shell + polling/realtime Client |
| `/cases/[caseId]/candidates` | 영상 플레이어, 후보 타임라인, 핵심 구간 선택 | Server shell + Client interaction |
| `/cases/[caseId]/review` | 핵심정보 수정, 예상 유형, 근거, 신뢰도, 증거 체크 | Server + 작은 Client form |
| `/cases/[caseId]/package` | 최종 패키지, 문장 수정, 신고 준비 완료, 사용자가 누르는 외부 신고 버튼 | Server + Client form |
| `/risk-map` | 집계 지도와 필터, 개인정보 안내 | Server shell + Client map |
| `/privacy` | 처리 목적, 보존·삭제·동의 정책 | Server |

한 단계 URL에 직접 접근하더라도 서버가 소유권과 현재 상태를 확인한다. 선행 조건을 충족하지 않으면 접근 거부 또는 올바른 이전 단계로 이동시킨다. 클라이언트에서 버튼을 숨기는 것만으로 권한이나 상태 전이를 보호하지 않는다.

`/cases/[caseId]/page.tsx`는 상태를 기준으로 재개 지점을 결정한다. 단계별 데이터를 중복 저장하기보다 동일한 case와 draft를 각 화면이 읽게 한다.

### Route Handler 사용 범위

Route Handler는 다음처럼 실제 HTTP 경계가 필요한 경우에만 둔다.

- 업로드용 짧은 수명의 서명 발급과 업로드 완료 통지
- 클라이언트 분석 상태 폴링
- AI 제공자 webhook 수신
- 권한 확인이 필요한 패키지 다운로드
- 공개 지도용 최소 집계 DTO
- 향후 인증 callback

Server Component의 데이터 조회는 `/api`를 거치지 않고 DAL과 repository를 직접 호출한다. 모든 Route Handler는 인증·인가, 소유권, content type, 크기, 속도 제한, 오류 정제를 독립적으로 수행한다.

## 6. 애플리케이션 포트

최소 포트는 다음과 같다.

| 포트 | 책임 |
| --- | --- |
| `ReportCaseRepository` | case, 후보 선택, draft, 상태 전이 저장·조회 |
| `MediaStorage` | 비공개 업로드, 단기 읽기 권한, 파생 미디어, 삭제 |
| `AnalysisGateway` | 분석 작업 제출, 상태 조회, 결과 정규화 |
| `ReportPackageGenerator` | 확정 revision 기준 패키지 snapshot 생성 |
| `RiskAggregationRepository` | 동의된 기여값 반영과 공개 집계 조회 |

예상 use case:

- `createCase`, `requestUpload`, `completeUpload`
- `enqueueAnalysis`, `applyAnalysisResult`, `retryAnalysis`
- `selectCandidate`, `adjustEvidenceRange`
- `confirmFacts`, `changeViolationType`, `assessEvidence`
- `generateReportDraft`, `generatePackage`
- `recordRiskMapConsent`, `publishRiskContribution`
- `deleteCase`

포트 인터페이스의 반환값은 DB row나 제공자 응답이 아니라 application DTO다.

## 7. 핵심 도메인 모델

### 7.1 타입

다음은 개념 계약이며 구현 시 런타임 스키마와 함께 정의한다.

```ts
type ViolationType =
  | "SIGNAL_VIOLATION"
  | "CENTER_LINE_VIOLATION"
  | "DANGEROUS_MERGE"
  | "STOP_LINE_OR_CROSSWALK"
  | "ILLEGAL_U_TURN"
  | "INTERSECTION_VIOLATION"
  | "ILLEGAL_PARKING"
  | "OTHER_TRAFFIC_VIOLATION"
  | "UNKNOWN";

type MediaType = "IMAGE" | "VIDEO";

type EvidenceItemStatus =
  | "CLEAR"
  | "UNCERTAIN"
  | "MISSING";

interface AnalysisResult {
  analysisId: string;
  mediaType: MediaType;
  suspectedViolation: boolean;
  violationType: ViolationType;
  confidence: number; // 0..1
  summary: string;
  reasoningSummary: string;
  plateNumberCandidate: string | null;
  occurredAtCandidate: string | null;
  locationCandidate: string | null;
  evidenceItems: Array<{
    name: string;
    status: EvidenceItemStatus;
    description: string;
  }>;
  missingEvidence: string[];
  warnings: string[];
  needsTemporalEvidence: boolean;
}

type ValueSource =
  | "ai"
  | "metadata"
  | "user"
  | "system";

interface SuggestedValue<T> {
  value: T | null;
  confidence: number | null; // 0..1, AI 값일 때만
  source: ValueSource;
  observedAtMs?: number;
}

interface ConfirmedValue<T> {
  value: T | null;
  basedOnSuggestion: boolean;
  confirmedByUser: boolean;
  updatedAt: string;
}
```

AI 제안과 사용자 확정값은 같은 필드를 덮어쓰지 않는다. 신고 패키지는 `ConfirmedValue`만 snapshot하고, AI 화면은 원래 `SuggestedValue`와 비교해 보여준다.

### 7.2 상태

하나의 거대한 status 대신 독립 상태를 둬 불가능한 조합을 줄인다.

```ts
type CaseStage =
  | "draft"
  | "analysis"
  | "review"
  | "package_ready"
  | "archived";

type AnalysisStatus =
  | "not_requested"
  | "queued"
  | "processing"
  | "succeeded"
  | "failed";

type SubmissionStatus =
  | "preparing"
  | "awaiting_manual_submission"
  | "completed_by_user";
```

중요 불변식:

- 분석 성공 전에는 후보를 선택할 수 없다.
- 신고 패키지당 선택 후보는 하나다.
- 사용자 확인을 거치지 않은 핵심정보로 최종 패키지를 만들 수 없다.
- 외부 신고 버튼은 신고 준비 완료 상태에서만 제공한다.
- `completed_by_user`는 사용자가 직접 완료 사실을 표시할 때만 설정한다.
- 어떤 상태 전이도 안전신문고 제출을 실행하지 않는다.

## 8. 권장 데이터베이스 구조

모든 ID는 추측하기 어려운 UUID를 사용하고 시간은 UTC로 저장한다. 민감 row는 기본적으로 사용자 소유권과 RLS를 가진다.

| 테이블 | 주요 필드와 역할 |
| --- | --- |
| `profiles` | `id = auth.users.id`, 최소 사용자 설정, 생성·수정 시각 |
| `report_cases` | `id`, `owner_id`, case stage, submission status, `selected_candidate_id`, 보존·삭제 시각 |
| `media_assets` | `case_id`, 종류(original/clip/frame/plate_crop/package), private object path, MIME, bytes, duration, checksum, 검역·업로드 상태, `purge_at` |
| `analysis_jobs` | case/asset, status/progress, provider job ID, idempotency key, model/prompt/contract version, 안전한 오류 코드, 시각 |
| `violation_candidates` | job, 순서, `start_ms/end_ms`, 예상 유형, 탐지·분류 신뢰도, 참고 근거, private preview asset ID |
| `candidate_facts` | 후보별 AI 제안 차량번호·시각·좌표·주소, 값별 신뢰도·출처·관찰 시점 |
| `report_drafts` | 선택 후보, 사용자 확정 차량번호·시각·장소·유형·문장, revision, `confirmed_at` |
| `evidence_assessments` | draft revision, 유형, 전체 참고 상태, `rule_version`, 생성 시각 |
| `evidence_items` | assessment, 항목 코드, 상태, 설명, 근거 시작·종료 오프셋 |
| `report_packages` | 확정 draft revision snapshot, 핵심 미디어 asset, private manifest 경로, 생성 시각 |
| `consents` | 동의 유형, 정책 버전, 부여·철회 시각 |
| `risk_contributions` | 제한된 내부 계층. 동의 ID, 거친 공간·시간 bucket, 확인 유형, 철회용 source token |
| `risk_aggregates` | 공개 가능한 cell, 기간 bucket, 유형, count/위험 지표, 산식 버전 |
| `audit_events` | 상태 변경 주체와 시각, 이벤트 코드. 민감 원문은 저장하지 않음 |

### 데이터 분리 원칙

1. `candidate_facts`는 AI 원본 제안이다.
2. `report_drafts`는 사용자가 신고에 쓸 값이다.
3. `report_packages`는 특정 draft revision의 변경 불가능한 snapshot이다.
4. `risk_contributions`는 case와 분리된 제한 원천/가명처리 계층이며 공개 데이터가 아니다.
5. 외부에 공개하는 것은 최소 표본 수를 충족한 `risk_aggregates` DTO뿐이다.

AI 제공자의 원본 JSON이 디버깅에 필요하다면 일반 조회 테이블과 분리하고 접근·보존 기간을 더 엄격히 한다. UI는 검증·정규화된 필드만 읽는다.

## 9. mock 우선 전략

초기 구현에서는 다음 구성값으로 구현체만 교체한다. 이름은 예시이며 서버 전용 환경변수로 둔다.

- `DATA_BACKEND=mock | supabase`
- `AI_BACKEND=mock | provider`

mock 원칙:

- `MockAnalysisGateway`도 실제 `AnalysisResultV1` 계약과 런타임 검증을 통과한다.
- fixture는 복수 후보, 후보 없음, 필드 누락, 낮은 신뢰도, 분석 실패, 사진 시나리오를 포함한다.
- 고정 seed와 가상 Clock을 사용해 테스트 결과가 매번 같게 한다.
- 실제 차량번호, 얼굴, 주소, 영상 URL을 fixture에 넣지 않는다.
- 사용자가 고른 로컬 파일은 현재 탭의 미리보기 object URL로만 사용하고 사용 후 해제한다.
- 실제 원본을 base64로 변환해 source, localStorage, 로그에 보관하지 않는다.
- 영속 저장소가 없는 mock 데모에서는 새로고침 후 복원을 보장하지 않으며 이 한계를 UI와 테스트에서 명시한다.

## 10. Supabase 연결 설계

### 10.1 Auth

- 모든 case는 처음부터 `owner_id`를 가진다.
- 구체적인 로그인 UX는 제품 결정 전이지만 서버가 검증한 세션 없이는 민감 데이터를 조회하지 않는다.
- 페이지 가드뿐 아니라 DAL, Server Action, Route Handler의 모든 읽기·변경에서 소유권을 확인한다.
- 로그인 방식이 정해지면 쿠키 기반 서버 세션을 사용하고 인증 callback만 Route Handler에 둔다.

### 10.2 Postgres와 RLS

- 사용자는 `owner_id = auth.uid()`인 case와 자식 데이터만 조회·변경할 수 있다.
- 자식 테이블 정책은 요청 row의 case 소유권까지 확인한다.
- service role은 AI worker, 보존 삭제, 집계 작업처럼 꼭 필요한 서버 환경에만 둔다.
- 브라우저가 service-role key를 받는 경로를 만들지 않는다.
- 공개 지도는 별도 view 또는 RPC가 집계 열만 반환하게 하고 원천 테이블 권한을 주지 않는다.
- 삭제, 동의 철회, 분석 callback은 함수 또는 transaction으로 원자적으로 반영한다.

### 10.3 Storage

권장 private bucket:

- `evidence-originals`
- `evidence-derived`
- `report-packages`

흐름:

1. 서버가 사용자, case, 파일 선언값, quota를 확인한다.
2. 짧은 수명의 업로드 권한과 예측 불가능한 object path를 발급한다.
3. 브라우저가 Storage로 직접 업로드한다. 대용량 영상은 재개 가능한 업로드를 사용한다.
4. 완료 통지 뒤 파일을 격리 상태로 둔다.
5. 서버/worker가 실제 MIME 또는 magic bytes, 크기, 영상 길이, checksum을 확인한다.
6. 검증을 통과한 asset만 분석 큐에 넣는다.

DB에는 공개 URL이 아니라 object path만 저장한다. 읽기용 서명 URL은 짧게 만료되며 요청 때 발급한다. 원본, 썸네일, 번호판 crop, 패키지는 권한 확인 후 `Cache-Control: private, no-store`로 제공하고 공유 이미지 최적화 캐시에 넣지 않는다.

## 11. AI 분석 연결 설계

### 11.1 현재 이미지 분석 경로

현재 실제 이미지 흐름은 다음 경계를 유지한다.

```text
POST /api/analyze-image
→ 서버 이미지 형식·크기·signature 검증
→ ANALYSIS_PROVIDER에 따른 mock/openai provider 선택
→ mock은 공통 계약 fixture 반환 / openai는 Responses API + gpt-6-astra + Structured Output
→ 공통 Zod 계약 재검증
→ 정제된 결과만 UI에 전달
```

`OPENAI_API_KEY`는 서버 전용 환경변수로만 읽으며 원본 provider 응답 전체를 브라우저에 전달하지 않는다. `mediaType`은 현재 이미지 Route에서 `IMAGE`로 설정하고, 향후 영상 프레임 분석기가 같은 분석 계약을 재사용할 때 `VIDEO`를 전달한다.

### 11.2 미디어별 판단 지침

- `IMAGE` prompt는 한 장에 보이는 정적 사실만 사용한다. 차량의 이전·이후 움직임, 진입 시점, 정차 지속 시간을 추측하지 않는다. 정지선·횡단보도·중앙선과 차량 위치, 표지·차선·신호등, 번호판 가시성처럼 관찰 가능한 요소를 분석한다.
- 사진에서 시간적 증거가 부족해도 합리적인 후보가 있으면 낮은 신뢰도만을 이유로 `UNKNOWN`으로 보내지 않는다. 예상 유형과 불확실성을 설명하고 `needsTemporalEvidence: true`, `missingEvidence`에 필요한 전후 장면을 기록한다.
- `VIDEO` prompt는 타임스탬프와 함께 시간순으로 정렬된 복수 프레임만 입력받는 것을 전제로 한다. 신호 변화와 진입 시점, 중앙선·차선 이동, 끼어들기, 정지선 통과, 유턴, 교차로 이동을 프레임 순서에 근거해 분석한다.
- 현재는 영상 프레임 추출, coarse scan, 실제 복수 프레임 OpenAI 호출을 구현하지 않는다. 원본 동영상을 모델에 직접 보내지 않으며 영상 UI 후보는 데모 데이터다.
- 두 prompt 모두 법적 결론을 내리지 않고 보이는 증거만 설명하며, 보이지 않는 시간·장소·번호판을 만들지 않는다. 최종 판단은 관계기관이 수행한다.

### 11.3 단계

분석을 재시도·관찰 가능한 단계로 나눈다.

1. `preflight`: 미디어 검증, 메타데이터 파싱
2. `candidate_detection`: 전체 영상 후보 탐색
3. `fact_extraction`: 번호판 OCR, 시각, 위치 후보 추출
4. `violation_classification`: 지원 8종 후보와 `UNKNOWN` 분류
5. `evidence_assessment`: 유형별 관찰 체크리스트 평가
6. `report_draft_generation`: 사실 중심 문장 초안 생성
7. `package_generation`: 사용자 확인 뒤 핵심 미디어와 snapshot 생성

패키지 생성은 AI 분석 작업과 분리한다. 사용자가 값을 수정한 뒤 최신 revision으로 다시 생성할 수 있어야 하기 때문이다.

### 11.4 버전형 계약

`AnalysisResultV1`은 최소한 다음을 포함한다.

- `schemaVersion`, `jobId`, 처리 상태
- 후보 배열과 각 `startMs/endMs`
- 예상 유형, 탐지 신뢰도, 분류 신뢰도
- `mediaType`과 시간 증거 필요 여부 `needsTemporalEvidence`
- 관찰 사실 중심 참고 근거
- 차량번호·시각·장소 제안과 필드별 신뢰도·출처
- evidence item 코드, 상태, 근거, 관련 구간
- provider, model, prompt, rules version

외부 AI 출력은 신뢰하지 않는다. webhook payload와 결과를 런타임 스키마로 검증하고, enum·길이·범위·시간 구간·신뢰도 값을 정규화한 뒤에만 저장한다. 잘못된 결과는 안전한 오류 코드와 함께 실패 처리하고 그대로 UI에 렌더링하지 않는다.

`UNKNOWN`은 어떤 위반 후보도 합리적으로 제시할 수 없을 때만 사용한다. 단일 사진에서 후보는 관찰되지만 이동 과정이 부족하면 후보 유형을 유지하고 `needsTemporalEvidence`와 부족한 증거를 함께 반환한다.

### 11.5 비동기 처리 흐름

1. 업로드 완료 use case가 고유 idempotency key로 `analysis_jobs`를 만든다.
2. 내구성 있는 queue 또는 분석 제공자에 job을 제출한다.
3. 전용 worker가 짧은 signed URL로 필요한 원본에 접근한다.
4. 가능한 경우 전체 원본 대신 필요한 프레임·구간만 각 AI 제공자에 보낸다.
5. provider callback은 webhook 서명, timestamp, replay 방지 값을 검증한다.
6. 결과는 provider job ID와 idempotency key로 한 번만 반영한다.
7. UI는 Supabase Realtime 또는 제한된 polling으로 상태를 갱신한다.
8. timeout, 일시 오류는 횟수 제한과 backoff를 두고 재시도하며 영구 실패는 사용자에게 복구 행동을 제공한다.

Next.js는 작업 시작·상태 조회·webhook 경계만 담당한다. 영상 디코딩, ffmpeg, 장시간 모델 호출은 별도 worker에서 처리한다.

### 11.6 AI 개인정보 경계

- AI 키는 서버 또는 worker에만 둔다.
- 제공자별 데이터 보존, 모델 학습 사용, 처리 지역, 하위 처리자를 출시 전에 검토한다.
- 업무에 필요하지 않은 음성, 얼굴, 주변 차량 정보는 보내지 않거나 사전 마스킹한다.
- 요청·응답 로그에서 차량번호, 정확 주소, signed URL을 제거한다.
- 사용자의 지도 제공 동의는 AI 처리 동의나 서비스 필수 처리의 근거로 재사용하지 않는다.

### 11.7 영상 프레임 분석 구현 계획

현재 `gpt-6-astra`는 Responses API의 이미지 입력과 Structured Outputs을 지원하지만 동영상 입력은 지원하지 않는다. 따라서 원본 동영상을 모델에 보내지 않고, 서버 작업자가 FFmpeg로 추출한 이미지 프레임에 timestamp를 붙여 시간순으로 전달한다. 이 경계는 OpenAI의 [GPT-6 Astra 모델 명세](https://developers.openai.com/api/docs/models/gpt-6-astra)와 [이미지 입력 가이드](https://developers.openai.com/api/docs/guides/images-vision)에 맞춘다.

```text
MP4/MOV 선택
→ private upload 또는 개발용 임시 업로드
→ 컨테이너·크기·길이·video stream 검증
→ 분석 job 생성(202 Accepted)
→ coarse frame 추출·분석
→ timestamp 후보 생성·병합
→ 후보 주변 detailed frame 추출·분석
→ VideoAnalysisResultV1 검증
→ 기존 의심 장면 선택 UI
→ HUMAN REVIEW → 증거 진단 → AI 신고서
```

`POST /api/analyze-image`는 현재 사진 1장 분석 전용으로 그대로 둔다. 영상은 처리 시간, 파일 제한, 복수 후보 응답과 오류가 다르므로 별도의 `POST /api/analyze-video` 경계를 사용한다. 배포 형태에서는 이 Route가 대용량 원본을 직접 처리하지 않고 업로드 완료된 private asset을 확인한 뒤 job을 만들고 `202 Accepted`와 불투명한 `jobId`만 반환한다. 진행 상태는 향후 공통 `GET /api/analyses/[jobId]`에서 조회한다. 로그인·DB·private storage가 없는 현재 MVP에는 이 Route를 아직 만들지 않는다.

#### 11.7.1 업로드와 preflight 정책

아래 값은 법적 기준이 아닌 **공모전 MVP의 초기 운영 제안값**이다. 실제 샘플 영상, 배포 환경과 비용 측정 뒤 버전형 설정으로 조정한다.

| 항목 | 초기 제안 | 검증 방식 |
| --- | --- | --- |
| 컨테이너 | MP4, MOV | 확장자/MIME은 사전 안내에만 사용하고 ISO-BMFF `ftyp` signature와 ffprobe 결과로 재검증 |
| 최대 크기 | 100 MB | 현재 업로드 UI와 같은 상한을 적용하고, 업로드 완료 후 서버의 실제 byte 크기 재검증 |
| 최대 길이 | 5분 | ffprobe의 유한한 duration을 사용하고 0초·누락·초과 값을 거부 |
| stream | video stream 정확히 1개 이상 | audio-only, 암호화·지원 불가 stream, 읽을 수 없는 codec/container 거부 |
| 기본 화면 조건 | 유효한 폭·높이·frame rate | 비정상 metadata, 0 크기, decode 불가를 거부하고 대표 구간 decode로 손상 확인 |

검증 순서는 `선언값 → magic bytes → ffprobe metadata → 제한된 decode 검사`다. 사용자 파일명은 명령어나 임시 경로에 사용하지 않고 서버가 생성한 job ID와 랜덤 이름만 쓴다. FFmpeg/ffprobe 실행은 문자열 shell command가 아니라 argument array로 호출한다.

사용자 오류는 내부 codec, 경로, 명령문을 숨기고 다음처럼 복구 행동만 제공한다.

- 형식: `MP4 또는 MOV 영상을 선택해주세요.`
- 크기: `영상은 100 MB 이하만 분석할 수 있어요.`
- 길이: `영상은 5분 이하만 분석할 수 있어요.`
- stream/손상: `영상 내용을 확인할 수 없습니다. 원본 영상을 다시 선택해주세요.`
- 처리 실패: `영상 준비 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`

#### 11.7.2 FFmpeg 실행과 임시 파일

- Windows 로컬 개발에서는 FFmpeg/ffprobe 설치 위치를 `FFMPEG_PATH`, `FFPROBE_PATH` 같은 서버 전용 설정으로 주입하고 시작 시 버전과 실행 가능 여부만 검사한다. 절대 경로와 사용자 미디어 정보는 로그에 남기지 않는다.
- 운영 worker는 검증된 FFmpeg 버전과 checksum을 container image에 고정한다. npm 패키지가 임의 binary를 내려받게 하지 않고, binary 교체는 배포 artifact 검토를 거친다.
- Vercel의 Route Handler는 job 생성과 상태 조회만 담당한다. 장시간 decode, 큰 binary, 많은 임시 파일이 필요한 FFmpeg 작업은 실행 시간·메모리·ephemeral disk 제약을 피하도록 별도 container worker와 durable queue에서 수행한다.
- worker는 OS 임시 디렉터리 아래 `barojapgil/<opaque-job-id>/`를 만들고 원본, coarse, detailed 하위 디렉터리를 분리한다. 접근 권한을 최소화하고 사용자 파일명을 포함하지 않는다.
- 정상·실패·취소 모두 `finally`에서 파생 프레임과 임시 원본을 삭제한다. process crash에 대비해 시작 시 또는 주기적으로 TTL이 지난 job 디렉터리를 청소한다. 삭제 실패는 민감 경로 없이 job ID와 안전한 오류 코드만 기록한다.
- 영속 저장이 없는 MVP에서는 프레임을 공개 저장소에 올리지 않는다. 향후 private storage가 생겨도 원본과 파생 프레임에는 짧은 보존 기간과 `private, no-store`를 적용한다.

#### 11.7.3 coarse scan

전체 프레임을 전송하지 않는다. 5분 이하 MVP 영상은 **3초 간격**을 기본으로 하여 최대 100개 coarse frame을 뽑는다. 2초 간격은 60초 이하의 짧은 영상이나 평가에서 3초 샘플링의 누락률이 높게 확인된 구간에만 사용한다. coarse frame은 크기를 줄이고 `detail: "low"`로 보내 비용을 낮춘다.

프레임은 timestamp 오름차순으로 정렬하고, 한 요청에 8~12개씩 묶는다. 각 이미지 바로 앞에 `frameIndex`, `timestampSeconds`를 담은 `input_text`를 넣어 모델이 이미지 순서를 임의로 해석하지 않게 한다. batch 경계에서는 동일 이미지를 다시 보내지 않는다. 직전 batch의 짧은 구조화 요약만 다음 요청의 텍스트 문맥으로 넘기고, `영상 checksum + timestamp + extraction profile` 키로 중복 전송을 차단한다.

coarse 응답은 법적 판단이 아니라 `startTimeSeconds`, `endTimeSeconds`, `keyTimestamp`, 예상 유형, 짧은 관찰 요약과 신뢰도를 가진 후보다. 인접 batch가 같은 유형과 가까운 timestamp를 반환하면 하나로 병합한다. 후보가 없으면 detailed 단계와 추가 AI 요청을 즉시 중단한다.

#### 11.7.4 후보 구간 detailed scan

coarse 후보의 `keyTimestamp` 전후 2초를 0.5초 간격으로 추출한다. 예를 들어 12초 후보는 `10.0, 10.5, ..., 14.0`의 최대 9개 프레임을 사용한다. 영상 경계 밖 timestamp는 제외하고 후보끼리 겹치는 프레임은 timestamp와 content hash로 재사용한다.

서로 겹치는 후보 구간은 먼저 하나의 분석 window로 병합해 같은 프레임을 여러 요청에 다시 보내지 않는다. detailed 요청마다 각 프레임 앞에 `t=10.0s` 같은 명시적 timestamp를 둔다. `analysis-instructions.ts`의 VIDEO 원칙을 재사용해 모델이 제공된 순서에서 직접 관찰되는 변화만 설명하게 한다. 번호판·신호처럼 세부 판독이 필요한 후보 프레임만 `detail: "high"`를 사용하고, 보이지 않는 프레임 사이 움직임은 추측하지 않는다.

영상에서 우선 평가할 관찰값은 신호 변화와 진입 시점, 정지선 통과, 중앙선 침범 전후 이동, 차선 변경과 끼어들기, 불법 유턴, 교차로 진행 방향, 주변 차량과의 상대 위치, 위반 전후 문맥이다. 필요한 구간이 가려졌거나 누락되면 기존 `UNCERTAIN`/`MISSING`, `missingEvidence`, `needsTemporalEvidence`를 그대로 사용한다.

#### 11.7.5 영상 결과 계약

증거 상태, 위반 enum, 추출 후보와 안전 문구는 현재 `analysis-v1` 계약에서 공유하고 영상 envelope만 별도로 둔다.

```ts
interface VideoKeyFrame {
  timestampSeconds: number;
  role: "CONTEXT" | "KEY_EVIDENCE";
  // 원본 bytes, base64, 공개 URL은 응답에 포함하지 않는다.
}

interface VideoViolationCandidate {
  candidateId: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  keyTimestamp: number;
  suspectedViolation: boolean;
  violationType: ViolationType;
  confidence: number;
  summary: string;
  reasoningSummary: string;
  plateNumberCandidate: string | null;
  occurredAtCandidate: string | null;
  locationCandidate: string | null;
  evidenceItems: EvidenceItem[];
  missingEvidence: string[];
  warnings: string[];
  needsTemporalEvidence: boolean;
  keyFrames: VideoKeyFrame[];
}

interface VideoAnalysisResultV1 {
  analysisId: string;
  mediaType: "VIDEO";
  durationSeconds: number;
  candidates: VideoViolationCandidate[];
}
```

런타임 Zod schema는 후보를 timestamp 오름차순으로 정규화하고 `0 <= start <= key <= end <= duration`, confidence 범위, 후보·프레임 최대 개수, 문자열 길이를 검증한다. key frame의 내부 임시 경로는 server/worker 내부 DTO에만 두고 브라우저 응답에는 timestamp와 권한 확인된 미리보기 식별자만 제공한다.

#### 11.7.6 비용·속도 제한

공모전 MVP의 한 분석 job에 다음 상한을 둔다.

- 영상 1개, 100 MB, 5분
- coarse frame 최대 100개, request당 8~12개
- detailed candidate 최대 3개
- candidate당 detailed frame 최대 9개
- 중복 제거 뒤 AI 입력 프레임 총 127개 이하
- 동일 영상 checksum, timestamp, extraction profile, prompt/schema version 조합의 중복 분석 방지
- job당 동시 AI 요청 1~2개와 전체 timeout/retry budget

coarse는 낮은 detail과 짧은 Structured Output을 사용하고, detailed만 높은 detail을 사용한다. 후보 신뢰도 하한은 평가 fixture로 정하며 임의로 법적 의미를 부여하지 않는다. 요청 실패는 batch 단위로 제한된 횟수만 backoff 재시도하고, 전체 영상을 처음부터 중복 분석하지 않는다.

#### 11.7.7 개인정보와 UI 연결

- 원본과 프레임은 분석 worker의 private 임시 처리 범위를 벗어나 공개하지 않는다. 현재 영속 저장 기능이 없는 MVP는 분석 종료 즉시 삭제를 기본으로 한다.
- OpenAI에는 coarse/detailed 단계에 필요한 프레임만 보내며 음성, 전체 원본, 불필요한 얼굴·주변 차량 crop은 보내지 않는다. 제공자 보존 정책과 마스킹 기준은 출시 전에 별도 검토한다.
- API key, provider 원본 응답, 임시 경로, signed URL은 클라이언트와 사용자 오류에 포함하지 않는다. UI에는 공통 schema로 검증·정제한 candidate만 반환한다.
- 현재 분석 진행 화면은 영상일 때 `영상 준비 → 장면 탐색 → 후보 구간 분석 → 신고 증거 확인` 네 단계로 매핑한다.
- 성공 결과는 기존 `AI가 찾은 의심 장면` 카드에 여러 candidate를 시간순으로 표시한다. 사용자가 하나를 고른 뒤 `HUMAN REVIEW → 증거 진단 → AI 신고서` 흐름과 사용자 수정 상태를 그대로 재사용한다.

#### 11.7.8 추가 예정 파일과 구현 순서

권장 추가 파일은 다음과 같다. 이름은 구현 시 현재 폴더 책임에 맞춰 조정하되 이미지 파일을 영상 전용 로직으로 비대하게 만들지 않는다.

```text
src/app/api/analyze-video/route.ts
src/app/api/analyses/[jobId]/route.ts
src/contracts/video-upload.ts
src/contracts/analysis-v1/video-analysis.ts
src/application/ports/video-metadata-reader.ts
src/application/ports/video-frame-extractor.ts
src/application/ports/video-analysis-job.ts
src/application/use-cases/analyze-video.ts
src/infrastructure/video/ffprobe-video-metadata-reader.ts
src/infrastructure/video/ffmpeg-frame-extractor.ts
src/infrastructure/ai/openai-video-frame-analysis-provider.ts
src/infrastructure/ai/mock-video-analysis-provider.ts
src/server/media/validate-video-upload.ts
src/server/video/temp-video-workspace.ts
src/server/video/video-analysis-config.ts
src/server/security/video-analysis-rate-limit.ts
```

구현 순서:

1. `video-upload`과 `VideoAnalysisResultV1` schema, 정책 상수, 합성 fixture를 만들고 경계값 계약 테스트를 작성한다.
2. `VideoMetadataReader` 포트와 결정적 mock을 먼저 연결해 MP4/MOV preflight Route의 오류 계약을 검증한다.
3. Windows 로컬용 ffprobe adapter와 안전한 per-job 임시 작업공간·cleanup을 구현한다.
4. FFmpeg coarse/detailed 추출기를 만들고 timestamp 정확도, 최대 프레임 수, 중복 제거를 fixture 영상으로 검증한다.
5. mock video provider로 복수 후보와 기존 선택 UI를 연결한다.
6. timestamp가 포함된 ordered multi-image OpenAI provider와 Structured Output을 추가하고 대표 영상 평가셋으로 prompt를 검증한다.
7. durable queue/worker와 job 상태 Route를 붙인 뒤 Vercel Route를 오케스트레이션 전용으로 제한한다.
8. 취소·timeout·재시도·TTL cleanup·민감 로그 redaction을 검증한 뒤 운영 상한을 조정한다.

주요 위험은 variable frame rate에서 timestamp 오차, MOV codec 호환성, 회전 metadata, 손상 영상 decode 지연, 짧은 사건의 coarse sampling 누락, 후보 batch 경계 단절, 대상 차량 identity drift, 번호판·얼굴 개인정보, FFmpeg binary 공급망, 서버리스 제한, 다중 이미지 비용과 provider rate limit이다. 각 위험은 합성/동의된 평가 영상, 고정 FFmpeg 버전, 프레임 상한, 경계 프레임, 사용자 검토, worker 격리와 측정 가능한 품질·비용 지표로 관리한다.

다음 Codex 작업의 첫 최소 기능은 **AI나 FFmpeg를 호출하지 않는 video preflight vertical slice**다. `video-upload`/결과 schema, 정책 상수, `VideoMetadataReader` 포트와 mock, `POST /api/analyze-video`의 안전한 오류 응답까지 구현해 현재 이미지 분석과 독립된 경계를 먼저 검증한다.

## 12. 증거 충족도 설계

AI가 관찰 사실을 추출하고, 버전형 규칙이 위반 유형별 체크리스트를 계산한다. 법률 결론을 모델의 자유 형식 문장 하나에 맡기지 않는다.

- 관찰값: 신호 색, 차선/중앙선, 차량 궤적, 관련 시점 등
- 규칙: 유형별 필요한 관찰 조합과 상태 계산
- 결과: item별 `CLEAR/UNCERTAIN/MISSING`과 설명
- 표시: `증거가 충분해 보임/추가 확인 필요/부족/판단 불가`

유형별 기본 체크리스트는 다음처럼 분리한다.

| 예상 유형 | 기본 증거 항목 |
| --- | --- |
| 신호위반 | 차량 식별, 신호 상태, 차량 진입 시점, 정지선·교차로 위치, 전후 상황, 시각, 장소 |
| 정지선·횡단보도 침범 | 차량 위치, 정지선 위치, 횡단보도 위치, 보행자 통행 방해 여부, 차량 식별, 시각, 장소 |
| 중앙선 침범 | 중앙선 가시성, 차량 위치, 반대 차로 진입 여부, 이동 전후 장면, 차량 식별 |
| 위험 끼어들기 | 차선 가시성, 차선 변경 과정, 주변 차량과 거리, 방향지시등 여부, 전후 영상 |
| 불법 유턴 | 금지 표지·노면표시, 회전 경로, 금지 구간·신호 상태, 이동 전후 장면, 차량 식별 |
| 교차로 통행방법 위반 | 차로·표지·신호, 진입 위치, 교차로 내부 이동, 통행 방해 정황, 전후 장면, 차량 식별 |
| 불법 주정차 | 정지 위치, 금지 표지·노면표시, 정차 지속 정황, 통행 방해 여부, 차량 식별, 시각, 장소 |
| 기타 교통위반 | 관찰된 행동, 관련 교통시설·표지, 차량 식별, 시각, 장소, 추가 확인 항목 |

사진에서 확인할 수 없는 시간 기반 항목은 `UNCERTAIN` 또는 `MISSING`으로 반환한다. 규칙은 `mediaType`을 입력으로 받고, `VIDEO`일 때만 순서가 명시된 복수 프레임의 이동 증거를 사용할 수 있다.

규칙에는 `ruleVersion`, 근거 출처, 검수일을 둔다. 사용자가 위반 유형을 바꾸면 같은 관찰값에 새 유형 규칙을 적용한다. 법령이나 공식 신고 기준 변경 시 기존 결과를 조용히 바꾸지 않고 재평가 여부를 명시한다.

## 13. 안전신문고 수동 이동 설계

신고 준비 완료 화면은 준비된 자료를 요약하고 자동 전송이나 자동 제출이 일어나지 않는다는 점을 알린다. 외부 신고 버튼은 allowlist로 검증된 안전신문고 공식 URL만 열며, 사용자가 버튼을 직접 누른 뒤 안전신문고에서 첨부·제출한다.

외부 사이트로 이동한 사실만으로 신고 완료 상태를 만들지 않는다. 신고 완료는 사용자가 직접 완료 사실을 표시할 때만 기록하며, 서비스는 안전신문고 계정 정보나 비밀번호를 저장하지 않는다.

## 14. 교통위험지도 개인정보 설계

### 14.1 현재 지도 클라이언트 구조

`/risk-map`의 Server Component는 빌드 환경의 `NEXT_PUBLIC_KAKAO_MAP_KEY`를 지도 Client Component에 전달한다. JavaScript SDK 키는 브라우저 공개용 플랫폼 키이므로 Kakao Developers에서 허용 도메인을 제한하며, 서버 전용 키나 OpenAI 키와 혼용하지 않는다. SDK는 위험지도 화면에서만 `autoload=false`로 한 번 로드하고 `kakao.maps.load` 콜백 이후 지도 인스턴스를 만든다.

지도 Client Component는 다음 경계를 갖는다.

```text
RiskMapView
├─ LayerSelector
├─ KakaoMapSdk              # script 중복 방지, timeout과 load 오류
├─ KakaoTrafficMap          # 지도 생명주기와 Kakao overlay adapter
├─ demo aggregate areas     # 합성 구역 중심·반경, 실제 사건 아님
└─ RiskAreaDetailCard       # 공개 가능한 구역 요약만 표시
```

레이어 계약은 `TRAFFIC | ACCIDENT_HOTSPOT | INCIDENT | BAROJAPGIL_REPORT`로 분리한다. `종합`은 별도 데이터 레이어가 아니라 현재 사용 가능한 `TRAFFIC`과 `BAROJAPGIL_REPORT`를 함께 켜는 UI preset이다.

- `TRAFFIC`: Kakao Maps의 `MapTypeId.TRAFFIC` 실제 오버레이. 선택에 따라 `addOverlayMapTypeId`/`removeOverlayMapTypeId`로 전환한다.
- `ACCIDENT_HOTSPOT`: 향후 도로교통공단 TAAS adapter가 채울 준비 중 레이어다.
- `INCIDENT`: 향후 서울 TOPIS 사고·공사·통제 adapter가 채울 준비 중 레이어다.
- `BAROJAPGIL_REPORT`: 실제 DB 연결 전까지 DEMO 합성 집계구역만 표시한다.

`window.kakao` 접근, 지도와 overlay 생성은 Client Component effect 안에서만 수행한다. 키 누락, SDK 네트워크 오류, 허용 도메인 오류 또는 초기화 예외는 지도 영역의 명시적 오류 상태로 수렴시키며 다른 앱 화면과 AI 분석 경계에는 전파하지 않는다.

### 14.2 비식별 집계 데이터 흐름

데이터 흐름:

1. 사용자가 지도 제공에 별도로 동의한다.
2. 사용자가 유형·장소를 확인한 case만 제한 원천의 후보가 된다.
3. 사용자 ID, 차량번호, 미디어, 신고 문장, 정확 주소·좌표·시각을 제거한다.
4. 위치를 충분히 큰 격자/도로 구간으로, 시간을 넓은 구간으로 일반화한다.
5. 최소 표본 수와 재식별 위험 검사를 통과한 셀만 집계한다.
6. 공개 API는 `cell/period/type/count`와 설명 가능한 지표만 반환한다.
7. 지도는 개별 마커가 아니라 격자 또는 heatmap으로 표시한다.

`risk_contributions`는 공개 익명 데이터가 아니라 접근이 제한된 가명처리 중간 계층이다. 외부에는 최소 표본 임계값을 통과한 `risk_aggregates`만 노출한다. 격자 크기, 시간 bucket, 최소 표본 수, 철회 후 재집계 방식은 개인정보 검토 후 확정한다.

## 15. 캐시와 데이터 노출

- 사용자 case, 분석 결과, 원본·파생 미디어 응답은 기본적으로 private/no-store다.
- 사용자별 데이터에 정적 공개 캐시를 적용하지 않는다.
- 공개 집계 지도만 정책 버전과 갱신 주기에 맞춰 캐시할 수 있다.
- URL과 query string에 차량번호, 정밀 좌표, 미디어 path를 넣지 않는다.
- Client Component에는 화면에 필요한 최소 직렬화 DTO만 전달한다.
- 서버 전용 모듈은 `server-only` 경계를 사용해 Client bundle 유입을 빌드 단계에서 막는다.
- 오류 응답은 사용자 행동에 필요한 코드만 반환하고 provider 원문, SQL, object path를 숨긴다.

## 16. 보안 통제

- 모든 변경 요청에 세션, 소유권, 현재 상태, 입력 스키마를 확인한다.
- 업로드 서명, 분석 시작, 상태 polling, 다운로드, webhook에 rate limit과 quota를 둔다.
- webhook은 서명, 허용 timestamp, nonce 또는 이벤트 ID로 위조와 replay를 막는다.
- CSRF와 동일 출처 정책을 mutation 방식에 맞게 적용한다.
- 신고 문장과 AI 설명은 신뢰하지 않는 텍스트로 보고 HTML 삽입을 금지하거나 정제한다.
- Storage object path는 사용자 입력으로 직접 조합하지 않는다.
- 로그는 case/job의 불투명 ID와 오류 코드 중심으로 남기며 민감값을 구조적으로 차단한다.
- 사용자 삭제 시 DB row, 원본, 파생 미디어, 패키지, 대기 job을 함께 삭제 또는 폐기한다.
- 보존 삭제와 동의 철회 작업은 감사 가능한 이벤트를 남기되 민감 원문은 남기지 않는다.

## 17. 테스트 전략

현재 테스트 러너는 설치되어 있지 않으므로 문서 변경 시에는 `npm run lint`와 `npm run build`가 기본 검증이다. 기능 구현 때 다음 계층을 도입한다.

| 계층 | 주요 검증 |
| --- | --- |
| 단위 | 상태 전이, 증거 규칙, DTO redaction, 문장 생성의 누락값 처리 |
| 계약 | mock과 실제 adapter가 같은 포트·`AnalysisResultV1`을 만족하는지 |
| 컴포넌트 | 후보 선택, 필드 출처 표시, 접근성, 신고 준비 완료 안내 |
| 통합 | RLS 소유권, private Storage, signed URL 만료, webhook 멱등성과 replay 방지 |
| E2E | 업로드→분석→후보→수정→패키지→신고 준비 완료→외부 이동 전 확인 |

E2E에서는 안전신문고를 가짜 목적지로 대체하고 실제 외부 제출을 절대 수행하지 않는다. Next.js 로컬 가이드가 async Server Component에는 E2E 테스트를 권장하므로 서버 렌더링 흐름은 E2E 비중을 높인다.

## 18. 단계별 전환

### 단계 1: mock UI

- 합성 fixture와 mock ports로 전체 사용자 흐름 구현
- 상태와 오류 시나리오, 모바일 UX, 안전 문구 검증
- 사용자 원본은 영속 저장하지 않음

### 단계 2: Supabase 기반 저장

- Auth 방식 결정, migration과 RLS 추가
- private Storage 직접 업로드와 보존 삭제 추가
- repository만 mock에서 Supabase adapter로 교체

### 단계 3: 비동기 AI

- queue/worker, `AnalysisResultV1`, callback 보안 추가
- mock과 실제 AI 결과의 계약 테스트
- 모델·규칙 평가와 품질 모니터링

### 단계 4: 교통위험지도

- 동의·가명처리·집계·철회 파이프라인 검증
- 최소 표본 기준을 충족한 집계만 공개

## 19. 구현 전 결정 사항

- 로그인 방식과 비회원 사용·계정 연결 정책
- 지원 파일 형식, 최대 크기·길이, quota
- 원본, 파생물, AI 원본 응답, 패키지의 보존 기간
- 영상 처리 worker와 queue 운영 방식
- AI 제공자, 처리 지역, 보존·학습 사용 정책
- 위치 추출·지도 검색 제공자와 API 키 노출 정책
- 안전신문고 공식 URL 및 앱 딥링크 정책
- 지도 격자·시간 단위, 최소 표본 수, 위험 지표 산식
- 동의 철회 시 기존 집계 재계산 방식
- 신고 패키지 파일 형식과 핵심 영상 인코딩 규격

이 항목은 구현 과정에서 임의로 결정하지 않고 제품·법률·개인정보·운영 검토 후 문서와 버전형 정책으로 확정한다.
