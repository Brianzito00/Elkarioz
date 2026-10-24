/* Catálogo de referência do mestre — Elkarioz.
 * Modelos inspirados em equipamentos comuns de fantasia medieval.
 * Dados/pesos são sugestões editáveis, não reprodução normativa do T20. */
(function () {
  'use strict';

  // m(nome, grupo, tipo, peso, descrição, dano, crítico, danoTipo, alcance, capacidade, munição)
  const m = (nome, grupo, tipo, peso, desc, dano = '', crit = '20/x2', tipoDano = '', alcance = '', munMax = 0, munNomeReq = '') =>
    ({ nome, grupo, tipo, peso, desc, dano, crit, tipoDano, alcance, munMax, munNomeReq });

  const modelos = [
    // Armas de corpo a corpo
    m('Adaga','Armas leves','corpo',.5,'Lâmina curta, fácil de carregar e ocultar.','1d4','19/x2','Perfuração ou corte','Corpo a corpo'),
    m('Bordão','Armas simples','corpo',2,'Bastão robusto de madeira, útil também para apoio na viagem.','1d6','20/x2','Impacto','Corpo a corpo'),
    m('Clava','Armas simples','corpo',1,'Porrete de madeira reforçada.','1d6','20/x2','Impacto','Corpo a corpo'),
    m('Lança','Armas simples','corpo',2,'Haste longa com ponta perfurante.','1d6','20/x2','Perfuração','Corpo a corpo'),
    m('Maça','Armas simples','corpo',3,'Arma de impacto com cabeça metálica.','1d8','20/x2','Impacto','Corpo a corpo'),
    m('Foice','Armas simples','corpo',1,'Ferramenta agrícola usada como arma improvisada.','1d4','20/x2','Corte','Corpo a corpo'),
    m('Machadinha','Armas leves','corpo',1,'Pequeno machado para combate ou trabalho.','1d6','20/x3','Corte','Corpo a corpo'),
    m('Martelo leve','Armas leves','corpo',1,'Martelo compacto para golpes rápidos.','1d4','20/x2','Impacto','Corpo a corpo'),
    m('Espada curta','Armas marciais','corpo',1,'Espada compacta, útil em lugares estreitos.','1d6','19/x2','Corte ou perfuração','Corpo a corpo'),
    m('Espada longa','Armas marciais','corpo',2,'Lâmina versátil de uma mão.','1d8','19/x2','Corte','Corpo a corpo'),
    m('Espada bastarda','Armas marciais','corpo',3,'Espada de empunhadura longa, adaptável ao combate.','1d10','19/x2','Corte','Corpo a corpo'),
    m('Espada de duas mãos','Armas marciais','corpo',4,'Grande espada de alcance próximo e golpes pesados.','2d6','19/x2','Corte','Corpo a corpo'),
    m('Machado de batalha','Armas marciais','corpo',3,'Machado de combate equilibrado para uma mão.','1d8','20/x3','Corte','Corpo a corpo'),
    m('Machado de guerra','Armas marciais','corpo',5,'Machado pesado pensado para grandes golpes.','1d12','20/x3','Corte','Corpo a corpo'),
    m('Martelo de guerra','Armas marciais','corpo',3,'Cabeça de metal para golpes contundentes.','1d8','20/x3','Impacto','Corpo a corpo'),
    m('Mangual','Armas marciais','corpo',3,'Peso ligado por corrente a um cabo.','1d8','20/x2','Impacto','Corpo a corpo'),
    m('Picareta de guerra','Armas marciais','corpo',2,'Ponta metálica desenhada para perfurar.','1d8','20/x4','Perfuração','Corpo a corpo'),
    m('Tridente','Armas marciais','corpo',2,'Arma de três pontas usada para perfurar.','1d8','20/x2','Perfuração','Corpo a corpo'),
    m('Florete','Armas marciais','corpo',1,'Espada fina e ágil de estocada.','1d6','18/x2','Perfuração','Corpo a corpo'),
    m('Cimitarra','Armas marciais','corpo',2,'Espada curva apropriada a golpes de corte.','1d6','18/x2','Corte','Corpo a corpo'),
    m('Chicote','Armas especiais','corpo',1,'Tira longa e flexível para ataques e manobras narrativas.','1d3','20/x2','Corte','Corpo a corpo'),
    m('Katana','Armas especiais','corpo',2,'Espada curva de lâmina longa.','1d10','19/x2','Corte','Corpo a corpo'),
    m('Montante','Armas especiais','corpo',5,'Espadão de duas mãos e lâmina larga.','2d6','19/x2','Corte','Corpo a corpo'),
    m('Alabarda','Armas especiais','corpo',5,'Arma de haste com lâmina e ponta.','1d10','20/x3','Corte ou perfuração','Corpo a corpo'),
    m('Corrente com cravos','Armas especiais','corpo',2,'Corrente metálica adaptada para combate.','2d4','20/x2','Impacto ou perfuração','Corpo a corpo'),
    m('Gadanho','Armas especiais','corpo',4,'Lâmina curva presa a uma haste comprida.','2d4','20/x4','Corte','Corpo a corpo'),
    m('Sabre','Armas marciais','corpo',2,'Lâmina curva ideal para combatentes móveis.','1d8','19/x2','Corte','Corpo a corpo'),
    m('Porrete','Armas simples','corpo',1,'Clava curta feita de madeira dura.','1d4','20/x2','Impacto','Corpo a corpo'),
    // Armas à distância
    m('Arco curto','Armas à distância','dist',1,'Arco leve de uso rápido em combate.','1d6','20/x3','Perfuração','Médio',1,'Flechas'),
    m('Arco longo','Armas à distância','dist',2,'Arco grande para tiros a maior distância.','1d8','20/x3','Perfuração','Longo',1,'Flechas'),
    m('Besta leve','Armas à distância','dist',2,'Besta portátil com mecanismo de disparo.','1d8','19/x2','Perfuração','Médio',1,'Virotes'),
    m('Besta pesada','Armas à distância','dist',4,'Besta reforçada, exige tempo para recarregar.','1d12','19/x2','Perfuração','Médio',1,'Virotes'),
    m('Besta de mão','Armas à distância','dist',1,'Pequena besta para disparos próximos.','1d6','19/x2','Perfuração','Curto',1,'Virotes'),
    m('Funda','Armas à distância','dist',.2,'Tira de couro para lançar pequenas pedras.','1d4','20/x2','Impacto','Curto',1,'Pedras'),
    m('Azagaia','Armas arremessáveis','dist',1,'Lança curta feita para ser arremessada.','1d6','20/x2','Perfuração','Curto',1,'Azagaias'),
    m('Dardo','Armas arremessáveis','dist',.2,'Projétil pequeno arremessado à mão.','1d4','20/x2','Perfuração','Curto',1,'Dardos'),
    m('Shuriken','Armas arremessáveis','dist',.1,'Lâmina pequena feita para arremesso.','1d4','20/x2','Corte','Curto',1,'Shurikens'),
    m('Zarabatana','Armas à distância','dist',.5,'Tubo usado para lançar pequenos dardos.','1d2','20/x2','Perfuração','Curto',1,'Dardos'),
    m('Pistola','Armas de fogo','dist',2,'Arma de pólvora de uma mão; disponibilidade depende do cenário.','2d6','19/x3','Perfuração','Curto',1,'Balas'),
    m('Mosquete','Armas de fogo','dist',4,'Arma longa de pólvora; regras variam por edição.','2d8','19/x3','Perfuração','Médio',1,'Balas'),
    m('Bacamarte','Armas de fogo','dist',4,'Arma de cano largo para disparos próximos.','2d6','20/x3','Perfuração','Curto',1,'Munição'),
    m('Bumerangue','Armas arremessáveis','dist',.5,'Objeto curvo lançado em trajetória arqueada.','1d4','20/x2','Impacto','Curto',1,'Bumerangues'),
    m('Rede','Armas especiais','dist',2,'Rede com pesos para conter um alvo; efeito narrativo.','','20/x2','','Curto',1,'Redes'),
    // Proteções (tratadas como objetos para manter compatibilidade da ficha)
    m('Escudo leve','Proteções','comum',3,'Proteção portátil para uma mão; ajuste o bônus de defesa pelas regras da mesa.'),
    m('Escudo pesado','Proteções','comum',7,'Escudo robusto para defender o portador.'),
    m('Armadura acolchoada','Proteções','comum',5,'Proteção leve feita de tecido reforçado.'),
    m('Armadura de couro','Proteções','comum',7,'Colete e peças de couro tratado para combate.'),
    m('Couro batido','Proteções','comum',10,'Armadura de couro rígido, com reforços.'),
    m('Cota de malha','Proteções','comum',15,'Anéis metálicos entrelaçados cobrem o corpo.'),
    m('Brunea','Proteções','comum',12,'Armadura com pequenas lâminas sobre uma base resistente.'),
    m('Peitoral','Proteções','comum',10,'Placa metálica protege o peito do aventureiro.'),
    m('Meia armadura','Proteções','comum',18,'Conjunto de placas parciais e proteção flexível.'),
    m('Armadura completa','Proteções','comum',25,'Conjunto de placas metálicas para quase todo o corpo.'),
    // Itens de exploração
    m('Mochila','Exploração','comum',1,'Bolsa de viagem usada para transportar suprimentos.'),
    m('Corda (15 metros)','Exploração','comum',5,'Corda resistente para escaladas e travessias.'),
    m('Gancho de escalada','Exploração','comum',1,'Gancho de metal que ajuda a prender cordas.'),
    m('Pé de cabra','Ferramentas','comum',2,'Barra metálica para fazer alavanca.'),
    m('Pederneira','Exploração','comum',.1,'Pedra e metal para produzir faíscas.'),
    m('Tocha','Iluminação','comum',.5,'Fonte de luz simples que precisa ser acesa.'),
    m('Lampião','Iluminação','comum',1,'Lanterna abastecida com óleo ou combustível.'),
    m('Óleo (frasco)','Suprimentos','comum',.5,'Frasco de óleo para iluminação ou outros usos.'),
    m('Vela','Iluminação','comum',.1,'Pequena fonte de luz para locais fechados.'),
    m('Cantíl','Suprimentos','comum',1,'Recipiente para carregar água durante a viagem.'),
    m('Ração de viagem','Suprimentos','comum',.5,'Alimento conservado para um dia de caminhada.'),
    m('Barraca','Acampamento','comum',5,'Abrigo desmontável para noites ao relento.'),
    m('Saco de dormir','Acampamento','comum',2,'Cobertor reforçado para descansar em viagem.'),
    m('Cobertor de viagem','Acampamento','comum',1,'Tecido grosso para manter o corpo aquecido.'),
    m('Algemas','Ferramentas','comum',1,'Par de braçadeiras metálicas com fecho.'),
    m('Corrente (3 metros)','Ferramentas','comum',3,'Corrente resistente para prender objetos.'),
    m('Luneta','Exploração','comum',1,'Instrumento de observação a longa distância.'),
    m('Bússola','Exploração','comum',.2,'Ajuda a orientar a marcha e consultar mapas.'),
    m('Mapa regional','Exploração','comum',.1,'Representação das estradas e dos marcos da região.'),
    m('Caderno de anotações','Escrita','comum',.3,'Páginas para registrar pistas, desenhos e informações.'),
    m('Tinta e pena','Escrita','comum',.2,'Conjunto para redigir documentos e cartas.'),
    m('Sino de mão','Ferramentas','comum',.3,'Pequeno sino para avisos ou rituais narrativos.'),
    m('Espelho de metal','Exploração','comum',.2,'Superfície refletiva útil para observar cantos.'),
    m('Frasco vazio','Suprimentos','comum',.2,'Recipiente para amostras, tinturas ou líquidos.'),
    m('Bolsa de moedas','Suprimentos','comum',.2,'Pequena bolsa para dinheiro e objetos leves.'),
    m('Kit de primeiros socorros','Kits','comum',2,'Conjunto de ataduras e instrumentos; aplique as regras de cura da mesa.'),
    m('Ferramentas de ladrão','Kits','comum',1,'Gazuas e instrumentos para fechaduras e armadilhas.'),
    m('Ferramentas de artesão','Kits','comum',4,'Kit básico de utensílios para trabalhos manuais.'),
    m('Instrumento musical','Kits','comum',2,'Instrumento de viagem utilizado em apresentações.'),
    m('Kit de alquimia','Kits','comum',3,'Recipientes e ferramentas para preparar misturas.'),
    m('Bolsa de componentes','Kits','comum',1,'Compartimentos para materiais usados em magia.'),
    m('Disfarces','Kits','comum',2,'Peças de roupa, maquiagem e acessórios para representar identidades.'),
    m('Apito','Exploração','comum',.1,'Pequeno instrumento de sinalização.'),
    // Consumíveis e suprimentos
    m('Bandagens','Consumíveis','comum',.2,'Tecido limpo para cobrir pequenos ferimentos.'),
    m('Antídoto','Consumíveis','comum',.2,'Preparado contra certos venenos; efeitos dependem da mesa.'),
    m('Poção de cura','Consumíveis','comum',.2,'Elixir mágico de recuperação; defina o efeito antes de enviar.'),
    m('Elixir de vigor','Consumíveis','comum',.2,'Tônico revigorante de efeito a definir pelo mestre.'),
    m('Água benta','Consumíveis','comum',.5,'Água consagrada para cerimônias e encontros sobrenaturais.'),
    m('Ácido (frasco)','Alquimia','comum',.5,'Líquido corrosivo que deve ser manuseado com cuidado.'),
    m('Fogo alquímico','Alquimia','comum',.5,'Frasco inflamável fictício para confrontos de fantasia.'),
    m('Bomba de fumaça','Alquimia','comum',.5,'Dispositivo fictício que produz uma nuvem de fumaça.'),
    m('Cola alquímica','Alquimia','comum',.3,'Mistura adesiva fictícia para situações de aventura.'),
    m('Unguento restaurador','Alquimia','comum',.3,'Pasta de uso tópico com propriedades à escolha do mestre.'),
    m('Veneno fictício','Alquimia','comum',.1,'Recurso narrativo de fantasia; efeito e duração definidos pelo mestre.'),
    m('Flechas (20)','Munições','comum',1,'Aljava com flechas para arcos.'),
    m('Virotes (20)','Munições','comum',1,'Bolsa com projéteis para bestas.'),
    m('Balas (10)','Munições','comum',1,'Projéteis para armas de fogo de fantasia.'),
    m('Pedras de funda','Munições','comum',1,'Pedras arredondadas adequadas para uma funda.')
  ];

  const normalizar = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const escapar = value => (typeof escaparHtmlArsenal === 'function'
    ? escaparHtmlArsenal(value) : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])));
  const byId = id => document.getElementById(id);
  let avisoTimer;

  function sincronizarContadorCatalogo() {
    const el = byId('arsenal-total-modelos');
    if (el) el.textContent = String(modelos.length);
  }

  function atualizarCategorias() {
    const select = byId('arsenal-catalogo-grupo');
    if (!select || select.options.length > 1) return;
    const grupos = [...new Set(modelos.map(item => item.grupo))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
    grupos.forEach(grupo => {
      const option = document.createElement('option');
      option.value = grupo;
      option.textContent = grupo;
      select.appendChild(option);
    });
  }

  function trocarVisaoArsenal(visao) {
    const catalogo = visao === 'catalogo';
    const painel = byId('arsenal-catalogo');
    if (!painel) return;
    painel.hidden = !catalogo;
    document.querySelectorAll('#tab-mundo .arsenal-bloco-salvos').forEach(el => { el.hidden = catalogo; });
    const bSalvos = byId('arsenal-view-salvos');
    const bCatalogo = byId('arsenal-view-catalogo');
    [ [bSalvos, !catalogo], [bCatalogo, catalogo] ].forEach(([el, active]) => {
      if (!el) return;
      el.classList.toggle('ativo', active);
      el.setAttribute('aria-pressed', String(active));
    });
    if (catalogo) {
      atualizarCategorias();
      renderizarCatalogoArsenal();
    } else {
      if (typeof renderizarArsenal === 'function') renderizarArsenal();
    }
  }

  function renderizarCatalogoArsenal() {
    const grid = byId('arsenal-catalogo-grid');
    if (!grid) return;
    const busca = normalizar(byId('arsenal-catalogo-busca')?.value.trim());
    const tipo = byId('arsenal-catalogo-tipo')?.value || 'todos';
    const grupo = byId('arsenal-catalogo-grupo')?.value || 'todos';
    const resultados = modelos.map((item, i) => ({...item, i})).filter(item =>
      (tipo === 'todos' || item.tipo === tipo) &&
      (grupo === 'todos' || item.grupo === grupo) &&
      (!busca || normalizar([item.nome,item.grupo,item.tipo,item.desc,item.dano,item.tipoDano].join(' ')).includes(busca))
    );
    const count = byId('arsenal-catalogo-contador');
    if (count) count.textContent = resultados.length + ' de ' + modelos.length + ' modelos';
    if (!resultados.length) {
      grid.innerHTML = '<div class="catalogo-equip-vazio">Nenhum equipamento corresponde aos filtros. Experimente outra busca.</div>';
      return;
    }
    grid.innerHTML = resultados.map(item => {
      const icone = item.tipo === 'corpo' ? '⚔️' : item.tipo === 'dist' ? '🏹' : item.grupo === 'Proteções' ? '🛡️' : item.grupo === 'Consumíveis' || item.grupo === 'Alquimia' ? '🧪' : '🎒';
      const stats = [
        item.dano ? '<span>Dano ' + escapar(item.dano) + '</span>' : '',
        item.dano ? '<span>Crit. ' + escapar(item.crit) + '</span>' : '',
        item.peso !== undefined ? '<span>Peso sugerido ' + escapar(item.peso) + '</span>' : ''
      ].filter(Boolean).join('');
      const arma = item.tipo === 'corpo' || item.tipo === 'dist';
      return '<article class="catalogo-equip-card">' +
          '<div class="catalogo-equip-topo"><div class="catalogo-equip-icon" aria-hidden="true">' + icone + '</div>' +
          '<div class="catalogo-equip-identidade"><span class="catalogo-equip-grupo">' + escapar(item.grupo) + '</span><h3>' + escapar(item.nome) + '</h3></div></div>' +
          '<div class="catalogo-equip-stats">' + stats + '</div>' +
          '<p class="catalogo-equip-desc">' + escapar(item.desc) + '</p>' +
          (arma ? '<div class="catalogo-equip-extra">Tipo: ' + escapar(item.tipoDano || '—') + ' · Alcance: ' + escapar(item.alcance || '—') + (item.tipo === 'dist' ? ' · Munição: ' + escapar(item.munNomeReq || '—') : '') + '</div>' : '') +
          '<div class="catalogo-equip-acoes">' +
          '<button type="button" class="catalogo-equip-add" onclick="adicionarDoCatalogoArsenal(' + item.i + ')">＋ ADICIONAR</button>' +
          '<button type="button" class="catalogo-equip-custom" onclick="personalizarDoCatalogoArsenal(' + item.i + ')">✎ EDITAR ANTES</button>' +
          '</div></article>';
    }).join('');
  }

  function montarItem(index) {
    const ref = modelos[Number(index)];
    if (!ref) return null;
    const tipo = ref.tipo;
    const idExistentes = new Set(dbArsenal.map(item => String(item.id)));
    let id = Date.now();
    while (idExistentes.has(String(id))) id += 1;
    const item = {
      id,
      nome: ref.nome,
      tipo,
      peso: ref.peso,
      raridade: 'Normal',
      img: '',
      desc: ref.desc,
      dano: tipo === 'comum' ? '' : ref.dano,
      crit: ref.crit || '20/x2',
      tipoDano: ref.tipoDano || '',
      alcance: ref.alcance || '',
      periciaLink: tipo === 'dist' ? 'Pontaria' : tipo === 'corpo' ? 'Luta' : '',
      equipado: false
    };
    if (tipo === 'dist') {
      item.munMax = Math.max(0, Number(ref.munMax) || 0);
      item.munAtual = item.munMax;
      item.munNomeReq = ref.munNomeReq || '';
    }
    return item;
  }

  function avisar(texto) {
    const area = byId('arsenal-catalogo-aviso');
    if (!area) return;
    area.textContent = texto;
    area.hidden = false;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => {
      area.hidden = true;
      area.textContent = '';
    }, 6000);
  }

  function adicionarDoCatalogoArsenal(index) {
    const item = montarItem(index);
    if (!item) return;
    if (typeof dbArsenal === 'undefined' || typeof salvarArsenalMestre !== 'function') {
      avisar('Não foi possível acessar o arsenal nesta página.'); return;
    }
    dbArsenal.push(item);
    try {
      salvarArsenalMestre();
      renderizarArsenal();
      avisar('✓ ' + item.nome + ' adicionado ao Meu Arsenal. Abra Meu Arsenal para editar ou enviar aos jogadores.');
    } catch (err) {
      dbArsenal.pop();
      avisar('Não foi possível salvar. Confira o armazenamento do navegador.');
    }
  }

  function personalizarDoCatalogoArsenal(index) {
    const item = montarItem(index);
    if (!item || typeof abrirModalArsenal !== 'function') return;
    abrirModalArsenal();
    const set = (id, valor) => {const element = byId(id); if (element) element.value = valor;};
    set('arsenal-nome', item.nome);
    set('arsenal-tipo', item.tipo);
    set('arsenal-peso', item.peso);
    set('arsenal-raridade', item.raridade);
    set('arsenal-desc', item.desc);
    set('arsenal-dano', item.dano);
    set('arsenal-crit', item.crit);
    set('arsenal-tipo-dano', item.tipoDano);
    set('arsenal-alcance', item.alcance);
    set('arsenal-municao', item.munMax || 1);
    set('arsenal-municao-nome', item.munNomeReq || '');
    atualizarCamposArsenal();
    const titulo = byId('arsenal-modal-titulo');
    if(titulo) titulo.textContent = 'PERSONALIZAR EQUIPAMENTO';
  }

  // Exposição pública apenas para botões do template HTML.
  window.trocarVisaoArsenal = trocarVisaoArsenal;
  window.renderizarCatalogoArsenal = renderizarCatalogoArsenal;
  window.adicionarDoCatalogoArsenal = adicionarDoCatalogoArsenal;
  window.personalizarDoCatalogoArsenal = personalizarDoCatalogoArsenal;
  sincronizarContadorCatalogo();
  atualizarCategorias();
})();
