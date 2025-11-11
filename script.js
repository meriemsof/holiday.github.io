// Charger les destinations dynamiquement
async function loadDestinations() {
    const destinations = ['amsterdam', 'geneva', 'chalet', 'istanbul'];
    const container = document.getElementById('destinations-container');
    
    if (!container) return;
    
    for (const destination of destinations) {
        try {
            const response = await fetch(`destination-${destination}.html`);
            if (response.ok) {
                const html = await response.text();
                container.innerHTML += html;
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de ${destination}:`, error);
        }
    }
    
    // Une fois les destinations chargées, initialiser les animations
    initializeAnimations();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialiser les animations après chargement des destinations
function initializeAnimations() {
    const destinationCards = document.querySelectorAll('.destination-card');
    
    destinationCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    // Add hover effect to transport options
    const transportOptions = document.querySelectorAll('.transport-option');
    transportOptions.forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
        });
        
        option.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Add click animation to booking buttons
    const bookingButtons = document.querySelectorAll('.btn-outline-primary');
    bookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Dynamic price calculation display
    setupPriceAnimations();

    // Add weather info (simulated)
    addWeatherInfo();
}

// Observe destination cards
document.addEventListener('DOMContentLoaded', () => {
    // Charger les destinations en premier
    loadDestinations();

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.2)';
        }
    });

    // Add snow effect
    createSnowflakes();
});

// Create falling snowflakes
function createSnowflakes() {
    const snowContainer = document.querySelector('.snow-overlay');
    const snowflakeCount = 50;
    
    for (let i = 0; i < snowflakeCount; i++) {
        setTimeout(() => {
            const snowflake = document.createElement('div');
            snowflake.innerHTML = '❄';
            snowflake.style.position = 'absolute';
            snowflake.style.color = 'rgba(255, 255, 255, 0.8)';
            snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.top = '-20px';
            snowflake.style.pointerEvents = 'none';
            snowflake.style.animation = `fall ${Math.random() * 3 + 5}s linear infinite`;
            snowflake.style.animationDelay = Math.random() * 5 + 's';
            
            if (snowContainer) {
                snowContainer.appendChild(snowflake);
            }
        }, i * 100);
    }
    
    // Add CSS animation for falling snow
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0.3;
            }
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Animate price numbers
function setupPriceAnimations() {
    const priceElements = document.querySelectorAll('.price-highlight, .total-price .fs-4');
    
    priceElements.forEach(element => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animatePrice(element);
                    observer.unobserve(element);
                }
            });
        });
        
        observer.observe(element);
    });
}

function animatePrice(element) {
    const text = element.textContent;
    const priceMatch = text.match(/(\d+)/);
    
    if (priceMatch) {
        const targetPrice = parseInt(priceMatch[0]);
        const duration = 1500;
        const steps = 60;
        const increment = targetPrice / steps;
        let current = 0;
        let step = 0;
        
        const interval = setInterval(() => {
            current += increment;
            step++;
            
            if (step >= steps) {
                current = targetPrice;
                clearInterval(interval);
            }
            
            element.textContent = text.replace(/\d+/, Math.floor(current).toString());
        }, duration / steps);
    }
}

// Add simulated weather information
function addWeatherInfo() {
    const destinations = [
        { name: 'Amsterdam', temp: '7°C / 5°C', condition: '🌨️ ' },
        { name: 'Genève', temp: '6°C / -2°C', condition: '❄️ ' },
        { name: 'Fontainebleau', temp: '3°C', condition: '☁️ ' },
        { name: 'Istanbul', temp: '11°C / 8°C', condition: '☀️ ' }
    ];
    
    const destinationCards = document.querySelectorAll('.destination-card');
    
    destinationCards.forEach((card, index) => {
        if (destinations[index]) {
            const cardBody = card.querySelector('.card-body');
            const weatherDiv = document.createElement('div');
            weatherDiv.className = 'weather-info mt-3 p-2 bg-light rounded';
            weatherDiv.innerHTML = `
                <small class="text-muted">
                    <i class="fas fa-cloud"></i> 
                    Météo prévue: <strong>${destinations[index].temp}</strong> 
                    ${destinations[index].condition}
                </small>
            `;
            
            const dateInfo = cardBody.querySelector('.date-info');
            if (dateInfo) {
                dateInfo.insertAdjacentElement('afterend', weatherDiv);
            }
        }
    });
}

// Add countdown timer for early booking
function addCountdownTimer() {
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'alert alert-warning text-center fixed-top mt-5';
    countdownDiv.style.zIndex = '1000';
    countdownDiv.innerHTML = `
        <i class="fas fa-clock me-2"></i>
        <strong>Offre limitée!</strong> Réservez dans les prochaines 
        <span id="countdown">48:00:00</span> 
        pour bénéficier de 10% de réduction!
    `;
    
    // This would typically be added to the page, but keeping it simple
    // document.body.appendChild(countdownDiv);
}

// Log page load time
window.addEventListener('load', () => {
    console.log('🎿 Site de planification de vacances chargé avec succès!');
    console.log('❄️ Bonne organisation de vacances!');
});

// Ajouter un bouton de retour en haut
function addScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'btn btn-primary position-fixed bottom-0 end-0 m-4 scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.style.zIndex = '1000';
    scrollBtn.style.display = 'none';
    scrollBtn.style.borderRadius = '50%';
    scrollBtn.style.width = '50px';
    scrollBtn.style.height = '50px';
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
    
    document.body.appendChild(scrollBtn);
}

// Initialize scroll to top button
document.addEventListener('DOMContentLoaded', () => {
    addScrollToTopButton();
});

// Share functionality
function shareDestination(destinationName) {
    if (navigator.share) {
        navigator.share({
            title: `Vacances d'Hiver - ${destinationName}`,
            text: `Découvrez cette offre incroyable pour ${destinationName}!`,
            url: window.location.href
        }).catch(err => console.log('Erreur de partage:', err));
    } else {
        // Fallback for browsers that don't support Web Share API
        alert('Copiez ce lien pour partager: ' + window.location.href);
    }
}

// Add favorite/like functionality
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function toggleFavorite(destinationName) {
    const index = favorites.indexOf(destinationName);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(destinationName);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    // This would update heart icons on the cards
    console.log('Favoris mis à jour:', favorites);
}

// Initialize favorites on load
document.addEventListener('DOMContentLoaded', updateFavoriteButtons);
