const PHOTO_COUNT = 45;
const VIDEO_COUNT = 7;
const ACCESS_HASH = '793a84a351bd364d2f0323b67b39407711e54bc4748c439fb32734538ef8dd15';

const accessGate = document.querySelector('[data-access-gate]');
const accessForm = document.querySelector('[data-access-form]');
const accessPassword = document.querySelector('[data-access-password]');
const accessError = document.querySelector('[data-access-error]');

const unlockSite = () => {
  document.body.classList.remove('is-locked');
  accessGate.hidden = true;
};

const sha256 = async (value) => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

if (sessionStorage.getItem('kimpyungsim-access') === 'allowed') {
  unlockSite();
} else {
  window.setTimeout(() => accessPassword.focus(), 120);
}

accessForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  accessError.textContent = '';
  if (await sha256(accessPassword.value) === ACCESS_HASH) {
    sessionStorage.setItem('kimpyungsim-access', 'allowed');
    unlockSite();
  } else {
    accessPassword.value = '';
    accessError.textContent = '비밀번호가 맞지 않습니다.';
    accessPassword.focus();
  }
});

const photos = Array.from({ length: PHOTO_COUNT }, (_, index) => ({
  full: `assets/photos/photo-${String(index + 1).padStart(2, '0')}.jpg`,
  thumb: `assets/thumbs/photo-${String(index + 1).padStart(2, '0')}.jpg`,
  alt: `김평심 여사 칠순 기념 행사 사진 ${String(index + 1).padStart(2, '0')}`,
}));

const gallery = document.querySelector('[data-gallery]');
const showMore = document.querySelector('[data-show-more]');
const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxDownload = document.querySelector('[data-lightbox-download]');
let currentPhoto = 0;
let touchStartX = 0;

gallery.innerHTML = photos.map((photo, index) => `
  <article class="gallery-item">
    <button class="photo-open" type="button" data-photo-index="${index}" aria-label="${index + 1}번째 사진 크게 보기">
      <img src="${photo.full}" data-full="${photo.full}" alt="${photo.alt}" loading="lazy" decoding="async">
    </button>
    <a class="photo-download" href="${photo.full}" download="김평심_여사_칠순_사진_${String(index + 1).padStart(2, '0')}.jpg" aria-label="${index + 1}번째 사진 다운로드">사진 저장</a>
  </article>
`).join('');

const openPhoto = (index) => {
  currentPhoto = (index + PHOTO_COUNT) % PHOTO_COUNT;
  const photo = photos[currentPhoto];
  lightboxImage.src = photo.full;
  lightboxImage.alt = photo.alt;
  lightboxDownload.href = photo.full;
  lightboxDownload.download = `김평심_여사_칠순_사진_${String(currentPhoto + 1).padStart(2, '0')}.jpg`;
  lightboxCaption.textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${PHOTO_COUNT}`;
  if (!lightbox.open) lightbox.showModal();
};

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-photo-index]');
  if (trigger) openPhoto(Number(trigger.dataset.photoIndex));
});

document.querySelector('[data-close]').addEventListener('click', () => lightbox.close());
document.querySelector('[data-prev]').addEventListener('click', () => openPhoto(currentPhoto - 1));
document.querySelector('[data-next]').addEventListener('click', () => openPhoto(currentPhoto + 1));

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') openPhoto(currentPhoto - 1);
  if (event.key === 'ArrowRight') openPhoto(currentPhoto + 1);
});
lightbox.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 45) openPhoto(currentPhoto + (distance < 0 ? 1 : -1));
}, { passive: true });

showMore.addEventListener('click', () => {
  const isExpanded = gallery.classList.toggle('is-expanded');
  showMore.setAttribute('aria-expanded', String(isExpanded));
  showMore.innerHTML = isExpanded
    ? '사진 접기 <span aria-hidden="true">−</span>'
    : '사진 더 보기 <span aria-hidden="true">＋</span>';
});

const filmList = document.querySelector('[data-films]');
const featuredFilm = `
  <figure class="film-card featured-film reveal">
    <video controls preload="metadata" playsinline poster="assets/posters/moneybox-cake-highlight.jpg">
      <source src="assets/videos/moneybox-cake-highlight.mp4" type="video/mp4">
      이 브라우저에서는 영상을 재생할 수 없습니다.
    </video>
    <figcaption>
      <strong>돈박스와 돈폭탄 케이크</strong>
      <span class="film-actions"><span>HIGHLIGHT FILM</span><a class="film-download" href="assets/videos/moneybox-cake-highlight.mp4" download="김평심_여사_칠순_돈박스와_돈폭탄_케이크.mp4">영상 저장</a></span>
    </figcaption>
  </figure>
`;
filmList.innerHTML = featuredFilm + Array.from({ length: VIDEO_COUNT }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return `
    <figure class="film-card reveal">
      <video controls preload="metadata" playsinline poster="assets/posters/video-${number}.jpg">
        <source src="assets/videos/video-${number}.mp4" type="video/mp4">
        이 브라우저에서는 영상을 재생할 수 없습니다.
      </video>
      <figcaption>
        <strong>그날의 기록 ${number}</strong>
        <span class="film-actions"><span>FILM · ${number}</span><a class="film-download" href="assets/videos/video-${number}.mp4" download="김평심_여사_칠순_영상_${number}.mp4">영상 저장</a></span>
      </figcaption>
    </figure>
  `;
}).join('');

const header = document.querySelector('[data-header]');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
