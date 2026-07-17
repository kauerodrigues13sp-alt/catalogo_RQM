const catalogoGrupos = [
    {
        idGrupo: "tubos",
        nomeGrupo: "Tubos Industriais",
        imagem: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "barra(s)",
        permitirFracao: true,
        categorias: [
            {
                nomeCategoria: "Tubos Redondos",
                itens: [
                    { idItem: "tub-red-1", medida: '1" (Parede 1,20 mm)', valor: "R$ 72,00" },
                    { idItem: "tub-red-2", medida: '1.1/2" (Parede 1,50 mm)', valor: "R$ 98,50" }
                ]
            },
            {
                nomeCategoria: "Tubos Quadrados",
                itens: [
                    { idItem: "tub-qua-1", medida: "40x40 mm (Parede 1,50 mm)", valor: "R$ 115,00" },
                    { idItem: "tub-qua-2", medida: "50x50 mm (Parede 2,00 mm)", valor: "R$ 158,00" }
                ]
            },
            {
                nomeCategoria: "Tubos Retangulares",
                itens: [
                    { idItem: "tub-ret-1", medida: "50x30 mm (Parede 1,50 mm)", valor: "R$ 128,50" },
                    { idItem: "tub-ret-2", medida: "80x40 mm (Parede 2,00 mm)", valor: "R$ 210,00" }
                ]
            }
        ]
    },
    {
        idGrupo: "cantoneiras",
        nomeGrupo: "Cantoneiras",
        imagem: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "barra(s)",
        permitirFracao: true,
        categorias: [
            {
                nomeCategoria: "Abas Iguais",
                itens: [
                    { idItem: "cant-1", medida: '1/2" x 1/8" (12,70 x 3,17 mm)', valor: "R$ 48,90" },
                    { idItem: "cant-2", medida: '3/4" x 1/8" (19,05 x 3,17 mm)', valor: "R$ 65,50" },
                    { idItem: "cant-3", medida: '1" x 1/8" (25,40 x 3,17 mm)', valor: "R$ 82,00" }
                ]
            }
        ]
    },
    {
        idGrupo: "chato",
        nomeGrupo: "Ferro Chato",
        imagem: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "barra(s)",
        permitirFracao: true,
        categorias: [
            {
                nomeCategoria: "Perfil Padrão",
                itens: [
                    { idItem: "chato-1", medida: '1/2" x 1/8" (12,70 x 3,17 mm)', valor: "R$ 32,10" },
                    { idItem: "chato-2", medida: '3/4" x 3/16" (19,05 x 4,76 mm)', valor: "R$ 58,40" }
                ]
            }
        ]
    },
    {
        idGrupo: "roldanas",
        nomeGrupo: "Roldanas e Guias",
        imagem: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "unidade(s)",
        permitirFracao: false,
        categorias: [
            {
                nomeCategoria: "Canal em 'V'",
                itens: [
                    { idItem: "rold-v2", medida: '2" com Rolamento', valor: "R$ 18,50" },
                    { idItem: "rold-v3", medida: '3" com Rolamento', valor: "R$ 29,90" }
                ]
            }
        ]
    },
    {
        idGrupo: "discos",
        nomeGrupo: "Discos Estampados",
        imagem: "https://images.unsplash.com/photo-1513828583835-c527ebc50322?auto=format&fit=crop&q=80&w=400",
        unidadeMedia: "unidade(s)",
        permitirFracao: false,
        categorias: [
            {
                nomeCategoria: "Medidas Comuns",
                itens: [
                    { idItem: "disc-1", medida: "Ø 100 mm (Espessura 3 mm)", valor: "R$ 12,00" },
                    { idItem: "disc-2", medida: "Ø 150 mm (Espessura 4,75 mm)", valor: "R$ 24,50" }
                ]
            }
        ]
    }
];

let cart = [];

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
        themeIcon.innerText = '☀️';
    } else {
        themeIcon.innerText = '🌙';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeIcon.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
}

// 1. RENDERIZA APENAS OS CARDS DE GRUPO DO GRID PRINCIPAL
function renderCatalog() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = catalogoGrupos.map(grupo => `
        <div class="product-card" onclick="verDetalhesGrupo('${grupo.idGrupo}')">
            <img src="${grupo.imagem}" alt="${grupo.nomeGrupo}" class="product-img">
            <div class="product-card-body">
                <h3>${grupo.nomeGrupo} <i class="fa-solid fa-arrow-right" style="color: var(--primary); font-size:0.95rem;"></i></h3>
            </div>
        </div>
    `).join('');
}

// 2. SISTEMA DE ENTRAR NA TELA DE DETALHES DO GRUPO (NAVEGAÇÃO INTERNA)
window.verDetalhesGrupo = function(idGrupo) {
    const grupo = catalogoGrupos.find(g => g.idGrupo === idGrupo);
    if (!grupo) return;

    document.getElementById('detalhe-titulo-grupo').innerText = grupo.nomeGrupo;
    
    const containerCategorias = document.getElementById('detalhe-conteudo-categorias');
    
    containerCategorias.innerHTML = grupo.categorias.map(cat => {
        const htmlItens = cat.itens.map(item => {
            const step = grupo.permitirFracao ? "0.5" : "1";
            const min = grupo.permitirFracao ? "0.5" : "1";
            const placeholder = grupo.permitirFracao ? "Ex: 1.5" : "Ex: 2";

            // RESOLUÇÃO DO BUG: Convertendo o objeto para string JSON segura, eliminando a quebra de aspas
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
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; font-weight: bold;">${item.valor}</td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); width: 120px;">
                        <input type="number" id="qtd-${item.idItem}" step="${step}" min="${min}" placeholder="${placeholder}" style="padding: 6px; border-radius: 4px; border: 1px solid var(--border-color); width: 100%; font-size: 0.9rem; background: var(--bg-card); color: var(--text-main);">
                    </td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid var(--border-color); text-align: right;">
                        <button id="btn-add-${item.idItem}" class="btn-add" style="padding: 6px 14px; font-size: 0.85rem;" onclick="processarInclusao('${itemDadosString}')">
                            + Incluir
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div style="margin-bottom: 2.5rem;">
                <h4 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 0.8rem; text-transform: uppercase; text-align: left; font-weight:700;">➔ ${cat.nomeCategoria}</h4>
                <div style="width: 100%; overflow-x: auto; background-color: var(--bg-card); border-radius: 8px; border: 2px solid var(--border-color);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background-color: var(--border-color); color: var(--text-main); font-size: 0.85rem;">
                                <th style="padding: 10px;">Medida</th>
                                <th style="padding: 10px;">Ref. Valor</th>
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

    // Efeito de troca de telas
    document.getElementById('view-grupos').style.display = 'none';
    document.getElementById('view-detalhes').style.display = 'block';
    window.scrollTo({ top: 300, behavior: 'smooth' });
};

window.voltarParaGrupos = function() {
    document.getElementById('view-detalhes').style.display = 'none';
    document.getElementById('view-grupos').style.display = 'block';
};

// 3. CAPTURA E INCLUSÃO TRATADA (FIM DOS CONFLITOS DE ASPAS)
window.processarInclusao = function(encodedData) {
    const item = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    const inputQtd = document.getElementById(`qtd-${item.idItem}`);
    const btn = document.getElementById(`btn-add-${item.idItem}`);
    
    if (!inputQtd) return;
    const qtdDigitada = parseFloat(inputQtd.value);

    if (isNaN(qtdDigitada) || qtdDigitada <= 0) {
        alert("Por favor, introduza uma quantidade válida.");
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

    // Feedback visual de sucesso no botão
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Incluído';
        btn.classList.add('included');
        setTimeout(() => {
            btn.innerHTML = '+ Incluir';
            btn.classList.remove('included');
        }, 1000);
    }

    inputQtd.value = ""; 
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
            badge.style.transform = 'scale(1)';
        }
    } else {
        if (badge) {
            badge.classList.remove('show');
            badge.style.transform = 'scale(0)';
        }
        closeWishlistModal();
    }

    const container = document.getElementById('selected-items-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart-msg">Nenhum produto adicionado ainda.</p>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="wishlist-item-row">
            <div>
                <span style="display: block; font-size: 0.75rem; color: #9ca3af;">${item.grupo} ➔ ${item.categoria}</span>
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
    modal.classList.add('open');
    overlay.classList.add('show');
}
function closeWishlistModal() {
    modal.classList.remove('open');
    overlay.classList.remove('show');
}

badge.addEventListener('click', openWishlistModal);
closeModalBtn.addEventListener('click', closeWishlistModal);
overlay.addEventListener('click', closeWishlistModal);

// ENVIO WHATSAPP
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

        const message = `Olá, gostaria de solicitar um orçamento técnico!

*Identificação do Solicitante:*
👤 *Nome / Empresa:* ${nome}

*Lista de Materiais de Interesse:* ${itensTexto}

*Observações Adicionais / Cortes:*
${obs}

---
_Solicitação gerada via Catálogo Digital RQM_`;

        window.open(`https://api.whatsapp.com/send?phone=${whatsappNumero}&text=${encodeURIComponent(message)}`, '_blank');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderCatalog();
});