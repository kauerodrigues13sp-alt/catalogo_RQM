/* ==========================================================================
   CATÁLOGO DIGITAL RQM - CÓDIGO COMPLETO INTEGRADO
   (Estoque Collines + Busca Global + Pesquisa Interna nos Grupos)
   ========================================================================== */

let catalogoGrupos = [];
let cart = [];
let activeFilter = 'todos';
let activeQuery = '';

const badge = document.getElementById('wishlistBadge');
const countSpan = document.getElementById('wishlistCount');
const modal = document.getElementById('wishlistModal');
const overlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');

const PALAVRAS_BLOQUEADAS = ["SERVICO", "FRETE", "DESCONTO", "SUCATA", "TESTE", "TAXA"];

const IMAGENS_GRUPOS = {
    "tubos": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
    "cantoneiras": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400",
    "chato": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    "roldanas": "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=400",
    "discos": "https://images.unsplash.com/photo-1513828583835-c527ebc50322?auto=format&fit=crop&q=80&w=400",
    "padrao": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400"
};

// --- 1. LEITURA E PARSING INTELIGENTE DO PRODUTOS.CSV ---
function carregarDadosDoCSV() {
    if (typeof Papa === 'undefined') {
        console.error("Biblioteca PapaParse não encontrada! Verifique o script no index.html.");
        return;
    }

    Papa.parse("PRODUTOS.CSV", {
        download: true,
        header: false,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("Linhas lidas no CSV:", results.data.length);
            
            const linhas = results.data;
            if (!linhas || linhas.length === 0) return;

            let idxDescricao = -1;
            let idxUnidade = -1;
            let idxSituacao = -1;
            let idxQtde = -1;
            let linhaInicioDados = 0;

            for (let i = 0; i < Math.min(10, linhas.length); i++) {
                const linhaStr = linhas[i].map(c => String(c).toUpperCase().trim());
                
                const posDesc = linhaStr.findIndex(c => c.includes("DESCRIÇ") || c.includes("DESCRICAO"));
                if (posDesc !== -1 && idxDescricao === -1) idxDescricao = posDesc;

                const posUn = linhaStr.findIndex(c => c.includes("UNIDADE") || c === "UN");
                if (posUn !== -1 && idxUnidade === -1) idxUnidade = posUn;

                const posSit = linhaStr.findIndex(c => c.includes("SITUAÇ") || c.includes("SITUACAO") || c === "SIT");
                if (posSit !== -1 && idxSituacao === -1) idxSituacao = posSit;

                const posQtd = linhaStr.findIndex(c => 
                    c.includes("QTDE ATUAL") || 
                    c.includes("ESTOQUE ATUAL") || 
                    c === "QTDE" || 
                    c === "ESTOQUE" || 
                    c === "SALDO"
                );
                if (posQtd !== -1 && idxQtde === -1) idxQtde = posQtd;

                if (idxDescricao !== -1 && idxQtde !== -1) {
                    linhaInicioDados = i + 1;
                }
            }

            if (idxDescricao === -1) idxDescricao = 2; 
            if (idxUnidade === -1) idxUnidade = 4;     
            if (idxSituacao === -1) idxSituacao = 6;   
            if (idxQtde === -1) idxQtde = 9;           

            console.log(`[CSV Mapeado] Coluna Descrição: ${idxDescricao} | Coluna Estoque: ${idxQtde} | Coluna Situação: ${idxSituacao}`);

            const gruposTemp = {};

            for (let i = linhaInicioDados; i < linhas.length; i++) {
                const linha = linhas[i];
                if (!linha || !linha[idxDescricao]) continue;

                let descricao = String(linha[idxDescricao]).trim();
                const unidadeRaw = linha[idxUnidade] ? String(linha[idxUnidade]).trim().toUpperCase() : "UN";
                const situacao = linha[idxSituacao] ? String(linha[idxSituacao]).trim().toUpperCase() : "ATIVO";

                if (situacao.includes("INAT") || situacao === "I" || situacao.includes("BLOQ") || situacao.includes("CANCEL")) {
                    continue;
                }

                if (!descricao || descricao.toUpperCase().includes("DESCRIÇÃO") || descricao.toUpperCase().includes("DESCRICAO")) {
                    continue;
                }

                let qtdeEstoque = 0;
                if (linha[idxQtde] !== undefined && linha[idxQtde] !== null) {
                    let strVal = String(linha[idxQtde]).trim()
                        .replace(/[^\d.,-]/g, '')
                        .replace(',', '.');

                    const qtdeParsed = parseFloat(strVal);
                    if (!isNaN(qtdeParsed)) {
                        qtdeEstoque = qtdeParsed;
                    }
                }

                const ehBloqueado = PALAVRAS_BLOQUEADAS.some(p => descricao.toUpperCase().includes(p));
                if (ehBloqueado) continue;

                descricao = descricao
                    .replace(/\s*[-\/]\s*OK$/i, '')
                    .replace(/\s+OK$/i, '')
                    .replace(/\s*[\/-]\s*$/, '')
                    .trim();

                let idGrupo = "acessorios";
                let nomeGrupo = "Acessórios e Diversos";
                let tipoFiltro = "acessorios";
                let nomeCategoria = "Geral";
                let imagem = IMAGENS_GRUPOS.padrao;
                let permitirFracao = false;
                let unidadeMedia = "unidade(s)";

                const desc = descricao.toUpperCase();

                if (desc.includes("TUBO QUA") || desc.includes("TUBO QUAD") || desc.includes("TUBO RET") || desc.includes("TUBO RED") || desc.includes("TUBO SCH")) {
                    idGrupo = "tubos";
                    nomeGrupo = "Tubos Industriais";
                    tipoFiltro = "perfis";
                    imagem = IMAGENS_GRUPOS.tubos;
                    permitirFracao = true;
                    unidadeMedia = "barra(s)";

                    if (desc.includes("TUBO RED") || desc.includes("TUBO SCH")) nomeCategoria = "Tubos Redondos";
                    else if (desc.includes("TUBO QUA")) nomeCategoria = "Tubos Quadrados";
                    else if (desc.includes("TUBO RET")) nomeCategoria = "Tubos Retangulares";
                } else if (desc.includes("CANTONEIRA")) {
                    idGrupo = "cantoneiras";
                    nomeGrupo = "Cantoneiras";
                    tipoFiltro = "perfis";
                    imagem = IMAGENS_GRUPOS.cantoneiras;
                    permitirFracao = true;
                    unidadeMedia = "barra(s)";
                    nomeCategoria = "Abas Iguais";
                } else if (desc.includes("FERRO CHATO") || desc.includes("BARRA CHATA")) {
                    idGrupo = "chato";
                    nomeGrupo = "Ferro Chato";
                    tipoFiltro = "perfis";
                    imagem = IMAGENS_GRUPOS.chato;
                    permitirFracao = true;
                    unidadeMedia = "barra(s)";
                    nomeCategoria = "Perfil Padrão";
                } else if (desc.includes("ROLDANA")) {
                    idGrupo = "roldanas";
                    nomeGrupo = "Roldanas e Guias";
                    tipoFiltro = "acessorios";
                    imagem = IMAGENS_GRUPOS.roldanas;
                    nomeCategoria = "Roldanas";
                } else if (desc.includes("GONZO")) {
                    idGrupo = "gonzos";
                    nomeGrupo = "Gonzos e Dobradiças";
                    tipoFiltro = "acessorios";
                    imagem = IMAGENS_GRUPOS.padrao;
                    nomeCategoria = "Gonzos";
                } else if (desc.includes("DISCO")) {
                    idGrupo = "discos";
                    nomeGrupo = "Discos Estampados";
                    tipoFiltro = "estampados";
                    imagem = IMAGENS_GRUPOS.discos;
                    nomeCategoria = "Medidas Comuns";
                }

                if (unidadeRaw === "BR" || unidadeRaw === "MT") {
                    permitirFracao = true;
                    unidadeMedia = "barra(s)";
                }

                if (!gruposTemp[idGrupo]) {
                    gruposTemp[idGrupo] = {
                        idGrupo: idGrupo,
                        nomeGrupo: nomeGrupo,
                        tipoFiltro: tipoFiltro,
                        imagem: imagem,
                        unidadeMedia: unidadeMedia,
                        permitirFracao: permitirFracao,
                        categoriasMap: {}
                    };
                }

                if (!gruposTemp[idGrupo].categoriasMap[nomeCategoria]) {
                    gruposTemp[idGrupo].categoriasMap[nomeCategoria] = {
                        nomeCategoria: nomeCategoria,
                        itens: []
                    };
                }

                gruposTemp[idGrupo].categoriasMap[nomeCategoria].itens.push({
                    idItem: `csv-item-${i}`,
                    medida: descricao,
                    estoque: qtdeEstoque
                });
            }

            catalogoGrupos = Object.values(gruposTemp).map(g => ({
                idGrupo: g.idGrupo,
                nomeGrupo: g.nomeGrupo,
                tipoFiltro: g.tipoFiltro,
                imagem: g.imagem,
                unidadeMedia: g.unidadeMedia,
                permitirFracao: g.permitirFracao,
                categorias: Object.values(g.categoriasMap)
            }));

            renderCatalog();
            applyFiltersAndSearch();
        },
        error: function(err) {
            console.error("Erro ao ler PRODUTOS.CSV:", err);
        }
    });
}

// --- 2. GERENCIAMENTO DE TEMA ---
function initTheme() {
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

// --- 3. RENDERIZAÇÃO DOS CARDS ---
function renderCatalog() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = catalogoGrupos.map(grupo => `
        <div class="product-card" data-category="${grupo.tipoFiltro}" data-search-term="${grupo.nomeGrupo}" onclick="verDetalhesGrupo('${grupo.idGrupo}')">
            <img src="${grupo.imagem}" alt="${grupo.nomeGrupo}" class="product-img">
            <div class="product-card-body">
                <h3>${grupo.nomeGrupo} <i class="fa-solid fa-arrow-right" style="color: var(--primary); font-size:0.95rem;"></i></h3>
            </div>
        </div>
    `).join('');
}

// --- 4. DETALHES DO GRUPO + MINI PESQUISA INTERNA ---
window.verDetalhesGrupo = function(idGrupo, filtroInterno = null) {
    const grupo = catalogoGrupos.find(g => g.idGrupo === idGrupo);
    if (!grupo) return;

    document.getElementById('detalhe-titulo-grupo').innerText = grupo.nomeGrupo;
    const containerCategorias = document.getElementById('detalhe-conteudo-categorias');
    
    // Se não passar filtro direto, usa o termo da pesquisa global da página inicial
    const termoBusca = (filtroInterno !== null) ? filtroInterno : activeQuery;
    const queryNorm = normalizeText(termoBusca);

    // Cria/Prepara o campo de mini pesquisa no topo do grupo
    let miniBuscaHtml = `
        <div style="margin-bottom: 1.5rem; display: flex; gap: 10px; align-items: center; background: var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
            <i class="fa-solid fa-magnifying-glass" style="color: var(--primary);"></i>
            <input type="text" id="inputMiniBusca" placeholder="Pesquisar medida ou produto neste grupo..." value="${termoBusca}" 
                   oninput="filtrarProdutosNoGrupo('${grupo.idGrupo}', this.value)"
                   style="width: 100%; border: none; background: transparent; color: var(--text-main); font-size: 0.95rem; outline: none;">
            ${termoBusca ? `<button onclick="filtrarProdutosNoGrupo('${grupo.idGrupo}', '')" style="background:none; border:none; color:var(--text-main); cursor:pointer;">✕</button>` : ''}
        </div>
    `;
    
    let htmlCategorias = '';

    grupo.categorias.forEach(cat => {
        let itensParaExibir = cat.itens;
        
        if (queryNorm.length > 1) {
            const matchNaCat = normalizeText(cat.nomeCategoria).includes(queryNorm);
            const matchNoGrupo = normalizeText(grupo.nomeGrupo).includes(queryNorm);
            
            if (!matchNaCat && !matchNoGrupo) {
                itensParaExibir = cat.itens.filter(i => normalizeText(i.medida).includes(queryNorm));
            }
        }

        if (itensParaExibir.length === 0) return;

        const htmlItens = itensParaExibir.map(item => {
            const step = grupo.permitirFracao ? 0.5 : 1;
            const valorInicial = grupo.permitirFracao ? "1.0" : "1";

            const itemDadosString = btoa(unescape(encodeURIComponent(JSON.stringify({
                grupo: grupo.nomeGrupo,
                categoria: cat.nomeCategoria,
                medida: item.medida,
                idItem: item.idItem,
                unidade: grupo.unidadeMedia
            }))));

            const ehItemBuscado = queryNorm.length > 1 && normalizeText(item.medida).includes(queryNorm);
            const estiloLinha = ehItemBuscado ? "background-color: rgba(245, 158, 11, 0.15);" : "";

            const badgeEstoque = item.estoque > 0 
                ? `<span style="display:inline-block; margin-left:8px; font-size:0.75rem; color:#10b981; background:#10b98115; padding:2px 6px; border-radius:4px; font-weight:600;">Em estoque (${item.estoque})</span>`
                : `<span style="display:inline-block; margin-left:8px; font-size:0.75rem; color:#f59e0b; background:#f59e0b15; padding:2px 6px; border-radius:4px; font-weight:600;">Sob consulta (${item.estoque})</span>`;

            return `
                <tr style="${estiloLinha}">
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">
                        ${item.medida} ${badgeEstoque}
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); width: 160px;">
                        <div class="quantity-control">
                            <button class="btn-qty" onclick="alterarQtd('${item.idItem}', -${step})">-</button>
                            <input type="number" id="qtd-${item.idItem}" step="${step}" min="${step}" value="${valorInicial}" class="input-qty" readonly>
                            <button class="btn-qty" onclick="alterarQtd('${item.idItem}', ${step})">+</button>
                        </div>
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); text-align: right; width: 150px;">
                        <button id="btn-add-${item.idItem}" class="btn-add" onclick="processarInclusao('${itemDadosString}')">
                            + Solicitar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        htmlCategorias += `
            <div style="margin-bottom: 2.5rem; animation: fadeIn 0.4s ease;">
                <h4 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 0.8rem; text-transform: uppercase; text-align: left; font-weight:700;">➔ ${cat.nomeCategoria}</h4>
                <div style="width: 100%; overflow-x: auto; background-color: var(--bg-card); border-radius: 8px; border: 2px solid var(--border-color);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background-color: var(--border-color); color: var(--text-main); font-size: 0.85rem;">
                                <th style="padding: 10px;">Medida Padrão</th>
                                <th style="padding: 10px;">Qtd (${grupo.unidadeMedia})</th>
                                <th style="padding: 10px; text-align: right;">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${htmlItens}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    containerCategorias.innerHTML = miniBuscaHtml + (htmlCategorias || `<p style="text-align:center; padding:2rem; color: var(--text-main);">Nenhum produto correspondente encontrado para esta busca.</p>`);

    document.getElementById('view-grupos').style.display = 'none';
    document.getElementById('view-detalhes').style.display = 'block';
    
    if (filtroInterno === null) {
        window.scrollTo({ top: 250, behavior: 'smooth' });
    }
};

window.filtrarProdutosNoGrupo = function(idGrupo, valorBusca) {
    verDetalhesGrupo(idGrupo, valorBusca);
    // Mantém o foco no campo de mini busca após re-renderizar
    const input = document.getElementById('inputMiniBusca');
    if (input) {
        input.focus();
        input.setSelectionRange(valorBusca.length, valorBusca.length);
    }
};

window.alterarQtd = function(idItem, delta) {
    const input = document.getElementById(`qtd-${idItem}`);
    if (!input) return;
    
    let valAtual = parseFloat(input.value) || 0;
    let min = parseFloat(input.getAttribute('min')) || 1;
    let novoVal = valAtual + delta;
    
    if (novoVal < min) novoVal = min;
    
    input.value = (novoVal % 1 === 0) ? novoVal.toFixed(0) : novoVal.toFixed(1);
};

window.voltarParaGrupos = function() {
    document.getElementById('view-detalhes').style.display = 'none';
    document.getElementById('view-grupos').style.display = 'block';
};

// --- 5. CARRINHO / COTAÇÃO ---
window.processarInclusao = function(encodedData) {
    const item = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    const inputQtd = document.getElementById(`qtd-${item.idItem}`);
    const btn = document.getElementById(`btn-add-${item.idItem}`);
    
    if (!inputQtd) return;
    const qtdDigitada = parseFloat(inputQtd.value);

    if (isNaN(qtdDigitada) || qtdDigitada <= 0) {
        alert("Por favor, selecione uma quantidade válida.");
        return;
    }

    const itemExistente = cart.find(i => i.idItem === item.idItem);
    if (itemExistente) {
        itemExistente.quantidade = qtdDigitada;
    } else {
        cart.push({ 
            grupo: item.grupo, 
            categoria: item.categoria, 
            medida: item.medida, 
            idItem: item.idItem, 
            quantidade: qtdDigitada, 
            unidade: item.unidade 
        });
    }

    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado';
        btn.classList.add('included');
        setTimeout(() => {
            btn.innerHTML = '+ Solicitar';
            btn.classList.remove('included');
        }, 1000);
    }

    updateOrderUI();
};

window.removeItemFromOrder = function(idItem) {
    cart = cart.filter(item => item.idItem !== idItem);
    updateOrderUI();
};

function updateOrderUI() {
    const totalItems = cart.length;
    if (countSpan) countSpan.textContent = totalItems;

    if (totalItems > 0) {
        if (badge) badge.classList.add('show');
    } else {
        if (badge) badge.classList.remove('show');
        closeWishlistModal();
    }

    const container = document.getElementById('selected-items-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart-msg">Nenhum produto selecionado ainda.</p>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="wishlist-item-row" style="animation: fadeIn 0.3s ease;">
            <div>
                <span style="display: block; font-size: 0.75rem; color: #94a3b8;">${item.grupo} ➔ ${item.categoria}</span>
                <strong style="font-size: 0.9rem; color: #fff;">${item.medida}</strong>
                <div style="margin-top: 4px; font-size: 0.85rem; color: var(--primary); font-weight: bold;">
                    Qtd: ${item.quantidade} ${item.unidade}
                </div>
            </div>
            <button class="btn-remove" onclick="removeItemFromOrder('${item.idItem}')">
                ✕
            </button>
        </div>
    `).join('');
}

function openWishlistModal() {
    if (modal) modal.classList.add('open');
    if (overlay) overlay.classList.add('show');
}
function closeWishlistModal() {
    if (modal) modal.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

// --- 6. FILTROS E BUSCA GLOBAL ---
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^a-z0-9 ]/g, " ")     
        .replace(/\s+/g, " ")            
        .trim();
}

function applyFiltersAndSearch() {
    const catalogCards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    let visibleCount = 0;
    const normalizedQuery = normalizeText(activeQuery);

    catalogCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const cardTitle = card.getAttribute('data-search-term') || "";
        const grupo = catalogoGrupos.find(g => normalizeText(g.nomeGrupo) === normalizeText(cardTitle));

        let totalItensEncontrados = 0;
        let matchNoGrupo = normalizeText(cardTitle).includes(normalizedQuery);

        if (grupo && grupo.categorias) {
            grupo.categorias.forEach(cat => {
                if (cat.itens) {
                    cat.itens.forEach(item => {
                        if (normalizeText(item.medida).includes(normalizedQuery)) {
                            totalItensEncontrados++;
                        }
                    });
                }
            });
        }

        const matchesFilter = (activeFilter === 'todos' || category === activeFilter);
        const matchesSearch = matchNoGrupo || totalItensEncontrados > 0;

        let badgeBusca = card.querySelector('.search-match-badge');
        if (!badgeBusca) {
            badgeBusca = document.createElement('span');
            badgeBusca.className = 'search-match-badge';
            badgeBusca.style.cssText = "display:block; font-size:0.75rem; color:#10b981; font-weight:bold; margin-top:4px;";
            card.querySelector('.product-card-body').appendChild(badgeBusca);
        }

        if (normalizedQuery.length > 1 && totalItensEncontrados > 0) {
            badgeBusca.innerText = `🔍 ${totalItensEncontrados} item(ns) encontrado(s)`;
            badgeBusca.style.display = 'block';
        } else {
            badgeBusca.style.display = 'none';
        }

        if (matchesFilter && matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (noResults) {
        noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
}

// --- 7. INICIALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    carregarDadosDoCSV();

    if (badge) badge.addEventListener('click', openWishlistModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalBtn ? closeWishlistModal : null);
    if (overlay) overlay.addEventListener('click', closeWishlistModal);

    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.btn-filter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeQuery = e.target.value;
            applyFiltersAndSearch();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            activeFilter = button.getAttribute('data-filter');
            applyFiltersAndSearch();
        });
    });
});

// --- 8. ENVIO WHATSAPP ---
const form = document.getElementById('form-orcamento');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (cart.length === 0) return;

        const whatsappNumero = "5511917348484"; 
        const nome = document.getElementById('nome').value;
        const obs = document.getElementById('observacoes').value || "Nenhuma informada";

        let itensTexto = "";
        cart.forEach((item) => {
            itensTexto += `\n- *${item.grupo}* (${item.categoria}) \n  Medida: _${item.medida}_ | *Qtd:* ${item.quantidade} ${item.unidade}`;
        });

        const message = `Olá, gostaria de solicitar uma cotação técnica de materiais!

*Identificação do Solicitante:*
👤 *Nome / Empresa:* ${nome}

*Lista de Itens para Cotação:* ${itensTexto}

*Observações Adicionais / Instruções de Corte:*
${obs}

---
_Solicitação gerada via Catálogo Digital RQM_`;

        window.open(`https://api.whatsapp.com/send?phone=${whatsappNumero}&text=${encodeURIComponent(message)}`, '_blank');
    });
}