// =========================================================
// 1. FÁBRICA DE MODAIS CUSTOMIZADOS
// =========================================================
window.sysAlert = function(msg, title = "Aviso") {
    return new Promise((resolve) => {
        document.getElementById('sys-modal-title').innerText = title;
        document.getElementById('sys-modal-msg').innerText = msg;
        document.getElementById('sys-modal-input').style.display = 'none';
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

window.sysPrompt = function(msg, defaultText = "", title = "Entrada Necessária") {
    return new Promise((resolve) => {
        document.getElementById('sys-modal-title').innerText = title;
        document.getElementById('sys-modal-msg').innerText = msg;
        const input = document.getElementById('sys-modal-input');
        input.style.display = 'block';
        input.value = defaultText;
        document.getElementById('sys-modal-btn-cancel').style.display = 'block';
        const modal = document.getElementById('sys-modal-overlay');
        const btnOk = document.getElementById('sys-modal-btn-ok');
        const btnCancel = document.getElementById('sys-modal-btn-cancel');
        modal.style.display = 'flex';
        input.focus();
        const cleanUp = () => {
            modal.style.display = 'none';
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
        };
        const onOk = () => { cleanUp(); resolve(input.value); };
        const onCancel = () => { cleanUp(); resolve(null); };
        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
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
    
    // Professores do Polo 1
    "regente1@trilhas.com": { perfil: "professor", acessos: { 
        "polo1": { 
            "Manhã": { "1º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "2º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] },
            "Tarde": { "1º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "2º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] }
        } 
    }},
    
    "regente2@trilhas.com": { perfil: "professor", acessos: { 
        "polo1": { 
            "Manhã": { "1º Ano": ["Artes e Musicalização"], "2º Ano": ["Artes e Musicalização"], "3º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências", "Artes e Musicalização"], "5º Ano": ["Artes e Musicalização"] },
            "Tarde": { "1º Ano": ["Artes e Musicalização"], "2º Ano": ["Artes e Musicalização"], "3º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências", "Artes e Musicalização"], "5º Ano": ["Artes e Musicalização"] }
        } 
    }},
    
    "regente3@trilhas.com": { perfil: "professor", acessos: { 
        "polo1": { 
            "Manhã": { "4º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "5º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] },
            "Tarde": { "4º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"], "5º Ano": ["Língua Portuguesa", "Matemática", "Literatura", "Ciências"] }
        } 
    }},
    
    "especialista1@trilhas.com": { perfil: "professor", acessos: { 
        "polo1": { 
            "Manhã": { "1º Ano": ["Inglês", "Informática"], "2º Ano": ["Inglês", "Informática"], "3º Ano": ["Inglês", "Informática"], "4º Ano": ["Inglês", "Informática", "Artes e Musicalização"], "5º Ano": ["Inglês", "Informática"] },
            "Tarde": { "1º Ano": ["Inglês", "Informática"], "2º Ano": ["Inglês", "Informática"], "3º Ano": ["Inglês", "Informática"], "4º Ano": ["Inglês", "Informática", "Artes e Musicalização"], "5º Ano": ["Inglês", "Informática"] }
        } 
    }},
    
    "especialista2@trilhas.com": { perfil: "professor", acessos: { 
        "polo1": { 
            "Manhã": { "1º Ano": ["Xadrez", "Ed. Física"], "2º Ano": ["Xadrez", "Ed. Física"], "3º Ano": ["Xadrez", "Ed. Física"], "4º Ano": ["Xadrez", "Ed. Física"], "5º Ano": ["Xadrez", "Ed. Física"] },
            "Tarde": { "1º Ano": ["Xadrez", "Ed. Física"], "2º Ano": ["Xadrez", "Ed. Física"], "3º Ano": ["Xadrez", "Ed. Física"], "4º Ano": ["Xadrez", "Ed. Física"], "5º Ano": ["Xadrez", "Ed. Física"] }
        } 
    }},
    
    "especialista3@trilhas.com": { perfil: "professor", acessos: { 
        "polo1": { 
            "Manhã": { "1º Ano": ["Robótica"], "2º Ano": ["Robótica"], "3º Ano": ["Robótica"], "4º Ano": ["Robótica"], "5º Ano": ["Robótica"] },
            "Tarde": { "1º Ano": ["Robótica"], "2º Ano": ["Robótica"], "3º Ano": ["Robótica"], "4º Ano": ["Robótica"], "5º Ano": ["Robótica"] }
        }, 
        "polo2": { 
            "Manhã": { "Infantil IV": ["Informática", "Robótica"], "Infantil V e 1º Ano": ["Informática", "Robótica"], "2º Ano": ["Informática", "Robótica"] },
            "Tarde": { "2º Ano": ["Informática", "Robótica"], "3º Ano A": ["Robótica"], "3º Ano B": ["Robótica"], "4º e 5º": ["Informática", "Robótica"] }
        } 
    }},

// Professores do Polo 2
    "geral1@trilhas.com": { perfil: "professor", acessos: {
        "polo2": { 
            "Manhã": { "Infantil IV": ["Inglês"], "Infantil V e 1º Ano": ["Inglês"], "2º Ano": ["Inglês", "Matemática"] },
            "Tarde": { "2º Ano": ["Inglês", "Matemática"], "3º Ano A": ["Inglês"], "3º Ano B": ["Inglês"], "4º e 5º": ["Inglês", "Matemática"] }
        }
    }},

    "geral2@trilhas.com": { perfil: "professor", acessos: {
        "polo2": { 
            "Manhã": { "Infantil IV": ["Psicomotricidade", "Xadrez"], "Infantil V e 1º Ano": ["Psicomotricidade", "Xadrez"], "2º Ano": ["Jogos de Oposição", "Xadrez"] },
            "Tarde": { "2º Ano": ["Jogos de Oposição", "Xadrez"], "3º Ano A": ["Xadrez"], "3º Ano B": ["Xadrez"] }
        }
    }},

    "geral3@trilhas.com": { perfil: "professor", acessos: {
        "polo2": { 
            "Manhã": { "Infantil IV": ["Matemática", "Português"], "Infantil V e 1º Ano": ["Matemática", "Português"], "2º Ano": ["Matemática", "Português"] },
            "Tarde": { "2º Ano": ["Matemática", "Português"], "3º Ano A": ["Matemática", "Português"], "3º Ano B": ["Matemática", "Português"], "4º e 5º": ["Português"] }
        }
    }},

    "geral4@trilhas.com": { perfil: "professor", acessos: {
        "polo2": { 
            "Manhã": { "2º Ano": ["Jogos de Oposição"] },
            "Tarde": { "2º Ano": ["Jogos de Oposição"], "3º Ano A": ["Informática", "Jogos de Oposição"], "3º Ano B": ["Informática", "Jogos de Oposição"], "4º e 5º": ["Jogos de Oposição", "Xadrez"] }
        }
    }}
};

let usuarioPermissoes = null; 

auth.onAuthStateChanged(async (user) => {
    const telaLogin = document.getElementById('tela-login');
    const btnSair = document.getElementById('btn-sair');
    const spanUsuario = document.getElementById('texto-usuario-logado');

    if (user) { 
        const emailTratado = user.email.trim().toLowerCase();
        const nomeUsuario = emailTratado.split('@')[0];
        
        if (spanUsuario) {
            spanUsuario.innerHTML = `Você está logado como <b>${nomeUsuario}</b>`;
            spanUsuario.style.display = 'inline-block';
        }
        
        usuarioPermissoes = tabelaPermissoes[emailTratado];
        
        if (!usuarioPermissoes) {
            usuarioPermissoes = { perfil: 'admin' };
            await sysAlert(`O e-mail "${emailTratado}" não está na lista de permissões. Acesso Admin liberado provisoriamente.`, "Aviso de Segurança");
        }
        
        aplicarPermissoesDeInterface();
        telaLogin.style.display = 'none'; 
        btnSair.style.display = 'block'; 
    } else { 
        telaLogin.style.display = 'flex'; 
        btnSair.style.display = 'none'; 
        if (spanUsuario) spanUsuario.style.display = 'none';
        usuarioPermissoes = null;
    }
});

function aplicarPermissoesDeInterface() {
    const btnAvancado = document.getElementById('btn-abrir-opcoes-avancadas');
    const selPolo = document.getElementById('filtro-polo');
    selPolo.innerHTML = '<option value="">Selecione...</option>';

    if (!usuarioPermissoes || usuarioPermissoes.perfil === 'admin') {
        if (btnAvancado) btnAvancado.style.display = 'inline-block';
        selPolo.appendChild(new Option("Polo 1", "polo1"));
        selPolo.appendChild(new Option("Polo 2", "polo2"));
    } 
    else if (usuarioPermissoes.perfil === 'coordenacao') {
        if (btnAvancado) btnAvancado.style.display = 'none'; 
        selPolo.appendChild(new Option("Polo 1", "polo1"));
        selPolo.appendChild(new Option("Polo 2", "polo2"));
    } 
    else if (usuarioPermissoes.perfil === 'professor') {
        if (btnAvancado) btnAvancado.style.display = 'none';
        if (usuarioPermissoes.acessos?.['polo1']) selPolo.appendChild(new Option("Polo 1", "polo1"));
        if (usuarioPermissoes.acessos?.['polo2']) selPolo.appendChild(new Option("Polo 2", "polo2"));
    }
}

document.getElementById('btn-entrar').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    document.getElementById('btn-entrar').textContent = "Autenticando...";
    auth.signInWithEmailAndPassword(email, senha).then(() => {
        document.getElementById('login-erro').style.display = 'none'; 
        document.getElementById('btn-entrar').textContent = "Entrar no Sistema";
    }).catch((error) => {
        document.getElementById('login-erro').textContent = "E-mail ou senha incorretos."; 
        document.getElementById('login-erro').style.display = 'block'; 
        document.getElementById('btn-entrar').textContent = "Entrar no Sistema";
    });
});

document.getElementById('btn-sair').addEventListener('click', async () => {
    if (temAlteracoesNaoSalvas) {
        const confirmarSair = await sysConfirm("Existem alterações não salvas. Sair mesmo assim?", "Aviso");
        if (!confirmarSair) return;
    }
    auth.signOut();
});

// =========================================================
// 4. BANCO DE DADOS LOCAL, CONTEXTO E FILA DE LOGS
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

let bancoDeDados = {}; 
let temAlteracoesNaoSalvas = false;
window.logsPendentes = []; 

function montarIDContextoTurma(polo, turno, turma) { 
    if (!polo || !turno || !turma) return null; 
    return `TURMA_${polo}_${turno}_${turma}`; 
}

function montarIDContextoDisciplina(turmaCtx, disciplina) { 
    if (!turmaCtx || !disciplina) return null; 
    return `DISC_${turmaCtx}_${disciplina}`; 
}

function getContextosAtuais() {
    const ctxTurma = montarIDContextoTurma(
        document.getElementById('filtro-polo').value, document.getElementById('filtro-turno').value, document.getElementById('filtro-turma').value
    );
    const ctxDisc = montarIDContextoDisciplina(ctxTurma, document.getElementById('filtro-disciplina').value);
    return { ctxTurma, ctxDisc };
}

// =========================================================
// 5. LÓGICA DE FILTROS E GUARDIÃO
// =========================================================
let proximaAcao = null; 
const modalAlerta = document.getElementById('modal-alerta-salvar');

function tentarNavegar(acao) { 
    if (temAlteracoesNaoSalvas) { proximaAcao = acao; modalAlerta.style.display = "flex"; } 
    else { acao(); } 
}

document.getElementById('btn-alerta-descartar').addEventListener('click', () => { 
    temAlteracoesNaoSalvas = false; 
    window.logsPendentes = []; 
    modalAlerta.style.display = "none"; 
    if (proximaAcao) proximaAcao(); 
});

document.getElementById('btn-alerta-salvar').addEventListener('click', async () => { 
    const sucesso = await window.salvarDadosNaNuvem(); 
    modalAlerta.style.display = "none"; 
    if (sucesso && proximaAcao) proximaAcao(); 
});

window.addEventListener('beforeunload', function (e) { if (temAlteracoesNaoSalvas) { e.preventDefault(); e.returnValue = ''; } });

function configurarCascataFiltros(prefixo, temDisciplina) {
    const p = document.getElementById(`${prefixo}-polo`); 
    const tn = document.getElementById(`${prefixo}-turno`); 
    const tm = document.getElementById(`${prefixo}-turma`); 
    const d = temDisciplina ? document.getElementById(`${prefixo}-disciplina`) : null;
    const mes = document.getElementById('filtro-mes'); 

    p.addEventListener('change', function() { 
        tentarNavegar(() => { 
            tn.innerHTML = '<option value="">Turno...</option>'; tn.disabled = true;
            tm.innerHTML = '<option value="">Turma...</option>'; tm.disabled = true;
            if (d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
            if (mes) { mes.selectedIndex = 0; mes.disabled = true; } 

            if (!p.value) { carregarEAtualizarInterface(); return; } 

            tn.appendChild(new Option("Manhã", "Manhã")); 
            tn.appendChild(new Option("Tarde", "Tarde")); 
            tn.disabled = false; 
            carregarEAtualizarInterface(); 
        }); 
    });
    
    tn.addEventListener('change', function() { 
        tentarNavegar(() => { 
            tm.innerHTML = '<option value="">Turma...</option>'; tm.disabled = true;
            if (d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
            if (mes) { mes.selectedIndex = 0; mes.disabled = true; }

            const polo = p.value; const turno = tn.value; 
            if (!turno) { carregarEAtualizarInterface(); return; } 
            
            let turmasDoTurno = escola.polos[polo][turno];
            if (usuarioPermissoes?.perfil === 'professor') {
                // AGORA ELE LÊ A CAMADA DO TURNO PARA FILTRAR AS TURMAS
                const permitidas = Object.keys(usuarioPermissoes.acessos[polo]?.[turno] || {});
                turmasDoTurno = turmasDoTurno.filter(t => permitidas.includes(t));
            }
            turmasDoTurno.forEach(t => tm.appendChild(new Option(t, t))); 
            tm.disabled = false; 
            carregarEAtualizarInterface(); 
        }); 
    });
    
    tm.addEventListener('change', function() { 
        tentarNavegar(() => { 
            if (d) { d.innerHTML = '<option value="">Disciplina...</option>'; d.disabled = true; }
            if (mes) { mes.selectedIndex = 0; mes.disabled = true; }

            if (!d) { carregarEAtualizarInterface(); return; } 
            
            const polo = p.value; const turno = tn.value; const turma = tm.value; 
            if (!turma) { carregarEAtualizarInterface(); return; } 
            
            let discps = polo === 'polo1' ? escola.disciplinas.polo1 : [...escola.disciplinas.polo2Base]; 
            if (polo === 'polo2') { 
                if (turma.includes('Infantil') || turma.includes('1º Ano')) discps.push("Psicomotricidade"); 
                else discps.push("Jogos de Oposição"); 
                discps.sort(); 
            } 
            if (usuarioPermissoes?.perfil === 'professor') {
                // AGORA ELE LÊ A CAMADA DO TURNO PARA FILTRAR AS DISCIPLINAS
                const permitidas = usuarioPermissoes.acessos[polo]?.[turno]?.[turma] || [];
                discps = discps.filter(disciplina => permitidas.includes(disciplina));
            }
            discps.forEach(x => d.appendChild(new Option(x, x))); 
            d.disabled = false; 
            carregarEAtualizarInterface(); 
        }); 
    });

    if (d) {
        d.addEventListener('change', () => {
            tentarNavegar(() => {
                if (mes) {
                    if (d.value) {
                        mes.disabled = false; 
                    } else {
                        mes.selectedIndex = 0;
                        mes.disabled = true;
                    }
                }
                carregarEAtualizarInterface();
            });
        });
    }
}

function carregarEAtualizarInterface() {
    const { ctxTurma, ctxDisc } = getContextosAtuais();
    const painelLegenda = document.getElementById('painel-legenda');
    if (painelLegenda) painelLegenda.style.display = ctxDisc ? "flex" : "none";

    const selMesLocal = document.getElementById('filtro-mes');
    if (selMesLocal) selMesLocal.disabled = !ctxDisc;

    const botoes = ['btn-abrir-modal-alu', 'btn-abrir-modal-hab', 'btn-salvar', 'btn-toggle-mes'];
    if (ctxDisc) { 
        window.logsPendentes = []; 
        botoes.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                if (id === 'btn-abrir-modal-hab' && usuarioPermissoes?.perfil === 'coordenacao') return;
                btn.disabled = false;
            }
        }); 
        carregarDadosDaNuvem(ctxTurma, ctxDisc); 
    } else { 
        botoes.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        }); 
        document.getElementById('cabecalho-tabela').innerHTML = "<tr><th>Nome do Estudante</th></tr>"; 
        document.getElementById('corpo-tabela').innerHTML = ""; 
    }
}

configurarCascataFiltros('filtro', true); 
configurarCascataFiltros('dest-hab', true); 
configurarCascataFiltros('dest-alu-copiar', false); 
configurarCascataFiltros('dest-alu-mover', false); 

const selMes = document.getElementById('filtro-mes');
escola.meses.forEach(m => { let opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.nome; opt.dataset.ordem = m.ordem; selMes.appendChild(opt); });
selMes.addEventListener('change', () => tentarNavegar(carregarEAtualizarInterface));

// =========================================================
// 6. NUVEM E CARREGAMENTO
// =========================================================
async function carregarDadosDaNuvem(ctxTurma, ctxDisc) {
    const cab = document.getElementById('cabecalho-tabela'); const corpo = document.getElementById('corpo-tabela');
    cab.innerHTML = "<tr><th>⏳ A carregar dados da nuvem...</th></tr>"; corpo.innerHTML = "";
    try {
        const docTurma = await db.collection("turmas").doc(ctxTurma).get(); 
        bancoDeDados[ctxTurma] = docTurma.exists ? docTurma.data() : { alunos: [] };
        const docDisc = await db.collection("disciplinas").doc(ctxDisc).get(); 
        bancoDeDados[ctxDisc] = docDisc.exists ? docDisc.data() : { habilidades: [], mesesFechados: {}, notas: {} };
        temAlteracoesNaoSalvas = false; 
        window.logsPendentes = []; 
        renderizarTabela(); verificarEstadoDoMes(); 
    } catch (error) { cab.innerHTML = "<tr><th style='color: red;'>❌ Erro de conexão.</th></tr>"; }
}

window.salvarDadosNaNuvem = async function() {
    const { ctxTurma, ctxDisc } = getContextosAtuais(); 
    const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.textContent = "⏳ A Salvar..."; btnSalvar.disabled = true;
    try {
        if (ctxTurma) await db.collection("turmas").doc(ctxTurma).set(bancoDeDados[ctxTurma]);
        if (ctxDisc) await db.collection("disciplinas").doc(ctxDisc).set(bancoDeDados[ctxDisc]);
        
        if(typeof registrarLog === 'function') {
            if (window.logsPendentes && window.logsPendentes.length > 0) {
                const acoesUnicas = [...new Set(window.logsPendentes)];
                await registrarLog(`Alterações Salvas: ${acoesUnicas.join(" | ")}`);
                window.logsPendentes = []; 
            } else {
                await registrarLog(`Salvou o progresso de notas.`);
            }
        }

        temAlteracoesNaoSalvas = false; 
        await sysAlert("✅ Notas e dados salvos na nuvem com sucesso!", "Sucesso");
        return true; 
    } catch (e) { 
        await sysAlert("❌ Erro ao salvar. Verifique a sua conexão.", "Erro"); 
        return false; 
    } finally { btnSalvar.innerHTML = "💾 Salvar Notas"; btnSalvar.disabled = false; }
}

document.getElementById('btn-salvar').addEventListener('click', salvarDadosNaNuvem);

// =========================================================
// 7. OPÇÕES AVANÇADAS (BACKUP E RESET)
// =========================================================
const modalAvancado = document.getElementById('modal-opcoes-avancadas');
let fezBackupSeguranca = false;

if (document.getElementById('btn-abrir-opcoes-avancadas')) {
    document.getElementById('btn-abrir-opcoes-avancadas').addEventListener('click', () => { 
        document.getElementById('area-restrita-avancada').style.display = 'none'; 
        document.getElementById('avancado-email').value = ""; 
        document.getElementById('avancado-senha').value = ""; 
        document.getElementById('avancado-palavra').value = ""; 
        document.getElementById('seletor-acao-avancada').value = "";
        document.getElementById('btn-confirmar-acao-avancada').disabled = true;
        document.getElementById('area-upload-file').style.display = 'none';
        fezBackupSeguranca = false;
        modalAvancado.style.display = 'flex'; 
    });

    document.getElementById('btn-fechar-opcoes').addEventListener('click', () => {
        modalAvancado.style.display = 'none';
    });

    document.getElementById('btn-executar-backup').addEventListener('click', () => { 
        const dadosConvertidos = JSON.stringify(bancoDeDados, null, 2); 
        const blob = new Blob([dadosConvertidos], { type: "application/json" }); 
        const link = document.createElement("a"); 
        link.href = URL.createObjectURL(blob); 
        link.download = `backup_AvaliaTrilhas_${new Date().toISOString().split('T')[0]}.json`; 
        link.click(); 
        
        if(typeof registrarLog === 'function') registrarLog("Fez download de um backup do sistema.");
        fezBackupSeguranca = true;
        document.getElementById('area-restrita-avancada').style.display = 'block'; 
    });

    document.getElementById('seletor-acao-avancada').addEventListener('change', function() {
        const areaUpload = document.getElementById('area-upload-file');
        const btn = document.getElementById('btn-confirmar-acao-avancada');
        
        if (this.value === "upload") {
            areaUpload.style.display = 'block';
            btn.textContent = "🔄 Restaurar Backup na Nuvem";
            btn.disabled = false;
        } else if (this.value === "reset") {
            areaUpload.style.display = 'none';
            btn.textContent = "☢️ DELETAR TODOS OS DADOS DA ESCOLA";
            btn.disabled = false;
        } else {
            areaUpload.style.display = 'none';
            btn.disabled = true;
        }
    });

    document.getElementById('btn-confirmar-acao-avancada').addEventListener('click', async () => {
        const acao = document.getElementById('seletor-acao-avancada').value;
        const email = document.getElementById('avancado-email').value; 
        const senha = document.getElementById('avancado-senha').value; 
        const palavra = document.getElementById('avancado-palavra').value;
        
        if (!fezBackupSeguranca) return await sysAlert("Você precisa baixar o backup antes de prosseguir!", "Aviso");
        if (palavra !== "CONFIRMAR") return await sysAlert("A palavra de segurança deve ser CONFIRMAR exata e em maiúsculo.", "Erro");
        if (!email || !senha) return await sysAlert("Preencha o e-mail e a senha.", "Erro");

        const btn = document.getElementById('btn-confirmar-acao-avancada'); 
        btn.textContent = "⏳ Autenticando e Processando..."; 
        btn.disabled = true;

        try {
            await auth.signInWithEmailAndPassword(email, senha);
            
            if (acao === "reset") {
                const turmasSnap = await db.collection("turmas").get(); 
                const loteT = db.batch();
                turmasSnap.forEach(doc => loteT.delete(doc.ref));
                await loteT.commit();
                
                const discSnap = await db.collection("disciplinas").get(); 
                const loteD = db.batch();
                discSnap.forEach(doc => loteD.delete(doc.ref));
                await loteD.commit();
                
                if(typeof registrarLog === 'function') await registrarLog("Zerar Ano: Todos os dados da escola foram apagados.");
                await sysAlert("✅ SISTEMA ZERADO COM SUCESSO!", "Sucesso"); 
                window.location.reload();

            } else if (acao === "upload") {
                const fileInput = document.getElementById('input-arquivo-backup');
                if (!fileInput.files || fileInput.files.length === 0) {
                    btn.disabled = false; btn.textContent = "Executar Ação";
                    return await sysAlert("Por favor, selecione o arquivo .json do backup.", "Aviso");
                }
                
                const file = fileInput.files[0]; 
                const reader = new FileReader();
                
                reader.onload = async function(e) {
                    try {
                        const backupData = JSON.parse(e.target.result);
                        for (const chave in backupData) {
                            if (chave.startsWith('TURMA_')) await db.collection("turmas").doc(chave).set(backupData[chave]);
                            else if (chave.startsWith('DISC_')) await db.collection("disciplinas").doc(chave).set(backupData[chave]);
                        }
                        if(typeof registrarLog === 'function') await registrarLog("Restaurou o sistema através de um arquivo de backup.");
                        await sysAlert("✅ BACKUP RESTAURADO COM SUCESSO!", "Sucesso");
                        window.location.reload();
                    } catch (err) {
                        await sysAlert("❌ O arquivo não é um backup válido.", "Erro");
                        btn.disabled = false; btn.textContent = "Executar Ação";
                    }
                };
                reader.readAsText(file);
            }
        } catch (e) { 
            await sysAlert("❌ Erro de credenciais.", "Erro"); 
            btn.textContent = "Executar Ação"; btn.disabled = false; 
        }
    });
}

// =========================================================
// 8. SISTEMA DE ANOTAÇÕES DO ALUNO (COM AUTO-SAVE)
// =========================================================
let alunoAnotacaoAtual = null;

window.abrirModalAnotacoes = function(idAluno) {
    const { ctxTurma } = getContextosAtuais();
    alunoAnotacaoAtual = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno);
    if (!alunoAnotacaoAtual) return;

    document.getElementById('titulo-modal-anotacoes').innerText = `📝 Anotações: ${alunoAnotacaoAtual.nome}`;
    document.getElementById('texto-nova-anotacao').value = "";
    
    atualizarListaAnotacoesVisuais();
    document.getElementById('modal-anotacoes-aluno').style.display = 'flex';
}

function atualizarListaAnotacoesVisuais() {
    const container = document.getElementById('lista-anotacoes-container');
    container.innerHTML = "";
    if (!alunoAnotacaoAtual.anotacoes || alunoAnotacaoAtual.anotacoes.length === 0) {
        container.innerHTML = "<p style='color: #666; font-size: 13px; text-align: center;'>Nenhum registro para este educando ainda.</p>";
        return;
    }

    let html = "";
    for (let i = alunoAnotacaoAtual.anotacoes.length - 1; i >= 0; i--) {
        const nota = alunoAnotacaoAtual.anotacoes[i];
        html += `
            <div class="item-anotacao">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 5px;">
                    <span class="item-anotacao-header" style="border: none; margin: 0; padding: 0;">📅 ${nota.data} | 📍 ${nota.disciplina}</span>
                    <div>
                        <button class="btn-acao-nota" onclick="editarAnotacao(${i})" title="Editar esta anotação">✏️</button>
                        <button class="btn-acao-nota" onclick="excluirAnotacao(${i})" title="Excluir esta anotação">🗑️</button>
                    </div>
                </div>
                <div style="white-space: pre-wrap;">${nota.texto}</div>
            </div>
        `;
    }
    container.innerHTML = html;
}

window.editarAnotacao = async function(indexReal) {
    const nota = alunoAnotacaoAtual.anotacoes[indexReal];
    const novoTexto = await sysPrompt("Edite o texto da anotação:", nota.texto, "Editar Anotação");
    
    if (novoTexto !== null && novoTexto.trim() !== "") {
        alunoAnotacaoAtual.anotacoes[indexReal].texto = novoTexto.trim();
        temAlteracoesNaoSalvas = true;
        atualizarListaAnotacoesVisuais();
        renderizarTabela(); 
        await window.salvarDadosNaNuvem(); 
        if(typeof registrarLog === 'function') registrarLog(`Editou uma anotação do educando: ${alunoAnotacaoAtual.nome}.`);
    }
}

window.excluirAnotacao = async function(indexReal) {
    if (await sysConfirm("Tem certeza de que deseja apagar esta anotação?", "Excluir Anotação")) {
        alunoAnotacaoAtual.anotacoes.splice(indexReal, 1);
        temAlteracoesNaoSalvas = true;
        atualizarListaAnotacoesVisuais();
        renderizarTabela();
        await window.salvarDadosNaNuvem();
        if(typeof registrarLog === 'function') registrarLog(`Excluiu uma anotação do educando: ${alunoAnotacaoAtual.nome}.`);
    }
}

document.getElementById('btn-fechar-anotacoes').addEventListener('click', () => {
    document.getElementById('modal-anotacoes-aluno').style.display = 'none';
    alunoAnotacaoAtual = null;
});

document.getElementById('btn-salvar-anotacao').addEventListener('click', async () => {
    const texto = document.getElementById('texto-nova-anotacao').value.trim();
    if (texto === "") return await sysAlert("Escreva algo antes de salvar.", "Aviso");

    const disciplinaAtual = document.getElementById('filtro-disciplina').value || "Geral";
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    if (!alunoAnotacaoAtual.anotacoes) alunoAnotacaoAtual.anotacoes = [];
    alunoAnotacaoAtual.anotacoes.push({ data: dataAtual, disciplina: disciplinaAtual, texto: texto });
    temAlteracoesNaoSalvas = true; 
    document.getElementById('texto-nova-anotacao').value = ""; 
    atualizarListaAnotacoesVisuais(); 
    renderizarTabela(); 
    
    await window.salvarDadosNaNuvem(); 
    if(typeof registrarLog === 'function') registrarLog(`Adicionou anotação para o educando: ${alunoAnotacaoAtual.nome}.`);
});

// =========================================================
// 9. GERADOR DE PROMPT IA
// =========================================================
window.gerarPromptIA = async function(idAluno, btnElement) {
    const { ctxTurma } = getContextosAtuais();
    const aluno = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno);
    const legendas = { "0": "Não aplicável", "1": "Não desenvolvida", "2": "Em desenvolvimento", "3": "Em construção", "4": "Consolidada" };
    const nomesMeses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const textoOriginal = btnElement.innerText;
    btnElement.innerText = "⏳ Buscando..."; 
    btnElement.disabled = true;

    try {
        const querySnapshot = await db.collection("disciplinas")
            .where(firebase.firestore.FieldPath.documentId(), '>=', `DISC_${ctxTurma}_`)
            .where(firebase.firestore.FieldPath.documentId(), '<=', `DISC_${ctxTurma}_\uf8ff`)
            .get();
        querySnapshot.forEach((doc) => { bancoDeDados[doc.id] = doc.data(); });
    } catch(e) { console.error(e); }

    let prompt = `Atue como um coordenador pedagógico e redija um relatório avaliativo descritivo em parágrafos, em tom profissional e acolhedor, para os responsáveis do(a) estudante ${aluno.nome}.\n\n`;
    prompt += `Abaixo está o histórico de progressão do educando ao longo dos meses nas disciplinas avaliadas:\n\n`;

    let encontrouDados = false;

    Object.keys(bancoDeDados).forEach(key => {
        if (key.startsWith(`DISC_${ctxTurma}_`)) {
            const nomeDisciplina = key.replace(`DISC_${ctxTurma}_`, '');
            const discData = bancoDeDados[key];
            const notasAluno = discData.notas[idAluno];

            if (notasAluno) {
                let discTemNotas = false; 
                let txtDisciplina = `📍 **${nomeDisciplina.toUpperCase()}**\n`;

                discData.habilidades.forEach(hab => {
                    const notasHab = notasAluno[hab.id];
                    if (notasHab) {
                        const mesesAvaliados = Object.keys(notasHab).map(Number).sort((a,b) => a - b);
                        let notasAdicionadas = [];
                        mesesAvaliados.forEach(mes => {
                            const val = notasHab[mes];
                            if(val !== "-1" && val !== undefined) notasAdicionadas.push(`${nomesMeses[mes]}: ${legendas[val]}`); 
                        });
                        if(notasAdicionadas.length > 0) {
                            txtDisciplina += `- Habilidade: "${hab.texto}"\n  Evolução: ${notasAdicionadas.join(" ➔ ")}\n`;
                            discTemNotas = true; encontrouDados = true;
                        }
                    }
                });
                if(discTemNotas) prompt += txtDisciplina + "\n";
            }
        }
    });

    if(!encontrouDados) prompt += "(Ainda não há avaliações quantitativas registradas no sistema.)\n\n";

    if (aluno.anotacoes && aluno.anotacoes.length > 0) {
        prompt += `\nAlém das notas, considere as seguintes ANOTAÇÕES QUALITATIVAS feitas pelos professores no dia a dia:\n`;
        aluno.anotacoes.forEach(nota => { prompt += `📝 [Data: ${nota.data} | Disciplina: ${nota.disciplina}] -> "${nota.texto}"\n`; });
        prompt += `\n⚠️ INSTRUÇÃO IMPORTANTE: Reescreva essas observações adequando-as para a devida FORMALIDADE PEDAGÓGICA exigida em um relatório oficial para os pais.\n\n`;
    }

    prompt += `Elabore um texto fluido que resuma as conquistas, identifique pontos de maior progresso e sugira onde a família pode auxiliar em casa. Não invente dados fictícios.`;

    navigator.clipboard.writeText(prompt).then(async () => {
        await sysAlert("🤖 Prompt copiado com sucesso!", "Sucesso");
    }).catch(async () => { await sysAlert("Erro ao copiar para a área de transferência.", "Erro"); });

    btnElement.innerText = textoOriginal; btnElement.disabled = false;
}

// =========================================================
// 10. EDIÇÃO RÁPIDA (ALTERAR NOME DO ALUNO)
// =========================================================
window.editarNomeAluno = async function(idAluno) {
    const { ctxTurma } = getContextosAtuais();
    const aluno = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno);
    if (!aluno) return;

    const nomeAntigo = aluno.nome;
    const novoNome = await sysPrompt("Edite o nome do educando:", aluno.nome, "Editar Estudante");
    
    if (novoNome !== null && novoNome.trim() !== "" && novoNome.trim() !== nomeAntigo) {
        aluno.nome = novoNome.trim();
        temAlteracoesNaoSalvas = true;
        if(window.logsPendentes) window.logsPendentes.push(`Alterou o nome de um aluno (${nomeAntigo} ➔ ${aluno.nome})`);
        renderizarTabela();
    }
}

// =========================================================
// 11. RENDERIZAÇÃO DA TABELA E DOSSIÊ DO ESTUDANTE
// =========================================================
window.abrirDossieAluno = async function(idAluno) {
    const { ctxTurma } = getContextosAtuais();
    const aluno = bancoDeDados[ctxTurma].alunos.find(a => a.id === idAluno);
    if(!aluno) return;

    const modal = document.getElementById('modal-dossie-aluno');
    const conteudo = document.getElementById('conteudo-dossie');

    // A MÁGICA ESTÁ AQUI: Atualiza os textos e botão SÓ DEPOIS de encontrar o aluno!
    document.getElementById('titulo-dossie').innerText = `Ficha do Estudante: ${aluno.nome}`;
    document.getElementById('btn-ia-ficha').setAttribute('onclick', `gerarPromptIA(${aluno.id}, this)`);
    
    conteudo.innerHTML = "<p style='text-align:center; padding: 20px;'>⏳ Buscando informações no banco de dados...</p>";
    modal.style.display = "flex";

    try {
        const querySnapshot = await db.collection("disciplinas")
            .where(firebase.firestore.FieldPath.documentId(), '>=', `DISC_${ctxTurma}_`)
            .where(firebase.firestore.FieldPath.documentId(), '<=', `DISC_${ctxTurma}_\uf8ff`)
            .get();
        querySnapshot.forEach((doc) => { bancoDeDados[doc.id] = doc.data(); });
    } catch(e) { console.error("Erro ao buscar disciplinas para a ficha:", e); }

    const legendas = { "0": "Não aplicável", "1": "Não desenvolvida", "2": "Em desenvolvimento", "3": "Em construção", "4": "Consolidada" };

    let html = `<div style="margin-bottom: 20px;">
                    <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">📊 Progresso Acadêmico (Últimas Avaliações)</h3>`;
    let temNotas = false;

    Object.keys(bancoDeDados).forEach(key => {
        if (key.startsWith(`DISC_${ctxTurma}_`)) {
            const nomeDisc = key.replace(`DISC_${ctxTurma}_`, '');
            const discData = bancoDeDados[key];
            const notasAluno = discData.notas[idAluno];

            if(notasAluno) {
                let htmlDisc = `<div style="margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; background: #fafafa;">
                                <h4 style="margin: 0 0 10px 0; color: var(--cor-primaria); text-transform: uppercase;">${nomeDisc}</h4>
                                <ul style="margin: 0; padding-left: 5px; font-size: 14px; list-style-type: none;">`; 
                let discTemHabs = false;

                discData.habilidades.forEach(hab => {
                    const notasHab = notasAluno[hab.id];
                    if(notasHab) {
                        const meses = Object.keys(notasHab).map(Number).sort((a,b) => b - a); 
                        for(let m of meses) {
                            if(notasHab[m] !== "-1" && notasHab[m] !== undefined) {
                                htmlDisc += `<li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                                                <span class="bolinha cor-${notasHab[m]}" style="margin-top: 4px; flex-shrink: 0; display: inline-block;"></span>
                                                <div>
                                                    <span style="color: #333;">${hab.texto}</span><br>
                                                    <span style="color: #555; font-size: 12px;">➔ Última avaliação: <b style="color: var(--cor-primaria);">${legendas[notasHab[m]]}</b></span>
                                                </div>
                                             </li>`;
                                discTemHabs = true; temNotas = true; break; 
                            }
                        }
                    }
                });
                htmlDisc += `</ul></div>`;
                if(discTemHabs) html += htmlDisc;
            }
        }
    });

    if(!temNotas) html += `<p style="font-size: 13px; color: #666; font-style: italic;">Ainda não há avaliações quantitativas registradas no sistema.</p>`;
    html += `</div>`;

    html += `<div style="margin-top: 20px; border-top: 2px dashed #ddd; padding-top: 15px;">
                <h3 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">📝 Caderno de Anotações</h3>`;
    
    if (aluno.anotacoes && aluno.anotacoes.length > 0) {
        for (let i = aluno.anotacoes.length - 1; i >= 0; i--) {
            const nota = aluno.anotacoes[i];
            html += `<div style="background: white; border-left: 4px solid var(--cor-secundaria); padding: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <p style="font-size: 12px; color: #666; margin: 0 0 5px 0;">📅 <b>${nota.data}</b> | 📍 ${nota.disciplina}</p>
                        <p style="font-size: 14px; margin: 0; white-space: pre-wrap; color: #333;">${nota.texto}</p>
                     </div>`;
        }
    } else { html += `<p style="font-size: 13px; color: #666; font-style: italic;">Nenhuma anotação qualitativa registrada.</p>`; }
    html += `</div>`;

    conteudo.innerHTML = html;
};

window.imprimirDossie = function() {
    const conteudo = document.getElementById('conteudo-dossie').innerHTML;
    const titulo = document.getElementById('titulo-dossie').innerText;
    
    const janelaImpressao = window.open('', '', 'width=900,height=650');
    janelaImpressao.document.write(`
        <html><head><title>${titulo}</title>
            <style>
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
                h1 { text-align: center; border-bottom: 3px solid #333; padding-bottom: 10px; margin-bottom: 30px; text-transform: uppercase; }
                h3 { color: #000; margin-top: 30px; }
                ul { list-style-type: none; padding-left: 0; }
                .bolinha { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1px solid #333; }
                .cor-0 { background-color: #cccccc; }
                .cor-1 { background-color: #ff4d4d; }
                .cor-2 { background-color: #ffc107; }
                .cor-3 { background-color: #17a2b8; }
                .cor-4 { background-color: #28a745; }
                @media print { .no-print { display: none; } }
            </style>
        </head><body>
            <h1>${titulo}</h1>${conteudo}
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body></html>
    `);
    janelaImpressao.document.close();
}

window.salvarNotaTemporaria = function(idAluno, idHab, sel) { 
    const { ctxDisc } = getContextosAtuais(); 
    const m = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    if (!bancoDeDados[ctxDisc].notas[idAluno]) bancoDeDados[ctxDisc].notas[idAluno] = {}; 
    if (!bancoDeDados[ctxDisc].notas[idAluno][idHab]) bancoDeDados[ctxDisc].notas[idAluno][idHab] = {}; 
    
    const val = sel.value; 
    bancoDeDados[ctxDisc].notas[idAluno][idHab][m] = val; 
    temAlteracoesNaoSalvas = true; 
    
    if(window.logsPendentes) window.logsPendentes.push(`Lançamento/Alteração de nota(s) na tabela`);
    
    sel.className = 'seletor-nota'; 
    if(val !== "-1") sel.classList.add(`cor-${val}`); 
}

window.alternarVisibilidadeHab = function(idHab) { 
    const { ctxDisc } = getContextosAtuais(); 
    const hab = bancoDeDados[ctxDisc].habilidades.find(h => h.id === idHab); 
    if (hab) { hab.oculta = !hab.oculta; renderizarTabela(); } 
}

window.alternarTodasHabilidades = function() { 
    const { ctxDisc } = getContextosAtuais(); 
    const m = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    const habs = bancoDeDados[ctxDisc].habilidades.filter(h => h.ordemMes <= m); 
    if (habs.length === 0) return; 
    let todas = habs.every(h => h.oculta); 
    habs.forEach(h => h.oculta = !todas); 
    renderizarTabela(); 
}

window.alternarDesistente = function(id) { 
    const { ctxTurma } = getContextosAtuais(); 
    const a = bancoDeDados[ctxTurma].alunos.find(x => x.id === id); 
    if(a) { 
        a.desistente = !a.desistente; 
        temAlteracoesNaoSalvas = true; 
        if(window.logsPendentes) window.logsPendentes.push(`Marcou educando ${a.nome} como ${a.desistente ? 'Desistente' : 'Ativo'}`);
        renderizarTabela(); 
    } 
}

function renderizarTabela() {
    const { ctxTurma, ctxDisc } = getContextosAtuais(); 
    const mesAtual = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem);
    
    if(!bancoDeDados[ctxTurma] || !bancoDeDados[ctxDisc]) return;

    const habsAtivas = bancoDeDados[ctxDisc].habilidades.filter(h => h.ordemMes <= mesAtual);

    let theadComHabs = `<tr><th>Nome do Estudante</th>`;
    habsAtivas.forEach((hab, idx) => {
        if(hab.oculta) {
            theadComHabs += `<th title="${hab.texto}" style="text-align:center; min-width: 50px;">H${idx + 1} <button class="btn-visibilidade" onclick="alternarVisibilidadeHab(${hab.id})">➕</button></th>`;
        } else {
            theadComHabs += `<th style="min-width: 200px;"><div class="cabecalho-hab"><span>Hab. ${idx + 1} <small>(${hab.nomeMes})</small></span><button class="btn-visibilidade" onclick="alternarVisibilidadeHab(${hab.id})">➖ Ocultar</button></div><div class="texto-hab" title="${hab.texto}">${hab.texto}</div></th>`;
        }
    });
    
    if (habsAtivas.length > 0) { 
        let txt = habsAtivas.every(h => h.oculta) ? "➕ Mostrar Todas" : "➖ Ocultar Todas"; 
        theadComHabs += `<th style="text-align:center; vertical-align: middle; min-width: 140px;"><button class="btn-visibilidade" style="margin: 0; padding: 6px 12px; font-weight: bold; background-color: var(--cor-secundaria);" onclick="alternarTodasHabilidades()">${txt}</button></th>`; 
    }
    
    theadComHabs += "</tr>";
    document.getElementById('cabecalho-tabela').innerHTML = theadComHabs;

    let alunosOrdenados = [...bancoDeDados[ctxTurma].alunos.filter(a => (a.mesEntrada || 1) <= mesAtual)].sort((a, b) => { 
        if (a.desistente === b.desistente) return a.nome.localeCompare(b.nome); 
        return a.desistente ? 1 : -1; 
    });

    let tbodyHTML = "";
    alunosOrdenados.forEach((aluno) => {
        let classLinha = aluno.desistente ? "linha-desistente" : ""; 
        let btnDes = aluno.desistente ? "Desfazer" : "Desistente";
        let iconeAnotacao = (aluno.anotacoes && aluno.anotacoes.length > 0) ? "📝" : "📄";
        let titleAnotacao = (aluno.anotacoes && aluno.anotacoes.length > 0) ? "Ver Anotações" : "Criar Anotação";
        
        tbodyHTML += `<tr class="${classLinha}">
            <td>
                <div class="celula-aluno">
                    <span class="nome-texto nome-link" onclick="abrirDossieAluno(${aluno.id})" title="Clique para abrir a ficha do educando">${aluno.nome}</span>
                    <div class="acoes-aluno">
                        <button class="btn-editar-nome" onclick="editarNomeAluno(${aluno.id})" title="Editar Nome do Aluno">✏️</button>
                        <button class="btn-anotacao" onclick="abrirModalAnotacoes(${aluno.id})" title="${titleAnotacao}">${iconeAnotacao}</button>
                        <button class="btn-desistente" onclick="alternarDesistente(${aluno.id})">${btnDes}</button>
                    </div>
                </div>
            </td>`;

        habsAtivas.forEach(hab => {
            let val = "-1"; 
            let hist = bancoDeDados[ctxDisc].notas[aluno.id]?.[hab.id];
            if (hist) { 
                for (let m = mesAtual; m >= 1; m--) { 
                    if (hist[m] !== undefined && hist[m] !== "-1") { val = hist[m]; break; } 
                } 
            }
            
            if (aluno.desistente) { 
                tbodyHTML += `<td style="text-align:center;">-</td>`; 
            } else if (hab.oculta) { 
                tbodyHTML += `<td style="text-align:center;">${val !== "-1" ? `<span class="bolinha cor-${val}"></span>` : "-"}</td>`; 
            } else {
                let cor = val !== "-1" ? `cor-${val}` : "";
                tbodyHTML += `<td>
                    <select class="seletor-nota ${cor}" onchange="salvarNotaTemporaria(${aluno.id}, ${hab.id}, this)">
                        <option value="-1" ${val === "-1" ? "selected" : ""}>-</option>
                        <option value="0" ${val === "0" ? "selected" : ""}>0 - Não aplicável</option>
                        <option value="1" ${val === "1" ? "selected" : ""}>1 - Não desenvolvida</option>
                        <option value="2" ${val === "2" ? "selected" : ""}>2 - Em desenvolvimento</option>
                        <option value="3" ${val === "3" ? "selected" : ""}>3 - Em construção</option>
                        <option value="4" ${val === "4" ? "selected" : ""}>4 - Consolidada</option>
                    </select>
                </td>`;
            }
        });
        
        if (habsAtivas.length > 0) tbodyHTML += `<td></td>`; 
        tbodyHTML += "</tr>";
    });
    
    document.getElementById('corpo-tabela').innerHTML = tbodyHTML;
}

document.getElementById('btn-toggle-mes').addEventListener('click', async function() { 
    const { ctxDisc } = getContextosAtuais(); 
    const mesId = selMes.value; 
    const discNome = document.getElementById('filtro-disciplina').value;
    
    if (!bancoDeDados[ctxDisc].mesesFechados[mesId]) { 
        if (await sysConfirm(`Fechar o mês? O salvamento na nuvem será feito agora.`, "Atenção")) { 
            bancoDeDados[ctxDisc].mesesFechados[mesId] = true; 
            verificarEstadoDoMes(); 
            const salvo = await window.salvarDadosNaNuvem();
            if (!salvo) { bancoDeDados[ctxDisc].mesesFechados[mesId] = false; verificarEstadoDoMes(); } 
            else { if(typeof registrarLog === 'function') registrarLog(`Fechou o mês ${mesId} para a disciplina ${discNome}.`); }
        } 
    } else { 
        if (await sysConfirm(`Reabrir o mês? O salvamento na nuvem será feito agora.`, "Atenção")) { 
            bancoDeDados[ctxDisc].mesesFechados[mesId] = false; 
            verificarEstadoDoMes();
            const salvo = await window.salvarDadosNaNuvem();
            if (!salvo) { bancoDeDados[ctxDisc].mesesFechados[mesId] = true; verificarEstadoDoMes(); } 
            else { if(typeof registrarLog === 'function') registrarLog(`Reabriu o mês ${mesId} para a disciplina ${discNome}.`); }
        } 
    } 
});

function verificarEstadoDoMes() { 
    const { ctxDisc } = getContextosAtuais(); 
    const area = document.querySelector('.area-tabela'); 
    const btn = document.getElementById('btn-toggle-mes'); 
    const seletorMes = document.getElementById('filtro-mes');
    
    if (bancoDeDados[ctxDisc] && bancoDeDados[ctxDisc].mesesFechados[seletorMes.value]) { 
        area.classList.add('tabela-bloqueada'); 
        btn.textContent = "🔓 Reabrir Mês"; 
        btn.style.backgroundColor = "#28a745"; 
        document.getElementById('btn-abrir-modal-hab').disabled = true; 
    } else { 
        area.classList.remove('tabela-bloqueada'); 
        btn.textContent = "🔒 Fechar Mês"; 
        btn.style.backgroundColor = ""; 
        document.getElementById('btn-abrir-modal-hab').disabled = false; 
    } 

    if (bancoDeDados[ctxDisc]) {
        for (let i = 0; i < seletorMes.options.length; i++) {
            const opt = seletorMes.options[i];
            const mesId = opt.value;
            
            if (bancoDeDados[ctxDisc].mesesFechados[mesId]) {
                opt.style.color = "#999"; 
                opt.style.backgroundColor = "#f8f9fa"; 
                if (!opt.text.includes("🔒")) opt.text = opt.text + " 🔒";
            } else {
                opt.style.color = "#000"; 
                opt.style.backgroundColor = "#fff"; 
                opt.text = opt.text.replace(" 🔒", ""); 
            }
        }
    }
}

// =========================================================
// 12. MODAIS DE NEGÓCIO (GERENCIAMENTO DE ALUNOS/HABS)
// =========================================================
window.mudarAbaAlu = function(a) { 
    // Esconde todas as abas e tira a classe 'ativa'
    ['add', 'copiar', 'mover', 'excluir'].forEach(aba => {
        document.getElementById(`aba-alu-${aba}`).style.display = a === aba ? 'block' : 'none'; 
        document.getElementById(`tab-alu-${aba}`).className = a === aba ? 'tab-btn ativa' : 'tab-btn'; 
    });
    
    // Se não for a aba de adicionar, popula a lista de alunos com checkboxes
    if (a !== 'add') { 
        const { ctxTurma } = getContextosAtuais(); 
        const lh = document.getElementById(`lista-checkbox-alu-${a}`); 
        lh.innerHTML = ""; 
        bancoDeDados[ctxTurma].alunos.forEach(al => { 
            lh.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${al.id}" id="c_${a}_${al.id}"> <label for="c_${a}_${al.id}">${al.nome}</label></div>`; 
        }); 
        if(bancoDeDados[ctxTurma].alunos.length === 0) lh.innerHTML="<p>Nenhum educando cadastrado.</p>"; 
    } 
}

const mAlu = document.getElementById('modal-gerenciar-alu'); 

document.getElementById('btn-abrir-modal-alu').addEventListener('click', () => { 
    mudarAbaAlu('add'); 
    document.getElementById('texto-add-alu').value = ""; 
    mAlu.style.display = "flex"; 
}); 

document.getElementById('btn-modal-alu-cancelar').addEventListener('click', () => { 
    mAlu.style.display = "none"; 
});

document.getElementById('btn-modal-alu-confirmar').addEventListener('click', async () => { 
    const { ctxTurma } = getContextosAtuais(); 
    const mOrd = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    
    const isAdd = document.getElementById('tab-alu-add').classList.contains('ativa'); 
    const isCopiar = document.getElementById('tab-alu-copiar').classList.contains('ativa'); 
    const isMover = document.getElementById('tab-alu-mover').classList.contains('ativa'); 
    const isExcluir = document.getElementById('tab-alu-excluir').classList.contains('ativa'); 
    
    if (isAdd) { 
        const l = document.getElementById('texto-add-alu').value.split('\n').map(x => x.trim()).filter(x => x !== ""); 
        if (l.length > 0) {
            temAlteracoesNaoSalvas = true; 
            l.forEach(n => bancoDeDados[ctxTurma].alunos.push({ id: Date.now() + Math.random(), nome: n, desistente: false, mesEntrada: mOrd, anotacoes: [] })); 
            if(window.logsPendentes) window.logsPendentes.push(`Adicionou educando(s) à turma: ${l.join(', ')}`);
        }
    } else if (isExcluir) { 
        const c = document.querySelectorAll('#lista-checkbox-alu-excluir input:checked'); 
        if (c.length === 0) return await sysAlert("Selecione pelo menos um educando.", "Aviso"); 
        
        if(await sysConfirm("Excluir definitivamente?", "Cuidado")) { 
            let nomesRemovidos = [];
            c.forEach(x => { 
                const alunoRem = bancoDeDados[ctxTurma].alunos.find(a => a.id === parseFloat(x.value));
                if(alunoRem) nomesRemovidos.push(alunoRem.nome);
                bancoDeDados[ctxTurma].alunos = bancoDeDados[ctxTurma].alunos.filter(a => a.id !== parseFloat(x.value)); 
            }); 
            temAlteracoesNaoSalvas = true; 
            if(window.logsPendentes) window.logsPendentes.push(`Excluiu educando(s): ${nomesRemovidos.join(', ')}`);
        } else return; 
    } else if (isCopiar || isMover) { 
        const prefixo = isCopiar ? 'copiar' : 'mover';
        const c = document.querySelectorAll(`#lista-checkbox-alu-${prefixo} input:checked`); 
        if (c.length === 0) return await sysAlert("Selecione pelo menos um educando.", "Aviso"); 
        
        const dPolo = document.getElementById(`dest-alu-${prefixo}-polo`).value;
        const dTurno = document.getElementById(`dest-alu-${prefixo}-turno`).value;
        const dTurma = document.getElementById(`dest-alu-${prefixo}-turma`).value;
        
        const dCtx = montarIDContextoTurma(dPolo, dTurno, dTurma); 
        if (!dCtx || dCtx === ctxTurma) return await sysAlert("Destino inválido.", "Erro"); 
        
        let dd = { alunos: [] }; 
        const doc = await db.collection("turmas").doc(dCtx).get(); 
        if (doc.exists) dd = doc.data(); 
        
        let nomesTransferidos = [];
        c.forEach(x => { 
            const obj = bancoDeDados[ctxTurma].alunos.find(a => a.id === parseFloat(x.value)); 
            if (obj) { 
                nomesTransferidos.push(obj.nome);
                dd.alunos.push({ id: Date.now() + Math.random(), nome: obj.nome, desistente: false, mesEntrada: mOrd, anotacoes: obj.anotacoes || [] }); 
                if (isMover) bancoDeDados[ctxTurma].alunos = bancoDeDados[ctxTurma].alunos.filter(a => a.id !== obj.id); 
            } 
        }); 
        await db.collection("turmas").doc(dCtx).set(dd); 
        temAlteracoesNaoSalvas = true; 
        
        const tipoMov = isMover ? "Transferiu" : "Copiou";
        if(window.logsPendentes) window.logsPendentes.push(`${tipoMov} educando(s) para a turma: ${dTurma}`);
    } 
    
    mAlu.style.display = "none"; 
    renderizarTabela(); 
});

window.mudarAbaHab = function(a) { 
    document.getElementById('aba-hab-add').style.display = a === 'add' ? 'block' : 'none'; 
    document.getElementById('aba-hab-copiar').style.display = a === 'copiar' ? 'block' : 'none'; 
    document.getElementById('aba-hab-excluir').style.display = a === 'excluir' ? 'block' : 'none'; 
    document.getElementById('tab-hab-add').className = a === 'add' ? 'tab-btn ativa' : 'tab-btn'; 
    document.getElementById('tab-hab-copiar').className = a === 'copiar' ? 'tab-btn ativa' : 'tab-btn'; 
    document.getElementById('tab-hab-excluir').className = a === 'excluir' ? 'tab-btn ativa' : 'tab-btn'; 
    
    const { ctxDisc } = getContextosAtuais(); 
    const m = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    const habs = bancoDeDados[ctxDisc].habilidades.filter(h => h.ordemMes <= m); 
    
    if(a === 'copiar') { 
        const l = document.getElementById('lista-checkbox-habs-copiar'); l.innerHTML = ""; 
        habs.forEach(h => { l.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${h.id}" id="hc_${h.id}" checked> <label for="hc_${h.id}">${h.texto}</label></div>`; }); 
        if(habs.length === 0) l.innerHTML="<p>Vazio</p>"; 
    } 
    else if(a === 'excluir') { 
        const l = document.getElementById('lista-checkbox-habs-excluir'); l.innerHTML = ""; 
        habs.forEach(h => { l.innerHTML += `<div class="checkbox-item"><input type="checkbox" value="${h.id}" id="he_${h.id}"> <label for="he_${h.id}">${h.texto}</label></div>`; }); 
        if(habs.length === 0) l.innerHTML="<p>Vazio</p>"; 
    } 
}

const mHab = document.getElementById('modal-gerenciar-hab'); 

document.getElementById('btn-abrir-modal-hab').addEventListener('click', () => { mudarAbaHab('add'); document.getElementById('texto-add-hab').value = ""; mHab.style.display = "flex"; }); 
document.getElementById('btn-modal-hab-cancelar').addEventListener('click', () => { mHab.style.display = "none"; });

document.getElementById('btn-modal-hab-confirmar').addEventListener('click', async () => { 
    const { ctxDisc } = getContextosAtuais(); 
    const isAbaAdd = document.getElementById('tab-hab-add').classList.contains('ativa'); 
    const isAbaCopiar = document.getElementById('tab-hab-copiar').classList.contains('ativa'); 
    const mOrd = parseInt(selMes.options[selMes.selectedIndex].dataset.ordem); 
    const mNom = selMes.options[selMes.selectedIndex].text; 
    
    if (isAbaAdd) { 
        const l = document.getElementById('texto-add-hab').value.split('\n').map(x => x.trim()).filter(x => x !== ""); 
        if (l.length > 0) {
            temAlteracoesNaoSalvas = true; 
            l.forEach(x => bancoDeDados[ctxDisc].habilidades.push({ id: Date.now() + Math.random(), texto: x, ordemMes: mOrd, nomeMes: mNom, oculta: false })); 
            if(window.logsPendentes) window.logsPendentes.push(`Adicionou ${l.length} nova(s) habilidade(s)`);
        }
    } else if (isAbaCopiar) { 
        const dCtx = montarIDContextoDisciplina(montarIDContextoTurma(document.getElementById('dest-hab-polo').value, document.getElementById('dest-hab-turno').value, document.getElementById('dest-hab-turma').value), document.getElementById('dest-hab-disciplina').value); 
        if (!dCtx || dCtx === ctxDisc) return await sysAlert("Destino inválido.", "Erro"); 
        
        const c = document.querySelectorAll('#lista-checkbox-habs-copiar input:checked'); 
        if (c.length === 0) return await sysAlert("Selecione pelo menos uma habilidade.", "Aviso"); 
        
        let dd = { habilidades: [], mesesFechados: {}, notas: {} }; 
        const doc = await db.collection("disciplinas").doc(dCtx).get(); 
        if (doc.exists) dd = doc.data(); 
        
        c.forEach(x => { 
            const h = bancoDeDados[ctxDisc].habilidades.find(y => y.id === parseFloat(x.value)); 
            if(h) dd.habilidades.push({ id: Date.now() + Math.random(), texto: h.texto, ordemMes: mOrd, nomeMes: mNom, oculta: false }); 
        }); 
        
        await db.collection("disciplinas").doc(dCtx).set(dd); 
        if(typeof registrarLog === 'function') registrarLog(`Copiou habilidades para a turma ${document.getElementById('dest-hab-turma').value}.`);
        await sysAlert("Copiado pra nuvem!", "Sucesso"); 
    } else { 
        const c = document.querySelectorAll('#lista-checkbox-habs-excluir input:checked'); 
        if (c.length === 0) return await sysAlert("Selecione pelo menos uma habilidade.", "Aviso"); 
        
        if(await sysConfirm("Excluir definitivamente?", "Cuidado")) { 
            c.forEach(x => { bancoDeDados[ctxDisc].habilidades = bancoDeDados[ctxDisc].habilidades.filter(h => h.id !== parseFloat(x.value)); }); 
            temAlteracoesNaoSalvas = true; 
            if(window.logsPendentes) window.logsPendentes.push(`Excluiu habilidade(s)`);
        } else return; 
    } 
    mHab.style.display = "none"; 
    renderizarTabela(); 
});