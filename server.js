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
// Estado temporário dos retratos em destaque no overlay, separado por mesa.
// O último retrato ativo reaparece se a fonte do Streamlabs/OBS for recarregada.
const retratosEmDestaque = new Map();
const normalizarMesaRetrato = valor => {
    const mesa = String(valor || '').trim().toUpperCase();
    return /^[A-Z0-9_-]{1,64}$/.test(mesa) ? mesa : '';
};
const salaOverlayRetrato = mesa => 'overlay-retrato:' + mesa;
const validarUrlRetrato = valor => {
    const url = String(valor || '').trim();
    if (!url || url.length > 250000) return '';
    if (/^https?:\/\//i.test(url) || /^\/[^/]/.test(url)) return url;
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(url)) return url;
    return '';
};


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


    // Overlay de retratos: o visualizador assina apenas a sua própria mesa.
    socket.on('portrait_overlay_join', (payload = {}, ack) => {
        const mesa = normalizarMesaRetrato(payload.sala);
        if (!mesa) {
            if (typeof ack === 'function') ack({ ok: false, error: 'Sala inválida.' });
            return;
        }
        // Evita continuar recebendo imagens da mesa anterior ao trocar de sessão.
        if (socket.data.salaRetratoOverlay && socket.data.salaRetratoOverlay !== mesa) {
            socket.leave(salaOverlayRetrato(socket.data.salaRetratoOverlay));
        }
        socket.data.salaRetratoOverlay = mesa;
        socket.join(salaOverlayRetrato(mesa));
        socket.emit('portrait_overlay_state', retratosEmDestaque.get(mesa) || { sala: mesa, visible: false });
        if (typeof ack === 'function') ack({ ok: true });
    });

    // O jogador toca no próprio retrato: mostrar/ocultar no Streamlabs/OBS.
    socket.on('portrait_overlay_toggle', (payload = {}, ack) => {
        const mesa = normalizarMesaRetrato(payload.sala);
        const id = String(payload.playerId || '').trim().slice(0, 40);
        const url = validarUrlRetrato(payload.url);
        if (!mesa || !id || !url) {
            if (typeof ack === 'function') ack({ ok: false, error: 'Configure a mesa e uma foto válida.' });
            return;
        }
        const antigo = retratosEmDestaque.get(mesa);
        const visible = !(antigo && antigo.visible && antigo.playerId === id);
        const proximo = visible
            ? {
                sala: mesa,
                visible: true,
                playerId: id,
                nome: String(payload.nome || 'Aventureiro').trim().slice(0, 90),
                raca: String(payload.raca || '').trim().slice(0, 65),
                url,
                updatedAt: Date.now()
            }
            : { sala: mesa, visible: false, updatedAt: Date.now() };
        retratosEmDestaque.set(mesa, proximo);
        io.to(salaOverlayRetrato(mesa)).emit('portrait_overlay_state', proximo);
        if (typeof ack === 'function') ack({ ok: true, visible });
    });

    // O mestre pode encerrar a exibição sem mexer na ficha do jogador.
    socket.on('portrait_overlay_clear', (payload = {}, ack) => {
        const mesa = normalizarMesaRetrato(payload.sala);
        if (!mesa) {
            if (typeof ack === 'function') ack({ ok: false, error: 'Sala inválida.' });
            return;
        }
        const vazio = { sala: mesa, visible: false, updatedAt: Date.now() };
        retratosEmDestaque.set(mesa, vazio);
        io.to(salaOverlayRetrato(mesa)).emit('portrait_overlay_state', vazio);
        if (typeof ack === 'function') ack({ ok: true });
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
