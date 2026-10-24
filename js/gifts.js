"use strict";

(() => {
    // اطلاعات شش کادو
    const gifts = [
        {
            title: "اولین سورپرایز ❤️",
            image: "../assets/images/gifts/gift-1.jpg",
            message: "این کادو رو با کلی ذوق برای تو انتخاب کردم ماه من ❤️"
        },
        {
            title: "یه کادوی مخصوص تو 🎀",
            image: "../assets/images/gifts/gift-2.jpg",
            message: "دلم می‌خواست یه چیز قشنگ داشته باشی که با دیدنش لبخند بزنی 🥹"
        },
        {
            title: "برای لبخندت 💗",
            image: "../assets/images/gifts/gift-3.jpg",
            message: "امیدوارم این هدیه یکی از دلیل‌های لبخند قشنگت باشه ❤️"
        },
        {
            title: "یه یادگاری قشنگ 🌷",
            image: "../assets/images/gifts/gift-4.jpg",
            message: "اینم یه یادگاری کوچولو که با عشق برات کنار گذاشتم 💋"
        },
        {
            title: "از ته دلم برای تو 💝",
            image: "../assets/images/gifts/gift-5.jpg",
            message: "برای تو که بودنت خیلی از لحظه‌های دنیام رو قشنگ‌تر کرده ❤️"
        },
        {
            title: "آخرین سورپرایز 🎁",
            image: "../assets/images/gifts/gift-6.jpg",
            message: "اینم آخرین کادوی این صفحه برای ماه زیبای من ❤️"
        }
    ];

    const giftCards = document.querySelectorAll(".gift-card");
    const giftModal = document.getElementById("giftModal");
    const closeModalButton = document.getElementById("closeModal");
    const backToGiftsButton = document.getElementById("backToGifts");

    const modalTitle = document.getElementById("modalTitle");
    const giftPhoto = document.getElementById("giftPhoto");
    const giftMessage = document.getElementById("giftMessage");

    const giftsVoice = document.getElementById("giftsVoice");
    const voiceButton = document.getElementById("voiceButton");
    const voiceStatus = document.getElementById("voiceStatus");

    const backgroundHearts = document.getElementById("backgroundHearts");

    let activeGiftCard = null;
    let previousFocus = null;

    // رنگ‌های قلب‌های رنگارنگ
    const heartColors = [
        "#ff4f91",
        "#ff78b7",
        "#ffb3d9",
        "#c58aff",
        "#a88bff",
        "#ff6b6b",
        "#ff9f43",
        "#ffd166",
        "#ff5d8f",
        "#d291ff",
        "#ff85a1",
        "#f7b2e0",
        "#ff3d81",
        "#b388ff",
        "#ffcc70",
        "#ff6f91"
    ];

    // ایجاد انفجار قلب‌های رنگی اطراف عکس
    function burstColorHearts() {
        const frame = document.querySelector(".gift-photo-frame");

        if (!frame) return;

        // حذف قلب‌های قبلی
        frame.querySelectorAll(".color-heart").forEach((heart) => {
            heart.remove();
        });

        // اجرای دوباره انیمیشن ظاهر شدن عکس
        frame.classList.remove("photo-reveal");
        void frame.offsetWidth;
        frame.classList.add("photo-reveal");

        // تعداد قلب‌های انفجاری
        const heartCount = 42;

        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement("span");

            heart.className = "color-heart";

            // ترکیبی از قلب‌های توپر و توخالی
            heart.textContent = Math.random() > 0.22 ? "♥" : "♡";

            // جهت و فاصله تصادفی حرکت
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 220;

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            // انتخاب رنگ و اندازه تصادفی
            const color =
                heartColors[
                    Math.floor(Math.random() * heartColors.length)
                ];

            const size = 13 + Math.random() * 23;
            const duration = 1.1 + Math.random() * 1.1;
            const rotation = Math.floor(Math.random() * 140) - 70;
            const delay = Math.random() * 0.22;

            heart.style.color = color;
            heart.style.fontSize = `${size}px`;

            heart.style.setProperty("--heart-x", `${x}px`);
            heart.style.setProperty("--heart-y", `${y}px`);
            heart.style.setProperty(
                "--heart-rotation",
                `${rotation}deg`
            );
            heart.style.setProperty(
                "--heart-duration",
                `${duration}s`
            );

            heart.style.animationDelay = `${delay}s`;

            frame.appendChild(heart);

            // حذف قلب بعد از پایان انیمیشن
            heart.addEventListener(
                "animationend",
                () => {
                    heart.remove();
                },
                { once: true }
            );
        }
    }

    // باز کردن کادو با انیمیشن تکان خوردن و انفجار قلب‌ها
    function openGift(index, card) {
        const gift = gifts[index];

        if (!gift) return;

        // جلوگیری از کلیک چندباره هنگام تکان خوردن
        if (card.classList.contains("shaking")) return;

        // اگر کادوی دیگری باز است، از ادامه کار جلوگیری کن
        if (!giftModal.hidden) return;

        previousFocus = document.activeElement;
        activeGiftCard = card;

        // مرحله اول: آماده‌سازی جعبه
        card.classList.remove("opening", "shaking");
        void card.offsetWidth;

        // شروع تکان خوردن جعبه
        card.classList.add("shaking");

        // نمایش عنوان و پیام کادو
        modalTitle.textContent = gift.title;
        giftMessage.textContent = gift.message;

        // پاک‌سازی عکس و قلب‌های قبلی
        giftPhoto.onload = null;
        giftPhoto.onerror = null;

        giftPhoto.classList.remove("image-error");
        giftPhoto.removeAttribute("src");
        giftPhoto.alt = gift.title;

        const frame = document.querySelector(".gift-photo-frame");

        if (frame) {
            frame.querySelectorAll(".color-heart").forEach((heart) => {
                heart.remove();
            });

            frame.classList.remove("photo-reveal");
        }

        let animationStarted = false;

        // مرحله دوم: نمایش کادو پس از پایان تکان خوردن
        function revealGiftPhoto() {
            if (animationStarted) return;

            animationStarted = true;

            window.setTimeout(() => {
                card.classList.remove("shaking");
                card.classList.add("opening");

                // نمایش پنجره کادو
                giftModal.hidden = false;
                document.body.style.overflow = "hidden";

                // انفجار قلب‌ها کمی بعد از ظاهر شدن عکس
                window.setTimeout(() => {
                    if (
                        !giftPhoto.classList.contains("image-error") &&
                        giftPhoto.complete &&
                        giftPhoto.naturalWidth > 0 &&
                        !giftModal.hidden
                    ) {
                        burstColorHearts();
                    }
                }, 180);

                closeModalButton.focus();
            }, 850);
        }

        // اگر عکس با موفقیت بارگذاری شد
        giftPhoto.onload = () => {
            revealGiftPhoto();
        };

        // اگر عکس پیدا نشد یا بارگذاری آن شکست خورد
        giftPhoto.onerror = () => {
            giftPhoto.classList.add("image-error");

            console.error(
                "عکس کادو بارگذاری نشد. مسیر فایل را بررسی کن:",
                gift.image
            );

            giftMessage.textContent =
                gift.message +
                " — عکس نمایش داده نشد. نام فایل و مسیر آن را بررسی کن.";

            revealGiftPhoto();
        };

        // بارگذاری عکس کادو
        giftPhoto.src = gift.image;

        // اگر عکس از قبل در حافظه مرورگر بارگذاری شده باشد
        if (giftPhoto.complete && giftPhoto.naturalWidth > 0) {
            revealGiftPhoto();
        }
    }

    // بستن پنجره و برگشت به شش جعبه
    function closeGift() {
        giftModal.hidden = true;
        document.body.style.overflow = "";

        // پاک کردن قلب‌های عکس هنگام بستن
        const frame = document.querySelector(".gift-photo-frame");

        if (frame) {
            frame.querySelectorAll(".color-heart").forEach((heart) => {
                heart.remove();
            });

            frame.classList.remove("photo-reveal");
        }

        if (activeGiftCard) {
            activeGiftCard.classList.remove("opening", "shaking");
            activeGiftCard.focus();
        } else if (previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }

        activeGiftCard = null;
    }

    // اتصال کلیک به شش جعبه
    giftCards.forEach((card) => {
        card.addEventListener("click", () => {
            const index = Number(card.dataset.gift);

            openGift(index, card);
        });
    });

    // دکمه‌های بستن پنجره
    closeModalButton.addEventListener("click", closeGift);
    backToGiftsButton.addEventListener("click", closeGift);

    // بستن با کلیک روی فضای بیرون پنجره
    giftModal.addEventListener("click", (event) => {
        if (event.target === giftModal) {
            closeGift();
        }
    });

    // بستن با کلید Escape
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !giftModal.hidden) {
            closeGift();
        }
    });

    // قلب‌های متحرک پس‌زمینه
    function createHeart() {
        if (!backgroundHearts) return;

        // محدود کردن تعداد قلب‌های پس‌زمینه
        if (backgroundHearts.childElementCount >= 18) return;

        const heart = document.createElement("span");

        heart.className = "floating-heart";
        heart.textContent = Math.random() > 0.5 ? "♥" : "♡";

        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${12 + Math.random() * 20}px`;
        heart.style.animationDuration = `${9 + Math.random() * 9}s`;

        backgroundHearts.appendChild(heart);

        heart.addEventListener(
            "animationend",
            () => {
                heart.remove();
            },
            { once: true }
        );
    }

    // ساخت اولیه قلب‌های پس‌زمینه
    for (let i = 0; i < 10; i++) {
        window.setTimeout(createHeart, i * 350);
    }

    // ادامه ساخت قلب‌ها
    const heartInterval = window.setInterval(createHeart, 900);

    // توقف تایمر هنگام ترک صفحه
    window.addEventListener(
        "pagehide",
        () => {
            window.clearInterval(heartInterval);
        },
        { once: true }
    );

    // پخش و توقف وویس
    async function playVoice() {
        try {
            voiceStatus.textContent =
                "در حال پخش صدای مخصوص تو... ❤️";

            await giftsVoice.play();

            voiceButton.textContent = "⏸ توقف صدا";

            voiceStatus.textContent =
                "صدای مخصوص تو در حال پخشه ❤️";
        } catch (error) {
            console.warn("پخش صدا انجام نشد:", error);

            if (error.name === "NotAllowedError") {
                voiceStatus.textContent =
                    "برای شنیدن صدا روی دکمه پخش بزن ❤️";
            } else {
                voiceStatus.textContent =
                    "صدا پخش نشد. نام فایل و مسیر آن را بررسی کن.";
            }
        }
    }

    // تلاش برای پخش خودکار صدا هنگام ورود به صفحه
    giftsVoice.volume = 0.8;

    giftsVoice.play()
        .then(() => {
            voiceButton.textContent = "⏸ توقف صدا";

            voiceStatus.textContent =
                "صدای مخصوص تو در حال پخشه ❤️";
        })
        .catch((error) => {
            console.info(
                "پخش خودکار ممکن است توسط مرورگر مسدود شده باشد:",
                error
            );

            voiceStatus.textContent =
                "برای شنیدن صدای مخصوصت روی دکمه پخش بزن ❤️";
        });

    // کنترل پخش و توقف صدا
    voiceButton.addEventListener("click", async () => {
        if (giftsVoice.paused) {
            await playVoice();
        } else {
            giftsVoice.pause();

            voiceButton.textContent = "🎵 پخش صدای مخصوص تو";
            voiceStatus.textContent = "پخش صدا متوقف شد.";
        }
    });

    // مدیریت خطای فایل صوتی
    giftsVoice.addEventListener("error", () => {
        voiceStatus.textContent =
            "فایل وویس بارگذاری نشد. مسیر و فرمت فایل را بررسی کن.";
    });

    // تغییر دکمه پس از اتمام صدا
    giftsVoice.addEventListener("ended", () => {
        voiceButton.textContent = "🎵 پخش صدای مخصوص تو";
        voiceStatus.textContent = "صدای مخصوصت تموم شد ❤️";
    });

    // هماهنگی دکمه با توقف صدا از کنترل‌های دیگر
    giftsVoice.addEventListener("pause", () => {
        if (!giftsVoice.ended) {
            voiceButton.textContent = "🎵 پخش صدای مخصوص تو";
        }
    });

    giftsVoice.addEventListener("play", () => {
        voiceButton.textContent = "⏸ توقف صدا";
    });
})();