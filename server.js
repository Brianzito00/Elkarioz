const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Define a pasta 'public' e a raiz como locais para encontrar os arquivos HTML
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// ==========================================
// BANCO DE DADOS (JSON LOCAL)
// ==========================================
const dbPath = path.join(__dirname, 'banco_de_dados.json');

// Se o arquivo do banco de dados não existir, o servidor cria um automaticamente
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ fichas: {} }));
    console.log('📁 Novo banco de dados criado!');
}

// ==========================================
// MEMÓRIA VOLÁTIL (Para o Escudo do Mestre e Overlay ao vivo)
// ==========================================
let salas = {};

io.on('connection', (socket) => {
    console.log('🟢 Novo dispositivo conectado:', socket.id);

    // ==========================================
    // 1. ROTAS AO VIVO (SALA, MESTRE E JOGADORES)
    // ==========================================

    // Mestre ou Overlay pedem a lista de quem está conectado agora
    socket.on('solicitarEstadoSala', (uidSala) => {
        if (!uidSala) return;
        let salaUpper = uidSala.trim().toUpperCase();
        if (!salas[salaUpper]) salas[salaUpper] = {};
        
        // Devolve pro Mestre/Overlay a lista de jogadores atuais
        socket.emit('estadoSalaCompleto', salas[salaUpper]);
    });

    // Quando o jogador toma dano, gasta mana ou muda de nome
    socket.on('atualizarDados', (data) => {
        if (!data || !data.uid || !data.dados || !data.dados.idUnico) return;
        
        let salaUpper = data.uid.trim().toUpperCase();
        if (!salas[salaUpper]) salas[salaUpper] = {};
        
        // Atualiza a "foto do momento" da sala
        salas[salaUpper][data.dados.idUnico] = data.dados;

        // Grita no alto-falante para todos na sala atualizarem suas telas
        io.emit('atualizarDados', data);
    });

    // Mestre clica no (X) para desconectar um jogador
    socket.on('kick_player', (data) => {
        if (!data || !data.uidSala || !data.idUnico) return;
        let salaUpper = data.uidSala.trim().toUpperCase();
        
        // Remove do log ao vivo
        if (salas[salaUpper] && salas[salaUpper][data.idUnico]) {
            delete salas[salaUpper][data.idUnico];
        }

        // Avisa a aba daquele jogador específico para se desconectar
        io.emit('player_kicked', data);
    });

    // Mestre compartilha um item/arma
    socket.on('gm_send_item', (payload) => {
        io.emit('gm_send_item', payload);
    });

    // Mestre compartilha Lore, Guilda, Pessoas ou Locais
    socket.on('gm_send_entity', (payload) => {
        io.emit('gm_send_entity', payload);
    });

    // Alguém rola um dado
    socket.on('player_dice_roll', (roll) => {
        io.emit('player_dice_roll', roll);
    });


    // ==========================================
    // 2. ROTAS DO BANCO DE DADOS (NOVO)
    // ==========================================
    
    // Jogador altera a ficha e pede para salvar no HD do Servidor
    socket.on('salvar_ficha_db', (dadosDaFicha) => {
        if (!dadosDaFicha || !dadosDaFicha.idUnico) return;

        try {
            // Abre o banco, coloca a ficha nova, fecha o banco
            let banco = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            banco.fichas[dadosDaFicha.idUnico] = dadosDaFicha;
            
            // O null, 4 serve para deixar o JSON formatado bonitinho caso você abra no Bloco de Notas
            fs.writeFileSync(dbPath, JSON.stringify(banco, null, 4)); 
            
            console.log(`💾 Ficha atualizada no Banco: ${dadosDaFicha.charName || 'Desconhecido'}`);
        } catch (e) {
            console.error("Erro ao salvar no banco de dados:", e);
        }
    });

    // Jogador abre a aba do navegador e o código pede a ficha de volta
    socket.on('pedir_ficha_db', (idUnico, callback) => {
        if (!idUnico) {
            callback(null);
            return;
        }

        try {
            let banco = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            if (banco.fichas && banco.fichas[idUnico]) {
                // Devolve a ficha inteirinha pro HTML
                callback(banco.fichas[idUnico]);
            } else {
                // Se a ficha não existir ainda, devolve vazio
                callback(null);
            }
        } catch (e) {
            console.error("Erro ao ler do banco de dados:", e);
            callback(null);
        }
    });

    // Quando fecham a aba
    socket.on('disconnect', () => {
        console.log('🔴 Dispositivo desconectado:', socket.id);
    });
});

// Inicialização
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🚀 SERVIDOR RPG TOTAL ONLINE 🚀`);
    console.log(`📡 Porta: ${PORT}`);
    console.log(`💻 Fichas salvas em: banco_de_dados.json`);
    console.log(`===========================================`);
});
