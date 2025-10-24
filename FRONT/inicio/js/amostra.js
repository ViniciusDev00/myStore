document.addEventListener('DOMContentLoaded', () => {
    const selectorItems = document.querySelectorAll('.selector-item');
    const showcaseBG = document.getElementById('showcase-bg');
    const showcaseTitle = document.getElementById('showcase-title');
    const showcaseDesc = document.getElementById('showcase-description');
    const showcaseButton = document.getElementById('showcase-button');

    // Mapeamento de texturas ou imagens de fundo
    const textures = {
        'Nike TN \'Tiger\'': 'url("FRONT/inicio/IMG/tiger.png")',
        'Nike TN \'Royal\'': 'url("FRONT/inicio/IMG/azul.webp")',
        'Nike TN \'Lilac\'': 'url("FRONT/inicio/IMG/roxo.webp")',
        // Adicione mais mapeamentos se necessário
    };

    // Função para atualizar o conteúdo da seção interativa
    const updateShowcase = (item) => {
        // Verifica se os elementos existem antes de tentar acessá-los
        if (!item || !showcaseTitle || !showcaseDesc || !showcaseButton || !showcaseBG) {
             console.warn("Elementos da seção 'ESCOLHA O SEU' não encontrados.");
             return;
        }

        // Remove classe ativa de todos os seletores
        selectorItems.forEach(el => el.classList.remove('active'));
        // Adiciona classe ativa ao item clicado/atual
        item.classList.add('active');

        // Obtém dados do item selecionado (dos atributos data-*)
        const id = item.dataset.id;
        const title = item.dataset.title;
        const desc = item.dataset.desc;
        // Pega a textura correspondente ou um fundo padrão
        const bgTexture = textures[title] || 'none'; 

        // Atualiza o título, descrição e o ID do produto no botão
        showcaseTitle.textContent = title;
        showcaseDesc.textContent = desc;
        showcaseButton.dataset.productId = id; // Guarda o ID no botão

        // Atualiza a imagem de fundo com um efeito de fade
        showcaseBG.style.opacity = '0';
        setTimeout(() => {
            showcaseBG.style.backgroundImage = bgTexture;
            showcaseBG.style.opacity = '1';
        }, 300); // Tempo da transição (300ms)
    };

    // Adiciona listeners de clique a cada item seletor
    selectorItems.forEach(item => {
        item.addEventListener('click', () => updateShowcase(item));
    });

    // *** ALTERAÇÃO PRINCIPAL AQUI: Botão chama Quick View ***
    // Adiciona listener ao botão principal "Adicionar ao Carrinho"
    if (showcaseButton) {
        showcaseButton.addEventListener('click', (e) => {
            e.preventDefault(); // Impede qualquer ação padrão do botão
            // Pega o ID do produto guardado no botão
            const productId = e.currentTarget.dataset.productId; 

            // Verifica se o ID existe
            if (!productId) {
                 console.error("ID do produto não encontrado no botão da seção interativa.");
                 alert("Erro ao identificar o produto.");
                 return;
            }
            
            // CHAMA A FUNÇÃO GLOBAL DO QUICK VIEW (definida em main.js)
            if (window.quickViewApp && typeof window.quickViewApp.openQuickView === 'function') {
                window.quickViewApp.openQuickView(productId); 
            } else {
                // Mensagem de erro se a função global não for encontrada
                console.error('Erro: QuickViewApp ou openQuickView não está definido.');
                alert('Erro ao abrir detalhes do produto.');
            }
        });
    }

    // Inicializa a seção com o primeiro item selecionado ao carregar a página
    const firstItem = document.querySelector('.selector-item');
    if (firstItem) {
        updateShowcase(firstItem);
    } else {
         console.warn("Nenhum item seletor encontrado para inicializar a seção 'ESCOLHA O SEU'.");
    }
});