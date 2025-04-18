// Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

// Carrossel de Imagens
const slides = document.querySelectorAll('.carrossel .slide');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let currentSlide = 0;

function updateSlidePosition() {
  const carouselContainer = document.getElementById('carousel-container');
  carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlidePosition();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlidePosition();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Iniciar Carrossel automaticamente
let autoSlideInterval = setInterval(nextSlide, 5000);  // 4 segundos para cada slide
