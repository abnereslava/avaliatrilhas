// =========================================================
// graficos.js - Módulo de Relatórios (Radar e Linha)
// =========================================================

(function() {
    let chartInstance = null;

    // UI - Menus e Telas
    const btnVisaoTabela = document.getElementById('btn-visao-tabela');
    const btnVisaoGraficos = document.getElementById('btn-visao-graficos');
    const btnVisaoLogs = document.getElementById('btn-visao-logs');
    const telaTabela = document.getElementById('tela-tabela');
    const telaGraficos = document.getElementById('tela-graficos');
    const telaLogs = document.getElementById('tela-logs');

    // UI - Sujeito Principal (1)
    const tipoSujeito = document.getElementById('g-tipo-sujeito');
    const gPolo1 = document.getElementById('g-polo-1');
    const gTurno1 = document.getElementById('g-turno-1');
    const gTurma1 = document.getElementById('g-turma-1');
    const areaAluno1 = document.getElementById('g-area-aluno-1');
    const gAluno1 = document.getElementById('g-aluno-1');

    // UI - Foco e Período (2)
    const gEscopo = document.getElementById('g-escopo');
    const areaDiscHab = document.getElementById('g-area-disc-hab');
    const gDisc = document.getElementById('g-disc');
    const gHab = document.getElementById('g-hab');
    const gMesInicio = document.getElementById('g-mes-inicio');
    const gMesFim = document.getElementById('g-mes-fim');

    // UI - Comparação (3)
    const tipoComp = document.getElementById('g-tipo-comparacao');
    const areaTurma2 = document.getElementById('g-area-turma-2');
    const gPolo2 = document.getElementById('g-polo-2');
    const gTurno2 = document.getElementById('g-turno-2');
    const gTurma2 = document.getElementById('g-turma-2');
    const areaAluno2 = document.getElementById('g-area-aluno-2');
    const gAluno2 = document.getElementById('g-aluno-2');

    const btnGerar = document.getElementById('btn-gerar-grafico');
    const canvas = document.getElementById('canvas-evolucao');
    const aviso = document.getElementById('aviso-grafico');

    const nomesMeses = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const listaMeses = [ { id: "jan", nome: "Janeiro", ordem: 1 }, { id: "fev", nome: "Fevereiro", ordem: 2 }, { id: "mar", nome: "Março", ordem: 3 }, { id: "abr", nome: "Abril", ordem: 4 }, { id: "mai", nome: "Maio", ordem: 5 }, { id: "jun", nome: "Junho", ordem: 6 }, { id: "jul", nome: "Julho", ordem: 7 }, { id: "ago", nome: "Agosto", ordem: 8 }, { id: "set", nome: "Setembro", ordem: 9 }, { id: "out", nome: "Outubro", ordem: 10 }, { id: "nov", nome: "Novembro", ordem: 11 }, { id: "dez", nome: "Dezembro", ordem: 12 } ];

    // --- LÓGICA DA INTERFACE E CASCATA ---

    function inicializarMesesEPolos() {
        if (gMesInicio.options.length === 0) {
            listaMeses.forEach(m => {
                gMesInicio.appendChild(new Option(m.nome, m.ordem));
                gMesFim.appendChild(new Option(m.nome, m.ordem));
            });
            gMesFim.value = "12";
        }
        
        if (gPolo1.options.length <= 1) {
            gPolo1.appendChild(new Option("Polo 1", "polo1"));
            gPolo1.appendChild(new Option("Polo 2", "polo2"));
            gPolo2.appendChild(new Option("Polo 1", "polo1"));
            gPolo2.appendChild(new Option("Polo 2", "polo2"));
        }
    }

    // A nova função de bloqueio que não causa erros
    function travarFiltrosSecundarios() {
        gEscopo.disabled = true; gDisc.disabled = true; gHab.disabled = true;
        gMesInicio.disabled = true; gMesFim.disabled = true;
        tipoComp.disabled = true; btnGerar.disabled = true;
        aviso.innerText = "Selecione a Turma no Passo 1 para começar.";
        aviso.style.color = "#999";
        canvas.style.display = 'none';
        
        const areaImpressao = document.getElementById('area-imprimir-grafico');
        if(areaImpressao) areaImpressao.style.display = 'none';
    }

    function configurarCascata(selPolo, selTurno, selTurma, callback) {
        selPolo.addEventListener('change', () => {
            // Reset rigoroso
            selTurno.innerHTML = '<option value="">Turno...</option>'; selTurno.disabled = true;
            selTurma.innerHTML = '<option value="">Turma...</option>'; selTurma.disabled = true;
            
            if(selPolo.id === 'g-polo-1') {
                gAluno1.innerHTML = '<option value="">Selecione o Educando...</option>'; gAluno1.disabled = true;
                travarFiltrosSecundarios();
            } else {
                gAluno2.innerHTML = '<option value="">Selecione o Outro Educando...</option>'; gAluno2.disabled = true;
                btnGerar.disabled = true;
            }

            if (!selPolo.value) return;
            selTurno.appendChild(new Option("Manhã", "Manhã")); selTurno.appendChild(new Option("Tarde", "Tarde"));
            selTurno.disabled = false;
        });

        selTurno.addEventListener('change', () => {
            selTurma.innerHTML = '<option value="">Turma...</option>'; selTurma.disabled = true;
            
            if(selTurno.id === 'g-turno-1') {
                gAluno1.innerHTML = '<option value="">Selecione o Educando...</option>'; gAluno1.disabled = true;
                travarFiltrosSecundarios();
            } else {
                gAluno2.innerHTML = '<option value="">Selecione o Outro Educando...</option>'; gAluno2.disabled = true;
                btnGerar.disabled = true;
            }

            if (!selTurno.value) return;
            let turmas = escola.polos[selPolo.value][selTurno.value];
            turmas.forEach(t => selTurma.appendChild(new Option(t, t)));
            selTurma.disabled = false;
        });

        selTurma.addEventListener('change', () => {
            if(selTurma.id === 'g-turma-1') {
                gAluno1.innerHTML = '<option value="">Selecione o Educando...</option>'; gAluno1.disabled = true;
                if (!selTurma.value) {
                    travarFiltrosSecundarios();
                }
            } else {
                gAluno2.innerHTML = '<option value="">Selecione o Outro Educando...</option>'; gAluno2.disabled = true;
                if (!selTurma.value) btnGerar.disabled = true;
            }

            if (selTurma.value && callback) callback();
        });
    }

    configurarCascata(gPolo1, gTurno1, gTurma1, async () => {
        await carregarDadosTurma1();
    });

    configurarCascata(gPolo2, gTurno2, gTurma2, async () => {
        const ctx2 = `TURMA_${gPolo2.value}_${gTurno2.value}_${gTurma2.value}`;
        if (!bancoDeDados[ctx2]) {
            const doc = await firebase.firestore().collection("turmas").doc(ctx2).get();
            bancoDeDados[ctx2] = doc.exists ? doc.data() : { alunos: [] };
        }
        btnGerar.disabled = false;
    });

    function atualizarOpcoesComparacao() {
        tipoComp.innerHTML = '<option value="nenhum">Nenhuma comparação</option>';
        if (tipoSujeito.value === 'turma') {
            tipoComp.appendChild(new Option("Outra Turma Inteira", "turma"));
        } else {
            tipoComp.appendChild(new Option("A Média desta mesma Turma", "media_turma"));
            tipoComp.appendChild(new Option("Outro Educando desta Turma", "aluno"));
        }
        tipoComp.dispatchEvent(new Event('change'));
    }

    tipoSujeito.addEventListener('change', () => {
        areaAluno1.style.display = tipoSujeito.value === 'aluno' ? 'block' : 'none';
        atualizarOpcoesComparacao();
        if (gTurma1.value) carregarDadosTurma1(); 
    });

    tipoComp.addEventListener('change', () => {
        areaTurma2.style.display = tipoComp.value === 'turma' ? 'flex' : 'none';
        areaAluno2.style.display = tipoComp.value === 'aluno' ? 'block' : 'none';
        
        if (tipoComp.value === 'turma' && !gTurma2.value) btnGerar.disabled = true;
        else if (gTurma1.value) btnGerar.disabled = false;
    });

    gEscopo.addEventListener('change', () => {
        if (gEscopo.value === 'geral') {
            areaDiscHab.style.display = 'none';
        } else if (gEscopo.value === 'disciplina') {
            areaDiscHab.style.display = 'flex'; gDisc.style.display = 'block'; gHab.style.display = 'none';
        } else {
            areaDiscHab.style.display = 'flex'; gDisc.style.display = 'block'; gHab.style.display = 'block';
        }
    });

    gDisc.addEventListener('change', () => {
        if (gEscopo.value === 'habilidade' && gDisc.value !== "") {
            const ctxDisc = `DISC_TURMA_${gPolo1.value}_${gTurno1.value}_${gTurma1.value}_${gDisc.value}`;
            gHab.innerHTML = '<option value="">Selecione a Habilidade...</option>';
            if (bancoDeDados[ctxDisc] && bancoDeDados[ctxDisc].habilidades) {
                bancoDeDados[ctxDisc].habilidades.forEach(h => {
                    gHab.appendChild(new Option(h.texto.substring(0, 50) + "...", h.id));
                });
            }
        }
    });

    // --- CARREGAMENTO DE DADOS ---

    async function carregarDadosTurma1() {
        const ctxTurma = `TURMA_${gPolo1.value}_${gTurno1.value}_${gTurma1.value}`;
        
        btnGerar.disabled = true;
        gEscopo.disabled = true; gDisc.disabled = true; gHab.disabled = true;
        gMesInicio.disabled = true; gMesFim.disabled = true;
        tipoComp.disabled = true;
        aviso.innerText = "⏳ A carregar informações do servidor...";
        aviso.style.display = 'block'; canvas.style.display = 'none';
        const areaImpressao = document.getElementById('area-imprimir-grafico');
        if(areaImpressao) areaImpressao.style.display = 'none';

        try {
            if (typeof bancoDeDados === 'undefined') window.bancoDeDados = {};
            if (!bancoDeDados[ctxTurma]) {
                const docTurma = await firebase.firestore().collection("turmas").doc(ctxTurma).get();
                bancoDeDados[ctxTurma] = docTurma.exists ? docTurma.data() : { alunos: [] };
            }

            const listaAlunos = bancoDeDados[ctxTurma].alunos || [];
            if (listaAlunos.length === 0) {
                aviso.innerText = `❌ A turma selecionada não tem educandos cadastrados.`;
                return;
            }

            gAluno1.innerHTML = '<option value="">Selecione o Educando...</option>';
            gAluno2.innerHTML = '<option value="">Selecione o Outro Educando...</option>';
            const ativos = listaAlunos.filter(a => !a.desistente).sort((a,b) => a.nome.localeCompare(b.nome));
            ativos.forEach(a => {
                gAluno1.appendChild(new Option(a.nome, a.id));
                gAluno2.appendChild(new Option(a.nome, a.id));
            });
            
            gAluno1.disabled = false;
            gAluno2.disabled = false;

            gDisc.innerHTML = '<option value="">Selecione a Disciplina...</option>';
            const snapshot = await firebase.firestore().collection("disciplinas")
                .where(firebase.firestore.FieldPath.documentId(), '>=', `DISC_${ctxTurma}_`)
                .where(firebase.firestore.FieldPath.documentId(), '<=', `DISC_${ctxTurma}_\uf8ff`).get();
            
            let discs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                bancoDeDados[doc.id] = data; 
                if (data.habilidades && data.habilidades.length > 0) {
                    discs.push(doc.id.replace(`DISC_${ctxTurma}_`, ''));
                }
            });
            discs.sort().forEach(d => gDisc.appendChild(new Option(d, d)));

            aviso.innerText = "Pronto! Configure os filtros e clique em Processar.";
            gEscopo.disabled = false; gDisc.disabled = false; gHab.disabled = false;
            gMesInicio.disabled = false; gMesFim.disabled = false;
            tipoComp.disabled = false;
            
            if(tipoComp.value !== 'turma' || gTurma2.value) btnGerar.disabled = false;

        } catch (e) {
            console.error(e); aviso.innerText = "❌ Erro ao conectar com o banco de dados.";
        }
    }

    // --- MOTORES MATEMÁTICOS DE EXTRAÇÃO (CARRY-FORWARD) ---

    function calcularMediaTemporal(alunoId, mes, escopo, ctxTurma, nomeDisc, idHab) {
        let soma = 0; let cont = 0;
        let chavesDisc = escopo === 'geral' ? Object.keys(bancoDeDados).filter(k => k.startsWith(`DISC_${ctxTurma}_`)) : [`DISC_${ctxTurma}_${nomeDisc}`];

        chavesDisc.forEach(key => {
            const data = bancoDeDados[key];
            if (!data || !data.notas || !data.notas[alunoId]) return;
            
            let habs = escopo === 'habilidade' ? [idHab] : data.habilidades.map(h => h.id);
            
            habs.forEach(hId => {
                let notaFinal = null;
                for(let m = mes; m >= 1; m--) {
                    const nota = data.notas[alunoId][hId]?.[m];
                    if (nota !== undefined && nota !== "-1" && nota !== "0") { 
                        notaFinal = parseFloat(nota); break; 
                    }
                }
                if(notaFinal !== null) { soma += notaFinal; cont++; }
            });
        });
        return cont > 0 ? (soma / cont) : null;
    }

    function gerarDatasetLinha(tipo, idAluno, ctxTurma, escopo, nomeDisc, idHab, inicio, fim) {
        let dados = []; let labels = [];
        const ativos = (bancoDeDados[ctxTurma].alunos || []).filter(a => !a.desistente);

        for (let m = inicio; m <= fim; m++) {
            labels.push(nomesMeses[m]);
            if (tipo === 'aluno') {
                dados.push(calcularMediaTemporal(idAluno, m, escopo, ctxTurma, nomeDisc, idHab));
            } else {
                let sTurma = 0; let cTurma = 0;
                ativos.forEach(a => {
                    let mAlu = calcularMediaTemporal(a.id, m, escopo, ctxTurma, nomeDisc, idHab);
                    if (mAlu !== null) { sTurma += mAlu; cTurma++; }
                });
                dados.push(cTurma > 0 ? (sTurma / cTurma) : null);
            }
        }
        return { data: dados, labels: labels };
    }

    function gerarDatasetRadar(tipo, idAluno, ctxTurma, inicio, fim) {
        let dados = []; let labels = [];
        const ativos = (bancoDeDados[ctxTurma].alunos || []).filter(a => !a.desistente);
        
        const disciplinas = Object.keys(bancoDeDados)
            .filter(k => k.startsWith(`DISC_${ctxTurma}_`) && bancoDeDados[k].habilidades && bancoDeDados[k].habilidades.length > 0)
            .map(k => k.replace(`DISC_${ctxTurma}_`, '')).sort();

        disciplinas.forEach(nomeDisc => {
            labels.push(nomeDisc);
            let sGeral = 0; let cGeral = 0;

            if (tipo === 'aluno') {
                for (let m = inicio; m <= fim; m++) {
                    let val = calcularMediaTemporal(idAluno, m, 'disciplina', ctxTurma, nomeDisc, null);
                    if(val !== null) { sGeral += val; cGeral++; }
                }
            } else {
                ativos.forEach(a => {
                    for (let m = inicio; m <= fim; m++) {
                        let val = calcularMediaTemporal(a.id, m, 'disciplina', ctxTurma, nomeDisc, null);
                        if(val !== null) { sGeral += val; cGeral++; }
                    }
                });
            }
            dados.push(cGeral > 0 ? (sGeral / cGeral) : null);
        });

        return { data: dados, labels: labels };
    }


    // --- DESENHO DO GRÁFICO (CHART.JS) ---

    btnGerar.addEventListener('click', () => {
        const escopo = gEscopo.value;
        const inicio = parseInt(gMesInicio.value);
        const fim = parseInt(gMesFim.value);

        if (escopo === 'disciplina' && gDisc.value === "") return sysAlert("Selecione a disciplina.");
        if (escopo === 'habilidade' && (gDisc.value === "" || gHab.value === "")) return sysAlert("Selecione a disciplina e habilidade.");
        if (inicio > fim) return sysAlert("O mês inicial deve ser menor ou igual ao final.");

        const ctx1 = `TURMA_${gPolo1.value}_${gTurno1.value}_${gTurma1.value}`;
        const tSuj = tipoSujeito.value;
        const idAl1 = parseFloat(gAluno1.value);
        if (tSuj === 'aluno' && !idAl1) return sysAlert("Selecione o educando na etapa 1.");

        const comp = tipoComp.value;
        let objA, objB;
        let labelA, labelB;
        
        labelA = tSuj === 'turma' ? `Média: ${gTurma1.value}` : gAluno1.options[gAluno1.selectedIndex].text;

        if (escopo === 'geral') {
            objA = gerarDatasetRadar(tSuj, idAl1, ctx1, inicio, fim);
            
            if (comp === 'aluno') {
                const idAl2 = parseFloat(gAluno2.value);
                if (!idAl2) return sysAlert("Selecione o outro educando para comparar.");
                objB = gerarDatasetRadar('aluno', idAl2, ctx1, inicio, fim);
                labelB = gAluno2.options[gAluno2.selectedIndex].text;
            } else if (comp === 'media_turma') {
                objB = gerarDatasetRadar('turma', null, ctx1, inicio, fim);
                labelB = `Média: ${gTurma1.value}`;
            } else if (comp === 'turma') {
                const ctx2 = `TURMA_${gPolo2.value}_${gTurno2.value}_${gTurma2.value}`;
                objB = gerarDatasetRadar('turma', null, ctx2, inicio, fim);
                labelB = `Média: ${gTurma2.value}`;
            }

        } else {
            objA = gerarDatasetLinha(tSuj, idAl1, ctx1, escopo, gDisc.value, gHab.value, inicio, fim);
            
            if (comp === 'aluno') {
                const idAl2 = parseFloat(gAluno2.value);
                objB = gerarDatasetLinha('aluno', idAl2, ctx1, escopo, gDisc.value, gHab.value, inicio, fim);
                labelB = gAluno2.options[gAluno2.selectedIndex].text;
            } else if (comp === 'media_turma') {
                objB = gerarDatasetLinha('turma', null, ctx1, escopo, gDisc.value, gHab.value, inicio, fim);
                labelB = `Média: ${gTurma1.value}`;
            } else if (comp === 'turma') {
                const ctx2 = `TURMA_${gPolo2.value}_${gTurno2.value}_${gTurma2.value}`;
                objB = gerarDatasetLinha('turma', null, ctx2, escopo, gDisc.value, gHab.value, inicio, fim);
                labelB = `Média: ${gTurma2.value}`;
            }
        }

        let datasets = [{
            label: labelA, data: objA.data,
            borderColor: '#0056b3', backgroundColor: 'rgba(0, 86, 179, 0.2)', borderWidth: 3, tension: 0.3, fill: true, pointRadius: 5, spanGaps: true
        }];

        if (objB) {
            datasets.push({
                label: labelB, data: objB.data,
                borderColor: '#d35400', backgroundColor: escopo==='geral'?'rgba(211, 84, 0, 0.2)':'transparent', borderWidth: 3, borderDash: escopo==='geral'?[]:[5,5], tension: 0.3, fill: escopo==='geral', pointRadius: 5, spanGaps: true
            });
        }

        if (chartInstance) chartInstance.destroy();
        aviso.style.display = 'none'; canvas.style.display = 'block';
        
        // Revela o botão de imprimir gráfico após a geração!
        const areaImpressao = document.getElementById('area-imprimir-grafico');
        if(areaImpressao) areaImpressao.style.display = 'block';

        const chartType = escopo === 'geral' ? 'radar' : 'line';
        
        chartInstance = new Chart(canvas.getContext('2d'), {
            type: chartType,
            data: { labels: objA.labels, datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 14 } } },
                    tooltip: { callbacks: { label: function(context) {
                        let val = context.parsed.r || context.parsed.y;
                        if (val === null || val === undefined) return "Sem dados";
                        let leg = ["0 (N/A)", "1 (N.D.)", "2 (E.D.)", "3 (E.C.)", "4 (Consolidado)"];
                        return `${context.dataset.label}: ${val.toFixed(2)} ➔ ${leg[Math.round(val)]}`;
                    }}}
                },
                scales: chartType === 'radar' ? {
                    r: { min: 0.5, max: 4.2, ticks: { stepSize: 1, display: false } }
                } : {
                    y: { min: 0.5, max: 4.2, ticks: { stepSize: 1, callback: function(v) {
                        if(v===1) return '1 - N.D.'; if(v===2) return '2 - E.D.'; if(v===3) return '3 - E.C.'; if(v===4) return '4 - Cons.'; return null;
                    }}}
                }
            }
        });
    });

    // --- IMPRESSÃO DO GRÁFICO ---
    const btnImprimirGrafico = document.getElementById('btn-imprimir-grafico');
    if(btnImprimirGrafico) {
        btnImprimirGrafico.addEventListener('click', () => {
            const canvasImg = canvas.toDataURL('image/png', 1.0);
            let subtitulo = `Turma Alvo: ${gTurma1.value}`;
            let escopoStr = gEscopo.options[gEscopo.selectedIndex].text;
            let perStr = `Período: ${gMesInicio.options[gMesInicio.selectedIndex].text} a ${gMesFim.options[gMesFim.selectedIndex].text}`;
            
            const janelaImpressao = window.open('', '', 'width=1000,height=800');
            janelaImpressao.document.write(`
                <html>
                <head>
                    <title>Impressão de Gráfico</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; text-align: center; }
                        h1 { border-bottom: 2px solid #0056b3; padding-bottom: 10px; color: #0056b3; }
                        .info-box { display: flex; justify-content: space-between; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 30px; text-align: left; }
                        .info-box p { margin: 5px 0; font-size: 14px; }
                        img { max-width: 100%; height: auto; margin-top: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #eee; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <h1>Relatório de Desempenho e Evolução</h1>
                    <div class="info-box">
                        <div>
                            <p><b>${subtitulo}</b></p>
                            <p><b>Análise:</b> ${escopoStr}</p>
                        </div>
                        <div>
                            <p><b>${perStr}</b></p>
                            <p><b>Data de Emissão:</b> ${new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <img src="${canvasImg}">
                    <script>
                        setTimeout(() => { window.print(); window.close(); }, 800);
                    </script>
                </body>
                </html>
            `);
            janelaImpressao.document.close();
        });
    }

    // --- NAVEGAÇÃO DE ABAS ---
    function resetarTelas() {
        if(telaTabela) telaTabela.style.display = 'none'; if(telaGraficos) telaGraficos.style.display = 'none'; if(telaLogs) telaLogs.style.display = 'none';
        if(btnVisaoTabela) btnVisaoTabela.classList.remove('visao-ativa'); if(btnVisaoGraficos) btnVisaoGraficos.classList.remove('visao-ativa'); if(btnVisaoLogs) btnVisaoLogs.classList.remove('visao-ativa');
    }

    if (btnVisaoGraficos) {
        btnVisaoGraficos.addEventListener('click', async () => {
            if (typeof temAlteracoesNaoSalvas !== 'undefined' && temAlteracoesNaoSalvas) {
                if(typeof sysAlert === 'function') return await sysAlert("Por favor, clique em 'Salvar Notas' na tabela antes de sair.", "Aviso");
            }
            resetarTelas(); btnVisaoGraficos.classList.add('visao-ativa'); if(telaGraficos) telaGraficos.style.display = 'block';
            inicializarMesesEPolos(); 
            atualizarOpcoesComparacao();
        });
    }

    if (btnVisaoTabela) {
        btnVisaoTabela.addEventListener('click', () => { resetarTelas(); btnVisaoTabela.classList.add('visao-ativa'); if(telaTabela) telaTabela.style.display = 'block'; });
    }
})();