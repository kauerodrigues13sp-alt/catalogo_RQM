/* ==========================================================================
   PAINEL ADMINISTRATIVO RQM - ADMIN.JS (CÓDIGO COMPLETO)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    carregarEstatisticas();
    carregarPalavrasBloqueadas();
    carregarProdutosManuais();
    carregarConfiguracoes();

    const formProduto = document.getElementById("form-add-produto");
    if (formProduto) formProduto.addEventListener("submit", adicionarOuEditarProdutoManual);

    const formBloqueio = document.getElementById("form-add-bloqueio");
    if (formBloqueio) formBloqueio.addEventListener("submit", adicionarPalavraBloqueada);

    const formConfig = document.getElementById("form-configuracoes");
    if (formConfig) formConfig.addEventListener("submit", salvarConfiguracoes);

    const inputCsv = document.getElementById("input-csv-upload");
    if (inputCsv) inputCsv.addEventListener("change", fazerUploadCSVManual);
});

// --- 1. ESTATÍSTICAS ---
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

// --- 2. PALAVRAS BLOQUEADAS ---
function carregarPalavrasBloqueadas() {
    const container = document.getElementById("lista-palavras-bloqueadas");
    if (!container) return;

    const palavrasPadrao = ["SERVICO", "FRETE", "DESCONTO", "SUCATA", "TESTE", "TAXA"];
    const palavras = JSON.parse(localStorage.getItem("rqm_palavras_bloqueadas")) || palavrasPadrao;

    if (palavras.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma palavra bloqueada.</p>`;
        return;
    }

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
    } else {
        mostrarToastAdmin("Palavra já existente.", "error");
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

// --- 3. PRODUTOS MANUAIS (EDITAR / EXCLUIR) ---
function carregarProdutosManuais() {
    const container = document.getElementById("tabela-produtos-manuais");
    if (!container) return;

    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];

    if (manuais.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1rem;">Nenhum produto cadastrado manualmente.</td></tr>`;
        return;
    }

    container.innerHTML = manuais.map((prod, index) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">${prod.grupo.toUpperCase()}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">${prod.categoria}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--border-color); font-weight: bold;">${prod.medida}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--border-color);">${prod.estoque ? 'Em Estoque' : 'Indisponível'}</td>
            <td style="padding: 10px; border-bottom: 1px solid var(--border-color); text-align: right;">
                <button onclick="prepararEdicaoManual(${index})" class="btn-editar" style="margin-right: 5px;">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button onclick="removerProdutoManual(${index})" class="btn-danger">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

function adicionarOuEditarProdutoManual(e) {
    e.preventDefault();
    const inputIndex = document.getElementById("input-index-manual");
    const selectGrupo = document.getElementById("select-grupo-manual");
    const inputCategoria = document.getElementById("input-categoria-manual");
    const inputMedida = document.getElementById("input-medida-manual");
    const selectEstoque = document.getElementById("select-estoque-manual");

    if (!selectGrupo || !inputMedida) return;

    const index = parseInt(inputIndex.value);
    const prodDados = {
        grupo: selectGrupo.value,
        categoria: inputCategoria.value.trim() || "Geral",
        medida: inputMedida.value.trim().toUpperCase(),
        estoque: parseInt(selectEstoque.value) || 1
    };

    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];

    if (index >= 0 && index < manuais.length) {
        manuais[index] = prodDados;
        mostrarToastAdmin("Produto alterado com sucesso!");
    } else {
        manuais.push(prodDados);
        mostrarToastAdmin("Produto cadastrado!");
    }

    localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));

    cancelarEdicaoManual();
    carregarProdutosManuais();
    carregarEstatisticas();
}

window.prepararEdicaoManual = function(index) {
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    const prod = manuais[index];
    if (!prod) return;

    document.getElementById("input-index-manual").value = index;
    document.getElementById("select-grupo-manual").value = prod.grupo;
    document.getElementById("input-categoria-manual").value = prod.categoria;
    document.getElementById("input-medida-manual").value = prod.medida;
    document.getElementById("select-estoque-manual").value = prod.estoque ? "1" : "0";

    document.getElementById("titulo-form-manual").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Modificar Produto Manual`;
    document.getElementById("btn-salvar-manual").innerHTML = `<i class="fa-solid fa-check"></i> Salvar Alteração`;
    document.getElementById("btn-cancelar-edicao").style.display = "inline-flex";

    window.scrollTo({ top: 100, behavior: 'smooth' });
};

window.cancelarEdicaoManual = function() {
    document.getElementById("input-index-manual").value = "-1";
    document.getElementById("input-medida-manual").value = "";
    document.getElementById("input-categoria-manual").value = "";
    
    document.getElementById("titulo-form-manual").innerHTML = `<i class="fa-solid fa-plus-circle"></i> Cadastrar Produto Manualmente`;
    document.getElementById("btn-salvar-manual").innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Salvar`;
    document.getElementById("btn-cancelar-edicao").style.display = "none";
};

window.removerProdutoManual = function(index) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    manuais.splice(index, 1);
    localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));

    cancelarEdicaoManual();
    carregarProdutosManuais();
    carregarEstatisticas();
    mostrarToastAdmin("Produto excluído com sucesso.");
};

// --- 4. CONFIGURAÇÕES (WHATSAPP, BANNER E MANUTENÇÃO) ---
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
        if (num.length < 10) {
            mostrarToastAdmin("Número de WhatsApp inválido.", "error");
            return;
        }
        if (!num.startsWith("55")) num = "55" + num;
        localStorage.setItem("rqm_whatsapp_num", num);
    }

    if (inputNome) localStorage.setItem("rqm_empresa_nome", inputNome.value.trim());
    if (inputMsg) localStorage.setItem("rqm_wsp_mensagem", inputMsg.value.trim());
    if (inputAviso) localStorage.setItem("rqm_banner_aviso", inputAviso.value.trim());
    if (checkManutencao) localStorage.setItem("rqm_modo_manutencao", checkManutencao.checked ? "true" : "false");

    mostrarToastAdmin("Configurações salvas!");
}

// --- 5. CSV UPLOAD ---
function fazerUploadCSVManual(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        localStorage.setItem("rqm_custom_csv", evt.target.result);
        mostrarToastAdmin("CSV atualizado no navegador!");
    };
    reader.readAsText(file, "ISO-8859-1");
}

window.limparCSVPersonalizado = function() {
    localStorage.removeItem("rqm_custom_csv");
    mostrarToastAdmin("Restaurado ao CSV original.");
};

// --- TOAST FEEDBACK ---
function mostrarToastAdmin(mensagem, tipo = 'success') {
    let container = document.getElementById('toast-container-admin');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-admin';
        container.style.cssText = `position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;`;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `background: ${tipo === 'error' ? '#ef4444' : '#10b981'}; color: #fff; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem;`;
    toast.textContent = mensagem;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}