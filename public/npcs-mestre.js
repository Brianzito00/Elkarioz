/* Elkarioz · NPCs do Mestre
 * Reutiliza dbPessoas (rpgPessoas), a transmissão de lore e o overlay de retratos.
 * Notas privadas nunca devem ser enviadas aos personagens. */
(function () {
  'use strict';
  const get = id => document.getElementById(id);
  const nomes = { campoNome: 'npc-edit-nome', campoFuncao: 'npc-edit-funcao', campoImg: 'npc-edit-imagem', campoDesc: 'npc-edit-desc', campoNotas: 'npc-edit-notas' };
  let npcEditandoId = null;
  let npcImagemAtual = '';
  let npcCarregandoFoto = false;
  let statusTimer = 0;

  const escapeHtmlNPC = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));

  function validarImagemNPC(value) {
    const url = String(value || '').trim();
    if (!url || url.length > 235000) return '';
    return /^(https?:\/\/|\/[^/]|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(url) ? url : '';
  }

  function fotoDoFormulario() {
    return validarImagemNPC(get(nomes.campoImg).value) || validarImagemNPC(npcImagemAtual);
  }

  function previewNPC() {
    const preview = get('npc-editor-preview');
    const fallback = get('npc-editor-fallback');
    const url = fotoDoFormulario();
    if (url) {
      preview.src = url;
      preview.hidden = false;
      fallback.hidden = true;
      preview.onerror = () => { preview.hidden = true; fallback.hidden = false; };
    } else {
      preview.removeAttribute('src');
      preview.hidden = true;
      fallback.hidden = false;
    }
  }

  function avisarNPC(msg, erro = false) {
    const el = get('npc-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('error', erro);
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { el.textContent = ''; el.classList.remove('error'); }, 5000);
  }

  function renderizarNpcsGM() {
    const grid = get('npc-grid');
    if (!grid || typeof dbPessoas === 'undefined') return;
    const busca = String(get('npc-search')?.value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const todos = Array.isArray(dbPessoas) ? dbPessoas.filter(x => x && x.id != null) : [];
    const filtrados = todos.filter(x => {
      const texto = [x.nome,x.funcao,x.desc].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return !busca || texto.includes(busca);
    }).sort((a,b) => String(a.nome||'').localeCompare(String(b.nome||''),'pt-BR'));
    const count = get('npc-count');
    if (count) count.textContent = filtrados.length + ' de ' + todos.length + ' NPCs';
    if (!filtrados.length) {
      grid.innerHTML = '<div class="npc-empty"><strong>' + (todos.length ? 'Nenhum resultado' : 'Seu primeiro personagem está esperando') +
        '</strong>' + (todos.length ? 'Tente outro nome ou função.' : 'Crie um NPC com foto, personalidade e informações para enviar aos jogadores.') + '</div>';
      return;
    }
    grid.innerHTML = filtrados.map(npc => {
      const img = validarImagemNPC(npc.img);
      const id = escapeHtmlNPC(npc.id);
      const nome = escapeHtmlNPC(npc.nome || 'NPC sem nome');
      const desc = String(npc.desc || '').trim();
      const nota = String(npc.notasMestre || '').trim();
      const avatar = img ? '<img src="' + escapeHtmlNPC(img) + '" alt="Foto de ' + nome + '" loading="lazy">' : '👤';
      return '<article class="npc-card" data-npc-id="' + id + '">' +
        '<div class="npc-identity"><div class="npc-photo">' + avatar + '</div>' +
        '<div class="npc-identity-text"><span class="npc-kind">PERSONAGEM NÃO JOGÁVEL</span>' +
        '<h3 class="npc-name">' + nome + '</h3><div class="npc-job">' + escapeHtmlNPC(npc.funcao || 'Habitante de Elkarioz') + '</div></div></div>' +
        '<p class="npc-summary">' + escapeHtmlNPC(desc ? desc.slice(0,290) : 'Nenhuma descrição pública cadastrada.') + (desc.length > 290 ? '…' : '') + '</p>' +
        (nota ? '<div class="npc-private"><strong>🔒 NOTAS PRIVADAS DO MESTRE</strong>' + escapeHtmlNPC(nota.slice(0,180)) + (nota.length > 180 ? '…' : '') + '</div>' : '') +
        '<div class="npc-actions">' +
        '<button type="button" class="npc-action send" data-npc-action="send" data-npc-id="' + id + '" title="Adicionar o NPC ao diário dos jogadores">📤 ENVIAR</button>' +
        '<button type="button" class="npc-action show" data-npc-action="overlay" data-npc-id="' + id + '"' +
           (!img ? ' disabled title="Adicione uma foto para exibir no overlay"' : ' title="Exibir ou ocultar este NPC no mesmo overlay dos jogadores"') + '>🎭 NO OVERLAY</button>' +
        '<button type="button" class="npc-action" data-npc-action="edit" data-npc-id="' + id + '">✎ EDITAR</button>' +
        '<button type="button" class="npc-action delete" data-npc-action="delete" data-npc-id="' + id + '">✕ EXCLUIR</button>' +
        '</div></article>';
    }).join('');
  }

  function fecharEditorNPC() {
    get('modal-npc-editor').style.display = 'none';
    get('npc-form').reset();
    npcEditandoId = null;
    npcImagemAtual = '';
    npcCarregandoFoto = false;
  }

  function abrirEditorNPC(id = null) {
    const registro = id == null ? null : dbPessoas.find(item => String(item.id) === String(id));
    if (id != null && !registro) return;
    npcEditandoId = registro ? registro.id : null;
    npcImagemAtual = validarImagemNPC(registro?.img || '');
    get('npc-editor-title').textContent = registro ? 'EDITAR NPC' : 'CRIAR NPC';
    get(nomes.campoNome).value = registro?.nome || '';
    get(nomes.campoFuncao).value = registro?.funcao || '';
    get(nomes.campoImg).value = npcImagemAtual.startsWith('data:') ? '' : npcImagemAtual;
    get(nomes.campoDesc).value = registro?.desc || '';
    get(nomes.campoNotas).value = registro?.notasMestre || '';
    get('npc-editor-file').value = '';
    get('npc-file-status').textContent = npcImagemAtual.startsWith('data:') ? 'Foto enviada anteriormente (salva no navegador).' : '';
    previewNPC();
    get('modal-npc-editor').style.display = 'flex';
    get(nomes.campoNome).focus();
  }

  function persistirNPCs() {
    localStorage.setItem('rpgPessoas', JSON.stringify(dbPessoas));
  }

  function salvarNPC(event) {
    event.preventDefault();
    if (npcCarregandoFoto) return alert('A foto ainda está sendo processada.');
    const nome = String(get(nomes.campoNome).value || '').trim();
    if (!nome) { get(nomes.campoNome).focus(); return; }
    const inputUrl = String(get(nomes.campoImg).value || '').trim();
    if (inputUrl && !validarImagemNPC(inputUrl)) {
      alert('A foto precisa ser um link HTTPS/HTTP válido ou um arquivo de imagem enviado.');
      get(nomes.campoImg).focus();
      return;
    }
    const imagem = fotoDoFormulario();
    const registro = npcEditandoId != null ? dbPessoas.find(item => String(item.id) === String(npcEditandoId)) : null;
    const data = {
      nome: nome.slice(0,110),
      funcao: String(get(nomes.campoFuncao).value || '').trim().slice(0,110),
      img: imagem,
      desc: String(get(nomes.campoDesc).value || '').trim().slice(0,6500),
      notasMestre: String(get(nomes.campoNotas).value || '').trim().slice(0,10000)
    };
    if (registro) {
      Object.assign(registro, data);
      if (typeof sincronizarPessoaNosLocais === 'function') {
        sincronizarPessoaNosLocais(registro);
        localStorage.setItem('rpgLocais', JSON.stringify(dbLocais));
      }
    } else {
      const used = new Set(dbPessoas.map(x => String(x.id)));
      let id = Date.now();
      while (used.has(String(id))) id += 1;
      dbPessoas.push({ id, ...data });
    }
    try { persistirNPCs(); }
    catch (err) { alert('Não foi possível salvar o NPC. Armazenamento cheio; tente uma imagem menor ou use URL.'); return; }
    fecharEditorNPC();
    renderizarNpcsGM();
    avisarNPC('✓ ' + nome + ' salvo no catálogo de NPCs.');
  }

  function deletarNPC(id) {
    const npc = dbPessoas.find(item => String(item.id) === String(id));
    if (!npc || !window.confirm('Excluir permanentemente ' + npc.nome + ' do seu catálogo de NPCs?')) return;
    const original = dbPessoas;
    dbPessoas = dbPessoas.filter(item => String(item.id) !== String(id));
    try { persistirNPCs(); }
    catch (e) { dbPessoas = original; alert('Não foi possível excluir o NPC.'); return; }
    if (Array.isArray(dbLocais)) {
      dbLocais.forEach(l => {
        if (Array.isArray(l.pontos)) l.pontos = l.pontos.filter(p => String(p.id) !== String(id));
      });
      localStorage.setItem('rpgLocais', JSON.stringify(dbLocais));
    }
    renderizarNpcsGM();
    avisarNPC('NPC excluído do catálogo local.');
  }

  function enviarNPC(id) {
    const npc = dbPessoas.find(item => String(item.id) === String(id));
    if (!npc) return;
    if (typeof abrirModalEnvio !== 'function') return avisarNPC('Envio indisponível nesta versão do mestre.', true);
    abrirModalEnvio(null, 'pessoa', npc.id);
  }

  function retratoNPC(id) {
    const npc = dbPessoas.find(item => String(item.id) === String(id));
    if (!npc) return;
    const url = validarImagemNPC(npc.img);
    if (!url) return avisarNPC('Adicione uma foto válida ao NPC antes de exibir.', true);
    const sala = String(gmUid || '').trim().toUpperCase();
    if (!sala || !socket?.connected) return avisarNPC('Conecte o Escudo do Mestre à sua sala primeiro.', true);
    avisarNPC('🎭 Enviando retrato de ' + npc.nome + ' ao overlay…');
    socket.timeout(6500).emit('portrait_overlay_toggle', {
      sala, playerId: 'npc-' + String(npc.id), nome: npc.nome,
      raca: npc.funcao ? 'NPC · ' + npc.funcao : 'PERSONAGEM NÃO JOGÁVEL',
      kind: 'npc',
      url
    }, (err, result) => {
      if (err || !result?.ok) return avisarNPC('Não foi possível atualizar o overlay. Confira o servidor e o link da sala.', true);
      avisarNPC(result.visible ? '✓ ' + npc.nome + ' está no overlay!' : '✓ Retrato do NPC ocultado.');
    });
  }

  function processarFotoNPC(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type) || file.size > 9 * 1024 * 1024) {
      alert('Selecione uma imagem PNG, JPG, WEBP ou GIF de até 9 MB.'); return;
    }
    npcCarregandoFoto = true;
    get('npc-file-status').textContent = 'Preparando a imagem para a transmissão…';
    const fileUrl = URL.createObjectURL(file);
    const foto = new Image();
    foto.onload = () => {
      URL.revokeObjectURL(fileUrl);
      try {
        let result = '';
        for (const [size,quality] of [[700,.78],[620,.65],[530,.55],[430,.46],[340,.4]]) {
          const factor = Math.min(1, size / Math.max(foto.naturalWidth,foto.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1,Math.round(foto.naturalWidth * factor));
          canvas.height = Math.max(1,Math.round(foto.naturalHeight * factor));
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas indisponível');
          ctx.fillStyle = '#f5ecdc';ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(foto,0,0,canvas.width,canvas.height);
          const jpeg = canvas.toDataURL('image/jpeg', quality);
          if (jpeg.length < 215000) { result = jpeg; break; }
        }
        if (!result) throw new Error('Arquivo muito grande para o overlay');
        npcImagemAtual = result;
        get(nomes.campoImg).value = '';
        get('npc-file-status').textContent = '✓ Foto preparada e pronta para salvar.';
        previewNPC();
      } catch (err) {
        get('npc-file-status').textContent = 'Não foi possível preparar essa imagem. Tente outra ou use um link.';
      } finally { npcCarregandoFoto = false; }
    };
    foto.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      npcCarregandoFoto = false;
      get('npc-file-status').textContent = 'Não foi possível abrir o arquivo de imagem.';
    };
    foto.src = fileUrl;
  }

  function iniciarNPCs() {
    get('npc-add-button')?.addEventListener('click', () => abrirEditorNPC());
    get('npc-form')?.addEventListener('submit', salvarNPC);
    get('npc-modal-close')?.addEventListener('click', fecharEditorNPC);
    get('npc-modal-cancel')?.addEventListener('click', fecharEditorNPC);
    get('npc-remove-photo')?.addEventListener('click', () => {
      npcImagemAtual = '';
      get(nomes.campoImg).value = '';
      get('npc-file-status').textContent = 'Foto removida. Salve para confirmar.';
      previewNPC();
    });
    get('npc-search')?.addEventListener('input', renderizarNpcsGM);
    get(nomes.campoImg)?.addEventListener('input', () => {
      if (get(nomes.campoImg).value.trim()) npcImagemAtual = '';
      previewNPC();
    });
    get('npc-editor-file')?.addEventListener('change', event => {
      processarFotoNPC(event.currentTarget.files?.[0]);
      event.currentTarget.value = '';
    });
    get('npc-grid')?.addEventListener('click', event => {
      const button = event.target.closest('button[data-npc-action]');
      if (!button) return;
      const id = button.dataset.npcId;
      if (button.dataset.npcAction === 'send') enviarNPC(id);
      if (button.dataset.npcAction === 'overlay') retratoNPC(id);
      if (button.dataset.npcAction === 'edit') abrirEditorNPC(id);
      if (button.dataset.npcAction === 'delete') deletarNPC(id);
    });
    get('modal-npc-editor')?.addEventListener('click', event => {
      if (event.target === event.currentTarget) fecharEditorNPC();
    });
    renderizarNpcsGM();
  }

  window.renderizarNpcsGM = renderizarNpcsGM;
  window.abrirEditorNPC = abrirEditorNPC;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarNPCs, {once:true});
  else iniciarNPCs();
})();
