// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when nav link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Contact Form Handler with validation
document.getElementById('contactForm').addEventListener('submit', function(event) {
    const userName = document.getElementById('user_name').value.trim();
    const userEmail = document.getElementById('user_email').value.trim();
    const message = document.getElementById('message').value.trim();
    const statusMsg = document.getElementById('formStatus');
    
    // Validation
    if (!userName) {
        event.preventDefault();
        statusMsg.innerHTML = '✗ Please enter your name';
        statusMsg.style.color = 'red';
        return;
    }
    
    if (!userEmail) {
        event.preventDefault();
        statusMsg.innerHTML = '✗ Please enter your email';
        statusMsg.style.color = 'red';
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
        event.preventDefault();
        statusMsg.innerHTML = '✗ Please enter a valid email address';
        statusMsg.style.color = 'red';
        return;
    }
    
    if (!message) {
        event.preventDefault();
        statusMsg.innerHTML = '✗ Please enter your message';
        statusMsg.style.color = 'red';
        return;
    }
    
    if (message.length < 10) {
        event.preventDefault();
        statusMsg.innerHTML = '✗ Message must be at least 10 characters';
        statusMsg.style.color = 'red';
        return;
    }
});

/* Reviews carousel + add-review handling */
(function() {
    const initialReviews = [
    { name: 'Aisha Khan, Lahore', text: 'Absolutely love the towels — super soft and very absorbent. Will buy again!', rating: 5 },
    { name: 'Sara Iqbal, Lahore', text: 'Worth every penny. The spa towels are extremely plush and durable.', rating: 5 }
    // Yahan se remove kar dein jo review nahi chahiye
];
    const storageKey = 'minhas_reviews_v2';
    let reviews = [];
    let currentIndex = 0;
    let autoplayTimer = null;

    function loadReviews() {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey));
            if (Array.isArray(stored) && stored.length) {
                reviews = stored.concat();
            } else {
                reviews = initialReviews.slice();
            }
        } catch (e) {
            reviews = initialReviews.slice();
        }
    }

    function saveReviews() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(reviews));
        } catch (e) {
            console.warn('Could not save reviews', e);
        }
    }

    function createStars(rating) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rating';
        wrapper.setAttribute('aria-label', rating + ' out of 5 stars');
        for (let i = 1; i <= 5; i++) {
            const span = document.createElement('span');
            span.className = 'star' + (i <= rating ? ' filled' : '');
            span.textContent = i <= rating ? '★' : '☆';
            wrapper.appendChild(span);
        }
        return wrapper;
    }

    function renderCarousel() {
        const container = document.getElementById('reviewsCarousel');
        const dots = document.getElementById('carouselDots');
        container.innerHTML = '';
        dots.innerHTML = '';

        reviews.forEach((r, idx) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.setAttribute('data-index', idx);

            const card = document.createElement('div');
            card.className = 'review-card';

            const text = document.createElement('p');
            text.className = 'review-text';
            text.textContent = r.text;

            const stars = createStars(r.rating || 5);

            const author = document.createElement('p');
            author.className = 'review-author';
            author.textContent = '— ' + (r.name || 'Anonymous');

            card.appendChild(text);
            card.appendChild(stars);
            card.appendChild(author);
            slide.appendChild(card);
            container.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = 'dot';
            dot.setAttribute('aria-label', 'Show review ' + (idx + 1));
            dot.addEventListener('click', () => { showSlide(idx); stopAutoplay(); });
            dots.appendChild(dot);
        });

        // show first slide
        if (reviews.length) showSlide(0);
    }

    function showSlide(index) {
        const slides = document.querySelectorAll('.reviews-carousel .slide');
        const dots = document.querySelectorAll('.carousel-dots .dot');
        if (!slides.length) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentIndex = index;
    }

    function nextSlide() { showSlide(currentIndex + 1); }
    function prevSlide() { showSlide(currentIndex - 1); }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, 6000);
    }
    function stopAutoplay() {
        if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
    }

    // Add review form handling
    function setupForm() {
        const form = document.getElementById('addReviewForm');
        const status = document.getElementById('reviewStatus');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('rev_name').value.trim();
            const rating = parseInt(document.getElementById('rev_rating').value, 10);
            const message = document.getElementById('rev_message').value.trim();

            if (!name || !message || !rating) {
                status.textContent = 'Please complete all fields.';
                status.style.color = 'red';
                return;
            }
            if (message.length < 10) {
                status.textContent = 'Review must be at least 10 characters.';
                status.style.color = 'red';
                return;
            }

            const newReview = { name: name, text: message, rating: rating };
            reviews.push(newReview);
            saveReviews();
            renderCarousel();
            showSlide(reviews.length - 1);
            status.textContent = '✓ Thank you — your review is added.';
            status.style.color = '#1b4d1b';
            form.reset();
            stopAutoplay();
            setTimeout(() => { status.textContent = ''; startAutoplay(); }, 4000);
        });
    }

    // wire up prev/next
    function setupControls() {
        const prev = document.getElementById('prevReview');
        const next = document.getElementById('nextReview');
        prev.addEventListener('click', () => { prevSlide(); stopAutoplay(); });
        next.addEventListener('click', () => { nextSlide(); stopAutoplay(); });
    }

    // init
    loadReviews();
    renderCarousel();
    setupControls();
    setupForm();
    startAutoplay();

    // Add pointer drag/swipe support (horizontal) for carousel
    (function enableDrag() {
        const carouselEl = document.querySelector('.reviews-carousel');
        if (!carouselEl) return;
        let isDown = false;
        let startX = 0;
        let deltaX = 0;

        carouselEl.addEventListener('pointerdown', (e) => {
            isDown = true;
            startX = e.clientX;
            deltaX = 0;
            carouselEl.classList.add('dragging');
            carouselEl.setPointerCapture(e.pointerId);
            stopAutoplay();
        });

        carouselEl.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            deltaX = e.clientX - startX;
        });

        function endDrag(e) {
            if (!isDown) return;
            isDown = false;
            try { carouselEl.releasePointerCapture(e.pointerId); } catch (err) {}
            carouselEl.classList.remove('dragging');
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            }
            deltaX = 0;
            startAutoplay();
        }

        carouselEl.addEventListener('pointerup', endDrag);
        carouselEl.addEventListener('pointercancel', endDrag);
        carouselEl.addEventListener('pointerleave', endDrag);
    })();

    // expose for debugging
    window.__minhas_reviews = { get: () => reviews, clear: () => { localStorage.removeItem(storageKey); reviews = initialReviews.slice(); renderCarousel(); } };

})();

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");

  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[slideIndex - 1].style.display = "block";
}
// Initial display

let startX = 0;
let endX = 0;

const slider = document.querySelector('.slideshow-container');

// Mouse drag
slider.addEventListener('mousedown', (e) => {
  startX = e.clientX;
});

slider.addEventListener('mouseup', (e) => {
  endX = e.clientX;
  handleSwipe();
});

// Touch (mobile)
slider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

slider.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
});

function handleSwipe() {
  let diff = startX - endX;

  if (diff > 50) {
    plusSlides(1);   // left swipe → next image
  } else if (diff < -50) {
    plusSlides(-1);  // right swipe → previous image
  }
}
document.addEventListener("DOMContentLoaded", function () {

  let startX = 0;
  let endX = 0;

  const slider = document.querySelector('.slideshow-container');

  if (!slider) {
    console.log("Slider not found");
    return;
  }

  // Mouse
  slider.addEventListener('mousedown', (e) => {
    startX = e.clientX;
  });

  slider.addEventListener('mouseup', (e) => {
    endX = e.clientX;
    handleSwipe();
  });

  // Touch (mobile)
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    let diff = startX - endX;

    if (diff > 50) {
      plusSlides(1);
    } else if (diff < -50) {
      plusSlides(-1);
    }
  }

});
