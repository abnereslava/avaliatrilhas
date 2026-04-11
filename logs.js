// =========================================================
// logs.js - Módulo de Auditoria e Registro de Atividades
// =========================================================

(function() {
    const btnLogs = document.getElementById('btn-visao-logs');
    const telaLogs = document.getElementById('tela-logs');
    const corpoTabela = document.getElementById('corpo-tabela-logs');
    const btnAtualizar = document.getElementById('btn-atualizar-logs');

    const telaTab = document.getElementById('tela-tabela');
    const telaGraf = document.getElementById('tela-graficos');
    const btnTab = document.getElementById('btn-visao-tabela');
    const btnGraf = document.getElementById('btn-visao-graficos');

    // 1. FUNÇÃO GLOBAL PARA SALVAR LOG NA NUVEM
    window.registrarLog = async function(textoAcao) {
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

        // MÁGICA: Captura os filtros abertos na tela no exato momento da ação!
        let contextoArr = [];
        const selPolo = document.getElementById('filtro-polo');
        const selTurno = document.getElementById('filtro-turno');
        const selTurma = document.getElementById('filtro-turma');
        const selDisc = document.getElementById('filtro-disciplina');

        // Pega o nome visível do select (ex: "Polo 1" em vez de "polo1")
        if (selPolo && selPolo.value) contextoArr.push(selPolo.options[selPolo.selectedIndex].text);
        if (selTurno && selTurno.value) contextoArr.push(selTurno.value);
        if (selTurma && selTurma.value) contextoArr.push(selTurma.value);
        if (selDisc && selDisc.value) contextoArr.push(selDisc.value);

        // Junta tudo com uma setinha, ou avisa que é ação global
        const contextoStr = contextoArr.length > 0 ? contextoArr.join(" ➔ ") : "Ação Geral / Sistema";

        const novoRegistro = {
            usuario: nomeUsuario,
            perfil: perfilAtivo,
            data: dataFormatada,
            hora: horaFormatada,
            contexto: contextoStr, // <--- Guardando a nova informação!
            acao: textoAcao,
            timestamp: Date.now()
        };

        try {
            const db = firebase.firestore();
            const docRef = db.collection("sistema").doc("auditoria");
            const docSnap = await docRef.get();
            
            let historico = [];
            if (docSnap.exists) {
                historico = docSnap.data().registros || [];
            }

            historico.unshift(novoRegistro);

            if (historico.length > 300) {
                historico = historico.slice(0, 300);
            }

            await docRef.set({ registros: historico });
        } catch (erro) {
            console.error("Erro ao registrar log na nuvem:", erro);
        }
    };

    // 2. FUNÇÃO PARA LER DO FIREBASE E MOSTRAR NA TABELA
    window.carregarTabelaDeLogs = async function() {
        if(!corpoTabela) return;
        // Ajustado para ocupar 5 colunas enquanto carrega
        corpoTabela.innerHTML = "<tr><td colspan='5' style='text-align:center; padding: 20px;'>⏳ A procurar histórico na nuvem...</td></tr>";
        
        try {
            const db = firebase.firestore();
            const docSnap = await db.collection("sistema").doc("auditoria").get();
            
            if (!docSnap.exists || !docSnap.data().registros || docSnap.data().registros.length === 0) {
                corpoTabela.innerHTML = "<tr><td colspan='5' style='text-align:center; padding: 20px;'>Nenhuma alteração registada no sistema ainda.</td></tr>";
                return;
            }

            const historico = docSnap.data().registros;
            let html = "";

            historico.forEach(log => {
                // Caso haja logs antigos sem o contexto, mostramos "Ação Geral"
                const ctxText = log.contexto || "Ação Geral / Sistema"; 

                html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;"><b>${log.usuario}</b> <br><small style="color:#666;">(${log.perfil})</small></td>
                        <td style="padding: 10px; text-align: center;">${log.data}</td>
                        <td style="padding: 10px; text-align: center;">${log.hora}</td>
                        <td style="padding: 10px; color: #555; font-size: 13px;">${ctxText}</td>
                        <td style="padding: 10px; color: #0056b3;">${log.acao}</td>
                    </tr>
                `;
            });

            corpoTabela.innerHTML = html;
        } catch (erro) {
            corpoTabela.innerHTML = "<tr><td colspan='5' style='text-align:center; color: red; padding: 20px;'>❌ Erro ao carregar os logs. Verifique a ligação à internet.</td></tr>";
        }
    }

    // 3. BLINDAGEM DA NAVEGAÇÃO DE ABAS
    if (btnLogs) {
        btnLogs.addEventListener('click', async () => {
            if (typeof temAlteracoesNaoSalvas !== 'undefined' && temAlteracoesNaoSalvas) {
                if(typeof sysAlert === 'function') {
                    return await sysAlert("Por favor, clique em 'Salvar Notas' na tabela antes de sair.", "Aviso");
                }
            }
            
            if(telaTab) telaTab.style.display = 'none';
            if(telaGraf) telaGraf.style.display = 'none';
            if(btnTab) btnTab.classList.remove('visao-ativa');
            if(btnGraf) btnGraf.classList.remove('visao-ativa');

            btnLogs.classList.add('visao-ativa');
            if(telaLogs) telaLogs.style.display = 'block';

            window.carregarTabelaDeLogs();
        });
    }

    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', window.carregarTabelaDeLogs);
    }

})();