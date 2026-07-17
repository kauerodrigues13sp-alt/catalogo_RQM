const catalogoGrupos = [
    {
        idGrupo: "tubos",
        nomeGrupo: "Tubos Industriais",
        tipoFiltro: "perfis",
        imagem: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "barra(s)",
        permitirFracao: true,
        categorias: [
            {
                nomeCategoria: "Tubos Redondos",
                itens: [
                    { idItem: "tub-red-1", medida: '1" (Parede 1,20 mm)' },
                    { idItem: "tub-red-2", medida: '1.1/2" (Parede 1,50 mm)' }
                ]
            },
            {
                nomeCategoria: "Tubos Quadrados",
                itens: [
                    { idItem: "tub-qua-1", medida: "40x40 mm (Parede 1,50 mm)" },
                    { idItem: "tub-qua-2", medida: "50x50 mm (Parede 2,00 mm)" }
                ]
            },
            {
                nomeCategoria: "Tubos Retangulares",
                itens: [
                    { idItem: "tub-ret-1", medida: "50x30 mm (Parede 1,50 mm)" },
                    { idItem: "tub-ret-2", medida: "80x40 mm (Parede 2,00 mm)" }
                ]
            }
        ]
    },
    {
        idGrupo: "cantoneiras",
        nomeGrupo: "Cantoneiras",
        tipoFiltro: "perfis",
        imagem: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "barra(s)",
        permitirFracao: true,
        categorias: [
            {
                nomeCategoria: "Abas Iguais",
                itens: [
                    { idItem: "cant-1", medida: '1/2" x 1/8" (12,70 x 3,17 mm)' },
                    { idItem: "cant-2", medida: '3/4" x 1/8" (19,05 x 3,17 mm)' },
                    { idItem: "cant-3", medida: '1" x 1/8" (25,40 x 3,17 mm)' }
                ]
            }
        ]
    },
    {
        idGrupo: "chato",
        nomeGrupo: "Ferro Chato",
        tipoFiltro: "perfis",
        imagem: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "barra(s)",
        permitirFracao: true,
        categorias: [
            {
                nomeCategoria: "Perfil Padrão",
                itens: [
                    { idItem: "chato-1", medida: '1/2" x 1/8" (12,70 x 3,17 mm)' },
                    { idItem: "chato-2", medida: '3/4" x 3/16" (19,05 x 4,76 mm)' }
                ]
            }
        ]
    },
    {
        idGrupo: "roldanas",
        nomeGrupo: "Roldanas e Guias",
        tipoFiltro: "acessorios",
        imagem: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "unidade(s)",
        permitirFracao: false,
        categorias: [
            {
                nomeCategoria: "Canal em 'V'",
                itens: [
                    { idItem: "rold-v2", medida: '2" com Rolamento' },
                    { idItem: "rold-v3", medida: '3" com Rolamento' }
                ]
            }
        ]
    },
    {
        idGrupo: "discos",
        nomeGrupo: "Discos Estampados",
        tipoFiltro: "estampados",
        imagem: "https://images.unsplash.com/photo-1513828583835-c527ebc50322?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "unidade(s)",
        permitirFracao: false,
        categorias: [
            {
                nomeCategoria: "Medidas Comuns",
                itens: [
                    { idItem: "disc-1", medida: "Ø 100 mm (Espessura 3 mm)" },
                    { idItem: "disc-2", medida: "Ø 150 mm (Espessura 4,75 mm)" }
                ]
            }
        ]
    }
];

let cart = [];
let activeFilter = 'todos';
let activeQuery = '';

const badge = document.getElementById('wishlistBadge');
const countSpan = document.getElementById('wishlistCount');
const modal = document.getElementById('wishlistModal');
const overlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');

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

window.verDetalhesGrupo = function(idGrupo) {
    const grupo = catalogoGrupos.find(g => g.idGrupo === idGrupo);
    if (!grupo) return;

    document.getElementById('detalhe-titulo-grupo').innerText = grupo.nomeGrupo;
    const containerCategorias = document.getElementById('detalhe-conteudo-categorias');
    
    containerCategorias.innerHTML = grupo.categorias.map(cat => {
        const htmlItens = cat.itens.map(item => {
            const step = grupo.permitirFracao ? 0.5 : 1;
            const valorInicial = grupo.permitirFracao ? "1.0" : "1";

            const itemDadosString = btoa(unescape(encodeURIComponent(JSON.stringify({
                grupo: grupo.nomeGrupo,
                categoria: cat.nomeCategoria,
                medida: item.medida,
                idItem: item.idItem,
                unidade: grupo.unidadeMedia
            }))));

            return `
                <tr>
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">${item.medida}</td>
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

        return `
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
    }).join('');

    document.getElementById('view-grupos').style.display = 'none';
    document.getElementById('view-detalhes').style.display = 'block';
    window.scrollTo({ top: 250, behavior: 'smooth' });
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
        if (badge) {
            badge.classList.add('show');
        }
    } else {
        if (badge) {
            badge.classList.remove('show');
        }
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
        const combinedText = normalizeText(cardTitle);

        const matchesFilter = (activeFilter === 'todos' || category === activeFilter);
        const matchesSearch = combinedText.includes(normalizedQuery);

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

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderCatalog();

    if (badge) badge.addEventListener('click', openWishlistModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeWishlistModal);
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