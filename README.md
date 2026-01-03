# Awesome Anki

<img width="1719" height="983" alt="example" src="https://github.com/user-attachments/assets/6af494b7-0395-43d7-a41c-9a614c251047" />

Anki 카드를 원자적 단위로 분할하는 웹 애플리케이션. 정보 밀도가 높은 카드를 학습 효율이 좋은 작은 카드들로 자동 분리합니다.

## 주요 기능

### 카드 분할
- **Hard Split**: `####` 헤더 기반 정규식 분할 (빠르고 정확)
- **Soft Split**: Gemini AI 기반 의미 분석 분할 (복잡한 카드 처리)
- **nid 승계**: 원본 카드 ID 유지 + 역링크 자동 생성
- **학습 데이터 복제**: ease factor 복제로 학습 진도 보존

### 카드 검증
- **팩트 체크**: Gemini AI 기반 내용 정확성 검사
- **최신성 검사**: 기술 정보 최신성 확인
- **유사성 검사**: Jaccard + Gemini 임베딩 기반 중복 탐지
- **문맥 일관성**: nid 링크로 연결된 카드 간 논리 검증

### 기타
- **백업/롤백**: 분할 전 자동 백업 + 원클릭 롤백
- **도움말 시스템**: HelpTooltip + 온보딩 투어
- **실시간 미리보기**: Markdown + KaTeX + Cloze 렌더링

## 기술 스택

| 영역 | 기술 |
|------|------|
| 런타임 | Bun |
| 언어 | TypeScript |
| LLM | Gemini 3 Flash Preview |
| 백엔드 | Hono (REST API) |
| 프론트엔드 | React + Vite |
| 스타일링 | Tailwind CSS v4 |
| 상태 관리 | TanStack Query |
| 렌더링 | markdown-it + KaTeX |

## 설치

### 사전 요구사항
- [Bun](https://bun.sh/) 설치
- [Anki](https://apps.ankiweb.net/) + [AnkiConnect](https://ankiweb.net/shared/info/2055492159) 애드온

### 설치 방법

```bash
# 저장소 클론
git clone https://github.com/your-username/anki-claude-code.git
cd anki-claude-code

# 의존성 설치
bun install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 GEMINI_API_KEY 설정
```

## 실행

### 웹 GUI (권장)

```bash
# 개발 서버 (서버 + 클라이언트 동시 실행)
bun run dev

# 서버만 (localhost:3000)
bun run dev:server

# 클라이언트만 (localhost:5173)
bun run dev:web
```

### CLI

```bash
# 연결 확인
bun run cli:status

# 분할 미리보기
bun run cli:split

# 분할 적용
bun run cli:split -- --apply

# 특정 카드 분할
bun run cli split --note <noteId>

# 백업/롤백
bun run cli backups
bun run cli rollback <backupId>
```

## 프로젝트 구조

```
anki-claude-code/
├── packages/
│   ├── core/                 # 핵심 로직 (CLI + 웹 공용)
│   │   └── src/
│   │       ├── anki/         # AnkiConnect API 래퍼
│   │       ├── gemini/       # Gemini API 호출 (분할)
│   │       ├── embedding/    # Gemini 임베딩 (유사도)
│   │       ├── parser/       # 텍스트 파싱
│   │       ├── splitter/     # 분할 로직
│   │       ├── validator/    # 카드 검증
│   │       └── utils/        # 유틸리티
│   │
│   ├── server/               # Hono REST API
│   │   └── src/
│   │       ├── index.ts      # 서버 진입점 (localhost:3000)
│   │       └── routes/       # API 라우트
│   │
│   └── web/                  # React 프론트엔드
│       └── src/
│           ├── pages/        # Dashboard, CardBrowser, SplitWorkspace
│           ├── components/   # UI 컴포넌트
│           └── hooks/        # TanStack Query 훅
│
├── src/                      # CLI 진입점
├── output/backups/           # 분할 백업 저장소
├── output/embeddings/        # 임베딩 캐시 파일
└── docs/                     # 문서
    ├── TODO.md               # 진행 상황
    ├── FEATURES.md           # 기능 상세
    └── TROUBLESHOOTING.md    # 문제 해결
```

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/decks | 덱 목록 |
| GET | /api/decks/:name/stats | 덱 통계 |
| GET | /api/cards/deck/:name | 카드 목록 |
| GET | /api/cards/:noteId | 카드 상세 |
| POST | /api/split/preview | 분할 미리보기 |
| POST | /api/split/apply | 분할 적용 |
| GET | /api/backup | 백업 목록 |
| POST | /api/backup/:id/rollback | 롤백 |
| POST | /api/validate/fact-check | 팩트 체크 |
| POST | /api/validate/freshness | 최신성 검사 |
| POST | /api/validate/similarity | 유사성 검사 |
| POST | /api/validate/context | 문맥 일관성 검사 |
| POST | /api/embedding/generate | 덱 임베딩 생성 |

## 주의사항

- **Anki 프로필**: 반드시 `test` 프로필에서 작업 (`open -a Anki --args -p test`)
- **AnkiConnect**: localhost:8765에서 실행 중이어야 함
- **API 키**: Soft Split, 검증 기능 사용 시 `GEMINI_API_KEY` 필요

## 문서

- [TODO.md](docs/TODO.md) - 진행 상황 및 다음 작업
- [FEATURES.md](docs/FEATURES.md) - 기능 및 기술 상세
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - 문제 해결 기록

## 라이선스

MIT
