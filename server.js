const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// O "Caderninho" do Servidor: Guarda o estado atual de cada sala
const estadoSalas = {};

io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('criarFicha', () => {
        const uid = Math.random().toString(36).substring(2, 6).toUpperCase();
        socket.emit('uidGerada', uid);
    });

    socket.on('atualizarDados', (payload) => {
        const uidSala = payload.uid;
        const dadosJogador = payload.dados;

        if (uidSala && dadosJogador && dadosJogador.idUnico) {
            if (!estadoSalas[uidSala]) estadoSalas[uidSala] = {};
            estadoSalas[uidSala][dadosJogador.idUnico] = dadosJogador;
        }
        io.emit('atualizarDados', payload);
    });

    socket.on('solicitarEstadoSala', (uidSala) => {
        if (estadoSalas[uidSala]) {
            socket.emit('estadoSalaCompleto', estadoSalas[uidSala]);
        }
        // === A MÁGICA ACONTECE AQUI ===
        // Dispara um aviso para os navegadores dos jogadores enviarem a ficha sozinhos
        io.emit('mestre_solicitou_sync', uidSala);
    });

    socket.on('player_dice_roll', (logData) => { io.emit('player_dice_roll', logData); });
    socket.on('gm_send_item', (payload) => { io.emit('gm_send_item', payload); });
    socket.on('gm_send_entity', (payload) => { io.emit('gm_send_entity', payload); });

    socket.on('disconnect', () => { console.log('Usuário desconectou:', socket.id); });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}!`);
});
