# 📚 JLPT N3 벼락치기

JLPT N3 **단어·문법 문제를 한 문제씩 무작위로 풀어보는 모바일 퀴즈 앱**입니다.
휴대폰 브라우저에서 바로 열어 짧은 시간에 반복 학습하는 용도로 만들었습니다.

- 출제 문제: **131문제** (단어 65 · 문법 66), `questions.json`에 직접 작성
- 카테고리 선택: **혼합 / 단어 / 문법**
- 정답·오답 즉시 피드백 + **해설 표시**
- 정답 수 / 정답률 누적 표시
- 모바일 화면 기준 UI (버튼 최소 높이 44px, 진동 피드백 지원)

## 구조

```
jlpt-n3/
├── public/index.html   # 퀴즈 화면 (HTML/CSS/JS 한 파일)
├── questions.json      # 문제은행 (question, choices, answerIndex, explanation, category)
└── server.js           # Express 서버: 정적 파일 제공 + POST /api/question
```

**동작 방식**
1. 브라우저가 카테고리를 골라 `POST /api/question` 호출
2. 서버가 `questions.json`에서 해당 카테고리 문제 중 1개를 무작위로 골라 반환
3. 화면에서 선택지를 누르면 정답 여부와 해설을 즉시 표시

API 키나 외부 서비스가 필요 없는 **오프라인 학습용** 앱입니다.

## 로컬 실행

```bash
npm install
npm start        # http://localhost:3001
```

포트를 바꾸려면 `.env`에 `PORT`를 지정하거나 `PORT=4000 npm start`로 실행하면 됩니다.

### 환경 변수

| 변수명 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `PORT` | — | `3001` | 서버 포트 |

`.env.example`을 `.env`로 복사해 사용하세요. `.env`는 `.gitignore`에 포함되어 있습니다.

## 문제 추가하기

`questions.json`에 아래 형식으로 항목을 추가하면 바로 출제됩니다.

```json
{
  "question": "この仕事は思ったより___がかかった。",
  "choices": ["お金", "時間", "期間", "気持ち"],
  "answerIndex": 1,
  "explanation": "「時間がかかる」= 시간이 걸리다.",
  "category": "vocab"
}
```

`category`는 `vocab`(단어) 또는 `grammar`(문법)입니다.

## 기술 스택

- Node.js + Express (정적 파일 서빙, 문제 추첨 API)
- Vanilla HTML/CSS/JavaScript (프레임워크 없이 단일 파일 UI)
