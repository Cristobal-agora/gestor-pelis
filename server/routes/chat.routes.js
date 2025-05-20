// routes/chat.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const { pregunta } = req.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        max_tokens: 400, 
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en cine. Responde de forma clara, útil y breve. Máximo 4-5 frases por respuesta.",
          },
          {
            role: "user",
            content: pregunta,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cinestash.com", // o http://localhost si estás en local
        },
      }
    );

    res.json({ respuesta: response.data.choices[0].message.content });
  } catch (err) {
    console.error("❌ Error al contactar con OpenRouter:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }

    res.status(500).json({ mensaje: "Error al contactar con la IA." });
  }
});

module.exports = router;
