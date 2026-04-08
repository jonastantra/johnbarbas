// Script para animar los contadores cuando son visibles
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');
    const animationDuration = 1500; // Reducido para mayor rendimiento

    const animateCounter = (counterElement) => {
        const target = +counterElement.getAttribute('data-target');
        const increment = Math.ceil(target / (animationDuration / 16));
        let count = 0;

        const updateCount = () => {
            count += increment;
            if (count >= target) {
                counterElement.innerText = target;
                return;
            }
            counterElement.innerText = count;
            requestAnimationFrame(updateCount);
        };

        updateCount();
    };

    // Optimización: Usar Intersection Observer con opciones mínimas
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            counters.forEach(counter => {
                animateCounter(counter);
            });
            observer.disconnect(); // Dejar de observar después de animar
        }
    }, {
        threshold: 0.1 // El 10% del elemento debe estar visible
    });

    const counterSection = document.getElementById('animated-counters-section');
    if (counterSection) {
        observer.observe(counterSection);
    }
});