// Initialize Quill Editor
let quill;
let currentPostId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Check if we're on the dashboard page
        if (!document.getElementById('postsList')) {
            console.error('Dashboard elements not found');
            return;
        }
        
        initQuill();
        loadPosts();
        setupEventListeners();
        setDefaultDate();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error loading admin dashboard. Please refresh the page.');
    }
});

// Initialize Quill rich text editor
function initQuill() {
    const editorElement = document.getElementById('editor');
    if (!editorElement) {
        console.warn('Editor element not found');
        return;
    }
    
    if (typeof Quill === 'undefined') {
        console.error('Quill.js library not loaded. Please check your internet connection.');
        editorElement.innerHTML = '<p style="color: red; padding: 2rem;">Error: Rich text editor failed to load. Please refresh the page.</p>';
        return;
    }
    
    try {
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
    } catch (error) {
        console.error('Error initializing Quill:', error);
        editorElement.innerHTML = '<p style="color: red; padding: 2rem;">Error initializing editor. Please refresh the page.</p>';
    }
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

    // API config form submission
    const apiConfigForm = document.getElementById('apiConfigForm');
    if (apiConfigForm) {
        apiConfigForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const apiUrl = document.getElementById('apiBaseUrl').value.trim();
            const messageDiv = document.getElementById('apiMessage');
            const statusDiv = document.getElementById('apiStatus');

            if (!apiUrl) {
                messageDiv.textContent = 'Please enter an API URL';
                messageDiv.className = 'message error';
                return;
            }

            // Test connection
            messageDiv.textContent = 'Testing connection...';
            messageDiv.className = 'message';
            
            try {
                // Temporarily set the URL to test
                const originalUrl = getApiBaseUrl();
                setApiBaseUrl(apiUrl);
                
                const isConnected = await BlogAPI.testConnection();
                
                if (isConnected) {
                    setApiBaseUrl(apiUrl);
                    messageDiv.textContent = 'API connection successful!';
                    messageDiv.className = 'message success';
                    statusDiv.innerHTML = '<span class="token-status-ok">✅ API configured - Database mode enabled</span>';
                    // Reload posts from API
                    await loadPosts();
                } else {
                    setApiBaseUrl(originalUrl); // Restore original
                    messageDiv.textContent = 'Connection failed. Please check your API URL and ensure the server is running.';
                    messageDiv.className = 'message error';
                    statusDiv.innerHTML = '';
                }
            } catch (error) {
                messageDiv.textContent = `Connection error: ${error.message}`;
                messageDiv.className = 'message error';
                statusDiv.innerHTML = '';
            }
        });
        
        // Load saved API URL on page load
        const savedUrl = localStorage.getItem('apiBaseUrl');
        if (savedUrl) {
            document.getElementById('apiBaseUrl').value = savedUrl;
            // Test connection
            if (typeof BlogAPI !== 'undefined') {
                BlogAPI.testConnection().then(isConnected => {
                    const statusDiv = document.getElementById('apiStatus');
                    if (isConnected) {
                        statusDiv.innerHTML = '<span class="token-status-ok">✅ API connected - Database mode enabled</span>';
                    } else {
                        statusDiv.innerHTML = '<span class="token-status-none">⚠️ API not reachable - Check your URL</span>';
                    }
                });
            }
        }
    }

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
    const token = typeof getGitHubToken !== 'undefined' ? getGitHubToken() : null;
    const statusDiv = document.getElementById('tokenStatus');
    if (token) {
        statusDiv.innerHTML = '<span class="token-status-ok">✅ Auto-publish enabled - Posts will go live automatically!</span>';
    } else {
        statusDiv.innerHTML = '<span class="token-status-none">⚠️ Auto-publish disabled - Add GitHub token to enable direct publishing</span>';
        
        // Show setup reminder in posts section
        if (document.getElementById('posts-section')) {
            const existingReminder = document.querySelector('.setup-reminder');
            if (!existingReminder) {
                const reminder = document.createElement('div');
                reminder.className = 'setup-reminder';
                reminder.style.cssText = 'background: linear-gradient(135deg, var(--main-color), #00ccbb); color: var(--bg-color); padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap;';
                reminder.innerHTML = `
                    <div style="flex: 1; min-width: 250px;">
                        <strong style="font-size: 1.8rem; display: block; margin-bottom: 0.5rem;">🚀 Enable Auto-Publish!</strong>
                        <p style="margin: 0; font-size: 1.4rem; opacity: 0.9;">Add GitHub token to publish posts directly to your website. No manual upload needed!</p>
                    </div>
                    <button onclick="showSection('settings'); setTimeout(() => document.getElementById('githubToken').focus(), 300);" 
                            style="background: var(--bg-color); color: var(--main-color); border: none; padding: 1.2rem 2.5rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; font-size: 1.6rem; white-space: nowrap; transition: 0.3s ease;"
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        Set Up Now →
                    </button>
                `;
                const postsSection = document.getElementById('posts-section');
                if (postsSection) {
                    postsSection.insertBefore(reminder, postsSection.querySelector('h2').nextSibling);
                }
            }
        }
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

// Load posts from API or fallback to localStorage/blog.json
async function loadPosts() {
    // Check if API is configured and available
    if (typeof BlogAPI !== 'undefined') {
        try {
            const posts = await BlogAPI.getAllPosts();
            displayPosts(posts);
            // Cache in localStorage for offline access
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            return;
        } catch (error) {
            console.warn('API not available, falling back to localStorage/blog.json:', error);
            // Fall through to fallback method
        }
    }
    
    // Fallback: Use localStorage and sync with blog.json (legacy method)
    let localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const lastSyncTime = localStorage.getItem('lastBlogSync') || '0';
    const lastPublishTime = localStorage.getItem('lastPublishTime') || '0';
    const now = Date.now();
    
    // If we just published (within last 3 minutes), don't sync to avoid overwriting
    const timeSincePublish = now - parseInt(lastPublishTime);
    const justPublished = timeSincePublish < 180000; // 3 minutes
    
    // Only sync with server if it's been more than 2 minutes since last sync
    // AND we haven't just published
    const shouldSync = !justPublished && (now - parseInt(lastSyncTime)) > 120000;
    
    if (!shouldSync && localPosts.length > 0) {
        // Use local posts if recently synced or just published (preserves new posts)
        displayPosts(localPosts);
        return;
    }
    
    // Try to sync with blog.json (server file)
    fetch('data/blog.json?' + now) // Cache bust
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('blog.json not found');
        })
        .then(data => {
            if (data.posts && data.posts.length > 0) {
                // Smart merge: Always preserve local posts that don't exist on server
                const serverPostIds = new Set(data.posts.map(p => p.id));
                
                // Find local posts that aren't on server (newly created, not yet on server)
                const newLocalPosts = localPosts.filter(p => !serverPostIds.has(p.id));
                
                // Merge: Server posts + new local posts
                const mergedPosts = [...data.posts, ...newLocalPosts];
                
                // Update localStorage with merged posts (preserving new posts)
                localStorage.setItem('blogPosts', JSON.stringify(mergedPosts));
                localStorage.setItem('lastBlogSync', now.toString());
                displayPosts(mergedPosts);
            } else if (localPosts.length > 0) {
                // No server posts, but have local posts - keep them
                displayPosts(localPosts);
            } else {
                displayPosts([]);
            }
        })
        .catch(() => {
            // blog.json not available, use localStorage only
            if (localPosts.length > 0) {
                displayPosts(localPosts);
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

    const postData = {
        title,
        date,
        category: category || null,
        content
    };

    // Show loading
    const saveBtn = document.querySelector('.btn-save');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    // Try to save to API first (if available)
    if (typeof BlogAPI !== 'undefined') {
        try {
            let savedPost;
            if (currentPostId) {
                savedPost = await BlogAPI.updatePost(currentPostId, postData);
            } else {
                savedPost = await BlogAPI.createPost(postData);
            }
            
            alert('✅ Post saved successfully!\n\nYour blog post is now live on your website!');
            resetForm();
            showSection('posts');
            await loadPosts(); // Reload from API
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            return;
        } catch (error) {
            console.warn('API save failed, falling back to GitHub/localStorage:', error);
            // Fall through to fallback method
        }
    }
    
    // Fallback: Use localStorage and GitHub API (legacy method)
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    if (currentPostId) {
        // Update existing post
        const index = posts.findIndex(p => p.id === currentPostId);
        if (index !== -1) {
            posts[index] = {
                id: currentPostId,
                ...postData
            };
        }
    } else {
        // Create new post
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        posts.push({
            id: newId,
            ...postData
        });
    }

    localStorage.setItem('blogPosts', JSON.stringify(posts));
    localStorage.setItem('lastBlogSync', '0');
    
    saveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Publishing...';
    
    // Try to auto-publish to GitHub
    const token = typeof getGitHubToken !== 'undefined' ? getGitHubToken() : null;
    
    if (token && typeof publishToGitHub !== 'undefined') {
        try {
            await publishToGitHub();
            localStorage.setItem('lastPublishTime', Date.now().toString());
            localStorage.setItem('lastBlogSync', '0');
            
            alert('✅ Post saved and published successfully!\n\nYour blog post is now live on your website!\n\nIt may take 1-2 minutes to appear on the main site.');
            
            resetForm();
            showSection('posts');
            const currentPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            displayPosts(currentPosts);
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            return;
        } catch (error) {
            console.error('Publish error:', error);
            const errorMsg = error.message || 'Unknown error';
            
            if (errorMsg.includes('Bad credentials') || errorMsg.includes('401')) {
                localStorage.removeItem('githubToken');
                alert('⚠️ GitHub token is invalid or expired.\n\nPlease go to Settings and add a new token to enable auto-publish.');
                showSection('settings');
                setTimeout(() => document.getElementById('githubToken').focus(), 500);
            } else {
                alert(`⚠️ Auto-publish failed: ${errorMsg}\n\nPlease check your token in Settings or try again.`);
            }
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            return;
        }
    }
    
    // If no token, guide to setup
    if (!token) {
        const setupToken = confirm('🚀 Enable Auto-Publish!\n\nTo publish posts directly to your website:\n1. Click OK to go to Settings\n2. Add your GitHub Personal Access Token\n3. Posts will auto-publish when you save!\n\nClick OK to set up now.');
        
        if (setupToken) {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            showSection('settings');
            setTimeout(() => document.getElementById('githubToken').focus(), 500);
            return;
        } else {
            alert('✅ Post saved to admin panel.\n\n💡 Add GitHub token in Settings to enable auto-publish to your live website.');
            resetForm();
            showSection('posts');
            const currentPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            displayPosts(currentPosts);
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            return;
        }
    }
}

// Edit post
async function editPost(id) {
    // Try to fetch from API first
    if (typeof BlogAPI !== 'undefined') {
        try {
            const post = await BlogAPI.getPostById(id);
            currentPostId = id;
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postDate').value = post.date;
            document.getElementById('postCategory').value = post.category || '';
            quill.root.innerHTML = post.content;
            document.getElementById('post-form-title').textContent = 'Edit Blog Post';
            showSection('new-post');
            return;
        } catch (error) {
            console.warn('API fetch failed, using localStorage:', error);
        }
    }
    
    // Fallback: Use localStorage
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const post = posts.find(p => p.id === id);
    
    if (!post) {
        alert('Post not found');
        return;
    }

    currentPostId = id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postDate').value = post.date;
    document.getElementById('postCategory').value = post.category || '';
    quill.root.innerHTML = post.content;
    document.getElementById('post-form-title').textContent = 'Edit Blog Post';

    showSection('new-post');
}

// Delete post
async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    // Try to delete from API first
    if (typeof BlogAPI !== 'undefined') {
        try {
            await BlogAPI.deletePost(id);
            alert('✅ Post deleted successfully!');
            await loadPosts();
            return;
        } catch (error) {
            console.warn('API delete failed, using localStorage:', error);
        }
    }
    
    // Fallback: Use localStorage and GitHub
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    loadPosts();
    
    // If token exists, try to auto-publish the updated list
    const token = typeof getGitHubToken !== 'undefined' ? getGitHubToken() : null;
    if (token && typeof publishToGitHub !== 'undefined') {
        try {
            await publishToGitHub();
            alert('✅ Post deleted and changes published!\n\nYour website will update in 1-2 minutes.');
        } catch (error) {
            console.error('Publish error:', error);
            // Silent fail - post is deleted locally
        }
    }
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
    
    // Return true to indicate export was successful
    return true;
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

