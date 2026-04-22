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

    // Quando um jogador atualiza a ficha...
    socket.on('atualizarDados', (payload) => {
        const uidSala = payload.uid;
        const dadosJogador = payload.dados;

        // 1. Salva na memória do servidor
        if (uidSala && dadosJogador && dadosJogador.idUnico) {
            // Se a sala não existe no servidor ainda, cria ela
            if (!estadoSalas[uidSala]) {
                estadoSalas[uidSala] = {};
            }
            // Guarda/Atualiza os dados desse jogador específico na sala
            estadoSalas[uidSala][dadosJogador.idUnico] = dadosJogador;
        }

        // 2. Avisa todo mundo que está online
        io.emit('atualizarDados', payload);
    });

    // NOVO EVENTO: O Mestre pede o estado atual da sala quando atualiza a página (F5)
    socket.on('solicitarEstadoSala', (uidSala) => {
        if (estadoSalas[uidSala]) {
            // Se a sala tem jogadores salvos, envia o pacote completo de volta para quem pediu
            socket.emit('estadoSalaCompleto', estadoSalas[uidSala]);
        }
    });

    socket.on('player_dice_roll', (logData) => {
        io.emit('player_dice_roll', logData);
    });

    socket.on('gm_send_item', (payload) => {
        io.emit('gm_send_item', payload);
    });

    socket.on('gm_send_entity', (payload) => {
        io.emit('gm_send_entity', payload);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}!`);
});
