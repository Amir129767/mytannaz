"use strict";

(() => {
    const backgroundHearts = document.getElementById("backgroundHearts");

    const photoModal = document.getElementById("photoModal");
    const expandedPhoto = document.getElementById("expandedPhoto");
    const closePhotoModal = document.getElementById("closePhotoModal");

    const memoryPhotos = document.querySelectorAll(".memory-photo");
    const memoriesTimeline = document.getElementById("memoriesTimeline");

    let previousFocus = null;
    let heartInterval = null;

    // =====================================================
    // بارگذاری متن ۱۰ خاطره از فایل‌های TXT
    // =====================================================

    async function loadMemories() {
        if (!memoriesTimeline) return;

        const memoryCards = memoriesTimeline.querySelectorAll(".memory-card");

        const loadTasks = Array.from(memoryCards).map(
            async (card, index) => {
                const memoryNumber = index + 1;
                const memoryFile = `../content/memory-${memoryNumber}.txt`;

                const memoryContent = card.querySelector(".memory-content");

                if (!memoryContent) return;

                // پیدا کردن پاراگراف متن خاطره
                const description = memoryContent.querySelector("p");

                if (!description) return;

                try {
                    const response = await fetch(memoryFile, {
                        cache: "no-cache"
                    });

                    if (!response.ok) {
                        throw new Error(
                            `خطا در دریافت فایل ${memoryFile}: ${response.status}`
                        );
                    }

                    const text = await response.text();

                    if (!text.trim()) {
                        throw new Error(
                            `فایل خاطره شماره ${memoryNumber} خالی است.`
                        );
                    }

                    // حفظ پاراگراف‌های جداگانه داخل فایل متنی
                    const paragraphs = text
                        .replace(/\r\n/g, "\n")
                        .trim()
                        .split(/\n\s*\n/)
                        .map((paragraph) => paragraph.trim())
                        .filter(Boolean);

                    const fragment = document.createDocumentFragment();

                    paragraphs.forEach((paragraphText) => {
                        const paragraph = document.createElement("p");

                        paragraph.textContent = paragraphText
                            .replace(/\n/g, " ");

                        fragment.appendChild(paragraph);
                    });

                    // جایگزینی متن پیش‌فرض با متن فایل TXT
                    description.replaceWith(fragment);

                } catch (error) {
                    console.error(
                        `خطا در بارگذاری خاطره شماره ${memoryNumber}:`,
                        error
                    );

                    // در صورت خطا، کارت‌های دیگر همچنان بارگذاری می‌شوند.
                    description.textContent =
                        "فعلاً امکان نمایش این خاطره وجود ندارد. ❤️";
                }
            }
        );

        await Promise.all(loadTasks);
    }

    // شروع بارگذاری خاطرات
    loadMemories();

    // =====================================================
    // قلب‌های شناور پس‌زمینه
    // =====================================================

    function createHeart() {
        if (!backgroundHearts) return;

        if (backgroundHearts.childElementCount >= 22) return;

        const heart = document.createElement("span");

        heart.className = "floating-heart";
        heart.textContent = Math.random() > 0.4 ? "♥" : "♡";

        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${12 + Math.random() * 22}px`;
        heart.style.animationDuration = `${10 + Math.random() * 10}s`;

        backgroundHearts.appendChild(heart);

        heart.addEventListener(
            "animationend",
            () => heart.remove(),
            { once: true }
        );
    }

    // ساخت قلب‌های اولیه
    for (let i = 0; i < 10; i++) {
        window.setTimeout(createHeart, i * 400);
    }

    heartInterval = window.setInterval(createHeart, 1000);

    // =====================================================
    // باز کردن عکس در اندازه بزرگ
    // =====================================================

    function openPhoto(photo) {
        if (!photoModal || !expandedPhoto) return;

        if (!photo.complete || photo.naturalWidth === 0) {
            return;
        }

        previousFocus = document.activeElement;

        expandedPhoto.src = photo.src;
        expandedPhoto.alt = photo.alt || "عکس خاطره ما";

        photoModal.hidden = false;
        document.body.style.overflow = "hidden";

        if (closePhotoModal) {
            closePhotoModal.focus();
        }
    }

    // =====================================================
    // بستن عکس بزرگ
    // =====================================================

    function closePhoto() {
        if (!photoModal) return;

        photoModal.hidden = true;
        document.body.style.overflow = "";

        if (expandedPhoto) {
            expandedPhoto.removeAttribute("src");
        }

        if (
            previousFocus &&
            typeof previousFocus.focus === "function"
        ) {
            previousFocus.focus();
        }
    }

    // =====================================================
    // کلیک روی عکس‌ها
    // =====================================================

    memoryPhotos.forEach((photo) => {
        photo.addEventListener("click", () => {
            openPhoto(photo);
        });

        // اگر عکس وجود نداشته باشد، جای خالی مشخص باشد
        photo.addEventListener("error", () => {
            photo.style.visibility = "hidden";

            photo.closest(".polaroid")?.classList.add("missing-photo");
        });
    });

    // =====================================================
    // بستن عکس بزرگ
    // =====================================================

    if (closePhotoModal) {
        closePhotoModal.addEventListener("click", closePhoto);
    }

    // بستن با کلیک روی فضای بیرون عکس
    if (photoModal) {
        photoModal.addEventListener("click", (event) => {
            if (event.target === photoModal) {
                closePhoto();
            }
        });
    }

    // بستن عکس با Escape
    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            photoModal &&
            !photoModal.hidden
        ) {
            closePhoto();
        }
    });

    // =====================================================
    // توقف تایمر قلب‌ها هنگام ترک صفحه
    // =====================================================

    window.addEventListener(
        "pagehide",
        () => {
            if (heartInterval !== null) {
                window.clearInterval(heartInterval);
                heartInterval = null;
            }
        },
        { once: true }
    );
})();