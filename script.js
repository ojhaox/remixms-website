// Get the modal elements
const registerModal = document.getElementById('registerModal');
const downloadModal = document.getElementById('downloadModal');
const registerBtn = document.getElementById('registerBtn');
const downloadBtn = document.getElementById('downloadBtn');
const closeBtns = document.querySelectorAll('.close-modal');

// When the user clicks the register button, open the modal
registerBtn.addEventListener('click', function(e) {
    e.preventDefault();
    registerModal.style.display = 'block';
});

// When the user clicks the download button, open the modal
downloadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    downloadModal.style.display = 'block';
});

// When the user clicks on any close button, close the modal
closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        registerModal.style.display = 'none';
        downloadModal.style.display = 'none';
    });
});

// When the user clicks anywhere outside the modal, close it
window.addEventListener('click', function(event) {
    if (event.target == registerModal) {
        registerModal.style.display = 'none';
    }
    if (event.target == downloadModal) {
        downloadModal.style.display = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.backgroundColor = 'white';
    }
});

// Animate feature cards on scroll
const featureCards = document.querySelectorAll('.feature-card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(card);
}); 