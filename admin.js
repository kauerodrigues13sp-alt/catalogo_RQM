/* ==========================================================================
   GERENCIADOR INTERNO RQM - LÓGICA DO PAINEL ADMIN COM SENHA
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initThemeAdmin();
    verificarSessaoAdmin();

    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();

            const inputSenha = document.getElementById("admin-pass").value;
            const SENHA_CORRETA = "admin123";

            if (inputSenha === SENHA_CORRETA) {
                sessionStorage.setItem("rqm_admin_logged", "true");
                document.getElementById("admin-pass").value = ""; // Limpa a senha digitada
                carregarPainelAdmin();
            } else {
                alert("Senha incorreta! Tente novamente.");
            }
        });
    }
});

function initThemeAdmin() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.innerText = '☀️';
    } else {
        if (themeIcon) themeIcon.innerText = '🌙';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (themeIcon) {
                themeIcon.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
            }
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }
}

function verificarSessaoAdmin() {
    // Usa sessionStorage para não salvar permanentemente no navegador
    if (sessionStorage.getItem("rqm_admin_logged") === "true") {
        carregarPainelAdmin();
    } else {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("admin-panel").style.display = "none";
    }
}

function carregarPainelAdmin() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";

    renderMetricass();
    renderProdutosManuais();
    carregarPersonalizacaoVisual();
    renderHistoricoCotacoes();
    renderDepoimentosAdmin();
    
    document.getElementById("cfg-whatsapp").value = localStorage.getItem("rqm_whatsapp_num") || "5511917348484";
}

function fazerLogoutAdmin() {
    sessionStorage.removeItem("rqm_admin_logged");
    location.reload();
}

function renderMetricass() {
    document.getElementById("stat-acessos").innerText = localStorage.getItem("rqm_acessos") || "0";
    document.getElementById("stat-cotacoes").innerText = localStorage.getItem("rqm_cotacoes_cont") || "0";
    const revs = JSON.parse(localStorage.getItem("rqm_reviews")) || [];
    document.getElementById("stat-reviews").innerText = revs.length;
}

/* --- MÓDULO A: PRODUTOS MANUAIS --- */
function adicionarProdutoManual() {
    const grupo = document.getElementById("manual-grupo").value;
    const categoria = document.getElementById("manual-categoria").value.trim();
    const medida = document.getElementById("manual-medida").value.trim().toUpperCase();
    const estoque = parseInt(document.getElementById("manual-estoque").value);

    if (!categoria || !medida) {
        alert("Preencha a subcategoria e a medida do produto!");
        return;
    }

    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    manuais.push({ id: "man-" + Date.now(), grupo, categoria, medida, estoque });

    localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));
    
    document.getElementById("manual-categoria").value = "";
    document.getElementById("manual-medida").value = "";
    
    renderProdutosManuais();
    alert("Produto cadastrado com sucesso!");
}

function renderProdutosManuais() {
    const container = document.getElementById("lista-produtos-manuais");
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];

    if (manuais.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Nenhum produto cadastrado manualmente.</p>`;
        return;
    }

    container.innerHTML = manuais.map((p, idx) => `
        <div class="item-row-admin">
            <div>
                <strong>${p.medida}</strong>
                <span style="font-size:0.8rem; color:var(--text-muted); display:block;">Grupo: ${p.grupo} | ${p.categoria}</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <button onclick="alternarEstoqueManual(${idx})" class="btn-filter" style="padding:4px 8px; font-size:0.75rem;">
                    ${p.estoque ? '🟢 Em Estoque' : '🔴 Indisponível'}
                </button>
                <button onclick="excluirProdutoManual(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function alternarEstoqueManual(index) {
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    manuais[index].estoque = manuais[index].estoque === 1 ? 0 : 1;
    localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));
    renderProdutosManuais();
}

function excluirProdutoManual(index) {
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    manuais.splice(index, 1);
    localStorage.setItem("rqm_produtos_manuais", JSON.stringify(manuais));
    renderProdutosManuais();
}

/* --- MÓDULO B: PERSONALIZAÇÃO VISUAL --- */
function carregarPersonalizacaoVisual() {
    document.getElementById("cfg-hero-text").value = localStorage.getItem("rqm_hero_subtitle") || "";
    document.getElementById("cfg-primary-color").value = localStorage.getItem("rqm_primary_color") || "#f59e0b";
}

function salvarPersonalizacaoVisual() {
    const sub = document.getElementById("cfg-hero-text").value.trim();
    const cor = document.getElementById("cfg-primary-color").value;

    if (sub) localStorage.setItem("rqm_hero_subtitle", sub);
    localStorage.setItem("rqm_primary_color", cor);

    alert("Personalizações visuais salvas!");
}

/* --- MÓDULO C: HISTÓRICO DE COTAÇÕES --- */
function renderHistoricoCotacoes() {
    const container = document.getElementById("container-historico-cotacoes");
    const hist = JSON.parse(localStorage.getItem("rqm_historico_cotacoes")) || [];

    if (hist.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Nenhum histórico registrado até o momento.</p>`;
        return;
    }

    container.innerHTML = hist.map(c => `
        <div class="item-row-admin" style="flex-direction:column; align-items:flex-start; gap:5px;">
            <div style="display:flex; justify-content:space-between; width:100%;">
                <strong>👤 ${c.nome}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted);">${c.data}</span>
            </div>
            <p style="font-size:0.85rem; color:var(--text-main); margin:0;">${c.resumo}</p>
        </div>
    `).join('');
}

function limparHistoricoCotacoes() {
    if (confirm("Deseja realmente apagar o histórico de cotações?")) {
        localStorage.removeItem("rqm_historico_cotacoes");
        renderHistoricoCotacoes();
    }
}

/* --- MÓDULO D: DEPOIMENTOS E DESTAQUES --- */
function renderDepoimentosAdmin() {
    const container = document.getElementById("container-admin-reviews");
    const reviews = JSON.parse(localStorage.getItem("rqm_reviews")) || [];

    if (reviews.length === 0) {
        container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">Nenhum depoimento cadastrado.</p>`;
        return;
    }

    container.innerHTML = reviews.map((rev, index) => `
        <div class="item-row-admin">
            <div>
                <strong>${rev.autor}</strong> (${rev.nota}★) ${rev.destaque ? '<span class="badge-destaque">Destaque</span>' : ''}
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">"${rev.texto}"</p>
            </div>
            <div style="display:flex; gap:10px;">
                <button onclick="alternarDestaqueDepoimento(${index})" class="btn-filter" style="padding:4px 8px; font-size:0.75rem;">
                    ${rev.destaque ? 'Remover Destaque' : '⭐ Destacar'}
                </button>
                <button onclick="excluirDepoimentoAdmin(${index})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function alternarDestaqueDepoimento(index) {
    let reviews = JSON.parse(localStorage.getItem("rqm_reviews")) || [];
    reviews[index].destaque = !reviews[index].destaque;
    localStorage.setItem("rqm_reviews", JSON.stringify(reviews));
    renderDepoimentosAdmin();
}

function excluirDepoimentoAdmin(index) {
    let reviews = JSON.parse(localStorage.getItem("rqm_reviews")) || [];
    reviews.splice(index, 1);
    localStorage.setItem("rqm_reviews", JSON.stringify(reviews));
    renderDepoimentosAdmin();
    renderMetricass();
}

/* --- OUTRAS CONFIGURAÇÕES --- */
function salvarWhatsappAdmin() {
    const num = document.getElementById("cfg-whatsapp").value.replace(/\D/g, '');
    if (num.length < 10) { alert("Número inválido!"); return; }
    localStorage.setItem("rqm_whatsapp_num", num);
    alert("WhatsApp atualizado!");
}