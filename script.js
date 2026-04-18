// =========================================================
// MAESTRO DE NAVEGAÇÃO GLOBAL
// =========================================================
window.mudarAbaPrincipal = function(idTela, idBtn) {
    ['tela-tabela', 'tela-pesquisa', 'tela-habilidades', 'tela-graficos', 'tela-logs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    ['btn-visao-tabela', 'btn-visao-pesquisa', 'btn-visao-habilidades', 'btn-visao-graficos', 'btn-visao-logs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visao-ativa');
    });
    const telaAtiva = document.getElementById(idTela);
    const btnAtivo = document.getElementById(idBtn);
    if (telaAtiva) telaAtiva.style.display = 'block';
    if (btnAtivo) btnAtivo.classList.add('visao-ativa');

    if (idTela === 'tela-tabela' && typeof renderizarTabela === 'function') {
        renderizarTabela();
    }
}

// =========================================================
// 1. FÁBRICA DE MODAIS CUSTOMIZADOS
// =========================================================
window.sysAlert = function(msg, title = "Aviso") {
    return new Promise((resolve) => {
        document.getElementById('sys-modal-title').innerText = title;
        document.getElementById('sys-modal-msg').innerText = msg;
        document.getElementById('sys-modal-input').style.display = 'none';
        document.getElementById('sys-modal-textarea').style.display = 'none';
        document.getElementById('sys-modal-btn-cancel').style.display = 'none';
        const modal = document.getElementById('sys-modal-overlay');
        const btnOk = document.getElementById('sys-modal-btn-ok');
        modal.style.display = 'flex';
        const handleOk = () => {
            modal.style.display = 'none';
            btnOk.removeEventListener('click', handleOk);
            resolve();
        };
        btnOk.addEventListener('click', handleOk);
    });
};

window.sysConfirm = function(msg, title = "Confirmação") {
    return new Promise((resolve) => {
        document.getElementById('sys-modal-title').innerText = title;
        document.getElementById('sys-modal-msg').innerText = msg;
        document.getElementById('sys-modal-input').style.display = 'none';
        document.getElementById('sys-modal-textarea').style.display = 'none';
        document.getElementById('sys-modal-btn-cancel').style.display = 'block';
        const modal = document.getElementById('sys-modal-overlay');
        const btnOk = document.getElementById('sys-modal-btn-ok');
        const btnCancel = document.getElementById('sys-modal-btn-cancel');
        modal.style.display = 'flex';
        const cleanUp = () => {
            modal.style.display = 'none';
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
        };
        const onOk = () => { cleanUp(); resolve(true); };
        const onCancel = () => { cleanUp(); resolve(false); };
        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
    });
};

window.sysPrompt = function(msg, defaultText = "", title = "Entrada Necessária", isMultiline = false) {
    return new Promise((resolve) => {
        document.getElementById('sys-modal-title').innerText = title;
        document.getElementById('sys-modal-msg').innerText = msg;
        const input = document.getElementById('sys-modal-input');
        const textarea = document.getElementById('sys-modal-textarea');
        if (isMultiline) { input.style.display = 'none'; textarea.style.display = 'block'; textarea.value = defaultText; } 
        else { textarea.style.display = 'none'; input.style.display = 'block'; input.value = defaultText; }
        document.getElementById('sys-modal-btn-cancel').style.display = 'block';
        const modal = document.getElementById('sys-modal-overlay');
        const btnOk = document.getElementById('sys-modal-btn-ok');
        const btnCancel = document.getElementById('sys-modal-btn-cancel');
        modal.style.display = 'flex';
        if(isMultiline) textarea.focus(); else input.focus();
        const cleanUp = () => { modal.style.display = 'none'; btnOk.removeEventListener('click', onOk); btnCancel.removeEventListener('click', onCancel); };
        const onOk = () => { cleanUp(); resolve(isMultiline ? textarea.value : input.value); };
        const onCancel = () => { cleanUp(); resolve(null); };
        btnOk.addEventListener('click', onOk); btnCancel.addEventListener('click', onCancel);
    });
};

// =========================================================
// 2. INICIALIZAÇÃO DO FIREBASE
// =========================================================
const firebaseConfig = {
    apiKey: "AIzaSyBvUCEdJX2WW7SaHUcenhKMz5eRtpOY4es",
    authDomain: "avaliatrilhas.firebaseapp.com",
    projectId: "avaliatrilhas",
    storageBucket: "avaliatrilhas.firebasestorage.app",
    messagingSenderId: "342989369706",
    appId: "1:342989369706:web:1fd8a7578fd98933b97513"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// =========================================================
// 3. DICIONÁRIO DE PERMISSÕES (RBAC LOCAL)
// =========================================================
const tabelaPermissoes = {
    "acesso@trilhas.com": { perfil: "admin" },
    "coordenação@trilhas.com": { perfil: "coordenacao" },
    "regente1@trilhas.com": { perfil: "professor", acessos: { "polo1": { "Manhã": { "1º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "2º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] }, "Tarde": { "1º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "2º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] } } }},
    "regente2@trilhas.com": { perfil: "professor", acessos: { "polo1": { "Manhã": { "1º Ano": ["Artes e Musicalização"], "2º Ano": ["Artes e Musicalização"], "3º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências", "Artes e Musicalização"], "5º Ano": ["Artes e Musicalização"] }, "Tarde": { "1º Ano": ["Artes e Musicalização"], "2º Ano": ["Artes e Musicalização"], "3º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências", "Artes e Musicalização"], "5º Ano": ["Artes e Musicalização"] } } }},
    "regente3@trilhas.com": { perfil: "professor", acessos: { "polo1": { "Manhã": { "4º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "5º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] }, "Tarde": { "4º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "5º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] } } }},
    "especialista1@trilhas.com": { perfil: "professor", acessos: { "polo1": { "Manhã": { "1º Ano": ["Inglês", "Informática"], "2º Ano": ["Inglês", "Informática"], "3º Ano": ["Inglês", "Informática"], "4º Ano": ["Inglês", "Informática", "Artes e Musicalização"], "5º Ano": ["Inglês", "Informática"] }, "Tarde": { "1º Ano": ["Inglês", "Informática"], "2º Ano": ["Inglês", "Informática"], "3º Ano": ["Inglês", "Informática"], "4º Ano": ["Inglês", "Informática", "Artes e Musicalização"], "5º Ano": ["Inglês", "Informática"] } } }},
    "especialista2@trilhas.com": { perfil: "professor", acessos: { "polo1": { "Manhã": { "1º Ano": ["Xadrez", "Ed. Física"], "2º Ano": ["Xadrez", "Ed. Física"], "3º Ano": ["Xadrez", "Ed. Física"], "4º Ano": ["Xadrez", "Ed. Física"], "5º Ano": ["Xadrez", "Ed. Física"] }, "Tarde": { "1º Ano": ["Xadrez", "Ed. Física"], "2º Ano": ["Xadrez", "Ed. Física"], "3º Ano": ["Xadrez", "Ed. Física"], "4º Ano": ["Xadrez", "Ed. Física"], "5º Ano": ["Xadrez", "Ed. Física"] } } }},
    "especialista3@trilhas.com": { perfil: "professor", acessos: { "polo1": { "Manhã": { "1º Ano": ["Robótica"], "2º Ano": ["Robótica"], "3º Ano": ["Robótica"], "4º Ano": ["Robótica"], "5º Ano": ["Robótica"] }, "Tarde": { "1º Ano": ["Robótica"], "2º Ano": ["Robótica"], "3º Ano": ["Robótica"], "4º Ano": ["Robótica"], "5º Ano": ["Robótica"] } }, "polo2": { "Manhã": { "Infantil IV": ["Informática", "Robótica"], "Infantil V e 1º Ano": ["Informática", "Robótica"], "2º Ano": ["Informática", "Robótica"] }, "Tarde": { "2º Ano": ["Informática", "Robótica"], "3º Ano A": ["Robótica"], "3º Ano B": ["Robótica"], "4º e 5º": ["Informática", "Robótica"] } } }},
    "geral1@trilhas.com": { perfil: "professor", acessos: { "polo2": { "Manhã": { "Infantil IV": ["Inglês"], "Infantil V e 1º Ano": ["Inglês"], "2º Ano": ["Inglês", "Matemática"] }, "Tarde": { "2º Ano": ["Inglês", "Matemática"], "3º Ano A": ["Inglês"], "3º Ano B": ["Inglês"], "4º e 5º": ["Inglês", "Matemática"] } } }},
    "geral2@trilhas.com": { perfil: "professor", acessos: { "polo2": { "Manhã": { "Infantil IV": ["Psicomotricidade", "Xadrez"], "Infantil V e 1º Ano": ["Psicomotricidade", "Xadrez"], "2º Ano": ["Jogos de Oposição", "Xadrez"] }, "Tarde": { "2º Ano": ["Jogos de Oposição", "Xadrez"], "3º Ano A": ["Xadrez"], "3º Ano B": ["Xadrez"] } } }},
    "geral3@trilhas.com": { perfil: "professor", acessos: { "polo2": { "Manhã": { "Infantil IV": ["Matemática", "Português"], "Infantil V e 1º Ano": ["Matemática", "Português"], "2º Ano": ["Matemática", "Português"] }, "Tarde": { "2º Ano": ["Matemática", "Português"], "3º Ano A": ["Matemática", "Português"], "3º Ano B": ["Matemática", "Português"], "4º e 5º": ["Português"] } } }},
    "geral4@trilhas.com": { perfil: "professor", acessos: { "polo2": { "Manhã": { "2º Ano": ["Jogos de Oposição"] }, "Tarde": { "2º Ano": ["Jogos de Oposição"], "3º Ano A": ["Informática", "Jogos de Oposição"], "3º Ano B": ["Informática", "Jogos de Oposição"], "4º e 5º": ["Jogos de Oposição", "Xadrez"] } } }}
};

let usuarioPermissoes = null; 

auth.onAuthStateChanged(async (user) => {
    const telaLogin = document.getElementById('tela-login');
    const btnSair = document.getElementById('btn-sair');
    const spanUsuario = document.getElementById('texto-usuario-logado');

    if (user) { 
        const emailTratado = user.email.trim().toLowerCase();
        const nomeUsuario = emailTratado.split('@')[0];
        if (spanUsuario) { spanUsuario.innerHTML = `Você está logado como <b>${nomeUsuario}</b>`; spanUsuario.style.display = 'inline-block'; }
        
        usuarioPermissoes = tabelaPermissoes[emailTratado];
        if (!usuarioPermissoes) {
            usuarioPermissoes = { perfil: 'admin' };
            await sysAlert(`O e-mail "${emailTratado}" não está na lista de permissões. Acesso Admin liberado provisoriamente.`, "Aviso de Segurança");
        }
        aplicarPermissoesDeInterface();
        if (typeof iniciarOuvinteNotificacoes === 'function') iniciarOuvinteNotificacoes();

        telaLogin.style.display = 'none'; btnSair.style.display = 'block'; 
    } else { 
        telaLogin.style.display = 'flex'; btnSair.style.display = 'none'; if (spanUsuario) spanUsuario.style.display = 'none';
        const sino = document.getElementById('container-sino'); const caderno = document.getElementById('btn-caderno-prof');
        if (sino) sino.style.display = 'none'; if (caderno) caderno.style.display = 'none';
        if (typeof unsubscribeNotificacoes !== 'undefined' && unsubscribeNotificacoes) unsubscribeNotificacoes();
        window.meuCaderno = []; usuarioPermissoes = null;
    }
});

function aplicarPermissoesDeInterface() {
    const btnAvancado = document.getElementById('btn-abrir-opcoes-avancadas');
    const polosSelects = [
        document.getElementById('filtro-polo'), document.getElementById('dest-alu-copiar-polo'),
        document.getElementById('dest-alu-mover-polo'), document.getElementById('dest-hab-polo'),
        document.getElementById('hab-edit-polo'), document.getElementById('hab-lote-polo'),
        document.getElementById('grafico-polo')
    ];

    polosSelects.forEach(sel => { if(sel) sel.innerHTML = '<option value="">Selecione...</option>'; });

    if (!usuarioPermissoes || usuarioPermissoes.perfil === 'admin' || usuarioPermissoes.perfil === 'coordenacao') {
        if (btnAvancado) btnAvancado.style.display = usuarioPermissoes?.perfil === 'coordenacao' ? 'none' : 'inline-block';
        polosSelects.forEach(sel => { if(sel) { sel.appendChild(new Option("Polo 1", "polo1")); sel.appendChild(new Option("Polo 2", "polo2")); } });
    } 
    else if (usuarioPermissoes.perfil === 'professor') {
        if (btnAvancado) btnAvancado.style.display = 'none';
        polosSelects.forEach(sel => {
            if(sel) {
                if (usuarioPermissoes.acessos?.['polo1']) sel.appendChild(new Option("Polo 1", "polo1"));
                if (usuarioPermissoes.acessos?.['polo2']) sel.appendChild(new Option("Polo 2", "polo2"));
            }
        });
    }
}

document.getElementById('btn-entrar').addEventListener('click', () => {
    const email = document.getElementById('login-email').value; const senha = document.getElementById('login-senha').value;
    document.getElementById('btn-entrar').textContent = "Autenticando...";
    auth.signInWithEmailAndPassword(email, senha).then(() => {
        document.getElementById('login-erro').style.display = 'none'; document.getElementById('btn-entrar').textContent = "Entrar no Sistema";
    }).catch((error) => {
        document.getElementById('login-erro').textContent = "E-mail ou senha incorretos."; document.getElementById('login-erro').style.display = 'block'; document.getElementById('btn-entrar').textContent = "Entrar no Sistema";
    });
});

document.getElementById('btn-sair').addEventListener('click', async () => {
    if (temAlteracoesNaoSalvas) { const confirmarSair = await sysConfirm("Existem alterações não salvas. Sair mesmo assim?", "Aviso"); if (!confirmarSair) return; }
    auth.signOut();
});

// =========================================================
// 4. BANCO DE DADOS LOCAL E CONTEXTO
// =========================================================
const escola = {
    meses: [ 
        { id: "jan", nome: "Janeiro", ordem: 1 }, { id: "fev", nome: "Fevereiro", ordem: 2 }, 
        { id: "mar", nome: "Março", ordem: 3 }, { id: "abr", nome: "Abril", ordem: 4 }, 
        { id: "mai", nome: "Maio", ordem: 5 }, { id: "jun", nome: "Junho", ordem: 6 }, 
        { id: "jul", nome: "Julho", ordem: 7 }, { id: "ago", nome: "Agosto", ordem: 8 }, 
        { id: "set", nome: "Setembro", ordem: 9 }, { id: "out", nome: "Outubro", ordem: 10 }, 
        { id: "nov", nome: "Novembro", ordem: 11 }, { id: "dez", nome: "Dezembro", ordem: 12 } 
    ],
    polos: { 
        "polo1": { "Manhã": ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"], "Tarde": ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"] }, 
        "polo2": { "Manhã": ["Infantil IV", "Infantil V e 1º Ano", "2º Ano"], "Tarde": ["2º Ano", "3º Ano A", "3º Ano B", "4º e 5º"] } 
    },
    disciplinas: { 
        "polo1": ["Artes e Musicalização", "Ciências", "Ed. Física", "Informática", "Inglês", "Língua Portuguesa", "Literatura", "Matemática", "Robótica", "Xadrez"], 
        "polo2Base": ["Informática", "Inglês", "Matemática", "Português", "Robótica", "Xadrez"] 
    }
};

let bancoDeDados = {}; let temAlteracoesNaoSalvas = false; window.logsPendentes = []; 

function montarIDContextoTurma(polo, turno, turma) { if (!polo || !turno || !turma) return null; return `TURMA_${polo}_${turno}_${turma}`; }
function montarIDContextoDisciplina(turmaCtx, disciplina) { if (!turmaCtx || !disciplina) return null; return `DISC_${turmaCtx}_${disciplina}`; }
function getContextosAtuais() {
    const ctxTurma = montarIDContextoTurma(document.getElementById('filtro-polo').value, document.getElementById('filtro-turno').value, document.getElementById('filtro-turma').value);
    const ctxDisc = montarIDContextoDisciplina(ctxTurma, document.getElementById('filtro-disciplina').value);
    return { ctxTurma, ctxDisc };
}

// =========================================================
// 5. LÓGICA DE FILTROS E GUARDIÃO
// =========================================================
let proximaAcao = null; const modalAlerta = document.getElementById('modal-alerta-salvar');

function tentarNavegar(acao) { if (temAlteracoesNaoSalvas) { proximaAcao = acao; modalAlerta.style.display = "flex"; } else { acao(); } }
document.getElementById('btn-alerta-descartar').addEventListener('click', () => { temAlteracoesNaoSalvas = false; window.logsPendentes = []; modalAlerta.style.display = "none"; if (proximaAcao) proximaAcao(); });
document.getElementById('btn-alerta-salvar').addEventListener('click', async () => { const sucesso = await window.salvarDadosNaNuvem(); modalAlerta.style.display = "none"; if (sucesso && proximaAcao) proximaAcao(); });
window.addEventListener('beforeunload', function (e) { if (temAlteracoesNaoSalvas) { e.preventDefault(); e.returnValue = ''; } });

function configurarCascataFiltros(prefixo, temDisciplina) {
    const p = document.getElementById(`${prefixo}-polo`); const tn = document.getElementById(`${prefixo}-turno`); 
    const tm = document.getElementById(`${prefixo}-turma`); const d = temDisciplina ? document.getElementById(`${prefixo}-disciplina`) : null;
    const mes = document.getElementById('filtro-mes'); 

    p.addEventListener('change', function() { 
        tentarNavegar(() => { 
            if(tn) { tn.innerHTML = '<option value="">Turno...</option>'; tn.disabled = true; }
            if(tm) { tm.innerHTML = '<option value="">Turma...</option>'; tm.disabled = true; }
            if(d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
            if(mes) { mes.selectedIndex = 0; mes.disabled = true; } 
            if(!p.value) { carregarEAtualizarInterface(); return; } 
            if(tn) { tn.appendChild(new Option("Manhã", "Manhã")); tn.appendChild(new Option("Tarde", "Tarde")); tn.disabled = false; }
            carregarEAtualizarInterface(); 
        }); 
    });
    
    if(tn) {
        tn.addEventListener('change', function() { 
            tentarNavegar(() => { 
                if(tm) { tm.innerHTML = '<option value="">Turma...</option>'; tm.disabled = true; }
                if(d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
                if(mes) { mes.selectedIndex = 0; mes.disabled = true; }
                const polo = p.value; const turno = tn.value; 
                if (!turno) { carregarEAtualizarInterface(); return; } 
                let turmasDoTurno = escola.polos[polo][turno];
                if (usuarioPermissoes?.perfil === 'professor') {
                    const permitidas = Object.keys(usuarioPermissoes.acessos[polo]?.[turno] || {});
                    turmasDoTurno = turmasDoTurno.filter(t => permitidas.includes(t));
                }
                if(tm) { turmasDoTurno.forEach(t => tm.appendChild(new Option(t, t))); tm.disabled = false; }
                carregarEAtualizarInterface(); 
            }); 
        });
    }
    
    if(tm) {
        tm.addEventListener('change', function() { 
            tentarNavegar(() => { 
                if(d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
                if(mes) { mes.selectedIndex = 0; mes.disabled = true; }
                if(!d) { carregarEAtualizarInterface(); return; } 
                const polo = p.value; const turno = tn.value; const turma = tm.value; 
                if (!turma) { carregarEAtualizarInterface(); return; } 
                let discps = polo === 'polo1' ? escola.disciplinas.polo1 : [...escola.disciplinas.polo2Base]; 
                if (polo === 'polo2') { 
                    if (turma.includes('Infantil') || turma.includes('1º Ano')) discps.push("Psicomotricidade"); else discps.push("Jogos de Oposição"); 
                    discps.sort(); 
                } 
                if (usuarioPermissoes?.perfil === 'professor') {
                    const permitidas = usuarioPermissoes.acessos[polo]?.[turno]?.[turma] || [];
                    discps = discps.filter(disciplina => permitidas.includes(disciplina));
                }
                discps.forEach(x => d.appendChild(new Option(x, x))); d.disabled = false; carregarEAtualizarInterface(); 
            }); 
        });
    }

    if (d) { d.addEventListener('change', () => { tentarNavegar(() => { if (mes) { if (d.value) { mes.disabled = false; } else { mes.selectedIndex = 0; mes.disabled = true; } } carregarEAtualizarInterface(); }); }); }
}

function configurarCascataDestino(prefixo, temDisciplina) {
    const p = document.getElementById(`${prefixo}-polo`); const tn = document.getElementById(`${prefixo}-turno`);
    const tm = document.getElementById(`${prefixo}-turma`); const d = temDisciplina ? document.getElementById(`${prefixo}-disciplina`) : null;
    if(!p) return;

    p.addEventListener('change', function() {
        if(tn) { tn.innerHTML = '<option value="">Turno...</option>'; tn.disabled = true; }
        if(tm) { tm.innerHTML = '<option value="">Turma...</option>'; tm.disabled = true; }
        if(d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
        if (!p.value) return;
        if(tn) { tn.appendChild(new Option("Manhã", "Manhã")); tn.appendChild(new Option("Tarde", "Tarde")); tn.disabled = false; }
    });

    if(tn) { tn.addEventListener('change', function() {
        if(tm) { tm.innerHTML = '<option value="">Turma...</option>'; tm.disabled = true; }
        if(d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
        const polo = p.value; const turno = tn.value; if (!turno) return;
        let turmasDoTurno = escola.polos[polo][turno];
        if (usuarioPermissoes?.perfil === 'professor') {
            const permitidas = Object.keys(usuarioPermissoes.acessos[polo]?.[turno] || {});
            turmasDoTurno = turmasDoTurno.filter(t => permitidas.includes(t));
        }
        if(tm) { turmasDoTurno.forEach(t => tm.appendChild(new Option(t, t))); tm.disabled = false; }
    }); }

    if(tm) { tm.addEventListener('change', function() {
        if (d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
        if (!d) return;
        const polo = p.value; const turno = tn.value; const turma = tm.value; if (!turma) return;
        let discps = polo === 'polo1' ? escola.disciplinas.polo1 : [...escola.disciplinas.polo2Base];
        if (polo === 'polo2') {
            if (turma.includes('Infantil') || turma.includes('1º Ano')) discps.push("Psicomotricidade"); else discps.push("Jogos de Oposição"); discps.sort();
        }
        if (usuarioPermissoes?.perfil === 'professor') {
            const permitidas = usuarioPermissoes.acessos[polo]?.[turno]?.[turma] || [];
            discps = discps.filter(disciplina => permitidas.includes(disciplina));
        }
        discps.forEach(x => d.appendChild(new Option(x, x))); d.disabled = false;
    }); }
}

function carregarEAtualizarInterface() {
    const { ctxTurma, ctxDisc } = getContextosAtuais();
    const painelLegenda = document.getElementById('painel-legenda');
    if (painelLegenda) painelLegenda.style.display = ctxDisc ? "flex" : "none";

    const selMesLocal = document.getElementById('filtro-mes');
    if (selMesLocal) selMesLocal.disabled = !ctxDisc;

    const botoes = ['btn-salvar', 'btn-toggle-mes'];
    if (ctxDisc) { 
        window.logsPendentes = []; 
        botoes.forEach(id => { const btn = document.getElementById(id); if (btn) btn.disabled = false; }); 
        carregarDadosDaNuvem(ctxTurma, ctxDisc); 
    } else { 
        botoes.forEach(id => { const btn = document.getElementById(id); if (btn) btn.disabled = true; }); 
        document.getElementById('cabecalho-tabela').innerHTML = "<tr><th>Nome do Estudante</th></tr>"; 
        document.getElementById('corpo-tabela').innerHTML = ""; 
    }
}

configurarCascataFiltros('filtro', true); 
configurarCascataDestino('dest-hab', true); 
configurarCascataDestino('dest-alu-copiar', false); 
configurarCascataDestino('dest-alu-mover', false);
configurarCascataDestino('hab-edit', true); 
configurarCascataDestino('grafico', true);  

const domEditDisc = document.getElementById('hab-edit-disciplina');
const domBtnBusca = document.getElementById('btn-buscar-habs-existentes');
if (domEditDisc && domBtnBusca) { domEditDisc.addEventListener('change', () => { domBtnBusca.disabled = !domEditDisc.value; }); }

const selMes = document.getElementById('filtro-mes');
if(selMes) {
    escola.meses.forEach(m => { let opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.nome; opt.dataset.ordem = m.ordem; selMes.appendChild(opt); });
    selMes.addEventListener('change', () => tentarNavegar(carregarEAtualizarInterface));
}

// =========================================================
// 6. NUVEM E CARREGAMENTO
// =========================================================
async function carregarDadosDaNuvem(ctxTurma, ctxDisc) {
    const cab = document.getElementById('cabecalho-tabela'); const corpo = document.getElementById('corpo-tabela');
    cab.innerHTML = "<tr><th>⏳ A carregar dados da nuvem...</th></tr>"; corpo.innerHTML = "";
    try {
        const docTurma = await db.collection("turmas").doc(ctxTurma).get(); bancoDeDados[ctxTurma] = docTurma.exists ? docTurma.data() : { alunos: [] };
        const docDisc = await db.collection("disciplinas").doc(ctxDisc).get(); bancoDeDados[ctxDisc] = docDisc.exists ? docDisc.data() : { habilidades: [], mesesFechados: {}, notas: {} };
        temAlteracoesNaoSalvas = false; window.logsPendentes = []; renderizarTabela(); verificarEstadoDoMes(); 
    } catch (error) { cab.innerHTML = "<tr><th style='color: red;'>❌ Erro de conexão.</th></tr>"; }
}

window.salvarDadosNaNuvem = async function() {
    const { ctxTurma, ctxDisc } = getContextosAtuais(); const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.textContent = "⏳ A Salvar..."; btnSalvar.disabled = true;
    try {
        if (ctxTurma) await db.collection("turmas").doc(ctxTurma).set(bancoDeDados[ctxTurma]);
        if (ctxDisc) await db.collection("disciplinas").doc(ctxDisc).set(bancoDeDados[ctxDisc]);
        if(typeof registrarLog === 'function') {
            if (window.logsPendentes && window.logsPendentes.length > 0) { const acoesUnicas = [...new Set(window.logsPendentes)]; await registrarLog(`Alterações Salvas: ${acoesUnicas.join(" | ")}`); window.logsPendentes = []; } 
            else { await registrarLog(`Salvou o progresso de notas.`); }
        }
        temAlteracoesNaoSalvas = false; await sysAlert("✅ Notas e dados salvos na nuvem com sucesso!", "Sucesso"); return true; 
    } catch (e) { await sysAlert("❌ Erro ao salvar. Verifique a sua conexão.", "Erro"); return false; } finally { btnSalvar.innerHTML = "💾 Salvar Notas"; btnSalvar.disabled = false; }
}

if(document.getElementById('btn-salvar')) document.getElementById('btn-salvar').addEventListener('click', salvarDadosNaNuvem);

// =========================================================
// 7. OPÇÕES AVANÇADAS (BACKUP E RESET)
// =========================================================
const modalAvancado = document.getElementById('modal-opcoes-avancadas');
let fezBackupSeguranca = false;

if (document.getElementById('btn-abrir-opcoes-avancadas')) {
    document.getElementById('btn-abrir-opcoes-avancadas').addEventListener('click', () => { 
        document.getElementById('area-restrita-avancada').style.display = 'none'; document.getElementById('avancado-email').value = ""; 
        document.getElementById('avancado-senha').value = ""; document.getElementById('avancado-palavra').value = ""; document.getElementById('seletor-acao-avancada').value = "";
        document.getElementById('btn-confirmar-acao-avancada').disabled = true; document.getElementById('area-upload-file').style.display = 'none'; fezBackupSeguranca = false; modalAvancado.style.display = 'flex'; 
    });
    document.getElementById('btn-fechar-opcoes').addEventListener('click', () => { modalAvancado.style.display = 'none'; });
    document.getElementById('btn-executar-backup').addEventListener('click', () => { 
        const dadosConvertidos = JSON.stringify(bancoDeDados, null, 2); const blob = new Blob([dadosConvertidos], { type: "application/json" }); 
        const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `backup_AvaliaTrilhas_${new Date().toISOString().split('T')[0]}.json`; link.click(); 
        if(typeof registrarLog === 'function') registrarLog("Fez download de um backup do sistema."); fezBackupSeguranca = true; document.getElementById('area-restrita-avancada').style.display = 'block'; 
    });
    document.getElementById('seletor-acao-avancada').addEventListener('change', function() {
        const areaUpload = document.getElementById('area-upload-file'); const btn = document.getElementById('btn-confirmar-acao-avancada');
        if (this.value === "upload") { areaUpload.style.display = 'block'; btn.textContent = "🔄 Restaurar Backup na Nuvem"; btn.disabled = false; } 
        else if (this.value === "reset") { areaUpload.style.display = 'none'; btn.textContent = "☢️ DELETAR TODOS OS DADOS DA ESCOLA"; btn.disabled = false; } 
        else { areaUpload.style.display = 'none'; btn.disabled = true; }
    });
    document.getElementById('btn-confirmar-acao-avancada').addEventListener('click', async () => {
        const acao = document.getElementById('seletor-acao-avancada').value; const email = document.getElementById('avancado-email').value; const senha = document.getElementById('avancado-senha').value; const palavra = document.getElementById('avancado-palavra').value;
        if (!fezBackupSeguranca) return await sysAlert("Você precisa baixar o backup antes de prosseguir!", "Aviso");
        if (palavra !== "CONFIRMAR") return await sysAlert("A palavra de segurança deve ser CONFIRMAR exata e em maiúsculo.", "Erro");
        if (!email || !senha) return await sysAlert("Preencha o e-mail e a senha.", "Erro");
        const btn = document.getElementById('btn-confirmar-acao-avancada'); btn.textContent = "⏳ Autenticando e Processando..."; btn.disabled = true;
        try {
            await auth.signInWithEmailAndPassword(email, senha);
            if (acao === "reset") {
                const turmasSnap = await db.collection("turmas").get(); const loteT = db.batch(); turmasSnap.forEach(doc => loteT.delete(doc.ref)); await loteT.commit();
                const discSnap = await db.collection("disciplinas").get(); const loteD = db.batch(); discSnap.forEach(doc => loteD.delete(doc.ref)); await loteD.commit();
                if(typeof registrarLog === 'function') await registrarLog("Zerar Ano: Todos os dados da escola foram apagados.");
                await sysAlert("✅ SISTEMA ZERADO COM SUCESSO!", "Sucesso"); window.location.reload();
            } else if (acao === "upload") {
                const fileInput = document.getElementById('input-arquivo-backup');
                if (!fileInput.files || fileInput.files.length === 0) { btn.disabled = false; btn.textContent = "Executar Ação"; return await sysAlert("Por favor, selecione o arquivo .json do backup.", "Aviso"); }
                const file = fileInput.files[0]; const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const backupData = JSON.parse(e.target.result);
                        for (const chave in backupData) { if (chave.startsWith('TURMA_')) await db.collection("turmas").doc(chave).set(backupData[chave]); else if (chave.startsWith('DISC_')) await db.collection("disciplinas").doc(chave).set(backupData[chave]); }
                        if(typeof registrarLog === 'function') await registrarLog("Restaurou o sistema através de um arquivo de backup.");
                        await sysAlert("✅ BACKUP RESTAURADO COM SUCESSO!", "Sucesso"); window.location.reload();
                    } catch (err) { await sysAlert("❌ O arquivo não é um backup válido.", "Erro"); btn.disabled = false; btn.textContent = "Executar Ação"; }
                }; reader.readAsText(file);
            }
        } catch (e) { await sysAlert("❌ Erro de credenciais.", "Erro"); btn.textContent = "Executar Ação"; btn.disabled = false; }
    });
}

// =========================================================
// 8. SISTEMA DE ANOTAÇÕES E OCORRÊNCIAS (COM AUTO-SAVE E EDIÇÃO)
// =========================================================
let alunoAnotacaoAtual = null; window.anotacaoEditIndex = null; 

window.abrirModalAnotacoes = function(idAluno) {
    const { ctxTurma } = getContextosAtuais(); alunoAnotacaoAtual = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno); if (!alunoAnotacaoAtual) return;
    document.getElementById('titulo-modal-anotacoes').innerText = `Caderno de: ${alunoAnotacaoAtual.nome}`; document.getElementById('texto-nova-anotacao').value = ""; document.getElementById('tipo-nova-anotacao').value = "Anotação";
    atualizarListaAnotacoesVisuais(); document.getElementById('modal-anotacoes-aluno').style.display = 'flex';
}

function atualizarListaAnotacoesVisuais() {
    const container = document.getElementById('lista-anotacoes-container'); container.innerHTML = "";
    if (!alunoAnotacaoAtual.anotacoes || alunoAnotacaoAtual.anotacoes.length === 0) { container.innerHTML = "<p style='color: #666; font-size: 13px; text-align: center;'>Nenhum registro para este educando ainda.</p>"; return; }
    let html = "";
    for (let i = alunoAnotacaoAtual.anotacoes.length - 1; i >= 0; i--) {
        const nota = alunoAnotacaoAtual.anotacoes[i]; const tipoNota = nota.tipo || "Anotação"; const isOcorrencia = tipoNota === "Ocorrência"; const corBorda = isOcorrencia ? "#dc3545" : "var(--cor-primaria)"; const txtBadge = isOcorrencia ? `<b style="color:#dc3545; font-size: 10px; border: 1px solid #dc3545; padding: 1px 4px; border-radius: 3px; margin-left: 5px;">OCORRÊNCIA</b>` : "";
        html += `<div class="item-anotacao" style="border-left-color: ${corBorda};"><div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 5px;"><span class="item-anotacao-header" style="border: none; margin: 0; padding: 0;">📅 ${nota.data} | 📍 ${nota.disciplina} ${txtBadge}</span><div><button class="btn-acao-nota" onclick="editarAnotacao(${i})" title="Editar (Data, Disciplina, Tipo e Texto)">✏️</button><button class="btn-acao-nota" onclick="excluirAnotacao(${i})" title="Excluir este registro">🗑️</button></div></div><div style="white-space: pre-wrap;">${nota.texto}</div></div>`;
    }
    container.innerHTML = html;
}

window.editarAnotacao = function(indexReal) {
    const nota = alunoAnotacaoAtual.anotacoes[indexReal]; window.anotacaoEditIndex = indexReal; 
    document.getElementById('edit-anotacao-data').value = nota.data; document.getElementById('edit-anotacao-tipo').value = nota.tipo || "Anotação"; document.getElementById('edit-anotacao-texto').value = nota.texto;
    const selDisc = document.getElementById('edit-anotacao-disciplina'); selDisc.innerHTML = "";
    const polo = document.getElementById('filtro-polo').value; const turno = document.getElementById('filtro-turno').value; const turma = document.getElementById('filtro-turma').value;
    let discps = polo === 'polo1' ? escola.disciplinas.polo1 : [...escola.disciplinas.polo2Base]; 
    if (polo === 'polo2') { if (turma.includes('Infantil') || turma.includes('1º Ano')) discps.push("Psicomotricidade"); else discps.push("Jogos de Oposição"); discps.sort(); } 
    if (usuarioPermissoes?.perfil === 'professor') { const permitidas = usuarioPermissoes.acessos[polo]?.[turno]?.[turma] || []; discps = discps.filter(disciplina => permitidas.includes(disciplina)); }
    if(!discps.includes("Geral")) discps.unshift("Geral"); if(!discps.includes(nota.disciplina)) discps.push(nota.disciplina); 
    discps.forEach(d => selDisc.appendChild(new Option(d, d))); selDisc.value = nota.disciplina;
    document.getElementById('modal-editar-anotacao').style.display = 'flex';
}

if(document.getElementById('btn-cancelar-edicao-anotacao')) document.getElementById('btn-cancelar-edicao-anotacao').addEventListener('click', () => { document.getElementById('modal-editar-anotacao').style.display = 'none'; });
if(document.getElementById('btn-salvar-edicao-anotacao')) document.getElementById('btn-salvar-edicao-anotacao').addEventListener('click', async () => {
    const i = window.anotacaoEditIndex; const novaData = document.getElementById('edit-anotacao-data').value.trim(); const novaDisc = document.getElementById('edit-anotacao-disciplina').value; const novoTipo = document.getElementById('edit-anotacao-tipo').value; const novoTexto = document.getElementById('edit-anotacao-texto').value.trim();
    if (novoTexto === "" || novaData === "") return await sysAlert("Data e Descrição são campos obrigatórios.", "Aviso");
    alunoAnotacaoAtual.anotacoes[i] = { data: novaData, disciplina: novaDisc, tipo: novoTipo, texto: novoTexto }; temAlteracoesNaoSalvas = true; document.getElementById('modal-editar-anotacao').style.display = 'none'; atualizarListaAnotacoesVisuais(); renderizarTabela(); await window.salvarDadosNaNuvem();
    if(typeof registrarLog === 'function') { if(novoTipo === "Ocorrência") { registrarLog(`Editou uma Ocorrência do educando: ${alunoAnotacaoAtual.nome}.`, { isOcorrencia: true, lida: false, textoOcorrencia: novoTexto, alunoNome: alunoAnotacaoAtual.nome }); } else { registrarLog(`Editou um registro (${novoTipo}) do educando: ${alunoAnotacaoAtual.nome}.`); } }
});

window.excluirAnotacao = async function(indexReal) {
    if (await sysConfirm("Tem certeza de que deseja apagar este registro?", "Excluir Registro")) {
        alunoAnotacaoAtual.anotacoes.splice(indexReal, 1); temAlteracoesNaoSalvas = true; atualizarListaAnotacoesVisuais(); renderizarTabela(); await window.salvarDadosNaNuvem();
        if(typeof registrarLog === 'function') registrarLog(`Excluiu um registro do educando: ${alunoAnotacaoAtual.nome}.`);
    }
}

if(document.getElementById('btn-fechar-anotacoes')) document.getElementById('btn-fechar-anotacoes').addEventListener('click', () => { document.getElementById('modal-anotacoes-aluno').style.display = 'none'; alunoAnotacaoAtual = null; });
if(document.getElementById('btn-salvar-anotacao')) document.getElementById('btn-salvar-anotacao').addEventListener('click', async () => {
    const texto = document.getElementById('texto-nova-anotacao').value.trim(); const tipo = document.getElementById('tipo-nova-anotacao').value;
    if (texto === "") return await sysAlert("Escreva uma descrição antes de salvar.", "Aviso");
    const disciplinaAtual = document.getElementById('filtro-disciplina').value || "Geral"; const dataAtual = new Date().toLocaleDateString('pt-BR');
    if (!alunoAnotacaoAtual.anotacoes) alunoAnotacaoAtual.anotacoes = [];
    alunoAnotacaoAtual.anotacoes.push({ data: dataAtual, disciplina: disciplinaAtual, tipo: tipo, texto: texto }); temAlteracoesNaoSalvas = true; document.getElementById('texto-nova-anotacao').value = ""; document.getElementById('tipo-nova-anotacao').value = "Anotação"; atualizarListaAnotacoesVisuais(); renderizarTabela(); await window.salvarDadosNaNuvem(); 
    if(typeof registrarLog === 'function') { if(tipo === "Ocorrência") { registrarLog(`Registrou uma Ocorrência para o educando: ${alunoAnotacaoAtual.nome}.`, { isOcorrencia: true, lida: false, textoOcorrencia: texto, alunoNome: alunoAnotacaoAtual.nome }); } else { registrarLog(`Registrou uma Anotação Pedagógica para o educando: ${alunoAnotacaoAtual.nome}.`); } }
});

// =========================================================
// 9. GERADOR DE PROMPT IA
// =========================================================
window.gerarPromptIA = async function(idAluno, btnElement) {
    const { ctxTurma } = getContextosAtuais(); const aluno = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno);
    const legendas = { "0": "Não aplicável", "1": "Não desenvolvida", "2": "Em desenvolvimento", "3": "Em consolidação", "4": "Consolidada", "5": "Em destaque" }; const nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const textoOriginal = btnElement.innerText; btnElement.innerText = "⏳ Buscando..."; btnElement.disabled = true;

    try { const querySnapshot = await db.collection("disciplinas").where(firebase.firestore.FieldPath.documentId(), '>=', `DISC_${ctxTurma}_`).where(firebase.firestore.FieldPath.documentId(), '<=', `DISC_${ctxTurma}_\uf8ff`).get(); querySnapshot.forEach((doc) => { bancoDeDados[doc.id] = doc.data(); }); } catch(e) { console.error(e); }

    let prompt = `Atue como um coordenador pedagógico e redija um relatório avaliativo descritivo em parágrafos, em tom profissional e acolhedor, para os responsáveis do(a) estudante ${aluno.nome}.\n\nAbaixo está o histórico de progressão do educando ao longo dos meses nas disciplinas avaliadas:\n\n`; let encontrouDados = false;

    Object.keys(bancoDeDados).forEach(key => {
        if (key.startsWith(`DISC_${ctxTurma}_`)) {
            const nomeDisciplina = key.replace(`DISC_${ctxTurma}_`, ''); const discData = bancoDeDados[key]; const notasAluno = discData.notas[idAluno];
            if (notasAluno) {
                let discTemNotas = false; let txtDisciplina = `📍 **${nomeDisciplina.toUpperCase()}**\n`;
                discData.habilidades.forEach(hab => {
                    const notasHab = notasAluno[hab.id];
                    if (notasHab) {
                        const mesesAvaliados = Object.keys(notasHab).map(Number).sort((a,b) => a - b); let notasAdicionadas = [];
                        mesesAvaliados.forEach(mes => { const val = notasHab[mes]; if(val !== "-1" && val !== undefined) notasAdicionadas.push(`${nomesMeses[mes]}: ${legendas[val]}`); });
                        if(notasAdicionadas.length > 0) { txtDisciplina += `- Habilidade: "${hab.texto}"\n  Evolução: ${notasAdicionadas.join(" ➔ ")}\n`; discTemNotas = true; encontrouDados = true; }
                    }
                }); if(discTemNotas) prompt += txtDisciplina + "\n";
            }
        }
    });

    if(!encontrouDados) prompt += "(Ainda não há avaliações quantitativas registradas no sistema.)\n\n";
    if (aluno.anotacoes && aluno.anotacoes.length > 0) { prompt += `\nAlém das notas, considere as seguintes ANOTAÇÕES QUALITATIVAS feitas pelos professores no dia a dia:\n`; aluno.anotacoes.forEach(nota => { prompt += `📝 [Data: ${nota.data} | Disciplina: ${nota.disciplina}] -> "${nota.texto}"\n`; }); prompt += `\n⚠️ INSTRUÇÃO IMPORTANTE: Reescreva essas observações adequando-as para a devida FORMALIDADE PEDAGÓGICA exigida em um relatório oficial para os pais.\n\n`; }
    prompt += `Elabore um texto fluido que resuma as conquistas, identifique pontos de maior progresso e sugira onde a família pode auxiliar em casa. Não invente dados fictícios.`;
    navigator.clipboard.writeText(prompt).then(async () => { await sysAlert("🤖 Prompt copiado com sucesso!", "Sucesso"); }).catch(async () => { await sysAlert("Erro ao copiar para a área de transferência.", "Erro"); }); btnElement.innerText = textoOriginal; btnElement.disabled = false;
}

// =========================================================
// 10. EDIÇÃO RÁPIDA E DOSSIÊ (ALUNO)
// =========================================================
window.editarNomeAluno = async function(idAluno) {
    const { ctxTurma } = getContextosAtuais(); const aluno = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno); if (!aluno) return;
    const nomeAntigo = aluno.nome; const novoNome = await sysPrompt("Edite o nome do educando:", aluno.nome, "Editar Estudante");
    if (novoNome !== null && novoNome.trim() !== "" && novoNome.trim() !== nomeAntigo) { aluno.nome = novoNome.trim(); temAlteracoesNaoSalvas = true; if(window.logsPendentes) window.logsPendentes.push(`Alterou o nome de um educando (${nomeAntigo} ➔ ${aluno.nome})`); renderizarTabela(); }
}

window.abrirDossieAluno = async function(idAluno) {
    const { ctxTurma } = getContextosAtuais(); const aluno = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno); if(!aluno) return;
    const modal = document.getElementById('modal-dossie-aluno'); const conteudo = document.getElementById('conteudo-dossie');
    document.getElementById('titulo-dossie').innerText = `Ficha do Estudante: ${aluno.nome}`; document.getElementById('btn-ia-ficha').setAttribute('onclick', `gerarPromptIA(${aluno.id}, this)`);
    conteudo.innerHTML = "<p style='text-align:center; padding: 20px;'>⏳ Buscando informações no banco de dados...</p>"; modal.style.display = "flex";

    try { const querySnapshot = await db.collection("disciplinas").where(firebase.firestore.FieldPath.documentId(), '>=', `DISC_${ctxTurma}_`).where(firebase.firestore.FieldPath.documentId(), '<=', `DISC_${ctxTurma}_\uf8ff`).get(); querySnapshot.forEach((doc) => { bancoDeDados[doc.id] = doc.data(); }); } catch(e) { console.error("Erro ao buscar disciplinas para a ficha:", e); }

    const legendas = { "0": "Não aplicável", "1": "Não desenvolvida", "2": "Em desenvolvimento", "3": "Em consolidação", "4": "Consolidada", "5": "Em destaque" };
    let html = `<div style="margin-bottom: 20px;"><h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">📊 Progresso Acadêmico (Últimas Avaliações)</h3>`; let temNotas = false;

    Object.keys(bancoDeDados).forEach(key => {
        if (key.startsWith(`DISC_${ctxTurma}_`)) {
            const nomeDisc = key.replace(`DISC_${ctxTurma}_`, ''); const discData = bancoDeDados[key]; const notasAluno = discData.notas[idAluno];
            if(notasAluno) {
                let htmlDisc = `<div style="margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background: #fafafa;"><h4 style="margin: 0 0 10px 0; color: var(--cor-primaria); text-transform: uppercase;">${nomeDisc}</h4><ul style="margin: 0; padding-left: 5px; font-size: 14px; list-style-type: none;">`; 
                let discTemHabs = false;
                discData.habilidades.forEach(hab => {
                    const notasHab = notasAluno[hab.id];
                    if(notasHab) {
                        const meses = Object.keys(notasHab).map(Number).sort((a,b) => b - a); 
                        for(let m of meses) {
                            if(notasHab[m] !== "-1" && notasHab[m] !== undefined) {
                                htmlDisc += `<li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;"><span class="bolinha cor-${notasHab[m]}" style="margin-top: 4px; flex-shrink: 0; display: inline-block;"></span><div><span style="color: #333;">${hab.texto}</span><br><span style="color: #555; font-size: 12px;">➔ Última avaliação: <b style="color: var(--cor-primaria);">${legendas[notasHab[m]]}</b></span></div></li>`;
                                discTemHabs = true; temNotas = true; break; 
                            }
                        }
                    }
                }); htmlDisc += `</ul></div>`; if(discTemHabs) html += htmlDisc;
            }
        }
    });

    if(!temNotas) html += `<p style="font-size: 13px; color: #666; font-style: italic;">Ainda não há avaliações quantitativas registradas no sistema.</p>`; html += `</div>`;
    let anotacoesComuns = []; let ocorrencias = []; if (aluno.anotacoes && aluno.anotacoes.length > 0) { aluno.anotacoes.forEach(nota => { if (nota.tipo === "Ocorrência") ocorrencias.push(nota); else anotacoesComuns.push(nota); }); }

    html += `<div style="margin-top: 20px; border-top: 2px dashed #ddd; padding-top: 15px;"><h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">📝 Anotações Pedagógicas</h3>`;
    if (anotacoesComuns.length > 0) { for (let i = anotacoesComuns.length - 1; i >= 0; i--) { const nota = anotacoesComuns[i]; html += `<div class="bloco-registro-dossie" style="background: white; border-left: 4px solid var(--cor-secundaria); padding: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: relative;"><button class="btn-ocultar-print no-print" onclick="this.parentElement.classList.toggle('oculto-impressao'); this.innerText = this.parentElement.classList.contains('oculto-impressao') ? '👁️ Revelar na impressão' : '🙈 Esconder na impressão';" title="Esconder isso ao imprimir a ficha">🙈 Esconder na impressão</button><p style="font-size: 12px; color: #666; margin: 0 0 5px 0; padding-right: 70px;">📅 <b>${nota.data}</b> | 📍 ${nota.disciplina}</p><p style="font-size: 14px; margin: 0; white-space: pre-wrap; color: #333;">${nota.texto}</p></div>`; } } 
    else { html += `<p style="font-size: 13px; color: #666; font-style: italic;">Nenhuma anotação pedagógica registrada.</p>`; } html += `</div>`;

    html += `<div style="margin-top: 20px; border-top: 2px dashed #ddd; padding-top: 15px;"><h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">⚠️ Ocorrências Disciplinares</h3>`;
    if (ocorrencias.length > 0) { for (let i = ocorrencias.length - 1; i >= 0; i--) { const nota = ocorrencias[i]; html += `<div class="bloco-registro-dossie" style="background: white; border-left: 4px solid var(--cor-borda); padding: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: relative;"><button class="btn-ocultar-print no-print" onclick="this.parentElement.classList.toggle('oculto-impressao'); this.innerText = this.parentElement.classList.contains('oculto-impressao') ? '👁️ Revelar na impressão' : '🙈 Esconder na impressão';" title="Esconder isso ao imprimir a ficha">👁️ Imprimir</button><p style="font-size: 12px; color: #666; margin: 0 0 5px 0; padding-right: 70px;">📅 <b>${nota.data}</b> | 📍 ${nota.disciplina}</p><p style="font-size: 14px; margin: 0; white-space: pre-wrap; color: #333;">${nota.texto}</p></div>`; } } 
    else { html += `<p style="font-size: 13px; color: #666; font-style: italic;">Nenhuma ocorrência disciplinar registrada.</p>`; } html += `</div>`;

    conteudo.innerHTML = html;
};

window.imprimirDossie = function() {
    const conteudo = document.getElementById('conteudo-dossie').innerHTML; const titulo = document.getElementById('titulo-dossie').innerText; const janelaImpressao = window.open('', '', 'width=900,height=650');
    janelaImpressao.document.write(`<html><head><title>${titulo}</title><style>* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.5; } h1 { text-align: center; border-bottom: 3px solid #333; padding-bottom: 10px; margin-bottom: 30px; text-transform: uppercase; } h3 { color: #000; margin-top: 30px; } ul { list-style-type: none; padding-left: 0; } .bolinha { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1px solid #333; } .cor-0 { background-color: #9e9e9e; } .cor-1 { background-color: #dc3545; } .cor-2 { background-color: #d39e00; } .cor-3 { background-color: #28a745; } .cor-4 { background-color: #007bff; } .cor-5 { background-color: #6f42c1; } .oculto-impressao { display: none !important; } @media print { .no-print { display: none; } }</style></head><body><h1>${titulo}</h1>${conteudo}<script>setTimeout(() => { window.print(); window.close(); }, 500);<\/script></body></html>`); janelaImpressao.document.close();
}

// =========================================================
// 11. TABELA PRINCIPAL (NOTAS E VISIBILIDADE)
// =========================================================
window.salvarNotaTemporaria = function(idAluno, idHab, sel) { 
    const { ctxDisc } = getContextosAtuais(); const m = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    if (!bancoDeDados[ctxDisc].notas[idAluno]) bancoDeDados[ctxDisc].notas[idAluno] = {}; 
    if (!bancoDeDados[ctxDisc].notas[idAluno][idHab]) bancoDeDados[ctxDisc].notas[idAluno][idHab] = {}; 
    const val = sel.value; bancoDeDados[ctxDisc].notas[idAluno][idHab][m] = val; temAlteracoesNaoSalvas = true; 
    if(window.logsPendentes) window.logsPendentes.push(`Lançamento/Alteração de nota(s) na tabela`);
    sel.className = 'seletor-nota'; if(val !== "-1") sel.classList.add(`cor-${val}`); 
}

window.alternarVisibilidadeHab = function(idHab) { const { ctxDisc } = getContextosAtuais(); const hab = bancoDeDados[ctxDisc].habilidades.find(h => h.id === idHab); if (hab) { hab.oculta = !hab.oculta; renderizarTabela(); } }
window.alternarTodasHabilidades = function() { const { ctxDisc } = getContextosAtuais(); const m = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); const habs = bancoDeDados[ctxDisc].habilidades.filter(h => h.ordemMes <= m); if (habs.length === 0) return; let todas = habs.every(h => h.oculta); habs.forEach(h => h.oculta = !todas); renderizarTabela(); }
window.alternarDesistente = function(id) { const { ctxTurma } = getContextosAtuais(); const a = bancoDeDados[ctxTurma].alunos.find(x => x.id === id); if(a) { a.desistente = !a.desistente; temAlteracoesNaoSalvas = true; if(window.logsPendentes) window.logsPendentes.push(`Marcou educando ${a.nome} como ${a.desistente ? 'Desistente' : 'Ativo'}`); renderizarTabela(); } }

window.renderizarTabela = function() {
    const { ctxTurma, ctxDisc } = getContextosAtuais(); const mesAtual = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem) || parseInt(selMes.value);
    if(!bancoDeDados[ctxTurma] || !bancoDeDados[ctxDisc]) { document.getElementById('corpo-tabela').innerHTML = '<tr><td style="text-align: center; padding: 20px; color: #999;">Sem dados para exibir. Certifique-se de que a disciplina possui habilidades.</td></tr>'; return; }

    const habsAtivas = bancoDeDados[ctxDisc].habilidades.filter(h => { if (h.mesInicio && h.mesFim) return mesAtual >= h.mesInicio && mesAtual <= h.mesFim; if (h.ordemMes) return h.ordemMes <= mesAtual; return true; });
    let theadComHabs = `<tr><th>Nome do Estudante</th>`;
    
    habsAtivas.forEach((hab, idx) => {
        if(hab.oculta) { theadComHabs += `<th title="${hab.texto}" style="text-align:center; min-width: 50px;">H${idx + 1} <button class="btn-visibilidade" onclick="alternarVisibilidadeHab(${hab.id})">➕</button></th>`; } 
        else {
            theadComHabs += `<th style="min-width: 190px; max-width: 200px;">
                <div class="cabecalho-hab" style="max-width: 180px;"><span style="font-size: 12px; font-weight: bold;">Hab. ${idx + 1}</span><div style="display: flex; gap: 4px; align-items: center;"><button onclick="editarTextoHabilidade(${hab.id})" title="Editar texto" style="background: none; border: none; cursor: pointer; font-size: 11px; padding: 2px; opacity: 0.6; transition: 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">✏️</button><button onclick="moverHabilidade(${hab.id}, -1)" title="Para a esquerda" style="background: none; border: none; cursor: pointer; font-size: 10px; color: #999; padding: 2px; transition: 0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">◀</button><button onclick="moverHabilidade(${hab.id}, 1)" title="Para a direita" style="background: none; border: none; cursor: pointer; font-size: 10px; color: #999; padding: 2px; transition: 0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#999'">▶</button><button class="btn-visibilidade" onclick="alternarVisibilidadeHab(${hab.id})" title="Ocultar coluna">➖</button></div></div>
                <div class="texto-hab" title="${hab.texto}" style="max-width: 180px;">${hab.texto}</div></th>`;
        }
    });
    
    if (habsAtivas.length > 0) { let txt = habsAtivas.every(h => h.oculta) ? "➕ Mostrar Todas" : "➖ Ocultar Todas"; theadComHabs += `<th style="text-align:center; vertical-align: middle; min-width: 140px;"><button class="btn-visibilidade" style="margin: 0; padding: 6px 12px; font-weight: bold; background-color: var(--cor-secundaria);" onclick="alternarTodasHabilidades()">${txt}</button></th>`; }
    theadComHabs += "</tr>"; document.getElementById('cabecalho-tabela').innerHTML = theadComHabs;

    let alunosOrdenados = [...bancoDeDados[ctxTurma].alunos.filter(a => (a.mesEntrada || 1) <= mesAtual)].sort((a, b) => { if (a.desistente === b.desistente) return a.nome.localeCompare(b.nome); return a.desistente ? 1 : -1; });
    let tbodyHTML = "";
    
    alunosOrdenados.forEach((aluno) => {
        let classLinha = aluno.desistente ? "linha-desistente" : ""; let btnDes = aluno.desistente ? "Desfazer" : "Desistente";
        let iconeAnotacao = (aluno.anotacoes && aluno.anotacoes.length > 0) ? "📝" : "📄"; let titleAnotacao = (aluno.anotacoes && aluno.anotacoes.length > 0) ? "Ver Anotações" : "Criar Anotação";
        tbodyHTML += `<tr class="${classLinha}"><td><div class="celula-aluno"><span class="nome-texto nome-link" onclick="abrirDossieAluno(${aluno.id})" title="Ficha do educando">${aluno.nome}</span><div class="acoes-aluno"><button class="btn-editar-nome" onclick="editarNomeAluno(${aluno.id})">✏️</button><button class="btn-anotacao" onclick="abrirModalAnotacoes(${aluno.id})" title="${titleAnotacao}">${iconeAnotacao}</button><button class="btn-desistente" onclick="alternarDesistente(${aluno.id})">${btnDes}</button></div></div></td>`;

        habsAtivas.forEach(hab => {
            let val = "-1"; let hist = bancoDeDados[ctxDisc].notas[aluno.id]?.[hab.id];
            if (hist) { for (let m = mesAtual; m >= 1; m--) { if (hist[m] !== undefined && hist[m] !== "-1") { val = hist[m]; break; } } }
            if (aluno.desistente) { tbodyHTML += `<td style="text-align:center;">-</td>`; } 
            else if (hab.oculta) { tbodyHTML += `<td style="text-align:center;">${val !== "-1" ? `<span class="bolinha cor-${val}"></span>` : "-"}</td>`; } 
            else {
                let cor = val !== "-1" ? `cor-${val}` : "";
                tbodyHTML += `<td><select class="seletor-nota ${cor}" onchange="salvarNotaTemporaria(${aluno.id}, ${hab.id}, this)"><option value="-1" ${val === "-1" ? "selected" : ""}>-</option><option value="0" ${val === "0" ? "selected" : ""}>0 - Não aplicável</option><option value="1" ${val === "1" ? "selected" : ""}>1 - Não desenvolvida</option><option value="2" ${val === "2" ? "selected" : ""}>2 - Em desenvolvimento</option><option value="3" ${val === "3" ? "selected" : ""}>3 - Em consolidação</option><option value="4" ${val === "4" ? "selected" : ""}>4 - Consolidada</option><option value="5" ${val === "5" ? "selected" : ""}>5 - Em destaque</option></select></td>`;
            }
        });
        if (habsAtivas.length > 0) tbodyHTML += `<td></td>`; tbodyHTML += "</tr>";
    });
    document.getElementById('corpo-tabela').innerHTML = tbodyHTML;
}

if(document.getElementById('btn-toggle-mes')) document.getElementById('btn-toggle-mes').addEventListener('click', async function() { 
    const { ctxDisc } = getContextosAtuais(); const mesId = selMes.value; const discNome = document.getElementById('filtro-disciplina').value;
    if (!bancoDeDados[ctxDisc].mesesFechados[mesId]) { 
        if (await sysConfirm(`Fechar o mês? O salvamento na nuvem será feito agora.`, "Atenção")) { bancoDeDados[ctxDisc].mesesFechados[mesId] = true; verificarEstadoDoMes(); const salvo = await window.salvarDadosNaNuvem(); if (!salvo) { bancoDeDados[ctxDisc].mesesFechados[mesId] = false; verificarEstadoDoMes(); } else { if(typeof registrarLog === 'function') registrarLog(`Fechou o mês ${mesId} para a disciplina ${discNome}.`); } } 
    } else { 
        if (await sysConfirm(`Reabrir o mês? O salvamento na nuvem será feito agora.`, "Atenção")) { bancoDeDados[ctxDisc].mesesFechados[mesId] = false; verificarEstadoDoMes(); const salvo = await window.salvarDadosNaNuvem(); if (!salvo) { bancoDeDados[ctxDisc].mesesFechados[mesId] = true; verificarEstadoDoMes(); } else { if(typeof registrarLog === 'function') registrarLog(`Reabriu o mês ${mesId} para a disciplina ${discNome}.`); } } 
    } 
});

function verificarEstadoDoMes() { 
    const { ctxDisc } = getContextosAtuais(); const area = document.querySelector('.area-tabela'); const btn = document.getElementById('btn-toggle-mes'); const seletorMes = document.getElementById('filtro-mes');
    if (bancoDeDados[ctxDisc] && bancoDeDados[ctxDisc].mesesFechados[seletorMes.value]) { area.classList.add('tabela-bloqueada'); btn.textContent = "🔓 Reabrir Mês"; btn.style.backgroundColor = "#28a745"; } 
    else { area.classList.remove('tabela-bloqueada'); btn.textContent = "🔒 Fechar Mês"; btn.style.backgroundColor = ""; } 
    if (bancoDeDados[ctxDisc]) {
        for (let i = 0; i < seletorMes.options.length; i++) {
            const opt = seletorMes.options[i]; const mesId = opt.value;
            if (bancoDeDados[ctxDisc].mesesFechados[mesId]) { opt.style.color = "#999"; opt.style.backgroundColor = "#f8f9fa"; if (!opt.text.includes("🔒")) opt.text = opt.text + " 🔒"; } 
            else { opt.style.color = "#000"; opt.style.backgroundColor = "#fff"; opt.text = opt.text.replace(" 🔒", ""); }
        }
    }
}

// =========================================================
// 12. MODAIS DE NEGÓCIO (GERENCIAMENTO DE ALUNOS E HABS)
// =========================================================
window.mudarAbaAlu = function(a) { 
    ['add', 'copiar', 'mover', 'excluir'].forEach(aba => { document.getElementById(`aba-alu-${aba}`).style.display = a === aba ? 'block' : 'none'; document.getElementById(`tab-alu-${aba}`).className = a === aba ? 'tab-btn ativa' : 'tab-btn'; });
    if (a !== 'add') { 
        const { ctxTurma } = getContextosAtuais(); const lh = document.getElementById(`lista-checkbox-alu-${a}`); lh.innerHTML = ""; 
        bancoDeDados[ctxTurma].alunos.forEach(al => { lh.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${al.id}" id="c_${a}_${al.id}"> <label for="c_${a}_${al.id}">${al.nome}</label></div>`; }); 
        if(bancoDeDados[ctxTurma].alunos.length === 0) lh.innerHTML="<p>Nenhum educando cadastrado.</p>"; 
    } 
}

const mAlu = document.getElementById('modal-gerenciar-alu'); 
if(document.getElementById('btn-modal-alu-cancelar')) document.getElementById('btn-modal-alu-cancelar').addEventListener('click', () => { mAlu.style.display = "none"; });
if(document.getElementById('btn-modal-alu-confirmar')) document.getElementById('btn-modal-alu-confirmar').addEventListener('click', async () => { 
    const { ctxTurma } = getContextosAtuais(); const mOrd = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    const isAdd = document.getElementById('tab-alu-add').classList.contains('ativa'); const isCopiar = document.getElementById('tab-alu-copiar').classList.contains('ativa'); const isMover = document.getElementById('tab-alu-mover').classList.contains('ativa'); const isExcluir = document.getElementById('tab-alu-excluir').classList.contains('ativa'); 
    
    if (isAdd) { 
        const l = document.getElementById('texto-add-alu').value.split('\n').map(x => x.trim()).filter(x => x !== ""); 
        if (l.length > 0) { temAlteracoesNaoSalvas = true; l.forEach(n => bancoDeDados[ctxTurma].alunos.push({ id: Date.now() + Math.random(), nome: n, desistente: false, mesEntrada: mOrd, anotacoes: [] })); if(window.logsPendentes) window.logsPendentes.push(`Adicionou educando(s) à turma: ${l.join(', ')}`); }
    } else if (isExcluir) { 
        const c = document.querySelectorAll('#lista-checkbox-alu-excluir input:checked'); if (c.length === 0) return await sysAlert("Selecione pelo menos um educando.", "Aviso"); 
        if(await sysConfirm("Excluir definitivamente?", "Cuidado")) { 
            let nomesRemovidos = [];
            c.forEach(x => { const alunoRem = bancoDeDados[ctxTurma].alunos.find(a => a.id === parseFloat(x.value)); if(alunoRem) nomesRemovidos.push(alunoRem.nome); bancoDeDados[ctxTurma].alunos = bancoDeDados[ctxTurma].alunos.filter(a => a.id !== parseFloat(x.value)); }); 
            temAlteracoesNaoSalvas = true; if(window.logsPendentes) window.logsPendentes.push(`Excluiu educando(s): ${nomesRemovidos.join(', ')}`);
        } else return; 
    } else if (isCopiar || isMover) { 
        const prefixo = isCopiar ? 'copiar' : 'mover'; const c = document.querySelectorAll(`#lista-checkbox-alu-${prefixo} input:checked`); if (c.length === 0) return await sysAlert("Selecione pelo menos um educando.", "Aviso"); 
        const dPolo = document.getElementById(`dest-alu-${prefixo}-polo`).value; const dTurno = document.getElementById(`dest-alu-${prefixo}-turno`).value; const dTurma = document.getElementById(`dest-alu-${prefixo}-turma`).value;
        const dCtx = montarIDContextoTurma(dPolo, dTurno, dTurma); if (!dCtx || dCtx === ctxTurma) return await sysAlert("Destino inválido.", "Erro"); 
        
        let dd = { alunos: [] }; const doc = await db.collection("turmas").doc(dCtx).get(); if (doc.exists) dd = doc.data(); 
        let nomesTransferidos = [];
        c.forEach(x => { const obj = bancoDeDados[ctxTurma].alunos.find(a => a.id === parseFloat(x.value)); if (obj) { nomesTransferidos.push(obj.nome); dd.alunos.push({ id: Date.now() + Math.random(), nome: obj.nome, desistente: false, mesEntrada: mOrd, anotacoes: obj.anotacoes || [] }); if (isMover) bancoDeDados[ctxTurma].alunos = bancoDeDados[ctxTurma].alunos.filter(a => a.id !== obj.id); } }); 
        await db.collection("turmas").doc(dCtx).set(dd); temAlteracoesNaoSalvas = true; 
        const tipoMov = isMover ? "Transferiu" : "Copiou"; if(window.logsPendentes) window.logsPendentes.push(`${tipoMov} educando(s) para a turma: ${dTurma}`);
    } 
    mAlu.style.display = "none"; renderizarTabela(); 
});

window.mudarAbaHab = function(a) { 
    document.getElementById('aba-hab-add').style.display = a === 'add' ? 'block' : 'none'; document.getElementById('aba-hab-copiar').style.display = a === 'copiar' ? 'block' : 'none'; document.getElementById('aba-hab-excluir').style.display = a === 'excluir' ? 'block' : 'none'; document.getElementById('tab-hab-add').className = a === 'add' ? 'tab-btn ativa' : 'tab-btn'; document.getElementById('tab-hab-copiar').className = a === 'copiar' ? 'tab-btn ativa' : 'tab-btn'; document.getElementById('tab-hab-excluir').className = a === 'excluir' ? 'tab-btn ativa' : 'tab-btn'; 
    const { ctxDisc } = getContextosAtuais(); const m = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); const habs = bancoDeDados[ctxDisc].habilidades.filter(h => h.ordemMes <= m); 
    if(a === 'copiar') { const l = document.getElementById('lista-checkbox-habs-copiar'); l.innerHTML = ""; habs.forEach(h => { l.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${h.id}" id="hc_${h.id}" checked> <label for="hc_${h.id}">${h.texto}</label></div>`; }); if(habs.length === 0) l.innerHTML="<p>Vazio</p>"; } 
    else if(a === 'excluir') { const l = document.getElementById('lista-checkbox-habs-excluir'); l.innerHTML = ""; habs.forEach(h => { l.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${h.id}" id="he_${h.id}"> <label for="he_${h.id}">${h.texto}</label></div>`; }); if(habs.length === 0) l.innerHTML="<p>Vazio</p>"; } 
}

const mHab = document.getElementById('modal-gerenciar-hab'); 
if(document.getElementById('btn-modal-hab-confirmar')) document.getElementById('btn-modal-hab-confirmar').addEventListener('click', async () => { 
    const { ctxDisc } = getContextosAtuais(); const isAbaAdd = document.getElementById('tab-hab-add').classList.contains('ativa'); const isAbaCopiar = document.getElementById('tab-hab-copiar').classList.contains('ativa'); const mOrd = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); const mNom = selMes.options[selMes.selectedIndex].text; 
    if (isAbaAdd) { 
        const l = document.getElementById('texto-add-hab').value.split('\n').map(x => x.trim()).filter(x => x !== ""); 
        if (l.length > 0) { temAlteracoesNaoSalvas = true; l.forEach(x => bancoDeDados[ctxDisc].habilidades.push({ id: Date.now() + Math.random(), texto: x, ordemMes: mOrd, nomeMes: mNom, oculta: false })); if(window.logsPendentes) window.logsPendentes.push(`Adicionou ${l.length} nova(s) habilidade(s)`); }
    } else if (isAbaCopiar) { 
        const dCtx = montarIDContextoDisciplina(montarIDContextoTurma(document.getElementById('dest-hab-polo').value, document.getElementById('dest-hab-turno').value, document.getElementById('dest-hab-turma').value), document.getElementById('dest-hab-disciplina').value); if (!dCtx || dCtx === ctxDisc) return await sysAlert("Destino inválido.", "Erro"); 
        const c = document.querySelectorAll('#lista-checkbox-habs-copiar input:checked'); if (c.length === 0) return await sysAlert("Selecione pelo menos uma habilidade.", "Aviso"); 
        let dd = { habilidades: [], mesesFechados: {}, notas: {} }; const doc = await db.collection("disciplinas").doc(dCtx).get(); if (doc.exists) dd = doc.data(); 
        c.forEach(x => { const h = bancoDeDados[ctxDisc].habilidades.find(y => y.id === parseFloat(x.value)); if(h) dd.habilidades.push({ id: Date.now() + Math.random(), texto: h.texto, ordemMes: mOrd, nomeMes: mNom, oculta: false }); }); 
        await db.collection("disciplinas").doc(dCtx).set(dd); if(typeof registrarLog === 'function') registrarLog(`Copiou habilidades para a turma ${document.getElementById('dest-hab-turma').value}.`); await sysAlert("Copiado pra nuvem!", "Sucesso"); 
    } else { 
        const c = document.querySelectorAll('#lista-checkbox-habs-excluir input:checked'); if (c.length === 0) return await sysAlert("Selecione pelo menos uma habilidade.", "Aviso"); 
        if(await sysConfirm("Excluir definitivamente?", "Cuidado")) { c.forEach(x => { bancoDeDados[ctxDisc].habilidades = bancoDeDados[ctxDisc].habilidades.filter(h => h.id !== parseFloat(x.value)); }); temAlteracoesNaoSalvas = true; if(window.logsPendentes) window.logsPendentes.push(`Excluiu habilidade(s)`); } else return; 
    } 
    mHab.style.display = "none"; renderizarTabela(); 
});

window.moverHabilidade = function(idHab, direcao) {
    const { ctxDisc } = getContextosAtuais(); if (!bancoDeDados[ctxDisc] || !bancoDeDados[ctxDisc].habilidades) return;
    const habs = bancoDeDados[ctxDisc].habilidades; const index = habs.findIndex(h => h.id === idHab); if (index < 0) return;
    if (direcao === -1 && index > 0) { const temp = habs[index]; habs[index] = habs[index - 1]; habs[index - 1] = temp; } 
    else if (direcao === 1 && index < habs.length - 1) { const temp = habs[index]; habs[index] = habs[index + 1]; habs[index + 1] = temp; } else { return; }
    temAlteracoesNaoSalvas = true; if(window.logsPendentes) window.logsPendentes.push(`Reordenou a posição de uma habilidade`); renderizarTabela();
}

window.editarTextoHabilidade = async function(idHab) {
    const { ctxDisc } = getContextosAtuais(); const hab = bancoDeDados[ctxDisc].habilidades.find(h => h.id === idHab); if (!hab) return;
    const novoTexto = await sysPrompt("Edite o texto da habilidade:", hab.texto, "Editar Habilidade", true);
    if (novoTexto !== null && novoTexto.trim() !== "" && novoTexto.trim() !== hab.texto) { hab.texto = novoTexto.trim(); temAlteracoesNaoSalvas = true; if(window.logsPendentes) window.logsPendentes.push(`Editou o texto de uma habilidade`); renderizarTabela(); }
}

// =========================================================
// 13. SISTEMA DE NOTIFICAÇÕES (SINO E CADERNO PESSOAL)
// =========================================================
let unsubscribeNotificacoes = null; let ultimaAuditoriaSnap = [];
window.iniciarOuvinteNotificacoes = function() {
    if (!usuarioPermissoes || !auth.currentUser) return;
    document.getElementById('container-sino').style.display = 'flex'; document.getElementById('btn-caderno-prof').style.display = 'block';
    if (unsubscribeNotificacoes) unsubscribeNotificacoes(); carregarMeuCaderno(); const db = firebase.firestore();
    unsubscribeNotificacoes = db.collection("sistema").doc("auditoria").onSnapshot((doc) => { if (doc.exists) ultimaAuditoriaSnap = doc.data().registros || []; window.forcarAtualizacaoSino(); });
}

window.forcarAtualizacaoSino = function() {
    if (!usuarioPermissoes || !auth.currentUser) return;
    const emailTratado = auth.currentUser.email.trim().toLowerCase(); const meuNomeUsuario = emailTratado.split('@')[0];
    const isCoord = usuarioPermissoes.perfil === 'admin' || usuarioPermissoes.perfil === 'coordenacao'; let notificacoesAtivas = [];
    if (isCoord) { notificacoesAtivas = ultimaAuditoriaSnap.filter(r => r.isOcorrencia && !r.lida); } else { notificacoesAtivas = ultimaAuditoriaSnap.filter(r => r.isOcorrencia && r.lida && r.usuario === meuNomeUsuario && !r.cienteProf); }
    const hoje = new Date().toISOString().split('T')[0]; const lembretes = (window.meuCaderno || []).filter(n => n.dataLembrete && n.dataLembrete <= hoje && !n.concluido);
    lembretes.forEach(l => { notificacoesAtivas.push({ isLembrete: true, idAnotacao: l.id, categoria: l.categoria, texto: l.texto, dataLembrete: l.dataLembrete }); });
    atualizarSino(notificacoesAtivas, isCoord);
}

function atualizarSino(notifs, isCoord) {
    const badge = document.getElementById('badge-sino'); const lista = document.getElementById('lista-notificacoes');
    if (notifs.length > 0) { badge.innerText = notifs.length; badge.style.display = 'inline-block'; } else { badge.style.display = 'none'; }
    if (notifs.length === 0) { lista.innerHTML = '<div style="padding: 15px; text-align: center; color: #999; font-size: 13px;">Nenhuma notificação pendente</div>'; return; }
    let html = "";
    notifs.forEach(n => {
        if (n.isLembrete) { html += `<div class="notificacao-item" style="border-left: 4px solid #ffc107;" onclick="abrirMeuCaderno()"><span style="font-weight:bold; color:#d39e00;">⏰ Lembrete: ${n.categoria}</span><span style="color:#555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px;">${n.texto}</span><span style="font-size:11px; color:#999;">Agendado para hoje ou atrasado</span></div>`; } 
        else if (isCoord) { html += `<div class="notificacao-item n-coordenacao" onclick="abrirOcorrenciaPeloLog(${n.timestamp})"><span style="font-weight:bold; color:#dc3545;">⚠️ Nova Ocorrência</span><span style="color:#555; font-size: 12px;">Estudante: <b>${n.alunoNome}</b></span><span style="font-size:11px; color:#999;">Enviado por: ${n.usuario} em ${n.data}</span></div>`; } 
        else { html += `<div class="notificacao-item n-professor" onclick="marcarCienteProfessor(${n.timestamp})"><span style="font-weight:bold; color:#28a745;">✔️ Ocorrência Lida</span><span style="color:#555; font-size: 12px;">A coordenação leu a ocorrência de <b>${n.alunoNome}</b>.</span><span style="font-size:11px; color:#999;">Clique para dispensar aviso</span></div>`; }
    });
    lista.innerHTML = html;
}

window.marcarCienteProfessor = async function(timestamp) {
    try { const db = firebase.firestore(); const docRef = db.collection("sistema").doc("auditoria"); const docSnap = await docRef.get(); if (docSnap.exists) { let histNuvem = docSnap.data().registros; let index = histNuvem.findIndex(l => l.timestamp === timestamp); if (index !== -1) { histNuvem[index].cienteProf = true; await docRef.set({ registros: histNuvem }); document.getElementById('dropdown-notificacoes').style.display = 'none'; } } } catch (e) { console.error(e); }
}

if(document.getElementById('container-sino')) document.getElementById('container-sino').addEventListener('click', (e) => { const dropdown = document.getElementById('dropdown-notificacoes'); if(e.target.closest('.notificacoes-dropdown') && !e.target.closest('.notificacao-item')) return; dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; });

window.meuCaderno = [];
window.carregarMeuCaderno = async function() { if (!auth.currentUser) return; const nomeUsuario = auth.currentUser.email.trim().toLowerCase().split('@')[0]; try { const db = firebase.firestore(); const doc = await db.collection("sistema").doc("caderno_" + nomeUsuario).get(); if (doc.exists) { window.meuCaderno = doc.data().anotacoes || []; } else { window.meuCaderno = []; } window.forcarAtualizacaoSino(); } catch(e) { console.error(e); } }
window.abrirMeuCaderno = function() { document.getElementById('modal-caderno-prof').style.display = 'flex'; document.getElementById('dropdown-notificacoes').style.display = 'none'; renderizarCadernoProf(); }

window.renderizarCadernoProf = function() {
    const filtro = document.getElementById('filtro-categoria-caderno').value; const lista = document.getElementById('lista-caderno-prof'); lista.innerHTML = "";
    let filtradas = window.meuCaderno; if (filtro) filtradas = filtradas.filter(n => n.categoria === filtro); filtradas.sort((a,b) => (a.concluido === b.concluido) ? b.id - a.id : (a.concluido ? 1 : -1));
    if (filtradas.length === 0) { lista.innerHTML = "<p style='text-align:center; color:#999; font-size: 13px; margin-top: 20px;'>Nenhuma anotação encontrada.</p>"; return; }
    filtradas.forEach(n => {
        const opacity = n.concluido ? "0.6" : "1"; const textDec = n.concluido ? "line-through" : "none"; const dataFormatada = new Date(n.id).toLocaleDateString('pt-BR');
        const dataLemStr = n.dataLembrete ? `<br><b style="color:#d35400;">⏰ Lembrete: ${n.dataLembrete.split('-').reverse().join('/')}</b>` : ""; const alvoStr = n.contexto !== 'Geral' && n.alvo ? ` | 🎯 ${n.contexto}: ${n.alvo}` : "";
        lista.innerHTML += `
            <div style="background: white; border: 1px solid var(--cor-borda); border-left: 4px solid var(--cor-primaria); border-radius: 4px; padding: 10px; margin-bottom: 10px; opacity: ${opacity}; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 5px;"><span style="font-size: 11px; color: #666; font-weight: bold;">[${n.categoria}] ${dataFormatada} ${alvoStr}</span><div style="flex-shrink: 0;"><button onclick="alternarStatusCaderno(${n.id})" title="Marcar como Concluído/Pendente" style="background:none; border:none; cursor:pointer; font-size: 14px;">${n.concluido ? '✅' : '⬜'}</button><button onclick="excluirItemCaderno(${n.id})" title="Excluir Definitivamente" style="background:none; border:none; cursor:pointer; font-size: 14px; opacity: 0.7;">🗑️</button></div></div>
                <div style="font-size: 13px; color: #333; text-decoration: ${textDec}; white-space: pre-wrap;">${n.texto}</div><div style="font-size: 11px; margin-top: 5px;">${dataLemStr}</div>
            </div>`;
    });
}

if(document.getElementById('btn-salvar-caderno')) document.getElementById('btn-salvar-caderno').addEventListener('click', async () => {
    const cat = document.getElementById('caderno-nova-categoria').value; const ctx = document.getElementById('caderno-novo-contexto').value; const alvo = document.getElementById('caderno-novo-alvo').value.trim(); const dataLem = document.getElementById('caderno-nova-data').value; const texto = document.getElementById('caderno-novo-texto').value.trim();
    if (texto === "") return await sysAlert("A anotação não pode estar vazia.", "Aviso"); if (ctx !== 'Geral' && alvo === "") return await sysAlert(`Por favor, especifique qual ${ctx.toLowerCase()} é o alvo desta anotação.`, "Aviso");
    const nova = { id: Date.now(), categoria: cat, contexto: ctx, alvo: alvo, dataLembrete: dataLem, texto: texto, concluido: false }; window.meuCaderno.unshift(nova); 
    document.getElementById('caderno-novo-texto').value = ""; document.getElementById('caderno-nova-data').value = ""; document.getElementById('caderno-novo-alvo').value = "";
    renderizarCadernoProf(); await salvarCadernoNuvem(); window.forcarAtualizacaoSino(); 
});

window.alternarStatusCaderno = async function(id) { const item = window.meuCaderno.find(n => n.id === id); if(item) { item.concluido = !item.concluido; renderizarCadernoProf(); await salvarCadernoNuvem(); window.forcarAtualizacaoSino(); } }
window.excluirItemCaderno = async function(id) { if(await sysConfirm("Apagar esta anotação do seu caderno pessoal?", "Excluir")) { window.meuCaderno = window.meuCaderno.filter(n => n.id !== id); renderizarCadernoProf(); await salvarCadernoNuvem(); window.forcarAtualizacaoSino(); } }
async function salvarCadernoNuvem() { const btn = document.getElementById('btn-salvar-caderno'); const oldText = btn.innerText; btn.innerText = "⏳ Salvando..."; btn.disabled = true; try { const db = firebase.firestore(); const nomeUsuario = auth.currentUser.email.trim().toLowerCase().split('@')[0]; await db.collection("sistema").doc("caderno_" + nomeUsuario).set({ anotacoes: window.meuCaderno }); } catch(e) { console.error(e); await sysAlert("Erro ao salvar o caderno na nuvem."); } btn.innerText = oldText; btn.disabled = false; }

// =========================================================
// 14. PESQUISA GLOBAL E DIRETÓRIO
// =========================================================
(function() {
    const btnPesquisa = document.getElementById('btn-visao-pesquisa'); const telaPesquisa = document.getElementById('tela-pesquisa'); const inputPesquisa = document.getElementById('input-pesquisa-aluno'); const listaResultados = document.getElementById('lista-resultados-pesquisa');
    let todosAlunosCache = []; let bancoSincronizado = false;

    if(btnPesquisa) { btnPesquisa.addEventListener('click', () => { if (!bancoSincronizado) sincronizarBancoDeAlunos(); else renderizarDiretorioCompleto(); setTimeout(() => inputPesquisa.focus(), 100); }); }

    async function sincronizarBancoDeAlunos() {
        try {
            const snapshot = await firebase.firestore().collection('turmas').get(); let alunosEncontrados = [];
            snapshot.forEach(doc => {
                const ctxTurma = doc.id; const partes = ctxTurma.split('_'); if(partes.length < 4) return;
                const polo = partes[1]; const turno = partes[2]; const turma = partes[3]; let temAcesso = false;
                if (!usuarioPermissoes || usuarioPermissoes.perfil === 'admin' || usuarioPermissoes.perfil === 'coordenacao') { temAcesso = true; } else if (usuarioPermissoes.perfil === 'professor') { if (usuarioPermissoes.acessos && usuarioPermissoes.acessos[polo] && usuarioPermissoes.acessos[polo][turno] && usuarioPermissoes.acessos[polo][turno][turma]) { temAcesso = true; } }
                if (temAcesso) {
                    const dados = doc.data(); if(typeof bancoDeDados !== 'undefined') bancoDeDados[ctxTurma] = dados; 
                    const alunos = dados.alunos || []; alunos.forEach(a => { alunosEncontrados.push({ id: a.id, nome: a.nome, desistente: a.desistente || false, anotacoes: a.anotacoes || [], ctxTurma: ctxTurma, poloStr: polo === 'polo1' ? 'Polo 1' : 'Polo 2', turnoStr: turno, turmaStr: turma }); });
                }
            });
            todosAlunosCache = alunosEncontrados.sort((a,b) => a.nome.localeCompare(b.nome)); bancoSincronizado = true; renderizarDiretorioCompleto();
        } catch(e) { console.error(e); if(listaResultados) listaResultados.innerHTML = "<p style='text-align:center; color:#dc3545;'>Erro ao sincronizar base. Verifique sua internet.</p>"; }
    }

    window.toggleCollapseDir = function(elemento, displayType) { const conteudo = elemento.nextElementSibling; const seta = elemento.querySelector('.seta-collapse'); if (!conteudo) return; if (conteudo.style.display === 'none' || conteudo.style.display === '') { conteudo.style.display = displayType; if(seta) seta.innerText = '▲'; } else { conteudo.style.display = 'none'; if(seta) seta.innerText = '▼'; } }
    document.addEventListener('click', (e) => { if (!e.target.closest('.dropdown-acoes-aluno')) { document.querySelectorAll('.dropdown-menu-aluno').forEach(menu => menu.style.display = 'none'); } });
    window.toggleDropdownAluno = function(btn) { document.querySelectorAll('.dropdown-menu-aluno').forEach(menu => { if (menu !== btn.nextElementSibling) menu.style.display = 'none'; }); const menu = btn.nextElementSibling; menu.style.display = menu.style.display === 'none' ? 'flex' : 'none'; }

    window.renderizarDiretorioCompleto = function() {
        if (todosAlunosCache.length === 0) { listaResultados.innerHTML = "<p style='text-align:center; color:#999;'>Nenhum educando encontrado.</p>"; return; }
        let arvore = {};
        todosAlunosCache.forEach(a => { if(!arvore[a.poloStr]) arvore[a.poloStr] = {}; if(!arvore[a.poloStr][a.turnoStr]) arvore[a.poloStr][a.turnoStr] = {}; if(!arvore[a.poloStr][a.turnoStr][a.turmaStr]) arvore[a.poloStr][a.turnoStr][a.turmaStr] = []; arvore[a.poloStr][a.turnoStr][a.turmaStr].push(a); });
        let html = ""; const polosOrdenados = Object.keys(arvore).sort();
        
        polosOrdenados.forEach(polo => {
            html += `<div class="dir-polo" style="margin-bottom: 25px; border: 1px solid var(--cor-primaria); border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); overflow: visible !important;">
                        <h3 onclick="toggleCollapseDir(this, 'block')" style="background: var(--cor-primaria); color: white; margin: 0; padding: 12px 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 7px; border-top-right-radius: 7px;"><span>🏫 ${polo}</span><span class="seta-collapse" style="font-size: 14px;">▼</span></h3>
                        <div class="conteudo-polo" style="display: none;">`; 
            const turnosOrdenados = Object.keys(arvore[polo]).sort();
            turnosOrdenados.forEach(turno => {
                html += `   <div class="dir-turno" style="padding: 15px; border-top: 1px solid #ddd; background: #f8f9fa; overflow: visible !important;">
                                <h4 onclick="toggleCollapseDir(this, 'block')" style="margin: 0 0 15px 0; color: #d35400; font-size: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"><span>☀️ Turno: ${turno}</span><span class="seta-collapse" style="font-size: 14px;">▼</span></h4>
                                <div class="conteudo-turno" style="display: none;">`; 
                const turmasOrdenadas = Object.keys(arvore[polo][turno]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
                turmasOrdenadas.forEach(turma => {
                    html += `       <div class="dir-turma" style="margin-left: 10px; margin-bottom: 20px;">
                                        <h5 onclick="toggleCollapseDir(this, 'grid')" style="margin: 0 0 10px 0; color: #333; border-bottom: 2px solid #ccc; padding-bottom: 5px; font-size: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"><span>🎓 Turma: ${turma}</span><span class="seta-collapse" style="font-size: 12px;">▼</span></h5>
                                        <div class="dir-grid-alunos conteudo-turma" style="display: none; gap: 10px;">`; 
                    arvore[polo][turno][turma].forEach(aluno => {
                        const cartaoEstilo = aluno.desistente ? "background-color: #f8d7da; border-left-color: #dc3545;" : "background-color: white;";
                        const nomeEstilo = aluno.desistente ? "text-decoration: line-through; color: #dc3545;" : "color: #0056b3;";
                        const tag = aluno.desistente ? "<span style='background:#dc3545; color:white; padding:2px 6px; border-radius:4px; font-size:10px; margin-left:10px;'>Desistente</span>" : "";
                        const txtBtn = aluno.desistente ? "🔄 Reativar" : "🛑 Desistente";
                        const nomeBusca = aluno.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        const iconeAnotacao = (aluno.anotacoes && aluno.anotacoes.length > 0) ? "📝" : "📄";
                        
                        html += `           <div class="cartao-pesquisa cartao-aluno-dir" data-nome="${nomeBusca}" style="${cartaoEstilo}; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;" onmouseenter="this.style.zIndex='10'" onmouseleave="this.style.zIndex='1'">
                                                <div class="cartao-pesquisa-info"><h4 onclick="acionarDossieGlobal('${aluno.id}', '${aluno.ctxTurma}')" class="nome-link" style="margin:0; font-size:15px; cursor:pointer; ${nomeEstilo}" title="Ver Ficha do Educando">${aluno.nome} ${tag}</h4></div>
                                                <div class="cartao-pesquisa-acoes" style="display: flex; gap: 10px; align-items: center;">
                                                    <button onclick="acionarRenomearGlobal('${aluno.id}', '${aluno.ctxTurma}')" style="background:none; border:none; cursor:pointer; font-size:16px; padding:2px; opacity:0.7; transition:0.2s;" title="Renomear" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">✏️</button>
                                                    <button onclick="acionarAnotacaoGlobal('${aluno.id}', '${aluno.ctxTurma}')" style="background:none; border:none; cursor:pointer; font-size:16px; padding:2px; opacity:0.7; transition:0.2s;" title="Caderno de Anotações" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">${iconeAnotacao}</button>
                                                    <div class="dropdown-acoes-aluno" style="position: relative;">
                                                        <button class="btn-secundario" onclick="toggleDropdownAluno(this)" style="padding: 2px 8px; font-size: 16px; background: white; border: 1px solid #ddd; border-radius: 4px;" title="Ações">⋮</button>
                                                        <div class="dropdown-menu-aluno" style="display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #ddd; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 4px; z-index: 9999; min-width: 140px; flex-direction: column; overflow: hidden;">
                                                            <button onclick="acionarMoverGlobal('${aluno.id}', '${aluno.ctxTurma}')" style="padding: 10px; text-align: left; border: none; background: white; cursor: pointer; border-bottom: 1px solid #eee; font-size: 13px; color: #333; width: 100%; transition: 0.2s;" onmouseover="this.style.backgroundColor='#e9ecef'" onmouseout="this.style.backgroundColor='white'">➡️ Mover Turma</button>
                                                            <button onclick="acionarDesistenteGlobal('${aluno.id}', '${aluno.ctxTurma}')" style="padding: 10px; text-align: left; border: none; background: white; cursor: pointer; border-bottom: 1px solid #eee; font-size: 13px; color: #333; width: 100%; transition: 0.2s;" onmouseover="this.style.backgroundColor='#e9ecef'" onmouseout="this.style.backgroundColor='white'">${txtBtn}</button>
                                                            <button onclick="acionarExcluirGlobal('${aluno.id}', '${aluno.ctxTurma}')" style="padding: 10px; text-align: left; border: none; background: #fff5f5; cursor: pointer; font-size: 13px; color: #dc3545; font-weight: bold; width: 100%; transition: 0.2s;" onmouseover="this.style.backgroundColor='#ffeaea'" onmouseout="this.style.backgroundColor='#fff5f5'">🗑️ Excluir</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>`;
                    });
                    html += `</div></div>`;
                });
                html += `</div></div>`;
            });
            html += `</div></div>`;
        });
        listaResultados.innerHTML = html; if(inputPesquisa.value.trim().length > 0) processarPesquisa();
    }

    if(inputPesquisa) inputPesquisa.addEventListener('input', () => { if(bancoSincronizado) processarPesquisa(); });

    function processarPesquisa() {
        const termoSemAcento = inputPesquisa.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const isBuscando = termoSemAcento !== ""; let resultadosVisiveis = 0;
        document.querySelectorAll('.cartao-aluno-dir').forEach(c => { const nome = c.getAttribute('data-nome'); if (!isBuscando || nome.includes(termoSemAcento)) { c.style.display = 'flex'; resultadosVisiveis++; } else { c.style.display = 'none'; } });
        const niveisDePasta = [ { classePai: '.dir-turma', classeConteudo: '.conteudo-turma', displayTipo: 'grid', classeFilhoBusca: '.cartao-aluno-dir' }, { classePai: '.dir-turno', classeConteudo: '.conteudo-turno', displayTipo: 'block', classeFilhoBusca: '.dir-turma' }, { classePai: '.dir-polo', classeConteudo: '.conteudo-polo', displayTipo: 'block', classeFilhoBusca: '.dir-turno' } ];
        niveisDePasta.forEach(nivel => { document.querySelectorAll(nivel.classePai).forEach(pasta => {
            const temConteudoVisivel = Array.from(pasta.querySelectorAll(nivel.classeFilhoBusca)).some(el => el.style.display !== 'none'); pasta.style.display = temConteudoVisivel ? 'block' : 'none';
            const conteudoInterno = pasta.querySelector(nivel.classeConteudo); const seta = pasta.querySelector('.seta-collapse');
            if (conteudoInterno) { if (isBuscando && temConteudoVisivel) { conteudoInterno.style.display = nivel.displayTipo; if(seta) seta.innerText = '▲'; } else if (!isBuscando) { conteudoInterno.style.display = 'none'; if(seta) seta.innerText = '▼'; } }
        }); });
        let msg = document.getElementById('msg-nenhum-encontrado'); if (resultadosVisiveis === 0 && isBuscando) { if (!msg) listaResultados.insertAdjacentHTML('beforeend', `<p id="msg-nenhum-encontrado" style='text-align:center; color:#dc3545; padding: 20px; font-weight: bold;'>Nenhum educando encontrado com o nome "${inputPesquisa.value}".</p>`); } else { if (msg) msg.remove(); }
    }

    window.acionarRenomearGlobal = async function(idAluno, ctxTurma) { prepararContextoGlobal(ctxTurma); if (typeof editarNomeAluno === 'function') { await editarNomeAluno(parseFloat(idAluno)); sincronizarBancoDeAlunos(); } else sysAlert("Função de renomear não encontrada.", "Aviso"); }
    window.acionarAnotacaoGlobal = function(idAluno, ctxTurma) { prepararContextoGlobal(ctxTurma); if (typeof abrirModalAnotacoes === 'function') abrirModalAnotacoes(parseFloat(idAluno)); else sysAlert("Função de caderno não encontrada.", "Aviso"); }
    window.acionarDossieGlobal = function(idAluno, ctxTurma) { prepararContextoGlobal(ctxTurma); if (typeof abrirDossieAluno === 'function') abrirDossieAluno(parseFloat(idAluno)); else sysAlert("Função de ficha não encontrada.", "Aviso"); }

    window.acionarDesistenteGlobal = async function(idAluno, ctxTurma) {
        const id = parseFloat(idAluno); prepararContextoGlobal(ctxTurma);
        try {
            const db = firebase.firestore(); const docRef = db.collection('turmas').doc(ctxTurma); const doc = await docRef.get();
            if (doc.exists) { let dados = doc.data(); let aluno = dados.alunos.find(a => a.id === id); if (aluno) { aluno.desistente = !aluno.desistente; await docRef.update({ alunos: dados.alunos }); if (typeof bancoDeDados !== 'undefined') bancoDeDados[ctxTurma] = dados; if (typeof registrarLog === 'function') registrarLog(`Alterou status de ${aluno.nome} para ${aluno.desistente ? 'Desistente' : 'Ativo'} via Diretório.`); sincronizarBancoDeAlunos(); } }
        } catch (e) { console.error(e); sysAlert("Erro ao atualizar status de desistência."); }
    }

    window.acionarExcluirGlobal = async function(idAluno, ctxTurma) {
        const id = parseFloat(idAluno); prepararContextoGlobal(ctxTurma); const alunoNome = todosAlunosCache.find(a => a.id === id)?.nome || "este educando";
        const confirmacao = await sysConfirm(`ATENÇÃO: Deseja excluir DEFINITIVAMENTE o(a) estudante "${alunoNome}"?\n\nIsso removerá todos os dados e notas vinculados a este ID.`, "Exclusão Definitiva"); if (!confirmacao) return;
        try {
            const db = firebase.firestore(); const docRef = db.collection('turmas').doc(ctxTurma); const doc = await docRef.get();
            if (doc.exists) { let dados = doc.data(); const novosAlunos = dados.alunos.filter(a => a.id !== id); await docRef.update({ alunos: novosAlunos }); if (typeof registrarLog === 'function') registrarLog(`EXCLUIU DEFINITIVAMENTE o educando: ${alunoNome}`); sysAlert(`O educando ${alunoNome} foi removido com sucesso.`); sincronizarBancoDeAlunos(); }
        } catch (e) { console.error(e); sysAlert("Erro ao excluir o educando."); }
    }

    window.acionarMoverGlobal = async function(idAluno, ctxOrigem) {
        const id = parseFloat(idAluno); const aluno = todosAlunosCache.find(a => a.id === id); if (!aluno) return;
        if (!document.getElementById('modal-mover-aluno-dir')) {
            const modalHTML = `
                <div id="modal-mover-aluno-dir" class="modal-overlay" style="z-index: 100008; display: none;">
                    <div class="modal-box" style="max-width: 400px; overflow: visible;">
                        <h2 style="margin-top:0; color:var(--cor-primaria);">➡️ Mover Educando</h2>
                        <p style="font-size: 13px; color: #666; margin-bottom: 5px;">Movendo: <strong id="nome-aluno-mover" style="color: #333; font-size: 15px;"></strong></p>
                        <p style="font-size: 12px; color: #999; margin-bottom: 20px;">Atual: <span id="turma-atual-mover"></span></p>
                        <label style="font-size: 12px; font-weight: bold;">Polo Destino:</label><select id="mover-dir-polo" class="input-login"><option value="">Selecione...</option><option value="polo1">Polo 1</option><option value="polo2">Polo 2</option></select>
                        <label style="font-size: 12px; font-weight: bold;">Turno Destino:</label><select id="mover-dir-turno" class="input-login" disabled><option value="">Selecione...</option></select>
                        <label style="font-size: 12px; font-weight: bold;">Turma Destino:</label><select id="mover-dir-turma" class="input-login" disabled><option value="">Selecione...</option></select>
                        <div class="modal-acoes" style="margin-top: 20px;"><button class="btn-secundario" onclick="document.getElementById('modal-mover-aluno-dir').style.display='none'">Cancelar</button><button class="btn-primario" id="btn-confirmar-mover-dir" style="background-color: #0056b3;">Confirmar Mudança</button></div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const sPolo = document.getElementById('mover-dir-polo'); const sTurno = document.getElementById('mover-dir-turno'); const sTurma = document.getElementById('mover-dir-turma');
            sPolo.addEventListener('change', () => { sTurno.innerHTML = '<option value="">Selecione...</option>'; sTurno.disabled = true; sTurma.innerHTML = '<option value="">Selecione...</option>'; sTurma.disabled = true; if(sPolo.value) { sTurno.appendChild(new Option("Manhã", "Manhã")); sTurno.appendChild(new Option("Tarde", "Tarde")); sTurno.disabled = false; } });
            sTurno.addEventListener('change', () => { sTurma.innerHTML = '<option value="">Selecione...</option>'; sTurma.disabled = true; if(sTurno.value) { escola.polos[sPolo.value][sTurno.value].forEach(t => sTurma.appendChild(new Option(t, t))); sTurma.disabled = false; } });
        }
        document.getElementById('nome-aluno-mover').innerText = aluno.nome; document.getElementById('turma-atual-mover').innerText = `${aluno.poloStr} | ${aluno.turnoStr} | ${aluno.turmaStr}`; document.getElementById('modal-mover-aluno-dir').style.display = 'flex';
        const btnConfirmar = document.getElementById('btn-confirmar-mover-dir'); const novoBtn = btnConfirmar.cloneNode(true); btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
        novoBtn.addEventListener('click', async () => {
            const sPolo = document.getElementById('mover-dir-polo').value; const sTurno = document.getElementById('mover-dir-turno').value; const sTurma = document.getElementById('mover-dir-turma').value;
            if(!sPolo || !sTurno || !sTurma) return sysAlert("Preencha todos os campos de destino da turma."); const ctxDestino = `TURMA_${sPolo}_${sTurno}_${sTurma}`;
            if(ctxOrigem === ctxDestino) { sysAlert("A turma de destino é a mesma que a turma atual."); return document.getElementById('modal-mover-aluno-dir').style.display='none'; }
            const confirmacao = await sysConfirm(`Tem certeza que deseja mover ${aluno.nome} definitivamente para a turma ${sTurma}?`); if(!confirmacao) return;
            novoBtn.disabled = true; novoBtn.innerText = "Movendo...";
            try {
                const db = firebase.firestore(); const docOrigem = await db.collection("turmas").doc(ctxOrigem).get(); const docDestino = await db.collection("turmas").doc(ctxDestino).get();
                let alunosOrigem = docOrigem.exists ? docOrigem.data().alunos : []; let alunosDestino = docDestino.exists ? docDestino.data().alunos : [];
                const indexOrigem = alunosOrigem.findIndex(a => a.id === id); if(indexOrigem === -1) throw new Error("Aluno não encontrado na base de origem.");
                const dadosAluno = alunosOrigem.splice(indexOrigem, 1)[0]; alunosDestino.push(dadosAluno);
                await db.collection("turmas").doc(ctxOrigem).update({ alunos: alunosOrigem }); await db.collection("turmas").doc(ctxDestino).set({ alunos: alunosDestino }, { merge: true });
                if(typeof bancoDeDados !== 'undefined') { if(bancoDeDados[ctxOrigem]) bancoDeDados[ctxOrigem].alunos = alunosOrigem; if(bancoDeDados[ctxDestino]) bancoDeDados[ctxDestino].alunos = alunosDestino; }
                if(typeof registrarLog === 'function') registrarLog(`Moveu educando ${aluno.nome} da turma ${ctxOrigem} para ${ctxDestino}`);
                document.getElementById('modal-mover-aluno-dir').style.display = 'none'; sysAlert("Educando transferido de turma com sucesso!"); sincronizarBancoDeAlunos();
            } catch(e) { console.error(e); sysAlert("Ocorreu um erro crítico ao mover o educando."); } finally { novoBtn.disabled = false; novoBtn.innerText = "Confirmar Mudança"; }
        });
    }

    window.prepararContextoGlobal = function(ctxTurma) {
        const partes = ctxTurma.split('_'); const selPolo = document.getElementById('filtro-polo'); const selTurno = document.getElementById('filtro-turno'); const selTurma = document.getElementById('filtro-turma');
        if(selPolo && selTurno && selTurma) { selPolo.value = partes[1]; selTurno.innerHTML = `<option value="${partes[2]}">${partes[2]}</option>`; selTurno.value = partes[2]; selTurno.disabled = false; selTurma.innerHTML = `<option value="${partes[3]}">${partes[3]}</option>`; selTurma.value = partes[3]; selTurma.disabled = false; selTurma.dispatchEvent(new Event('change')); }
    }
})();

// =========================================================
// 15. MÓDULO DE GESTÃO CURRICULAR E INCLUSÃO LOTE/RETROATIVO
// =========================================================
(function() {
    const poloLote = document.getElementById('hab-lote-polo'); const turnoLote = document.getElementById('hab-lote-turno'); const listaLote = document.getElementById('lista-checkbox-destinos-hab'); const btnSalvarLote = document.getElementById('btn-salvar-hab-lote');
    if(poloLote && poloLote.options.length <= 1) { poloLote.appendChild(new Option("Polo 1", "polo1")); poloLote.appendChild(new Option("Polo 2", "polo2")); document.getElementById('hab-lote-mes-inicio').innerHTML = '<option value="1">Jan</option><option value="2" selected>Fev</option><option value="3">Mar</option><option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option><option value="7">Jul</option><option value="8">Ago</option><option value="9">Set</option><option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>'; document.getElementById('hab-lote-mes-fim').innerHTML = '<option value="1">Jan</option><option value="2">Fev</option><option value="3">Mar</option><option value="4">Abr</option><option value="5">Mai</option><option value="6">Jun</option><option value="7" selected>Jul</option><option value="8">Ago</option><option value="9">Set</option><option value="10">Out</option><option value="11">Nov</option><option value="12">Dez</option>'; }
    if(poloLote) poloLote.addEventListener('change', () => { turnoLote.innerHTML = '<option value="">Turno...</option>'; turnoLote.disabled = true; listaLote.innerHTML = '<p>Selecione o Turno.</p>'; if (!poloLote.value) return; turnoLote.appendChild(new Option("Manhã", "Manhã")); turnoLote.appendChild(new Option("Tarde", "Tarde")); turnoLote.disabled = false; });
    if(turnoLote) turnoLote.addEventListener('change', () => {
        if (!turnoLote.value) return; listaLote.innerHTML = '<p>⏳ Carregando disciplinas...</p>'; let html = '';
        escola.polos[poloLote.value][turnoLote.value].forEach(turma => {
            let disciplinas = poloLote.value === 'polo1' ? escola.disciplinas.polo1 : [...escola.disciplinas.polo2Base];
            if (poloLote.value === 'polo2') { if (turma.includes('Infantil') || turma.includes('1º Ano')) disciplinas.push("Psicomotricidade"); else disciplinas.push("Jogos de Oposição"); }
            let permitidas = usuarioPermissoes?.perfil === 'professor' ? disciplinas.filter(d => (usuarioPermissoes.acessos[poloLote.value]?.[turnoLote.value]?.[turma] || []).includes(d)) : disciplinas;
            if (permitidas.length > 0) { html += `<div><strong>${turma}</strong><div style="display:grid; grid-template-columns:1fr 1fr;">`; permitidas.sort().forEach(disc => { html += `<label><input type="checkbox" class="check-destino-hab" value="DISC_TURMA_${poloLote.value}_${turnoLote.value}_${turma}_${disc}"> ${disc}</label>`; }); html += `</div></div>`; }
        }); listaLote.innerHTML = html || '<p>Sem acesso a disciplinas.</p>';
    });

    if(btnSalvarLote) btnSalvarLote.addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('.check-destino-hab:checked'); const mIni = parseInt(document.getElementById('hab-lote-mes-inicio').value); const mFim = parseInt(document.getElementById('hab-lote-mes-fim').value); const texto = document.getElementById('hab-lote-texto').value.trim();
        if (checkboxes.length === 0 || !texto) return; const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (!await sysConfirm(`Distribuir ${linhas.length} hab(s) em ${checkboxes.length} disciplina(s)?`)) return;
        const db = firebase.firestore();
        for (let chk of checkboxes) { const docRef = db.collection("disciplinas").doc(chk.value); const docSnap = await docRef.get(); let habs = docSnap.exists && docSnap.data().habilidades ? docSnap.data().habilidades : []; const novas = linhas.map(l => ({ id: Date.now()+Math.floor(Math.random()*1000), texto: l, mesInicio: mIni, mesFim: mFim })); await docRef.set({ habilidades: [...habs, ...novas] }, { merge: true }); }
        document.getElementById('hab-lote-texto').value = ""; sysAlert("Concluído!");
    });

    const editPolo = document.getElementById('hab-edit-polo'); const editTurno = document.getElementById('hab-edit-turno'); const editTurma = document.getElementById('hab-edit-turma'); const editDisc = document.getElementById('hab-edit-disciplina'); const btnBusca = document.getElementById('btn-buscar-habs-existentes'); const listaEdit = document.getElementById('lista-habs-existentes');
    if(editPolo && editPolo.options.length <= 1) { editPolo.appendChild(new Option("Polo 1", "polo1")); editPolo.appendChild(new Option("Polo 2", "polo2")); }
    if(editPolo) editPolo.addEventListener('change', () => { editTurno.innerHTML='<option value="">Turno...</option>'; editTurno.disabled=true; if(editPolo.value){editTurno.appendChild(new Option("Manhã", "Manhã")); editTurno.appendChild(new Option("Tarde", "Tarde")); editTurno.disabled=false;} });
    if(editTurno) editTurno.addEventListener('change', () => { editTurma.innerHTML='<option value="">Turma...</option>'; editTurma.disabled=true; if(editTurno.value) {escola.polos[editPolo.value][editTurno.value].forEach(t => editTurma.appendChild(new Option(t,t))); editTurma.disabled=false;} });
    if(editTurma) editTurma.addEventListener('change', () => { editDisc.innerHTML='<option value="">Disciplina...</option>'; editDisc.disabled=true; if(editTurma.value) {let d = editPolo.value==='polo1'?escola.disciplinas.polo1:[...escola.disciplinas.polo2Base]; d.forEach(x => editDisc.appendChild(new Option(x,x))); editDisc.disabled=false;} });
    if(editDisc) editDisc.addEventListener('change', () => btnBusca.disabled = !editDisc.value);

    function gerarOptionsMeses(selecionado) { const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]; return meses.map((m, i) => `<option value="${i+1}" ${i+1 === selecionado ? 'selected' : ''}>${m}</option>`).join(''); }

    window.habsCarregadas = [];
    if(btnBusca) {
        btnBusca.addEventListener('click', async () => {
            const ctxDisc = `DISC_TURMA_${editPolo.value}_${editTurno.value}_${editTurma.value}_${editDisc.value}`; listaEdit.innerHTML = '<p style="text-align: center; color: #d39e00;">⏳ Buscando habilidades no banco de dados...</p>';
            try {
                const doc = await firebase.firestore().collection("disciplinas").doc(ctxDisc).get(); let habs = doc.exists && doc.data().habilidades ? doc.data().habilidades : [];
                if (habs.length === 0) { listaEdit.innerHTML = '<p style="text-align: center; color: #999;">Nenhuma habilidade cadastrada para esta disciplina.</p>'; return; }
                window.habsCarregadas = habs; let html = '';
                habs.forEach((h, index) => {
                    let mIni = h.mesInicio || 1; let mFim = h.mesFim || 12;
                    html += `
                    <div style="background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: bold; color: #0056b3; font-size: 15px;">🎯 Habilidade ${index + 1}</span>
                            <button class="btn-secundario" style="color:#dc3545; border-color:#dc3545; padding: 4px 8px; font-size: 11px; background: white; border-radius: 4px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#dc3545'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#dc3545';" onclick="iniciarOperacaoHab('${h.id}', '${ctxDisc}', 'excluir')">🗑️ Excluir</button>
                        </div>
                        <textarea id="edit-texto-${h.id}" class="input-login" style="height: 60px; resize: vertical; margin-bottom: 10px; font-size: 13px; width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 8px;">${h.texto}</textarea>
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <label style="font-size: 12px; font-weight: bold; color: #555;">⏳ Início:</label><select id="edit-ini-${h.id}" class="input-login" style="margin-bottom: 0; width: 100px; border-radius: 4px;">${gerarOptionsMeses(mIni)}</select>
                            <label style="font-size: 12px; font-weight: bold; color: #555; margin-left: 10px;">⏳ Expiração:</label><select id="edit-fim-${h.id}" class="input-login" style="margin-bottom: 0; width: 100px; border-radius: 4px;">${gerarOptionsMeses(mFim)}</select>
                            <button class="btn-primario" style="margin-left: auto; padding: 8px 15px; background-color: #0056b3; border: none; border-radius: 4px; color: white; cursor: pointer; transition: 0.2s;" onmouseover="this.style.backgroundColor='#004494'" onmouseout="this.style.backgroundColor='#0056b3'" onclick="iniciarOperacaoHab('${h.id}', '${ctxDisc}', 'atualizar')">🔄 Atualizar Habilidade</button>
                        </div>
                    </div>`;
                }); listaEdit.innerHTML = html;
            } catch (e) { console.error(e); listaEdit.innerHTML = '<p style="text-align: center; color: #dc3545;">Erro ao buscar dados. Verifique a internet.</p>'; }
        });
    }

    let operacaoAtual = null;
    window.iniciarOperacaoHab = function(idHabStr, ctxDisc, acao) {
        const idHab = parseFloat(idHabStr); const habOriginal = window.habsCarregadas.find(h => h.id === idHab); if(!habOriginal) return;
        operacaoAtual = { idHab: idHab, ctxDisc: ctxDisc, acao: acao, textoOriginal: habOriginal.texto, novoTexto: document.getElementById(`edit-texto-${idHab}`)?.value || "", novoIni: parseInt(document.getElementById(`edit-ini-${idHab}`)?.value || 1), novoFim: parseInt(document.getElementById(`edit-fim-${idHab}`)?.value || 12) };
        document.getElementById('titulo-modal-escopo-hab').innerText = acao === 'excluir' ? '🗑️ Alcance da Exclusão' : '🔄 Alcance da Atualização'; document.getElementById('modal-escopo-hab').style.display = 'flex';
    }

    window.fecharModalEscopoHab = function() { document.getElementById('modal-escopo-hab').style.display = 'none'; operacaoAtual = null; }

    window.executarOperacaoHab = async function() {
        if (!operacaoAtual) return; const { idHab, ctxDisc, acao, textoOriginal, novoTexto, novoIni, novoFim } = operacaoAtual;
        const radios = document.getElementsByName('escopo-hab'); let escopoSelecionado = 'turma'; for (let r of radios) { if (r.checked) escopoSelecionado = r.value; }
        const partes = ctxDisc.split('_'); const poloAt = partes[2]; const turnoAt = partes[3]; const turmaAt = partes[4]; const discAt = partes.slice(5).join('_'); 
        let alvos = [];
        if (escopoSelecionado === 'turma') alvos.push(ctxDisc);
        else if (escopoSelecionado === 'turnos') { ['Manhã', 'Tarde'].forEach(t => { if (escola.polos[poloAt][t].includes(turmaAt)) alvos.push(`DISC_TURMA_${poloAt}_${t}_${turmaAt}_${discAt}`); }); } 
        else if (escopoSelecionado === 'polo') { ['Manhã', 'Tarde'].forEach(t => { escola.polos[poloAt][t].forEach(tur => alvos.push(`DISC_TURMA_${poloAt}_${t}_${tur}_${discAt}`)); }); } 
        else if (escopoSelecionado === 'global') { ['polo1', 'polo2'].forEach(p => { ['Manhã', 'Tarde'].forEach(t => { escola.polos[p][t].forEach(tur => alvos.push(`DISC_TURMA_${p}_${t}_${tur}_${discAt}`)); }); }); }
        fecharModalEscopoHab(); if(btnBusca) btnBusca.innerText = "⏳ Atualizando nuvem...";

        try {
            const db = firebase.firestore(); let countAlterados = 0;
            for (let alvo of alvos) {
                const docRef = db.collection("disciplinas").doc(alvo); const doc = await docRef.get();
                if (doc.exists && doc.data().habilidades) {
                    let habs = doc.data().habilidades; let modificado = false;
                    let index = habs.findIndex(h => h.id === idHab || h.texto.trim() === textoOriginal.trim());
                    if (index !== -1) { if (acao === 'excluir') { habs.splice(index, 1); } else { habs[index].texto = novoTexto; habs[index].mesInicio = novoIni; habs[index].mesFim = novoFim; } modificado = true; }
                    if (modificado) { await docRef.update({ habilidades: habs }); countAlterados++; if (typeof bancoDeDados !== 'undefined' && bancoDeDados[alvo]) bancoDeDados[alvo].habilidades = habs; }
                }
            }
            sysAlert(`${acao === 'excluir' ? 'Exclusão' : 'Atualização'} aplicada com sucesso em ${countAlterados} turma(s).`);
            if(btnBusca) { btnBusca.innerText = "🔍 Buscar Habilidades"; btnBusca.click(); }
        } catch (e) { console.error(e); sysAlert("Erro ao processar as alterações.", "Erro"); if(btnBusca) btnBusca.innerText = "🔍 Buscar Habilidades"; }
    }

    window.abrirModalNovoEstudante = function() {
        if (!document.getElementById('modal-novo-estudante')) {
            const modalHTML = `
                <div id="modal-novo-estudante" class="modal-overlay" style="z-index: 100008; display: none;">
                    <div class="modal-box" style="max-width: 450px; overflow: visible;">
                        <h2 style="margin-top:0; color:var(--cor-primaria);">➕ Nova Matrícula</h2>
                        <p style="font-size: 12px; color: #666; margin-bottom: 10px;">Insira os educandos (um por linha):</p>
                        <textarea id="input-nome-estudante" class="input-login" placeholder="Ex:&#10;Maria Silva&#10;João de Souza" style="height: 100px; resize: vertical; margin-bottom: 15px; border-radius: 4px;"></textarea>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <div style="flex: 1;"><label style="font-size: 12px; font-weight: bold;">Mês de Entrada:</label><select id="novo-estudante-mes" class="input-login" style="margin-bottom:0; border-radius: 4px;"><option value="1" selected>Janeiro (Aparece o ano todo)</option><option value="2">Fevereiro</option><option value="3">Março</option><option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option><option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option><option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option></select></div>
                        </div>
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <div style="flex: 1;"><label style="font-size: 12px; font-weight: bold;">Polo de Destino:</label><select id="novo-estudante-polo" class="input-login" style="margin-bottom:0; border-radius: 4px;"><option value="">Selecione...</option><option value="polo1">Polo 1</option><option value="polo2">Polo 2</option></select></div>
                            <div style="flex: 1;"><label style="font-size: 12px; font-weight: bold;">Turno de Destino:</label><select id="novo-estudante-turno" class="input-login" style="margin-bottom:0; border-radius: 4px;" disabled><option value="">Selecione...</option></select></div>
                        </div>
                        <label style="font-size: 12px; font-weight: bold;">Turma de Destino:</label><select id="novo-estudante-turma" class="input-login" style="border-radius: 4px;" disabled><option value="">Selecione...</option></select>
                        <div class="modal-acoes" style="margin-top: 20px;"><button class="btn-secundario" onclick="document.getElementById('modal-novo-estudante').style.display='none'">Cancelar</button><button class="btn-primario" id="btn-salvar-novo-estudante" style="background-color: #28a745;">Salvar Matrícula(s)</button></div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const selPolo = document.getElementById('novo-estudante-polo'); const selTurno = document.getElementById('novo-estudante-turno'); const selTurma = document.getElementById('novo-estudante-turma');
            selPolo.addEventListener('change', () => { selTurno.innerHTML = '<option value="">Selecione...</option>'; selTurno.disabled = true; selTurma.innerHTML = '<option value="">Selecione...</option>'; selTurma.disabled = true; if(selPolo.value) { selTurno.appendChild(new Option("Manhã", "Manhã")); selTurno.appendChild(new Option("Tarde", "Tarde")); selTurno.disabled = false; } });
            selTurno.addEventListener('change', () => { selTurma.innerHTML = '<option value="">Selecione...</option>'; selTurma.disabled = true; if(selTurno.value) { escola.polos[selPolo.value][selTurno.value].forEach(t => selTurma.appendChild(new Option(t, t))); selTurma.disabled = false; } });

            document.getElementById('btn-salvar-novo-estudante').addEventListener('click', async () => {
                const nomesRaw = document.getElementById('input-nome-estudante').value.trim(); const valMes = parseInt(document.getElementById('novo-estudante-mes').value); const valPolo = selPolo.value; const valTurno = selTurno.value; const valTurma = selTurma.value;
                if(!nomesRaw || !valPolo || !valTurno || !valTurma) return sysAlert("Preencha todos os campos para continuar.");
                const nomes = nomesRaw.split('\n').map(n => n.trim()).filter(n => n !== ""); if (nomes.length === 0) return sysAlert("Insira pelo menos um nome válido.");
                const btnAcao = document.getElementById('btn-salvar-novo-estudante'); btnAcao.disabled = true; btnAcao.innerText = "Salvando...";

                try {
                    const ctxDestino = `TURMA_${valPolo}_${valTurno}_${valTurma}`; const db = firebase.firestore(); const docSnap = await db.collection("turmas").doc(ctxDestino).get();
                    let listaEstudantes = docSnap.exists && docSnap.data().alunos ? docSnap.data().alunos : []; 
                    nomes.forEach((nomeStr, idx) => { listaEstudantes.push({ id: Date.now() + Math.floor(Math.random() * 10000) + idx, nome: nomeStr, desistente: false, anotacoes: [], mesEntrada: valMes }); });
                    await db.collection("turmas").doc(ctxDestino).set({ alunos: listaEstudantes }, { merge: true });
                    if (typeof bancoDeDados !== 'undefined') { if (bancoDeDados[ctxDestino]) { bancoDeDados[ctxDestino].alunos = listaEstudantes; } else { bancoDeDados[ctxDestino] = { alunos: listaEstudantes }; } }
                    if (typeof registrarLog === 'function') registrarLog(`Matriculou ${nomes.length} educando(s) na turma ${valTurma}`);
                    document.getElementById('input-nome-estudante').value = ''; document.getElementById('modal-novo-estudante').style.display = 'none';
                    sysAlert(`${nomes.length} educando(s) cadastrado(s) com sucesso na turma ${valTurma}!`);
                    if (document.getElementById('btn-visao-pesquisa')) document.getElementById('btn-visao-pesquisa').click();
                    if (typeof getContextosAtuais === 'function') { const { ctxTurma } = getContextosAtuais(); if (ctxTurma === ctxDestino && typeof renderizarTabela === 'function') renderizarTabela(); }
                } catch(erro) { console.error(erro); sysAlert("Erro ao tentar salvar no banco de dados."); } finally { btnAcao.disabled = false; btnAcao.innerText = "Salvar Matrícula(s)"; }
            });
        }
        document.getElementById('modal-novo-estudante').style.display = 'flex';
    };
})();

