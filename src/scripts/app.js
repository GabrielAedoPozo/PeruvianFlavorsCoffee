document.addEventListener('DOMContentLoaded', () => {
  // 1) Header: menú móvil
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isActive = menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isActive));
    });
  }

  // 2) Hero Slider
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.slide');
    let currentSlide = 0;
    const HERO_INTERVAL = 3000; // Changed from 4000 to 3000 (3 seconds)
    let heroTimer;

    const goToSlide = (index) => {
      if (!slides.length) return;
      // Ensure infinite loop with modulo operation
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
    };

    const nextSlide = () => {
      // Move to next slide, will loop back to 0 after last slide
      goToSlide(currentSlide + 1);
    };
    
    const startHeroSlider = () => { 
      heroTimer = setInterval(nextSlide, HERO_INTERVAL); 
    };
    
    const stopHeroSlider = () => { 
      if (heroTimer) clearInterval(heroTimer); 
    };

    // Initialize - start with first slide
    goToSlide(0);
    
    // Only start auto-play if there are multiple slides
    if (slides.length > 1) {
      startHeroSlider();
      // Pause on hover, resume on leave
      heroSlider.addEventListener('mouseenter', stopHeroSlider);
      heroSlider.addEventListener('mouseleave', startHeroSlider);
    }
  }

  // 3) Blog: slider con fade + dots (si existe)
  const slider = document.querySelector('.blog-slider.fader');
  if (slider) {
    const slides = slider.querySelectorAll('.slide');
    const dotsContainer = slider.querySelector('.blog-dots');
    let current = 0;
    const INTERVAL = 3500;
    let timer;

    const goTo = (idx) => {
      if (!slides.length) return;
      current = (idx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.blog-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
      }
    };

    if (dotsContainer && slides.length) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'blog-dot';
        dot.setAttribute('aria-label', `Ir al slide ${i + 1}`);
        dot.addEventListener('click', () => {
          goTo(i);
          stop(); start();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const next = () => goTo(current + 1);
    const start = () => { timer = setInterval(next, INTERVAL); };
    const stop = () => { if (timer) clearInterval(timer); };

    goTo(0);
    start();
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
  }

  // 4) Productos: enlazar a todos los .producto-detalle de cualquier página
  document.querySelectorAll('.producto-detalle').forEach((root) => {
    // Galería de imágenes
    const mainImg = root.querySelector('.imagen-principal');
    root.querySelectorAll('.producto-galeria img').forEach((img) => {
      img.addEventListener('click', () => { 
        if (mainImg) mainImg.src = img.src; 
      });
    });

    // Elementos del producto (scoped por producto)
    const pesoButtons = Array.from(root.querySelectorAll('.peso-option'));
    const quantity = root.querySelector('#quantity');
    const totalSpan = root.querySelector('#total');
    const whatsappButton = root.querySelector('#whatsappButton');
    const productName =
      root.querySelector('.producto-info h1')?.textContent?.trim() ||
      document.querySelector('h1')?.textContent?.trim() ||
      'Producto';

    // Estado inicial del producto
    const activeBtn = root.querySelector('.peso-option.active') || pesoButtons[0];
    let currentPrice = parseFloat(activeBtn?.getAttribute('data-price') || '32');
    let currentWeight = activeBtn?.getAttribute('data-weight') || '1 unidad';

    // Límite máximo de unidades
    const MAX_QTY = 10;

    // Función para validar y normalizar cantidad
    const validateQuantity = (value) => {
      let qty = parseInt(value, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > MAX_QTY) qty = MAX_QTY;
      return qty;
    };

    // Función para actualizar total y enlace WhatsApp
    const updateTotal = () => {
      if (!quantity) return;
      const qty = validateQuantity(quantity.value);
      quantity.value = String(qty);
      const total = (currentPrice * qty).toFixed(2);
      if (totalSpan) totalSpan.textContent = total;
      if (whatsappButton) {
        const message = encodeURIComponent(`estoy interesado en comprar: ${productName}`);
        whatsappButton.href = `https://wa.me/51987800910?text=${message}`;
      }
    };

    // Cambio de peso/tamaño
    pesoButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Remover active de todos
        pesoButtons.forEach((btn) => btn.classList.remove('active'));
        // Activar el seleccionado
        button.classList.add('active');
        
        // Actualizar precio y peso actuales
        const priceAttr = button.getAttribute('data-price');
        const weightAttr = button.getAttribute('data-weight');
        if (priceAttr) currentPrice = parseFloat(priceAttr);
        if (weightAttr) currentWeight = weightAttr;
        
        updateTotal();
      });
    });

    // Botones de cantidad
    const decreaseBtn = root.querySelector('#decrease');
    const increaseBtn = root.querySelector('#increase');

    decreaseBtn?.addEventListener('click', () => {
      if (!quantity) return;
      const currentQty = validateQuantity(quantity.value);
      const newQty = Math.max(1, currentQty - 1);
      quantity.value = String(newQty);
      updateTotal();
    });

    increaseBtn?.addEventListener('click', () => {
      if (!quantity) return;
      const currentQty = validateQuantity(quantity.value);
      const newQty = Math.min(MAX_QTY, currentQty + 1);
      quantity.value = String(newQty);
      updateTotal();
    });

    // Bloquear tipeo y configurar atributos del input
    if (quantity) {
      quantity.setAttribute('min', '1');
      quantity.setAttribute('max', String(MAX_QTY));
      quantity.setAttribute('step', '1');
      quantity.setAttribute('inputmode', 'none'); // móvil: no teclado
      quantity.readOnly = true; // solo con botones +/- 
    }

    // Inicializar cálculos
    updateTotal();
  });

  // 5) Smooth scroll para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 6) Animaciones on scroll (opcional)
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('animate-in'); });
  }, observerOptions);
  document.querySelectorAll('.producto-card, .accesorio-card, .testimonial-card').forEach(el => observer.observe(el));

  // 7) Lazy loading para imágenes (fallback)
  if ('loading' in HTMLImageElement.prototype === false) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }

  // 8) Manejo de errores de imágenes
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
      console.warn('Error loading image:', this.src);
    });
  });
});