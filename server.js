const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// AJUSTE AQUI: Agora ele lê de dentro da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('criarFicha', () => {
        const uid = Math.random().toString(36).substring(2, 6).toUpperCase();
        socket.emit('uidGerada', uid);
    });

    socket.on('atualizarDados', (payload) => {
        socket.broadcast.emit('dadosAtualizados', payload);
    });

    socket.on('player_dice_roll', (logData) => {
        socket.broadcast.emit('player_dice_roll', logData);
    });

    socket.on('gm_send_item', (payload) => {
        socket.broadcast.emit('gm_send_item', payload);
    });

    socket.on('gm_send_entity', (payload) => {
        socket.broadcast.emit('gm_send_entity', payload);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando!`);
    console.log(`Ficha: http://localhost:${PORT}/ficha.html`);
    console.log(`Mestre: http://localhost:${PORT}/mestre.html`);
});
