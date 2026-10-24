/* Elkarioz · Gerenciador de Locais para o Escudo do Mestre.
 * Preserva registros antigos (rpgLocais) e envia paisagens ao mesmo overlay de retratos.
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const safe = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imagemValida = v => {
    const src = String(v || '').trim();
    return src.length < 225000 && /^(https?:\/\/|\/[^/]|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(src) ? src : '';
  };
  let editandoId = null, imagemLocal = '', carregandoFoto = false, feedbackTimer = null;
  const ids = {nome:'local-edit-nome',regiao:'local-edit-regiao',img:'local-edit-imagem',desc:'local-edit-desc',notas:'local-edit-notas'};

  function feedback(msg, error = false) {
    const el = $('locais-feedback');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('error', error);
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { el.textContent = ''; el.classList.remove('error'); }, 5500);
  }
  function renderizarLocaisGM() {
    const grid = $('locais-grid');
    if (!grid || typeof dbLocais === 'undefined') return;
    const normalizar = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const busca = normalizar($('locais-search')?.value);
    const todos = Array.isArray(dbLocais) ? dbLocais.filter(item => item && item.id != null) : [];
    const encontrados = todos.filter(item => normalizar([item.nome,item.regiao,item.desc].join(' ')).includes(busca))
      .sort((a,b) => String(a.nome || '').localeCompare(String(b.nome || ''),'pt-BR'));
    $('locais-count').textContent = encontrados.length + ' de ' + todos.length + ' locais';
    if (!encontrados.length) {
      grid.innerHTML = '<div class="locais-empty"><strong>' + (todos.length ? 'Nenhum local encontrado' : 'Construa seu mundo!') + '</strong>' +
       (todos.length ? 'Tente outro nome ou região.' : 'Crie seu primeiro reino, castelo, taverna ou floresta e mostre aos jogadores no overlay.') + '</div>';
      return;
    }
    grid.innerHTML = encontrados.map(local => {
      const id = safe(local.id);
      const img = imagemValida(local.img);
      const desc = String(local.desc || '').trim();
      const notas = String(local.notasMestre || '').trim();
      const count = Array.isArray(local.pontos) ? local.pontos.length : 0;
      return '<article class="local-card">' +
        '<div class="local-image">' + (img ? '<img loading="lazy" src="' + safe(img) + '" alt="Imagem de ' + safe(local.nome || 'Local') + '">' : '🏰') + '</div>' +
        '<div><span class="local-category">' + safe(local.regiao || 'LUGAR DE ELKARIOZ') + '</span>' +
        '<h3 class="local-title">' + safe(local.nome || 'Local sem nome') + '</h3></div>' +
        '<p class="local-desc">' + safe(desc ? desc.slice(0,320) : 'Nenhuma descrição pública cadastrada.') + (desc.length > 320 ? '…' : '') + '</p>' +
        (count ? '<div class="local-tags">📌 ' + count + ' ' + (count === 1 ? 'ponto vinculado' : 'pontos vinculados') + '</div>' : '') +
        (notas ? '<div class="local-notes"><strong>🔒 NOTAS SÓ DO MESTRE</strong>' + safe(notas.slice(0,175)) + (notas.length>175?'…':'') + '</div>' : '') +
        '<div class="local-actions">' +
        '<button type="button" class="send" data-local-action="send" data-local-id="' + id + '">📤 ENVIAR</button>' +
        '<button type="button" class="show" data-local-action="show" data-local-id="' + id + '" ' + (!img ? 'disabled title="Cadastre uma imagem para exibir o local no overlay"' : '') + '>🎬 OVERLAY</button>' +
        '<button type="button" data-local-action="edit" data-local-id="' + id + '">✎ EDITAR</button>' +
        '<button type="button" class="delete" data-local-action="delete" data-local-id="' + id + '">✕ EXCLUIR</button>' +
        '</div></article>';
    }).join('');
  }

  function imagemFormulario() { return imagemValida($(ids.img).value) || imagemValida(imagemLocal); }
  function mostrarPreview() {
    const preview = $('local-editor-preview');
    const fallback = $('local-editor-fallback');
    const url = imagemFormulario();
    if (url) {
      preview.src = url; preview.hidden = false; fallback.hidden = true;
      preview.onerror = () => { preview.hidden=true; fallback.hidden=false; };
    } else {
      preview.removeAttribute('src'); preview.hidden=true; fallback.hidden=false;
    }
  }
  function abrirEditorLocal(id = null) {
    const local = id == null ? null : dbLocais.find(l => String(l.id) === String(id));
    if (id != null && !local) return;
    editandoId = local?.id ?? null;
    imagemLocal = imagemValida(local?.img);
    $('local-modal-title').textContent = local ? 'EDITAR LOCAL' : 'CRIAR LOCAL';
    $(ids.nome).value = local?.nome || '';
    $(ids.regiao).value = local?.regiao || '';
    $(ids.img).value = imagemLocal.startsWith('data:') ? '' : imagemLocal;
    $(ids.desc).value = local?.desc || '';
    $(ids.notas).value = local?.notasMestre || '';
    $('local-file-status').textContent = imagemLocal.startsWith('data:') ? 'Foto salva neste navegador.' : 'JPG, PNG ou WEBP. A imagem será compactada.';
    $('local-image-file').value = '';
    mostrarPreview();
    $('modal-local-editor').style.display = 'flex';
    $(ids.nome).focus();
  }
  function fecharEditorLocal() {
    $('modal-local-editor').style.display = 'none';
    editandoId = null;imagemLocal = '';carregandoFoto = false;
    $('local-form').reset();
  }
  function salvarLocal(event) {
    event.preventDefault();
    if (carregandoFoto) return alert('A foto ainda está sendo preparada.');
    const nome = String($(ids.nome).value || '').trim();
    if (!nome) return $(ids.nome).focus();
    const rawUrl = String($(ids.img).value || '').trim();
    if (rawUrl && !imagemValida(rawUrl)) {
      alert('Use uma URL de imagem HTTP/HTTPS válida ou carregue uma foto do computador.');
      return $(ids.img).focus();
    }
    const novo = {
      nome: nome.slice(0,115),
      regiao: String($(ids.regiao).value || '').trim().slice(0,100),
      img: imagemFormulario(),
      desc: String($(ids.desc).value || '').trim().slice(0,6500),
      notasMestre: String($(ids.notas).value || '').trim().slice(0,10000)
    };
    const registrado = editandoId != null ? dbLocais.find(l => String(l.id) === String(editandoId)) : null;
    if (registrado) {
      Object.assign(registrado, novo); // preserva pontos e vínculos antigos.
    } else {
      const usados = new Set(dbLocais.map(x => String(x.id)));
      let id = Date.now();
      while (usados.has(String(id))) id++;
      dbLocais.push({ id, ...novo, pontos: [] });
    }
    try {localStorage.setItem('rpgLocais',JSON.stringify(dbLocais));}
    catch(e) {
      if (!registrado) dbLocais.pop();
      alert('Sem espaço para salvar a foto. Use uma imagem menor ou URL.');
      return;
    }
    fecharEditorLocal();
    renderizarLocaisGM();
    feedback('✓ Local "' + nome + '" salvo.');
  }

  function excluirLocal(id) {
    const local = dbLocais.find(l => String(l.id) === String(id));
    if (!local || !confirm('Excluir permanentemente o local "' + local.nome + '"?')) return;
    const old = dbLocais;
    dbLocais = dbLocais.filter(l => String(l.id) !== String(id));
    try {localStorage.setItem('rpgLocais',JSON.stringify(dbLocais));}
    catch(e) {dbLocais = old;alert('Falha ao excluir o local.');return;}
    renderizarLocaisGM();
    feedback('Local excluído do catálogo.');
  }

  function enviarLocal(id) {
    const local = dbLocais.find(l => String(l.id) === String(id));
    if (!local) return;
    if (typeof abrirModalEnvio !== 'function') return feedback('O envio não está disponível nesta versão.',true);
    abrirModalEnvio(null,'local',local.id);
  }

  function exibirLocalOverlay(id) {
    const local = dbLocais.find(l => String(l.id) === String(id));
    if (!local) return;
    const url = imagemValida(local.img);
    if (!url) return feedback('Adicione uma imagem ao local para mostrá-lo no overlay.',true);
    const sala = String(gmUid || '').trim().toUpperCase();
    if (!sala || !socket?.connected) return feedback('Conecte o Escudo do Mestre à mesa primeiro.',true);
    feedback('🎬 Enviando imagem de ' + local.nome + ' ao overlay…');
    socket.timeout(6500).emit('portrait_overlay_toggle',{
      sala,
      playerId: 'local-' + String(local.id),
      nome: local.nome,
      raca: local.regiao || 'LUGAR DE ELKARIOZ',
      kind: 'local',
      url
    },(err,res) => {
      if (err || !res?.ok) return feedback('Falha ao atualizar o overlay. Verifique a sala e o servidor.',true);
      feedback(res.visible ? '✓ Local exibido no overlay!' : '✓ Imagem do local ocultada do overlay.');
    });
  }

  function receberFoto(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type) || file.size > 9 * 1024 * 1024) {
      alert('Escolha uma imagem PNG/JPG/WEBP/GIF de até 9 MB.');return;
    }
    carregandoFoto = true;
    $('local-file-status').textContent = 'Preparando imagem para o overlay…';
    const fileUrl = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(fileUrl);
      try {
        let imgResult = '';
        for(const [maxSize,quality] of [[950,.78],[800,.68],[700,.60],[560,.5],[420,.42]]) {
          const proportion = Math.min(1,maxSize/Math.max(img.naturalWidth,img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1,Math.round(img.naturalWidth*proportion));
          canvas.height = Math.max(1,Math.round(img.naturalHeight*proportion));
          const ctx = canvas.getContext('2d');
          if (!ctx) throw Error('Canvas indisponível');
          ctx.fillStyle='#eee2ce';ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          const jpeg = canvas.toDataURL('image/jpeg',quality);
          if(jpeg.length < 210000){imgResult = jpeg;break;}
        }
        if(!imgResult) throw Error('A imagem é grande demais.');
        imagemLocal = imgResult;
        $(ids.img).value = '';
        $('local-file-status').textContent = '✓ Imagem pronta para salvar.';
        mostrarPreview();
      } catch(e) {
        $('local-file-status').textContent='Não foi possível preparar. Experimente outra foto ou cole a URL.';
      } finally {carregandoFoto = false;}
    };
    img.onerror = () => {URL.revokeObjectURL(fileUrl);carregandoFoto = false;$('local-file-status').textContent='Não foi possível abrir a imagem.';};
    img.src = fileUrl;
  }

  function setupLocais() {
    $('local-add')?.addEventListener('click',()=>abrirEditorLocal());
    $('locais-search')?.addEventListener('input',renderizarLocaisGM);
    $('local-form')?.addEventListener('submit',salvarLocal);
    $('local-close')?.addEventListener('click',fecharEditorLocal);
    $('local-cancel')?.addEventListener('click',fecharEditorLocal);
    $('local-photo-remove')?.addEventListener('click',()=>{
      imagemLocal='';$(ids.img).value='';$('local-file-status').textContent='Foto removida. Salve para confirmar.';mostrarPreview();
    });
    $(ids.img)?.addEventListener('input',()=>{
      if ($(ids.img).value.trim()) imagemLocal='';
      mostrarPreview();
    });
    $('local-image-file')?.addEventListener('change',ev=>{
      receberFoto(ev.currentTarget.files?.[0]);ev.currentTarget.value='';
    });
    $('locais-grid')?.addEventListener('click',event=>{
      const button=event.target.closest('button[data-local-action]');
      if(!button)return;
      const id=button.dataset.localId,action=button.dataset.localAction;
      if(action==='send')enviarLocal(id);
      else if(action==='show')exibirLocalOverlay(id);
      else if(action==='edit')abrirEditorLocal(id);
      else if(action==='delete')excluirLocal(id);
    });
    $('modal-local-editor')?.addEventListener('click',ev=>{
      if(ev.target===ev.currentTarget)fecharEditorLocal();
    });
    renderizarLocaisGM();
  }
  window.renderizarLocaisGM=renderizarLocaisGM;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupLocais,{once:true});
  else setupLocais();
})();