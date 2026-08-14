/* Finova Capital - Global Interactivity & Animations Script */

const initGlobal = () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Preloader Animation
    initPreloader();

    // 3. Floating Header Navigation
    initHeaderScroll();

    // 4. Mobile Menu Toggle
    initMobileNav();

    // 5. Scroll Reveal Intersection Observer
    initScrollReveal();

    // 6. Number Counter Animation
    initNumberCounters();

    // 7. Progress Bar Animations
    initProgressBars();

    // 8. Magnetic Buttons Effect
    initMagneticButtons();

    // 9. Ripple Button Effect
    initRippleButtons();

    // 10. Back to Top Button
    initBackToTop();

    // 11. Hero Parallax Effects
    initHeroParallax();

    // 12. Scroll Progress Bar
    initScrollProgress();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobal);
} else {
    initGlobal();
}

/* ==========================================
   2. Preloader Animation
   ========================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');
    const percentText = document.getElementById('preloader-percent');
    
    if (!preloader) return;

    let percentage = 0;
    const duration = 1800; // Total loading time in ms
    const intervalTime = 15; // Incremental interval
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
        percentage += step;
        if (percentage >= 100) {
            percentage = 100;
            clearInterval(interval);
            
            // Short delay at 100% for premium feel
            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.classList.add('preloader-complete');
                
                // Allow page scroll after loading completes
                document.body.style.overflow = '';
                
                // Completely remove from visual flow after transition completes
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 800);
            }, 300);
        }
        
        if (progressBar) progressBar.style.width = percentage + '%';
        if (percentText) percentText.textContent = Math.floor(percentage);
    }, intervalTime);
    
    // Prevent scrolling while preloader runs
    document.body.style.overflow = 'hidden';
}

/* ==========================================
   3. Floating Header Navigation
   ========================================== */
function initHeaderScroll() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================
   4. Mobile Menu Toggle
   ========================================== */
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const links = document.querySelectorAll('.mobile-nav-link, .mobile-nav-actions .btn');

    if (!hamburger || !sidebar || !overlay) return;

    hamburger.setAttribute('aria-label', 'Open navigation');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'mobile-sidebar');
    sidebar.setAttribute('id', 'mobile-sidebar');

  

    // Convert FontAwesome contact icons to Lucide icons
    const contactItems = sidebar.querySelectorAll('.mobile-contact-info .contact-item');
    contactItems.forEach(item => {
        const faIcon = item.querySelector('i.fa-solid');
        if (faIcon) {
            const newIcon = document.createElement('i');
            if (faIcon.classList.contains('fa-location-dot')) {
                newIcon.setAttribute('data-lucide', 'map-pin');
            } else if (faIcon.classList.contains('fa-phone')) {
                newIcon.setAttribute('data-lucide', 'phone');
            } else if (faIcon.classList.contains('fa-envelope')) {
                newIcon.setAttribute('data-lucide', 'mail');
            }
            newIcon.style.width = '16px';
            newIcon.style.height = '16px';
            newIcon.style.marginRight = '8px';
            newIcon.style.color = 'var(--color-primary)';
            
            faIcon.parentNode.replaceChild(newIcon, faIcon);
        }
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const preventDefault = (e) => {
        // Allow scrolling inside the sidebar, block everything else
        if (sidebar.contains(e.target)) {
            return;
        }
        e.preventDefault();
    };

    const openMenu = () => {
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        sidebar.classList.add('is-active');
        overlay.classList.add('is-active');
        document.body.classList.add('menu-open');
        document.documentElement.classList.add('menu-open');
        document.body.style.overflow = "hidden";

        // Block background page scroll (wheel + touch swipe)
        window.addEventListener('wheel', preventDefault, { passive: false });
        window.addEventListener('touchmove', preventDefault, { passive: false });
    };

    const closeMenu = () => {
        if (!sidebar.classList.contains('is-active')) return;
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        sidebar.classList.remove('is-active');
        overlay.classList.remove('is-active');
        document.body.classList.remove('menu-open');
        document.documentElement.classList.remove('menu-open');
        document.body.style.overflow = "";

        // Restore scroll
        window.removeEventListener('wheel', preventDefault);
        window.removeEventListener('touchmove', preventDefault);
    };

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar.classList.contains('is-active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}

function initScrollReveal() {
    // 1. Automatically find grids/containers with reveal-hidden and distribute to children
    const containers = document.querySelectorAll(
        '.premium-grid-2.reveal-hidden, .premium-grid-3.reveal-hidden, .premium-grid-4.reveal-hidden, ' +
        '.grid-2.reveal-hidden, .grid-3.reveal-hidden, .grid-4.reveal-hidden, ' +
        '.timeline-container.reveal-hidden, .separated-grid.reveal-hidden'
    );

    containers.forEach(container => {
        // Find reveal classes on the container to copy to children
        const revealClasses = [];
        container.classList.forEach(cls => {
            if (cls.startsWith('reveal-')) {
                revealClasses.push(cls);
            }
        });

        // Get direct children (excluding line/decorative elements if timeline)
        let children = Array.from(container.children);
        if (container.classList.contains('timeline-container')) {
            children = children.filter(child => child.classList.contains('timeline-item'));
        } else {
            children = children.filter(child => child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE');
        }

        // Remove reveal classes from container so container itself doesn't animate/hide
        revealClasses.forEach(cls => container.classList.remove(cls));

        // Distribute to children with stagger delay
        children.forEach((child, index) => {
            revealClasses.forEach(cls => child.classList.add(cls));
            // Card stagger delay: 80ms step
            const delay = index * 80;
            child.style.transitionDelay = `${delay}ms`;
        });
    });

    // 2. Now observe all reveal-hidden elements (which now includes the children)
    const revealElements = document.querySelectorAll('.reveal-hidden');
    if (revealElements.length === 0) return;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================
   6. Number Counter Animation
   ========================================== */
function initNumberCounters() {
    const elements = document.querySelectorAll('.stat-value, .fv-hero__stat-value, .counter');
    if (elements.length === 0) return;

    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const originalText = target.textContent.trim();
                
                // Regex parses: optional prefix, followed by number with dots/commas, followed by optional suffix
                const match = originalText.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
                if (!match) {
                    observer.unobserve(target);
                    return;
                }
                
                const prefix = match[1];
                const numberStr = match[2];
                const suffix = match[3];
                
                // Parse float from numberStr, removing commas
                const targetNum = parseFloat(numberStr.replace(/,/g, ''));
                if (isNaN(targetNum)) {
                    observer.unobserve(target);
                    return;
                }
                
                // Detect decimals
                const decimalMatch = numberStr.match(/\.(\d+)/);
                const decimals = decimalMatch ? decimalMatch[1].length : 0;
                
                const duration = 1800; // Counter duration in ms
                const startTime = performance.now();
                
                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Out-cubic easing function
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentNum = easeProgress * targetNum;
                    
                    // Format number back
                    let formattedNum = currentNum.toFixed(decimals);
                    
                    // Add back commas if present in original string
                    if (numberStr.includes(',')) {
                        const parts = formattedNum.split('.');
                        parts[0] = parseInt(parts[0], 10).toLocaleString();
                        formattedNum = parts.join('.');
                    }
                    
                    target.textContent = prefix + formattedNum + suffix;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        target.textContent = originalText;
                    }
                };
                
                requestAnimationFrame(updateCount);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => countObserver.observe(el));
}

/* ==========================================
   7. Progress Bar Animations
   ========================================== */
function initProgressBars() {
    const progressFills = document.querySelectorAll('.progress-fill');
    if (progressFills.length === 0) return;

    const progressObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.getAttribute('data-width');
                fill.style.width = targetWidth + '%';
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.2 });

    progressFills.forEach(fill => progressObserver.observe(fill));
}

/* ==========================================
   8. Magnetic Buttons Effect
   ========================================== */
function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.btn-magnetic');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            // Move button slightly towards cursor
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            // Smoothly snap back
            btn.style.transform = '';
        });
    });
}

/* ==========================================
   9. Ripple Button Effect
   ========================================== */
function initRippleButtons() {
    const buttons = document.querySelectorAll('.btn, .btn-ripple');

    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/* ==========================================
   10. Back to Top Button
   ========================================== */
function initBackToTop() {
    const bttBtn = document.getElementById('back-to-top');
    if (!bttBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            bttBtn.classList.add('show');
        } else {
            bttBtn.classList.remove('show');
        }
    });

    bttBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ==========================================
   11. Hero Parallax Effects
   ========================================== */
function initHeroParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;

    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 45;
        const y = (window.innerHeight / 2 - e.clientY) / 45;

        const widgets = heroVisual.querySelectorAll('.hero-widget, .dashboard-preview-card');
        const img = heroVisual.querySelector('.hero-image-container');

        if (img) {
            img.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        }

        widgets.forEach((widget, index) => {
            const factor = (index + 1) * 0.5;
            widget.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });
}

/* ==========================================
   12. Scroll Progress Bar
   ========================================== */
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';
    document.body.appendChild(bar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        bar.style.width = scrolled + '%';
    });
}

// Global scroll interceptor for background locking (public site + client/admin portals)
(function() {
    const preventBgScroll = (e) => {
        // 1. Public Mobile Sidebar
        if (document.body.classList.contains('menu-open')) {
            const sidebar = document.querySelector('.mobile-sidebar');
            if (sidebar && sidebar.contains(e.target)) {
                return;
            }
            e.preventDefault();
        }
        // 2. Client & Admin Dashboard Sidebars
        if (document.body.classList.contains('sidebar-open')) {
            const dashSidebar = document.querySelector('.dashboard-sidebar, #admin-sidebar');
            if (dashSidebar && dashSidebar.contains(e.target)) {
                return;
            }
            e.preventDefault();
        }
    };

    window.addEventListener('wheel', preventBgScroll, { passive: false });
    window.addEventListener('touchmove', preventBgScroll, { passive: false });
})();


window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});




function saveClientLogin() {
    const email = document.getElementById("client-email").value.trim();

    // Email-ல் @க்கு முன்னாடி இருக்கும் name
    const name = email.split("@")[0];

    localStorage.setItem("loggedInUserName", name);

    window.location.href = "dashboard-user.html";
}
