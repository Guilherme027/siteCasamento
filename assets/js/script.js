// Navbar scroll effect
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', function () {
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

// Scroll to section
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);

    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: 'smooth'
    });
  });
});

// Countdown timer
function updateCountdown() {
  const weddingDate = new Date('October 25, 2025 16:00:00').getTime();
  const now = new Date().getTime();
  const distance = weddingDate - now;

  // Cálculos para dias, horas, minutos e segundos
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Atualiza os elementos HTML
  document.getElementById('days').innerText = days.toString().padStart(2, '0');
  document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
  document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');

  // Se a contagem regressiva terminar
  if (distance < 0) {
    clearInterval(countdownTimer);
    document.getElementById('countdown').innerHTML = "<h3>O grande dia chegou!</h3>";
  }
}

// Inicia a contagem regressiva
const countdownTimer = setInterval(updateCountdown, 1000);
updateCountdown(); // Chama imediatamente para evitar atraso inicial

// Carrossel de imagens
const swiper = new Swiper('.swiper', {
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  },
  slidesPerView: 1,
  centeredSlides: true,
  spaceBetween: 0,
  speed: 1000
});

// RSVP - Busca e confirmação de convidado
document.getElementById('searchBtn').addEventListener('click', searchGuest);
document.getElementById('confirmBtn').addEventListener('click', confirmAttendance);

let currentGuestId = null;

async function searchGuest() {
    const searchName = document.getElementById('searchName').value.trim().toLowerCase();
    const feedback = document.getElementById('searchFeedback');
    const guestInfo = document.getElementById('guestInfo');
    
    // Resetar estado anterior
    currentGuestId = null;
    guestInfo.style.display = 'none';
    feedback.innerHTML = '';
    
    if (!searchName) {
        feedback.innerHTML = '<div class="confirmation-error">Por favor, digite seu nome</div>';
        return;
    }
    
    // Extrai apenas o primeiro nome
    const firstName = searchName.split(' ')[0];
    
    // Mostra o loading
    feedback.innerHTML = `
        <div class="spinner"></div>
        <p class="searching-text">Buscando seu nome na lista...</p>
    `;
    
    try {
        const q = firebase.query(
            firebase.collection(firebase.db, 'guests'),
            firebase.where('nameLower', '>=', firstName),
            firebase.where('nameLower', '<=', firstName + '\uf8ff')
        );
        
        const querySnapshot = await firebase.getDocs(q);
        
        if (querySnapshot.empty) {
            feedback.innerHTML = '<div class="confirmation-error">Nome não encontrado na lista. Verifique se digitou corretamente.</div>';
            return;
        }
        
        // Filtra resultados que realmente começam com o primeiro nome
        const guests = [];
        querySnapshot.forEach((doc) => {
            const guest = doc.data();
            if (guest.nameLower.startsWith(firstName)) {
                guests.push({
                    id: doc.id,
                    ...guest
                });
            }
        });
        
        if (guests.length === 0) {
            feedback.innerHTML = '<div class="confirmation-error">Nome não encontrado na lista. Verifique se digitou corretamente.</div>';
            return;
        }
        
        // Se houver apenas um resultado, mostra diretamente
        if (guests.length === 1) {
            showGuestInfo(guests[0]);
            return;
        }
        
        // Se houver múltiplos resultados, mostra lista para seleção
        showGuestSelection(guests, feedback);
        
    } catch (error) {
        feedback.innerHTML = '<div class="confirmation-error">Ocorreu um erro ao buscar seu nome. Tente novamente mais tarde.</div>';
        console.error('Error searching guest:', error);
    }
}

function showGuestInfo(guest) {
    // Resetar campos primeiro
    document.getElementById('guestName').textContent = '';
    document.getElementById('confirmEmail').value = '';
    document.getElementById('confirmAttendance').value = 'yes';
    
    // Preencher com novos dados
    currentGuestId = guest.id;
    document.getElementById('guestName').textContent = guest.name;
    document.getElementById('confirmEmail').value = guest.email || '';
    
    if (guest.status === 'confirmed') {
        document.getElementById('confirmAttendance').value = 'yes';
    } else if (guest.status === 'declined') {
        document.getElementById('confirmAttendance').value = 'no';
    }
    
    // Mostrar seção de confirmação
    document.getElementById('guestInfo').style.display = 'block';
    document.getElementById('searchFeedback').innerHTML = '';
    
    // Scroll para a seção de confirmação
    document.getElementById('guestInfo').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function showGuestSelection(guests, feedbackElement) {
    const guestListHTML = guests.map(guest => `
        <div class="guest-option" data-id="${guest.id}">
            <span class="guest-name">${guest.name}</span>
            ${guest.email ? `<span class="guest-email">${guest.email}</span>` : ''}
        </div>
    `).join('');
    
    feedbackElement.innerHTML = `
        <div class="guest-selection">
            <p class="selection-title">Encontramos ${guests.length} convidados com nome similar:</p>
            <div class="guest-options">
                ${guestListHTML}
            </div>
        </div>
    `;
    
    // Adiciona event listeners para cada opção
    document.querySelectorAll('.guest-option').forEach(option => {
        option.addEventListener('click', function() {
            const guestId = this.getAttribute('data-id');
            const selectedGuest = guests.find(g => g.id === guestId);
            showGuestInfo(selectedGuest);
            feedbackElement.innerHTML = ''; // Isso faz a lista desaparecer
        });
    });
}
async function confirmAttendance() {
    const email = document.getElementById('confirmEmail').value.trim();
    const attending = document.getElementById('confirmAttendance').value;
    const feedback = document.getElementById('searchFeedback');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (!email) {
        feedback.innerHTML = '<div class="confirmation-error">Por favor, informe um e-mail para contato</div>';
        return;
    }
    
    // Mostra loading bege no botão
    const originalBtnText = confirmBtn.innerHTML;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: var(--bege)"></i> Confirmando...';
    confirmBtn.disabled = true;
    
    const status = attending === 'yes' ? 'confirmed' : 'declined';
    
    try {
        const guestRef = firebase.doc(firebase.db, 'guests', currentGuestId);
        const guestDoc = await firebase.getDoc(guestRef);
        
        if (!guestDoc.exists()) {
            throw new Error('Convidado não encontrado');
        }
        
        const guestData = guestDoc.data();
        
        const updateData = {
            email: email,
            status: status,
            confirmedAt: firebase.firestore.FieldValue.serverTimestamp(),
            name: guestData.name,
            nameLower: guestData.nameLower
        };
        
        await firebase.updateDoc(guestRef, updateData);
        
        feedback.innerHTML = `
            <div class="confirmation-success">
                <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
                ${attending === 'yes' 
                    ? 'Presença confirmada com sucesso! Estamos ansiosos para vê-lo(a) no nosso grande dia!' 
                    : 'Lamentamos sua ausência, mas agradecemos por avisar!'}
            </div>
        `;
        
        document.getElementById('guestInfo').style.display = 'none';
        document.getElementById('searchName').value = '';
    } catch (error) {
        console.error('Erro completo:', error);
        
        let errorMessage = 'Ocorreu um erro ao confirmar sua presença.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Erro de permissão - por favor, contate os noivos.';
        }
        
        feedback.innerHTML = `
            <div class="confirmation-error">
                <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
                ${errorMessage}
            </div>
        `;
    } finally {
        confirmBtn.innerHTML = originalBtnText;
        confirmBtn.disabled = false;
    }
}