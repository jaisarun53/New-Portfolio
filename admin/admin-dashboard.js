// Initialize Quill Editor
let quill;
let currentPostId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initQuill();
    loadPosts();
    setupEventListeners();
    setDefaultDate();
});

// Initialize Quill rich text editor
function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image', 'code-block'],
                ['blockquote'],
                ['clean']
            ]
        }
    });
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('postDate').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Post form submission
    document.getElementById('postForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePost();
    });

    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('passwordMessage');

        if (newPassword !== confirmPassword) {
            messageDiv.textContent = 'New passwords do not match';
            messageDiv.className = 'message error';
            return;
        }

        if (newPassword.length < 6) {
            messageDiv.textContent = 'Password must be at least 6 characters';
            messageDiv.className = 'message error';
            return;
        }

        const success = await changePassword(oldPassword, newPassword);
        if (success) {
            messageDiv.textContent = 'Password changed successfully!';
            messageDiv.className = 'message success';
            document.getElementById('passwordForm').reset();
        } else {
            messageDiv.textContent = 'Current password is incorrect';
            messageDiv.className = 'message error';
        }
    });

    // GitHub token form submission
    document.getElementById('githubTokenForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const token = document.getElementById('githubToken').value.trim();
        const messageDiv = document.getElementById('githubTokenMessage');
        const statusDiv = document.getElementById('tokenStatus');

        if (!token) {
            messageDiv.textContent = 'Please enter a GitHub token';
            messageDiv.className = 'message error';
            return;
        }

        // Test token
        messageDiv.textContent = 'Testing token...';
        messageDiv.className = 'message';
        const isValid = await testGitHubToken(token);

        if (isValid) {
            saveGitHubToken(token);
            messageDiv.textContent = 'GitHub token saved successfully!';
            messageDiv.className = 'message success';
            statusDiv.innerHTML = '<span class="token-status-ok">✅ Token configured - Auto-publish enabled</span>';
            document.getElementById('githubToken').value = '';
            loadTokenStatus();
        } else {
            messageDiv.textContent = 'Invalid token. Please check your token and try again.';
            messageDiv.className = 'message error';
            statusDiv.innerHTML = '';
        }
    });

    // Load token status on page load
    loadTokenStatus();
}

// Load and display token status
function loadTokenStatus() {
    const token = getGitHubToken();
    const statusDiv = document.getElementById('tokenStatus');
    if (token) {
        statusDiv.innerHTML = '<span class="token-status-ok">✅ Auto-publish enabled</span>';
    } else {
        statusDiv.innerHTML = '<span class="token-status-none">⚠️ Auto-publish disabled - Add GitHub token to enable</span>';
    }
}

// Show specific section
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    if (sectionName === 'new-post') {
        document.getElementById('new-post-section').classList.add('active');
        if (!currentPostId) {
            resetForm();
        }
    } else if (sectionName === 'posts') {
        document.getElementById('posts-section').classList.add('active');
        loadPosts();
    } else if (sectionName === 'settings') {
        document.getElementById('settings-section').classList.add('active');
    } else if (sectionName === 'export') {
        document.getElementById('export-section').classList.add('active');
    }
}

// Load posts from localStorage and sync with blog.json
function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    // Always try to sync with blog.json (server file) to get latest posts
    fetch('../data/blog.json')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('blog.json not found');
        })
        .then(data => {
            if (data.posts && data.posts.length > 0) {
                // Merge: Use server posts as source of truth, but keep any new local posts
                const serverPostIds = new Set(data.posts.map(p => p.id));
                const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
                
                // Add any local posts that aren't on server (newly created, not yet exported)
                const newLocalPosts = localPosts.filter(p => !serverPostIds.has(p.id));
                const mergedPosts = [...data.posts, ...newLocalPosts];
                
                // Update localStorage with merged posts
                localStorage.setItem('blogPosts', JSON.stringify(mergedPosts));
                displayPosts(mergedPosts);
            } else if (posts.length > 0) {
                // No server posts, but have local posts
                displayPosts(posts);
            } else {
                displayPosts([]);
            }
        })
        .catch(() => {
            // blog.json not available, use localStorage only
            if (posts.length > 0) {
                displayPosts(posts);
            } else {
                displayPosts([]);
            }
        });
}

// Display posts in the list
function displayPosts(posts) {
    const postsList = document.getElementById('postsList');
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p class="no-posts">No blog posts yet. Create your first post!</p>';
        return;
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    postsList.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-card-header">
                <h3>${escapeHtml(post.title)}</h3>
                <div class="post-actions">
                    <button class="btn-edit" onclick="editPost(${post.id})" title="Edit">
                        <i class="bx bx-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deletePost(${post.id})" title="Delete">
                        <i class="bx bx-trash"></i>
                    </button>
                </div>
            </div>
            <div class="post-card-body">
                <div class="post-meta">
                    <span class="post-date"><i class="bx bx-calendar"></i> ${formatDate(post.date)}</span>
                    ${post.category ? `<span class="post-category">${escapeHtml(post.category)}</span>` : ''}
                </div>
                <div class="post-preview">${truncateHtml(post.content, 150)}</div>
            </div>
        </div>
    `).join('');
}

// Save post (create or update)
async function savePost() {
    const title = document.getElementById('postTitle').value.trim();
    const date = document.getElementById('postDate').value;
    const category = document.getElementById('postCategory').value.trim();
    const content = quill.root.innerHTML;

    if (!title || !date || !content || content === '<p><br></p>') {
        alert('Please fill in all required fields');
        return;
    }

    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    if (currentPostId) {
        // Update existing post
        const index = posts.findIndex(p => p.id === currentPostId);
        if (index !== -1) {
            posts[index] = {
                id: currentPostId,
                title,
                date,
                category: category || null,
                content
            };
        }
    } else {
        // Create new post
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        posts.push({
            id: newId,
            title,
            date,
            category: category || null,
            content
        });
    }

    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // Auto-publish to GitHub
    const token = getGitHubToken();
    if (token) {
        // Show loading
        const saveBtn = document.querySelector('.btn-save');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Publishing...';
        saveBtn.disabled = true;
        
        try {
            await publishToGitHub();
            alert('✅ Post saved and published successfully!\n\nYour blog post is now live on your website!');
            resetForm();
            showSection('posts');
            loadPosts();
        } catch (error) {
            console.error('Publish error:', error);
            const shouldExport = confirm(`⚠️ Auto-publish failed: ${error.message}\n\nWould you like to export blog.json manually?`);
            if (shouldExport) {
                resetForm();
                showSection('export');
                setTimeout(() => exportBlog(), 500);
            } else {
                resetForm();
                showSection('posts');
            }
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    } else {
        // No token configured, offer to export
        const shouldExport = confirm('Post saved!\n\n⚠️ GitHub token not configured. To auto-publish, add your GitHub token in Settings.\n\nWould you like to export blog.json manually?');
        if (shouldExport) {
            resetForm();
            showSection('export');
            setTimeout(() => exportBlog(), 500);
        } else {
            resetForm();
            showSection('posts');
        }
    }
}

// Edit post
function editPost(id) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const post = posts.find(p => p.id === id);
    
    if (!post) return;

    currentPostId = id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postDate').value = post.date;
    document.getElementById('postCategory').value = post.category || '';
    quill.root.innerHTML = post.content;
    document.getElementById('post-form-title').textContent = 'Edit Blog Post';

    showSection('new-post');
}

// Delete post
function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    loadPosts();
    
    // Remind to export
    setTimeout(() => {
        if (confirm('Post deleted!\n\n⚠️ Remember to export blog.json and upload to GitHub to update your website.')) {
            showSection('export');
        }
    }, 500);
}

// Cancel edit
function cancelEdit() {
    resetForm();
    showSection('posts');
}

// Reset form
function resetForm() {
    currentPostId = null;
    document.getElementById('postForm').reset();
    quill.root.innerHTML = '';
    setDefaultDate();
    document.getElementById('post-form-title').textContent = 'New Blog Post';
}

// Export blog to JSON file
function exportBlog() {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    if (posts.length === 0) {
        alert('No posts to export');
        return;
    }

    const blogData = {
        posts: posts.map(post => ({
            id: post.id,
            date: post.date,
            title: post.title,
            content: post.content,
            category: post.category || null
        }))
    };

    const blob = new Blob([JSON.stringify(blogData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const instructions = `✅ blog.json downloaded!\n\n📤 TO MAKE POSTS VISIBLE ON YOUR WEBSITE:\n\n1. Go to your GitHub repository\n2. Upload the downloaded blog.json file to the data/ folder (replace data/blog.json)\n3. Commit and push the changes\n4. Wait 1-2 minutes for GitHub Pages to update\n\nYour blog posts will then appear on your website!`;
    alert(instructions);
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncateHtml(html, maxLength) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    if (text.length <= maxLength) return html;
    return text.substring(0, maxLength) + '...';
}

