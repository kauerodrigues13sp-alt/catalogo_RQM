/* ==========================================================================
   CATÁLOGO DIGITAL RQM - CÓDIGO COMPLETO COM SUPORTE A EDIÇÃO/EXCLUSÃO DA BASE
   ========================================================================== */

let catalogoGrupos = [];
let cart = [];
let activeFilter = 'todos';
let activeQuery = '';
let ratingSelecionado = 0;

const badge = document.getElementById('wishlistBadge');
const countSpan = document.getElementById('wishlistCount');
const modal = document.getElementById('wishlistModal');
const overlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');

// Palavras bloqueadas lidas dinamicamente do Painel Admin (ou lista padrão)
const PALAVRAS_BLOQUEADAS = JSON.parse(localStorage.getItem('rqm_palavras_bloqueadas')) || ["SERVICO", "FRETE", "DESCONTO", "SUCATA", "TESTE", "TAXA"];

// Imagens temáticas alinhadas com cada grupo
const IMAGENS_GRUPOS = {
    "tubos": "https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=400",
    "kits-basculante": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
    "portas-aco": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=400",
    "perfis-aco": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400",
    "chapas-bobinas": "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&q=80&w=400",
    "roldanas": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
    "rodajos": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
    "fitas": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400",
    "ferragens": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400",
    "padrao": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400"
};

// Mapeamento auxiliar de configurações padrão por grupo
const MAPA_GRUPOS_CONFIG = {
    "tubos": { nome: "Tubos Galvanizados e Aço", tipo: "perfis", imagem: IMAGENS_GRUPOS.tubos, unidade: "barra(s)", fracao: true },
    "kits-basculante": { nome: "Kits Basculante", tipo: "acessorios", imagem: IMAGENS_GRUPOS["kits-basculante"], unidade: "unidade(s)", fracao: false },
    "portas-aco": { nome: "Portas de Aço e Componentes", tipo: "acessorios", imagem: IMAGENS_GRUPOS["portas-aco"], unidade: "unidade(s)", fracao: false },
    "perfis-aco": { nome: "Perfis em Aço Carbono", tipo: "perfis", imagem: IMAGENS_GRUPOS["perfis-aco"], unidade: "barra(s)", fracao: true },
    "chapas-bobinas": { nome: "Chapas e Bobinas Aço", tipo: "estampados", imagem: IMAGENS_GRUPOS["chapas-bobinas"], unidade: "unidade(s)", fracao: false },
    "roldanas": { nome: "Roldanas e Guias", tipo: "acessorios", imagem: IMAGENS_GRUPOS.roldanas, unidade: "unidade(s)", fracao: false },
    "rodajos": { nome: "Rodajos e Trilhos", tipo: "acessorios", imagem: IMAGENS_GRUPOS.rodajos, unidade: "unidade(s)", fracao: false },
    "fitas": { nome: "Fitas para Porta de Aço", tipo: "acessorios", imagem: IMAGENS_GRUPOS.fitas, unidade: "unidade(s)", fracao: false },
    "ferragens": { nome: "Ferragens e Diversos", tipo: "acessorios", imagem: IMAGENS_GRUPOS.ferragens, unidade: "unidade(s)", fracao: false }
};

// Textos de pesquisa por grupo
const PLACEHOLDERS_GRUPOS = {
    "tubos": "Busque por medida de tubo (ex: 15x15, 20x20, Galvanizado)...",
    "kits-basculante": "Busque por medida do kit basculante...",
    "portas-aco": "Busque por componente de porta de aço...",
    "perfis-aco": "Busque por perfil, cantoneira ou ferro chato...",
    "chapas-bobinas": "Busque por espessura ou tipo de chapa...",
    "roldanas": "Busque por diâmetro ou modelo de roldana...",
    "rodajos": "Busque por rodajo ou modelo...",
    "fitas": "Busque por largura da fita (ex: 25mm, 30mm)...",
    "ferragens": "Busque por ferragem ou acessório...",
    "padrao": "Pesquisar medida ou produto neste grupo..."
};

// Helper para abrir o Painel Admin
function abrirPainelAdmin() {
    window.location.href = './gerenciador-interno-rqm.html';
}

// Helper para normalizar slugs de IDs de grupo
function slugify(text) {
    return text.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/^-|-$/g, "");
}

// --- HIGIENIZADOR DE CARACTERES CORROMPIDOS ---
function corrigirTextoCorrompido(texto) {
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

// --- 1. LEITURA E PARSING INTELIGENTE DO CSV COM SUPORTE A EDIÇÕES/EXCLUSÕES ---
function processarResultadoCSV(results) {
    const linhas = results ? results.data : [];
    const gruposTemp = {};

    // Carrega registros de exclusão e modificação do Admin
    const produtosExcluidos = JSON.parse(localStorage.getItem('rqm_produtos_excluidos')) || [];
    const produtosEditados = JSON.parse(localStorage.getItem('rqm_produtos_editados')) || {};

    let idxDescricao = -1, idxGrupo = -1, idxUnidade = -1, idxSituacao = -1, idxQtde = -1;
    let linhaInicioDados = 0;

    if (linhas && linhas.length > 0) {
        for (let i = 0; i < Math.min(15, linhas.length); i++) {
            if (!linhas[i]) continue;
            const linhaStr = linhas[i].map(c => corrigirTextoCorrompido(c).toUpperCase().trim());
            
            const posDesc = linhaStr.findIndex(c => c.includes("DESCRIÇ") || c.includes("DESCRICAO"));
            if (posDesc !== -1) {
                idxDescricao = posDesc;
                
                const posGrupo = linhaStr.findIndex(c => c === "GRUPO" || c.includes("CATEGORIA"));
                if (posGrupo !== -1) idxGrupo = posGrupo;

                const posUn = linhaStr.findIndex(c => c.includes("UNIDADE") || c === "UN");
                if (posUn !== -1) idxUnidade = posUn;

                const posSit = linhaStr.findIndex(c => c.includes("SITUAÇ") || c.includes("SITUACAO") || c === "SIT");
                if (posSit !== -1) idxSituacao = posSit;

                const posQtd = linhaStr.findIndex(c => 
                    c.includes("QTDE ATUAL") || c.includes("ESTOQUE ATUAL") || c === "QTDE" || c === "ESTOQUE" || c === "SALDO"
                );
                if (posQtd !== -1) idxQtde = posQtd;

                linhaInicioDados = i + 1;
                break;
            }
        }

        if (idxDescricao === -1) idxDescricao = 2;
        if (idxGrupo === -1) idxGrupo = 3;
        if (idxUnidade === -1) idxUnidade = 5;
        if (idxQtde === -1) idxQtde = 9;

        for (let i = linhaInicioDados; i < linhas.length; i++) {
            const linha = linhas[i];
            if (!linha || !linha[idxDescricao]) continue;

            const idItemCSV = `csv-item-${i}`;
            let descricao = corrigirTextoCorrompido(linha[idxDescricao]).trim();

            // 🛑 Ignora se o produto foi excluído via Painel Admin
            if (produtosExcluidos.includes(idItemCSV) || produtosExcluidos.includes(descricao.toUpperCase())) {
                continue;
            }

            // ✏️ Aplica edições feitas via Painel Admin se existirem
            let qtdeEstoque = 0;
            if (produtosEditados[idItemCSV]) {
                descricao = produtosEditados[idItemCSV].medida || descricao;
                qtdeEstoque = parseFloat(produtosEditados[idItemCSV].estoque) || 0;
            } else {
                if (idxQtde !== -1 && linha[idxQtde] !== undefined && linha[idxQtde] !== null) {
                    let strVal = String(linha[idxQtde]).trim().replace(/[^\d.,-]/g, '').replace(',', '.');
                    const qtdeParsed = parseFloat(strVal);
                    if (!isNaN(qtdeParsed)) qtdeEstoque = qtdeParsed;
                }
            }

            let grupoRaw = (idxGrupo !== -1 && linha[idxGrupo]) ? corrigirTextoCorrompido(linha[idxGrupo]).trim().toUpperCase() : "";
            const unidadeRaw = (idxUnidade !== -1 && linha[idxUnidade]) ? String(linha[idxUnidade]).trim().toUpperCase() : "UN";
            const situacao = (idxSituacao !== -1 && linha[idxSituacao]) ? corrigirTextoCorrompido(linha[idxSituacao]).trim().toUpperCase() : "ATIVO";

            if (situacao.includes("INAT") || situacao === "I" || situacao.includes("BLOQ") || situacao.includes("CANCEL")) continue;
            if (!descricao || descricao.toUpperCase().includes("DESCRIÇÃO") || descricao.toUpperCase().includes("DESCRICAO")) continue;

            const ehBloqueado = PALAVRAS_BLOQUEADAS.some(p => descricao.toUpperCase().includes(p));
            if (ehBloqueado) continue;

            descricao = descricao.replace(/\s*[-\/]\s*OK$/i, '').replace(/\s+OK$/i, '').replace(/\s*[\/-]\s*$/, '').trim();

            let idGrupo = "ferragens";
            let nomeGrupoCompleto = "Ferragens e Diversos";
            let nomeCategoria = "Geral";
            const desc = descricao.toUpperCase();

            if (grupoRaw.includes("TUBO") || desc.includes("TUBO")) {
                idGrupo = "tubos";
                nomeGrupoCompleto = "Tubos Galvanizados e Aço";
                if (desc.includes("TUBO RED") || desc.includes("TUBO SCH")) nomeCategoria = "Tubos Redondos";
                else if (desc.includes("TUBO QUA")) nomeCategoria = "Tubos Quadrados";
                else if (desc.includes("TUBO RET")) nomeCategoria = "Tubos Retangulares";
                else nomeCategoria = "Geral";
            } else if (grupoRaw.includes("KIT") || grupoRaw.includes("BASCULANTE") || desc.includes("KIT BASC")) {
                idGrupo = "kits-basculante";
                nomeGrupoCompleto = "Kits Basculante";
                nomeCategoria = "Kits e Conjuntos";
            } else if (grupoRaw.includes("PORTA") || desc.includes("PORTA DE ACO") || desc.includes("PUXADOR")) {
                idGrupo = "portas-aco";
                nomeGrupoCompleto = "Portas de Aço e Componentes";
                nomeCategoria = "Acessórios para Portas";
            } else if (grupoRaw.includes("PERFIL") || grupoRaw.includes("CANTONEIRA") || desc.includes("CANTONEIRA") || desc.includes("FERRO CHATO")) {
                idGrupo = "perfis-aco";
                nomeGrupoCompleto = "Perfis em Aço Carbono";
                nomeCategoria = "Perfis Industriais";
            } else if (grupoRaw.includes("CHAPA") || grupoRaw.includes("BOBINA") || desc.includes("CHAPA")) {
                idGrupo = "chapas-bobinas";
                nomeGrupoCompleto = "Chapas e Bobinas Aço";
                nomeCategoria = "Chapas de Aço";
            } else if (grupoRaw.includes("ROLDANA") || grupoRaw.includes("GUIA") || desc.includes("ROLDANA")) {
                idGrupo = "roldanas";
                nomeGrupoCompleto = "Roldanas e Guias";
                nomeCategoria = "Roldanas e Rodízios";
            } else if (grupoRaw.includes("RODAJO") || desc.includes("RODAJO")) {
                idGrupo = "rodajos";
                nomeGrupoCompleto = "Rodajos e Trilhos";
                nomeCategoria = "Rodajos";
            } else if (grupoRaw.includes("FITA") || desc.includes("FITA")) {
                idGrupo = "fitas";
                nomeGrupoCompleto = "Fitas para Porta de Aço";
                nomeCategoria = "Fitas de Proteção/Guia";
            } else if (grupoRaw.includes("FERRAGEM") || grupoRaw.includes("DIVERSOS")) {
                idGrupo = "ferragens";
                nomeGrupoCompleto = "Ferragens e Diversos";
                nomeCategoria = "Ferragens";
            } else if (grupoRaw) {
                idGrupo = slugify(grupoRaw);
                nomeGrupoCompleto = grupoRaw;
                nomeCategoria = "Geral";
            }

            const configGrupo = MAPA_GRUPOS_CONFIG[idGrupo] || {
                nome: nomeGrupoCompleto,
                tipo: "acessorios",
                imagem: IMAGENS_GRUPOS.padrao,
                unidade: (unidadeRaw === "BR" || unidadeRaw === "MT") ? "barra(s)" : "unidade(s)",
                fracao: (unidadeRaw === "BR" || unidadeRaw === "MT")
            };

            if (!gruposTemp[idGrupo]) {
                gruposTemp[idGrupo] = {
                    idGrupo: idGrupo,
                    nomeGrupo: configGrupo.nome,
                    tipoFiltro: configGrupo.tipo,
                    imagem: configGrupo.imagem,
                    unidadeMedia: (unidadeRaw === "BR" || unidadeRaw === "MT") ? "barra(s)" : configGrupo.unidade,
                    permitirFracao: (unidadeRaw === "BR" || unidadeRaw === "MT") ? true : configGrupo.fracao,
                    categoriasMap: {}
                };
            }

            if (!gruposTemp[idGrupo].categoriasMap[nomeCategoria]) {
                gruposTemp[idGrupo].categoriasMap[nomeCategoria] = { nomeCategoria: nomeCategoria, itens: [] };
            }

            gruposTemp[idGrupo].categoriasMap[nomeCategoria].itens.push({
                idItem: idItemCSV,
                medida: descricao,
                estoque: qtdeEstoque
            });
        }
    }

    // Unifica produtos adicionados manualmente via Admin
    const manuais = JSON.parse(localStorage.getItem("rqm_produtos_manuais")) || [];
    manuais.forEach((prodManual, index) => {
        const idManual = `manual-item-${index}`;
        if (produtosExcluidos.includes(idManual)) return;

        const idGrupo = prodManual.grupo || "ferragens";
        const nomeCategoria = prodManual.categoria || "Geral";
        const configGrupo = MAPA_GRUPOS_CONFIG[idGrupo] || MAPA_GRUPOS_CONFIG.ferragens;

        if (!gruposTemp[idGrupo]) {
            gruposTemp[idGrupo] = {
                idGrupo: idGrupo,
                nomeGrupo: configGrupo.nome,
                tipoFiltro: configGrupo.tipo,
                imagem: configGrupo.imagem,
                unidadeMedia: configGrupo.unidade,
                permitirFracao: configGrupo.fracao,
                categoriasMap: {}
            };
        }

        if (!gruposTemp[idGrupo].categoriasMap[nomeCategoria]) {
            gruposTemp[idGrupo].categoriasMap[nomeCategoria] = { nomeCategoria: nomeCategoria, itens: [] };
        }

        const medidaDef = produtosEditados[idManual] ? produtosEditados[idManual].medida : prodManual.medida;
        const estqDef = produtosEditados[idManual] ? parseFloat(produtosEditados[idManual].estoque) : (prodManual.estoque === 1 ? 10 : 0);

        gruposTemp[idGrupo].categoriasMap[nomeCategoria].itens.unshift({
            idItem: idManual,
            medida: medidaDef,
            estoque: estqDef
        });
    });

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
}

function carregarDadosDoCSV() {
    if (typeof Papa === 'undefined') {
        processarResultadoCSV(null);
        return;
    }

    const customCSV = localStorage.getItem("rqm_custom_csv");

    if (customCSV) {
        Papa.parse(customCSV, {
            header: false,
            skipEmptyLines: true,
            complete: processarResultadoCSV
        });
        return;
    }

    function tentarLerCSV(nomeArquivo, proximaTentativa) {
        Papa.parse(nomeArquivo, {
            download: true,
            header: false,
            encoding: "ISO-8859-1",
            delimitersToGuess: [';', ',', '\t'],
            skipEmptyLines: true,
            complete: function(results) {
                processarResultadoCSV(results);
            },
            error: function() {
                if (proximaTentativa) proximaTentativa();
                else processarResultadoCSV(null);
            }
        });
    }

    tentarLerCSV("PRODUTOS.CSV", function() {
        tentarLerCSV("produtos.csv", function() {
            tentarLerCSV("PRODUTOS_COMPLETO_TODOS_OS_ITENS.csv");
        });
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
            <img src="${grupo.imagem}" alt="${grupo.nomeGrupo}" class="product-img" onerror="this.onerror=null; this.src='${IMAGENS_GRUPOS.padrao}';">
            <div class="product-card-body">
                <h3>${grupo.nomeGrupo} <i class="fa-solid fa-arrow-right" style="color: var(--primary); font-size:0.95rem;"></i></h3>
            </div>
        </div>
    `).join('');
}

// --- 4. DETALHES DO GRUPO ---
window.verDetalhesGrupo = function(idGrupo, filtroInterno = null) {
    const grupo = catalogoGrupos.find(g => g.idGrupo === idGrupo);
    if (!grupo) return;

    const titulo = document.getElementById('detalhe-titulo-grupo');
    if (titulo) titulo.innerText = grupo.nomeGrupo;

    const containerCategorias = document.getElementById('detalhe-conteudo-categorias');
    if (!containerCategorias) return;

    const termoBusca = (filtroInterno !== null) ? filtroInterno : activeQuery;
    const queryNorm = normalizeText(termoBusca);

    const placeholderTexto = PLACEHOLDERS_GRUPOS[grupo.idGrupo] || PLACEHOLDERS_GRUPOS.padrao;

    let miniBuscaHtml = `
        <div class="search-input-wrapper" style="margin-bottom: 1.5rem;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="inputMiniBusca" placeholder="${placeholderTexto}" value="${termoBusca}" 
                   oninput="filtrarProdutosNoGrupo('${grupo.idGrupo}', this.value)" autocomplete="off">
            ${termoBusca ? `<button onclick="filtrarProdutosNoGrupo('${grupo.idGrupo}', '')" style="background:none; border:none; color:var(--text-main); cursor:pointer; font-size:1.1rem; padding: 5px;">✕</button>` : ''}
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
                unidade: grupo.unidadeMedia,
                emEstoque: item.estoque > 0
            }))));

            const ehItemBuscado = queryNorm.length > 1 && normalizeText(item.medida).includes(queryNorm);
            const estiloLinha = ehItemBuscado ? "background-color: rgba(245, 158, 11, 0.15);" : "";

            const badgeEstoque = item.estoque > 0 
                ? `<span style="display:inline-block; margin-left:8px; font-size:0.75rem; color:#10b981; background:#10b98115; padding:2px 6px; border-radius:4px; font-weight:600;">Em estoque</span>`
                : `<span style="display:inline-block; margin-left:8px; font-size:0.75rem; color:#f59e0b; background:#f59e0b15; padding:2px 6px; border-radius:4px; font-weight:600;">Indisponível em Estoque – Consulte Prazo</span>`;

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

    const viewGrupos = document.getElementById('view-grupos');
    const viewDetalhes = document.getElementById('view-detalhes');
    if (viewGrupos) viewGrupos.style.display = 'none';
    if (viewDetalhes) viewDetalhes.style.display = 'block';
    
    if (filtroInterno === null) {
        window.scrollTo({ top: 250, behavior: 'smooth' });
    }
};

window.filtrarProdutosNoGrupo = function(idGrupo, valorBusca) {
    verDetalhesGrupo(idGrupo, valorBusca);
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
    const viewGrupos = document.getElementById('view-grupos');
    const viewDetalhes = document.getElementById('view-detalhes');
    if (viewDetalhes) viewDetalhes.style.display = 'none';
    if (viewGrupos) viewGrupos.style.display = 'block';
};

// --- 5. AUTO-COMPLETE DA BUSCA PRINCIPAL ---
function setupAutoComplete() {
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    const btnClear = document.getElementById('btnClearSearch');

    if (!searchInput || !dropdown) return;

    searchInput.addEventListener('input', (e) => {
        const query = normalizeText(e.target.value);
        activeQuery = e.target.value;
        if (btnClear) btnClear.style.display = query ? 'block' : 'none';

        if (query.length < 2) {
            dropdown.style.display = 'none';
            applyFiltersAndSearch();
            return;
        }

        let sugestoes = [];

        catalogoGrupos.forEach(grupo => {
            grupo.categorias.forEach(cat => {
                cat.itens.forEach(item => {
                    if (normalizeText(item.medida).includes(query)) {
                        sugestoes.push({
                            medida: item.medida,
                            grupoNome: grupo.nomeGrupo,
                            idGrupo: grupo.idGrupo
                        });
                    }
                });
            });
        });

        sugestoes = sugestoes.slice(0, 6);

        if (sugestoes.length > 0) {
            dropdown.innerHTML = sugestoes.map(s => `
                <div class="autocomplete-item" onclick="selecionarSugestao('${s.idGrupo}', '${s.medida.replace(/'/g, "\\'")}')">
                    <div>
                        <strong style="color: var(--text-main); font-size: 0.9rem; display:block;">${s.medida}</strong>
                        <span style="font-size: 0.75rem; color: var(--primary); font-weight:600;">${s.grupoNome}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="font-size:0.8rem; color:#94a3b8;"></i>
                </div>
            `).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }

        applyFiltersAndSearch();
    });

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            searchInput.value = '';
            activeQuery = '';
            dropdown.style.display = 'none';
            btnClear.style.display = 'none';
            applyFiltersAndSearch();
        });
    }

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

window.selecionarSugestao = function(idGrupo, medida) {
    const dropdown = document.getElementById('autocompleteDropdown');
    if (dropdown) dropdown.style.display = 'none';
    verDetalhesGrupo(idGrupo, medida);
};

// --- 6. CARRINHO / COTAÇÃO COM PERSISTÊNCIA ---
function salvarCarrinho() {
    localStorage.setItem('rqm_cart', JSON.stringify(cart));
}

function carregarCarrinhoSalvo() {
    const salvo = localStorage.getItem('rqm_cart');
    if (salvo) {
        try {
            cart = JSON.parse(salvo);
            updateOrderUI();
        } catch (e) {
            cart = [];
        }
    }
}

window.processarInclusao = function(encodedData) {
    const item = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    const inputQtd = document.getElementById(`qtd-${item.idItem}`);
    const btn = document.getElementById(`btn-add-${item.idItem}`);
    
    if (!inputQtd) return;
    const qtdDigitada = parseFloat(inputQtd.value);

    if (isNaN(qtdDigitada) || qtdDigitada <= 0) {
        mostrarToast("Por favor, selecione uma quantidade válida.", "error");
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
            unidade: item.unidade,
            emEstoque: item.emEstoque
        });
    }

    salvarCarrinho();

    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Adicionado';
        btn.classList.add('included');
        setTimeout(() => {
            btn.innerHTML = '+ Solicitar';
            btn.classList.remove('included');
        }, 1000);
    }

    updateOrderUI();
    mostrarToast(`"${item.medida}" adicionado à cotação!`);
};

window.removeItemFromOrder = function(idItem) {
    cart = cart.filter(item => item.idItem !== idItem);
    salvarCarrinho();
    updateOrderUI();
    mostrarToast("Item removido da solicitação.");
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

    container.innerHTML = cart.map(item => {
        const tagAviso = item.emEstoque ? '' : `<span style="display:block; font-size:0.75rem; color:#f59e0b; margin-top:2px;">⚠️ Consulte prazo de entrega</span>`;
        return `
            <div class="wishlist-item-row" style="animation: fadeIn 0.3s ease;">
                <div>
                    <span style="display: block; font-size: 0.75rem; color: #94a3b8;">${item.grupo} ➔ ${item.categoria}</span>
                    <strong style="font-size: 0.9rem; color: #fff;">${item.medida}</strong>
                    ${tagAviso}
                    <div style="margin-top: 4px; font-size: 0.85rem; color: var(--primary); font-weight: bold;">
                        Qtd: ${item.quantidade} ${item.unidade}
                    </div>
                </div>
                <button class="btn-remove" onclick="removeItemFromOrder('${item.idItem}')">
                    ✕
                </button>
            </div>
        `;
    }).join('');
}

function openWishlistModal() {
    if (modal) modal.classList.add('open');
    if (overlay) overlay.classList.add('show');
}

function closeWishlistModal() {
    if (modal) modal.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

// --- 7. FILTROS E BUSCA GLOBAL ---
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
            const cardBody = card.querySelector('.product-card-body');
            if (cardBody) cardBody.appendChild(badgeBusca);
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

// --- 8. ENVIO DE COTAÇÃO VIA WHATSAPP ---
window.enviarOrcamentoWhatsApp = function(e) {
    if (e) e.preventDefault();
    if (cart.length === 0) {
        mostrarToast("Sua lista de solicitação está vazia.", "error");
        return;
    }

    const whatsappNumero = localStorage.getItem('rqm_whatsapp_num') || "5511917348484"; 
    
    let cotacoesCont = parseInt(localStorage.getItem('rqm_cotacoes_cont') || '0');
    localStorage.setItem('rqm_cotacoes_cont', (cotacoesCont + 1).toString());

    const inputNome = document.getElementById('nome');
    const inputObs = document.getElementById('observacoes');

    const nome = inputNome ? inputNome.value.trim() : "Não informado";
    const obs = (inputObs && inputObs.value.trim()) ? inputObs.value.trim() : "Nenhuma informada";

    let itensTexto = "";
    cart.forEach((item) => {
        const obsIndisponivel = item.emEstoque ? "" : " *(Consulte Prazo)*";
        itensTexto += `\n- *${item.grupo}* (${item.categoria}) \n  Medida: _${item.medida}_${obsIndisponivel} | *Qtd:* ${item.quantidade} ${item.unidade}`;
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
};

// --- 9. SISTEMA DE AVALIAÇÕES ---
function setupReviews() {
    const estrelas = document.querySelectorAll('.star-rating i');
    const btnSubmit = document.getElementById('btn-submit-review');

    estrelas.forEach(star => {
        star.addEventListener('click', () => {
            ratingSelecionado = parseInt(star.getAttribute('data-rating'));
            estrelas.forEach(s => {
                const r = parseInt(s.getAttribute('data-rating'));
                if (r <= ratingSelecionado) {
                    s.className = 'fa-solid fa-star';
                } else {
                    s.className = 'fa-regular fa-star';
                }
            });
        });
    });

    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            const autorInput = document.getElementById('review-author');
            const textoInput = document.getElementById('review-text');

            const autor = autorInput ? autorInput.value.trim() : '';
            const texto = textoInput ? textoInput.value.trim() : '';

            if (!autor || !texto || ratingSelecionado === 0) {
                mostrarToast('Por favor, informe seu nome, comentário e a nota de 1 a 5 estrelas.', 'error');
                return;
            }

            const reviewsSalvas = JSON.parse(localStorage.getItem('rqm_reviews')) || [];
            reviewsSalvas.unshift({ autor, nota: ratingSelecionado, texto });
            localStorage.setItem('rqm_reviews', JSON.stringify(reviewsSalvas));

            renderReviews();

            if (autorInput) autorInput.value = '';
            if (textoInput) textoInput.value = '';
            ratingSelecionado = 0;
            estrelas.forEach(s => s.className = 'fa-regular fa-star');

            mostrarToast('Sua avaliação foi enviada com sucesso!');
        });
    }

    renderReviews();
}

function renderReviews() {
    const container = document.getElementById('home-reviews-container');
    if (!container) return;

    const reviewsPadrao = [
        { autor: "Sérgio - Metalúrgica Vale", nota: 5, texto: "Excelente acabamento nos perfis e agilidade no atendimento." },
        { autor: "Carlos Eduardo", nota: 5, texto: "Medidas bem precisas e ótimo estoque de tubos." }
    ];

    const reviewsSalvas = JSON.parse(localStorage.getItem('rqm_reviews')) || reviewsPadrao;

    container.innerHTML = reviewsSalvas.map(rev => `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; min-width: 260px; flex-shrink: 0;">
            <div style="color: #f1c40f; margin-bottom: 5px;">
                ${'<i class="fa-solid fa-star"></i>'.repeat(rev.nota)}
                ${'<i class="fa-regular fa-star"></i>'.repeat(5 - rev.nota)}
            </div>
            <strong style="display: block; font-size: 0.9rem; color: var(--text-main);">${rev.autor}</strong>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">"${rev.texto}"</p>
        </div>
    `).join('');
}

// --- 10. FEEDBACK VISUAL (TOAST) ---
function mostrarToast(mensagem, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${tipo === 'error' ? '#ef4444' : '#10b981'};
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = mensagem;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- 11. REGISTRO DE ACESSOS ---
function registrarAcessoAdmin() {
    let acessos = parseInt(localStorage.getItem('rqm_acessos') || '0');
    acessos++;
    localStorage.setItem('rqm_acessos', acessos.toString());
}

// --- 12. CONTADOR DE CLIQUES NA LOGO E INICIALIZAÇÃO ---
let contadorCliquesLogo = 0;
let timerCliquesLogo = null;

function gerenciarCliqueNaLogo(e) {
    if (e) e.preventDefault();
    
    contadorCliquesLogo++;
    clearTimeout(timerCliquesLogo);

    if (contadorCliquesLogo >= 5) {
        contadorCliquesLogo = 0;
        abrirPainelAdmin();
    } else {
        timerCliquesLogo = setTimeout(() => {
            contadorCliquesLogo = 0;
        }, 2500);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof verificarAvisosEManutencao === 'function' && verificarAvisosEManutencao()) return;

    initTheme();
    carregarCarrinhoSalvo();
    carregarDadosDoCSV();
    setupAutoComplete();
    setupReviews();
    registrarAcessoAdmin();

    if (badge) badge.addEventListener('click', openWishlistModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeWishlistModal);
    if (overlay) overlay.addEventListener('click', closeWishlistModal);

    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            activeFilter = button.getAttribute('data-filter');
            applyFiltersAndSearch();
        });
    });

    const form = document.getElementById('form-orcamento');
    if (form) {
        form.addEventListener('submit', window.enviarOrcamentoWhatsApp);
    }

    const logoImg = document.querySelector('.site-logo');
    const logoContainer = document.querySelector('.logo-container a');

    if (logoImg) {
        logoImg.addEventListener('click', gerenciarCliqueNaLogo);
    }
    if (logoContainer) {
        logoContainer.addEventListener('click', gerenciarCliqueNaLogo);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === '1') {
        abrirPainelAdmin();
    }
});

// --- 13. ATALHO SECRETO VIA TECLADO (Ctrl + Shift + A) ---
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'A') {
        e.preventDefault();
        abrirPainelAdmin();
    }
});

// --- 14. VERIFICAÇÃO DE AVISOS E MODO DE MANUTENÇÃO ---
function verificarAvisosEManutencao() {
    const modoManutencao = localStorage.getItem("rqm_modo_manutencao") === "true";
    const bannerTexto = localStorage.getItem("rqm_banner_aviso") || "";

    if (modoManutencao) {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 20px;">
                <i class="fa-solid fa-screwdriver-wrench" style="font-size: 4rem; color: #f59e0b; margin-bottom: 20px;"></i>
                <h1 style="font-size: 2rem; margin-bottom: 10px;">Catálogo em Manutenção</h1>
                <p style="color: #94a3b8; max-width: 500px; line-height: 1.5;">Estamos a realizar atualizações técnicas. Por favor, volte mais tarde!</p>
            </div>
        `;
        return true;
    }

    if (bannerTexto.trim() !== "") {
        let bannerEl = document.getElementById("banner-aviso-topo");
        if (!bannerEl) {
            bannerEl = document.createElement("div");
            bannerEl.id = "banner-aviso-topo";
            bannerEl.style.cssText = `
                background-color: #f59e0b;
                color: #000;
                font-weight: bold;
                text-align: center;
                padding: 10px 15px;
                font-size: 0.95rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                position: relative;
                z-index: 1000;
            `;
            document.body.insertBefore(bannerEl, document.body.firstChild);
        }
        bannerEl.innerHTML = `<i class="fa-solid fa-bullhorn"></i> <span>${bannerTexto}</span>`;
    }
    return false;
}