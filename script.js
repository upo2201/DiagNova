// Simple script to handle active states on sidebar navigation
// Ideal for demonstrating functionality without full routing

document.addEventListener("DOMContentLoaded", () => {
    // Select all navigation links
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior for static prototype UI
            
            // Remove 'active' class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add 'active' class to the currently clicked link
            this.classList.add('active');
            
            // Example of how you could switch sections (currently static)
            if (this.textContent !== 'Home') {
                console.log(`User selected: ${this.textContent} view...`);
            }
        });
    });
});
