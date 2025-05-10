document.addEventListener('DOMContentLoaded', () => {
    const produtos = [
        { id: 1, nome: 'Conjunto de Jantar', preco: 2352.92, imagem: 'https://example.com/conjunto-jantar.jpg' },
        { id: 2, nome: 'Cooktop de Indução', preco: 1605.00, imagem: 'https://example.com/cooktop.jpg' },
        { id: 3, nome: 'Pipoqueira Elétrica', preco: 211.00, imagem: 'https://example.com/pipoqueira.jpg' },
        { id: 4, nome: 'Ferro de Passar', preco: 120.00, imagem: 'https://example.com/ferro.jpg' },
        { id: 5, nome: 'Aspirador de Pó', preco: 1500.00, imagem: 'https://example.com/aspirador.jpg' }
    ];

    const searchInput = document.getElementById('search');
    const minPrecoInput = document.getElementById('min-preco');
    const maxPrecoInput = document.getElementById('max-preco');
    const produtosLista = document.getElementById('produtos-lista');
    
    // Atualizar valores de preço
    minPrecoInput.addEventListener('input', () => {
        document.getElementById('min-preco-val').textContent = minPrecoInput.value;
        filtrarProdutos();
    });
    maxPrecoInput.addEventListener('input', () => {
        document.getElementById('max-preco-val').textContent = maxPrecoInput.value;
        filtrarProdutos();
    });

    // Filtrar produtos
    function filtrarProdutos() {
        const searchValue = searchInput.value.toLowerCase();
        const minPreco = parseFloat(minPrecoInput.value);
        const maxPreco = parseFloat(maxPrecoInput.value);
        
        const produtosFiltrados = produtos.filter(produto => {
            const nomeCorreto = produto.nome.toLowerCase().includes(searchValue);
            const precoCorreto = produto.preco >= minPreco && produto.preco <= maxPreco;
            return nomeCorreto && precoCorreto;
        });

        exibirProdutos(produtosFiltrados);
    }

    // Exibir produtos na tela
    function exibirProdutos(produtos) {
        produtosLista.innerHTML = '';
        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${produto.imagem}" alt="${produto.nome}">
                <h4>${produto.nome}</h4>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                <button class="btn" onclick="alert('Você escolheu presentear este item!')">Presentear</button>
            `;
            produtosLista.appendChild(card);
        });
    }

    // Inicializar com todos os produtos
    exibirProdutos(produtos);
});

// Abrir o modal de filtro
function abrirModalFiltro() {
    document.getElementById('modal-filtro').style.display = 'block';
}

// Fechar o modal de filtro
function fecharModalFiltro() {
    document.getElementById('modal-filtro').style.display = 'none';
}
