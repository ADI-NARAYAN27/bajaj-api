import express from "express";
import cors from "cors";
import serverless from "serverless-http";


const FULL_NAME = (process.env.FULL_NAME || "Aditya Narayan").toLowerCase();
const DOB_DDMMYYYY = process.env.DOB_DDMMYYYY || "27052003";
const EMAIL = process.env.EMAIL || "anarayan684.com";
const ROLL_NUMBER = process.env.ROLL_NUMBER || "22BCT0253";


const app = express();
app.use(cors());
app.use(express.json());

const isNumericString = (s) => /^[0-9]+$/.test(s);
const isAlphaOnly = (s) => /^[A-Za-z]+$/.test(s);

function buildAlternatingCapsConcat(allLettersInOrder) {
  const reversed = allLettersInOrder.slice().reverse();
  return reversed.map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join("");
}

app.post("/bfhl", (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body.data)) {
      return res.status(400).json({
        is_success: false,
        user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
        email: EMAIL,
        roll_number: ROLL_NUMBER,
        message: "Invalid input. Expecting JSON body: { data: [...] }"
      });
    }

    const rawData = req.body.data;
    const odd_numbers = [];
    const even_numbers = [];
    const alphabets = [];
    const special_characters = [];
    const lettersForConcat = [];
    let sumBig = 0n;

    for (const item of rawData) {
      const s = String(item);
      for (const ch of s) if (/[A-Za-z]/.test(ch)) lettersForConcat.push(ch);

      if (isNumericString(s)) {
        const n = BigInt(s);
        sumBig += n;
        (n % 2n === 0n ? even_numbers : odd_numbers).push(s);
      } else if (isAlphaOnly(s)) {
        alphabets.push(s.toUpperCase());
      } else {
        special_characters.push(s);
      }
    }

    return res.status(200).json({
      is_success: true,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      odd_numbers,
      even_numbers,
      alphabets,
      special_characters,
      sum: sumBig.toString(),
      concat_string: buildAlternatingCapsConcat(lettersForConcat)
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      user_id: `${FULL_NAME}_${DOB_DDMMYYYY}`,
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      message: "Internal server error",
      error: err?.message || String(err)
    });
  }
});


app.get("/", (_req, res) => {
  res.status(200).send("BFHL API is running. POST /bfhl");
});


export default serverless(app);


const PORT = process.env.PORT || 3000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`Local server on http://localhost:${PORT}`));
}

