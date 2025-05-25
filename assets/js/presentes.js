 // Configuração do Firebase com seu link
        const firebaseConfig = {
            databaseURL: "https://sitecasamento-fc6be-default-rtdb.firebaseio.com/"
        };

        // Inicialize o Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();

        // Referência para a lista de presentes no Firebase
        const giftsRef = database.ref('gifts');

        document.addEventListener('DOMContentLoaded', function() {
            // Elementos da UI
            const giftGrid = document.getElementById('giftList');
            const loading = document.getElementById('loading');
            const categoryButtons = document.querySelectorAll('.category-btn');
            const minPriceInput = document.getElementById('minPrice');
            const maxPriceInput = document.getElementById('maxPrice');
            const resetButton = document.getElementById('resetFilters');
            const menuToggle = document.getElementById('menuToggle');
            const navLinks = document.getElementById('navLinks');
            const navbar = document.querySelector('.navbar');

            // Navbar scroll effect
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });

            // Mobile menu toggle
            menuToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                
                // Alternar ícone do menu
                if (navLinks.classList.contains('active')) {
                    menuToggle.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });

            // Close menu when clicking on a link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });

            // Carregar presentes do Firebase
            giftsRef.on('value', (snapshot) => {
                const gifts = snapshot.val();
                renderGifts(gifts);
                setupEventListeners();
                loading.style.display = 'none';
            }, (error) => {
                console.error("Erro ao carregar dados:", error);
                loading.style.display = 'none';
                giftGrid.innerHTML = '<p>Ocorreu um erro ao carregar a lista de presentes. Por favor, tente novamente mais tarde.</p>';
            });

            // Função para renderizar os presentes
      function renderGifts(gifts) {
    giftGrid.innerHTML = '';
    
    if (!gifts) {
        giftGrid.innerHTML = '<p>Nenhum presente encontrado.</p>';
        return;
    }
    
    for (const key in gifts) {
        if (gifts.hasOwnProperty(key)) {
            const gift = gifts[key];
            const giftItem = document.createElement('div');
            giftItem.className = 'gift-item';
            giftItem.dataset.id = key;
            giftItem.dataset.category = gift.category;
            giftItem.dataset.price = gift.price;
            
            // Imagem padrão caso não tenha
            const imageUrl = gift.image || 'https://images.unsplash.com/photo-1583524505974-6facd53f4593?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
            
            giftItem.innerHTML = `
                <div class="gift-image-container">
                    <img src="${imageUrl}" alt="${gift.title}" class="gift-image" onerror="this.src='https://images.unsplash.com/photo-1583524505974-6facd53f4593?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'">
                </div>
                <div class="gift-info">
                    <span class="gift-category">${gift.category}</span>
                    <h3 class="gift-title">${gift.title}</h3>
                    <p class="gift-description">${gift.description}</p>
                    <div class="gift-price">R$ ${gift.price.toFixed(2).replace('.', ',')}</div>
                    <div class="gift-actions">
                        ${gift.link !== '#' ? 
                            `<a href="${gift.link}" target="_blank" class="btn btn-view">Ver Produto</a>` : 
                            ''
                        }
                        ${gift.reserved ? 
                            `<div class="reservation-info">
                                <span class="gift-status reserved">Reservado por ${gift.reservedBy}</span>
                                <button class="btn btn-cancel cancel-btn">Cancelar Reserva</button>
                            </div>` : 
                            `<button class="btn reserve-btn">Reservar</button>`
                        }
                    </div>
                </div>
            `;
            
            giftGrid.appendChild(giftItem);
        }
    }
}
            // Configurar event listeners após renderizar
            function setupEventListeners() {
                // Filtros
                categoryButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        categoryButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        filterGifts();
                    });
                });

                minPriceInput.addEventListener('input', filterGifts);
                maxPriceInput.addEventListener('input', filterGifts);

                resetButton.addEventListener('click', function() {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
                    minPriceInput.value = '';
                    maxPriceInput.value = '';
                    filterGifts();
                });

                // Botões de reserva
                document.querySelectorAll('.reserve-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const giftId = this.closest('.gift-item').dataset.id;
                        reserveGift(giftId);
                    });
                });

                // Botões de cancelamento
                document.querySelectorAll('.cancel-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const giftId = this.closest('.gift-item').dataset.id;
                        cancelReservation(giftId);
                    });
                });
            }

            // Função para filtrar presentes
            function filterGifts() {
                const activeCategory = document.querySelector('.category-btn.active').dataset.category;
                const minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
                const maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : Infinity;
                
                document.querySelectorAll('.gift-item').forEach(item => {
                    const itemCategory = item.dataset.category.toLowerCase();
                    const itemPrice = parseFloat(item.dataset.price);
                    
                    // Normalizar as categorias para comparação (remover acentos e converter para minúsculas)
                    const normalizeCategory = (cat) => {
                        return cat.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
                            .trim();
                    };
                    
                    const activeCatNormalized = normalizeCategory(activeCategory);
                    const itemCatNormalized = normalizeCategory(itemCategory);
                    
                    const categoryMatch = activeCategory === 'all' || 
                                        activeCatNormalized === itemCatNormalized;
                    const priceMatch = itemPrice >= minPrice && itemPrice <= maxPrice;
                    
                    item.style.display = categoryMatch && priceMatch ? 'block' : 'none';
                });
            }

            // Função para reservar presente
            function reserveGift(giftId) {
                const userName = prompt("Por favor, digite seu nome para reservar este presente:");
                
                if (userName && userName.trim() !== '') {
                    giftsRef.child(giftId).update({
                        reserved: true,
                        reservedBy: userName.trim(),
                        reservedAt: firebase.database.ServerValue.TIMESTAMP
                    }).then(() => {
                        alert("Presente reservado com sucesso!");
                    }).catch(error => {
                        console.error("Erro ao reservar presente:", error);
                        alert("Ocorreu um erro ao reservar o presente. Por favor, tente novamente.");
                    });
                }
            }

            // Função para cancelar reserva
            function cancelReservation(giftId) {
                if (confirm("Tem certeza que deseja cancelar a reserva deste presente?")) {
                    giftsRef.child(giftId).update({
                        reserved: false,
                        reservedBy: "",
                        reservedAt: null
                    }).then(() => {
                        alert("Reserva cancelada com sucesso!");
                    }).catch(error => {
                        console.error("Erro ao cancelar reserva:", error);
                        alert("Ocorreu um erro ao cancelar a reserva. Por favor, tente novamente.");
                    });
                }
            }
        });

        // Função para inicializar dados (executar apenas uma vez no console)
        function initializeGifts() {
            const gifts = {
                "gift1": {
                    "title": "Jogo de Panelas Premium",
                    "category": "Cozinha",
                    "description": "Jogo completo de 10 peças em aço inox com revestimento antiaderente.",
                    "price": 580.00,
                    "image": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01",
                    "reserved": false,
                    "reservedBy": ""
                },
                "gift2": {
                    "title": "Conjunto de Facas Profissional",
                    "category": "Cozinha",
                    "description": "Conjunto com 6 facas de aço inoxidável e suporte de madeira.",
                    "price": 320.00,
                    "image": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01",
                    "reserved": false,
                    "reservedBy": ""
                },
                "gift3": {
                    "title": "Máquina de Café Expresso",
                    "category": "Eletrodomésticos",
                    "description": "Máquina automática com moedor integrado e preparo de cappuccino.",
                    "price": 1200.00,
                    "image": "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01",
                    "reserved": false,
                    "reservedBy": ""
                }
            };

            giftsRef.set(gifts)
                .then(() => console.log("Dados inicializados com sucesso!"))
                .catch(error => console.error("Erro ao inicializar dados:", error));
        }