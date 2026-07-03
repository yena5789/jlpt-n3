import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-lite";

function buildSystemPrompt(category) {
  const categoryInstruction =
    category === "vocab"
      ? "문자・어휘(한자읽기, 문맥규정, 유의어/바꿔말하기, 용법) 문제만 출제해줘."
      : category === "grammar"
      ? "문법(적절한 문형/조사/표현 고르기) 문제만 출제해줘."
      : "문자・어휘와 문법 문제를 무작위로 섞어서 출제해줘.";

  return `당신은 JLPT(일본어능력시험) N3 전문 출제위원입니다.
실제 N3 기출 스타일과 최근 출제 경향(일상 회화/비즈니스 상황 표현, 가타카나 외래어, 뉘앙스 차이를 묻는 문제)을 반영해서 4지선다 객관식 문제를 출제해줘.

${categoryInstruction}

규칙:
- 문제 문장(question)은 실제 시험처럼 일본어로 작성하고, 빈칸은 ___ 로 표시.
- 선택지(choices)는 4개, 전부 일본어로.
- 정답은 반드시 1개, 나머지는 헷갈릴 만한 오답으로.
- 설명(explanation)은 한국어로 1~2문장, 핵심만 간결하게.
- N3 수준을 정확히 지키고(N4처럼 너무 쉽거나 N2처럼 너무 어렵지 않게), 매번 다른 문형/단어로 다양하게 출제.

반드시 아래 JSON 형식으로만 응답. 다른 텍스트나 마크다운 코드블록 없이 순수 JSON만:
{
  "question": "일본어 문제 문장",
  "choices": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "answerIndex": 0,
  "explanation": "한국어 설명"
}`;
}

app.post("/api/question", async (req, res) => {
  try {
    const { category } = req.body;
    const systemPrompt = buildSystemPrompt(category || "mixed");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: "N3 문제 1개 출제해줘." }] }],
          generationConfig: { temperature: 1.0 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
        console.error(data);
        const friendlyMsg = response.status === 429
          ? "잠깐 너무 빨리 풀었나봐요! 5초 정도 쉬었다가 다시 시도해주세요."
          : (data.error?.message || "API 오류");
        return res.status(500).json({ error: friendlyMsg });
      }
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    text = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse fail:", text);
      return res.status(500).json({ error: "문제 생성 실패, 다시 시도해주세요." });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했어요." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
