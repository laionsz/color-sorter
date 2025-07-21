const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://color-sorter-two.vercel.app",
  credentials: true,
}));
app.use(cookieParser());

app.get("/sortear", (req, res) => {
  let userId = req.cookies.userId;

  if (!userId) {
    userId = uuidv4();
    res.cookie("userId", userId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true,       // obrigatório em HTTPS
      sameSite: "none"    // para permitir cross-site cookie
    });
  }

  // Lê o arquivo colors.json para pegar todas as cores possíveis
  const colorsData = JSON.parse(fs.readFileSync("colors.json", "utf-8"));

  // Lê o arquivo usersColors.json para saber quem já pegou qual cor
  let usersColors = { users: [] };
  try {
    usersColors = JSON.parse(fs.readFileSync("usersColors.json", "utf-8"));
  } catch (err) {
    usersColors = { users: [] };
  }

  // Verifica se o usuário já tem uma cor sorteada
  const existingUser = usersColors.users.find(u => u.id === userId);
  if (existingUser) {
    return res.json({ color: existingUser.color });
  }

  // Filtra as cores já usadas para não repetir
  const usedColors = usersColors.users.map(u => u.color);
  const availableColors = colorsData.availableColors.filter(c => !usedColors.includes(c));

  if (availableColors.length === 0) {
    return res.json({ error: "Todas as cores já foram sorteadas!" });
  }

  // Sorteia uma cor disponível aleatória
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const chosenColor = availableColors[randomIndex];

  // Adiciona o usuário e sua cor sorteada na lista
  usersColors.users.push({ id: userId, color: chosenColor });

  // Salva a lista atualizada de usuários com cores no arquivo
  fs.writeFileSync("usersColors.json", JSON.stringify(usersColors, null, 2), "utf-8");

  // Retorna a cor sorteada para o usuário
  res.json({ color: chosenColor });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
