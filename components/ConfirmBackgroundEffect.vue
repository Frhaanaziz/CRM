<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

interface Circle {
    x: number;
    y: number;
    color: string;
    createdAt: number;
}

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastX = 0;
    let lastY = 0;
    const circles: Circle[] = [];
    const colors = [
        '#3b82f6', // blue
        '#ef4444', // red
        '#f97316', // orange
        '#22c55e', // green
        '#eab308', // yellow
        '#a855f7', // purple
    ];
    let colorIndex = 0;

    const getNextColor = () => {
        const color = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
        return color;
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const addCircle = (x: number, y: number) => {
        circles.push({
            x,
            y,
            color: getNextColor(),
            createdAt: Date.now(),
        });
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const now = Date.now();
        const maxAge = 3000; // 3 seconds
        const maxRadius = 40; // Maximum radius of the circle

        for (let i = circles.length - 1; i >= 0; i--) {
            const circle = circles[i];
            const age = now - circle.createdAt;

            if (age > maxAge) {
                circles.splice(i, 1);
                continue;
            }

            const lifeProgress = age / maxAge;
            let radius;
            if (lifeProgress < 0.5) {
                // Grow for the first half of the lifetime
                radius = maxRadius * (lifeProgress * 2);
            } else {
                // Shrink for the second half of the lifetime
                radius = maxRadius * (2 - lifeProgress * 2);
            }

            const opacity = 1 - lifeProgress;
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `${circle.color}${Math.floor(opacity * 255)
                .toString(16)
                .padStart(2, '0')}`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
        const { clientX, clientY } = event;
        const distance = Math.hypot(clientX - lastX, clientY - lastY);

        if (distance > 40) {
            addCircle(clientX, clientY);
            lastX = clientX;
            lastY = clientY;
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    onUnmounted(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
    });
});
</script>

<template>
    <canvas ref="canvasRef" class="pointer-events-none fixed inset-0" :style="{ zIndex: -1 }"></canvas>
</template>
