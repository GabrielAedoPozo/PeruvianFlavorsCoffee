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

  // 2) Blog: slider con fade + dots (si existe)
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

  // 3) Productos: enlazar a todos los .producto-detalle de cualquier página
  document.querySelectorAll('.producto-detalle').forEach((root) => {
    // Galería
    const mainImg = root.querySelector('.imagen-principal');
    root.querySelectorAll('.producto-galeria img').forEach((img) => {
      img.addEventListener('click', () => { if (mainImg) mainImg.src = img.src; });
    });

    // Elementos (scoped por producto)
    const pesoButtons = Array.from(root.querySelectorAll('.peso-option'));
    const quantity = root.querySelector('#quantity');
    const totalSpan = root.querySelector('#total');
    const whatsappButton = root.querySelector('#whatsappButton');
    const productName =
      root.querySelector('.producto-info h1')?.textContent?.trim() ||
      document.querySelector('h1')?.textContent?.trim() ||
      'Café';

    // Estado inicial
    const activeBtn = root.querySelector('.peso-option.active') || pesoButtons[0];
    let currentPrice = parseFloat(activeBtn?.getAttribute('data-price') || '32');
    let currentWeight = activeBtn?.getAttribute('data-weight') || '250g';

    const updateTotal = () => {
      const qty = Math.max(1, parseInt(quantity?.value || '1', 10) || 1);
      if (quantity) quantity.value = String(qty);

      const total = (currentPrice * qty).toFixed(2);
      if (totalSpan) totalSpan.textContent = total;

      if (whatsappButton) {
        const message = encodeURIComponent(
          `¡Hola! Me interesa comprar:\n` +
          `- ${qty} unidad(es) de ${productName}\n` +
          `- Peso por unidad: ${currentWeight}\n` +
          `- Total: S/. ${total}`
        );
        whatsappButton.href = `https://wa.me/51987800910?text=${message}`;
      }
    };

    // Cambio de peso
    pesoButtons.forEach((button) => {
      button.addEventListener('click', () => {
        pesoButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        const priceAttr = button.getAttribute('data-price');
        const weightAttr = button.getAttribute('data-weight');
        if (priceAttr) currentPrice = parseFloat(priceAttr);
        if (weightAttr) currentWeight = weightAttr;
        updateTotal();
      });
    });

    // Cantidad
    const dec = root.querySelector('#decrease');
    const inc = root.querySelector('#increase');

    dec?.addEventListener('click', () => {
      if (!quantity) return;
      const val = Math.max(1, (parseInt(quantity.value || '1', 10) || 1) - 1);
      quantity.value = String(val);
      updateTotal();
    });

    inc?.addEventListener('click', () => {
      if (!quantity) return;
      const val = Math.max(1, (parseInt(quantity.value || '1', 10) || 1) + 1);
      quantity.value = String(val);
      updateTotal();
    });

    quantity?.addEventListener('input', updateTotal);
    quantity?.addEventListener('change', updateTotal);

    // Inicial
    updateTotal();
  });
});
  const quantity = /** @type {HTMLInputElement|null} */ (page.querySelector('#quantity'));
  const totalSpan = page.querySelector('#total');
  const whatsappButton = /** @type {HTMLAnchorElement|null} */ (page.querySelector('#whatsappButton'));
  const productName =
    page.querySelector('.producto-info h1')?.textContent?.trim() ||
    document.querySelector('h1')?.textContent?.trim() ||
    'Café';

  let currentPrice = parseFloat(page.querySelector('.peso-option.active')?.getAttribute('data-price') || '32');
  let currentWeight = page.querySelector('.peso-option.active')?.getAttribute('data-weight') || '250g';

  function updateTotal() {
    const qty = Math.max(1, parseInt(quantity?.value || '1', 10));
    if (quantity) quantity.value = String(qty);

    const total = (currentPrice * qty).toFixed(2);
    if (totalSpan) totalSpan.textContent = total;

    const message = encodeURIComponent(
      `¡Hola! Me interesa comprar:\n` +
      `- ${qty} unidad(es) de ${productName}\n` +
      `- Peso por unidad: ${currentWeight}\n` +
      `- Total: S/. ${total}`
    );
    if (whatsappButton) {
      whatsappButton.href = `https://wa.me/51987800910?text=${message}`;
    }
  }

  pesoButtons.forEach((button) => {
    button.addEventListener('click', () => {
      pesoButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      currentPrice = parseFloat(button.getAttribute('data-price') || String(currentPrice));
      currentWeight = button.getAttribute('data-weight') || currentWeight;
      updateTotal();
    });
  });

  const dec = page.querySelector('#decrease');
  const inc = page.querySelector('#increase');

  dec?.addEventListener('click', () => {
    if (!quantity) return;
    const val = Math.max(1, parseInt(quantity.value || '1', 10) - 1);
    quantity.value = String(val);
    updateTotal();
  });

  inc?.addEventListener('click', () => {
    if (!quantity) return;
    const val = Math.max(1, parseInt(quantity.value || '1', 10) + 1);
    quantity.value = String(val);
    updateTotal();
  });

  quantity?.addEventListener('change', updateTotal);
  updateTotal();
;
  quantity?.addEventListener('change', updateTotal);
  updateTotal();
;
