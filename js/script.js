// Catálogo Real de Materiais da RQM com Grupos, Medidas e Valores fictícios para teste
const produtos = [
    {
        id: 1,
        titulo: "Cantoneiras de Ferro e Aço",
        especificacoes: "Abas iguais e desiguais em barras de 6 metros ou cortadas sob medida.",
        imagem: "http://googleusercontent.com/image_collection/image_retrieval/9220372035319089467",
        variacoes: [
            { idVariacao: "cant-1", medida: "1/2\" x 1/8\" (12,70 x 3,17 mm)", valor: "R$ 48,90 / barra" },
            { idVariacao: "cant-2", medida: "3/4\" x 1/8\" (19,05 x 3,17 mm)", valor: "R$ 65,50 / barra" },
            { idVariacao: "cant-3", medida: "1\" x 1/8\" (25,40 x 3,17 mm)", valor: "R$ 82,00 / barra" },
            { idVariacao: "cant-4", medida: "1.1/2\" x 3/16\" (38,10 x 4,76 mm)", valor: "R$ 154,30 / barra" }
        ]
    },
    {
        id: 2,
        titulo: "Ferro Chato (Barras)",
        especificacoes: "Barras chatas de alta resistência para serralheria, estruturas e usinagem.",
        imagem: "http://googleusercontent.com/image_collection/image_retrieval/13195216048069167158",
        variacoes: [
            { idVariacao: "chato-1", medida: "1/2\" x 1/8\" (12,70 x 3,17 mm)", valor: "R$ 32,10 / barra" },
            { idVariacao: "chato-2", medida: "3/4\" x 3/16\" (19,05 x 4,76 mm)", valor: "R$ 58,40 / barra" },
            { idVariacao: "chato-3", medida: "1\" x 1/4\" (25,40 x 6,35 mm)", valor: "R$ 94,80 / barra" }
        ]
    },
    {
        id: 3,
        titulo: "Tubos Industriais (Quadrados, Redondos e Retangulares)",
        especificacoes: "Tubos com costura, alta precisão dimensional e excelente acabamento para pintura ou zincagem.",
        imagem: "http://googleusercontent.com/image_collection/image_retrieval/2454670599483014625",
        variacoes: [
            { idVariacao: "tubo-1", medida: "Tubo Redondo 1\" (Parede 1,20 mm)", valor: "R$ 72,00 / barra" },
            { idVariacao: "tubo-2", medida: "Tubo Quadrado 40x40 mm (Parede 1,50 mm)", valor: "R$ 115,00 / barra" },
            { idVariacao: "tubo-3", medida: "Tubo Retangular 50x30 mm (Parede 1,50 mm)", valor: "R$ 128,50 / barra" }
        ]
    },
    {
        id: 4,
        titulo: "Roldanas de Aço e Guias",
        especificacoes: "Roldanas usinadas de alta precisão para trilhos, portões e maquinários pesados.",
        imagem: "http://googleusercontent.com/image_collection/image_retrieval/18244835111934123243",
        variacoes: [
            { idVariacao: "rold-1", medida: "Roldana Canal 'V' de 2\" com rolamento", valor: "R$ 18,50 / un" },
            { idVariacao: "rold-2", medida: "Roldana Canal 'V' de 3\" com rolamento", valor: "R$ 29,90 / un" },
            { idVariacao: "rold-3", medida: "Roldana Canal U 3\" dupla", valor: "R$ 54,00 / un" }
        ]
    },
    {
        id: 5,
        titulo: "Discos e Flanges Estampados",
        especificacoes: "Chapas circulares e discos de aço carbono ideais para tampas, bases e calandragem.",
        imagem: "http://googleusercontent.com/image_collection/image_retrieval/11355019144734550513",
        variacoes: [
            { idVariacao: "disc-1", medida: "Disco Diâmetro 100 mm (Espessura 3 mm)", valor: "R$ 12,00 / un" },
            { idVariacao: "disc-2", medida: "Disco Diâmetro 150 mm (Espessura 4,75 mm)", valor: "R$ 24,50 / un" },
            { idVariacao: "disc-3", medida: "Disco Diâmetro 200 mm (Espessura 6,35 mm)", valor: "R$ 41,00 / un" }
        ]
    }
];

// Lista temporária de orçamentos (Carrinho)
let cart = [];

// ==========================================================================
// CONTROLE DO TEMA (CLARO / ESCURO)
// ==========================================================================
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
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeIcon.innerText = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            themeIcon.innerText = '🌙';
        }
    });
}

// ==========================================================================
// RENDERIZAR INTERATIVAMENTE OS CARDS E TABELAS
// ==========================================================================
function renderProdutos() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = produtos.map(prod => {
        // Gera cada linha da tabela interna do card
        const linhasTabela = prod.variacoes.map(v => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 0.95rem;">${v.medida}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; font-weight: bold; color: var(--text-main);">${v.valor}</td>
                <td style="padding: 10px; border-bottom: 1px solid var(--border-color); text-align: right;">
                    <button class="btn-add" style="padding: 6px 12px; font-size: 0.85rem;" onclick="addToCart('${prod.titulo}', '${v.medida}', '${v.valor}', '${v.idVariacao}')">
                        + Orçamento
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="product-card">
                <img src="${prod.imagem}" alt="${prod.titulo}" class="product-img">
                <div class="product-info">
                    <h3 style="margin-bottom: 0.5rem;">${prod.titulo}</h3>
                    <p class="tech-spec" style="margin-bottom: 1rem; font-size: 0.9rem; border-top: none; padding-top: 0;">${prod.especificacoes}</p>
                    
                    <div style="width: 100%; overflow-x: auto; background-color: var(--bg-main); border-radius: 8px; border: 1px solid var(--border-color); margin-top: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background-color: var(--border-color); color: var(--text-main);">
                                    <th style="padding: 10px; font-size: 0.85rem; font-weight: 800;">Medida</th>
                                    <th style="padding: 10px; font-size: 0.85rem; font-weight: 800;">Preço Unitário</th>
                                    <th style="padding: 10px; font-size: 0.85rem; font-weight: 800; text-align: right;">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linhasTabela}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================================================
// GERENCIAR LISTA DE ORÇAMENTO
// ==========================================================================
window.addToCart = function(grupo, medida, valor, idVariacao) {
    if (cart.some(item => item.idVariacao === idVariacao)) {
        alert("Esta medida já foi adicionada à sua lista de orçamento!");
        return;
    }

    cart.push({ grupo, medida, valor, idVariacao });
    updateCartUI();
};

window.removeFromCart = function(idVariacao) {
    cart = cart.filter(item => item.idVariacao !== idVariacao);
    updateCartUI();
};

function updateCartUI() {
    const counter = document.getElementById('cart-counter');
    if (counter) counter.innerText = cart.length;
    
    const container = document.getElementById('selected-items-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart-msg">Nenhum item adicionado ainda.</p>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="budget-item-row" style="padding: 12px 0;">
            <div>
                <span style="display: block; font-size: 0.9rem; color: var(--text-muted);">${item.grupo}</span>
                <strong>${item.medida}</strong>
            </div>
            <button class="btn-remove" onclick="removeFromCart('${item.idVariacao}')">Remover</button>
        </div>
    `).join('');
}

// ==========================================================================
// DISPARO DE MENSAGEM VIA WHATSAPP (INTEGRAÇÃO COM O SEU SISTEMA COLLINES)
// ==========================================================================
const form = document.getElementById('form-orcamento');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Por favor, adicione ao menos um item das tabelas antes de solicitar o orçamento!");
            return;
        }

        const whatsappNumero = "5511917348484"; 
        const nome = document.getElementById('nome').value;
        const obs = document.getElementById('observacoes').value || "Não informadas";

        let itensTexto = "";
        cart.forEach((item) => {
            itensTexto += `\n- *${item.grupo}* : ${item.medida} (${item.valor})`;
        });

        const message = `Olá, gostaria de solicitar um orçamento técnico!

*Identificação:*
👤 *Nome / Empresa:* ${nome}

*Itens Selecionados no Painel:* ${itensTexto}

*Observações e Detalhes do Pedido:*
${obs}

---
_Enviado através do Catálogo RQM_`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send?phone=${whatsappNumero}&text=${encodedMessage}`, '_blank');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderProdutos();
});