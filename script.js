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
  touch: false, // ปิดระบบปัด 4 ทิศทางของ Reveal.js เพื่อกันปัดซ้าย-ขวาเปลี่ยนหน้า
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

  // Mac Trackpad & Mouse Wheel Events
  carousel.addEventListener('wheel', (e) => {
    // 1. กรณีใช้ Mac Trackpad ปัด 2 นิ้ว ซ้าย-ขวา -> ปล่อยให้เบราว์เซอร์เลื่อนเองตามธรรมชาติ (ลื่นสุด) แค่กันไม่ให้ Reveal.js เปลี่ยนหน้า
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopImmediatePropagation();
      return;
    }

    // 2. กรณีใช้ลูกกลิ้งเมาส์ธรรมดาหมุนขึ้น-ลง -> แปลงเป็นเลื่อนซ้าย-ขวา
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
   4. CUSTOM AUTO-REVEAL PER SLIDE
   ========================================= */
let revealTimers = [];

function runAutoReveal(slide) {
  revealTimers.forEach(clearTimeout);
  revealTimers = [];

  const items = slide.querySelectorAll('.auto-reveal');
  items.forEach(el => el.classList.remove('is-shown'));

  items.forEach((el, index) => {
    const timer = setTimeout(() => {
      el.classList.add('is-shown');
    }, 450 + (index * 400));
    revealTimers.push(timer);
  });
}

/* =========================================
   5. VERTICAL-ONLY TOUCH SWIPE (ปัดได้เฉพาะขึ้น-ลง)
   ========================================= */
let vTouchStartX = 0;
let vTouchStartY = 0;

document.addEventListener('touchstart', (e) => {
  vTouchStartX = e.touches[0].clientX;
  vTouchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const diffX = e.changedTouches[0].clientX - vTouchStartX;
  const diffY = e.changedTouches[0].clientY - vTouchStartY;

  // เช็คว่าปัดแนวตั้ง (ขึ้น-ลง) มากกว่าแนวนอน (ซ้าย-ขวา) และระยะปัดเกิน 45px
  if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 45) {
    if (diffY < 0) {
      Reveal.down(); // ปัดนิ้วขึ้น -> ไปสไลด์ถัดไป
    } else {
      Reveal.up();   // ปัดนิ้วลง -> กลับสไลด์ก่อนหน้า
    }
  }
}, { passive: true });

Reveal.on('ready', event => runAutoReveal(event.currentSlide));
Reveal.on('slidechanged', event => runAutoReveal(event.currentSlide));