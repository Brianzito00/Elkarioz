/* Elkarioz RPG — Catálogo TEMÁTICO de ameaças para mesas Tormenta20.
 * Fichas originais e ADAPTADAS, não transcrições oficiais de Ameaças/Bestiário de Arton.
 * ND, atributos, vida, ataques e habilidades são sugestões alteráveis pelo Mestre.
 * Fichas oficiais podem ser introduzidas pelo próprio usuário via importação JSON.
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const e = text => String(text == null ? '' : text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const norm = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  // Cada modelo: nome, grupo, ND sugerido, ataque principal, dano sugerido, habilidade, conceito original.
  const BASE = [
    ['Bandido de Estrada','Capangas & Bandoleiros',.25,'Espada curta','1d6','Emboscada','Assaltante que escolhe viajantes isolados.'],
    ['Saqueador da Fronteira','Capangas & Bandoleiros',.5,'Machado de mão','1d6+2','Pilhagem','Mercenário rude acostumado às estradas.'],
    ['Besteiro de Emboscada','Capangas & Bandoleiros',1,'Besta leve','1d8','Posição Elevada','Atirador que vigia passagens estreitas.'],
    ['Capanga do Crime','Capangas & Bandoleiros',1,'Clava reforçada','1d8+2','Intimidação','Guarda-costas de um chefe criminoso.'],
    ['Mercenário Veterano','Capangas & Bandoleiros',3,'Espada longa','1d8+4','Formação de Combate','Soldado experiente acostumado a longas campanhas.'],
    ['Chefe de Bandoleiros','Capangas & Bandoleiros',5,'Sabre','2d6+4','Comando Cruel','Líder de bando que usa táticas de cerco.'],
    ['Guerreiro Duyshidakk','Duyshidakk & Goblinoides',1,'Lança','1d6+2','Ataque Coordenado','Combatente goblinoide organizado.'],
    ['Arqueiro Goblin','Duyshidakk & Goblinoides',.5,'Arco curto','1d6','Disparo Oportunista','Batedor que explora a confusão da batalha.'],
    ['Goblin Engenhoqueiro','Duyshidakk & Goblinoides',2,'Granada artesanal','2d6','Truque Instável','Inventor de aparatos de funcionamento imprevisível.'],
    ['Hobgoblin Sentinela','Duyshidakk & Goblinoides',2,'Espada longa','1d8+3','Disciplina Militar','Vigia treinado para defender fortificações.'],
    ['Goblin Cavaleiro','Duyshidakk & Goblinoides',3,'Lança de montaria','1d8+4','Investida','Batedor veloz sobre uma montaria resistente.'],
    ['Comandante Duyshidakk','Duyshidakk & Goblinoides',6,'Lâmina de guerra','2d8+5','Táticas de Guerra','General que prefere vencer pela estratégia.'],
    ['Batedor Kobold','Kobolds',.25,'Lança improvisada','1d4','Alerta do Ninho','Pequeno patrulheiro que protege seu grupo.'],
    ['Kobold Escavador','Kobolds',.5,'Picareta','1d6','Passagem Oculta','Escava túneis e prepara rotas de fuga.'],
    ['Kobold Atirador','Kobolds',1,'Funda','1d6','Cobertura','Ataca de trás de pedras e barricadas.'],
    ['Kobold Escamado','Kobolds',2,'Garras','1d8+2','Defesa Escamosa','Guardião robusto de um covil antigo.'],
    ['Sacerdote Kobold','Kobolds',4,'Cajado','1d6+3','Benção do Ninho','Líder espiritual de uma colônia de kobolds.'],
    ['Lobo das Montanhas','Feras & Ermos',.5,'Mordida','1d6+1','Caçada em Matilha','Predador de terreno rochoso e florestas frias.'],
    ['Urso Pardo','Feras & Ermos',2,'Garras','1d8+4','Abraço Esmagador','Animal imponente que defende seu território.'],
    ['Aranha das Cavernas','Feras & Ermos',2,'Presas','1d8+2','Teia Pegajosa','Predador que espera nas galerias escuras.'],
    ['Javali Enfurecido','Feras & Ermos',1,'Presa','1d8+2','Investida Furiosa','Fera que avança ao ser ameaçada.'],
    ['Pantera Sombria','Feras & Ermos',3,'Garras','2d6+2','Caçador Noturno','Felino furtivo das florestas profundas.'],
    ['Grifo Montanhês','Feras & Ermos',5,'Garras','2d6+5','Mergulho do Predador','Criatura alada que domina desfiladeiros.'],
    ['Mantícora','Masmorras & Monstruosidades',6,'Espinhos','2d8+5','Rajada de Espinhos','Predador monstruoso de regiões isoladas.'],
    ['Minotauro Renegado','Masmorras & Monstruosidades',5,'Machado de guerra','2d8+5','Investida Brutal','Lutador que construiu seu próprio labirinto.'],
    ['Ogro Brutamontes','Masmorras & Monstruosidades',3,'Clava gigante','2d6+5','Golpe Demolidor','Gigante agressivo que escolhe a força bruta.'],
    ['Troll de Ponte','Masmorras & Monstruosidades',5,'Garras','2d6+5','Regeneração Instável','Guardião territorial de uma travessia antiga.'],
    ['Basilisco do Subsolo','Masmorras & Monstruosidades',6,'Mordida','2d8+4','Olhar Paralisante','Réptil que patrulha cavernas esquecidas.'],
    ['Harpia do Penhasco','Masmorras & Monstruosidades',3,'Garras','1d8+3','Canto Hipnótico','Caçadora alada que atrai viajantes aos rochedos.'],
    ['Cocatriz Selvagem','Masmorras & Monstruosidades',4,'Bicada','1d8+3','Toque Petrificante','Criatura agressiva encontrada em ruínas.'],
    ['Esqueleto de Soldado','Mortos-vivos',.5,'Espada enferrujada','1d6+1','Corpo sem Dor','Guerreiro reanimado por magia sombria.'],
    ['Zumbi Errante','Mortos-vivos',.5,'Mãos cadavéricas','1d6+2','Avanço Incansável','Morto que vagueia atrás de calor e movimento.'],
    ['Arqueiro Esquelético','Mortos-vivos',1,'Arco envelhecido','1d8','Tiro Silencioso','Sentinela morta ainda presa ao dever.'],
    ['Carniçal das Catacumbas','Mortos-vivos',3,'Garras pútridas','1d8+3','Toque Debilitante','Devorador que assombra túmulos antigos.'],
    ['Cavaleiro Sem Vida','Mortos-vivos',6,'Espada espectral','2d8+5','Terror da Cripta','Antigo guerreiro preso a um juramento sombrio.'],
    ['Vampiro Andarilho','Mortos-vivos',9,'Garras noturnas','2d8+7','Sedução Noturna','Predador sobrenatural que se esconde entre nobres.'],
    ['Lich da Torre','Mortos-vivos',13,'Raio arcano','3d8+8','Magia Profana','Conjurador morto-vivo que domina um santuário.'],
    ['Golem de Barro','Golens & Construtos',2,'Punho pesado','1d8+3','Corpo Maleável','Guardião artificial de uma passagem.'],
    ['Armadura Animada','Golens & Construtos',3,'Manopla de ferro','1d10+3','Vigia Imóvel','Armadura encantada que acorda ao detectar invasores.'],
    ['Golem de Pedra','Golens & Construtos',7,'Punho rochoso','2d8+6','Resistência Mineral','Construto resistente feito para proteger fortalezas.'],
    ['Autômato de Bronze','Golens & Construtos',5,'Lâmina mecânica','2d6+5','Engrenagens Velozes','Defensor de oficina arcana abandonada.'],
    ['Golem de Ferro','Golens & Construtos',10,'Punho de ferro','3d8+7','Corpo de Metal','Colosso artificial quase impossível de deter.'],
    ['Elemental da Terra','Elementais',3,'Punho de pedra','2d6+3','Tremor de Solo','Manifestação viva das forças da terra.'],
    ['Elemental da Água','Elementais',3,'Chicote de água','2d6+3','Maré Repentina','Espírito de nascentes e rios antigos.'],
    ['Elemental do Fogo','Elementais',4,'Chamas','2d6+4','Aura Ardente','Entidade flamejante de um foco elemental.'],
    ['Elemental do Ar','Elementais',4,'Rajada de vento','2d6+4','Turbilhão','Criatura formada por correntes violentas.'],
    ['Elemental Ancestral','Elementais',11,'Força primordial','3d8+8','Tempestade Elemental','Manifestação poderosa do equilíbrio natural.'],
    ['Cultista do Caos','Tormenta & Cultos',1,'Punhal ritual','1d6+1','Fé Perturbadora','Devoto de uma presença extraplanar temida.'],
    ['Criatura Mutante','Tormenta & Cultos',3,'Apêndice ósseo','2d6+3','Mutação Instável','Ser alterado por forças sobrenaturais.'],
    ['Verme Rubro','Tormenta & Cultos',4,'Mandíbula ácida','2d8+3','Corrosão','Predador de regiões tomadas por energia anormal.'],
    ['Aberração da Tormenta','Tormenta & Cultos',7,'Garras retorcidas','2d10+6','Distorção Orgânica','Horror cuja presença altera o ambiente.'],
    ['Sacerdote de Aharadak','Tormenta & Cultos',8,'Toque distorcido','2d8+7','Influência Profana','Líder fanático de uma seita aterrorizante.'],
    ['Colosso Rubro','Tormenta & Cultos',12,'Membros dilacerantes','3d10+8','Presença Deformadora','Massa monstruosa que marcha com força devastadora.'],
    ['Dragão Jovem','Dragões & Dracônicos',7,'Mordida','2d10+6','Sopro Dracônico','Predador alado que ainda expande seu domínio.'],
    ['Serpente Dracônica','Dragões & Dracônicos',5,'Presas','2d8+4','Escamas Místicas','Réptil de sangue mágico e grande astúcia.'],
    ['Dragão das Montanhas','Dragões & Dracônicos',9,'Garras','3d8+7','Sopro Elemental','Guardião de tesouro nas alturas.'],
    ['Dragão Ancião','Dragões & Dracônicos',17,'Mordida colossal','4d10+11','Rugido Ancestral','Ameaça épica que domina regiões inteiras.'],
    ['Draconato Guerreiro','Dragões & Dracônicos',4,'Espada dracônica','1d10+4','Postura Escamada','Combatente de linhagem dracônica.'],
    ['Corsário do Mar','Piratas & Costa',1,'Sabre de convés','1d6+2','Manobra de Convés','Saqueador dos navios costeiros.'],
    ['Pistoleiro de Porto','Piratas & Costa',2,'Pistola','2d6','Tiro de Cobertura','Atirador treinado para lutas curtas.'],
    ['Capitão dos Piratas','Piratas & Costa',6,'Sabre','2d6+5','Ordens de Abordagem','Comanda ataques rápidos a embarcações.'],
    ['Sereia Hostil','Piratas & Costa',5,'Tridente','1d10+4','Canção das Profundezas','Protetora de um território sob as ondas.'],
    ['Guardião do Recife','Piratas & Costa',8,'Tridente pesado','2d8+6','Maré Protetora','Defensor de antigas ruínas submersas.'],
    ['Fanático Purista','Soldados & Intrigas',3,'Espada curta','1d8+3','Fervor de Guerra','Soldado fanático de uma causa cruel.'],
    ['Agente do Culto da Serpente','Soldados & Intrigas',4,'Adaga envenenada','1d6+4','Intriga Mortal','Espião de uma sociedade de intrigas.'],
    ['Templário da Guerra','Soldados & Intrigas',6,'Espada bastarda','2d8+5','Desafio Marcial','Guerreiro devoto de doutrinas bélicas.'],
    ['Espião da Corte','Soldados & Intrigas',2,'Punhal oculto','1d6+2','Identidade Falsa','Informante treinado em disfarces e segredos.']
  ];
  const grupos = [...new Set(BASE.map(entry => entry[1]))];
  const ndText = nd => nd === .25 ? '1/4' : nd === .5 ? '1/2' : String(nd);
  const numeric = (value, def, min = -100, max = 10000) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max,Math.max(min,n)) : def;
  };
  function sugerirFicha(registro) {
    const [nome,grupo,nd,ataque,dano,hab,descricao] = registro;
    const n = numeric(nd,1,0,30);
    const tier = Math.max(1,Math.round(n));
    const bruto = /Ogro|Troll|Dragão|Colosso|Golem|Urso|Minotauro|Basilisco/i.test(nome);
    const agil = /Goblin|Kobold|Aranha|Pantera|Harpia|Espião|Arqueiro|Pistoleiro/i.test(nome);
    const arcano = /Lich|Elemental|Cultista|Sereia|Sacerdote/i.test(nome);
    const forca = Math.min(18,Math.max(-2,Math.round(n/2)+(bruto?3:1)));
    const destreza = Math.min(13,Math.max(-2,Math.round(n/3)+(agil?3:0)));
    const constituicao = Math.min(17,Math.max(-2,Math.round(n/2)+(bruto?2:0)));
    const inteligencia = Math.min(12,Math.max(-2,Math.round(n/3)+(arcano?3:-1)));
    const sabedoria = Math.min(12,Math.max(-1,Math.round(n/4)+(arcano?2:0)));
    const carisma = Math.min(11,Math.max(-2,Math.round(n/4)+(arcano?2:-1)));
    const hp = Math.max(5,Math.round(9 + 17*n + (bruto?8*n:0)));
    const def = Math.round(12 + 1.4*n + (agil?2:0));
    const bonus = Math.round(2+n*1.35+(bruto?1:0));
    return {
      nome, hpAtual:hp, hpMax:hp, def,
      attr:{for:forca,des:destreza,con:constituicao,int:inteligencia,sab:sabedoria,car:carisma},
      mov:/Dragão|Grifo|Harpia|Elemental do Ar/i.test(nome)?'Voo 12m':(agil?'12m':'9m'),
      imun:/Morto|Esqueleto|Zumbi|Carniçal|Vampiro|Lich|Golem|Autômato|Armadura Animada/i.test(nome)?'Efeitos de sono (sugestão)':'',
      vuln:'', img:'', naMesa:false,
      ataques:[{id:Date.now(),nome:ataque,bonus,dano,crit:'20/x2'}],
      habilidades:[{id:Date.now()+1,nome:hab,dano:'',desc:'Habilidade temática sugerida. Defina ação, alcance, custo, teste e efeitos conforme sua mesa.'}],
      enigma:'Modelo de referência criado para Elkarioz (não oficial). Grupo: '+grupo+'. ND sugerido '+ndText(nd)+'. Conceito: '+descricao
    };
  }
  function totalSalvos() {return Array.isArray(dbBestiario)?dbBestiario.length:0;}
  let visao = 'salvos', msgTimeout = null;

  function mostrarAviso(message,error=false) {
    const box=$('ameacas-aviso');
    if(!box)return;
    box.textContent=message;box.classList.toggle('error',error);
    box.hidden=false;
    clearTimeout(msgTimeout);
    msgTimeout=setTimeout(()=>{box.hidden=true;},6500);
  }
  function trocarVisaoAmeacas(modo) {
    visao = modo === 'catalogo' ? 'catalogo' : 'salvos';
    const salvos=$('bestiario-salvos'),catalogo=$('ameacas-catalogo');
    if(!salvos||!catalogo)return;
    salvos.hidden=visao!=='salvos';
    catalogo.hidden=visao!=='catalogo';
    ['salvos','catalogo'].forEach(tipo=>{
      const botao=$('ameacas-view-'+tipo);
      if(botao){botao.classList.toggle('ativo',tipo===visao);botao.setAttribute('aria-pressed',String(tipo===visao));}
    });
    if(visao==='catalogo')renderizarCatalogoAmeacas();
    else if(typeof renderizarBestiario==='function')renderizarBestiario();
  }
  function renderizarCatalogoAmeacas() {
    const grid=$('ameacas-grid');if(!grid)return;
    const busca=norm($('ameacas-busca')?.value);
    const grupo=$('ameacas-grupo')?.value || 'todos';
    const ndFiltro=$('ameacas-nd')?.value || 'todos';
    const resultados=BASE.map((reg,i)=>({...{reg,i}})).filter(({reg})=>{
      const nd=reg[2],texto=norm([reg[0],reg[1],reg[3],reg[5],reg[6]].join(' '));
      return (!busca||texto.includes(busca))&&(grupo==='todos'||reg[1]===grupo)&&
        (ndFiltro==='todos'||(ndFiltro==='baixo'&&nd<=2)||(ndFiltro==='medio'&&nd>2&&nd<=6)||(ndFiltro==='alto'&&nd>6));
    });
    $('ameacas-total').textContent=BASE.length+' modelos';
    $('ameacas-contador').textContent=resultados.length+' resultados · '+totalSalvos()+' salvos';
    grid.innerHTML=resultados.length ? resultados.map(({reg,i})=>{
      const [nome,g,nd,atq,dano,hab,conceito]=reg;
      return '<article class="ameaca-card">'+
        '<div class="ameaca-card-top"><span class="ameaca-grupo">'+e(g)+'</span><span class="ameaca-nd">ND '+e(ndText(nd))+' *</span></div>'+
        '<h3>'+e(nome)+'</h3><p class="ameaca-conceito">'+e(conceito)+'</p>'+
        '<div class="ameaca-infos"><span>⚔️ '+e(atq)+'</span><span>🎲 '+e(dano)+'</span></div>'+
        '<p class="ameaca-habilidade">✦ '+e(hab)+'</p>'+
        '<div class="ameaca-acoes"><button type="button" class="ameaca-adicionar" data-ameaca-action="add" data-index="'+i+'">＋ ADICIONAR À MESA</button>'+
        '<button type="button" class="ameaca-personalizar" data-ameaca-action="edit" data-index="'+i+'">✎ EDITAR ANTES</button></div>'+
        '</article>';
    }).join(''):'<div class="ameaca-vazio">Nenhuma criatura corresponde aos filtros.</div>';
  }
  function salvarFichaNoBestiario(ficha) {
    if(typeof dbBestiario==='undefined'||!Array.isArray(dbBestiario))throw Error('O bestiário não foi carregado.');
    let id=Date.now();while(dbBestiario.some(x=>String(x.id)===String(id)))id++;
    const novo={...ficha,id,naMesa:false};
    const anterior=[...dbBestiario];
    dbBestiario.push(novo);
    try{localStorage.setItem('rpgBestiario',JSON.stringify(dbBestiario));}
    catch(error){dbBestiario=anterior;throw Error('O navegador não conseguiu salvar as fichas. Verifique o espaço de armazenamento.');}
    if(typeof renderizarBestiario==='function')renderizarBestiario();
    return novo;
  }
  function adicionarModeloAmeaca(index) {
    const modelo=BASE[Number(index)];if(!modelo)return;
    try{const salvo=salvarFichaNoBestiario(sugerirFicha(modelo));
      mostrarAviso('✓ '+salvo.nome+' foi adicionado a Minhas Fichas. Abra a ficha para revisar e ajustar os valores.');}
    catch(err){mostrarAviso(err.message||'Não foi possível salvar.',true);}
    renderizarCatalogoAmeacas();
  }
  function personalizarModeloAmeaca(index) {
    const modelo=BASE[Number(index)];if(!modelo)return;
    const ficha=sugerirFicha(modelo);
    if(typeof abrirModalMonstro!=='function')return mostrarAviso('Editor indisponível.',true);
    abrirModalMonstro();
    const campos={'mon-nome':ficha.nome,'mon-hp-atual':ficha.hpAtual,'mon-hp-max':ficha.hpMax,
      'mon-def':ficha.def,'mon-for':ficha.attr.for,'mon-des':ficha.attr.des,
      'mon-con':ficha.attr.con,'mon-int':ficha.attr.int,'mon-sab':ficha.attr.sab,
      'mon-car':ficha.attr.car,'mon-mov':ficha.mov,'mon-imun':ficha.imun,
      'mon-vuln':ficha.vuln,'mon-enigma':ficha.enigma};
    Object.keys(campos).forEach(id=>{const el=$(id);if(el)el.value=campos[id];});
    tempAtaques=ficha.ataques.map(x=>({...x}));
    tempHabilidades=ficha.habilidades.map(x=>({...x}));
    if(typeof renderTempAtqHab==='function')renderTempAtqHab();
    const title=document.querySelector('#modal-monstro .section-title');
    if(title)title.textContent='PERSONALIZAR AMEAÇA';
  }
  function numberField(value,fallback,min,max) {
    return Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):fallback));
  }
  function normalizarImportacao(dados) {
    if(!dados||typeof dados!=='object'||Array.isArray(dados))return null;
    const nome=String(dados.nome||'').trim().slice(0,115);
    if(!nome)return null;
    const attr=dados.attr&&typeof dados.attr==='object'?dados.attr:{};
    const attrs={};
    for(const key of ['for','des','con','int','sab','car'])attrs[key]=numberField(attr[key],0,-20,50);
    const hpMax=Math.floor(numberField(dados.hpMax ?? dados.pv ?? dados.pvMax,20,1,100000));
    const hpAtual=Math.floor(numberField(dados.hpAtual ?? dados.pvAtual ?? hpMax,hpMax,0,100000));
    const attacks=Array.isArray(dados.ataques)?dados.ataques.slice(0,35):[];
    const skills=Array.isArray(dados.habilidades)?dados.habilidades.slice(0,40):[];
    const ataques=attacks.map((x,i)=>({
      id:Date.now()+i+1,
      nome:String(x?.nome||'Ataque').slice(0,100),
      bonus:numberField(x?.bonus,0,-100,200),
      dano:String(x?.dano||'1d6').slice(0,80),
      crit:String(x?.crit||'20/x2').slice(0,40)
    }));
    const habilidades=skills.map((x,i)=>({
      id:Date.now()+500+i,
      nome:String(x?.nome||'Habilidade').slice(0,100),
      dano:String(x?.dano||'').slice(0,80),
      desc:String(x?.desc||'').slice(0,2000)
    }));
    const img=String(dados.img||'');
    return {nome,hpAtual:Math.min(hpAtual,hpMax),hpMax,
      def:numberField(dados.def,10,0,300),
      attr:attrs,mov:String(dados.mov||'').slice(0,120),
      imun:String(dados.imun||'').slice(0,600),
      vuln:String(dados.vuln||'').slice(0,600),
      enigma:String(dados.enigma||'').slice(0,2500),
      img:/^(https?:\/\/|\/[^/]|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(img)&&img.length<224000?img:'',
      ataques,habilidades,naMesa:false};
  }
  async function importarAmeacasJSON(file) {
    if(!file)return;
    if(file.size>1.5*1024*1024)return mostrarAviso('O arquivo precisa ter no máximo 1,5 MB.',true);
    let dados;
    try{dados=JSON.parse(await file.text());}
    catch(e){return mostrarAviso('JSON inválido. Confira o formato das fichas.',true);}
    const lista=Array.isArray(dados)?dados:(Array.isArray(dados.monstros)?dados.monstros:[dados]);
    if(lista.length>200)return mostrarAviso('Importe no máximo 200 fichas por vez.',true);
    const convertidos=lista.map(normalizarImportacao).filter(Boolean);
    if(!convertidos.length)return mostrarAviso('Nenhuma ficha válida. Use os campos nome, hpMax, def, attr, ataques e habilidades.',true);
    const snapshot=[...dbBestiario];const usados=new Set(dbBestiario.map(x=>String(x.id)));
    let id=Date.now();
    convertidos.forEach(ficha=>{while(usados.has(String(id)))id++;dbBestiario.push({...ficha,id,naMesa:false});usados.add(String(id));id++;});
    try{localStorage.setItem('rpgBestiario',JSON.stringify(dbBestiario));}
    catch(e){dbBestiario=snapshot;return mostrarAviso('Não foi possível salvar todas as fichas. Armazenamento cheio.',true);}
    if(typeof renderizarBestiario==='function')renderizarBestiario();
    renderizarCatalogoAmeacas();
    mostrarAviso('✓ '+convertidos.length+' fichas importadas com sucesso. Elas estão em Minhas Fichas.');
  }
  function baixarExemploJSON() {
    const exemplo={
      nome:'Minha Criatura',hpAtual:30,hpMax:30,def:15,
      attr:{for:2,des:1,con:2,int:0,sab:1,car:0},
      mov:'9m',imun:'',vuln:'',img:'',
      ataques:[{nome:'Garra',bonus:5,dano:'1d8+2',crit:'20/x2'}],
      habilidades:[{nome:'Investida',dano:'',desc:'Descreva o efeito escolhido para sua criatura.'}],
      enigma:'Anotações opcionais do mestre'
    };
    const blob=new Blob([JSON.stringify([exemplo],null,2)],{type:'application/json'});
    const href=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=href;a.download='modelo-fichas-bestiario-elkarioz.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1000);
  }
  function init() {
    const gruposSelect=$('ameacas-grupo');
    if(!gruposSelect)return;
    gruposSelect.innerHTML='<option value="todos">Todas as categorias</option>'+
      grupos.map(grupo=>'<option value="'+e(grupo)+'">'+e(grupo)+'</option>').join('');
    $('ameacas-busca')?.addEventListener('input',renderizarCatalogoAmeacas);
    gruposSelect.addEventListener('change',renderizarCatalogoAmeacas);
    $('ameacas-nd')?.addEventListener('change',renderizarCatalogoAmeacas);
    $('ameacas-importar-btn')?.addEventListener('click',()=>$('ameacas-import-file')?.click());
    $('ameacas-import-file')?.addEventListener('change',async event=>{
      await importarAmeacasJSON(event.target.files?.[0]);
      event.target.value='';
    });
    $('ameacas-json-exemplo')?.addEventListener('click',baixarExemploJSON);
    $('ameacas-grid')?.addEventListener('click',ev=>{
      const button=ev.target.closest('button[data-ameaca-action]');
      if(!button)return;
      const index=Number(button.dataset.index);
      if(button.dataset.ameacaAction==='add')adicionarModeloAmeaca(index);
      else if(button.dataset.ameacaAction==='edit')personalizarModeloAmeaca(index);
    });
    renderizarCatalogoAmeacas();
  }
  window.trocarVisaoAmeacas=trocarVisaoAmeacas;
  window.renderizarCatalogoAmeacas=renderizarCatalogoAmeacas;
  window.adicionarModeloAmeaca=adicionarModeloAmeaca;
  window.personalizarModeloAmeaca=personalizarModeloAmeaca;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
