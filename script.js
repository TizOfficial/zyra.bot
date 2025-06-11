document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
         // Prevent scrolling when mobile menu is open
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            // Check if it's a mobile menu and open
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                // Re-enable scrolling
                document.body.style.overflow = '';
            }
        });
    });

    // Smooth scroll for anchor links on the *same* page
    // This specifically targets links starting with '#' and checks if they are on the current page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
             // Check if the target is not just '#' and the element exists on the current page
            if (targetId !== '#' && document.querySelector(targetId)) {
                 e.preventDefault(); // Only prevent default if target is on this page
                 const targetElement = document.querySelector(targetId);
                 // Get dynamic header height from CSS variable or fallback
                 const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 70; // Default to 70px
                 const elementPosition = targetElement.getBoundingClientRect().top;
                 const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // Add extra offset for padding

                 window.scrollTo({
                     top: offsetPosition,
                     behavior: 'smooth'
                 });
            }
            // If the link is just '#' or targets an element NOT on this page,
            // the default behavior (browser navigation or staying in place) will occur.
        });
    });

    // Optional: Add a class to header on scroll for styling (e.g., background change)
     window.addEventListener('scroll', () => {
         if (window.scrollY > 50) { // Adjust threshold as needed
             header.classList.add('scrolled');
         } else {
             header.classList.remove('scrolled');
         }
     });
});