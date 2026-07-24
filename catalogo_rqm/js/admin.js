/* ==========================================================================
   PAINEL ADMINISTRATIVO RQM - ADMIN.JS (CÓDIGO COMPLETO COM SUPORTE A CSV E MANUAIS)
   ========================================================================== */

let produtosCSVCarregadosAdmin = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarEstatisticas();
    carregarPalavrasBloqueadas();
    carregarConfiguracoes();

    // 1. Inicia o carregamento do CSV no Admin
    inicializarBaseCSVAdmin().then(() => {
        carregarTodosProdutosAdmin();
        carregarEstatisticas();
    });

    // 2. Eventos dos Formulários
    const formProduto = document.getElementById("form-add-produto");
    if (formProduto) formProduto.addEventListener("submit", adicionarOuEditarProduto);

    const formBloqueio = document.getElementById("form-add-bloqueio");
    if (formBloqueio) formBloqueio.addEventListener("submit", adicionarPalavraBloqueada);

    const formConfig = document.getElementById("form-configuracoes");
    if (formConfig) formConfig.addEventListener("submit", salvarConfiguracoes);

    const inputCsv = document.getElementById("input-csv-upload");
    if (inputCsv) inputCsv.addEventListener("change", fazerUploadCSVManual);

    // 3. Captura do campo de pesquisa (conecta qualquer input com placeholder 'filtrar' ou id relacionado)
    document.querySelectorAll("input").forEach(input => {
        const placeholder = (input.placeholder || "").toLowerCase();
        if (placeholder.includes("filtrar") || input.id === "Pesquisar" || input.id === "input-busca-produto-admin") {
            input.addEventListener("input", (e) => {
                carregarTodosProdutosAdmin(e.target.value);
            });
        }
    });
});

// --- TRATAMENTO DE TEXTO E CORREÇÃO DE ACENTUAÇÃO ---
function corrigirTextoAdmin(texto) {
    if (!texto) return "";
    return String(texto)
        .replace(/CÃ“DIGO/g, "CÓDIGO")
        .replace(/DESCRIÃ‡ÃƒO/g, "DESCRIÇÃO")
        .replace(/SITUAÃ‡ÃƒO/g, "SITUAÇÃO")
        .replace(/LOCALIZAÃ‡ÃƒO/g, "LOCALIZAÇÃO")
        .replace(/PORTAS DE AÃ‡O/g, "PORTAS DE AÇO")
        .replace(/DOBRADIÃ‡A/g, "DOBRADIÇA")
        .replace(/DOBRADIÃ‡AS/g, "DOBRADIÇAS")
        .replace(/AÃ‡O/g, "AÇO")
        .replace(/Ã‡/g, "Ç")
        .replace(/Ãƒ/g, "Ã")
        .replace(/Ã“/g, "Ó")
        .replace(/Ã/g, "Á")
        .replace(/Ã‰/g, "É")
        .replace(/Ã/g, "Í")
        .replace(/ÃŠ/g, "Ê")
        .replace(/Ã”/g, "Ô");
}

function normalizeTextAdmin(texto) {
    if (!texto) return "";
    return texto.toString().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function slugifyAdmin(texto) {
    return normalizeTextAdmin(texto)
        .replace(/[^a-z0-9]/g, "-")
        .replace(/^-|-$/g, "");
}

// --- CARREGAMENTO DO PRODUTOS.CSV NO ADMIN ---
function inicializarBaseCSVAdmin() {
    return new Promise((resolve) => {
        const csvCustom = localStorage.getItem("rqm_custom_csv");

        const parseCallback = (results) => {
            produtosCSVCarregadosAdmin = processarLinhasCSVAdmin(results ? results.data : []);
            resolve();
        };

        if (csvCustom) {
            Papa.parse(csvCustom, {
                encoding: "ISO-8859-1",
                skipEmptyLines: true,
                complete: parseCallback
            });
        } else {
            Papa.parse("./PRODUTOS.CSV", {
                download: true,
                encoding: "ISO-8859-1",
                skipEmptyLines: true,
                complete: parseCallback,
                error: () => resolve()
            });
        }
    });
}

function processarLinhasCSVAdmin(linhas) {
    let prods = [];
    if (!linhas || linhas.length === 0) return prods;

    let idxDescricao = -1, idxGrupo = -1;
    let linhaInicio = 0;

    for (let i = 0; i < linhas.length; i++) {
        const rowUpper = linhas[i].map(c => corrigirTextoAdmin(c).trim().toUpperCase());
        if (rowUpper.includes("DESCRIÇÃO") || rowUpper.includes("DESCRICAO")) {
            idxDescricao = rowUpper.indexOf("DESCRIÇÃO");
            if (idxDescricao === -1) idxDescricao = rowUpper.indexOf("DESCRICAO");
            idxGrupo = rowUpper.indexOf("GRUPO");
            linhaInicio = i + 1;
            break;
        }
    }

    if (idxDescricao === -1) idxDescricao = 2;

    for (let i = linhaInicio; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha || linha.length <= idxDescricao) continue;

        let desc = corrigirTextoAdmin(linha[idxDescricao]).trim();
        if (!desc || desc.toUpperCase() === "DESCRIÇÃO" || desc.toUpperCase() === "DESCRICAO") continue;

        let grupo = (idxGrupo !== -1 && linha[idxGrupo]) ? corrigirTextoAdmin(linha[idxGrupo]).trim() : "GERAL";

        prods.push({
            idItem: `csv_${i}_${slugifyAdmin(desc)}`,
            medida: desc,
            grupo: grupo || "GERAL",
            estoque: 1,
            origem: 'csv'
        });
    }

    return prods;
}

// --- OBTENÇÃO DA LISTA UNIFICADA (CSV + MANUAIS) ---
function obterListaUnificadaProdutos() {
    let listaCSV = [...produtosCSVCarregadosAdmin];

    // Remove itens excluídos pelo admin
    const removidosCSV = JSON.parse(localStorage.getItem("rqm_csv_removidos")) || [];
    listaCSV = listaCSV.filter(p => !removidosCSV.includes(p.idItem));

    // Aplica edições feitas pelo admin nos itens do CSV
    const editadosCSV = JSON.parse(localStorage.getItem("rqm_csv_editados")) || {};
    listaCSV = listaCSV.map(p => {
        if (editadosCSV[p.idItem]) {
            return { ...p, ...editadosCSV[p.idItem] };
        }
        return p;
    });

    // Puxa produtos cadastrados manualmente
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    const manuaisFormatados = manuais.map((m, idx) => ({
        idItem: m.idItem || `manual_${idx}`,
        grupo: m.grupo || "MANUAL",
        medida: m.medida || m.nome,
        estoque: m.estoque !== undefined ? m.estoque : 1,
        origem: 'manual',
        indexManual: idx
    }));

    return [...manuaisFormatados, ...listaCSV];
}

// --- RENDERIZAÇÃO E PESQUISA ---
function carregarTodosProdutosAdmin(termoBusca = '') {
    const container = document.querySelector("#tabela-produtos-manuais tbody") || 
                      document.querySelector("#tabela-produtos-manuais") ||
                      document.querySelector("table tbody");

    if (!container) return;

    const termo = normalizeTextAdmin(termoBusca);
    const todosProdutos = obterListaUnificadaProdutos();

    const filtrados = todosProdutos.filter(prod => {
        const m = normalizeTextAdmin(prod.medida);
        const g = normalizeTextAdmin(prod.grupo);
        return m.includes(termo) || g.includes(termo);
    });

    if (filtrados.length === 0) {
        container.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 1.5rem;">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    container.innerHTML = filtrados.map(prod => {
        const idEnc = encodeURIComponent(JSON.stringify(prod));
        const statusEstoque = prod.estoque ? '<span style="color:#10b981; font-weight:600;">Em Estoque</span>' : '<span style="color:#ef4444; font-weight:600;">Indisponível</span>';
        const tagOrigem = prod.origem === 'manual' 
            ? `<span style="font-size:0.75rem; background:#3b82f6; color:#fff; padding:2px 8px; border-radius:4px; font-weight:bold;">MANUAL</span>` 
            : `<span style="font-size:0.75rem; background:#64748b; color:#fff; padding:2px 8px; border-radius:4px; font-weight:bold;">CSV</span>`;

        return `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">${tagOrigem}</td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: bold; color: #fff;">
                    ${prod.medida}
                    <small style="display:block; color:#94a3b8; font-weight:normal;">Grupo: ${prod.grupo}</small>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">${statusEstoque}</td>
                <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">
                    <button onclick="prepararEdicaoProduto('${idEnc}')" style="background: #f59e0b; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 4px;">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button onclick="removerProdutoAdmin('${idEnc}')" style="background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// --- ADICIONAR, EDITAR E REMOVER PRODUTOS ---
function adicionarOuEditarProduto(e) {
    e.preventDefault();

    const inputIndex = document.getElementById("input-index-manual");
    const inputIdItem = document.getElementById("input-id-item-edit") || { value: "" };
    const selectGrupo = document.getElementById("select-grupo-manual") || document.querySelector("select");
    const inputMedida = document.getElementById("input-medida-manual") || document.querySelector("input[placeholder*='Tubo']");
    const selectEstoque = document.getElementById("select-estoque-manual");

    if (!inputMedida || !inputMedida.value.trim()) return;

    const indexManual = parseInt(inputIndex ? inputIndex.value : "-1");
    const idItem = inputIdItem.value;

    const prodDados = {
        grupo: selectGrupo ? selectGrupo.value : "Geral",
        medida: inputMedida.value.trim().toUpperCase(),
        estoque: selectEstoque ? parseInt(selectEstoque.value) : 1
    };

    if (idItem && idItem.startsWith("csv_")) {
        const editadosCSV = JSON.parse(localStorage.getItem("rqm_csv_editados")) || {};
        editadosCSV[idItem] = prodDados;
        localStorage.setItem("rqm_csv_editados", JSON.stringify(editadosCSV));
        mostrarToastAdmin("Produto do CSV editado com sucesso!");
    } else {
        const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
        if (indexManual >= 0 && indexManual < manuais.length) {
            manuais[indexManual] = prodDados;
            mostrarToastAdmin("Produto manual alterado com sucesso!");
        } else {
            prodDados.idItem = `manual_${Date.now()}`;
            manuais.push(prodDados);
            mostrarToastAdmin("Novo produto cadastrado!");
        }
        localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));
    }

    cancelarEdicaoManual();
    carregarTodosProdutosAdmin();
    carregarEstatisticas();
}

window.prepararEdicaoProduto = function(encodedData) {
    const prod = JSON.parse(decodeURIComponent(encodedData));
    if (!prod) return;

    const inputIndex = document.getElementById("input-index-manual");
    let inputIdItem = document.getElementById("input-id-item-edit");

    if (!inputIdItem) {
        inputIdItem = document.createElement("input");
        inputIdItem.type = "hidden";
        inputIdItem.id = "input-id-item-edit";
        const form = document.getElementById("form-add-produto") || document.querySelector("form");
        if (form) form.appendChild(inputIdItem);
    }

    if (inputIndex) inputIndex.value = prod.origem === 'manual' ? prod.indexManual : "-1";
    if (inputIdItem) inputIdItem.value = prod.idItem;

    const selectGrupo = document.getElementById("select-grupo-manual") || document.querySelector("select");
    const inputMedida = document.getElementById("input-medida-manual") || document.querySelector("input[placeholder*='Tubo']");
    const selectEstoque = document.getElementById("select-estoque-manual");

    if (selectGrupo) selectGrupo.value = prod.grupo;
    if (inputMedida) inputMedida.value = prod.medida;
    if (selectEstoque) selectEstoque.value = prod.estoque ? "1" : "0";

    mostrarToastAdmin(`Editando: ${prod.medida}`);
    window.scrollTo({ top: 100, behavior: 'smooth' });
};

window.cancelarEdicaoManual = function() {
    const inputIndex = document.getElementById("input-index-manual");
    if (inputIndex) inputIndex.value = "-1";

    const inputIdItem = document.getElementById("input-id-item-edit");
    if (inputIdItem) inputIdItem.value = "";

    const inputMedida = document.getElementById("input-medida-manual") || document.querySelector("input[placeholder*='Tubo']");
    if (inputMedida) inputMedida.value = "";
};

window.removerProdutoAdmin = function(encodedData) {
    if (!confirm("Deseja realmente excluir este produto da exibição?")) return;

    const prod = JSON.parse(decodeURIComponent(encodedData));

    if (prod.origem === 'manual') {
        const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
        manuais.splice(prod.indexManual, 1);
        localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));
    } else {
        const removidosCSV = JSON.parse(localStorage.getItem("rqm_csv_removidos")) || [];
        if (!removidosCSV.includes(prod.idItem)) {
            removidosCSV.push(prod.idItem);
            localStorage.setItem("rqm_csv_removidos", JSON.stringify(removidosCSV));
        }
    }

    cancelarEdicaoManual();
    carregarTodosProdutosAdmin();
    carregarEstatisticas();
    mostrarToastAdmin("Produto removido com sucesso!");
};

// --- ESTATÍSTICAS E DEMAIS CONFIGURAÇÕES ---
function carregarEstatisticas() {
    const elAcessos = document.getElementById("stat-acessos");
    const elCotacoes = document.getElementById("stat-cotacoes");
    const elManuais = document.getElementById("stat-manuais");

    const acessos = localStorage.getItem("rqm_acessos") || "0";
    const cotacoes = localStorage.getItem("rqm_cotacoes_cont") || "0";
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];

    if (elAcessos) elAcessos.innerText = acessos;
    if (elCotacoes) elCotacoes.innerText = cotacoes;
    if (elManuais) elManuais.innerText = manuais.length;
}

function carregarPalavrasBloqueadas() {
    const container = document.getElementById("lista-palavras-bloqueadas");
    if (!container) return;

    const palavrasPadrao = ["SERVICO", "FRETE", "DESCONTO", "SUCATA", "TESTE", "TAXA"];
    const palavras = JSON.parse(localStorage.getItem("rqm_palavras_bloqueadas")) || palavrasPadrao;

    container.innerHTML = palavras.map((palavra, index) => `
        <span style="display: inline-flex; align-items: center; gap: 8px; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid #ef4444; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
            ${palavra}
            <button onclick="removerPalavraBloqueada(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold; font-size: 1rem;">✕</button>
        </span>
    `).join('');
}

function adicionarPalavraBloqueada(e) {
    e.preventDefault();
    const input = document.getElementById("input-palavra-bloqueada");
    if (!input) return;

    const palavra = input.value.trim().toUpperCase();
    if (!palavra) return;

    const palavrasPadrao = ["SERVICO", "FRETE", "DESCONTO", "SUCATA", "TESTE", "TAXA"];
    const palavras = JSON.parse(localStorage.getItem("rqm_palavras_bloqueadas")) || palavrasPadrao;

    if (!palavras.includes(palavra)) {
        palavras.push(palavra);
        localStorage.setItem("rqm_palavras_bloqueadas", JSON.stringify(palavras));
        carregarPalavrasBloqueadas();
        input.value = "";
        mostrarToastAdmin("Palavra bloqueada!");
    }
}

window.removerPalavraBloqueada = function(index) {
    const palavrasPadrao = ["SERVICO", "FRETE", "DESCONTO", "SUCATA", "TESTE", "TAXA"];
    const palavras = JSON.parse(localStorage.getItem("rqm_palavras_bloqueadas")) || palavrasPadrao;

    palavras.splice(index, 1);
    localStorage.setItem("rqm_palavras_bloqueadas", JSON.stringify(palavras));
    carregarPalavrasBloqueadas();
    mostrarToastAdmin("Palavra removida!");
};

function carregarConfiguracoes() {
    const inputNome = document.getElementById("input-empresa-nome");
    const inputNum = document.getElementById("input-whatsapp-num");
    const inputMsg = document.getElementById("input-wsp-mensagem");
    const inputAviso = document.getElementById("input-banner-aviso");
    const checkManutencao = document.getElementById("check-modo-manutencao");

    if (inputNome) inputNome.value = localStorage.getItem("rqm_empresa_nome") || "RQM Estamparia";
    if (inputNum) inputNum.value = localStorage.getItem("rqm_whatsapp_num") || "5511917348484";
    if (inputMsg) inputMsg.value = localStorage.getItem("rqm_wsp_mensagem") || "Olá! Gostaria de fazer uma cotação dos seguintes itens:";
    if (inputAviso) inputAviso.value = localStorage.getItem("rqm_banner_aviso") || "";
    if (checkManutencao) checkManutencao.checked = localStorage.getItem("rqm_modo_manutencao") === "true";
}

function salvarConfiguracoes(e) {
    e.preventDefault();

    const inputNome = document.getElementById("input-empresa-nome");
    const inputNum = document.getElementById("input-whatsapp-num");
    const inputMsg = document.getElementById("input-wsp-mensagem");
    const inputAviso = document.getElementById("input-banner-aviso");
    const checkManutencao = document.getElementById("check-modo-manutencao");

    if (inputNum) {
        let num = inputNum.value.replace(/\D/g, '');
        if (num.length >= 10 && !num.startsWith("55")) num = "55" + num;
        localStorage.setItem("rqm_whatsapp_num", num);
    }

    if (inputNome) localStorage.setItem("rqm_empresa_nome", inputNome.value.trim());
    if (inputMsg) localStorage.setItem("rqm_wsp_mensagem", inputMsg.value.trim());
    if (inputAviso) localStorage.setItem("rqm_banner_aviso", inputAviso.value.trim());
    if (checkManutencao) localStorage.setItem("rqm_modo_manutencao", checkManutencao.checked ? "true" : "false");

    mostrarToastAdmin("Configurações salvas!");
}

function fazerUploadCSVManual(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        localStorage.setItem("rqm_custom_csv", evt.target.result);
        mostrarToastAdmin("Base CSV atualizada!");
        inicializarBaseCSVAdmin().then(() => carregarTodosProdutosAdmin());
    };
    reader.readAsText(file, "ISO-8859-1");
}

function mostrarToastAdmin(mensagem, tipo = 'success') {
    let container = document.getElementById('toast-container-admin');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-admin';
        container.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;`;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `background: ${tipo === 'error' ? '#ef4444' : '#10b981'}; color: #fff; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; shadow: 0 4px 12px rgba(0,0,0,0.3);`;
    toast.textContent = mensagem;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}