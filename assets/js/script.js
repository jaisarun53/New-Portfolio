let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

document.getElementById("year").textContent = new Date().getFullYear();

window.onscroll = () => {

    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height){
            navLinks.forEach(links =>{
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ' ]').classList.add('active')
            })
        }
    })
}

menuIcon.onclick = () =>{
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active')
}

// Load blog posts
async function loadBlogPosts() {
    const blogContainer = document.getElementById('blog-container');
    let posts = [];
    
    // PRIORITY: Load from blog.json first (server file - visible to all visitors)
    try {
        const response = await fetch('data/blog.json');
        const data = await response.json();
        if (data.posts && data.posts.length > 0) {
            posts = data.posts;
            // Update localStorage cache for admin panel
            localStorage.setItem('blogPosts', JSON.stringify(posts));
        }
    } catch (error) {
        console.error('Error loading blog.json:', error);
        // Fallback: Try localStorage if blog.json fails (for local testing)
        const storedPosts = localStorage.getItem('blogPosts');
        if (storedPosts) {
            try {
                posts = JSON.parse(storedPosts);
            } catch (e) {
                console.error('Error parsing stored posts:', e);
            }
        }
    }
    
    if (posts.length > 0) {
        // Sort posts by date (newest first)
        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        blogContainer.innerHTML = sortedPosts.map(post => `
            <div class="blog-post">
                <div class="blog-header">
                    <span class="blog-date">${formatDate(post.date)}</span>
                    ${post.category ? `<span class="blog-category">${escapeHtml(post.category)}</span>` : ''}
                </div>
                <h3 class="blog-title">${escapeHtml(post.title)}</h3>
                <div class="blog-content">${post.content}</div>
            </div>
        `).join('');
    } else {
        blogContainer.innerHTML = '<p class="no-posts">No blog posts yet. Check back soon!</p>';
    }
}

// Escape HTML to prevent XSS (for title and category)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Load blog posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);

// Hidden admin access shortcut (Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        window.location.href = 'admin/admin-login.html';
    }
});