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
        // Força a sala a ser sempre MAIÚSCULA
        const uidSala = payload.uid ? payload.uid.trim().toUpperCase() : null;
        const dadosJogador = payload.dados;

        if (uidSala && dadosJogador && dadosJogador.idUnico) {
            if (!estadoSalas[uidSala]) estadoSalas[uidSala] = {};
            estadoSalas[uidSala][dadosJogador.idUnico] = dadosJogador;
            
            payload.uid = uidSala; // Repassa corrigido
        }
        io.emit('atualizarDados', payload);
    });

    socket.on('solicitarEstadoSala', (uidSala) => {
        if(!uidSala) return;
        const uidUpper = uidSala.trim().toUpperCase();
        
        if (estadoSalas[uidUpper]) {
            socket.emit('estadoSalaCompleto', estadoSalas[uidUpper]);
        }
        // Grito do Mestre para forçar os jogadores a sincronizarem
        io.emit('mestre_solicitou_sync', uidUpper);
    });

    socket.on('player_dice_roll', (logData) => { 
        if(logData.uid) logData.uid = logData.uid.trim().toUpperCase();
        io.emit('player_dice_roll', logData); 
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}!`);
});
