document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Cursor ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if(cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let outlineX = mouseX;
        let outlineY = mouseY;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        const animateOutline = () => {
            let distX = mouseX - outlineX;
            let distY = mouseY - outlineY;
            
            // Adjust the 0.3 for snappiness (1 is instant, lower is slower/smoother)
            outlineX = outlineX + (distX * 0.35);
            outlineY = outlineY + (distY * 0.35);
            
            cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateOutline);
        };
        animateOutline();

        // Hover effect for links and buttons
        const interactives = document.querySelectorAll('a, button, .skill-card, .project-card, .certificate-card, input, textarea');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
        });
    }

    // --- Mobile Navigation ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }));

    // --- Sticky Navbar ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Typing Effect ---
    const typingText = document.querySelector('.typing-text');
    const words = ["Data Analyst", "Data Storyteller", "Dashboard Creator", "Problem Solver"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before next word
        }

        setTimeout(type, typeSpeed);
    }
    
    // Start typing effect
    setTimeout(type, 1000);

    // --- Intersection Observer for Animations ---
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate progress bars
                if (entry.target.classList.contains('skills-grid')) {
                    const progressBars = entry.target.querySelectorAll('.progress');
                    progressBars.forEach(bar => {
                        const target = bar.getAttribute('style').match(/--target:\s*([^;]+)/)[1];
                        bar.style.width = target;
                    });
                }

                // Animate counters
                if (entry.target.classList.contains('stats')) {
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const duration = 2000; // ms
                        const increment = target / (duration / 16); // 60fps
                        
                        let current = 0;
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        updateCounter();
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe specific sections
    const skillsGrid = document.querySelector('.skills-grid');
    if(skillsGrid) observer.observe(skillsGrid);
    
    const statsSection = document.querySelector('.stats');
    if(statsSection) observer.observe(statsSection);

    // --- Form Submission Handling ---
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.style.opacity = '0.8';
            
            // Simulate network request
            setTimeout(() => {
                btn.innerHTML = '<span>Sent Successfully!</span> <i class="fa-solid fa-check"></i>';
                btn.style.background = '#27c93f';
                form.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
            }, 1500);
        });
    }
});
