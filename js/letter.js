"use strict";

document.addEventListener("DOMContentLoaded", initializeLoveLetter);

function initializeLoveLetter() {
    const scene = document.getElementById("envelopeScene");
    const envelopeButton = document.getElementById("envelopeButton");
    const envelope3D = document.getElementById("envelope3D");
    const envelopeSeal = document.getElementById("envelopeSeal");
    const envelopeInstruction = document.getElementById("envelopeInstruction");
    const openMessage = document.getElementById("envelopeOpenMessage");

    const starsContainer = document.getElementById("letterStars");
    const floatingHeartsContainer = document.getElementById("letterFloatingHearts");
    const particlesContainer = document.getElementById("letterParticles");

    const loveLetter = document.getElementById("loveLetter");
    const loveLetterText = document.getElementById("loveLetterText");
        /* =====================================
       بارگذاری متن نامه از فایل متنی
    ===================================== */

    async function loadLoveLetterText() {
        try {
            const response = await fetch("../content/letter.txt", {
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error(`خطای دریافت فایل نامه: ${response.status}`);
            }

            const text = await response.text();

            if (!text.trim()) {
                throw new Error("فایل نامه خالی است.");
            }

            const paragraphs = text
                .replace(/\r\n/g, "\n")
                .split(/\n\s*\n/)
                .map(paragraph => paragraph.trim())
                .filter(Boolean);

            const fragment = document.createDocumentFragment();

            for (const paragraphText of paragraphs) {
                const paragraph = document.createElement("p");
                paragraph.className = "letter-paragraph";
                paragraph.textContent = paragraphText.replace(/\n/g, " ");
                fragment.appendChild(paragraph);
            }

            loveLetterText.replaceChildren(fragment);

            return true;
        } catch (error) {
            console.error("خطا در بارگذاری متن نامه:", error);
            return false;
        }
    }
    const leftHearts = document.getElementById("letterSideHeartsLeft");
    const rightHearts = document.getElementById("letterSideHeartsRight");

    if (
        !scene ||
        !envelopeButton ||
        !envelope3D ||
        !envelopeSeal ||
        !loveLetter ||
        !loveLetterText ||
        !leftHearts ||
        !rightHearts
    ) {
        console.error("Love Letter: عناصر مورد نیاز پیدا نشدند.");
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const HEART_COLORS = [
        "#ff4f9a",
        "#ff79bb",
        "#ffb6dc",
        "#d69aff",
        "#a98aff",
        "#ffdf79",
        "#ffffff",
        "#ff6b6b",
        "#ff9e80"
    ];

    const HEART_SYMBOLS = ["♥", "♡", "❤", "💗", "💕", "💖"];

    let isOpening = false;
    let isOpen = false;

    let backgroundIntervals = [];
    let celebrationIntervals = [];
    let timeouts = new Set();

    let floatingHeartCount = 0;

    const MAX_BACKGROUND_HEARTS = 28;
    const MAX_SIDE_HEARTS = 44;
    const MAX_PARTICLES = 100;

    /* =====================================
       ابزارهای کمکی
    ===================================== */

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function choose(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function schedule(callback, delay) {
        const id = window.setTimeout(() => {
            timeouts.delete(id);
            callback();
        }, delay);

        timeouts.add(id);

        return id;
    }

    function startInterval(callback, delay, collection) {
        const id = window.setInterval(callback, delay);
        collection.push(id);
        return id;
    }

    function clearIntervals(collection) {
        collection.forEach(clearInterval);
        collection.length = 0;
    }

    function clearAllTimers() {
        clearIntervals(backgroundIntervals);
        clearIntervals(celebrationIntervals);

        timeouts.forEach(clearTimeout);
        timeouts.clear();
    }

    function makeElement(tag, className, parent) {
        const element = document.createElement(tag);

        element.className = className;

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }

    /* =====================================
       ستاره‌های پس‌زمینه
    ===================================== */

    function createStars() {
        if (!starsContainer) return;

        const fragment = document.createDocumentFragment();

        const count = window.innerWidth < 600 ? 45 : 80;

        for (let i = 0; i < count; i++) {
            const star = document.createElement("span");

            star.className = "letter-star";

            star.style.left = `${random(1, 99)}%`;
            star.style.top = `${random(1, 99)}%`;

            star.style.setProperty(
                "--star-size",
                `${random(1, 3.5)}px`
            );

            star.style.setProperty(
                "--star-opacity",
                random(0.3, 0.95).toFixed(2)
            );

            star.style.setProperty(
                "--star-duration",
                `${random(1.5, 4.5)}s`
            );

            star.style.setProperty(
                "--star-delay",
                `${random(-4, 0)}s`
            );

            fragment.appendChild(star);
        }

        starsContainer.replaceChildren(fragment);
    }

    /* =====================================
       قلب‌های شناور پس‌زمینه
    ===================================== */

    function createBackgroundHeart() {
        if (!floatingHeartsContainer || reducedMotion) return;

        if (floatingHeartCount >= MAX_BACKGROUND_HEARTS) return;

        floatingHeartCount++;

        const heart = makeElement(
            "span",
            "letter-floating-heart",
            floatingHeartsContainer
        );

        heart.textContent = choose(["♥", "♡", "❤", "ღ"]);

        heart.style.setProperty("--heart-left", `${random(2, 98)}%`);

        heart.style.setProperty(
            "--floating-heart-size",
            `${random(12, 25)}px`
        );

        heart.style.setProperty(
            "--floating-heart-duration",
            `${random(9, 16)}s`
        );

        heart.style.setProperty(
            "--floating-heart-delay",
            "0s"
        );

        heart.style.setProperty(
            "--floating-heart-color",
            choose(HEART_COLORS)
        );

        heart.style.setProperty(
            "--heart-drift",
            `${random(-70, 70)}px`
        );

        heart.style.setProperty(
            "--heart-drift-end",
            `${random(-60, 60)}px`
        );

        heart.addEventListener("animationend", () => {
            heart.remove();

            floatingHeartCount = Math.max(
                0,
                floatingHeartCount - 1
            );
        }, { once: true });
    }

    function startBackgroundHearts() {
        if (reducedMotion) return;

        for (let i = 0; i < 10; i++) {
            schedule(createBackgroundHeart, i * 180);
        }

        startInterval(
            createBackgroundHeart,
            800,
            backgroundIntervals
        );
    }

    /* =====================================
       انفجار قلب و ذرات
    ===================================== */

    function createHeartExplosion(originElement, amount = 35) {
        if (!particlesContainer || reducedMotion) return;

        const rect = originElement.getBoundingClientRect();

        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        const available = Math.max(
            0,
            MAX_PARTICLES - particlesContainer.childElementCount
        );

        const count = Math.min(amount, available);

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const particle = document.createElement("span");

            particle.className = "letter-particle";
            particle.textContent = choose(HEART_SYMBOLS);

            const angle = random(0, Math.PI * 2);
            const distance = random(50, 210);

            particle.style.setProperty("--particle-left", `${originX}px`);
            particle.style.setProperty("--particle-top", `${originY}px`);

            particle.style.setProperty(
                "--particle-x",
                `${Math.cos(angle) * distance}px`
            );

            particle.style.setProperty(
                "--particle-y",
                `${Math.sin(angle) * distance}px`
            );

            particle.style.setProperty(
                "--particle-size",
                `${random(10, 22)}px`
            );

            particle.style.setProperty(
                "--particle-duration",
                `${random(0.8, 1.6)}s`
            );

            particle.style.setProperty(
                "--particle-color",
                choose(HEART_COLORS)
            );

            fragment.appendChild(particle);

            particle.addEventListener("animationend", () => {
                particle.remove();
            }, { once: true });
        }

        particlesContainer.appendChild(fragment);
    }

    /* =====================================
       قلب‌های رنگی دو طرف نامه
    ===================================== */

    function createSideHeart(side) {
        if (!isOpen || document.hidden) return;

        const parent = side === "left" ? leftHearts : rightHearts;

        if (parent.childElementCount >= MAX_SIDE_HEARTS / 2) {
            return;
        }

        const heart = makeElement(
            "span",
            "letter-burst-heart",
            parent
        );

        heart.textContent = choose(HEART_SYMBOLS);

        heart.style.setProperty(
            "--burst-color",
            choose(HEART_COLORS)
        );

        heart.style.setProperty(
            "--burst-size",
            `${random(15, 31)}px`
        );

        heart.style.setProperty(
            "--burst-duration",
            `${random(1.4, 2.6)}s`
        );

        heart.style.setProperty(
            "--burst-x",
            `${random(35, 150)}px`
        );

        heart.style.setProperty(
            "--burst-y",
            `${random(-160, 160)}px`
        );

        heart.style.setProperty(
            "--burst-rotation",
            `${random(-150, 150)}deg`
        );

        heart.addEventListener("animationend", () => {
            heart.remove();
        }, { once: true });
    }

    function burstFromBothSides(amount = 22) {
        if (!isOpen) return;

        for (let i = 0; i < amount; i++) {
            schedule(() => {
                createSideHeart("left");
                createSideHeart("right");
            }, i * 35);
        }
    }

    function startCelebration() {
        if (reducedMotion || celebrationIntervals.length > 0) return;

        burstFromBothSides(32);

        startInterval(() => {
            burstFromBothSides(7);
        }, 1050, celebrationIntervals);
    }

    /* =====================================
       باز شدن پاکت و نمایش نامه
    ===================================== */

    async function openEnvelope() {
        if (isOpening || isOpen) return;

        isOpening = true;
        envelopeButton.disabled = true;

        const letterLoaded = await loadLoveLetterText();

        if (!letterLoaded) {
            isOpening = false;
            envelopeButton.disabled = false;

            console.error(
                "نامه بارگذاری نشد. فایل content/letter.txt را بررسی کن."
            );

            return;
        }

        envelopeButton.disabled = true;

        envelopeButton.setAttribute("aria-expanded", "true");

        envelopeButton.setAttribute(
            "aria-label",
            "نامه باز شده است"
        );

        if (envelopeInstruction) {
            envelopeInstruction.setAttribute("aria-hidden", "true");
        }

        scene.classList.add("is-opening");

        createHeartExplosion(envelopeSeal, 45);

        schedule(() => {
            /*
             * پاکت به کنار می‌رود و دیگر روی نامه نیست.
             */
            scene.classList.add("is-open");

            isOpening = false;
            isOpen = true;

            /*
             * نمایش کادر مستقل نامه
             */
            loveLetter.hidden = false;
            loveLetter.setAttribute("aria-hidden", "false");

            /*
             * انیمیشن ورود نامه
             */
            requestAnimationFrame(() => {
                loveLetter.classList.add("is-visible");

                /*
                 * نامه به‌تدریج در مرکز دید قرار می‌گیرد.
                 */
                schedule(() => {
                    loveLetter.scrollIntoView({
                        behavior: reducedMotion ? "auto" : "smooth",
                        block: "center"
                    });
                }, 180);
            });

            if (openMessage) {
                openMessage.hidden = false;
            }

            /*
             * پاکت دیگر نباید قابل کلیک باشد.
             */
            envelopeButton.disabled = true;
            envelopeButton.tabIndex = -1;

            /*
             * انفجار قلب در محل پاکت
             */
            createHeartExplosion(envelopeSeal, 30);

            /*
             * بارش قلب‌های رنگی اطراف نامه
             */
            startCelebration();

        }, reducedMotion ? 20 : 850);
    }

    /* =====================================
       افکت سه‌بعدی پاکت
    ===================================== */

    function setupEnvelopeTilt() {
        if (reducedMotion) return;

        if (window.matchMedia("(hover: none)").matches) {
            return;
        }

        envelopeButton.addEventListener("pointermove", (event) => {
            if (isOpening || isOpen) return;

            const rect = envelopeButton.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            envelope3D.style.transform =
                `rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg)`;
        });

        envelopeButton.addEventListener("pointerleave", () => {
            if (isOpening || isOpen) return;

            envelope3D.style.transform = "";
        });
    }

    /* =====================================
       مدیریت تب مرورگر
    ===================================== */

    function handleVisibilityChange() {
        if (document.hidden) {
            clearIntervals(backgroundIntervals);
            clearIntervals(celebrationIntervals);
            return;
        }

        if (backgroundIntervals.length === 0 && !reducedMotion) {
            startBackgroundHearts();
        }

        if (
            isOpen &&
            celebrationIntervals.length === 0 &&
            !reducedMotion
        ) {
            startCelebration();
        }
    }

    /* =====================================
       راه‌اندازی
    ===================================== */

    envelopeButton.addEventListener("click", openEnvelope);

    createStars();

    startBackgroundHearts();

    setupEnvelopeTilt();

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    window.addEventListener("resize", createStars);

    window.addEventListener("pagehide", clearAllTimers);
}