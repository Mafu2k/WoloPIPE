// Wersja 0.0.3
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
});

const navbar = document.getElementById('navbar');

gsap.to(navbar, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
});

ScrollTrigger.create({
    start: 50,
    onUpdate: (self) => {
        if (self.scroll() > 50) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }
    }
});

gsap.to('#hero-line', { opacity: 1, duration: 0.3, delay: 0.3 });
gsap.to('#hero-line line', {
    strokeDashoffset: 0,
    duration: 0.8,
    delay: 0.4,
    ease: 'power2.out'
});
gsap.to('#hero-line circle', {
    opacity: 1,
    duration: 0.3,
    delay: 1,
    stagger: 0.1
});

animateIn('#hero-title', { y: 40 }, { duration: 1, delay: 0.5, ease: 'power3.out' });
animateIn('#hero-desc', { y: 30 }, { duration: 0.8, delay: 0.8, ease: 'power3.out' });
animateIn('#hero-cta', { y: 20 }, { duration: 0.6, delay: 1.1, ease: 'power2.out' });
animateIn('#hero-markers', { y: 20 }, { duration: 0.6, delay: 1.4, ease: 'power2.out' });
animateIn('#hero-image', { x: 60 }, { duration: 1.2, delay: 0.6, ease: 'power3.out' });

gsap.to('#scroll-indicator', { opacity: 1, duration: 0.6, delay: 2, ease: 'power2.out' });
gsap.to('#scroll-indicator', {
    y: 5,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
    delay: 2.5
});

gsap.to('#hero-image', {
    scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    },
    y: 100,
    ease: 'none'
});

document.querySelectorAll('#hero-cta a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                scrollTo: { y: target, offsetY: 80 },
                duration: 1,
                ease: 'power2.inOut'
            });
        }
    });
});

gsap.utils.toArray('.zarzad-card').forEach((card, index) => {
    const direction = index % 2 === 0 ? -100 : 100;
    gsap.set(card, { x: direction });

    gsap.to(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: index * 0.2,
        ease: 'power3.out'
    });
});

gsap.utils.toArray('.team-element').forEach((element, index) => {
    gsap.set(element, { y: 50 });

    gsap.to(element, {
        scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.15,
        ease: 'power2.out'
    });
});

gsap.utils.toArray('.portfolio-card').forEach((card, index) => {
    gsap.set(card, { y: 60 });

    gsap.to(card, {
        scrollTrigger: {
            trigger: '#portfolio',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: index * 0.15,
        ease: 'power2.out'
    });
});

animateOnScroll('#contact-info', { x: -80 }, '#kontakt');
animateOnScroll('#contact-form', { x: 80 }, '#kontakt', 0.2);

const modal = document.getElementById('zarzad-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const modalName = document.getElementById('modal-name');
const modalRole = document.getElementById('modal-role');
const modalBio = document.getElementById('modal-bio');
const modalExperience = document.getElementById('modal-experience');
const modalCerts = document.getElementById('modal-certs');

document.querySelectorAll('.zarzad-card').forEach(card => {
    card.addEventListener('click', () => {
        const isEnglish = document.documentElement.lang === 'en';
        const suffix = isEnglish ? '-en' : '';

        modalName.textContent = card.dataset['name' + (isEnglish ? 'En' : '')] || card.dataset.name;
        modalRole.textContent = card.dataset['role' + (isEnglish ? 'En' : '')] || card.dataset.role;
        modalBio.textContent = card.dataset['bio' + (isEnglish ? 'En' : '')] || card.dataset.bio;
        modalExperience.textContent = card.dataset['experience' + (isEnglish ? 'En' : '')] || card.dataset.experience;

        const certsKey = isEnglish ? 'certsEn' : 'certs';
        const certsList = (card.dataset[certsKey] || card.dataset.certs).split(', ');
        modalCerts.innerHTML = certsList.map(cert =>
            `<span class="px-4 py-2 bg-primary/10 text-primary font-medium rounded-full text-sm">${cert}</span>`
        ).join('');

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        gsap.fromTo(modalBackdrop,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(modalContent,
            { opacity: 0, scale: 0.9, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
        );
    });
});

function closeModal() {
    gsap.to(modalContent, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.2,
        ease: 'power2.in'
    });
    gsap.to(modalBackdrop, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

const contactForm = document.getElementById('contact-form-element');
const formSuccess = document.getElementById('form-success');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        contactForm.style.display = 'none';
        formSuccess.classList.add('is-visible');

        gsap.fromTo(formSuccess,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    });
}

let currentLang = 'pl';

function toggleLanguage() {
    const newLang = currentLang === 'pl' ? 'en' : 'pl';

    document.querySelectorAll('[data-en]').forEach(el => {
        if (!el.dataset.pl) {
            el.dataset.pl = el.innerHTML;
        }

        if (newLang === 'en') {
            el.innerHTML = el.dataset.en;
        } else {
            el.innerHTML = el.dataset.pl;
        }
    });

    document.documentElement.lang = newLang;
    currentLang = newLang;

    const buttonText = newLang === 'en' ? 'PL' : 'EN';
    const langToggle = document.getElementById('lang-toggle');
    const langToggleMobile = document.getElementById('lang-toggle-mobile');
    if (langToggle) langToggle.textContent = buttonText;
    if (langToggleMobile) langToggleMobile.textContent = buttonText;
}

const langToggle = document.getElementById('lang-toggle');
const langToggleMobile = document.getElementById('lang-toggle-mobile');
if (langToggle) langToggle.addEventListener('click', toggleLanguage);
if (langToggleMobile) langToggleMobile.addEventListener('click', toggleLanguage);

function animateIn(selector, fromProps, toProps) {
    gsap.set(selector, { ...fromProps, opacity: 0 });
    gsap.to(selector, {
        ...fromProps,
        ...Object.fromEntries(Object.keys(fromProps).map(key => [key, 0])),
        opacity: 1,
        ...toProps
    });
}

function animateOnScroll(selector, fromProps, triggerSelector, delay) {
    delay = delay || 0;
    gsap.set(selector, fromProps);
    gsap.to(selector, {
        scrollTrigger: {
            trigger: triggerSelector,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        },
        opacity: 1,
        ...Object.fromEntries(Object.keys(fromProps).map(key => [key, 0])),
        duration: 0.8,
        delay: delay,
        ease: 'power3.out'
    });
}
