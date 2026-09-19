<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 바로잡길 개발 지침

## 개발 원칙

- 기능을 변경하기 전에 `docs/PRODUCT_SPEC.md`와 `docs/ARCHITECTURE.md`를 확인한다.
- Next.js App Router, TypeScript, Tailwind CSS를 사용하고 모바일 화면을 우선한다.
- Server Component를 기본으로 사용하고, 상태·이벤트·브라우저 API가 필요한 최소 범위만 Client Component로 만든다.
- 컴포넌트는 한 가지 책임을 갖도록 작게 나누며, UI·도메인 규칙·외부 연동을 분리한다.
- Supabase와 AI 기능은 타입이 명확한 포트와 어댑터 뒤에 두어 mock 구현과 교체 가능하게 만든다.
- 초기 MVP는 신호위반, 중앙선 침범, 위험 끼어들기만 지원한다. 실제 연동 전에는 개인정보가 없는 결정적 mock 데이터를 사용한다.
- 새 의존성은 필요성과 유지보수 비용을 확인한 뒤 최소한으로 추가한다.
- 관련 없는 파일과 사용자의 기존 변경을 건드리지 않는다.

## 제품 안전 원칙

- AI 결과는 항상 `예상 위반 유형`, `AI 참고 분석`으로 표현하며 위법 여부나 신고 수리를 확정하지 않는다.
- 차량번호·시각·장소·위반 유형·신고 문장 등 신고에 쓰이는 값은 사용자가 확인하고 수정할 수 있어야 한다.
- 원본 AI 결과와 사용자 수정값의 출처를 구분해 보존한다.
- 사용자의 명시적 동작 없이 안전신문고를 열거나 자료를 전송하거나 신고를 완료하지 않는다.
- 신고 지연은 버튼 활성 시점만 관리하며 자동 신고로 구현하지 않는다.

## 테스트와 검증

- 모든 변경 후 `npm run lint`를 실행한다.
- 라우팅, 타입, 빌드 설정, 서버/클라이언트 경계에 영향이 있으면 `npm run build`도 실행한다.
- 테스트 도구가 도입되면 판정 규칙·증거 충족도·지연 시점 계산은 단위 테스트로, 업로드부터 신고 준비까지는 통합/E2E 테스트로 검증한다.
- 외부 AI·지도·저장소·알림은 테스트에서 mock 처리하고 실제 신고나 실제 사용자 데이터 전송을 발생시키지 않는다.
- 타입 오류나 lint 규칙을 무시하는 방식으로 검증을 우회하지 않는다. 예외가 필요하면 이유를 코드 가까이에 기록한다.
- 완료 보고에는 실행한 검증과 결과, 실행하지 못한 검증과 이유를 포함한다.

## 보안과 개인정보

- 원본 영상·사진, 차량번호, 정밀 위치, 발생 시각은 민감정보로 취급하고 목적에 필요한 최소 범위만 수집·보관한다.
- 비밀키는 서버 전용 환경변수에 두고 커밋하지 않는다. 브라우저 공개가 의도된 값에만 `NEXT_PUBLIC_`을 사용한다.
- 업로드는 서버 측에서 형식·크기·길이를 검증하고, 비공개 저장소·짧은 만료의 서명 URL·사용자별 접근 통제를 기본으로 한다.
- 개인정보와 원본 미디어를 URL, 로그, 분석 이벤트, 오류 메시지, 공개 캐시에 남기지 않는다.
- 공개 화면과 교통위험지도에는 차량번호와 원본 미디어를 절대 표시하지 않는다.
- 지도에는 별도 동의된 데이터만 비식별·공간/시간 단위로 집계해 사용하고 소수 집계는 노출하지 않는다.
- Supabase 연결 시 최소 권한과 RLS를 적용하고 모든 읽기·수정·삭제에서 소유권을 서버 측에서 다시 확인한다.
- Route Handler와 Server Action은 공개 엔드포인트와 동일하게 입력 검증, 인증, 인가, 속도 제한을 적용한다.
- AI 출력과 미디어 메타데이터는 신뢰하지 않는 입력으로 취급하고 스키마 검증과 화면 출력 정제를 거친다.
- 보존 기간, 삭제, 지도 제공 동의 철회가 데이터 모델과 처리 흐름에 반영되어야 한다.
