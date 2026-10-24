'use strict';

// ========================================
// تنظیمات تقویم تولد طناز
// ========================================

const BIRTHDAY_YEAR = 1405;
const BIRTHDAY_MONTH = 8;
const BIRTHDAY_DAY = 16;

// تاریخ هدف: ساعت ۰۰:۰۰ روز ۱۶ آبان به وقت ایران
const BIRTHDAY_TIME_HOUR = 0;
const BIRTHDAY_TIME_MINUTE = 0;

// منطقه زمانی ایران
const IRAN_TIME_ZONE = 'Asia/Tehran';

// نام ماه‌های تقویم شمسی
const MONTH_NAMES = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند'
];

// روزهای هفته با شروع از شنبه
const WEEKDAY_NAMES = [
    'شنبه',
    'یکشنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنجشنبه',
    'جمعه'
];

// تنظیمات انیمیشن جشن
const CELEBRATION_SETTINGS = {
    confettiCount: 150,
    heartCount: 55,
    balloonCount: 22,
    heartExplosionCount: 5,
    heartExplosionInterval: 1100
};

let countdownInterval = null;
let celebrationIntervals = [];
let celebrationTimeouts = [];

let celebrationStarted = false;
let isMuted = false;
// ========================================
// جشن پس‌زمینه بدون نمایش کارت بزرگ تولد
// ========================================

function startBackgroundBirthdayCelebration() {
    const celebration = document.getElementById('birthdayCelebration');

    if (!celebration) {
        console.error('Birthday celebration element not found.');
        return;
    }

    // کارت جشن مخفی بماند اما کانتینر قلب‌ها فعال باشد
    celebration.classList.remove('active');
    celebration.classList.add('background-only');

    celebration.setAttribute('aria-hidden', 'true');

    // فعال کردن پس‌زمینه جشن تولد
    document.body.classList.add('birthday-party-active');

    // اجرای قلب‌ها، کاغذرنگی‌ها و بادکنک‌ها
    startPartyAnimations();

    // پخش آهنگ تولد
    playBirthdaySong();
}

// ========================================
// تبدیل اعداد انگلیسی به فارسی
// ========================================

function toPersianNumber(number) {
    return String(number).replace(/\d/g, digit => {
        return '۰۱۲۳۴۵۶۷۸۹'[Number(digit)];
    });
}


// ========================================
// تبدیل تاریخ شمسی به میلادی
// ========================================

function jalaliToGregorian(jy, jm, jd) {
    jy += 1595;

    let days =
        -355668 +
        (365 * jy) +
        Math.floor(jy / 33) * 8 +
        Math.floor(((jy % 33) + 3) / 4) +
        jd;

    if (jm < 7) {
        days += (jm - 1) * 31;
    } else {
        days += ((jm - 7) * 30) + 186;
    }

    let gy = 400 * Math.floor(days / 146097);

    days %= 146097;

    if (days > 36524) {
        gy += 100 * Math.floor(--days / 36524);
        days %= 36524;

        if (days >= 365) {
            days++;
        }
    }

    gy += 4 * Math.floor(days / 1461);

    days %= 1461;

    if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }

    let gd = days + 1;

    const isLeapYear =
        (gy % 4 === 0 && gy % 100 !== 0) ||
        gy % 400 === 0;

    const monthLengths = [
        0,
        31,
        isLeapYear ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    let gm = 1;

    while (
        gm <= 12 &&
        gd > monthLengths[gm]
    ) {
        gd -= monthLengths[gm];
        gm++;
    }

    return {
        year: gy,
        month: gm,
        day: gd
    };
}


// ========================================
// محاسبه روز هفته
// شنبه = ۰ و جمعه = ۶
// ========================================

function getPersianWeekday(jy, jm, jd) {
    const gregorian = jalaliToGregorian(jy, jm, jd);

    const date = new Date(
        Date.UTC(
            gregorian.year,
            gregorian.month - 1,
            gregorian.day
        )
    );

    return (date.getUTCDay() + 1) % 7;
}


// ========================================
// ساخت تقویم آبان
// ========================================

function createBirthdayCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonth = document.getElementById('calendarMonth');
    const calendarYear = document.getElementById('calendarYear');

    if (!calendarDays || !calendarMonth || !calendarYear) {
        console.error('عناصر تقویم پیدا نشدند.');
        return;
    }

    const year = BIRTHDAY_YEAR;
    const month = BIRTHDAY_MONTH;

    calendarMonth.textContent = MONTH_NAMES[month - 1];
    calendarYear.textContent = toPersianNumber(year);

    calendarDays.innerHTML = '';

    const numberOfDays = 30;

    const firstWeekday = getPersianWeekday(
        year,
        month,
        1
    );

    for (let i = 0; i < firstWeekday; i++) {
        const emptyCell = document.createElement('div');

        emptyCell.className = 'calendar-empty';
        emptyCell.setAttribute('aria-hidden', 'true');

        calendarDays.appendChild(emptyCell);
    }

    for (let day = 1; day <= numberOfDays; day++) {
        const dayCell = document.createElement('div');

        dayCell.className = 'calendar-day';
        dayCell.textContent = toPersianNumber(day);

        dayCell.setAttribute(
            'aria-label',
            `${toPersianNumber(day)} ${MONTH_NAMES[month - 1]} ${toPersianNumber(year)}`
        );

        if (day === BIRTHDAY_DAY) {
            dayCell.classList.add('birthday');

            dayCell.setAttribute(
                'aria-label',
                'روز تولد طناز، شانزدهم آبان ۱۴۰۵'
            );

            dayCell.setAttribute('title', 'تولد عشقممم ❤️');

            dayCell.setAttribute('aria-current', 'date');
        }

        calendarDays.appendChild(dayCell);
    }
}


// ========================================
// ساخت ستاره‌های آسمان
// ========================================

function createStars() {
    const starsContainer = document.getElementById('stars');

    if (!starsContainer) {
        return;
    }

    const starCount = window.innerWidth < 600 ? 65 : 115;

    starsContainer.innerHTML = '';

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('span');

        star.className = 'star';

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        const size = Math.random() * 2.5 + 1;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${2 + Math.random() * 4}s`;

        starsContainer.appendChild(star);
    }
}


// ========================================
// ساخت نورهای شناور
// ========================================

function createFloatingLights() {
    const container = document.getElementById('floatingLights');

    if (!container) {
        return;
    }

    const lightCount = window.innerWidth < 600 ? 12 : 22;

    container.innerHTML = '';

    for (let i = 0; i < lightCount; i++) {
        const light = document.createElement('span');

        light.className = 'floating-light';

        light.style.left = `${Math.random() * 100}%`;
        light.style.animationDuration = `${8 + Math.random() * 12}s`;
        light.style.animationDelay = `${Math.random() * 12}s`;

        const size = Math.random() * 4 + 3;

        light.style.width = `${size}px`;
        light.style.height = `${size}px`;

        container.appendChild(light);
    }
}


// ========================================
// تبدیل ساعت هدف ایران به زمان واقعی
//
// زمان هدف از منطقه زمانی Asia/Tehran
// محاسبه می‌شود تا وابسته به ساعت سیستم
// یا منطقه زمانی مرورگر نباشد.
// ========================================

function getBirthdayTargetTimestamp() {
    const gregorian = jalaliToGregorian(
        BIRTHDAY_YEAR,
        BIRTHDAY_MONTH,
        BIRTHDAY_DAY
    );

    /*
     * در تاریخ موردنظر، ساعت رسمی ایران UTC+03:30 است.
     * بنابراین ساعت ۰۰:۰۰ ایران برابر با ۲۰:۳۰ روز
     * قبل به وقت UTC خواهد بود.
     *
     * با دادن ساعت منفی به Date.UTC، روز قبل
     * به‌صورت خودکار محاسبه می‌شود.
     */

    return Date.UTC(
        gregorian.year,
        gregorian.month - 1,
        gregorian.day,
        BIRTHDAY_TIME_HOUR - 3,
        BIRTHDAY_TIME_MINUTE - 30,
        0,
        0
    );
}


// ========================================
// به‌روزرسانی شمارش معکوس
// ========================================

function updateCountdown() {
    const daysElement = document.getElementById('countdownDays');
    const hoursElement = document.getElementById('countdownHours');
    const minutesElement = document.getElementById('countdownMinutes');
    const secondsElement = document.getElementById('countdownSeconds');

    if (
        !daysElement ||
        !hoursElement ||
        !minutesElement ||
        !secondsElement
    ) {
        return;
    }

    const targetTimestamp = getBirthdayTargetTimestamp();
    const now = Date.now();

    let remainingMilliseconds = targetTimestamp - now;

    // اگر زمان تولد رسیده باشد
    if (remainingMilliseconds <= 0) {
        daysElement.textContent = '۰۰۰';
        hoursElement.textContent = '۰۰';
        minutesElement.textContent = '۰۰';
        secondsElement.textContent = '۰۰';

        if (countdownInterval !== null) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        startBirthdayCelebration();

        return;
    }

    const totalSeconds = Math.floor(
        remainingMilliseconds / 1000
    );

    const days = Math.floor(totalSeconds / 86400);

    const hours = Math.floor(
        (totalSeconds % 86400) / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    daysElement.textContent = toPersianNumber(
        String(days).padStart(3, '0')
    );

    hoursElement.textContent = toPersianNumber(
        String(hours).padStart(2, '0')
    );

    minutesElement.textContent = toPersianNumber(
        String(minutes).padStart(2, '0')
    );

    secondsElement.textContent = toPersianNumber(
        String(seconds).padStart(2, '0')
    );
}


// ========================================
// راه‌اندازی شمارش معکوس
// ========================================

function setupCountdown() {
    updateCountdown();

    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(() => {
        updateCountdown();
    }, 250);
}


// ========================================
// توقف تمام زمان‌بندی‌های جشن
// ========================================

function clearCelebrationAnimations() {
    celebrationIntervals.forEach(interval => {
        clearInterval(interval);
    });

    celebrationTimeouts.forEach(timeout => {
        clearTimeout(timeout);
    });

    celebrationIntervals = [];
    celebrationTimeouts = [];
}


// ========================================
// ساخت کاغذرنگی
// ========================================

function createConfetti(count = CELEBRATION_SETTINGS.confettiCount) {
    const container = document.getElementById('confettiContainer');

    if (!container) {
        return;
    }

    const colors = [
        '#ff3f9f',
        '#ffcf33',
        '#8d5cff',
        '#39c9ff',
        '#ff5b63',
        '#65db8a',
        '#ffffff',
        '#ff83bb'
    ];

    const shapes = [
        'rectangle',
        'circle',
        'star'
    ];

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('span');

        const shape = shapes[
            Math.floor(Math.random() * shapes.length)
        ];

        piece.className = 'confetti-piece';

        if (shape === 'circle') {
            piece.classList.add('circle');
        }

        if (shape === 'star') {
            piece.classList.add('star');
            piece.textContent = '✦';
        }

        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[
            Math.floor(Math.random() * colors.length)
        ];

        piece.style.setProperty(
            '--confetti-drift',
            `${Math.random() * 300 - 150}px`
        );

        piece.style.setProperty(
            '--confetti-rotation',
            `${Math.random() * 1000 - 500}deg`
        );

        piece.style.animationDuration = `${3 + Math.random() * 5}s`;
        piece.style.animationDelay = `${Math.random() * 2}s`;

        container.appendChild(piece);

        const timeout = setTimeout(() => {
            piece.remove();
        }, 10000);

        celebrationTimeouts.push(timeout);
    }
}


// ========================================
// انفجار قلب‌ها از یک نقطه
// ========================================

function createHeartExplosion(
    originX = 50,
    originY = 50,
    count = CELEBRATION_SETTINGS.heartCount
) {
    const container = document.getElementById('celebrationHearts');

    if (!container) {
        return;
    }

    const hearts = [
        '❤️',
        '💗',
        '💖',
        '💝',
        '💕',
        '💓',
        '💘',
        '💞'
    ];

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');

        heart.className = 'celebration-heart';

        heart.textContent = hearts[
            Math.floor(Math.random() * hearts.length)
        ];

        const angle = Math.random() * Math.PI * 2;

        const distance = 80 + Math.random() * 300;

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        heart.style.setProperty('--heart-x', `${originX}%`);
        heart.style.setProperty('--heart-y', `${originY}%`);

        heart.style.setProperty('--heart-dx', `${dx}px`);
        heart.style.setProperty('--heart-dy', `${dy}px`);

        heart.style.setProperty(
            '--heart-size',
            `${16 + Math.random() * 34}px`
        );

        heart.style.setProperty(
            '--heart-duration',
            `${1.8 + Math.random() * 1.8}s`
        );

        heart.style.setProperty(
            '--heart-rotation',
            `${Math.random() * 500 - 250}deg`
        );

        container.appendChild(heart);

        const timeout = setTimeout(() => {
            heart.remove();
        }, 4500);

        celebrationTimeouts.push(timeout);
    }
}


// ========================================
// قلب‌های شناور در تمام صفحه
// ========================================

function createFloatingHeart() {
    const container = document.getElementById('celebrationHearts');

    if (!container) {
        return;
    }

    const heart = document.createElement('span');

    const hearts = [
        '❤️',
        '💗',
        '💖',
        '💕',
        '💝'
    ];

    heart.className = 'celebration-heart';

    heart.textContent = hearts[
        Math.floor(Math.random() * hearts.length)
    ];

    const startX = Math.random() * 100;
    const startY = 90 + Math.random() * 15;

    heart.style.setProperty('--heart-x', `${startX}%`);
    heart.style.setProperty('--heart-y', `${startY}%`);

    heart.style.setProperty(
        '--heart-dx',
        `${Math.random() * 150 - 75}px`
    );

    heart.style.setProperty(
        '--heart-dy',
        `${-window.innerHeight - Math.random() * 250}px`
    );

    heart.style.setProperty(
        '--heart-size',
        `${16 + Math.random() * 25}px`
    );

    heart.style.setProperty(
        '--heart-duration',
        `${4 + Math.random() * 4}s`
    );

    heart.style.setProperty(
        '--heart-rotation',
        `${Math.random() * 180 - 90}deg`
    );

    container.appendChild(heart);

    const timeout = setTimeout(() => {
        heart.remove();
    }, 8500);

    celebrationTimeouts.push(timeout);
}


// ========================================
// ساخت بادکنک‌ها
// ========================================

function createBalloons(
    count = CELEBRATION_SETTINGS.balloonCount
) {
    const container = document.getElementById('balloonsContainer');

    if (!container) {
        return;
    }

    const colors = [
        '#ff4d9f',
        '#ffce4a',
        '#8f73ff',
        '#55d8f2',
        '#ff7195',
        '#8ee7ac',
        '#ffffff'
    ];

    for (let i = 0; i < count; i++) {
        const balloon = document.createElement('span');

        balloon.className = 'party-balloon';

        balloon.style.left = `${Math.random() * 100}%`;

        balloon.style.setProperty(
            '--balloon-color',
            colors[Math.floor(Math.random() * colors.length)]
        );

        balloon.style.setProperty(
            '--balloon-duration',
            `${8 + Math.random() * 7}s`
        );

        balloon.style.animationDelay = `${Math.random() * 3}s`;

        const size = 30 + Math.random() * 30;

        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.3}px`;

        container.appendChild(balloon);

        const timeout = setTimeout(() => {
            balloon.remove();
        }, 18000);

        celebrationTimeouts.push(timeout);
    }
}


// ========================================
// راه‌اندازی افکت‌های مداوم جشن
// ========================================

function startPartyAnimations() {
    clearCelebrationAnimations();

    const confettiContainer = document.getElementById('confettiContainer');
    const heartsContainer = document.getElementById('celebrationHearts');
    const balloonsContainer = document.getElementById('balloonsContainer');

    if (confettiContainer) {
        confettiContainer.innerHTML = '';
    }

    if (heartsContainer) {
        heartsContainer.innerHTML = '';
    }

    if (balloonsContainer) {
        balloonsContainer.innerHTML = '';
    }

    // انفجار اولیه قلب‌ها در چند نقطه
    createHeartExplosion(50, 42, 100);
    createHeartExplosion(20, 30, 35);
    createHeartExplosion(80, 30, 35);

    // بارش اولیه کاغذرنگی
    createConfetti(CELEBRATION_SETTINGS.confettiCount);

    // بالا رفتن بادکنک‌ها
    createBalloons(CELEBRATION_SETTINGS.balloonCount);

    // انفجارهای بزرگ پشت سر هم
    let explosionNumber = 0;

    const explosionInterval = setInterval(() => {
        const positions = [
            { x: 20, y: 35 },
            { x: 80, y: 35 },
            { x: 50, y: 25 },
            { x: 30, y: 60 },
            { x: 70, y: 60 }
        ];

        const position = positions[
            explosionNumber % positions.length
        ];

        createHeartExplosion(
            position.x,
            position.y,
            45
        );

        explosionNumber++;

    }, CELEBRATION_SETTINGS.heartExplosionInterval);

    celebrationIntervals.push(explosionInterval);

    // قلب‌های شناور
    const floatingHeartInterval = setInterval(() => {
        createFloatingHeart();
    }, 300);

    celebrationIntervals.push(floatingHeartInterval);

    // بارش دوباره کاغذرنگی
    const confettiInterval = setInterval(() => {
        createConfetti(35);
    }, 3500);

    celebrationIntervals.push(confettiInterval);

    // بادکنک‌های جدید
    const balloonInterval = setInterval(() => {
        createBalloons(5);
    }, 4500);

    celebrationIntervals.push(balloonInterval);
}


// ========================================
// پخش آهنگ تولد
// ========================================

async function playBirthdaySong() {
    const song = document.getElementById('birthdaySong');
    const soundButton = document.getElementById('soundButton');

    if (!song) {
        return;
    }

    try {
        song.muted = isMuted;

        await song.play();

        if (soundButton) {
            soundButton.textContent = isMuted
                ? '🔇 آهنگ بی‌صداست'
                : '🔊 آهنگ در حال پخش است';
        }

    } catch (error) {
        console.warn(
            'مرورگر اجازه پخش خودکار آهنگ را نداده است.',
            error
        );

        if (soundButton) {
            soundButton.textContent = '🎵 برای پخش آهنگ بزن';
        }
    }
}


// ========================================
// شروع جشن تولد
// ========================================

// ========================================
// شروع جشن تولد فقط در محل شمارش معکوس
// ========================================

function startBirthdayCelebration() {
    const celebration = document.getElementById('birthdayCelebration');
    const countdownSection = document.getElementById('countdownSection');
    const celebrationContent = document.getElementById('celebrationContent');

    if (!celebration || !countdownSection || !celebrationContent) {
        console.error('عناصر موردنیاز برای نمایش جشن تولد پیدا نشدند.');
        return;
    }

    if (celebrationStarted) {
        return;
    }

    celebrationStarted = true;

    // پنهان کردن محتوای قبلی تایمر
    Array.from(countdownSection.children).forEach(element => {
        element.hidden = true;
    });

    // انتقال کارت جشن به محل تایمر
    if (celebrationContent.parentElement !== countdownSection) {
        countdownSection.appendChild(celebrationContent);
    }

    // فعال کردن حالت جشن در محل تایمر
    countdownSection.classList.add('is-birthday-celebration');

    // کانتینر اصلی فقط میزبان افکت‌های پس‌زمینه باشد
    celebration.classList.remove('active');
    celebration.classList.add('background-only');
    celebration.setAttribute('aria-hidden', 'true');

    // فعال کردن افکت‌های جشن
    document.body.classList.add('birthday-party-active');

    startPartyAnimations();

    // پخش آهنگ تولد
    playBirthdaySong();
}


// ========================================
// شروع دوباره جشن با دکمه
// ========================================

// ========================================
// شروع دوباره جشن بدون پوشاندن صفحه
// ========================================

function replayBirthdayCelebration() {
    const celebration = document.getElementById('birthdayCelebration');
    const countdownSection = document.getElementById('countdownSection');
    const celebrationContent = document.getElementById('celebrationContent');

    if (!celebration || !countdownSection || !celebrationContent) {
        return;
    }

    celebrationStarted = true;

    // اطمینان از قرار گرفتن کارت جشن در محل تایمر
    if (celebrationContent.parentElement !== countdownSection) {
        Array.from(countdownSection.children).forEach(element => {
            element.hidden = true;
        });

        countdownSection.appendChild(celebrationContent);
    }

    countdownSection.classList.add('is-birthday-celebration');

    // جلوگیری از فعال شدن پوشش تمام‌صفحه
    celebration.classList.remove('active');
    celebration.classList.add('background-only');
    celebration.setAttribute('aria-hidden', 'true');

    document.body.classList.add('birthday-party-active');

    startPartyAnimations();

    playBirthdaySong();
}


// ========================================
// کنترل صدای آهنگ
// ========================================

function setupSoundControls() {
    const song = document.getElementById('birthdaySong');
    const soundButton = document.getElementById('soundButton');
    const muteButton = document.getElementById('muteButton');

    if (!song) {
        return;
    }

    if (soundButton) {
        soundButton.addEventListener('click', async () => {
            isMuted = false;
            song.muted = false;

            try {
                await song.play();

                soundButton.textContent = '🔊 آهنگ در حال پخش است';

            } catch (error) {
                console.error('پخش آهنگ انجام نشد:', error);

                soundButton.textContent = '❌ فایل آهنگ را بررسی کن';
            }
        });
    }

    if (muteButton) {
        muteButton.addEventListener('click', () => {
            isMuted = !isMuted;

            song.muted = isMuted;

            muteButton.textContent = isMuted ? '🔇' : '🔊';

            if (soundButton) {
                soundButton.textContent = isMuted
                    ? '🔇 روشن‌کردن آهنگ'
                    : '🔊 آهنگ در حال پخش است';
            }

            if (!isMuted && song.paused && celebrationStarted) {
                playBirthdaySong();
            }
        });
    }
}


// ========================================
// کنترل دکمه شروع دوباره جشن
// ========================================

function setupReplayButton() {
    const button = document.getElementById('replayCelebrationButton');

    if (!button) {
        return;
    }

    button.addEventListener('click', () => {
        replayBirthdayCelebration();
    });
}


// ========================================
// برگشت به باغ قلب‌ها
// ========================================

function setupBackButton() {
    const backButton = document.getElementById('backButton');

    if (!backButton) {
        return;
    }

    backButton.addEventListener('click', () => {
        window.location.href = 'tree.html';
    });
}


// ========================================
// مدیریت بازگشت به صفحه پس از تغییر تب
// ========================================

function setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateCountdown();
        }
    });
}


// ========================================
// اجرای صفحه
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    createBirthdayCalendar();

    createStars();

    createFloatingLights();

    setupBackButton();

    setupCountdown();

    setupSoundControls();

    setupReplayButton();

    setupVisibilityHandler();
});
/* ==========================================
   MYTANNAZ - CAKE, MICROPHONE AND WISHES
========================================== */

(() => {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const cakeSection = document.getElementById(
            'birthdayCakeSection'
        );

        if (!cakeSection) {
            return;
        }

        const microphoneButton = document.getElementById(
            'enableMicrophoneButton'
        );

        const microphoneStatus = document.getElementById(
            'microphoneStatus'
        );

        const microphoneMeterFill = document.getElementById(
            'microphoneMeterFill'
        );

        const candles = document.getElementById(
            'birthdayCandles'
        );

        const candlesBlownMessage = document.getElementById(
            'candlesBlownMessage'
        );

        const wishesSection = document.getElementById(
            'birthdayWishesSection'
        );

        const wishesForm = document.getElementById(
            'birthdayWishesForm'
        );

        const wishesStatus = document.getElementById(
            'birthdayWishesStatus'
        );

        const saveWishesButton = document.getElementById(
            'saveBirthdayWishesButton'
        );

        const birthdaySong = document.getElementById(
            'birthdaySong'
        );

        const applauseAudio = document.getElementById(
            'birthdayApplause'
        );

        let audioContext = null;
        let microphoneStream = null;
        let analyser = null;
        let microphoneSource = null;
        let microphoneFrame = null;

        let candlesExtinguished = false;
        let wishesSaved = false;

        let consecutiveBlowFrames = 0;
        let lastBlowTime = 0;

        const BLOW_THRESHOLD = 0.085;
        const REQUIRED_BLOW_FRAMES = 7;

        function setMicrophoneStatus(message) {
            microphoneStatus.textContent = message;
        }

        function setWishesStatus(message, type = '') {
            wishesStatus.textContent = message;

            wishesStatus.classList.remove(
                'success',
                'error'
            );

            if (type) {
                wishesStatus.classList.add(type);
            }
        }

        function stopMicrophone() {
            if (microphoneFrame !== null) {
                cancelAnimationFrame(microphoneFrame);
                microphoneFrame = null;
            }

            if (microphoneSource) {
                try {
                    microphoneSource.disconnect();
                } catch {
                    // منبع ممکن است قبلاً قطع شده باشد.
                }

                microphoneSource = null;
            }

            if (microphoneStream) {
                microphoneStream.getTracks().forEach(track => {
                    track.stop();
                });

                microphoneStream = null;
            }

            analyser = null;
        }

        async function startMicrophone() {
            if (candlesExtinguished) {
                return;
            }

            if (
                !navigator.mediaDevices ||
                typeof navigator.mediaDevices.getUserMedia !== 'function'
            ) {
                setMicrophoneStatus(
                    'مرورگر به میکروفون دسترسی ندارد. صفحه را با localhost یا HTTPS باز کن.'
                );

                return;
            }

            microphoneButton.disabled = true;
            microphoneButton.textContent = 'در حال فعال‌سازی...';

            try {
                microphoneStream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: false
                        }
                    });

                const AudioContextClass =
                    window.AudioContext ||
                    window.webkitAudioContext;

                if (!AudioContextClass) {
                    throw new Error(
                        'مرورگر از پردازش صدای موردنیاز پشتیبانی نمی‌کند.'
                    );
                }

                audioContext = new AudioContextClass();

                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                analyser = audioContext.createAnalyser();
                analyser.fftSize = 1024;
                analyser.smoothingTimeConstant = 0.15;

                microphoneSource =
                    audioContext.createMediaStreamSource(
                        microphoneStream
                    );

                microphoneSource.connect(analyser);

                microphoneButton.textContent =
                    '🎤 میکروفون فعال است';

                setMicrophoneStatus(
                    'میکروفون فعاله؛ حالا به سمت میکروفون فوت کن'
                );

                monitorMicrophone();

            } catch (error) {
                stopMicrophone();

                microphoneButton.disabled = false;

                microphoneButton.textContent =
                    '🎤 تلاش دوباره برای فعال‌سازی';

                if (
                    error.name === 'NotAllowedError' ||
                    error.name === 'PermissionDeniedError'
                ) {
                    setMicrophoneStatus(
                        'دسترسی میکروفون رد شد. از تنظیمات مرورگر اجازه میکروفون بده.'
                    );
                } else if (error.name === 'NotFoundError') {
                    setMicrophoneStatus(
                        'میکروفونی پیدا نشد. اتصال میکروفون رو بررسی کن.'
                    );
                } else {
                    setMicrophoneStatus(
                        error.message ||
                        'فعال‌سازی میکروفون ناموفق بود.'
                    );
                }

                console.error(
                    'Microphone initialization error:',
                    error
                );
            }
        }

        function monitorMicrophone() {
            if (!analyser || candlesExtinguished) {
                return;
            }

            const samples = new Uint8Array(
                analyser.fftSize
            );

            function inspectAudio() {
                if (!analyser || candlesExtinguished) {
                    return;
                }

                analyser.getByteTimeDomainData(samples);

                let sumSquares = 0;

                for (let i = 0; i < samples.length; i++) {
                    const normalized =
                        (samples[i] - 128) / 128;

                    sumSquares += normalized * normalized;
                }

                const rms = Math.sqrt(
                    sumSquares / samples.length
                );

                const meterPercentage = Math.min(
                    100,
                    Math.round(rms * 350)
                );

                microphoneMeterFill.style.width =
                    `${meterPercentage}%`;

                const now = performance.now();

                if (rms >= BLOW_THRESHOLD) {
                    consecutiveBlowFrames++;
                } else {
                    consecutiveBlowFrames = Math.max(
                        0,
                        consecutiveBlowFrames - 2
                    );
                }

                if (
                    consecutiveBlowFrames >= REQUIRED_BLOW_FRAMES &&
                    now - lastBlowTime > 1500
                ) {
                    lastBlowTime = now;

                    extinguishCandles();

                    return;
                }

                microphoneFrame =
                    requestAnimationFrame(inspectAudio);
            }

            microphoneFrame =
                requestAnimationFrame(inspectAudio);
        }

        async function playBirthdaySounds() {
            if (birthdaySong) {
                try {
                    birthdaySong.currentTime = 0;
                    await birthdaySong.play();
                } catch (error) {
                    console.warn(
                        'Birthday song could not play:',
                        error
                    );
                }
            }

            if (applauseAudio) {
                try {
                    applauseAudio.currentTime = 0;
                    await applauseAudio.play();
                } catch (error) {
                    console.warn(
                        'Applause audio could not play:',
                        error
                    );
                }
            }
        }

        async function extinguishCandles() {
            if (candlesExtinguished) {
                return;
            }

            candlesExtinguished = true;

            // توقف میکروفون پس از فوت کردن شمع‌ها
            stopMicrophone();

            // خاموش شدن شعله‌های کیک
            candles.classList.add('candles-extinguished');

            microphoneButton.disabled = true;
            microphoneButton.textContent = '✨ شمع‌ها خاموش شدند';

            microphoneMeterFill.style.width = '0%';

            setMicrophoneStatus(
                'آفرین عشقممم ❤️ آرزوهات رو بنویس'
            );

            // نمایش پیام خاموش شدن شمع‌ها
            candlesBlownMessage.hidden = false;

            // نمایش فرم آرزوها بدون جابه‌جایی صفحه
            wishesSection.hidden = false;

            // شروع جشن در پس‌زمینه، بدون نمایش کارت بزرگ
            startBackgroundBirthdayCelebration();

            // پخش صدای تشویق
            if (applauseAudio) {
                try {
                    applauseAudio.currentTime = 0;
                    await applauseAudio.play();
                } catch (error) {
                    console.warn(
                        'پخش صدای تشویق انجام نشد:',
                        error
                    );
                }
            }
        }

        async function submitWishes(event) {
            event.preventDefault();

            if (wishesSaved) {
                return;
            }

            const wishes = [
                document.getElementById('wishOne').value.trim(),
                document.getElementById('wishTwo').value.trim(),
                document.getElementById('wishThree').value.trim()
            ];

            if (
                wishes.length !== 3 ||
                wishes.some(
                    wish => wish.length < 2 || wish.length > 1000
                )
            ) {
                setWishesStatus(
                    'لطفاً هر سه آرزو رو بنویس. هر آرزو باید بین ۲ تا ۱۰۰۰ نویسه باشه.',
                    'error'
                );

                return;
            }

            saveWishesButton.disabled = true;

            saveWishesButton.textContent =
                'در حال ثبت آرزوها...';

            setWishesStatus('');

            try {
                const response = await fetch(
                    'https://dtzncunbhbunnnbxivod.supabase.co/functions/v1/submit-wishes',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': 'sb_publishable_15G6LdMzZvYc6hM3PxCudg_BVZQKse1'
                        },

                        body: JSON.stringify({
                            wishes
                        })
                    }
                );

                let data = {};

                try {
                    data = await response.json();
                } catch {
                    data = {};
                }

                if (
                    !response.ok ||
                    data.success !== true
                ) {
                    throw new Error(
                        data.message ||
                        'ثبت آرزوها انجام نشد. لطفاً دوباره امتحان کن.'
                    );
                }

                wishesSaved = true;

                wishesForm
                    .querySelectorAll('textarea')
                    .forEach(textarea => {
                        textarea.readOnly = true;
                    });

                saveWishesButton.textContent =
                    '❤️ آرزوها ثبت شدند';

                saveWishesButton.disabled = true;

                setWishesStatus(
                    'هر سه آرزوت با موفقیت ثبت شد ❤️',
                    'success'
                );

            } catch (error) {
                setWishesStatus(
                    error.message ||
                    'ارتباط با سرور برقرار نشد. اتصال رو بررسی کن و دوباره تلاش کن.',
                    'error'
                );

                saveWishesButton.disabled = false;

                saveWishesButton.textContent =
                    '❤️ ثبت سه آرزو';

                console.error(
                    'Wish submission error:',
                    error
                );
            }
        }

        microphoneButton.addEventListener(
            'click',
            startMicrophone
        );

        wishesForm.addEventListener(
            'submit',
            submitWishes
        );

        window.addEventListener(
            'pagehide',
            stopMicrophone
        );

        document.addEventListener(
            'visibilitychange',
            () => {
                if (
                    document.hidden &&
                    !candlesExtinguished
                ) {
                    stopMicrophone();

                    microphoneButton.disabled = false;

                    microphoneButton.textContent =
                        '🎤 فعال کردن دوباره میکروفون';

                    setMicrophoneStatus(
                        'برای ادامه، دوباره میکروفون رو فعال کن'
                    );
                }
            }
        );
    });
})();