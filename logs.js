// =========================================================
// logs.js - Módulo de Auditoria, Filtros e Ocorrências (Seguro)
// =========================================================

(function() {
    const btnLogs = document.getElementById('btn-visao-logs');
    const telaLogs = document.getElementById('tela-logs');
    const corpoTabela = document.getElementById('corpo-tabela-logs');
    const btnAtualizar = document.getElementById('btn-atualizar-logs');
    const btnFiltrar = document.getElementById('btn-aplicar-filtros-logs');
    const btnLimpar = document.getElementById('btn-limpar-filtros-logs');

    const telaTab = document.getElementById('tela-tabela');
    const telaGraf = document.getElementById('tela-graficos');
    const btnTab = document.getElementById('btn-visao-tabela');
    const btnGraf = document.getElementById('btn-visao-graficos');

    let cacheLogs = []; 

    window.registrarLog = async function(textoAcao, extraData = {}) {
        if (!firebase.auth().currentUser) return; 

        const emailTratado = firebase.auth().currentUser.email.trim().toLowerCase();
        const nomeUsuario = emailTratado.split('@')[0];
        
        let perfilAtivo = "desconhecido";
        if (typeof tabelaPermissoes !== 'undefined' && tabelaPermissoes[emailTratado]) {
            perfilAtivo = tabelaPermissoes[emailTratado].perfil;
        } else if (typeof usuarioPermissoes !== 'undefined' && usuarioPermissoes) {
            perfilAtivo = usuarioPermissoes.perfil;
        }

        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString('pt-BR');
        const horaFormatada = agora.toLocaleTimeString('pt-BR');

        let contextoArr = [];
        const selPolo = document.getElementById('filtro-polo');
        const selTurno = document.getElementById('filtro-turno');
        const selTurma = document.getElementById('filtro-turma');
        const selDisc = document.getElementById('filtro-disciplina');

        if (selPolo && selPolo.value) contextoArr.push(selPolo.options[selPolo.selectedIndex].text);
        if (selTurno && selTurno.value) contextoArr.push(selTurno.value);
        if (selTurma && selTurma.value) contextoArr.push(selTurma.value);
        if (selDisc && selDisc.value) contextoArr.push(selDisc.value);

        const contextoStr = contextoArr.length > 0 ? contextoArr.join(" ➔ ") : "Ação Geral / Sistema";

        const novoRegistro = {
            usuario: nomeUsuario,
            perfil: perfilAtivo,
            data: dataFormatada,
            hora: horaFormatada,
            contexto: contextoStr, 
            acao: textoAcao,
            timestamp: Date.now(),
            ...extraData 
        };

        try {
            const db = firebase.firestore();
            const docRef = db.collection("sistema").doc("auditoria");
            const docSnap = await docRef.get();
            
            let historico = docSnap.exists ? (docSnap.data().registros || []) : [];
            historico.unshift(novoRegistro);
            if (historico.length > 300) historico = historico.slice(0, 300);

            await docRef.set({ registros: historico });
        } catch (erro) {
            console.error("Erro ao registrar log:", erro);
        }
    };

    function converterDataLogParaTimestamp(dataBR) {
        const partes = dataBR.split('/');
        if(partes.length !== 3) return 0;
        return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
    }

    function converterInputParaTimestamp(dataInput) {
        const partes = dataInput.split('-');
        if(partes.length !== 3) return 0;
        return new Date(partes[0], partes[1] - 1, partes[2]).getTime();
    }

    window.carregarTabelaDeLogs = async function(usarCache = false) {
        if(!corpoTabela) return;

        // VERIFICAÇÃO DE PERMISSÃO (SEGURANÇA DA INTERFACE)
        const isCoord = usuarioPermissoes && (usuarioPermissoes.perfil === 'admin' || usuarioPermissoes.perfil === 'coordenacao');
        const selectTipo = document.getElementById('log-filtro-tipo');

        if (isCoord) {
            if (selectTipo.options.length < 4) {
                selectTipo.innerHTML = `
                    <option value="">Todas as Atividades</option>
                    <option value="sistema">Geral (Notas, Turmas, Lançamentos)</option>
                    <option value="ocorrencia">⚠️ Apenas Ocorrências</option>
                    <option value="nao-lidas">🔴 Ocorrências Não Lidas</option>
                `;
            }
        } else {
            selectTipo.innerHTML = `
                <option value="">Todas as Atividades</option>
                <option value="sistema">Geral (Notas, Turmas, Lançamentos)</option>
            `;
            if(selectTipo.value === 'ocorrencia' || selectTipo.value === 'nao-lidas') selectTipo.value = "";
        }
        
        const fDataInicio = document.getElementById('log-filtro-data-inicio').value; 
        const fDataFim = document.getElementById('log-filtro-data-fim').value; 
        const fTipo = selectTipo.value;

        if (!usarCache) {
            corpoTabela.innerHTML = "<tr><td colspan='4' style='text-align:center; padding: 20px;'>⏳ Carregando banco de dados...</td></tr>";
            try {
                const db = firebase.firestore();
                const docSnap = await db.collection("sistema").doc("auditoria").get();
                if (docSnap.exists) {
                    cacheLogs = docSnap.data().registros || [];
                } else {
                    cacheLogs = [];
                }
            } catch (erro) {
                corpoTabela.innerHTML = "<tr><td colspan='4' style='text-align:center; color: red; padding: 20px;'>❌ Erro ao conectar à internet.</td></tr>";
                return;
            }
        }

        if (cacheLogs.length === 0) {
            corpoTabela.innerHTML = "<tr><td colspan='4' style='text-align:center; padding: 20px;'>Nenhuma alteração registada.</td></tr>";
            return;
        }

        let historicoFiltrado = cacheLogs;

        if (fDataInicio || fDataFim) {
            const tempoInicio = fDataInicio ? converterInputParaTimestamp(fDataInicio) : 0; 
            const tempoFim = fDataFim ? converterInputParaTimestamp(fDataFim) : Infinity; 

            historicoFiltrado = historicoFiltrado.filter(log => {
                const tempoLog = converterDataLogParaTimestamp(log.data);
                return tempoLog >= tempoInicio && tempoLog <= tempoFim;
            });
        }

        if (fTipo === 'ocorrencia') {
            historicoFiltrado = historicoFiltrado.filter(log => log.isOcorrencia);
        } else if (fTipo === 'nao-lidas') {
            historicoFiltrado = historicoFiltrado.filter(log => log.isOcorrencia && !log.lida);
        } else if (fTipo === 'sistema') {
            historicoFiltrado = historicoFiltrado.filter(log => !log.isOcorrencia);
        }

        document.getElementById('texto-resumo-logs').innerText = `Exibindo ${historicoFiltrado.length} registro(s) encontrado(s).`;

        if (historicoFiltrado.length === 0) {
            corpoTabela.innerHTML = "<tr><td colspan='4' style='text-align:center; padding: 20px;'>Nenhum registro corresponde a esse filtro.</td></tr>";
            return;
        }

        let html = "";
        historicoFiltrado.forEach(log => {
            const ctxText = log.contexto || "Ação Geral / Sistema"; 
            let acaoHtml = `<span style="color: #0056b3;">${log.acao}</span>`;

            // O BOTÃO SÓ É RENDERIZADO SE FOR ADMIN OU COORDENAÇÃO
            if (log.isOcorrencia && isCoord) {
                const corLida = log.lida ? '#6c757d' : '#dc3545';
                const txtLida = log.lida ? 'Visualizada' : 'NOVA (Não Lida)';
                acaoHtml += `<br><button onclick='abrirOcorrenciaPeloLog(${log.timestamp})' style='margin-top: 6px; background: ${corLida}; color: white; border: none; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.2);'>👁️ Ver Ocorrência (${txtLida})</button>`;
            }

            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px; vertical-align: top;"><b>${log.usuario}</b> <br><small style="color:#666;">(${log.perfil})</small></td>
                    <td style="padding: 10px; text-align: center; vertical-align: top; font-size: 13px;">${log.data}<br><span style="color:#999">${log.hora}</span></td>
                    <td style="padding: 10px; color: #555; font-size: 13px; vertical-align: top;">${ctxText}</td>
                    <td style="padding: 10px; vertical-align: top;">${acaoHtml}</td>
                </tr>
            `;
        });

        corpoTabela.innerHTML = html;
    }

    let ocorrenciaLendoAgora = null;

    // VERIFICAÇÃO DE PERMISSÃO (SEGURANÇA DA FUNÇÃO)
    window.abrirOcorrenciaPeloLog = async function(timestamp) {
        const isCoord = usuarioPermissoes && (usuarioPermissoes.perfil === 'admin' || usuarioPermissoes.perfil === 'coordenacao');
        if (!isCoord) {
            if(typeof sysAlert === 'function') await sysAlert("Acesso negado. Apenas a coordenação pode visualizar e dar baixa em ocorrências.", "Acesso Restrito");
            return;
        }

        let log = cacheLogs.find(l => l.timestamp === timestamp);
        
        if(!log) {
            document.getElementById('modal-ler-ocorrencia').style.display = 'flex';
            document.getElementById('log-ocor-texto').innerText = "⏳ Buscando detalhes da ocorrência na nuvem...";
            try {
                const docSnap = await firebase.firestore().collection("sistema").doc("auditoria").get();
                if (docSnap.exists) {
                    const registros = docSnap.data().registros || [];
                    log = registros.find(l => l.timestamp === timestamp);
                }
            } catch(e) { console.error(e); }
        }

        if(!log) {
            document.getElementById('log-ocor-texto').innerText = "❌ Ocorrência não encontrada ou já foi deletada.";
            return;
        }

        ocorrenciaLendoAgora = log;
        document.getElementById('log-ocor-aluno').innerText = log.alunoNome || "Desconhecido";
        document.getElementById('log-ocor-data').innerText = `${log.data} às ${log.hora}`;
        document.getElementById('log-ocor-texto').innerText = log.textoOcorrencia || "(Sem descrição detalhada)";
        
        const btnLida = document.getElementById('btn-marcar-lida');
        if (log.lida) {
            btnLida.style.backgroundColor = "#6c757d";
            btnLida.innerText = "Já marcada como lida";
            btnLida.disabled = true;
        } else {
            btnLida.style.backgroundColor = "#28a745";
            btnLida.innerText = "✔️ Marcar como Ciente/Lida";
            btnLida.disabled = false;
        }

        document.getElementById('dropdown-notificacoes').style.display = 'none';
        document.getElementById('modal-ler-ocorrencia').style.display = 'flex';
    }

    document.getElementById('btn-marcar-lida').addEventListener('click', async () => {
        if (!ocorrenciaLendoAgora) return;
        
        document.getElementById('btn-marcar-lida').innerText = "⏳ Salvando...";
        document.getElementById('btn-marcar-lida').disabled = true;

        try {
            const db = firebase.firestore();
            const docRef = db.collection("sistema").doc("auditoria");
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                let histNuvem = docSnap.data().registros;
                let index = histNuvem.findIndex(l => l.timestamp === ocorrenciaLendoAgora.timestamp);
                
                if (index !== -1) {
                    histNuvem[index].lida = true;
                    await docRef.set({ registros: histNuvem });
                    
                    const cacheIndex = cacheLogs.findIndex(l => l.timestamp === ocorrenciaLendoAgora.timestamp);
                    if(cacheIndex !== -1) cacheLogs[cacheIndex].lida = true;
                    
                    document.getElementById('modal-ler-ocorrencia').style.display = 'none';
                    window.carregarTabelaDeLogs(true);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao marcar como lida.");
        }
    });

    if (btnFiltrar) btnFiltrar.addEventListener('click', () => window.carregarTabelaDeLogs(true));
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            document.getElementById('log-filtro-data-inicio').value = "";
            document.getElementById('log-filtro-data-fim').value = "";
            
            const selectTipo = document.getElementById('log-filtro-tipo');
            selectTipo.value = "";
            
            window.carregarTabelaDeLogs(true);
        });
    }

    if (btnLogs) {
        btnLogs.addEventListener('click', async () => {
            if (typeof temAlteracoesNaoSalvas !== 'undefined' && temAlteracoesNaoSalvas) {
                if(typeof sysAlert === 'function') return await sysAlert("Por favor, clique em 'Salvar Notas' na tabela antes de sair.", "Aviso");
            }
            if(telaTab) telaTab.style.display = 'none';
            if(telaGraf) telaGraf.style.display = 'none';
            if(btnTab) btnTab.classList.remove('visao-ativa');
            if(btnGraf) btnGraf.classList.remove('visao-ativa');

            btnLogs.classList.add('visao-ativa');
            if(telaLogs) telaLogs.style.display = 'block';

            window.carregarTabelaDeLogs(false); 
        });
    }

    if (btnAtualizar) btnAtualizar.addEventListener('click', () => window.carregarTabelaDeLogs(false));

})();
