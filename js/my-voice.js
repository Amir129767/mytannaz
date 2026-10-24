'use strict';

document.addEventListener('DOMContentLoaded', () => {
        /*
     * بارگذاری متن شخصی از فایل متنی
     */
    async function loadPersonalMessage() {
        const messageElement = document.getElementById('personalMessage');

        if (!messageElement) return;

        try {
            const response = await fetch('../content/my-voice.txt', {
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(
                    `خطا در دریافت متن: ${response.status}`
                );
            }

            const text = await response.text();

            if (!text.trim()) {
                throw new Error('فایل متن خالی است.');
            }

            const paragraphs = text
                .replace(/\r\n/g, '\n')
                .split(/\n\s*\n/)
                .map(paragraph => paragraph.trim())
                .filter(Boolean);

            const fragment = document.createDocumentFragment();

            paragraphs.forEach(paragraphText => {
                const paragraph = document.createElement('p');

                paragraph.textContent = paragraphText.replace(/\n/g, ' ');

                fragment.appendChild(paragraph);
            });

            messageElement.replaceChildren(fragment);
        } catch (error) {
            console.error('خطا در بارگذاری پیام شخصی:', error);

            messageElement.textContent =
                'فعلاً امکان نمایش پیام وجود ندارد. کمی بعد دوباره امتحان کن ❤️';
        }
    }

    loadPersonalMessage();
    const starsContainer = document.getElementById('stars');
    const lightsContainer = document.getElementById('floatingLights');
    const heartContainer = document.getElementById('heartContainer');
    const heartSection = document.querySelector('.heart-section');
    const mainHeart = document.getElementById('mainHeart');
    const heartSparkles = document.getElementById('heartSparkles');
    const heartCaption = document.getElementById('heartCaption');

    const soundWave = document.getElementById('soundWave');
    const voiceAudio = document.getElementById('myVoiceAudio');
    const audioNote = document.getElementById('audioNote');

    const backButton = document.getElementById('backToTreeButton');
    const pageMessage = document.getElementById('pageMessage');

    let messageTimeout = null;
    let resizeTimeout = null;
    let previousMobileState = window.innerWidth <= 600;

    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let audioData = null;
    let audioAnalysisAvailable = false;
    let audioSetupAttempted = false;
    let animationFrameId = null;

    let heartEffectsContainer = null;
    let heartRainTimer = null;
    let heartOrbitTimer = null;
    let heartBurstTimer = null;

    let audioIsPlaying = false;
    let isStartingPlayback = false;
    let playbackRequestId = 0;

    const MAX_FLOATING_HEARTS = 34;
    const MAX_ORBIT_HEARTS = 16;
    const MAX_PARTICLES = 90;

    const isMobile = () => window.innerWidth <= 600;

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    /*
     * نمایش پیام کوتاه روی صفحه
     */
    function showMessage(message) {
        if (!pageMessage) return;

        pageMessage.textContent = message;
        pageMessage.hidden = false;

        clearTimeout(messageTimeout);

        messageTimeout = setTimeout(() => {
            pageMessage.hidden = true;
        }, 4000);
    }

    /*
     * ساخت ستاره‌های آسمان
     */
    function createStars() {
        if (!starsContainer) return;

        starsContainer.replaceChildren();

        const starCount = isMobile() ? 45 : 85;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('span');

            star.className = 'star';
            star.setAttribute('aria-hidden', 'true');
            star.textContent = Math.random() > 0.5 ? '✦' : '·';

            const size = Math.random() * 10 + 5;
            const duration = Math.random() * 3 + 2;

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.fontSize = `${size}px`;
            star.style.setProperty('--duration', `${duration}s`);
            star.style.animationDelay = `${Math.random() * -5}s`;
            star.style.opacity = (Math.random() * 0.65 + 0.2).toFixed(2);

            fragment.appendChild(star);
        }

        starsContainer.appendChild(fragment);
    }

    /*
     * ساخت نورهای شناور پس‌زمینه
     */
    function createFloatingLights() {
        if (!lightsContainer) return;

        lightsContainer.replaceChildren();

        const lightCount = isMobile() ? 12 : 24;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < lightCount; i++) {
            const light = document.createElement('span');

            light.className = 'light';
            light.setAttribute('aria-hidden', 'true');

            const duration = Math.random() * 7 + 7;
            const size = Math.random() * 4 + 3;

            light.style.left = `${Math.random() * 100}%`;
            light.style.width = `${size}px`;
            light.style.height = `${size}px`;
            light.style.setProperty('--duration', `${duration}s`);
            light.style.animationDelay = `${Math.random() * -12}s`;

            fragment.appendChild(light);
        }

        lightsContainer.appendChild(fragment);
    }

    /*
     * ساخت ذرات درخشان اطراف قلب اصلی
     */
    function createHeartSparkles() {
        if (!heartSparkles) return;

        heartSparkles.replaceChildren();

        const symbols = ['♡', '✦', '·', '♥'];
        const sparkleCount = isMobile() ? 10 : 16;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('span');

            sparkle.className = 'heart-sparkle';
            sparkle.setAttribute('aria-hidden', 'true');

            sparkle.textContent =
                symbols[Math.floor(Math.random() * symbols.length)];

            sparkle.style.left = `${8 + Math.random() * 84}%`;
            sparkle.style.top = `${8 + Math.random() * 84}%`;
            sparkle.style.setProperty(
                '--duration',
                `${2 + Math.random() * 3}s`
            );

            sparkle.style.animationDelay = `${Math.random() * -4}s`;
            sparkle.style.fontSize = `${10 + Math.random() * 10}px`;

            fragment.appendChild(sparkle);
        }

        heartSparkles.appendChild(fragment);
    }

    /*
     * ایجاد محفظه افکت‌های عاشقانه
     *
     * این محفظه جدا از قلب اصلی است تا افکت‌ها
     * روی کلیک و پخش صدا اختلال ایجاد نکنند.
     */
    function createHeartEffectsContainer() {
        if (!heartContainer || heartEffectsContainer) return;

        heartEffectsContainer = document.createElement('div');
        heartEffectsContainer.className = 'heart-effects';
        heartEffectsContainer.id = 'heartEffects';
        heartEffectsContainer.setAttribute('aria-hidden', 'true');

        heartContainer.appendChild(heartEffectsContainer);
    }

    /*
     * ساخت یک قلب تزئینی
     */
    function createDecorativeHeart(options = {}) {
        if (!heartEffectsContainer) return null;

        const {
            type = 'floating-heart',
            x = Math.random() * 100,
            y = Math.random() * 100,
            size = 20 + Math.random() * 25,
            duration = 3 + Math.random() * 4,
            delay = 0,
            rotation = Math.random() * 50 - 25
        } = options;

        const heart = document.createElement('span');

        heart.className = type;
        heart.textContent = Math.random() > 0.5 ? '♥' : '❤';

        heart.style.left = `${x}%`;
        heart.style.top = `${y}%`;
        heart.style.fontSize = `${size}px`;
        heart.style.setProperty('--heart-duration', `${duration}s`);
        heart.style.setProperty('--heart-delay', `${delay}s`);
        heart.style.setProperty('--heart-rotation', `${rotation}deg`);

        heart.setAttribute('aria-hidden', 'true');

        heartEffectsContainer.appendChild(heart);

        return heart;
    }

    /*
     * شمارش عناصر زنده از یک نوع
     */
    function countEffects(selector) {
        if (!heartEffectsContainer) return 0;

        return heartEffectsContainer.querySelectorAll(selector).length;
    }

    /*
     * انفجار یک قلب به ذرات کوچک
     */
    function burstHeart(x, y, strength = 1) {
        if (!heartEffectsContainer) return;

        const particleCount = isMobile() ? 7 : 11;

        const currentParticles = countEffects('.heart-particle');

        if (currentParticles >= MAX_PARTICLES) return;

        const available = Math.max(
            0,
            MAX_PARTICLES - currentParticles
        );

        const total = Math.min(particleCount, available);

        for (let i = 0; i < total; i++) {
            const particle = document.createElement('span');

            const isHeart = Math.random() > 0.35;

            particle.className = isHeart
                ? 'heart-particle particle-heart'
                : 'heart-particle particle-light';

            particle.textContent = isHeart
                ? (Math.random() > 0.5 ? '♥' : '♡')
                : '✦';

            const angle = (Math.PI * 2 * i) / total;
            const distance = (35 + Math.random() * 85) * strength;

            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;

            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.setProperty('--particle-x', `${dx}px`);
            particle.style.setProperty('--particle-y', `${dy}px`);
            particle.style.setProperty(
                '--particle-duration',
                `${0.65 + Math.random() * 0.7}s`
            );

            heartEffectsContainer.appendChild(particle);

            particle.addEventListener('animationend', () => {
                particle.remove();
            }, { once: true });
        }
    }

    /*
     * باران قلب‌ها
     */
    function createRainHeart() {
        if (!audioIsPlaying || !heartEffectsContainer) return;

        if (
            countEffects('.floating-heart') >= MAX_FLOATING_HEARTS
        ) {
            return;
        }

        const heart = createDecorativeHeart({
            type: 'floating-heart',
            x: Math.random() * 100,
            y: 105 + Math.random() * 15,
            size: 13 + Math.random() * (isMobile() ? 17 : 25),
            duration: 4 + Math.random() * 5,
            rotation: Math.random() * 50 - 25
        });

        if (!heart) return;

        heart.addEventListener('animationend', () => {
            heart.remove();
        }, { once: true });

        /*
         * بعضی قلب‌ها هنگام حرکت می‌ترکند.
         */
        if (Math.random() > 0.65) {
            const heartLifetime = parseFloat(
                heart.style.getPropertyValue('--heart-duration')
            ) * 1000;

            setTimeout(() => {
                if (!heart.isConnected || !audioIsPlaying) return;

                const rect = heart.getBoundingClientRect();
                const containerRect =
                    heartEffectsContainer.getBoundingClientRect();

                const x =
                    ((rect.left + rect.width / 2 - containerRect.left) /
                    containerRect.width) * 100;

                const y =
                    ((rect.top + rect.height / 2 - containerRect.top) /
                    containerRect.height) * 100;

                burstHeart(x, y, 0.75);
                heart.remove();
            }, heartLifetime * 0.45);
        }
    }

    /*
     * ساخت قلب‌های چرخان دور قلب اصلی
     */
    function createOrbitHearts() {
        if (!heartEffectsContainer) return;

        heartEffectsContainer
            .querySelectorAll('.orbit-heart')
            .forEach(heart => heart.remove());

        const count = isMobile()
            ? Math.min(10, MAX_ORBIT_HEARTS)
            : MAX_ORBIT_HEARTS;

        for (let i = 0; i < count; i++) {
            const heart = document.createElement('span');

            heart.className = 'orbit-heart';
            heart.textContent = '♥';
            heart.setAttribute('aria-hidden', 'true');

            heart.style.setProperty(
                '--orbit-angle',
                `${(360 / count) * i}deg`
            );

            heart.style.setProperty(
                '--orbit-radius',
                `${isMobile() ? 112 : 145 + Math.random() * 18}px`
            );

            heart.style.setProperty(
                '--orbit-duration',
                `${5 + Math.random() * 7}s`
            );

            heart.style.setProperty(
                '--orbit-delay',
                `${-Math.random() * 8}s`
            );

            heart.style.setProperty(
                '--orbit-size',
                `${12 + Math.random() * 15}px`
            );

            heartEffectsContainer.appendChild(heart);
        }
    }

    /*
     * انفجارهای دوره‌ای در اطراف قلب
     */
    function createRandomBurst() {
        if (!audioIsPlaying || !heartEffectsContainer) return;

        const x = 12 + Math.random() * 76;
        const y = 12 + Math.random() * 76;

        burstHeart(x, y, 0.6 + Math.random() * 0.7);
    }

    /*
     * پاک‌سازی افکت‌های فعال
     */
    function clearHeartEffects() {
        clearInterval(heartRainTimer);
        clearInterval(heartOrbitTimer);
        clearInterval(heartBurstTimer);

        heartRainTimer = null;
        heartOrbitTimer = null;
        heartBurstTimer = null;

        if (!heartEffectsContainer) return;

        heartEffectsContainer
            .querySelectorAll(
                '.floating-heart, .orbit-heart, .heart-particle'
            )
            .forEach(element => element.remove());
    }

    /*
     * شروع دنیای قلب‌ها
     */
    function startHeartEffects() {
        if (prefersReducedMotion.matches) return;

        createHeartEffectsContainer();

        if (!heartEffectsContainer) return;

        clearHeartEffects();

        heartEffectsContainer.classList.add('effects-active');

        createOrbitHearts();

        /*
         * چند قلب اولیه برای شروع پرانرژی
         */
        for (let i = 0; i < (isMobile() ? 5 : 9); i++) {
            createRainHeart();
        }

        /*
         * باران قلب‌ها
         */
        heartRainTimer = setInterval(
            createRainHeart,
            isMobile() ? 480 : 320
        );

        /*
         * انفجارهای کوچک و پیوسته
         */
        heartBurstTimer = setInterval(
            createRandomBurst,
            isMobile() ? 1150 : 850
        );

        /*
         * قلب‌های حلقه‌ای هر چند ثانیه دوباره ساخته می‌شوند
         * تا در صورت حذف اتفاقی، افکت‌ها باقی بمانند.
         */
        heartOrbitTimer = setInterval(() => {
            if (
                audioIsPlaying &&
                heartEffectsContainer &&
                !heartEffectsContainer.querySelector('.orbit-heart')
            ) {
                createOrbitHearts();
            }
        }, 3000);

        /*
         * موج اولیه نورانی از مرکز قلب
         */
        burstHeart(50, 50, 1.5);
    }

    /*
     * توقف دنیای قلب‌ها
     */
    function stopHeartEffects() {
        clearHeartEffects();

        if (heartEffectsContainer) {
            heartEffectsContainer.classList.remove('effects-active');
        }
    }

    /*
     * فعال یا غیرفعال کردن ظاهر قلب هنگام پخش
     */
    function setHeartPlayingState(isPlaying) {
        audioIsPlaying = isPlaying;

        if (heartSection) {
            heartSection.classList.toggle('is-playing', isPlaying);
        }

        if (soundWave) {
            soundWave.classList.toggle('is-playing', isPlaying);
        }

        if (mainHeart) {
            mainHeart.setAttribute(
                'aria-label',
                isPlaying
                    ? 'توقف صدای من'
                    : 'پخش صدای من'
            );

            mainHeart.setAttribute(
                'aria-pressed',
                String(isPlaying)
            );
        }

        if (heartCaption) {
            heartCaption.textContent = isPlaying
                ? 'دارم با صدای خودم برات می‌تپم ❤️'
                : 'برای شنیدن صدای من روی قلب بزن ❤️';
        }

        if (audioNote) {
            if (isPlaying) {
                audioNote.textContent =
                    'چه خوب که داری به صدام گوش می‌دی ❤️';
            } else if (voiceAudio && voiceAudio.ended) {
                audioNote.textContent =
                    'هر بار که بخوای می‌تونی دوباره صدام رو بشنوی ❤️';
            } else {
                audioNote.textContent =
                    'برای شنیدن صدا روی قلب صورتی بزن ❤️';
            }
        }

        if (isPlaying) {
            startHeartEffects();
        } else {
            stopHeartEffects();
            resetHeartScale();
        }
    }

    /*
     * بازگرداندن قلب به اندازه عادی
     */
    function resetHeartScale() {
        if (!mainHeart) return;

        mainHeart.style.removeProperty('--audio-scale');
        mainHeart.style.removeProperty('--audio-glow');
    }

    /*
     * آماده‌سازی تحلیل صدای واقعی
     */
    function setupAudioAnalysis() {
        if (!voiceAudio || audioSetupAttempted) {
            return audioAnalysisAvailable;
        }

        audioSetupAttempted = true;

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass || !window.requestAnimationFrame) {
            return false;
        }

        try {
            audioContext = new AudioContextClass();

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.78;

            audioData = new Uint8Array(analyser.frequencyBinCount);

            sourceNode =
                audioContext.createMediaElementSource(voiceAudio);

            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);

            audioAnalysisAvailable = true;

            return true;
        } catch (error) {
            console.warn('Audio analysis is unavailable:', error);

            audioAnalysisAvailable = false;

            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close().catch(() => {});
            }

            audioContext = null;
            analyser = null;
            sourceNode = null;
            audioData = null;

            return false;
        }
    }

    /*
     * هماهنگ کردن قلب با بلندی صدای واقعی
     */
    function updateHeartFromAudio() {
        if (
            !audioAnalysisAvailable ||
            !analyser ||
            !audioData ||
            !voiceAudio ||
            voiceAudio.paused ||
            voiceAudio.ended
        ) {
            animationFrameId = null;
            return;
        }

        analyser.getByteFrequencyData(audioData);

        let total = 0;

        for (let i = 0; i < audioData.length; i++) {
            total += audioData[i];
        }

        const average = audioData.length > 0
            ? total / audioData.length
            : 0;

        const volume = Math.min(1, average / 115);

        const scale = 0.92 + volume * 0.2;
        const glow = 0.7 + volume * 0.8;

        if (mainHeart && !prefersReducedMotion.matches) {
            mainHeart.style.setProperty(
                '--audio-scale',
                scale.toFixed(3)
            );

            mainHeart.style.setProperty(
                '--audio-glow',
                glow.toFixed(3)
            );
        }

        animationFrameId =
            window.requestAnimationFrame(updateHeartFromAudio);
    }

    /*
     * شروع تحلیل صدا
     */
    async function startAudioAnalysis() {
        if (
            !voiceAudio ||
            prefersReducedMotion.matches ||
            !audioIsPlaying
        ) {
            return;
        }

        if (!setupAudioAnalysis() || !audioContext) {
            return;
        }

        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            if (
                voiceAudio.paused ||
                voiceAudio.ended ||
                audioContext.state !== 'running'
            ) {
                return;
            }

            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }

            animationFrameId =
                window.requestAnimationFrame(updateHeartFromAudio);
        } catch (error) {
            console.warn('Could not start audio analysis:', error);
        }
    }

    /*
     * توقف تحلیل صدا
     */
    function stopAudioAnalysis() {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        resetHeartScale();
    }

    /*
     * پخش و توقف صدا با کلیک روی قلب
     */
    async function toggleVoicePlayback() {
        if (!voiceAudio || isStartingPlayback) return;

        if (!voiceAudio.paused && !voiceAudio.ended) {
            voiceAudio.pause();
            return;
        }

        const requestId = ++playbackRequestId;

        isStartingPlayback = true;

        try {
            if (voiceAudio.ended) {
                voiceAudio.currentTime = 0;
            }

            await voiceAudio.play();
        } catch (error) {
            console.warn('Audio playback failed:', error);

            if (requestId === playbackRequestId) {
                showMessage(
                    'صدای من پخش نشد. مطمئن شو فایل my-voice.mp3 در مسیر درست قرار دارد.'
                );
            }
        } finally {
            if (requestId === playbackRequestId) {
                isStartingPlayback = false;
            }
        }
    }

    /*
     * کنترل قلب با ماوس، لمس و صفحه‌کلید
     */
    if (mainHeart) {
        mainHeart.style.cursor = 'pointer';
        mainHeart.style.pointerEvents = 'auto';
        mainHeart.setAttribute('role', 'button');
        mainHeart.setAttribute('tabindex', '0');
        mainHeart.setAttribute('aria-label', 'پخش صدای من');
        mainHeart.setAttribute('aria-pressed', 'false');

        mainHeart.addEventListener('click', toggleVoicePlayback);

        mainHeart.addEventListener('keydown', event => {
            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();
                toggleVoicePlayback();
            }
        });
    }

    /*
     * واکنش به تغییر تنظیم کاهش حرکت دستگاه
     */
    prefersReducedMotion.addEventListener?.('change', () => {
        if (prefersReducedMotion.matches) {
            stopAudioAnalysis();
            stopHeartEffects();
        } else if (voiceAudio && !voiceAudio.paused && !voiceAudio.ended) {
            startHeartEffects();
            startAudioAnalysis();
        }
    });

    /*
     * رویدادهای پخش صدا
     */
    if (voiceAudio) {
        voiceAudio.addEventListener('play', () => {
            setHeartPlayingState(true);
            startAudioAnalysis();
        });

        voiceAudio.addEventListener('pause', () => {
            setHeartPlayingState(false);
            stopAudioAnalysis();
        });

        voiceAudio.addEventListener('ended', () => {
            setHeartPlayingState(false);
            stopAudioAnalysis();

            if (audioNote) {
                audioNote.textContent =
                    'صدای من تموم شد؛ هر وقت دلت خواست دوباره پخشش کن ❤️';
            }
        });

        voiceAudio.addEventListener('error', () => {
            setHeartPlayingState(false);
            stopAudioAnalysis();

            showMessage(
                'فایل صوتی پیدا نشد یا قابل پخش نیست. مسیر و فرمت فایل را بررسی کن.'
            );

            if (audioNote) {
                audioNote.textContent =
                    'فایل my-voice.mp3 را در پوشه assets/audio قرار بده.';
            }
        });

        voiceAudio.addEventListener('loadedmetadata', () => {
            if (audioNote && !voiceAudio.error) {
                audioNote.textContent =
                    'همه‌چیز آماده‌ست؛ روی قلب بزن تا صدای من پخش بشه ❤️';
            }
        });

        voiceAudio.addEventListener('waiting', () => {
            if (audioNote) {
                audioNote.textContent =
                    'یک لحظه صبر کن تا صدا آماده بشه…';
            }
        });

        voiceAudio.addEventListener('canplay', () => {
            if (audioNote && voiceAudio.paused && !voiceAudio.ended) {
                audioNote.textContent =
                    'صدا آماده‌ی پخشه؛ منتظرتم ❤️';
            }
        });
    }

    /*
     * بازگشت به صفحه درخت
     */
    if (backButton) {
        backButton.addEventListener('click', () => {
            backButton.disabled = true;
            backButton.setAttribute('aria-busy', 'true');

            backButton.innerHTML =
                '<span aria-hidden="true">♡</span> داریم برمی‌گردیم...';

            window.location.href = 'tree.html';
        });
    }

    /*
     * مدیریت تغییر اندازه پنجره
     */
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            const currentMobileState = isMobile();

            if (currentMobileState !== previousMobileState) {
                previousMobileState = currentMobileState;

                createStars();
                createFloatingLights();
                createHeartSparkles();

                if (audioIsPlaying) {
                    stopHeartEffects();
                    startHeartEffects();
                }
            }
        }, 250);
    });

    /*
     * مدیریت بازگشت به تب صفحه
     */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAudioAnalysis();
        } else if (
            voiceAudio &&
            !voiceAudio.paused &&
            !voiceAudio.ended
        ) {
            startAudioAnalysis();
        }
    });

    /*
     * ساخت اولیه
     */
    createStars();
    createFloatingLights();
    createHeartSparkles();
    createHeartEffectsContainer();

    setHeartPlayingState(false);

    document.documentElement.classList.add('page-ready');
});