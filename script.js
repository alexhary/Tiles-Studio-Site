const ASSET_BASE = document.currentScript?.getAttribute('data-assets') || 'assets/';

const slides = [
  { src: 'assets/slide-01-magenta.webp', alt: 'Glossy magenta sculptural tile surface' },
  { src: 'assets/slide-02-beige-grid.webp', alt: 'Glossy square ceramic tile composition' },
  { src: 'assets/slide-03-white-wave.webp', alt: 'White flowing relief wall surface' },
  { src: 'assets/slide-04-blue-white-wave.webp', alt: 'Blue and white sculptural ceramic tiles' },
  { src: 'assets/slide-05-red-triangles.webp', alt: 'Red geometric 3D ceramic tiles' },
  { src: 'assets/slide-06-terra.webp', alt: 'Terracotta relief ceramic surface' },
  { src: 'assets/slide-07-white-bubbles.webp', alt: 'White glossy pebble-like wall texture' },
  { src: 'assets/slide-08-gold-rings.webp', alt: 'Golden circular decorative screen' },
  { src: 'assets/slide-09-lattice.webp', alt: 'Organic perforated architectural divider' },
  { src: 'assets/slide-10-gold-bubbles.webp', alt: 'Gold pebble-like luxury wall panel' },
  { src: 'assets/slide-11-white-droplets.webp', alt: 'White glossy droplet tile pattern' }
].map(slide => ({ ...slide, src: ASSET_BASE + slide.src.slice('assets/'.length) }));

const scene = document.getElementById('scene');
const turner = document.getElementById('turner');
const cube = document.getElementById('cube');
const prev = document.querySelector('.arrow-left');
const next = document.querySelector('.arrow-right');
const faces = Object.fromEntries(
  [...document.querySelectorAll('.face')].map(el => [el.dataset.face, el])
);

let index = 0;
let animating = false;
let currentMatrix = new DOMMatrix();

/* Which physical face currently occupies each screen/cube position. */
let positions = {
  front: 'front',
  right: 'right',
  back: 'back',
  left: 'left',
  top: 'top',
  bottom: 'bottom'
};

/* Image-up vector of each physical face in the cube's local coordinates. */
const faceUp = {
  front:  [0, -1, 0],
  right:  [0, -1, 0],
  back:   [0, -1, 0],
  left:   [0, -1, 0],
  top:    [0, 0, -1],
  bottom: [0, 0, 1]
};

// Load the six visible cube faces with HTML. Defer the remaining five
// gallery images until the page has finished loading and the browser is idle.
window.addEventListener('load', () => {
  let cursor = 6;
  function nextBatch(deadline) {
    while (cursor < slides.length && (!deadline || deadline.timeRemaining() > 5)) {
      const preload = new Image();
      preload.decoding = 'async';
      preload.src = slides[cursor++].src;
      if (!deadline) break;
    }
    if (cursor < slides.length) schedule();
  }
  function schedule() {
    if ('requestIdleCallback' in window) requestIdleCallback(nextBatch, { timeout: 3000 });
    else setTimeout(() => nextBatch(null), 450);
  }
  schedule();
}, { once: true });

// Remember a manual language choice for visits to the site root.
document.querySelectorAll('.language-switch [data-language]').forEach(link => {
  link.addEventListener('click', () => {
    try { localStorage.setItem('tiles-studio-language', link.dataset.language); } catch (_) { }
  });
});

function updateCubeDepth() {
  const half = scene.getBoundingClientRect().width / 2;
  document.documentElement.style.setProperty('--cube-half', `${half}px`);
}

updateCubeDepth();
window.addEventListener('resize', updateCubeDepth, { passive: true });

function matrixToCss(m) {
  return `matrix3d(${[
    m.m11, m.m12, m.m13, m.m14,
    m.m21, m.m22, m.m23, m.m24,
    m.m31, m.m32, m.m33, m.m34,
    m.m41, m.m42, m.m43, m.m44
  ].join(',')})`;
}

function snapMatrix(m) {
  const props = [
    'm11','m12','m13','m14',
    'm21','m22','m23','m24',
    'm31','m32','m33','m34',
    'm41','m42','m43','m44'
  ];
  for (const p of props) {
    const v = m[p];
    if (Math.abs(v) < 1e-10) m[p] = 0;
    else if (Math.abs(v - 1) < 1e-10) m[p] = 1;
    else if (Math.abs(v + 1) < 1e-10) m[p] = -1;
  }
  return m;
}

function turnSpec(direction) {
  switch (direction) {
    case 'left':
      return {
        css: a => `rotateY(${a}deg)`,
        endCss: 'rotateY(90deg)',
        matrix: new DOMMatrix().rotateAxisAngle(0, 1, 0, 90),
        targetPosition: 'left'
      };
    case 'right':
      return {
        css: a => `rotateY(${a}deg)`,
        endCss: 'rotateY(-90deg)',
        matrix: new DOMMatrix().rotateAxisAngle(0, 1, 0, -90),
        targetPosition: 'right'
      };
    case 'up':
      return {
        css: a => `rotateX(${a}deg)`,
        endCss: 'rotateX(-90deg)',
        matrix: new DOMMatrix().rotateAxisAngle(1, 0, 0, -90),
        targetPosition: 'top'
      };
    case 'down':
      return {
        css: a => `rotateX(${a}deg)`,
        endCss: 'rotateX(90deg)',
        matrix: new DOMMatrix().rotateAxisAngle(1, 0, 0, 90),
        targetPosition: 'bottom'
      };
  }
}

function rotatePositions(p, direction) {
  const n = { ...p };

  if (direction === 'right') {
    n.front = p.right;
    n.right = p.back;
    n.back = p.left;
    n.left = p.front;
  } else if (direction === 'left') {
    n.front = p.left;
    n.right = p.front;
    n.back = p.right;
    n.left = p.back;
  } else if (direction === 'up') {
    n.front = p.top;
    n.bottom = p.front;
    n.back = p.bottom;
    n.top = p.back;
  } else if (direction === 'down') {
    n.front = p.bottom;
    n.top = p.front;
    n.back = p.top;
    n.bottom = p.back;
  }

  return n;
}

function transformVector(m, [x, y, z]) {
  return {
    x: m.m11 * x + m.m21 * y + m.m31 * z,
    y: m.m12 * x + m.m22 * y + m.m32 * z,
    z: m.m13 * x + m.m23 * y + m.m33 * z
  };
}

function uprightImageOnArrival(faceName, arrivalMatrix) {
  const v = transformVector(arrivalMatrix, faceUp[faceName]);
  const roll = Math.round((Math.atan2(v.x, -v.y) * 180 / Math.PI) / 90) * 90;
  const img = faces[faceName].querySelector('.face-image');
  img.style.transform = `rotate(${-roll}deg)`;
}

function setFaceSlide(faceName, slideIndex, arrivalMatrix) {
  const img = faces[faceName].querySelector('.face-image');
  img.src = slides[slideIndex].src;
  img.alt = slides[slideIndex].alt;
  uprightImageOnArrival(faceName, arrivalMatrix);
}

async function turn(direction, newIndex) {
  if (animating) return;
  animating = true;

  const spec = turnSpec(direction);
  const targetFace = positions[spec.targetPosition];
  const arrivalMatrix = snapMatrix(spec.matrix.multiply(currentMatrix));

  /* Load the new gallery image on the physical side that is about to become front. */
  setFaceSlide(targetFace, newIndex, arrivalMatrix);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    currentMatrix = arrivalMatrix;
    cube.style.transform = matrixToCss(currentMatrix);
    positions = rotatePositions(positions, direction);
    index = newIndex;
    animating = false;
    return;
  }

  /* Smooth cinematic quarter-turn. Rotation follows an ease-in-out sine
     curve, while the camera pull-back follows a separate smooth sine arc.
     Sampling both curves into keyframes avoids the previous spring-like
     acceleration when the cube returned toward the viewer. */
  const sign = (direction === 'left' || direction === 'down') ? 1 : -1;
  const keyframes = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const easedTurn = (1 - Math.cos(Math.PI * t)) / 2;
    const angle = sign * 90 * easedTurn;

    /* 1.00 -> 0.84 -> 1.00, with zero velocity at both ends and midpoint. */
    const pullBack = Math.sin(Math.PI * t);
    const scale = 1 - 0.208 * pullBack * pullBack;

    keyframes.push({
      transform: `${spec.css(angle)} scale3d(${scale},${scale},${scale})`,
      offset: t
    });
  }

  const animation = turner.animate(keyframes, {
    duration: 622,
    easing: 'linear',
    fill: 'forwards'
  });

  try {
    await animation.finished;
  } catch (_) {
    animating = false;
    return;
  }

  /* Bake the completed quarter-turn into the cube and reset the temporary wrapper. */
  currentMatrix = arrivalMatrix;
  cube.style.transform = matrixToCss(currentMatrix);
  positions = rotatePositions(positions, direction);
  index = newIndex;
  animation.cancel();
  turner.style.transform = 'none';
  animating = false;
}

function previousProject() {
  if (animating) return;
  const direction = Math.random() < .5 ? 'left' : 'up';
  const newIndex = (index - 1 + slides.length) % slides.length;
  turn(direction, newIndex);
}

function nextProject() {
  if (animating) return;
  const direction = Math.random() < .5 ? 'right' : 'down';
  const newIndex = (index + 1) % slides.length;
  turn(direction, newIndex);
}

function randomCubeTurn() {
  if (animating) return;
  const directions = ['left', 'right', 'up', 'down'];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const newIndex = (index + 1) % slides.length;
  turn(direction, newIndex);
}

prev.addEventListener('click', previousProject);
next.addEventListener('click', nextProject);

/* Desktop: clicking the cube advances to the next image with a random 3D turn.
   Touch devices use the tap logic below so a synthetic click cannot trigger a second turn. */
scene.addEventListener('click', () => {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    randomCubeTurn();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') previousProject();
  if (e.key === 'ArrowRight') nextProject();
});

/* Swipe keeps normal gallery semantics; the actual cube turn still follows
   the same random direction rules as the two on-screen arrows. */
let touchStartX = null;
let touchStartY = null;
scene.addEventListener('touchstart', e => {
  const t = e.changedTouches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

scene.addEventListener('touchend', e => {
  if (touchStartX === null || touchStartY === null) return;

  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const distance = Math.hypot(dx, dy);

  /* Short tap = random 3D turn. Movement beyond the tap threshold does not
     trigger the random turn, preventing a swipe from causing two rotations. */
  if (distance <= 18) {
    randomCubeTurn();
  } else if (Math.max(Math.abs(dx), Math.abs(dy)) > 45) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      dx < 0 ? nextProject() : previousProject();
    } else {
      dy < 0 ? previousProject() : nextProject();
    }
  }

  touchStartX = null;
  touchStartY = null;
}, { passive: true });
