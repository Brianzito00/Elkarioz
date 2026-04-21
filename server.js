const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os ficheiros estáticos da pasta 'public'
app.use(express.static('public'));

// Função para gerar um UID curto (4 caracteres alfanuméricos)
function gerarUID() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Guarda as sessões ativas na memória do servidor
const sessoesAtivas = {};

// Gere as conexões do Socket.IO
io.on('connection', (socket) => {
    console.log('Um utilizador conectou-se:', socket.id);

    // 1. JOGADOR: Pede para criar a ficha e gerar o UID
    socket.on('criarFicha', () => {
        const uid = gerarUID();
        socket.join(uid); // Coloca o jogador nesta sala exclusiva
        
        sessoesAtivas[uid] = {
            jogador: socket.id,
            mestre: null,
            dados: {} // Podemos guardar o estado da ficha aqui futuramente
        };

        console.log(`Ficha criada com UID: ${uid}`);
        socket.emit('uidGerada', uid); // Devolve o código para a interface do jogador
    });

    // 2. MESTRE: Tenta ligar-se a uma ficha usando o UID
    socket.on('linkarEscudo', (uid) => {
        // Verifica se o UID existe, pondo tudo em maiúsculas para evitar erros de digitação
        const uidFormatado = uid.toUpperCase();

        if (sessoesAtivas[uidFormatado]) {
            socket.join(uidFormatado); // Coloca o Mestre na sala da ficha
            sessoesAtivas[uidFormatado].mestre = socket.id;
            
            console.log(`Mestre ligou-se à ficha ${uidFormatado}`);
            
            // Avisa o mestre que conectou com sucesso
            socket.emit('linkSucesso', uidFormatado);
            // Avisa o jogador que o mestre agora está a ver a ficha dele
            socket.to(uidFormatado).emit('mestreConectado'); 
        } else {
            // Se o código estiver errado
            socket.emit('erroLink', 'Código UID não encontrado ou inválido.');
        }
    });

    // 3. ATUALIZAR DADOS: Agora precisa saber de qual UID estamos a falar
    // O cliente agora tem de enviar um objeto do tipo: { uid: "A7B9", dados: {...} }
    socket.on('atualizarDados', (pacote) => {
        const { uid, dados } = pacote;
        
        if (sessoesAtivas[uid]) {
            // Guarda os dados na memória do servidor (opcional, mas útil se alguém der F5)
            sessoesAtivas[uid].dados = dados;
            
            // Envia para a sala (se for o jogador a enviar, o mestre recebe; e vice-versa)
            socket.to(uid).emit('dadosAtualizados', dados);
        }
    });

    socket.on('disconnect', () => {
        console.log('Utilizador desconectou-se:', socket.id);
        // Opcional: Adicionar código para limpar 'sessoesAtivas' se a sala ficar vazia
    });
});

const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => {
    console.log(`Servidor a correr em http://localhost:${PORTA}`);
});
