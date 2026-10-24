'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const musicButton = document.getElementById('musicButton');
    const musicIcon = document.getElementById('musicIcon');
    const musicText = document.getElementById('musicText');
    const backgroundMusic = document.getElementById('backgroundMusic');

    const floatingHearts = document.getElementById('floatingHearts');
    const startButton = document.getElementById('startButton');
    const toastMessage = document.getElementById('toastMessage');

    // عناصر صفحه نامه

    const welcomeSection = document.getElementById('welcomeSection');
    const letterSection = document.getElementById('letterSection');

    const envelopeScene = document.getElementById('envelopeScene');
    const envelopeButton = document.getElementById('envelopeButton');
    const envelopeHint = document.getElementById('envelopeHint');

    const letterPaper = document.getElementById('letterPaper');
    const letterContent = document.getElementById('letterContent');

    const closeLetterButton = document.getElementById('closeLetterButton');
    const backHomeButton = document.getElementById('backHomeButton');

    // لایه های افکت

    const balloonLayer = document.createElement('div');
    balloonLayer.className = 'balloon-layer';
    balloonLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(balloonLayer);

    const burstLayer = document.createElement('div');
    burstLayer.className = 'burst-layer';
    burstLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(burstLayer);

    // تنظیمات کلی

    const MAX_FLOATING_HEARTS = 28;
    const MAX_BALLOONS = 7;
    const MAX_PARTICLES = 180;

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    let toastTimer = null;
    let balloonTimer = null;
    let ambientHeartTimer = null;

    let lastStartClick = 0;
    let balloonSequence = 0;

    let letterLoaded = false;
    let isOpeningLetter = false;

    const activeTimeouts = new Set();

    // ابزارهای عمومی

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomInteger(min, max) {
        return Math.floor(random(min, max + 1));
    }

    function schedule(callback, delay) {
        const timeoutId = setTimeout(() => {
            activeTimeouts.delete(timeoutId);
            callback();
        }, delay);

        activeTimeouts.add(timeoutId);

        return timeoutId;
    }

    function showToast(message) {
        toastMessage.textContent = message;
        toastMessage.classList.add('show');

        if (toastTimer !== null) {
            clearTimeout(toastTimer);
            activeTimeouts.delete(toastTimer);
        }

        toastTimer = schedule(() => {
            toastMessage.classList.remove('show');
            toastTimer = null;
        }, 3000);
    }

    function removeAfterAnimation(element, fallbackDuration = 2000) {
        let removed = false;

        function removeElement() {
            if (removed) {
                return;
            }

            removed = true;
            element.remove();
        }

        element.addEventListener('animationend', removeElement, {
            once: true
        });

        schedule(removeElement, fallbackDuration);
    }

    // موسیقی

    function updateMusicButton(isPlaying) {
        musicButton.setAttribute('aria-pressed', String(isPlaying));
        musicButton.classList.toggle('is-playing', isPlaying);

        if (isPlaying) {
            musicIcon.textContent = 'Ⅱ';
            musicText.textContent = 'توقف موسیقی';

            musicButton.setAttribute('aria-label', 'توقف موسیقی');
        } else {
            musicIcon.textContent = '♫';
            musicText.textContent = 'پخش موسیقی';

            musicButton.setAttribute('aria-label', 'پخش موسیقی');
        }
    }

    musicButton.addEventListener('click', async () => {
        if (backgroundMusic.paused) {
            try {
                await backgroundMusic.play();
                updateMusicButton(true);
            } catch (error) {
                console.error('پخش موسیقی ناموفق بود:', error);

                updateMusicButton(false);

                showToast(
                    'فایل موسیقی را در پوشه assets/music قرار بده'
                );
            }
        } else {
            backgroundMusic.pause();
            updateMusicButton(false);
        }
    });

    backgroundMusic.addEventListener('play', () => {
        updateMusicButton(true);
    });

    backgroundMusic.addEventListener('pause', () => {
        updateMusicButton(false);
    });

    backgroundMusic.addEventListener('ended', () => {
        updateMusicButton(false);
    });

    backgroundMusic.addEventListener('error', () => {
        updateMusicButton(false);
    });

    updateMusicButton(false);

    // قلب های شناور سه بعدی

    function createFloatingHeart(options = {}) {
        if (
            floatingHearts.childElementCount >= MAX_FLOATING_HEARTS
        ) {
            return;
        }

        const heart = document.createElement('span');

        const isThreeDimensional =
            options.threeDimensional !== false;

        heart.className = isThreeDimensional
            ? 'floating-heart three-dimensional-heart'
            : 'floating-heart';

        heart.setAttribute('aria-hidden', 'true');

        const symbols = ['♥', '♡', 'ღ', '♥'];

        const colors = [
            '#e98cac',
            '#f2a5bf',
            '#d96f99',
            '#f6b7ca',
            '#cf7198',
            '#e7a0b7'
        ];

        heart.textContent =
            symbols[randomInteger(0, symbols.length - 1)];

        heart.style.left = `${random(0, 100)}%`;

        heart.style.fontSize = `${random(15, 38)}px`;

        heart.style.color =
            colors[randomInteger(0, colors.length - 1)];

        heart.style.animationDuration = `${random(8, 15)}s`;

        heart.style.animationDelay = `${random(0, 0.6)}s`;

        if (options.left !== undefined) {
            heart.style.left = `${options.left}%`;
        }

        if (options.size !== undefined) {
            heart.style.fontSize = `${options.size}px`;
        }

        if (prefersReducedMotion.matches) {
            heart.style.animationDuration = '0.01ms';
        }

        floatingHearts.appendChild(heart);

        removeAfterAnimation(heart, 16000);
    }

    function initializeFloatingHearts() {
        const initialCount = prefersReducedMotion.matches ? 4 : 18;

        for (let i = 0; i < initialCount; i++) {
            schedule(() => {
                createFloatingHeart();
            }, i * 180);
        }
    }

    initializeFloatingHearts();

    ambientHeartTimer = setInterval(() => {
        if (prefersReducedMotion.matches) {
            return;
        }

        if (
            floatingHearts.childElementCount <
            MAX_FLOATING_HEARTS
        ) {
            createFloatingHeart();
        }
    }, 480);

    // انفجار قلب و نور

    function createBurst(x, y, options = {}) {
        const intensity = options.intensity || 'normal';

        const particleCount = intensity === 'large'
            ? 45
            : intensity === 'medium'
                ? 27
                : 15;

        const availableParticles =
            MAX_PARTICLES - burstLayer.childElementCount;

        const count = Math.min(
            particleCount,
            availableParticles
        );

        if (count <= 0) {
            return;
        }

        const xPercent = (x / window.innerWidth) * 100;
        const yPercent = (y / window.innerHeight) * 100;

        const wave = document.createElement('span');

        wave.className = 'burst-wave';

        wave.style.setProperty('--start-x', `${xPercent}%`);
        wave.style.setProperty('--start-y', `${yPercent}%`);

        burstLayer.appendChild(wave);

        removeAfterAnimation(wave, 1000);

        const heartSymbols = ['♥', '♡', 'ღ', '✧', '✦'];

        const heartColors = [
            '#ffb4cd',
            '#f28db4',
            '#e36f9c',
            '#ffd5e3',
            '#ffffff',
            '#d875a0'
        ];

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');

            const isLight = Math.random() < 0.32;

            particle.className = isLight
                ? 'light-particle'
                : 'burst-particle';

            const angle = random(0, Math.PI * 2);

            const distance = intensity === 'large'
                ? random(80, 270)
                : random(40, 165);

            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;

            const duration = random(0.85, 1.8);

            particle.style.setProperty('--start-x', `${xPercent}%`);
            particle.style.setProperty('--start-y', `${yPercent}%`);

            particle.style.setProperty('--move-x', `${moveX}px`);
            particle.style.setProperty('--move-y', `${moveY}px`);

            particle.style.setProperty(
                '--particle-duration',
                `${duration}s`
            );

            particle.style.setProperty(
                '--particle-size',
                isLight
                    ? `${random(3, 9)}px`
                    : `${random(12, 27)}px`
            );

            if (!isLight) {
                particle.textContent =
                    heartSymbols[
                        randomInteger(0, heartSymbols.length - 1)
                    ];

                particle.style.setProperty(
                    '--particle-color',
                    heartColors[
                        randomInteger(0, heartColors.length - 1)
                    ]
                );

                particle.style.setProperty(
                    '--rotation',
                    `${randomInteger(-260, 260)}deg`
                );

                particle.style.setProperty(
                    '--end-scale',
                    String(random(0.35, 1.1))
                );
            }

            burstLayer.appendChild(particle);

            removeAfterAnimation(
                particle,
                duration * 1000 + 300
            );
        }
    }

    // بادکنک های قلبی

    function createBalloon() {
        if (prefersReducedMotion.matches) {
            return;
        }

        if (balloonLayer.childElementCount >= MAX_BALLOONS) {
            return;
        }

        const balloon = document.createElement('div');

        balloon.className = 'heart-balloon';
        balloon.setAttribute('aria-hidden', 'true');

        const heart = document.createElement('span');

        heart.className = 'balloon-heart';
        heart.textContent = '♥';

        const string = document.createElement('span');
        string.className = 'balloon-string';

        const knot = document.createElement('span');
        knot.className = 'balloon-knot';

        const palette = [
            { main: '#f5a4c0', side: '#d86c97' },
            { main: '#ef85ad', side: '#cb527e' },
            { main: '#ffbfd4', side: '#e38aa9' },
            { main: '#d97da7', side: '#b74f7d' },
            { main: '#f8a9a9', side: '#dc737f' },
            { main: '#e8a3cb', side: '#c878a6' }
        ];

        const color = palette[
            randomInteger(0, palette.length - 1)
        ];

        const size = random(43, 79);
        const duration = random(8, 13);

        balloon.style.left = `${random(3, 94)}%`;

        balloon.style.setProperty('--balloon-size', `${size}px`);
        balloon.style.setProperty('--rise-duration', `${duration}s`);

        balloon.style.setProperty('--balloon-color', color.main);
        balloon.style.setProperty('--balloon-side', color.side);

        heart.style.setProperty('--balloon-size', `${size}px`);
        heart.style.setProperty('--balloon-color', color.main);
        heart.style.setProperty('--balloon-side', color.side);

        balloon.appendChild(heart);
        balloon.appendChild(knot);
        balloon.appendChild(string);

        balloonLayer.appendChild(balloon);

        balloonSequence++;

        const shouldPop = balloonSequence % 4 !== 0;

        if (shouldPop) {
            const popDelay = duration * 1000 * random(0.48, 0.78);

            schedule(() => {
                if (!balloon.isConnected) {
                    return;
                }

                popBalloon(balloon);
            }, popDelay);
        } else {
            removeAfterAnimation(balloon, duration * 1000 + 1000);
        }
    }

    function popBalloon(balloon) {
        if (
            !balloon.isConnected ||
            balloon.classList.contains('popping')
        ) {
            return;
        }

        const rect = balloon.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height * 0.35;

        balloon.classList.add('popping');

        createBurst(x, y, {
            intensity: 'medium'
        });

        for (let i = 0; i < 3; i++) {
            schedule(() => {
                createFloatingHeart({
                    left: random(
                        Math.max(
                            0,
                            (x / window.innerWidth) * 100 - 5
                        ),
                        Math.min(
                            100,
                            (x / window.innerWidth) * 100 + 5
                        )
                    ),
                    size: random(18, 31),
                    threeDimensional: true
                });
            }, i * 100);
        }

        removeAfterAnimation(balloon, 350);
    }

    function startBalloonCycle() {
        if (prefersReducedMotion.matches) {
            return;
        }

        createBalloon();

        balloonTimer = setInterval(() => {
            createBalloon();
        }, 950);
    }

    startBalloonCycle();

    // خواندن فایل متن نامه

    async function loadLetter() {
        if (letterLoaded) {
            return true;
        }

        letterContent.replaceChildren();

        const loadingMessage = document.createElement('p');
        loadingMessage.className = 'letter-loading';
        loadingMessage.textContent = 'داریم نامه رو آماده می‌کنیم... 💗';

        letterContent.appendChild(loadingMessage);

        try {
            const response = await fetch('content/letter.txt', {
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(
                    `خطا در دریافت فایل نامه: ${response.status}`
                );
            }

            const text = await response.text();

            if (!text.trim()) {
                throw new Error('فایل نامه خالی است.');
            }

            letterContent.replaceChildren();

            const paragraphs = text
                .replace(/\r\n/g, '\n')
                .split(/\n\s*\n/)
                .map(paragraph => paragraph.trim())
                .filter(Boolean);

            for (const paragraphText of paragraphs) {
                const paragraph = document.createElement('p');

                paragraph.className = 'letter-paragraph';

                // متن به صورت متن ساده درج می شود تا HTML داخل فایل اجرا نشود.
                paragraph.textContent = paragraphText.replace(/\n/g, ' ');

                letterContent.appendChild(paragraph);
            }

            letterLoaded = true;

            return true;
        } catch (error) {
            console.error('بارگذاری نامه ناموفق بود:', error);

            letterContent.replaceChildren();

            const errorMessage = document.createElement('p');

            errorMessage.className = 'letter-loading';
            errorMessage.textContent =
                'فایل نامه پیدا نشد. پوشه content و فایل letter.txt رو بررسی کن.';

            letterContent.appendChild(errorMessage);

            showToast('نتونستیم نامه رو بخونیم. فایل letter.txt رو بررسی کن.');

            return false;
        }
    }

    // نمایش صفحه نامه

    function showLetterSection() {
        welcomeSection.hidden = true;
        letterSection.hidden = false;

        letterSection.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block: 'start'
        });

        showToast('یه نامه کوچیک برای تو آماده‌ست 💌');
    }

    // برگشت به صفحه اول

    function showWelcomeSection() {
        letterSection.hidden = true;
        welcomeSection.hidden = false;

        envelopeScene.classList.remove('is-open');

        envelopeButton.disabled = false;
        envelopeButton.setAttribute('aria-expanded', 'false');

        envelopeHint.hidden = false;
        envelopeHint.textContent = 'روی پاکت بزن تا نامه‌ات رو باز کنی 💌';

        letterPaper.hidden = true;
        closeLetterButton.hidden = true;

        isOpeningLetter = false;

        welcomeSection.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    // کلیک روی دکمه شروع

    // کلیک روی دکمه شروع و ورود به باغ جادویی قلب‌ها

    startButton.addEventListener('click', () => {
        const now = Date.now();

        if (now - lastStartClick < 1200) {
            return;
        }

        lastStartClick = now;

        // ایجاد انفجار بزرگ قلب و نور
        const x = window.innerWidth / 2;
        const y = window.innerHeight / 2;

        createBurst(x, y, {
            intensity: 'large'
        });

        // موج دوم قلب‌ها
        schedule(() => {
            createBurst(
                x + random(-100, 100),
                y + random(-70, 70),
                {
                    intensity: 'medium'
                }
            );
        }, 220);

        // رها شدن بادکنک‌های قلبی
        for (let i = 0; i < 3; i++) {
            schedule(() => {
                createBalloon();
            }, i * 250);
        }

        // نمایش افکت و سپس ورود به صفحه درخت
        startButton.disabled = true;

        startButton.querySelector('span').textContent =
            'داریم وارد دنیای دونفره‌مون می‌شیم...';

        schedule(() => {
            window.location.href = 'pages/tree.html';
        }, 900);
    });

    // باز کردن پاکت

    envelopeButton.addEventListener('click', async () => {
        if (isOpeningLetter || envelopeScene.classList.contains('is-open')) {
            return;
        }

        isOpeningLetter = true;

        envelopeButton.disabled = true;

        envelopeScene.classList.add('is-open');

        envelopeButton.setAttribute('aria-expanded', 'true');

        envelopeHint.textContent = 'یه لحظه صبر کن عشقم 💗';

        const rect = envelopeButton.getBoundingClientRect();

        createBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            {
                intensity: 'medium'
            }
        );

        const loaded = await loadLetter();

        if (!loaded) {
            isOpeningLetter = false;

            envelopeButton.disabled = false;

            envelopeScene.classList.remove('is-open');

            envelopeButton.setAttribute('aria-expanded', 'false');

            envelopeHint.textContent =
                'فایل نامه رو بررسی کن و دوباره امتحان کن 💌';

            return;
        }

        schedule(() => {
            letterPaper.hidden = false;
            closeLetterButton.hidden = false;

            envelopeHint.hidden = true;

            letterPaper.scrollIntoView({
                behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
                block: 'center'
            });

            if (typeof letterPaper.focus === 'function') {
                letterPaper.focus({
                    preventScroll: true
                });
            }

            isOpeningLetter = false;
            envelopeButton.disabled = false;

            const rect = letterPaper.getBoundingClientRect();

            createBurst(
                rect.left + rect.width / 2,
                rect.top + 25,
                {
                    intensity: 'medium'
                }
            );
        }, prefersReducedMotion.matches ? 0 : 550);
    });

    // بستن نامه

    closeLetterButton.addEventListener('click', () => {
        letterPaper.hidden = true;
        closeLetterButton.hidden = true;

        envelopeScene.classList.remove('is-open');

        envelopeButton.setAttribute('aria-expanded', 'false');

        envelopeHint.hidden = false;
        envelopeHint.textContent =
            'نامه‌ات دوباره توی پاکت منتظرته 💗';

        createBurst(
            window.innerWidth / 2,
            window.innerHeight / 2,
            {
                intensity: 'normal'
            }
        );

        envelopeButton.focus();

        isOpeningLetter = false;
    });

    // برگشت از نامه به صفحه خوشامدگویی

    backHomeButton.addEventListener('click', () => {
        showWelcomeSection();
    });

    // واکنش قلبی به کلیک در فضای خالی

    document.addEventListener('click', event => {
        const target = event.target;

        if (
            target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('.letter-paper')
        ) {
            return;
        }

        if (prefersReducedMotion.matches) {
            return;
        }

        if (
            burstLayer.childElementCount >
            MAX_PARTICLES - 25
        ) {
            return;
        }

        createBurst(event.clientX, event.clientY, {
            intensity: 'normal'
        });
    });

    // پاکسازی منابع هنگام خروج از صفحه

    window.addEventListener('pagehide', () => {
        if (balloonTimer !== null) {
            clearInterval(balloonTimer);
        }

        if (ambientHeartTimer !== null) {
            clearInterval(ambientHeartTimer);
        }

        for (const timeoutId of activeTimeouts) {
            clearTimeout(timeoutId);
        }

        activeTimeouts.clear();
    });
});