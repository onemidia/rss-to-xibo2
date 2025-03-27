const express = require("express");
const generateXiboFeed = require('./src/generateXiboFeed'); // Sem extensão .js

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/generate-feed", async (req, res) => {
    try {
        // Passando a URL do RSS como parâmetro
        const rssUrl = 'https://www.tribunaonline.net/feed/'; // Substitua pela URL do seu feed RSS
        const xmlFeed = await generateXiboFeed(rssUrl); // Esperar pela resposta da função assíncrona

        res.set("Content-Type", "application/xml"); // Definir tipo de conteúdo para XML
        res.send(xmlFeed); // Enviar o XML gerado como resposta
    } catch (error) {
        console.error("Erro ao gerar o XML:", error);
        res.status(500).send("Erro interno no servidor");
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
