const galleryImages = [
  {
    src: "img/studiopics/controlroom.webp",
    caption: "Mix/Control room area with analog gear"
  },
  {
    src: "img/studiopics/lounge.webp",
    caption: "Lounge space with comfortable seating & attached bathroom"
  },
  {
    src: "img/studiopics/drums.webp",
    caption: "Drum area with mics, acoustic treatment, and vibe"
  },
  {
    src: "img/studiopics/amps.webp",
    caption: "Amp wall featuring multiple flavours of high-gain amps, great guitar cabs, and several guitars"
  },
  {
    src: "img/studiopics/keys.webp",
    caption: "An excellent selection of synthesizers that can fit any production or sonic palette - anything from organic pianos to otherworldly searing synth leads, and anything in between."
  },
  {
    src: "img/studiopics/mic.webp",
    caption: "One of over two dozen high-quality microphones available in the studio - because your sound deserves the right tool for the job."
  },

];


const galleryContainer = document.getElementById('gallery-container');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

let currentIndex = 0;

function showLightbox(index) {
  currentIndex = index;
  const { src, caption } = galleryImages[index];
  lightboxImg.src = src;
  lightboxCaption.textContent = caption;
  lightbox.style.display = 'flex';
}

function closeLightbox() {
  lightbox.style.display = 'none';
}

function showNextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  showLightbox(currentIndex);
}

function showPrevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  showLightbox(currentIndex);
}

function handleSwipe() {
  let touchStartX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  lightbox.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    if (diffX > 50) {
      showPrevImage();
    } else if (diffX < -50) {
      showNextImage();
    }
  });
}

// Build gallery
galleryImages.forEach((img, index) => {
  const item = document.createElement('div');
  item.className = 'carousel-item';
  const image = document.createElement('img');
  image.src = img.src;
  image.alt = img.caption;
  item.appendChild(image);
  item.onclick = () => showLightbox(index);
  galleryContainer.appendChild(item);
});

document.getElementById('lightbox-close').onclick = closeLightbox;
document.getElementById('lightbox-next').onclick = showNextImage;
document.getElementById('lightbox-prev').onclick = showPrevImage;
handleSwipe();