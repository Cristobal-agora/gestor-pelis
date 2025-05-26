const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const { pregunta } = req.body;

  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("🔑 OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content: `
Eres una IA de CineStash. Cuando menciones una película o serie concreta, pon un enlace a /buscar/TITULO.

Ejemplos:
- [Inception](/buscar/Inception)
- [Breaking Bad](/buscar/Breaking%20Bad)

Responde de forma clara y breve, como si hablaras con un fan del cine. Máximo 4-5 frases.
`,
          },
          {
            role: "user",
            content: pregunta,
          },
        ],
      },
      { headers }
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
