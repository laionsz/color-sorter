const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/sortear", (req, res) => {
  const data = JSON.parse(fs.readFileSync("colors.json", "utf-8"));
  const colors = data.availableColors;

  if (colors.length === 0) {
    return res.json({ error: "Todas as cores já foram sorteadas!" });
  }

  const randomIndex = Math.floor(Math.random() * colors.length);
  const chosenColor = colors[randomIndex];

  // Remove a cor sorteada
  colors.splice(randomIndex, 1);

  // Atualiza o arquivo JSON
  fs.writeFileSync("colors.json", JSON.stringify({ availableColors: colors }, null, 2));

  res.json({ color: chosenColor });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});