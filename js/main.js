/**
 * Quinta do Olival — Script do Protótipo
 * Standard de Produção Bruto — Motion & Interaction System
 * 
 * Filosofia de Interação (Posicionamento Alto Minho):
 * - Ritmo orgânico, calmo e sereno (sem saltos bruscos / no bounce).
 * - Transições suaves com curva cubic-bezier(0.22, 1, 0.36, 1).
 * - Feedback imediato e amigável em reservas, cálculo de noites e contacto direto.
 * 
 * NOTA DE SEGURANÇA: As ações de reserva neste protótipo são demonstrativas (mock).
 * Não existem transações financeiras automáticas reais nesta fase de protótipo.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollHeader();
  initScrollReveal();
  initMobileMenu();
  initHorizontalBookingBar();
  initDedicatedBookingPage();
  initFaqAccordion();
  initDuvidasForm();
  initBrutoCustomDatePicker();
  initQuintaHousesTabs();
  initReviewsInteractiveScroll();
  initActivitiesTabs();
  initLegalModal();
});

/**
 * 1. Cabeçalho Dinâmico com Transição Suave ao Scroll (Scrolled State)
 * E controlo progressivo da transição da aba e visibilidade do CTA do Header
 */
function initScrollHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const heroBookingWrapper = document.querySelector('.hero-booking-wrapper') || document.querySelector('.hero-actions');
  let ticking = false;

  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // 2 scrolls completos (~220px) para a interação completa progressiva (cada scroll realiza uma fração da transição)
    const maxScroll = 220;
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    
    // Variável CSS progressiva para animação proporcional ao scroll
    header.style.setProperty('--scroll-p', progress.toFixed(3));
    
    if (progress >= 1) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // CTA do Header condicionado ao scroll: entra um bocadinho mais cedo (~80px antes da saída total do formulário)
    if (heroBookingWrapper) {
      const rect = heroBookingWrapper.getBoundingClientRect();
      const isHeroCtaOut = rect.bottom <= 80;
      header.classList.toggle('header-cta-visible', isHeroCtaOut);
    } else {
      header.classList.toggle('header-cta-visible', scrollY > 280);
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

/**
 * Helper de Parsing Flexível de Datas (Suporta ISO YYYY-MM-DD e Formato Europeu DD/MM/AAAA)
 */
function parseDateFlexible(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val !== 'string') return null;
  const clean = val.trim();
  const ymd = clean.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }
  const dmy = clean.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})$/);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * 2. Animação de Scroll Reveal Suave
 */
function initScrollReveal() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const targets = document.querySelectorAll(
    '.card, .section-header, .feature-img-wrapper, .booking-bar-horizontal, .faq-item, .activity-card'
  );

  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  targets.forEach((el) => {
    el.classList.add('reveal-item');
    observer.observe(el);
  });
}

/**
 * 3. Menu Mobile Toggle
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.neptun-nav') || document.querySelector('.nav-menu');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', isExpanded);
      menuBtn.setAttribute('aria-label', isExpanded ? 'Fechar Menu' : 'Abrir Menu');
      menuBtn.innerHTML = isExpanded 
        ? '<svg class="icon-svg-lg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
        : '<svg class="icon-svg-lg" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>';
      document.body.style.overflow = isExpanded ? 'hidden' : '';
    });

    navMenu.querySelectorAll('.nav-link, .mobile-nav-cta').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Abrir Menu');
        menuBtn.innerHTML = '<svg class="icon-svg-lg" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>';
        document.body.style.overflow = '';
      });
    });
  }
}

/**
 * 4. Barra Horizontal de Disponibilidade (Homepage)
 */
function initHorizontalBookingBar() {
  const horizontalForm = document.getElementById('bookingBarForm');
  if (!horizontalForm) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${m}/${y}`;
  };

  const checkinInput = horizontalForm.querySelector('input[name="checkin"]');
  const checkoutInput = horizontalForm.querySelector('input[name="checkout"]');

  if (checkinInput && !checkinInput.value) checkinInput.value = formatDate(tomorrow);
  if (checkoutInput && !checkoutInput.value) checkoutInput.value = formatDate(dayAfter);

  horizontalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkin = checkinInput?.value || '';
    const checkout = checkoutInput?.value || '';
    const guests = horizontalForm.querySelector('select[name="guests"]')?.value || '2 Hóspedes';

    const params = new URLSearchParams();
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (guests) params.set('guests', guests);

    window.location.href = `reservas.html?${params.toString()}`;
  });
}

/**
 * 5. Secção de Casas — Estilo Hotel Odisej (File Accordion + Carrossel de Imagens)
 */
function initQuintaHousesTabs() {
  const accordion = document.getElementById('housesAccordion');
  if (!accordion) return;

  const items = Array.from(accordion.querySelectorAll('.house-file-item'));
  if (!items.length) return;

  // Lógica de Abertura / Fecho do Acordeão em Ficheiro
  items.forEach(item => {
    const header = item.querySelector('.house-file-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isCurrentlyActive = item.classList.contains('active');

      if (isCurrentlyActive) {
        // Se clicar no aberto, fecha para poder ver a lista completa
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
      } else {
        // Fecha todos os outros e expande o clicado
        items.forEach(other => {
          other.classList.remove('active');
          const otherHeader = other.querySelector('.house-file-header');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
        });
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');

        // Scroll suave para alinhar o item aberto no ecrã
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.top < 80 || rect.top > 250) {
            window.scrollBy({ top: rect.top - 85, behavior: 'smooth' });
          }
        }, 150);
      }
    });

    // Acessibilidade por teclado (Enter / Space)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });

  // Inicialização dos Carrosséis em cada Gaveta de Alojamento
  initHouseCarousels();
}

/**
 * Carrosséis de Imagens Independentes para Cada Habitação
 */
function initHouseCarousels() {
  const carousels = document.querySelectorAll('.unit-carousel-wrap');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.unit-carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.unit-carousel-slide'));
    const prevBtn = carousel.querySelector('.carousel-arrow-prev');
    const nextBtn = carousel.querySelector('.carousel-arrow-next');
    const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));

    if (!track || slides.length <= 1) return;

    // Sincronização em tempo real das bolinhas com o deslize nativo
    let isTicking = false;
    track.addEventListener('scroll', () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          const w = track.clientWidth || track.offsetWidth || 1;
          const currentIdx = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / w)));
          dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIdx));
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });

    // Botões de navegação
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = track.clientWidth || 300;
        track.scrollBy({ left: -w, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = track.clientWidth || 300;
        track.scrollBy({ left: w, behavior: 'smooth' });
      });
    }

    // Clique nas bolinhas
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = track.clientWidth || 300;
        track.scrollTo({ left: idx * w, behavior: 'smooth' });
      });
    });
  });
}

/**
 * 6. Curadoria de Arredores com Seletor de Vilas, Banner Explicativo e Paginação
 */
function initActivitiesTabs() {
  const grid = document.getElementById('activitiesGrid');
  if (!grid) return;

  const allCards = Array.from(grid.querySelectorAll('.activity-card'));
  if (!allCards.length) return;

  const townSelect = document.getElementById('town-filter-select');
  const categorySelect = document.getElementById('category-filter-select');
  const countBadge = document.getElementById('activities-count-badge');

  const prevBtn = document.getElementById('activitiesPrevBtn');
  const nextBtn = document.getElementById('activitiesNextBtn');
  const dotsContainer = document.getElementById('activitiesDotsGroup');
  const controls = document.getElementById('activitiesPaginationControls');

  // Elementos do Cartão Editorial de Apresentação da Vila (Ocupa as 2 colunas no Topo)
  const townCard = document.getElementById('townFeatureCard');
  const townImg = document.getElementById('townFeatureImg');
  const townTitle = document.getElementById('townFeatureTitle');
  const townDist = document.getElementById('townFeatureDistance');
  const townDesc = document.getElementById('townFeatureDesc');
  const townHighlights = document.getElementById('townFeatureHighlights');

  const TOWNS_DATA = {
    arcos: {
      title: 'Arcos de Valdevez',
      distance: '~7 km • 8 min da Quinta',
      image: 'assets/images/town_aerial_arcos.jpg',
      imageAlt: 'Vista aérea panorâmica de Arcos de Valdevez e Rio Vez',
      desc: 'Banhada pelo idílico Rio Vez — considerado um dos rios mais limpos da Europa —, a vila dos Arcos de Valdevez apaixona pela sua monumental ponte de cantaria, o centro histórico barroco, o Paço de Giela medieval e a célebre carne Cachena DOP.',
      highlights: [
        'Paço de Giela & Museu Medieval',
        'Rio Vez & Praia Fluvial da Valeta',
        'Carne Cachena DOP na Brasa',
        'Passadiços e Ecovia do Vez'
      ]
    },
    pontedelima: {
      title: 'Ponte de Lima',
      distance: '~14 km • 15 min da Quinta',
      image: 'assets/images/town_aerial_pontedelima.jpg',
      imageAlt: 'Vista aérea panorâmica da ponte medieval e vale de Ponte de Lima',
      desc: 'Considerada a vila mais antiga de Portugal (foral de 1125 por D. Teresa), famosa pela sua ponte romana e gótica sobre o Rio Lima, os solares nobres, a gastronomia de conforto com o Arroz de Sarrabulho e o berço do Vinho Verde Loureiro.',
      highlights: [
        'Ponte Romano-Gótica Secular',
        'Vinho Verde Loureiro & Quintas',
        'Arroz de Sarrabulho & Rojões',
        'Lagoas & Reserva de Bertiandos'
      ]
    },
    pontedabarca: {
      title: 'Ponte da Barca',
      distance: '~11 km • 12 min da Quinta',
      image: 'assets/images/town_aerial_pontedabarca.jpg',
      imageAlt: 'Vista aérea panorâmica da ponte quinhentista e margens de Ponte da Barca',
      desc: 'Nobre vila ribeirinha com a sua elegante ponte quinhentista de dez arcos de cantaria sobre o Rio Lima. Ponto histórico de passagem de barcas e peregrinos a Santiago, alia jardins floridos à beira-rio, praias fluviais e ricas tradições gastronómicas.',
      highlights: [
        'Ponte Quinhentista de Dez Arcos',
        'Pelourinho Manuelino & Jardins',
        'Praia Fluvial da Barca & Caiaques',
        'Posta Barrosã & Vinho Vinhão'
      ]
    },
    'geres-aldeias': {
      title: 'Sistelo & Aldeia do Soajo',
      distance: '~20 a 25 km • 22-28 min da Quinta',
      image: 'assets/images/town_aerial_sistelo_geres.jpg',
      imageAlt: 'Vista aérea dos socalcos verdes do Sistelo e montanhas do Gerês',
      desc: 'No sopé e no coração do Parque Nacional da Peneda-Gerês, descubra dois dos maiores tesouros culturais e naturais do país: os socalcos de Sistelo ("O Tibete Português", Monumento Nacional) e a eira comunitária com 24 espigueiros de granito no Soajo.',
      highlights: [
        'Socalcos de Sistelo ("Tibete Português")',
        'Eira dos 24 Espigueiros no Soajo',
        'Porta do Mezio & Peneda-Gerês',
        'Passadiços do Sistelo & Rio Vez'
      ]
    }
  };

  let currentTown = 'all';
  let currentCategory = 'all';
  let currentPage = 1;

  function updateTownBanner(townKey) {
    if (!townCard) return;
    const data = TOWNS_DATA[townKey];
    if (!data) {
      townCard.style.display = 'none';
      return;
    }

    if (townTitle) townTitle.textContent = data.title;
    if (townDist) {
      townDist.innerHTML = `
        <svg class="icon-svg-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>${data.distance}</span>
      `;
    }
    if (townDesc) townDesc.textContent = data.desc;
    if (townImg) {
      townImg.src = data.image;
      townImg.alt = data.imageAlt;
    }
    if (townHighlights && data.highlights) {
      townHighlights.innerHTML = data.highlights.map(h => `
        <div class="town-highlight-item">
          <span class="highlight-arrow">→</span>
          <span>${h}</span>
        </div>
      `).join('');
    }
  }

  function getFilteredCards() {
    return allCards.filter(card => {
      const cardTown = card.getAttribute('data-town') || '';
      const cardCat = card.getAttribute('data-category') || '';

      const matchTown = (currentTown === 'all' || cardTown === currentTown);
      const matchCat = (currentCategory === 'all' || cardCat.split(' ').includes(currentCategory));

      return matchTown && matchCat;
    });
  }

  function render() {
    const filtered = getFilteredCards();

    // Atualizar badge de contagem
    if (countBadge) {
      const count = filtered.length;
      countBadge.textContent = `${count} ${count === 1 ? 'Experiência Disponível' : 'Experiências Disponíveis'}`;
    }

    const hasTown = (currentTown !== 'all' && TOWNS_DATA[currentTown]);

    // Cálculo do total de páginas:
    // Se há vila selecionada:
    //   Página 1: 1 Town Card (Linha 1, 2 colunas) + 2 atividades (Linha 2).
    //   Página 2+: 4 atividades por página (2 linhas x 2 colunas).
    // Se não há vila selecionada ("all"):
    //   Todas as páginas: até 4 atividades (2 linhas x 2 colunas).
    let totalPages = 1;
    if (hasTown) {
      if (filtered.length <= 2) {
        totalPages = 1;
      } else {
        totalPages = 1 + Math.ceil((filtered.length - 2) / 4);
      }
    } else {
      totalPages = Math.max(1, Math.ceil(filtered.length / 4));
    }

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Ocultar todos os cartões de atividades
    allCards.forEach(card => {
      card.style.display = 'none';
    });

    // Controlar visibilidade do Town Feature Card
    if (hasTown && currentPage === 1) {
      updateTownBanner(currentTown);
      townCard.style.display = 'grid';
      townCard.style.animation = 'none';
      townCard.offsetHeight; // reflow
      townCard.style.animation = 'townCardFade 0.35s ease forwards';
    } else {
      if (townCard) townCard.style.display = 'none';
    }

    const isMobile = window.innerWidth <= 768;

    // Obter cartões da página atual
    let pageCards = [];
    if (isMobile) {
      // No mobile, exibe todas as atividades filtradas em carrossel horizontal de swipe nativo sem botões
      pageCards = filtered;
    } else if (hasTown) {
      if (currentPage === 1) {
        // Linha 2 na primeira página com vila: 2 cartões de atividades
        pageCards = filtered.slice(0, 2);
      } else {
        // Passando de bloco: 2 linhas inteiras com atividades (até 4 cartões)
        const startIndex = 2 + (currentPage - 2) * 4;
        const endIndex = startIndex + 4;
        pageCards = filtered.slice(startIndex, endIndex);
      }
    } else {
      const startIndex = (currentPage - 1) * 4;
      const endIndex = startIndex + 4;
      pageCards = filtered.slice(startIndex, endIndex);
    }

    // Exibir cartões da página (máximo 2 linhas sempre)
    pageCards.forEach(card => {
      card.style.display = 'flex';
      card.style.animation = 'none';
      card.offsetHeight; // reflow
      card.style.animation = 'activityFadeIn 0.32s ease forwards';
    });

    // Estado das Setas
    if (prevBtn) {
      prevBtn.disabled = (currentPage <= 1);
    }
    if (nextBtn) {
      nextBtn.disabled = (currentPage >= totalPages);
    }

    // Indicadores de Bolinhas no Meio (UX/UI Reforçado sem Texto)
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      if (totalPages > 1 && !isMobile) {
        for (let i = 1; i <= totalPages; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `activities-dot ${i === currentPage ? 'active' : ''}`;
          dot.setAttribute('aria-label', `Página ${i} de ${totalPages}`);
          dot.addEventListener('click', () => {
            currentPage = i;
            render();
          });
          dotsContainer.appendChild(dot);
        }
      }
    }

    // Ocultar barra se só houver 1 página ou se for ecrã móvel (onde se usa swipe lateral)
    if (controls) {
      controls.style.display = (isMobile || totalPages <= 1) ? 'none' : 'flex';
    }
  }

  // Event Listeners: Seletores Lado a Lado
  if (townSelect) {
    townSelect.addEventListener('change', (e) => {
      currentTown = e.target.value;
      currentPage = 1;
      render();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      currentPage = 1;
      render();
    });
  }

  // Event Listeners: Setas Anterior e Seguinte
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const filtered = getFilteredCards();
      const hasTown = (currentTown !== 'all' && TOWNS_DATA[currentTown]);
      let totalPages = 1;
      if (hasTown) {
        totalPages = filtered.length <= 2 ? 1 : 1 + Math.ceil((filtered.length - 2) / 4);
      } else {
        totalPages = Math.max(1, Math.ceil(filtered.length / 4));
      }
      if (currentPage < totalPages) {
        currentPage++;
        render();
      }
    });
  }

  // Render inicial
  render();
}

/**
 * 7. Ticker Interativo de Opiniões dos Hóspedes
 */
function initReviewsInteractiveScroll() {
  const wrapper = document.querySelector('.reviews-ticker-wrapper');
  const track = document.querySelector('.reviews-ticker-track');
  if (!wrapper || !track) return;

  let offset = 0;
  const speed = 0.5;
  let isHovered = false;
  let isDragging = false;
  let isAnimatingStep = false;
  let startX = 0;
  let dragStartOffset = 0;
  let resumeTimeout = null;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getHalfWidth() {
    return track.scrollWidth / 2;
  }

  function getCardStep() {
    return 420;
  }

  function updateTransform() {
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  function tick() {
    if (!isDragging && !isHovered && !isAnimatingStep && !prefersReducedMotion) {
      offset += speed;
      const half = getHalfWidth();
      if (half > 0 && offset >= half) {
        offset %= half;
      }
      updateTransform();
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  wrapper.addEventListener('mouseenter', () => {
    isHovered = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);
  });

  wrapper.addEventListener('mouseleave', () => {
    if (!isDragging && !isAnimatingStep) {
      isHovered = false;
    }
  });

  wrapper.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    isDragging = true;
    startX = e.clientX;
    dragStartOffset = offset;
    wrapper.classList.add('is-dragging');
    try { wrapper.setPointerCapture(e.pointerId); } catch (_) {}
    if (resumeTimeout) clearTimeout(resumeTimeout);
  });

  wrapper.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    offset = dragStartOffset - diff;
    const half = getHalfWidth();
    if (half > 0) {
      if (offset < 0) offset += half;
      if (offset >= half) offset %= half;
    }
    updateTransform();
  });

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.classList.remove('is-dragging');
    resumeTimeout = setTimeout(() => {
      isHovered = false;
    }, 1200);
  };

  wrapper.addEventListener('pointerup', endDrag);
  wrapper.addEventListener('pointercancel', endDrag);

  function animateStep(delta) {
    if (isAnimatingStep) return;
    isAnimatingStep = true;
    if (resumeTimeout) clearTimeout(resumeTimeout);

    const half = getHalfWidth();
    const targetOffset = offset + delta;
    const startVal = offset;
    const change = targetOffset - startVal;
    const startTime = performance.now();
    const duration = 380;

    function stepAnim(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      offset = startVal + change * ease;
      if (half > 0) {
        if (offset < 0) offset += half;
        if (offset >= half) offset %= half;
      }
      updateTransform();

      if (progress < 1) {
        requestAnimationFrame(stepAnim);
      } else {
        isAnimatingStep = false;
        resumeTimeout = setTimeout(() => {
          isHovered = false;
        }, 1500);
      }
    }

    requestAnimationFrame(stepAnim);
  }
}

/**
 * 8. Acordeão de FAQs
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (isExpanded) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 9. Formulário de Dúvidas Diretas à Anfitriã (Sticky Card)
 */
function initDuvidasForm() {
  const form = document.getElementById('duvidasForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('duvidaNome')?.value || '';
    const contact = document.getElementById('duvidaContacto')?.value || '';
    const message = document.getElementById('duvidaMensagem')?.value || '';
    const resultBox = document.getElementById('duvidasResultBox');

    const waText = encodeURIComponent(
      `Dúvida sobre estadia — Quinta do Olival\n` +
      `Nome: ${name}\n` +
      `Contacto: ${contact}\n` +
      `Mensagem: ${message}`
    );
    const waUrl = `https://wa.me/351925121364?text=${waText}`;

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.style.backgroundColor = '#f0fdf4';
      resultBox.style.border = '1px solid #bbf7d0';
      resultBox.style.color = '#166534';
      resultBox.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 0.35rem;">Mensagem Pronta para Envio</div>
        <p style="font-size: 0.82rem; margin: 0 0 0.65rem 0; color: #14532d;">
          Obrigado, ${name}! Para resposta imediata da anfitriã D. Olga:
        </p>
        <a href="${waUrl}" target="_blank" class="btn btn-whatsapp" style="display: inline-block; padding: 0.45rem 0.85rem; font-size: 0.82rem;">
          Conversar no WhatsApp Oficial
        </a>
      `;
      form.reset();
    }
  });
}

/**
 * 10. Calendário Personalizado de Seleção de Intervalo (Bruto Range Datepicker)
 */
function initBrutoCustomDatePicker() {
  let popover = document.getElementById('brutoDatePickerPopover');
  if (!popover) {
    popover = document.createElement('div');
    popover.id = 'brutoDatePickerPopover';
    popover.className = 'bruto-datepicker-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Calendário de Seleção de Estadia');
    popover.innerHTML = `
      <div class="datepicker-header">
        <button type="button" class="datepicker-nav-btn" id="dpPrevBtn" aria-label="Mês Anterior">
          <svg class="icon-svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <span class="datepicker-month-title" id="dpMonthTitle"></span>
        <button type="button" class="datepicker-nav-btn" id="dpNextBtn" aria-label="Mês Seguinte">
          <svg class="icon-svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <div class="datepicker-weekdays">
        <span class="datepicker-weekday">Seg</span>
        <span class="datepicker-weekday">Ter</span>
        <span class="datepicker-weekday">Qua</span>
        <span class="datepicker-weekday">Qui</span>
        <span class="datepicker-weekday">Sex</span>
        <span class="datepicker-weekday">Sáb</span>
        <span class="datepicker-weekday">Dom</span>
      </div>
      <div class="datepicker-days" id="dpDaysGrid"></div>
    `;
    document.body.appendChild(popover);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  let activeCheckinInput = null;
  let activeCheckoutInput = null;
  let currentMonth = new Date();
  currentMonth.setDate(1);

  let selectedCheckin = null;
  let selectedCheckout = null;
  let hoverDate = null;
  let step = 'checkin';

  const monthTitle = document.getElementById('dpMonthTitle');
  const daysGrid = document.getElementById('dpDaysGrid');
  const prevBtn = document.getElementById('dpPrevBtn');
  const nextBtn = document.getElementById('dpNextBtn');

  function formatDateEuro(d) {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  }

  function formatDateISO(d) {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function isBeforeDay(d1, d2) {
    if (!d1 || !d2) return false;
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return t1 < t2;
  }

  function isAfterDay(d1, d2) {
    if (!d1 || !d2) return false;
    const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return t1 > t2;
  }

  function updateDayHighlights() {
    const cells = daysGrid.querySelectorAll('.datepicker-day-cell');
    cells.forEach(cell => {
      const btn = cell.querySelector('.datepicker-day-btn');
      if (!btn || !btn.getAttribute('data-date')) return;
      const cellDate = parseDateFlexible(btn.getAttribute('data-date'));
      if (!cellDate) return;

      cell.classList.remove('is-start', 'is-end', 'is-in-range', 'is-hover-range');

      const isStart = selectedCheckin && isSameDay(cellDate, selectedCheckin);
      const isEnd = selectedCheckout && isSameDay(cellDate, selectedCheckout);

      if (isStart) cell.classList.add('is-start');
      if (isEnd) cell.classList.add('is-end');

      if (selectedCheckin && selectedCheckout) {
        if (isAfterDay(cellDate, selectedCheckin) && isBeforeDay(cellDate, selectedCheckout)) {
          cell.classList.add('is-in-range');
        }
      } else if (selectedCheckin && step === 'checkout' && hoverDate) {
        if (isAfterDay(cellDate, selectedCheckin) && (isBeforeDay(cellDate, hoverDate) || isSameDay(cellDate, hoverDate))) {
          cell.classList.add('is-hover-range');
        }
      }
    });
  }

  function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    monthTitle.textContent = `${monthNames[month]} ${year}`;

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    prevBtn.disabled = currentMonth <= startOfCurrentMonth;
    prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    daysGrid.innerHTML = '';

    for (let i = 0; i < startOffset; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'datepicker-day-cell';
      daysGrid.appendChild(emptyCell);
    }

    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const isPast = cellDate < todayDate;

      const cell = document.createElement('div');
      cell.className = 'datepicker-day-cell';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'datepicker-day-btn';
      btn.textContent = dayNum;
      btn.setAttribute('data-date', formatDateISO(cellDate));

      if (isPast) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          onDateClick(cellDate);
        });

        btn.addEventListener('mouseenter', () => {
          if (step === 'checkout' && selectedCheckin) {
            hoverDate = cellDate;
            updateDayHighlights();
          }
        });
      }

      cell.appendChild(btn);
      daysGrid.appendChild(cell);
    }

    updateDayHighlights();
  }

  function onDateClick(clickedDate) {
    if (step === 'checkin') {
      selectedCheckin = clickedDate;
      selectedCheckout = null;
      hoverDate = null;
      step = 'checkout';

      if (activeCheckinInput) {
        activeCheckinInput.value = formatDateEuro(selectedCheckin);
        activeCheckinInput.dispatchEvent(new Event('input', { bubbles: true }));
        activeCheckinInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      updateDayHighlights();
    } else if (step === 'checkout') {
      if (isBeforeDay(clickedDate, selectedCheckin) || isSameDay(clickedDate, selectedCheckin)) {
        selectedCheckin = clickedDate;
        selectedCheckout = null;
        hoverDate = null;
        step = 'checkout';

        if (activeCheckinInput) {
          activeCheckinInput.value = formatDateEuro(selectedCheckin);
          activeCheckinInput.dispatchEvent(new Event('input', { bubbles: true }));
          activeCheckinInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        updateDayHighlights();
      } else {
        selectedCheckout = clickedDate;
        step = 'checkin';
        applySelectionToInputs();
        updateDayHighlights();

        setTimeout(() => {
          closePopover();
        }, 180);
      }
    }
  }

  function applySelectionToInputs() {
    if (!selectedCheckin || !selectedCheckout) return;
    if (activeCheckinInput) {
      activeCheckinInput.value = formatDateEuro(selectedCheckin);
      activeCheckinInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeCheckinInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (activeCheckoutInput) {
      activeCheckoutInput.value = formatDateEuro(selectedCheckout);
      activeCheckoutInput.dispatchEvent(new Event('input', { bubbles: true }));
      activeCheckoutInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  let currentTriggerEl = null;

  function openPicker(checkinInput, checkoutInput, triggerElement) {
    activeCheckinInput = checkinInput;
    activeCheckoutInput = checkoutInput;
    currentTriggerEl = triggerElement || checkinInput;

    const valIn = parseDateFlexible(checkinInput.value);
    const valOut = parseDateFlexible(checkoutInput.value);

    selectedCheckin = valIn || null;
    selectedCheckout = valOut || null;
    step = 'checkin';

    if (selectedCheckin) {
      currentMonth = new Date(selectedCheckin.getFullYear(), selectedCheckin.getMonth(), 1);
    } else {
      currentMonth = new Date();
      currentMonth.setDate(1);
    }

    renderCalendar();
    popover.classList.add('active');
    positionPopover(currentTriggerEl);
  }

  function positionPopover(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth || 340;
    const popoverHeight = popover.offsetHeight || 360;

    let top = rect.bottom + 8;
    if (top + popoverHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - popoverHeight - 8);
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16);
    }

    popover.style.top = `${Math.round(top)}px`;
    popover.style.left = `${Math.round(left)}px`;
  }

  function closePopover() {
    popover.classList.remove('active');
    hoverDate = null;
    currentTriggerEl = null;
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
  });

  document.addEventListener('click', (e) => {
    if (!popover.classList.contains('active')) return;
    if (popover.contains(e.target)) return;
    if (activeCheckinInput && (activeCheckinInput.contains(e.target) || activeCheckinInput === e.target)) return;
    if (activeCheckoutInput && (activeCheckoutInput.contains(e.target) || activeCheckoutInput === e.target)) return;
    if (e.target.closest('.date-calendar-btn')) return;
    closePopover();
  });

  function attachPair(checkinId, checkoutId) {
    const inEl = document.getElementById(checkinId);
    const outEl = document.getElementById(checkoutId);
    if (!inEl || !outEl) return;

    const triggerIn = inEl.closest('.date-input-container') || inEl;
    const triggerOut = outEl.closest('.date-input-container') || outEl;

    const inBtn = inEl.parentElement?.querySelector('.date-calendar-btn');
    const outBtn = outEl.parentElement?.querySelector('.date-calendar-btn');

    const handleOpenIn = (e) => {
      e.preventDefault();
      openPicker(inEl, outEl, triggerIn);
    };

    const handleOpenOut = (e) => {
      e.preventDefault();
      openPicker(inEl, outEl, triggerOut);
    };

    inEl.addEventListener('click', handleOpenIn);
    if (inBtn) inBtn.addEventListener('click', handleOpenIn);
    outEl.addEventListener('click', handleOpenOut);
    if (outBtn) outBtn.addEventListener('click', handleOpenOut);
  }

  attachPair('checkin', 'checkout');
  attachPair('bookCheckin', 'bookCheckout');
}

/**
 * 11. Experiência de Reservas Sequenciais Passo a Passo (reservas.html)
 */
function initDedicatedBookingPage() {
  const form = document.getElementById('dedicatedBookingForm');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const paramUnit = urlParams.get('unit') || 'lagar';
  const paramCheckin = urlParams.get('checkin');
  const paramCheckout = urlParams.get('checkout');
  const paramGuests = urlParams.get('guests');

  // Elementos do Formulário
  const checkinInput = document.getElementById('bookCheckin');
  const checkoutInput = document.getElementById('bookCheckout');
  const guestsSelect = document.getElementById('bookGuests');
  const nameInput = document.getElementById('bookName');
  const emailInput = document.getElementById('bookEmail');
  const phoneInput = document.getElementById('bookPhone');

  // Elementos do Quadro de Resumo
  const summaryUnitName = document.getElementById('summaryUnitName');
  const summaryUnitThumb = document.getElementById('summaryUnitThumb');
  const summaryCheckin = document.getElementById('summaryCheckin');
  const summaryCheckout = document.getElementById('summaryCheckout');
  const summaryNights = document.getElementById('summaryNights');
  const summaryGuests = document.getElementById('summaryGuests');
  const summaryBreakfast = document.getElementById('summaryBreakfast');
  const summaryTotalPrice = document.getElementById('summaryTotalPrice');

  // Blocos de Passos Sequenciais
  const stepBlock1 = document.getElementById('stepBlock1');
  const stepBlock2 = document.getElementById('stepBlock2');
  const stepBlock3 = document.getElementById('stepBlock3');
  const stepBlock4 = document.getElementById('stepBlock4');

  // Botões de Avanço
  const btnNextToStep2 = document.getElementById('btnNextToStep2');
  const btnNextToStep3 = document.getElementById('btnNextToStep3');
  const btnNextToStep4 = document.getElementById('btnNextToStep4');

  // Links de Edição / Recuo
  const btnEditStep1 = document.getElementById('btnEditStep1');
  const btnEditStep2 = document.getElementById('btnEditStep2');
  const btnEditStep3 = document.getElementById('btnEditStep3');

  // Informação das Casas
  const HOUSES = {
    lagar: {
      name: 'Casa do Lagar (T2)',
      thumb: 'assets/images/casa_lagar_main.jpg',
      maxGuests: 4
    },
    avos: {
      name: 'Casa dos Avós (T3)',
      thumb: 'assets/images/casa_avos_main.jpg',
      maxGuests: 6
    },
    adega: {
      name: 'Adega do Buraco (T1)',
      thumb: 'assets/images/adega_buraco_main.jpg',
      maxGuests: 2
    },
    lavoeira1: {
      name: 'Lavoeira I • Sauna (T1)',
      thumb: 'assets/images/lavoeira_sauna.jpg',
      maxGuests: 2
    },
    lavoeira2: {
      name: 'Lavoeira II • Hidromassagem (T1)',
      thumb: 'assets/images/lavoeira_hidro.jpg',
      maxGuests: 2
    }
  };

  let currentUnitKey = paramUnit && HOUSES[paramUnit] ? paramUnit : 'lagar';

  // Pré-selecionar casa
  const unitCards = document.querySelectorAll('.booking-unit-option');
  unitCards.forEach(card => {
    const key = card.getAttribute('data-unit');
    const radio = card.querySelector('input[type="radio"]');
    if (key === currentUnitKey) {
      card.classList.add('selected');
      card.style.borderColor = 'var(--primary-accent)';
      card.style.borderWidth = '2px';
      if (radio) radio.checked = true;
    } else {
      card.classList.remove('selected');
      card.style.borderColor = 'var(--border-color)';
      card.style.borderWidth = '1px';
      if (radio) radio.checked = false;
    }

    card.addEventListener('click', () => {
      unitCards.forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = 'var(--border-color)';
        c.style.borderWidth = '1px';
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      card.classList.add('selected');
      card.style.borderColor = 'var(--primary-accent)';
      card.style.borderWidth = '2px';
      if (radio) radio.checked = true;
      currentUnitKey = key;
      updateCalculation();
    });
  });

  if (paramCheckin && checkinInput) checkinInput.value = paramCheckin;
  if (paramCheckout && checkoutInput) checkoutInput.value = paramCheckout;
  if (paramGuests && guestsSelect) {
    for (let opt of guestsSelect.options) {
      if (opt.value.includes(paramGuests) || paramGuests.includes(opt.value)) {
        opt.selected = true;
        break;
      }
    }
  }

  function updateCalculation() {
    const house = HOUSES[currentUnitKey] || HOUSES['lagar'];
    if (summaryUnitName) summaryUnitName.textContent = house.name;
    if (summaryUnitThumb) summaryUnitThumb.src = house.thumb;

    const cin = checkinInput?.value || '';
    const cout = checkoutInput?.value || '';
    if (summaryCheckin) summaryCheckin.textContent = cin || 'A definir';
    if (summaryCheckout) summaryCheckout.textContent = cout || 'A definir';

    let nights = 1;
    let hasDates = false;
    if (cin && cout) {
      const d1 = parseDateFlexible(cin);
      const d2 = parseDateFlexible(cout);
      if (d1 && d2 && d2 > d1) {
        nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        hasDates = true;
      }
    }

    if (summaryNights) {
      summaryNights.textContent = hasDates ? (nights === 1 ? '1 noite' : `${nights} noites`) : '— noites';
    }

    const guestsVal = guestsSelect ? guestsSelect.value : '2 Hóspedes';
    if (summaryGuests) summaryGuests.textContent = guestsVal;

    // Pequeno-almoço / Cesta
    const bkRadio = document.querySelector('input[name="breakfastOption"]:checked');
    const hasBreakfast = bkRadio ? bkRadio.value === 'extra' : false;
    if (summaryBreakfast) {
      summaryBreakfast.textContent = hasBreakfast ? 'Cesta Matinal Regional' : 'Apenas Alojamento';
    }

    if (summaryTotalPrice) {
      summaryTotalPrice.textContent = 'Sob Consulta';
    }

    // Atualização do Resumo Móvel Superior
    if (mobileSummaryUnit) mobileSummaryUnit.textContent = house.name;
    if (mobileSummaryDates) mobileSummaryDates.textContent = cin && cout ? `• ${cin} a ${cout}` : '• Datas a definir';
    if (mobileSummaryNights) mobileSummaryNights.textContent = summaryNights ? summaryNights.textContent : '— noites';
    if (mobileSummaryGuests) mobileSummaryGuests.textContent = guestsVal;
    if (mobileSummaryBreakfast) mobileSummaryBreakfast.textContent = hasBreakfast ? 'Cesta Matinal Regional' : 'Apenas Alojamento';
    if (mobileSummaryPrice) mobileSummaryPrice.textContent = 'Sob Consulta';
  }

  // Toggle do Resumo Móvel Superior
  const mobileSummaryPill = document.getElementById('mobileSummaryPill');
  const mobileSummaryUnit = document.getElementById('mobileSummaryUnit');
  const mobileSummaryDates = document.getElementById('mobileSummaryDates');
  const mobileSummaryNights = document.getElementById('mobileSummaryNights');
  const mobileSummaryGuests = document.getElementById('mobileSummaryGuests');
  const mobileSummaryBreakfast = document.getElementById('mobileSummaryBreakfast');
  const mobileSummaryPrice = document.getElementById('mobileSummaryPrice');

  if (mobileSummaryPill) {
    mobileSummaryPill.addEventListener('click', () => {
      mobileSummaryPill.classList.toggle('open');
      const isOpen = mobileSummaryPill.classList.contains('open');
      mobileSummaryPill.setAttribute('aria-expanded', isOpen);
    });
  }

  // Breakfast card switcher
  const bkCards = document.querySelectorAll('.breakfast-card');
  bkCards.forEach(card => {
    card.addEventListener('click', () => {
      bkCards.forEach(c => {
        c.classList.remove('selected');
        c.style.borderColor = 'var(--border-color)';
        c.style.borderWidth = '1px';
        const r = c.querySelector('input[type="radio"]');
        if (r) r.checked = false;
      });
      card.classList.add('selected');
      card.style.borderColor = 'var(--primary-accent)';
      card.style.borderWidth = '2px';
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateCalculation();
    });
  });

  if (checkinInput) {
    checkinInput.addEventListener('input', updateCalculation);
    checkinInput.addEventListener('change', updateCalculation);
  }
  if (checkoutInput) {
    checkoutInput.addEventListener('input', updateCalculation);
    checkoutInput.addEventListener('change', updateCalculation);
  }
  if (guestsSelect) {
    guestsSelect.addEventListener('change', updateCalculation);
  }

  // ==============================================================
  // FLUXO SEQUENCIAL DE PASSOS (WIZARD)
  // Cada passo só surge quando o anterior for preenchido/validado
  // ==============================================================

  // Passo 1 -> Passo 2
  if (btnNextToStep2 && stepBlock2) {
    btnNextToStep2.addEventListener('click', () => {
      const cin = checkinInput?.value?.trim();
      const cout = checkoutInput?.value?.trim();

      if (!cin || !cout) {
        if (!cin && checkinInput) {
          checkinInput.focus();
          checkinInput.style.borderColor = 'var(--primary-accent)';
        } else if (!cout && checkoutInput) {
          checkoutInput.focus();
          checkoutInput.style.borderColor = 'var(--primary-accent)';
        }
        alert('Por favor, selecione as datas de Check-in e Check-out para continuar.');
        return;
      }

      if (checkinInput) checkinInput.style.borderColor = '';
      if (checkoutInput) checkoutInput.style.borderColor = '';

      // Desbloquear e apresentar Passo 2
      stepBlock2.classList.remove('step-locked');
      stepBlock2.classList.add('active');
      stepBlock2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Recuar / Editar Passo 1
  if (btnEditStep1 && stepBlock1) {
    btnEditStep1.addEventListener('click', () => {
      stepBlock1.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (checkinInput) checkinInput.focus();
    });
  }

  // Passo 2 -> Passo 3
  if (btnNextToStep3 && stepBlock3) {
    btnNextToStep3.addEventListener('click', () => {
      // Desbloquear e apresentar Passo 3
      stepBlock3.classList.remove('step-locked');
      stepBlock3.classList.add('active');
      stepBlock3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Recuar / Editar Passo 2
  if (btnEditStep2 && stepBlock2) {
    btnEditStep2.addEventListener('click', () => {
      stepBlock2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Bloco de Faturação com NIF Opcional
  const invoiceToggle = document.getElementById('invoiceToggle');
  const invoiceFieldsGroup = document.getElementById('invoiceFieldsGroup');
  const invoiceName = document.getElementById('invoiceName');

  if (invoiceToggle && invoiceFieldsGroup) {
    invoiceToggle.addEventListener('change', () => {
      const isChecked = invoiceToggle.checked;
      invoiceFieldsGroup.style.display = isChecked ? 'block' : 'none';
      if (isChecked && invoiceName && !invoiceName.value && nameInput && nameInput.value) {
        invoiceName.value = nameInput.value;
      }
    });
  }

  // Passo 3 -> Passo 4
  if (btnNextToStep4 && stepBlock4) {
    btnNextToStep4.addEventListener('click', () => {
      const name = nameInput?.value?.trim();
      const email = emailInput?.value?.trim();
      const phone = phoneInput?.value?.trim();

      if (!name) {
        if (nameInput) {
          nameInput.focus();
          nameInput.style.borderColor = 'var(--primary-accent)';
        }
        alert('Por favor, indique o nome completo do titular da reserva.');
        return;
      }

      if (!email || !email.includes('@') || !email.includes('.')) {
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderColor = 'var(--primary-accent)';
        }
        alert('Por favor, indique um endereço de email válido para confirmação.');
        return;
      }

      if (!phone) {
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.style.borderColor = 'var(--primary-accent)';
        }
        alert('Por favor, indique um número de telemóvel para contacto.');
        return;
      }

      // Validar NIF se faturação ativada
      if (invoiceToggle && invoiceToggle.checked) {
        const nif = document.getElementById('invoiceNif')?.value?.trim();
        if (!nif) {
          const nifInput = document.getElementById('invoiceNif');
          if (nifInput) {
            nifInput.focus();
            nifInput.style.borderColor = 'var(--primary-accent)';
          }
          alert('Por favor, preencha o número de NIF/NIPC para a emissão da fatura.');
          return;
        }
      }

      if (nameInput) nameInput.style.borderColor = '';
      if (emailInput) emailInput.style.borderColor = '';
      if (phoneInput) phoneInput.style.borderColor = '';

      // Desbloquear e apresentar Passo 4
      stepBlock4.classList.remove('step-locked');
      stepBlock4.classList.add('active');
      stepBlock4.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Recuar / Editar Passo 3
  if (btnEditStep3 && stepBlock3) {
    btnEditStep3.addEventListener('click', () => {
      stepBlock3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Métodos de Pagamento Interativos (Tabs)
  const paymentTabs = document.querySelectorAll('.payment-tab-btn');
  const fieldCard = document.getElementById('paymentFieldsCard');
  const fieldMbway = document.getElementById('paymentFieldsMbway');
  const fieldMultibanco = document.getElementById('paymentFieldsMultibanco');
  let currentPaymentMethod = 'card';

  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      paymentTabs.forEach(t => {
        t.classList.remove('active');
        t.style.borderWidth = '1px';
        t.style.borderColor = 'var(--border-color)';
      });
      tab.classList.add('active');
      tab.style.borderWidth = '2px';
      tab.style.borderColor = 'var(--primary-accent)';

      const method = tab.getAttribute('data-method');
      currentPaymentMethod = method;

      if (fieldCard) fieldCard.style.display = method === 'card' ? 'block' : 'none';
      if (fieldMbway) fieldMbway.style.display = method === 'mbway' ? 'block' : 'none';
      if (fieldMultibanco) fieldMultibanco.style.display = method === 'multibanco' ? 'block' : 'none';
    });
  });

  updateCalculation();

  // Submissão Final do Formulário & Modal de Confirmação
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const house = HOUSES[currentUnitKey] || HOUSES['lagar'];
    const cin = checkinInput?.value || 'A definir';
    const cout = checkoutInput?.value || 'A definir';
    const guests = guestsSelect?.value || '2 Hóspedes';
    const name = nameInput?.value || 'Hóspede';
    const email = emailInput?.value || '';
    const phone = phoneInput?.value || '';

    const modal = document.getElementById('bookingConfirmModal');
    if (!modal) return;

    const modalHouseName = document.getElementById('modalHouseName');
    const modalGuestName = document.getElementById('modalGuestName');
    const modalDates = document.getElementById('modalDates');
    const modalTotalPaid = document.getElementById('modalTotalPaid');
    const modalInvoiceRow = document.getElementById('modalInvoiceRow');
    const modalInvoiceNif = document.getElementById('modalInvoiceNif');
    const modalPaymentMethod = document.getElementById('modalPaymentMethod');
    const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');

    if (modalHouseName) modalHouseName.textContent = house.name;
    if (modalGuestName) modalGuestName.textContent = name;
    if (modalDates) modalDates.textContent = `${cin} a ${cout} (${guests})`;
    if (modalTotalPaid) modalTotalPaid.textContent = 'Sob Consulta (Confirmado e Aprovado)';

    const methodNames = {
      card: 'Cartão Bancário (Visa / Mastercard)',
      mbway: 'MB WAY',
      multibanco: 'Referência Multibanco'
    };
    if (modalPaymentMethod) modalPaymentMethod.textContent = methodNames[currentPaymentMethod] || 'Cartão Bancário';

    const wantInvoice = invoiceToggle && invoiceToggle.checked;
    const nifVal = document.getElementById('invoiceNif')?.value || '';
    if (modalInvoiceRow && modalInvoiceNif) {
      if (wantInvoice && nifVal) {
        modalInvoiceRow.style.display = 'block';
        modalInvoiceNif.textContent = nifVal;
      } else {
        modalInvoiceRow.style.display = 'none';
      }
    }

    if (modalWhatsappBtn) {
      const waMsg = encodeURIComponent(
        `Olá D. Olga! Concluí a confirmação de reserva para a Quinta do Olival:\n` +
        `• Habitação: ${house.name}\n` +
        `• Estadia: ${cin} a ${cout} (${guests})\n` +
        `• Titular: ${name}\n` +
        `• Contacto: ${phone}\n` +
        `• Método: ${methodNames[currentPaymentMethod] || 'Cartão'}`
      );
      modalWhatsappBtn.href = `https://wa.me/351925121364?text=${waMsg}`;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  const closeModalBtn = document.getElementById('modalCloseBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      const modal = document.getElementById('bookingConfirmModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
}

/**
 * 12. Modais Informativos Legais
 */
function initLegalModal() {
  document.querySelectorAll('.legal-modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Quinta do Olival — Registo Nacional de Turismo RNT: 3780/AL.\nEmpreendimento de turismo rural em Távora, Arcos de Valdevez.\nPara esclarecimentos: geral@quintadoolival.pt ou +351 925 121 364.');
    });
  });
}
