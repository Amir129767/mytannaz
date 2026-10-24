document.addEventListener("DOMContentLoaded", () => {
    const starsContainer = document.getElementById("stars");
    const lightsContainer = document.getElementById("floatingLights");
    const transition = document.getElementById("heartTransition");
    const transitionText = document.getElementById("transitionText");
    const backButton = document.getElementById("backButton");

    // ایجاد ستاره‌های آسمان
    if (starsContainer) {
        for (let i = 0; i < 100; i++) {
            const star = document.createElement("span");

            star.className = "star";
            star.textContent = Math.random() > 0.75 ? "✦" : "·";

            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.fontSize = `${Math.random() * 10 + 5}px`;
            star.style.setProperty(
                "--duration",
                `${Math.random() * 4 + 2}s`
            );

            star.style.animationDelay = `${Math.random() * 4}s`;

            starsContainer.appendChild(star);
        }
    }

    // ایجاد نورهای شناور در باغ
    if (lightsContainer) {
        for (let i = 0; i < 30; i++) {
            const light = document.createElement("span");

            light.className = "light";
            light.style.left = `${Math.random() * 100}%`;
            light.style.top = `${50 + Math.random() * 50}%`;

            light.style.setProperty(
                "--duration",
                `${Math.random() * 7 + 5}s`
            );

            light.style.animationDelay = `${Math.random() * 8}s`;

            lightsContainer.appendChild(light);
        }
    }

    // افکت باز شدن قلب و رفتن به صفحه مخصوص آن
    const fruits = document.querySelectorAll(".fruit");

    fruits.forEach((fruit) => {
        fruit.addEventListener("click", () => {
            const page = fruit.dataset.page;
            const title = fruit.dataset.title;

            if (!page || !title || !transition) {
                return;
            }

            transitionText.textContent = `داریم قصه «${title}» رو باز می‌کنیم...`;

            transition.classList.add("active");

            // زمان کوتاه برای دیده شدن انیمیشن
            window.setTimeout(() => {
                window.location.href = page;
            }, 1400);
        });
    });

    // برگشت به صفحه آغازین
    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "../index.html";
        });
    }
});