document.addEventListener('DOMContentLoaded', () => {
    
    // --- Custom Multi-layered Cursor ---
    const cursorOutline = document.querySelector('.custom-cursor-container');
    const cursorLayers = Array.from(document.querySelectorAll('.cursor-layer')).reverse();
    
    if (cursorOutline && cursorLayers.length > 0 && window.matchMedia("(pointer: fine)").matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let lastMouseX = mouseX;
        let lastMouseY = mouseY;
        let velocity = 0;
        let easedVelocity = 0;
        let isClicked = false;
        let currentAngle = 0;
        
        let layerCoords = Array.from({ length: cursorLayers.length }, () => ({ x: mouseX, y: mouseY }));
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mousedown', () => {
            isClicked = true;
        });

        window.addEventListener('mouseup', () => {
            isClicked = false;
        });

        const animateCursor = () => {
            // Track speed/velocity and movement angle
            const dx = mouseX - lastMouseX;
            const dy = mouseY - lastMouseY;
            velocity = Math.hypot(dx, dy);
            easedVelocity += (velocity - easedVelocity) * 0.08;
            
            const moveAngle = Math.atan2(dy, dx);
            
            lastMouseX = mouseX;
            lastMouseY = mouseY;

            const isHovered = cursorOutline.classList.contains('hover');
            // Stretches along the angle of movement based on velocity
            const trailStretch = Math.min(easedVelocity * 1.5, 30); 
            const scale = (isHovered ? 1.35 : 1.0) * (isClicked ? 0.75 : 1.0);
            
            // Continuous spinning (speeds up rapidly on click)
            currentAngle += isClicked ? 7.5 : 1.0;

            // Base color hue drifts slowly over time
            const baseHue = (Date.now() / 15) % 360;

            // Lead layer follows cursor coordinates
            layerCoords[0].x += (mouseX - layerCoords[0].x) * 0.8;
            layerCoords[0].y += (mouseY - layerCoords[0].y) * 0.8;

            // Trail layers follow along the reverse motion vector
            for (let i = 1; i < layerCoords.length; i++) {
                const targetX = layerCoords[i - 1].x - Math.cos(moveAngle) * trailStretch * 0.35;
                const targetY = layerCoords[i - 1].y - Math.sin(moveAngle) * trailStretch * 0.35;
                layerCoords[i].x += (targetX - layerCoords[i].x) * 0.38;
                layerCoords[i].y += (targetY - layerCoords[i].y) * 0.38;
            }

            // Update DOM transformations and HSL color cycles
            cursorLayers.forEach((layer, i) => {
                const hue = (baseHue + (i * 20)) % 360;
                // Stepped scale nesting (top layer is outer boundary, trailing layers are nested inwards)
                const sizeScale = scale * (1 - (i * 0.06));
                // Stepped rotation offset (creates a twisted wireframe tunnel look)
                const r = currentAngle + (i * 12);
                
                layer.style.color = `hsl(${hue}, 100%, 68%)`;
                layer.style.transform = `translate3d(${layerCoords[i].x}px, ${layerCoords[i].y}px, 0) scale(${sizeScale}) rotate(${r}deg)`;
            });

            requestAnimationFrame(animateCursor);
        };
        animateCursor();

        // Hover effect for links and buttons
        const interactives = document.querySelectorAll('a, button, .skill-card, .project-card, .certificate-card, input, textarea, .hero-portrait-img');
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
    const successPopup = document.getElementById('successPopup');
    const closePopupBtn = document.querySelector('.popup-close-btn');

    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.style.opacity = '0.8';
            
            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            }).then(() => {
                // Show success popup
                if(successPopup) {
                    successPopup.classList.add('show');
                }
                
                form.reset();
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                
            }).catch((err) => {
                console.error('Error submitting form:', err);
                btn.innerHTML = '<span>Error</span> <i class="fa-solid fa-xmark"></i>';
                btn.style.background = '#ff4d4d';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
            });
        });
    }

    if(closePopupBtn && successPopup) {
        closePopupBtn.addEventListener('click', () => {
            successPopup.classList.remove('show');
        });

        // Close on clicking outside the box
        successPopup.addEventListener('click', (e) => {
            if (e.target === successPopup) {
                successPopup.classList.remove('show');
            }
        });
    }

    // --- Ask Juhail Chatbot Logic ---
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatForm = document.getElementById('chatForm');
    const chatSend = document.getElementById('chatSend');
    const chatSuggestions = document.getElementById('chatSuggestions');

    const GEMINI_API_KEY = ""; // Placeholder - enter your Gemini API key here if needed
    let chatHistory = [];

    const SYSTEM_INSTRUCTION = `You are "Ask Juhail", the friendly and professional AI chatbot for Mohammed Juhail K's personal portfolio. Your purpose is to answer questions about Juhail for prospective employers, recruiters, and clients.

Here are the official facts about Juhail:
- Name: Mohammed Juhail K
- Role: Data Analyst Fresher
- Career Goal: To grow as a Data Analyst and help businesses make better decisions using data.
- Education: B.Com Finance Graduate
- Academy/Certification: Certified in "Advanced Data Analytics with AI" from Haris&Co. Academy.
- Technical Skills: Excel (advanced formulas, pivot tables, VBA macros), SQL (MySQL for complex queries), Python (Pandas, NumPy, Matplotlib), Power BI (DAX, data modeling), Tableau, Data Cleaning, Data Visualization, Dashboard Creation.
- Key Dashboards & Projects:
  1. Customer Shopping Behavior Analysis: Performed EDA using Python/SQL, segmented customers, analyzed revenue patterns, built interactive Power BI dashboards.
  2. Netflix Content Analysis Dashboard: Built in Power BI to analyze movies/TV shows by genre, country, rating, and release year.
  3. Fitness & Health Dashboard: Interactive Power BI and Excel dashboard tracking BMI, steps, sleep hours, calories burned, and weight.
  4. Perla Jewels website: E-commerce platform metrics/analytics.
  - Overall Portfolio: Juhail has built over 50 interactive dashboards.
- Contact Details:
  - Email: mohammedjuhail17@gmail.com
  - Phone: +91 6282171053
  - WhatsApp: https://wa.me/916282171053 (Direct click-to-chat)
  - LinkedIn: https://www.linkedin.com/in/juhail (linkedin.com/in/juhail)
  - GitHub: https://github.com/mohammedjuhail17-create (github.com/mohammedjuhail17-create)

Guidelines for your responses:
1. Maintain a professional, polite, and helpful tone. Speak in the third person when talking about Juhail (e.g. "Juhail is...", "He did...").
2. Answer concisely. Limit responses to 2-3 short sentences/paragraphs where possible, unless detailing skills or projects. Keep it readable for chat windows.
3. You may use HTML formatting like <strong>bold</strong>, <ul><li>lists</li></ul>, or <a href="...">links</a> in your replies. Always use target="_blank" for external links.
4. If you don't know the answer to a question or if it's unrelated to Juhail's professional profile, politely redirect the conversation and suggest asking about his skills, projects, contact details, or background.`;

    const botResponses = {
        about: `<strong>Mohammed Juhail K</strong> is a passionate <strong>Data Analyst Fresher</strong> and a B.Com Finance graduate.
                <br><br>
                He excels at decoding data to help businesses make informed, strategic decisions. By combining his analytical skills with his business finance background, he bridges the gap between raw data insights and commercial impact.`,
        
        skills: `Here is Juhail's technical arsenal:
                 <ul>
                    <li><strong>Languages & Databases:</strong> Python (Pandas, NumPy, Matplotlib), SQL (MySQL for complex queries).</li>
                    <li><strong>BI & Visualization:</strong> Power BI (DAX, data modeling, dashboard design), Tableau.</li>
                    <li><strong>Spreadsheets & Core:</strong> Excel (advanced formulas, pivot tables, VBA), Data Cleaning, and Visualization.</li>
                    <li><strong>AI & Automation:</strong> Certified in <em>Advanced Data Analytics with AI</em>.</li>
                 </ul>`,
                 
        projects: `Juhail has worked on several practical projects:
                   <ul>
                    <li><strong>Customer Shopping Behavior Analysis:</strong> Analyzed customer patterns (New, Returning, Loyal) using Python, SQL, and Power BI.</li>
                    <li><strong>Netflix Content Analysis Dashboard:</strong> Built in Power BI to analyze movies/TV shows by genre, country, and rating.</li>
                    <li><strong>Fitness & Health Dashboard:</strong> Tracks KPIs like BMI, sleep hours, steps, and weight using Power BI & Excel.</li>
                    <li><strong>Perla Jewels Website:</strong> E-commerce analysis and platform metrics.</li>
                   </ul>`,
                   
        hire: `Why Juhail is a strong hire for your team:
               <ul>
                <li><strong>Finance + Tech:</strong> His B.Com background ensures he understands business metrics and ROI, translating numbers into commercial insights.</li>
                <li><strong>Certified Expertise:</strong> Certified in Advanced Data Analytics with AI from Haris&Co. Academy.</li>
                <li><strong>Active Builder:</strong> He has built and refined 50+ interactive dashboards.</li>
                <li><strong>Driven Fresher:</strong> Fast learner, adaptive, and eager to add immediate value to your analytics pipeline.</li>
               </ul>`,
               
        contact: `You can reach Juhail via:
                  <ul>
                    <li><strong>Email:</strong> <a href="mailto:mohammedjuhail17@gmail.com">mohammedjuhail17@gmail.com</a></li>
                    <li><strong>Phone:</strong> <a href="tel:+916282171053">+91 6282171053</a></li>
                    <li><strong>WhatsApp:</strong> <a href="https://wa.me/916282171053" target="_blank">Chat on WhatsApp (+91 6282171053)</a></li>
                    <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/juhail" target="_blank">linkedin.com/in/juhail</a></li>
                    <li><strong>GitHub:</strong> <a href="https://github.com/mohammedjuhail17-create" target="_blank">github.com/mohammedjuhail17-create</a></li>
                  </ul>
                  Feel free to use the contact form on this website too!`
    };

    function getBotResponse(query) {
        const lower = query.toLowerCase();
        
        if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('number') || lower.includes('reach') || lower.includes('address') || lower.includes('linkedin') || lower.includes('call')) {
            return botResponses.contact;
        }
        if (lower.includes('project') || lower.includes('dashboard') || lower.includes('portfolio') || lower.includes('netflix') || lower.includes('fitness') || lower.includes('jewel') || lower.includes('work')) {
            return botResponses.projects;
        }
        if (lower.includes('skill') || lower.includes('technolog') || lower.includes('tool') || lower.includes('python') || lower.includes('sql') || lower.includes('excel') || lower.includes('power bi') || lower.includes('tableau') || lower.includes('data cleaning')) {
            return botResponses.skills;
        }
        if (lower.includes('hire') || lower.includes('recruit') || lower.includes('why you') || lower.includes('job') || lower.includes('fresher') || lower.includes('fit')) {
            return botResponses.hire;
        }
        if (lower.includes('about') || lower.includes('juhail') || lower.includes('who is') || lower.includes('education') || lower.includes('degree') || lower.includes('b.com') || lower.includes('finance') || lower.includes('introduce') || lower.includes('bio')) {
            return botResponses.about;
        }
        
        return `I'm here to help you learn more about Juhail! I can answer:
                <ul>
                    <li>His background and profile</li>
                    <li>Technical skills & arsenal</li>
                    <li>Featured projects & dashboards</li>
                    <li>Why you should hire him</li>
                    <li>How to contact him</li>
                </ul>
                Try clicking one of the quick suggestions below or type a query!`;
    }

    function appendMessage(sender, text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubbleContainer = document.createElement('div');
        bubbleContainer.classList.add('chat-bubble-container', sender);
        
        bubbleContainer.innerHTML = `
            <div class="chat-bubble">
                ${text}
            </div>
            <span class="chat-msg-time">${time}</span>
        `;
        
        chatMessages.appendChild(bubbleContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Apply custom cursor hover to any links inside the bot message
        if (cursorOutline) {
            const links = bubbleContainer.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
                link.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
            });
        }
    }

    let typingIndicator = null;

    function showTypingIndicator() {
        if (typingIndicator) return;
        
        typingIndicator = document.createElement('div');
        typingIndicator.classList.add('chat-bubble-container', 'bot', 'typing-container');
        typingIndicator.innerHTML = `
            <div class="chat-bubble">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
    }

    async function handleBotReply(queryText) {
        showTypingIndicator();
        
        // Add user query to chat history
        chatHistory.push({
            role: "user",
            parts: [{ text: queryText }]
        });
        
        // Limit history size to last 10 turns (20 roles max)
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: chatHistory,
                    systemInstruction: {
                        parts: [{ text: SYSTEM_INSTRUCTION }]
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API returned status ${response.status}`);
            }

            const data = await response.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!replyText) {
                throw new Error("Empty or invalid candidate response from Gemini API");
            }

            // Convert simple Markdown markers from Gemini into HTML tags
            let formattedReply = replyText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Render markdown lists correctly into HTML lists
            const lines = formattedReply.split('\n');
            let inList = false;
            let finalLines = [];
            for (let line of lines) {
                const listMatch = line.match(/^\s*[\*\-\+]\s+(.*)$/);
                if (listMatch) {
                    if (!inList) {
                        finalLines.push('<ul>');
                        inList = true;
                    }
                    finalLines.push(`<li>${listMatch[1]}</li>`);
                } else {
                    if (inList) {
                        finalLines.push('</ul>');
                        inList = false;
                    }
                    finalLines.push(line);
                }
            }
            if (inList) {
                finalLines.push('</ul>');
            }
            formattedReply = finalLines.join('<br>').replace(/<\/ul><br>/g, '</ul>').replace(/<br><ul>/g, '<ul>');

            hideTypingIndicator();
            appendMessage('bot', formattedReply);

            // Save the model's reply to local history
            chatHistory.push({
                role: "model",
                parts: [{ text: replyText }]
            });

        } catch (error) {
            console.error("Gemini API call failed, falling back to static rules:", error);
            
            // Graceful fallback to static rule engine
            setTimeout(() => {
                hideTypingIndicator();
                const reply = getBotResponse(queryText);
                appendMessage('bot', reply);
                
                chatHistory.push({
                    role: "model",
                    parts: [{ text: reply }]
                });
            }, 600 + Math.random() * 400);
        }
    }

    let welcomeSent = false;
    
    if (chatToggle && chatWindow) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            chatToggle.classList.toggle('active');
            
            // If chat is open, hide the pulse effect
            if (chatWindow.classList.contains('open')) {
                const pulse = chatToggle.querySelector('.chat-pulse');
                if (pulse) pulse.style.display = 'none';
                
                // Send welcome message if it's the first time opening
                if (!welcomeSent) {
                    welcomeSent = true;
                    showTypingIndicator();
                    setTimeout(() => {
                        hideTypingIndicator();
                        appendMessage('bot', `Hi there! 👋 I'm Juhail's virtual assistant. How can I help you learn more about his work as a Data Analyst?`);
                    }, 1000);
                }
            } else {
                const pulse = chatToggle.querySelector('.chat-pulse');
                if (pulse) pulse.style.display = 'block';
            }
        });
    }

    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.classList.remove('open');
            chatToggle.classList.remove('active');
            const pulse = chatToggle.querySelector('.chat-pulse');
            if (pulse) pulse.style.display = 'block';
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWindow && chatWindow.classList.contains('open')) {
            chatWindow.classList.remove('open');
            chatToggle.classList.remove('active');
            const pulse = chatToggle.querySelector('.chat-pulse');
            if (pulse) pulse.style.display = 'block';
        }
    });

    if (chatSuggestions) {
        chatSuggestions.addEventListener('click', (e) => {
            const btn = e.target.closest('.chat-suggestion-btn');
            if (!btn) return;
            
            const question = btn.getAttribute('data-question');
            appendMessage('user', question);
            handleBotReply(question);
        });

        // Translate vertical mouse wheel scrolling into horizontal scrolling
        chatSuggestions.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                chatSuggestions.scrollLeft += e.deltaY;
            }
        });
    }

    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            
            appendMessage('user', text);
            chatInput.value = '';
            handleBotReply(text);
        });
    }

    // --- Profile Picture Modal Dialog ---
    const heroPortrait = document.querySelector('.hero-portrait-img');
    const avatarModal = document.getElementById('avatarModal');
    const avatarCloseBtn = document.querySelector('.avatar-popup-close');

    if (heroPortrait && avatarModal) {
        heroPortrait.addEventListener('click', () => {
            avatarModal.classList.add('show');
        });
    }

    if (avatarCloseBtn && avatarModal) {
        avatarCloseBtn.addEventListener('click', () => {
            avatarModal.classList.remove('show');
        });

        // Close on clicking outside the image
        avatarModal.addEventListener('click', (e) => {
            if (e.target === avatarModal) {
                avatarModal.classList.remove('show');
            }
        });
    }

    // Connect chatbot static elements to the custom cursor hover effect
    if (cursorOutline) {
        const chatbotInteractives = [
            chatToggle,
            chatClose,
            chatInput,
            chatSend,
            ...document.querySelectorAll('.chat-suggestion-btn')
        ];
        
        chatbotInteractives.forEach(el => {
            if (el) {
                el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
            }
        });
    }
});
