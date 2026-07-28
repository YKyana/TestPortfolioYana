(() => {
  const lightbox = document.querySelector('.image-lightbox');
  if (!lightbox) return;

  const stage = lightbox.querySelector('.lightbox-stage');
  const image = lightbox.querySelector('.lightbox-image');
  const caption = lightbox.querySelector('.lightbox-caption');
  const closeButton = lightbox.querySelector('[data-lightbox-close]');
  const zoomInButton = lightbox.querySelector('[data-lightbox-zoom-in]');
  const zoomOutButton = lightbox.querySelector('[data-lightbox-zoom-out]');
  const resetButton = lightbox.querySelector('[data-lightbox-reset]');

  let scale = 1;
  let minScale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  const pointers = new Map();
  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  const applyTransform = () => {
    image.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  const resetView = () => {
    const rect = stage.getBoundingClientRect();
    const naturalWidth = image.naturalWidth || 1;
    const naturalHeight = image.naturalHeight || 1;
    minScale = Math.min((rect.width * 0.92) / naturalWidth, (rect.height * 0.88) / naturalHeight, 1);
    scale = minScale;
    x = 0;
    y = 0;
    applyTransform();
  };

  const setScale = (nextScale) => {
    scale = Math.min(Math.max(nextScale, minScale), 6);
    applyTransform();
  };

  const openLightbox = (sourceImage) => {
    image.src = sourceImage.currentSrc || sourceImage.src;
    image.alt = sourceImage.alt || '';
    caption.textContent = sourceImage.alt || 'Project image';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    image.onload = resetView;
    if (image.complete) resetView();
    closeButton?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    pointers.clear();
    dragging = false;
    stage.classList.remove('dragging');
  };

  document.querySelectorAll('.case-image, .gallery img').forEach((item) => {
    item.classList.add('zoomable-image');
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `${item.alt || 'Project image'} — open fullscreen`);
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  zoomInButton?.addEventListener('click', () => setScale(scale * 1.25));
  zoomOutButton?.addEventListener('click', () => setScale(scale / 1.25));
  resetButton?.addEventListener('click', resetView);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    setScale(scale * (event.deltaY < 0 ? 1.12 : 0.89));
  }, { passive: false });

  const pointerDistance = () => {
    const values = [...pointers.values()];
    if (values.length < 2) return 0;
    return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
  };

  stage.addEventListener('pointerdown', (event) => {
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      baseX = x;
      baseY = y;
      stage.classList.add('dragging');
    } else if (pointers.size === 2) {
      dragging = false;
      pinchStartDistance = pointerDistance();
      pinchStartScale = scale;
    }
  });

  stage.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const distance = pointerDistance();
      if (pinchStartDistance > 0) setScale(pinchStartScale * (distance / pinchStartDistance));
      return;
    }
    if (dragging && scale > minScale) {
      x = baseX + event.clientX - startX;
      y = baseY + event.clientY - startY;
      applyTransform();
    }
  });

  const endPointer = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) {
      dragging = false;
      stage.classList.remove('dragging');
    }
  };

  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('dblclick', () => setScale(scale > minScale * 1.5 ? minScale : minScale * 2.5));

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === '+' || event.key === '=') setScale(scale * 1.25);
    if (event.key === '-') setScale(scale / 1.25);
    if (event.key === '0') resetView();
  });

  window.addEventListener('resize', () => {
    if (lightbox.classList.contains('open')) resetView();
  });
})();