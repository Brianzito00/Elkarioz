const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os ficheiros estáticos da pasta 'public' (onde estão ficha.html e mestre.html)
app.use(express.static('public'));

// Gere as conexões do Socket.IO
io.on('connection', (socket) => {
    console.log('Um utilizador conectou-se:', socket.id);

    // Quando o servidor recebe uma alteração de um jogador ou do mestre
    socket.on('atualizarDados', (dados) => {
        // Envia os dados para todos os outros clientes conectados
        socket.broadcast.emit('dadosAtualizados', dados);
    });

    socket.on('disconnect', () => {
        console.log('Utilizador desconectou-se:', socket.id);
    });
});

const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => {
    console.log(`Servidor a correr em http://localhost:${PORTA}`);
});
