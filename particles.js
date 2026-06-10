(function () {
    // --- Canvas Setup ---
    const canvas = document.createElement('canvas');
    canvas.id = 'dataParticlesCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9998'; // Floating over content, but below custom cursor (9999)
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // --- Particle State and Constants ---
    const particles = [];
    const maxParticles = 100; // Keep performance smooth
    const colors = [
        '0, 242, 254',  // Cyan (--primary-color)
        '79, 172, 254', // Blue (--secondary-color)
        '127, 0, 255'   // Purple (--accent-color)
    ];

    const keywords = ["SELECT", "FROM", "WHERE", "JOIN", "0", "1", "%", "SQL", "{}", "[]", "COUNT", "SUM", "AVG", "DATA"];
    const types = ["text", "bar-chart", "line-chart", "pie-chart", "card", "dot"];

    // --- Interactive Mouse State ---
    const mouse = {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        vx: 0,
        vy: 0,
        isDragging: false
    };

    const smoothedMouse = { x: 0, y: 0 };
    let activeSection = null;
    let stopTimer = null;
    let isMoving = false;

    // --- Letters "JK" Morph Targets ---
    // Relative coordinates centered around stop position
    const JK_POINTS = [
        // Letter J (centered around x = -25)
        { dx: -25, dy: -25 }, { dx: -15, dy: -25 }, { dx: -35, dy: -25 }, // top bar
        { dx: -25, dy: -15 }, { dx: -25, dy: -5 }, { dx: -25, dy: 5 }, { dx: -25, dy: 15 }, // vertical bar
        { dx: -28, dy: 22 }, { dx: -38, dy: 22 }, { dx: -45, dy: 15 }, { dx: -45, dy: 5 }, // hook

        // Letter K (centered around x = 25)
        { dx: 15, dy: -25 }, { dx: 15, dy: -15 }, { dx: 15, dy: -5 }, { dx: 15, dy: 5 }, { dx: 15, dy: 15 }, { dx: 15, dy: 25 }, // vertical bar
        { dx: 25, dy: -2 }, { dx: 35, dy: -12 }, { dx: 45, dy: -22 }, // upper diagonal
        { dx: 25, dy: 8 }, { dx: 35, dy: 18 }, { dx: 45, dy: 28 } // lower diagonal
    ];

    // --- Tracking Hovered Sections for Gravity Attraction ---
    document.querySelectorAll('section').forEach(sec => {
        sec.addEventListener('mouseenter', () => {
            const rect = sec.getBoundingClientRect();
            activeSection = {
                x: rect.left + rect.width / 2 + window.scrollX,
                y: rect.top + 80 + window.scrollY // Target the header region of the section
            };
        });
        sec.addEventListener('mouseleave', () => {
            activeSection = null;
        });
    });

    // --- Particle Class ---
    class Particle {
        constructor(x, y, vx, vy, speedFactor) {
            this.x = x;
            this.y = y;
            
            // Add momentum from drag speed + random scatter
            this.vx = vx * 0.4 + (Math.random() - 0.5) * 2 * speedFactor;
            this.vy = vy * 0.4 + (Math.random() - 0.5) * 2 * speedFactor;
            
            this.friction = 0.96;
            this.gravity = -0.04; // Gentle upward drift
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.type = types[Math.floor(Math.random() * types.length)];
            this.text = keywords[Math.floor(Math.random() * keywords.length)];
            this.size = Math.random() * 8 + 8; // 8 to 16px
            this.alpha = 1.0;
            this.decay = Math.random() * 0.01 + 0.008; // elegant slow fade
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.04;
            
            // Morph states
            this.isMorphing = false;
            this.morphTarget = null;
            this.morphTimer = 0;
        }

        update() {
            if (this.isMorphing && this.morphTarget) {
                // Smooth interpolation to target
                this.x += (this.morphTarget.x - this.x) * 0.12;
                this.y += (this.morphTarget.y - this.y) * 0.12;
                this.vx = 0;
                this.vy = 0;
                
                this.morphTimer--;
                if (this.morphTimer <= 0) {
                    this.isMorphing = false; // Disperse
                }
            } else {
                // Apply normal physics
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity; // Float upwards
                
                // Section gravitational attraction
                if (activeSection) {
                    const dx = activeSection.x - (this.x + window.scrollX);
                    const dy = activeSection.y - (this.y + window.scrollY);
                    const dist = Math.hypot(dx, dy);
                    if (dist < 500) {
                        const pull = (1 - dist / 500) * 0.12;
                        this.vx += (dx / dist) * pull;
                        this.vy += (dy / dist) * pull;
                    }
                }

                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.spin;
                this.alpha -= this.decay;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Subtle glow
            ctx.shadowBlur = this.type === 'dot' ? 12 : 6;
            ctx.shadowColor = `rgba(${this.color}, ${this.alpha})`;

            const alpha = this.alpha;
            const size = this.size;
            const color = this.color;

            switch (this.type) {
                case 'text':
                    ctx.fillStyle = `rgba(${color}, ${alpha})`;
                    ctx.font = `500 ${size}px 'Courier New', Courier, monospace`;
                    ctx.fillText(this.text, -ctx.measureText(this.text).width / 2, size / 3);
                    break;

                case 'bar-chart':
                    ctx.fillStyle = `rgba(${color}, ${alpha})`;
                    ctx.fillRect(-6, 4, 3, -6);
                    ctx.fillRect(-2, 4, 3, -11);
                    ctx.fillRect(2, 4, 3, -4);
                    break;

                case 'line-chart':
                    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.moveTo(-8, 4);
                    ctx.lineTo(-2, -4);
                    ctx.lineTo(3, 1);
                    ctx.lineTo(8, -6);
                    ctx.stroke();
                    break;

                case 'pie-chart':
                    ctx.fillStyle = `rgba(${color}, ${alpha * 0.2})`;
                    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    // Slice line
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(6, 0);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-3, -5);
                    ctx.stroke();
                    break;

                case 'card':
                    ctx.fillStyle = `rgba(${color}, ${alpha * 0.1})`;
                    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.rect(-8, -8, 16, 16);
                    ctx.fill();
                    ctx.stroke();
                    // Mini lines
                    ctx.beginPath();
                    ctx.moveTo(-5, -2); ctx.lineTo(5, -2);
                    ctx.moveTo(-5, 2); ctx.lineTo(2, 2);
                    ctx.stroke();
                    break;

                case 'dot':
                    ctx.fillStyle = `rgba(${color}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }

            ctx.restore();
        }
    }

    // --- Drag Trigger & Particle Spawning ---
    function triggerJKMorph() {
        // Find particles with long life to form the letters
        const candidateParticles = particles.filter(p => !p.isMorphing && p.alpha > 0.35);
        if (candidateParticles.length === 0) return;

        // Shuffle candidate particles
        candidateParticles.sort(() => Math.random() - 0.5);

        // Assign to JK targets
        const numToMorph = Math.min(JK_POINTS.length, candidateParticles.length);
        for (let i = 0; i < numToMorph; i++) {
            const p = candidateParticles[i];
            p.isMorphing = true;
            p.morphTarget = {
                x: smoothedMouse.x + JK_POINTS[i].dx,
                y: smoothedMouse.y + JK_POINTS[i].dy
            };
            p.morphTimer = 90; // Hold letters for 90 frames (~1.5s)
            p.alpha = 1.0;     // Boost visibility
        }
    }

    function handleDrag(x, y) {
        mouse.x = x;
        mouse.y = y;

        // Compute cursor speed
        mouse.vx = mouse.x - mouse.px;
        mouse.vy = mouse.y - mouse.py;

        const speed = Math.hypot(mouse.vx, mouse.vy);
        isMoving = speed > 0.5;

        if (mouse.isDragging) {
            // Smooth mouse coordinate tracking with easing
            smoothedMouse.x += (mouse.x - smoothedMouse.x) * 0.16;
            smoothedMouse.y += (mouse.y - smoothedMouse.y) * 0.16;

            // Determine particle spawning density and sizes based on speed
            // Fast drag = larger bursts; Slow drag = tight trails
            const spawnCount = speed > 15 ? Math.min(4, Math.floor(speed / 8)) : 1;
            const speedFactor = Math.min(3, speed / 5);

            for (let i = 0; i < spawnCount; i++) {
                if (particles.length < maxParticles) {
                    particles.push(new Particle(
                        smoothedMouse.x + (Math.random() - 0.5) * 10,
                        smoothedMouse.y + (Math.random() - 0.5) * 10,
                        mouse.vx,
                        mouse.vy,
                        speedFactor
                    ));
                }
            }

            // JK Morph trigger on dragging stop (no move event for 150ms while dragging)
            clearTimeout(stopTimer);
            if (isMoving) {
                stopTimer = setTimeout(() => {
                    triggerJKMorph();
                }, 150);
            }
        } else {
            // Subtle hover spark specs (emitted on normal idle moves)
            if (isMoving && Math.random() < 0.3) {
                smoothedMouse.x += (mouse.x - smoothedMouse.x) * 0.25;
                smoothedMouse.y += (mouse.y - smoothedMouse.y) * 0.25;

                if (particles.length < maxParticles) {
                    const spark = new Particle(
                        smoothedMouse.x,
                        smoothedMouse.y,
                        mouse.vx * 0.25,
                        mouse.vy * 0.25,
                        0.4
                    );
                    // Customize sparks to be tiny, fast-decaying, and transparent specs
                    spark.size = Math.random() * 4 + 4; // 4 to 8px
                    spark.alpha = 0.5;
                    spark.decay = 0.035; // Fades out very quickly (approx. 15 frames)
                    spark.type = Math.random() < 0.6 ? "dot" : "text"; // soft dots and simple binary/braces symbols
                    if (spark.type === "text") {
                        spark.text = Math.random() < 0.5 ? (Math.random() < 0.5 ? "0" : "1") : (Math.random() < 0.5 ? "{}" : "%");
                    }
                    particles.push(spark);
                }
            }
        }

        mouse.px = mouse.x;
        mouse.py = mouse.y;
    }

    // --- Input Listeners ---
    window.addEventListener('mousedown', (e) => {
        // Don't spawn on chatbot toggle clicks or input boxes directly to avoid confusion
        if (e.target.closest('#askJuhailChatbot') || e.target.closest('#contactForm') || e.target.closest('.navbar')) return;
        
        mouse.isDragging = true;
        mouse.x = mouse.px = smoothedMouse.x = e.clientX;
        mouse.y = mouse.py = smoothedMouse.y = e.clientY;
        mouse.vx = mouse.vy = 0;
    });

    window.addEventListener('mousemove', (e) => {
        handleDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
        if (mouse.isDragging) {
            triggerJKMorph();
        }
        mouse.isDragging = false;
        clearTimeout(stopTimer);
    });

    // Touch Support
    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('#askJuhailChatbot') || e.target.closest('#contactForm') || e.target.closest('.navbar')) return;
        
        mouse.isDragging = true;
        const touch = e.touches[0];
        mouse.x = mouse.px = smoothedMouse.x = touch.clientX;
        mouse.y = mouse.py = smoothedMouse.y = touch.clientY;
        mouse.vx = mouse.vy = 0;
    });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleDrag(touch.clientX, touch.clientY);
    });

    window.addEventListener('touchend', () => {
        if (mouse.isDragging) {
            triggerJKMorph();
        }
        mouse.isDragging = false;
        clearTimeout(stopTimer);
    });

    // --- Animation Loop ---
    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();

            // Remove faded out particles
            if (p.alpha <= 0 && !p.isMorphing) {
                particles.splice(i, 1);
            }
        }

        // Add soft trailing inertia logic to smoothedMouse when dragging is inactive
        if (!mouse.isDragging) {
            smoothedMouse.x += (mouse.x - smoothedMouse.x) * 0.12;
            smoothedMouse.y += (mouse.y - smoothedMouse.y) * 0.12;
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
