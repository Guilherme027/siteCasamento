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

// Formulário de confirmação via WhatsApp
document.getElementById('rsvpForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const guests = document.getElementById('guests').value;
  const attending = document.getElementById('attending').value;
  const message = document.getElementById('message').value;

  // Mensagem padrão
  let whatsappMessage = `Olá Kaique e Raphaela! Sou *${name}* e estou confirmando minha presença no casamento de vocês.\n\n`;

  // Detalhes da confirmação
  whatsappMessage += `*E-mail:* ${email}\n`;
  whatsappMessage += `*Número de acompanhantes:* ${guests}\n`;
  whatsappMessage += `*Confirmo presença:* ${attending === 'yes' ? 'Sim' : 'Não'}\n`;

  if (message) {
    whatsappMessage += `\n*Mensagem:* ${message}\n`;
  }

  // Codificar a mensagem para URL
  const encodedMessage = encodeURIComponent(whatsappMessage);

  // Número de telefone (substitua pelo número dos noivos)
  const phoneNumber = "5527992288575"; // Exemplo: 11 99999-9999

  // Criar link do WhatsApp
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Abrir WhatsApp em nova aba
  window.open(whatsappUrl, '_blank');

  // Limpar formulário
  this.reset();

  // Feedback para o usuário
  alert("Obrigado por confirmar! Você será redirecionado para o WhatsApp para completar a confirmação.");
});