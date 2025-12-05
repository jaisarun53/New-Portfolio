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

// Load blog posts - Try API first, then fallback to JSON
async function loadBlogPosts() {
    const blogContainer = document.getElementById('blog-container');
    let posts = [];
    
    // Try API first if configured (for admin users)
    const apiUrl = localStorage.getItem('apiBaseUrl');
    if (apiUrl && typeof fetchPostsFromAPI !== 'undefined') {
        try {
            posts = await fetchPostsFromAPI();
            if (posts && posts.length > 0) {
                // Update localStorage cache
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                renderPosts(posts);
                return;
            }
        } catch (error) {
            console.error('API load error:', error);
            // Fall through to JSON fallback
        }
    }
    
    // Fallback: Load from blog.json (server file - visible to all visitors)
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
    
    renderPosts(posts);
}

// Render posts to the page
function renderPosts(posts) {
    const blogContainer = document.getElementById('blog-container');
    
    if (!blogContainer) return;
    
    if (posts.length > 0) {
        // Sort posts by date (newest first)
        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        blogContainer.innerHTML = sortedPosts.map(post => {
            // Truncate content for preview (first 200 chars)
            const previewContent = post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
            return `
            <div class="blog-post">
                <div class="blog-header">
                    <span class="blog-date">${formatDate(post.date)}</span>
                    ${post.category ? `<span class="blog-category">${escapeHtml(post.category)}</span>` : ''}
                </div>
                <h3 class="blog-title">
                    <a href="blog-post.html?id=${post.id}" class="blog-title-link">${escapeHtml(post.title)}</a>
                </h3>
                <div class="blog-preview">${previewContent}</div>
                <a href="blog-post.html?id=${post.id}" class="read-more">Read More →</a>
            </div>
        `;
        }).join('');
        
        // Add copy buttons to code blocks in previews
        addCopyButtonsToCodeBlocks();
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

// Add copy buttons to code blocks
function addCopyButtonsToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.blog-content pre, .blog-preview pre');
    codeBlocks.forEach((pre) => {
        // Skip if button already exists
        if (pre.querySelector('.copy-code-btn')) return;
        
        const code = pre.querySelector('code');
        if (!code) return;
        
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.innerHTML = '<i class="bx bx-copy"></i> Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        
        button.addEventListener('click', async () => {
            const text = code.textContent || code.innerText;
            try {
                await navigator.clipboard.writeText(text);
                button.innerHTML = '<i class="bx bx-check"></i> Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerHTML = '<i class="bx bx-copy"></i> Copy';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    button.innerHTML = '<i class="bx bx-check"></i> Copied!';
                    button.classList.add('copied');
                    setTimeout(() => {
                        button.innerHTML = '<i class="bx bx-copy"></i> Copy';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (e) {
                    alert('Failed to copy code');
                }
                document.body.removeChild(textarea);
            }
        });
        
        pre.appendChild(button);
    });
}

// Load blog posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);

// Hidden admin access shortcut (Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        window.location.href = 'admin-login.html';
    }
});