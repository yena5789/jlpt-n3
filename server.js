import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // 👈 문제은행 파일을 읽기 위해 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🚀 [핵심] 132개 문제은행(questions.json) 로드하는 함수
function getQuestions() {
  try {
    const filePath = path.join(__dirname, "questions.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("questions.json 파일을 읽는 중 에러 발생:", error);
    return [];
  }
}

// 🎯 사용자가 요청한 카테고리에 맞춰 1개의 문제를 무작위로 반환하는 API
app.post("/api/question", async (req, res) => {
  try {
    const { category } = req.body; // 프론트엔드에서 보낸 카테고리 (vocab, grammar, mixed 등)
    const allQuestions = getQuestions();

    if (allQuestions.length === 0) {
      return res.status(500).json({ error: "문제은행 데이터가 비어있거나 읽을 수 없습니다." });
    }

    // 1. 카테고리에 맞는 문제들만 필터링하기
    let filtered = allQuestions;
    if (category === "vocab" || category === "grammar") {
      filtered = allQuestions.filter((q) => q.category === category);
    }

    // 만약 필터링된 문제가 없다면 전체에서 뽑기 (안전장치)
    if (filtered.length === 0) {
      filtered = allQuestions;
    }

    // 2. 필터링된 문제 중 1개를 무작위로 추첨하기
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const selectedQuiz = filtered[randomIndex];

    // 3. 폰(프론트엔드)으로 0.1초 만에 전송!
    res.json(selectedQuiz);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했어요." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버 실행 중: 포트 ${PORT}`);
});
