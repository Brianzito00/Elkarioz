const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os ficheiros estáticos da pasta 'public'
app.use(express.static('public'));

// Objeto para armazenar o estado das sessões ativas (opcional para persistência básica)
const sessoesAtivas = {};

// Função auxiliar para gerar um ID curto de 4 caracteres
function gerarUID() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
    console.log('Um utilizador conectou-se:', socket.id);

    // --- LÓGICA DO JOGADOR ---
    
    // Quando uma ficha é aberta, ela pede a criação de uma UID
    socket.on('criarFicha', () => {
        const uid = gerarUID();
        
        // O socket entra numa "sala" exclusiva com o nome da UID
        socket.join(uid);
        
        sessoesAtivas[uid] = {
            jogadorId: socket.id,
            dados: {}
        };

        console.log(`Ficha criada e sala aberta: ${uid}`);
        
        // Envia a UID de volta apenas para este jogador
        socket.emit('uidGerada', uid);
    });

    // --- LÓGICA DO MESTRE ---

    // Quando o mestre insere a UID no escudo
    socket.on('linkarEscudo', (uidSolicitada) => {
        const uid = uidSolicitada.toUpperCase();

        // Verifica se essa sala/sessão existe
        if (sessoesAtivas[uid]) {
            socket.join(uid);
            console.log(`Mestre (ID: ${socket.id}) conectou-se à ficha: ${uid}`);
            
            socket.emit('linkSucesso', uid);
            
            // Avisa o jogador que o mestre agora está a observar
            socket.to(uid).emit('mestreConectado');
        } else {
            socket.emit('erroLink', 'Código UID não encontrado.');
        }
    });

    // --- SINCRONIZAÇÃO DE DADOS ---

    // O evento agora espera um objeto: { uid: 'ABCD', dados: { ... } }
    socket.on('atualizarDados', (pacote) => {
        const { uid, dados } = pacote;

        if (uid && sessoesAtivas[uid]) {
            // Atualiza os dados na memória do servidor
            sessoesAtivas[uid].dados = dados;

            // Envia a atualização apenas para os membros daquela sala (UID)
            // O broadcast dentro da sala garante que quem enviou não receba de volta
            socket.to(uid).emit('dadosAtualizados', dados);
        }
    });

    socket.on('disconnect', () => {
        console.log('Utilizador desconectou-se:', socket.id);
    });
});

const PORTA = process.env.PORT || 3000;
server.listen(PORTA, () => {
    console.log(`Servidor a correr em http://localhost:${PORTA}`);
});
