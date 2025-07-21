const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // npm i uuid
const cookieParser = require("cookie-parser"); // npm i cookie-parser

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());

app.get("/sortear", (req, res) => {
  let userId = req.cookies.userId;

  // Se não tem cookie, cria um novo userId e envia no cookie
  if (!userId) {
    userId = uuidv4();
    res.cookie("userId", userId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 dias
  }

  // Lê os dados
  const colorsData = JSON.parse(fs.readFileSync("colors.json", "utf-8"));
  let usersColors = { users: [] };
  try {
    usersColors = JSON.parse(fs.readFileSync("usersColors.json", "utf-8"));
  } catch {
    // arquivo pode não existir, inicia vazio
  }

  // Verifica se o usuário já tem uma cor sorteada
  const existingUser = usersColors.users.find(u => u.id === userId);
  if (existingUser) {
    return res.json({ color: existingUser.color });
  }

  // Pega as cores já usadas (pelos usuários)
  const usedColors = usersColors.users.map(u => u.color);

  // Filtra as cores disponíveis que ainda não foram usadas
  const availableColors = colorsData.availableColors.filter(c => !usedColors.includes(c));

  if (availableColors.length === 0) {
    return res.json({ error: "Todas as cores já foram sorteadas!" });
  }

  // Sorteia uma cor disponível
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const chosenColor = availableColors[randomIndex];

  // Adiciona o usuário e a cor sorteada
  usersColors.users.push({ id: userId, color: chosenColor });

  // Salva no arquivo usersColors.json
  fs.writeFileSync("usersColors.json", JSON.stringify(usersColors, null, 2));

  res.json({ color: chosenColor });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
