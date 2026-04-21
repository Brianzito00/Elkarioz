const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Diz ao Node para servir os arquivos HTML, CSS e JS que estão na pasta 'public'
app.use(express.static('public'));

// Quando alguém acessa o site (Mestre ou Jogador)
io.on('connection', (socket) => {
    console.log('Um usuário conectou. ID:', socket.id);

    // 1. Escuta rolagens de dados
    socket.on('rolar_dado', (dadosDaRolagem) => {
        // Envia a rolagem para TODOS na mesa (incluindo o Mestre)
        io.emit('nova_rolagem', dadosDaRolagem);
    });

    // 2. Escuta envio de itens (Do Mestre para o Jogador)
    socket.on('enviar_item', (dadosDoItem) => {
        // Envia para todos, o frontend do jogador verifica se é para ele
        io.emit('receber_item', dadosDoItem); 
    });

    // 3. Atualização de status da mesa (Vida, Mana, etc)
    socket.on('atualizar_mesa', (dadosDoJogador) => {
        // O jogador manda os dados, o servidor repassa pro Mestre
        socket.broadcast.emit('sincronizar_mesa_mestre', dadosDoJogador);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectou:', socket.id);
    });
});

// A porta que o Render vai usar (process.env.PORT) ou a 3000 para testes no seu PC
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando! Acesse: http://localhost:${PORT}`);
});