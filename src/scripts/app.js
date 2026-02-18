// ============================================================================
// PROTECCIÓN CONTRA EJECUCIÓN MÚLTIPLE
// ============================================================================
if (window.__appScriptInitialized) {
  console.warn('app.js ya inicializado, evitando duplicación');
} else {
  window.__appScriptInitialized = true;

  document.addEventListener('DOMContentLoaded', () => {
    // 1) Header: menú móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuClose = navLinks?.querySelector('.menu-close');
    const navAnchors = navLinks ? Array.from(navLinks.querySelectorAll('a')) : [];

    if (menuToggle && navLinks) {
      const setMenuState = (open) => {
        menuToggle.classList.toggle('active', open);
        navLinks.classList.toggle('active', open);
        document.body.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        if (open) {
          (menuClose || navAnchors[0] || navLinks).focus?.();
        } else {
          menuToggle.focus?.();
        }
      };

      const isOpen = () => navLinks.classList.contains('active');
      const openMenu = () => setMenuState(true);
      const closeMenu = () => setMenuState(false);
      const toggleMenu = () => setMenuState(!isOpen());

      menuToggle.addEventListener('click', toggleMenu);
      menuClose?.addEventListener('click', closeMenu);

      // Cerrar al hacer click en un enlace del menú (móvil)
      navAnchors.forEach((a) => a.addEventListener('click', closeMenu));

      // Cerrar con ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) closeMenu();
      });
    }

    // 2) Hero Slider con efecto Parallax
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
      const slides = heroSlider.querySelectorAll('.slide');
      const dotsContainer = heroSlider.querySelector('.hero-dots');
      let currentSlide = 0;
      const HERO_INTERVAL = 4000; // 4 seconds
      let heroTimer = null;

      // Efecto parallax con movimiento del mouse
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;
      let parallaxRAF = null;
      let isParallaxActive = false;

      // Función para detener completamente el parallax
      const stopParallax = () => {
        isParallaxActive = false;
        if (parallaxRAF !== null) {
          cancelAnimationFrame(parallaxRAF);
          parallaxRAF = null;
        }
      };

      const parallaxEffect = () => {
        if (!isParallaxActive) {
          stopParallax();
          return;
        }
        
        const activeSlide = heroSlider.querySelector('.slide.active');
        if (!activeSlide) {
          stopParallax();
          return;
        }

        const parallaxBg = activeSlide.querySelector('.parallax-bg');
        if (!parallaxBg) {
          stopParallax();
          return;
        }

        // Suavizar el movimiento
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        const moveX = targetX * 0.015;
        const moveY = targetY * 0.015;

        parallaxBg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
        
        if (isParallaxActive) {
          parallaxRAF = requestAnimationFrame(parallaxEffect);
        }
      };

      // Handler para mousemove (sin duplicar)
      const handleMouseMove = (e) => {
        const rect = heroSlider.getBoundingClientRect();
        mouseX = e.clientX - rect.left - rect.width / 2;
        mouseY = e.clientY - rect.top - rect.height / 2;
      };

      // Handler para mouseenter (sin duplicar)
      const handleMouseEnter = () => {
        if (!isParallaxActive) {
          stopParallax(); // Asegurar limpieza antes de iniciar
          isParallaxActive = true;
          parallaxRAF = requestAnimationFrame(parallaxEffect);
        }
      };

      // Handler para mouseleave (sin duplicar)
      const handleMouseLeave = () => {
        stopParallax();
        // Resetear posición suavemente
        targetX = 0;
        targetY = 0;
        const activeSlide = heroSlider.querySelector('.slide.active');
        if (activeSlide) {
          const parallaxBg = activeSlide.querySelector('.parallax-bg');
          if (parallaxBg) {
            parallaxBg.style.transform = 'translate(0, 0) scale(1.1)';
          }
        }
      };

      heroSlider.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroSlider.addEventListener('mouseenter', handleMouseEnter);
      heroSlider.addEventListener('mouseleave', handleMouseLeave);

      // Crear dots si hay contenedor y slides
      if (dotsContainer && slides.length) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'hero-dot';
          dot.setAttribute('aria-label', `Ir al slide ${i + 1}`);
          dot.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
          
          // Handler único para cada dot
          const handleDotClick = () => {
            goToSlide(i);
            stopHeroSlider();
            startHeroSlider();
          };
          
          dot.addEventListener('click', handleDotClick);
          dotsContainer.appendChild(dot);
        });
      }

      const syncDots = () => {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.hero-dot');
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === currentSlide);
          d.setAttribute('aria-pressed', i === currentSlide ? 'true' : 'false');
        });
      };

      const goToSlide = (index) => {
        if (!slides.length) return;
        const oldSlide = currentSlide;
        currentSlide = (index + slides.length) % slides.length;
        if (oldSlide !== currentSlide) {
          slides.forEach((slide, i) => slide.classList.toggle('active', i === currentSlide));
          syncDots();
        }
      };

      const nextSlide = () => { goToSlide(currentSlide + 1); };
      
      const stopHeroSlider = () => {
        if (heroTimer !== null) {
          clearInterval(heroTimer);
          heroTimer = null;
        }
      };
      
      const startHeroSlider = () => {
        // Evitar múltiples intervals acumulándose (causa saltos/"retrocesos")
        stopHeroSlider();
        if (slides.length > 1) {
          heroTimer = setInterval(nextSlide, HERO_INTERVAL);
        }
      };

      // Inicializar
      goToSlide(0);
      if (slides.length > 1) {
        startHeroSlider();
        // Slider siempre activo - no se pausa con mouse
      }

      // Limpieza al salir de la página (beforeunload)
      window.addEventListener('beforeunload', () => {
        stopHeroSlider();
        stopParallax();
      });
    }

    // 3) Blog: slider con fade + dots (si existe)
    const slider = document.querySelector('.blog-slider.fader');
    if (slider) {
      const slides = slider.querySelectorAll('.slide');
      const dotsContainer = slider.querySelector('.blog-dots');
      let current = 0;
      const INTERVAL = 3500;
      let timer = null;

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
          
          const handleClick = () => {
            goTo(i);
            stop();
            start();
          };
          
          dot.addEventListener('click', handleClick);
          dotsContainer.appendChild(dot);
        });
      }

      const next = () => goTo(current + 1);
      
      const start = () => {
        stop(); // Evitar múltiples timers
        timer = setInterval(next, INTERVAL);
      };
      
      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      goTo(0);
      start();
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);

      // Limpieza
      window.addEventListener('beforeunload', stop);
    }

  // 3.5) Carrusel de Accesorios
  const accesoriosCarousel = document.querySelector('.accesorios-carousel');
  if (accesoriosCarousel) {
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    let currentScroll = 0;
    
    const getCardsPerView = () => {
      const width = window.innerWidth;
      if (width <= 480) return 1;
      if (width <= 768) return 1;
      if (width <= 1200) return 3;
      return 4;
    };

    const getScrollAmount = () => {
      const cardWidth = accesoriosCarousel.querySelector('.accesorio-card')?.offsetWidth || 300;
      const gap = 24; // 1.5rem = 24px
      return cardWidth + gap;
    };

    const updateButtonStates = () => {
      if (!prevBtn || !nextBtn) return;
      
      const maxScroll = accesoriosCarousel.scrollWidth - accesoriosCarousel.clientWidth;
      
      prevBtn.disabled = currentScroll <= 0;
      nextBtn.disabled = currentScroll >= maxScroll;
      
      prevBtn.style.opacity = currentScroll <= 0 ? '0.4' : '1';
      nextBtn.style.opacity = currentScroll >= maxScroll ? '0.4' : '1';
      
      prevBtn.style.cursor = currentScroll <= 0 ? 'not-allowed' : 'pointer';
      nextBtn.style.cursor = currentScroll >= maxScroll ? 'not-allowed' : 'pointer';
    };

    const scrollToPosition = (position) => {
      accesoriosCarousel.scrollTo({
        left: position,
        behavior: 'smooth'
      });
    };

    const nextCard = () => {
      const maxScroll = accesoriosCarousel.scrollWidth - accesoriosCarousel.clientWidth;
      const scrollAmount = getScrollAmount();
      currentScroll = Math.min(currentScroll + scrollAmount, maxScroll);
      scrollToPosition(currentScroll);
      setTimeout(updateButtonStates, 350);
    };

    const prevCard = () => {
      const scrollAmount = getScrollAmount();
      currentScroll = Math.max(currentScroll - scrollAmount, 0);
      scrollToPosition(currentScroll);
      setTimeout(updateButtonStates, 350);
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevCard();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextCard();
      });
    }

    // Actualizar al hacer scroll manual
    accesoriosCarousel.addEventListener('scroll', () => {
      currentScroll = accesoriosCarousel.scrollLeft;
      updateButtonStates();
    });

    // Inicializar y actualizar al cambiar tamaño
    const initCarousel = () => {
      currentScroll = 0;
      accesoriosCarousel.scrollLeft = 0;
      updateButtonStates();
    };

    initCarousel();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initCarousel();
      }, 150);
    });

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (accesoriosCarousel.matches(':hover') || document.activeElement?.closest('.accesorios-wrapper')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevCard();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          nextCard();
        }
      }
    });
  }

    // 4) Productos: enlazar a todos los .producto-detalle de cualquier página
    // PROTECCIÓN: Solo inicializar productos que no hayan sido inicializados
    document.querySelectorAll('.producto-detalle').forEach((root) => {
      // Verificar si ya fue inicializado (evita duplicación)
      if (root.dataset.initialized === 'true') {
        return; // Ya fue procesado, saltar
      }
      
      // Marcar como inicializado
      root.dataset.initialized = 'true';

      // Galería de imágenes
      const mainImg = root.querySelector('.imagen-principal');
      root.querySelectorAll('.producto-galeria img').forEach((img) => {
        const handleImageClick = () => { 
          if (mainImg) mainImg.src = img.src; 
        };
        img.addEventListener('click', handleImageClick);
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
        const handleWeightClick = () => {
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
        };
        
        button.addEventListener('click', handleWeightClick);
      });

      // Botones de cantidad
      const decreaseBtn = root.querySelector('#decrease');
      const increaseBtn = root.querySelector('#increase');

      if (decreaseBtn) {
        const handleDecrease = () => {
          if (!quantity) return;
          const currentQty = validateQuantity(quantity.value);
          const newQty = Math.max(1, currentQty - 1);
          quantity.value = String(newQty);
          updateTotal();
        };
        decreaseBtn.addEventListener('click', handleDecrease);
      }

      if (increaseBtn) {
        const handleIncrease = () => {
          if (!quantity) return;
          const currentQty = validateQuantity(quantity.value);
          const newQty = Math.min(MAX_QTY, currentQty + 1);
          quantity.value = String(newQty);
          updateTotal();
        };
        increaseBtn.addEventListener('click', handleIncrease);
      }

      // Bloquear tipeo y configurar atributos del input
      if (quantity) {
        quantity.setAttribute('min', '1');
        quantity.setAttribute('max', String(MAX_QTY));
        quantity.setAttribute('step', '1');
        quantity.setAttribute('inputmode', 'none'); // móvil: no teclado
        quantity.readOnly = true; // solo con botones +/-
        
        // Fix para Safari: prevenir edición manual
        const handleKeydown = (e) => {
          e.preventDefault();
          return false;
        };
        
        const handleInput = (e) => {
          e.target.value = validateQuantity(e.target.value);
          updateTotal();
        };
        
        const handleBlur = () => {
          updateTotal();
        };
        
        quantity.addEventListener('keydown', handleKeydown);
        quantity.addEventListener('input', handleInput);
        quantity.addEventListener('blur', handleBlur);
      }

      // Inicializar cálculos
      updateTotal();
    });

    // 5) Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      const handleAnchorClick = function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      
      anchor.addEventListener('click', handleAnchorClick);
    });

    // 6) Animaciones on scroll (opcional)
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { 
        if (entry.isIntersecting) entry.target.classList.add('animate-in'); 
      });
    }, observerOptions);
    
    document.querySelectorAll('.producto-card, .accesorio-card, .testimonial-card').forEach(el => {
      observer.observe(el);
    });

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
      const handleImageError = function() {
        this.style.display = 'none';
        console.warn('Error loading image:', this.src);
      };
      
      img.addEventListener('error', handleImageError, { once: true });
    });

    // 9) Recipes Slider (si existe)
    const recipesSlider = document.querySelector('.recipes-slider');
    if (recipesSlider) {
      const slides = Array.from(recipesSlider.querySelectorAll('.recipe-slide'));
      const dotsContainer = recipesSlider.querySelector('.recipes-dots');
      let current = 0;
      const INTERVAL = 4000;
      let timer = null;

      const goTo = (idx) => {
        if (!slides.length) return;
        current = (idx + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        if (dotsContainer) {
          dotsContainer.querySelectorAll('button').forEach((d, i) => {
            d.classList.toggle('active', i === current);
            d.setAttribute('aria-pressed', i === current ? 'true' : 'false');
          });
        }
      };

      // Crear dots
      if (dotsContainer && slides.length) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = i === 0 ? 'active' : '';
          b.setAttribute('aria-label', `Ir a receta ${i + 1}`);
          b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
          
          const handleDotClick = () => {
            goTo(i);
            stop();
            start();
          };
          
          b.addEventListener('click', handleDotClick);
          dotsContainer.appendChild(b);
        });
      }

      const next = () => goTo(current + 1);
      
      const start = () => {
        stop(); // Evitar múltiples timers
        timer = setInterval(next, INTERVAL);
      };
      
      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      goTo(0);
      if (slides.length > 1) {
        start();
        recipesSlider.addEventListener('mouseenter', stop);
        recipesSlider.addEventListener('mouseleave', start);
        
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            stop();
          } else {
            start();
          }
        });
      }

      // Limpieza
      window.addEventListener('beforeunload', stop);
    }

    // Limpieza general al salir
    console.log('✅ app.js inicializado correctamente (una sola vez)');
  });
}
