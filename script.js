/* =========================================
   1. INITIALIZE REVEAL.JS
   ========================================= */
Reveal.initialize({
  width: 540,
  height: 960,
  margin: 0.07,
  minScale: 0.2,
  maxScale: 2.0,
  hash: true,
  transition: 'slide',
  controls: true,
  controlsLayout: 'bottom-right',
  progress: true,
  center: true,
  touch: true,
  mouseWheel: true,
  viewDistance: 10
});

/* =========================================
   2. HORIZONTAL CAROUSEL (TOUCH, MOUSE & TRACKPAD)
   ========================================= */
document.querySelectorAll('.card-carousel').forEach(carousel => {
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  // Touch Events (Mobile)
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.stopImmediatePropagation();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    const diffX = Math.abs(e.touches[0].clientX - touchStartX);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY);
    if (diffX > diffY) {
      e.stopImmediatePropagation();
    }
  }, { passive: true });

  // Mouse Drag Events (Desktop)
  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.style.cursor = 'grabbing';
    carousel.style.scrollSnapType = 'none';
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    e.stopImmediatePropagation();
  });

  const resetDrag = () => {
    if (!isDown) return;
    isDown = false;
    carousel.style.cursor = 'grab';
    carousel.style.scrollSnapType = 'x mandatory';
  };

  carousel.addEventListener('mouseleave', resetDrag);
  carousel.addEventListener('mouseup', resetDrag);

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const x = e.pageX - carousel.offsetLeft;
    carousel.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  // Wheel & Mac Touchpad Events
  carousel.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopImmediatePropagation();
      return;
    }

    const atLeftEdge = carousel.scrollLeft <= 0 && e.deltaY < 0;
    const atRightEdge = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2 && e.deltaY > 0;

    if (!atLeftEdge && !atRightEdge) {
      e.preventDefault();
      e.stopImmediatePropagation();
      carousel.scrollLeft += e.deltaY;
    }
  }, { passive: false });
});

/* =========================================
   3. AUTO CROSSFADE SLIDESHOW
   ========================================= */
document.querySelectorAll('.slideshow-wrapper').forEach(wrapper => {
  const images = wrapper.querySelectorAll('img');
  if (images.length <= 1) return;

  let currentIndex = 0;
  setInterval(() => {
    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add('active');
  }, 3000);
});

/* =========================================
   4. AUTO-PLAY FRAGMENTS PER SLIDE
   ========================================= */
let fragmentTimers = [];

function autoPlayFragments(slide) {
  fragmentTimers.forEach(clearTimeout);
  fragmentTimers = [];

  slide.querySelectorAll('.fragment').forEach(el => {
    el.classList.remove('visible', 'current-fragment');
  });

  const fragments = slide.querySelectorAll('.fragment');
  fragments.forEach((_, index) => {
    const timer = setTimeout(() => {
      Reveal.nextFragment();
    }, 600 + (index * 500));
    fragmentTimers.push(timer);
  });
}

Reveal.on('ready', event => autoPlayFragments(event.currentSlide));
Reveal.on('slidechanged', event => autoPlayFragments(event.currentSlide));

/* =========================================
   5. DIRECT PREVIOUS SLIDE NAVIGATION GUARD
   ========================================= */
function goPrevSlideImmediately() {
  const current = Reveal.getIndices();
  if (current.v > 0) {
    Reveal.slide(current.h, current.v - 1);
  }
}

// Keyboard Up
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    e.preventDefault();
    e.stopImmediatePropagation();
    goPrevSlideImmediately();
  }
}, true);

// Mobile Swipe Down
let navTouchStartY = 0;
document.addEventListener('touchstart', (e) => {
  navTouchStartY = e.touches[0].clientY;
}, { capture: true, passive: true });

document.addEventListener('touchend', (e) => {
  if (e.changedTouches[0].clientY - navTouchStartY > 50) {
    e.stopImmediatePropagation();
    goPrevSlideImmediately();
  }
}, { capture: true });

// Mouse Wheel / Mac Trackpad Inertial Scroll Guard
let isWheelLocked = false;
let wheelTimeout;

document.addEventListener('wheel', (e) => {
  if (e.deltaY < -10) {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (!isWheelLocked) {
      isWheelLocked = true;
      goPrevSlideImmediately();
    }

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      isWheelLocked = false;
    }, 180);
  }
}, { capture: true, passive: false });