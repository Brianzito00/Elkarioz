const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Servir arquivos estáticos (coloque a ficha.html e mestre.html na mesma pasta do server.js)
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('Um usuário conectou:', socket.id);

    // Quando a ficha do jogador carregar, ela pede uma UID
    socket.on('criarFicha', () => {
        // Gera um código de 4 caracteres aleatórios para a sala/UID
        const uid = Math.random().toString(36).substring(2, 6).toUpperCase();
        socket.emit('uidGerada', uid);
    });

    // Recebe a atualização de status (HP, MP, Nome) do jogador e envia para o mestre
    socket.on('atualizarDados', (payload) => {
        // Repassa para todos (o Escudo do Mestre vai escutar isso)
        socket.broadcast.emit('dadosAtualizados', payload);
    });

    // Recebe a rolagem de dados do jogador e envia para o mestre
    socket.on('player_dice_roll', (logData) => {
        socket.broadcast.emit('player_dice_roll', logData);
    });

    // Mestre enviando um item para um jogador específico ou todos
    socket.on('gm_send_item', (payload) => {
        socket.broadcast.emit('gm_send_item', payload);
    });

    // Mestre enviando uma entidade (Guilda, NPC, Local)
    socket.on('gm_send_entity', (payload) => {
        socket.broadcast.emit('gm_send_entity', payload);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor de RPG rodando na porta ${PORT}`);
    console.log(`Acesse a Ficha: http://localhost:${PORT}/ficha.html`);
    console.log(`Acesse o Mestre: http://localhost:${PORT}/mestre.html`);
});
