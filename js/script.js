const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu');
const navigation = document.querySelector('.nav');
const earthMedia = document.querySelector('.earth-media');

function closeMenu() {
  navigation?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 20);

  if (earthMedia && window.innerWidth > 900) {
    const scrollOffset = Math.min(window.scrollY * 0.055, 28);
    earthMedia.style.setProperty('--earth-y', `${scrollOffset}px`);
  }
});

menuButton?.addEventListener('click', () => {
  const isOpen = navigation?.classList.toggle('open') ?? false;
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMenu();
});

if (earthMedia && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;

    earthMedia.style.setProperty('--earth-x', `${normalizedX * 18}px`);
    earthMedia.style.setProperty('--earth-y', `${normalizedY * 12}px`);
  });

  document.documentElement.addEventListener('mouseleave', () => {
    earthMedia.style.setProperty('--earth-x', '0px');
    earthMedia.style.setProperty('--earth-y', '0px');
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const canvas = document.querySelector('.stars');

if (canvas) {
  const context = canvas.getContext('2d');
  let stars = [];
  let pointerX = 0;
  let pointerY = 0;

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    stars = Array.from(
      { length: Math.min(320, Math.floor(window.innerWidth * 0.22)) },
      () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        depth: Math.random() + 0.15,
        radius: Math.random() * 1.3 + 0.2,
        opacity: Math.random() * 0.7 + 0.2
      })
    );
  }

  function drawStars() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    stars.forEach((star) => {
      star.y += 0.06 + star.depth * 0.13;
      if (star.y > window.innerHeight + 3) star.y = -3;

      const offsetX = (pointerX - window.innerWidth / 2) * star.depth * 0.01;
      const offsetY = (pointerY - window.innerHeight / 2) * star.depth * 0.01;

      context.beginPath();
      context.fillStyle = `rgba(255, 230, 210, ${star.opacity})`;
      context.arc(
        star.x + offsetX,
        star.y + offsetY,
        star.radius * star.depth,
        0,
        Math.PI * 2
      );
      context.fill();
    });

    window.requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  });

  resizeCanvas();
  drawStars();
}
