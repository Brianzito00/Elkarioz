/* Elkarioz — Visual do monstro no mesmo overlay de Locais, NPCs e jogadores.
   Foto é um campo adicional, sem modificar os atributos / rolagens da ficha. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let imagemSalva = '';
  let processando = false;

  function urlPermitida(v) {
    const url = String(v || '').trim();
    if (!url || url.length > 224000) return '';
    if (/^https?:\/\//i.test(url) || /^\/[^/]/.test(url)) return url;
    if (/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(url)) return url;
    return '';
  }

  function prepararFotoMonstroNovo() {
    imagemSalva = '';
    processando = false;
    const campo = $('mon-foto-url');
    if (!campo) return;
    campo.value = '';
    $('mon-foto-file').value = '';
    $('mon-foto-status').textContent = 'Foto opcional. Sua ficha de combate continua completa.';
    atualizarPreviewMonstro();
  }

  function prepararFotoMonstroEdicao(monstro) {
    imagemSalva = urlPermitida(monstro?.img || '');
    processando = false;
    const campo = $('mon-foto-url');
    if (!campo) return;
    campo.value = imagemSalva.startsWith('data:') ? '' : imagemSalva;
    $('mon-foto-file').value = '';
    $('mon-foto-status').textContent = imagemSalva.startsWith('data:') ? 'Imagem carregada e salva no navegador.' : 'A foto pode ser trocada sem afetar a ficha do monstro.';
    atualizarPreviewMonstro();
  }

  function fotoMonstroFormulario() {
    if (processando) {
      alert('A imagem do monstro ainda está sendo preparada.');
      return null;
    }
    const campo = $('mon-foto-url');
    if (!campo) return '';
    const raw = String(campo.value || '').trim();
    if (raw && !urlPermitida(raw)) {
      alert('Informe um link HTTP/HTTPS de imagem válido ou envie uma foto do computador.');
      campo.focus();
      return null;
    }
    return urlPermitida(raw) || imagemSalva || '';
  }

  function atualizarPreviewMonstro() {
    const miniatura = $('mon-foto-preview-img'), fallback = $('mon-foto-fallback');
    if (!miniatura || !fallback) return;
    const imagem = urlPermitida($('mon-foto-url')?.value) || imagemSalva;
    if (!imagem) {
      miniatura.removeAttribute('src');
      miniatura.hidden = true;
      fallback.hidden = false;
      return;
    }
    miniatura.src = imagem;
    miniatura.hidden = false;
    fallback.hidden = true;
    miniatura.onerror = () => {
      miniatura.hidden = true;
      fallback.hidden = false;
    };
  }

  function tirarFotoMonstro() {
    imagemSalva = '';
    $('mon-foto-url').value = '';
    $('mon-foto-file').value = '';
    $('mon-foto-status').textContent = 'Imagem removida. Salve o monstro para confirmar.';
    atualizarPreviewMonstro();
  }

  function receberImagemMonstro(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type) || file.size > 9*1024*1024) {
      alert('Selecione uma imagem PNG, JPG, WEBP ou GIF de até 9 MB.');
      return;
    }
    processando = true;
    const info = $('mon-foto-status');
    info.textContent = 'Preparando imagem para o overlay…';
    const endereco = URL.createObjectURL(file);
    const foto = new Image();
    foto.onload = () => {
      URL.revokeObjectURL(endereco);
      try {
        let result = '';
        for (const [maxDim, qualidade] of [[900,.78],[750,.68],[620,.58],[520,.49],[410,.42]]) {
          const escala = Math.min(1,maxDim/Math.max(foto.naturalWidth,foto.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1,Math.round(foto.naturalWidth*escala));
          canvas.height = Math.max(1,Math.round(foto.naturalHeight*escala));
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas indisponível');
          context.fillStyle = '#f3e9da';
          context.fillRect(0,0,canvas.width,canvas.height);
          context.drawImage(foto,0,0,canvas.width,canvas.height);
          const dataURL = canvas.toDataURL('image/jpeg',qualidade);
          if (dataURL.length < 215000) {result = dataURL; break;}
        }
        if (!result) throw new Error('Arquivo grande demais');
        imagemSalva = result;
        $('mon-foto-url').value = '';
        info.textContent = '✓ Foto pronta para salvar e transmitir.';
        atualizarPreviewMonstro();
      } catch(error) {
        info.textContent = 'Não foi possível preparar a foto. Tente outra imagem ou cole um link.';
      } finally {
        processando = false;
      }
    };
    foto.onerror = () => {
      URL.revokeObjectURL(endereco);
      processando = false;
      info.textContent = 'Não foi possível abrir a imagem.';
    };
    foto.src = endereco;
  }

  function mostrarMonstroNoOverlay(id) {
    if (typeof dbBestiario === 'undefined') return;
    const monstro = dbBestiario.find(m => String(m.id) === String(id));
    if (!monstro) return;
    const imagem = urlPermitida(monstro.img);
    if (!imagem) {
      alert('Cadastre uma foto para este monstro antes de mostrá-lo na transmissão.');
      return;
    }
    const sala = String(typeof gmUid !== 'undefined' ? gmUid : '').trim().toUpperCase();
    if (!sala || !socket?.connected) {
      alert('Primeiro conecte o Escudo do Mestre à sala da campanha.');
      return;
    }
    socket.timeout(6500).emit('portrait_overlay_toggle',{
      sala,
      playerId: 'monstro-' + String(monstro.id),
      nome: String(monstro.nome || 'Monstro'),
      kind: 'monstro',
      raca: '',
      url: imagem
    },(error,result)=>{
      if(error || !result?.ok) {
        alert('Não foi possível exibir o monstro. Confira a conexão com o overlay.');
      }
    });
  }

  function iniciarControlesFotoMonstro() {
    $('mon-foto-url')?.addEventListener('input', () => {
      if ($('mon-foto-url').value.trim()) imagemSalva = '';
      atualizarPreviewMonstro();
    });
    $('mon-foto-file')?.addEventListener('change', e => {
      receberImagemMonstro(e.currentTarget.files?.[0]);
      e.currentTarget.value = '';
    });
    $('mon-foto-remover')?.addEventListener('click', tirarFotoMonstro);
  }

  window.prepararFotoMonstroNovo = prepararFotoMonstroNovo;
  window.prepararFotoMonstroEdicao = prepararFotoMonstroEdicao;
  window.fotoMonstroFormulario = fotoMonstroFormulario;
  window.mostrarMonstroNoOverlay = mostrarMonstroNoOverlay;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarControlesFotoMonstro, {once:true});
  else iniciarControlesFotoMonstro();
})();
