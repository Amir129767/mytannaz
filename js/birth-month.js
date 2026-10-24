'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const starsContainer = document.getElementById('stars');
    const lightsContainer = document.getElementById('floatingLights');
    const backButton = document.getElementById('backToTreeButton');
    const pageMessage = document.getElementById('pageMessage');
    const voiceAudio = document.getElementById('tannazVoice');

    let messageTimeout = null;

    /*
     * نمایش پیام راهنما
     */
    function showMessage(message) {
        if (!pageMessage) return;

        pageMessage.textContent = message;
        pageMessage.hidden = false;

        clearTimeout(messageTimeout);

        messageTimeout = setTimeout(() => {
            pageMessage.hidden = true;
        }, 3500);
    }

    /*
     * ساخت ستاره‌های آسمان
     */
    function createStars() {
        if (!starsContainer) return;

        starsContainer.replaceChildren();

        const starCount = window.innerWidth <= 600 ? 45 : 75;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('span');

            star.className = 'star';
            star.setAttribute('aria-hidden', 'true');

            star.textContent = Math.random() > 0.5 ? '✦' : '·';

            const size = Math.random() * 10 + 5;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * -5;

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.fontSize = `${size}px`;

            star.style.setProperty(
                '--duration',
                `${duration}s`
            );

            star.style.animationDelay = `${delay}s`;
            star.style.opacity = (Math.random() * 0.65 + 0.2).toFixed(2);

            fragment.appendChild(star);
        }

        starsContainer.appendChild(fragment);
    }

    /*
     * ساخت نورهای شناور
     */
    function createFloatingLights() {
        if (!lightsContainer) return;

        lightsContainer.replaceChildren();

        const lightCount = window.innerWidth <= 600 ? 12 : 22;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < lightCount; i++) {
            const light = document.createElement('span');

            light.className = 'light';
            light.setAttribute('aria-hidden', 'true');

            const duration = Math.random() * 7 + 6;
            const delay = Math.random() * -12;
            const size = Math.random() * 4 + 3;

            light.style.left = `${Math.random() * 100}%`;
            light.style.width = `${size}px`;
            light.style.height = `${size}px`;

            light.style.setProperty(
                '--duration',
                `${duration}s`
            );

            light.style.animationDelay = `${delay}s`;

            fragment.appendChild(light);
        }

        lightsContainer.appendChild(fragment);
    }

    /*
     * جلوگیری از اجرای بی‌دلیل دوباره افکت‌ها هنگام تغییر اندازه
     */
    let resizeTimeout = null;
    let previousMobileState = window.innerWidth <= 600;

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            const currentMobileState = window.innerWidth <= 600;

            if (currentMobileState !== previousMobileState) {
                previousMobileState = currentMobileState;

                createStars();
                createFloatingLights();
            }
        }, 250);
    });

    /*
     * مدیریت خطای بارگذاری عکس‌ها
     */
    function setupImages() {
        const images = document.querySelectorAll('.tannaz-photo');

        images.forEach((image) => {
            image.addEventListener('error', () => {
                image.classList.add('image-unavailable');

                showMessage(
                    'عکس پیدا نشد. مسیر و نام فایل عکس را بررسی کن.'
                );
            });

            image.addEventListener('load', () => {
                image.classList.remove('image-unavailable');
            });
        });
    }

    /*
     * مدیریت خطای فایل صوتی
     */
    if (voiceAudio) {
        voiceAudio.addEventListener('error', () => {
            showMessage(
                'فایل صوتی پیدا نشد. مسیر فایل صدای خودت را بررسی کن.'
            );
        });
    }

    /*
     * برگشت به صفحه درخت قلب‌ها
     */
    if (backButton) {
        backButton.addEventListener('click', () => {
            backButton.disabled = true;

            backButton.setAttribute('aria-busy', 'true');

            backButton.innerHTML =
                '<span aria-hidden="true">♡</span> داریم برمی‌گردیم...';

            /*
             * مسیر صفحه درخت نسبت به پوشه pages است.
             */
            window.location.href = 'tree.html';
        });
    }

    /*
     * شروع افکت‌های صفحه
     */
    createStars();
    createFloatingLights();
    setupImages();

    /*
     * نمایش صفحه پس از بارگذاری اولیه
     */
    document.documentElement.classList.add('page-ready');
});