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
    
    // Wait for Quill to load if not available yet
    if (typeof Quill === 'undefined') {
        console.warn('Quill.js not loaded yet, waiting...');
        let attempts = 0;
        const checkQuill = setInterval(function() {
            attempts++;
            if (typeof Quill !== 'undefined') {
                clearInterval(checkQuill);
                initQuill(); // Retry initialization
            } else if (attempts > 20) { // Wait up to 2 seconds
                clearInterval(checkQuill);
                console.error('Quill.js library not loaded. Please check your internet connection.');
                editorElement.innerHTML = '<p style="color: red; padding: 2rem;">Error: Rich text editor failed to load. Please check your internet connection and refresh the page.</p>';
            }
        }, 100);
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
        console.log('Quill editor initialized successfully');
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

    // API configuration form submission
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

            // Save and test
            if (typeof saveApiBaseUrl !== 'undefined') {
                saveApiBaseUrl(apiUrl);
            } else {
                localStorage.setItem('apiBaseUrl', apiUrl);
            }

            messageDiv.textContent = 'Testing connection...';
            messageDiv.className = 'message';

            try {
                if (typeof testApiConnection === 'function') {
                    const result = await testApiConnection();
                    if (result && result.success) {
                        messageDiv.textContent = '✅ API connection successful!';
                        messageDiv.className = 'message success';
                        statusDiv.innerHTML = '<span class="token-status-ok">✅ Database API connected - Posts will be saved to MongoDB</span>';
                        loadApiStatus();
                    } else {
                        messageDiv.textContent = `❌ Connection failed: ${result ? result.error : 'Unknown error'}`;
                        messageDiv.className = 'message error';
                        statusDiv.innerHTML = '';
                    }
                } else {
                    // Fallback test
                    const response = await fetch(`${apiUrl}/api/health`);
                    if (response.ok) {
                        messageDiv.textContent = '✅ API connection successful!';
                        messageDiv.className = 'message success';
                        statusDiv.innerHTML = '<span class="token-status-ok">✅ Database API connected</span>';
                        loadApiStatus();
                    } else {
                        messageDiv.textContent = '❌ Connection failed';
                        messageDiv.className = 'message error';
                    }
                }
            } catch (error) {
                messageDiv.textContent = `❌ Connection failed: ${error.message}`;
                messageDiv.className = 'message error';
                statusDiv.innerHTML = '';
            }
        });
    }

    // Load API URL on page load
    if (document.getElementById('apiBaseUrl')) {
        const savedUrl = localStorage.getItem('apiBaseUrl');
        if (savedUrl) {
            document.getElementById('apiBaseUrl').value = savedUrl;
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
    loadApiStatus();
}

// Load and display API status
function loadApiStatus() {
    const apiUrl = localStorage.getItem('apiBaseUrl');
    const statusDiv = document.getElementById('apiStatus');
    if (!statusDiv) return;
    
    if (apiUrl) {
        statusDiv.innerHTML = '<span class="token-status-ok">✅ Database API configured</span>';
    } else {
        statusDiv.innerHTML = '<span class="token-status-none">⚠️ Database API not configured - Add API URL to use MongoDB</span>';
    }
}

// Load and display token status
function loadTokenStatus() {
    const token = typeof getGitHubToken === 'function' ? getGitHubToken() : null;
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

// Load posts - Try API first, then fallback to GitHub/localStorage
async function loadPosts() {
    const apiUrl = localStorage.getItem('apiBaseUrl');
    
    // Try API first if configured
    if (apiUrl && typeof fetchPostsFromAPI === 'function') {
        try {
            const posts = await fetchPostsFromAPI();
            if (posts && Array.isArray(posts)) {
                // Update localStorage cache
                localStorage.setItem('blogPosts', JSON.stringify(posts));
                displayPosts(posts);
                return;
            }
        } catch (error) {
            console.warn('API load error (falling back to local storage):', error);
            // Fall through to fallback methods
        }
    }
    
    // Fallback: Use existing GitHub/localStorage method
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

// Save post (create or update) - Try API first, then GitHub fallback
async function savePost() {
    if (!quill) {
        alert('Editor not initialized. Please refresh the page.');
        return;
    }
    
    const title = document.getElementById('postTitle').value.trim();
    const date = document.getElementById('postDate').value;
    const category = document.getElementById('postCategory').value.trim();
    const content = quill.root.innerHTML;

    if (!title || !date || !content || content === '<p><br></p>') {
        alert('Please fill in all required fields');
        return;
    }

    // Show loading
    const saveBtn = document.querySelector('.btn-save');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Publishing...';
    saveBtn.disabled = true;

    const postData = {
        title,
        date,
        category: category || null,
        content
    };

    // Try API first if configured
    const apiUrl = localStorage.getItem('apiBaseUrl');
    if (apiUrl && typeof createPostInAPI === 'function' && typeof updatePostInAPI === 'function') {
        try {
            let savedPost;
            if (currentPostId) {
                // Update existing post
                savedPost = await updatePostInAPI(currentPostId, postData);
            } else {
                // Create new post
                savedPost = await createPostInAPI(postData);
            }
            
            if (savedPost) {
                alert('✅ Post saved to database successfully!\n\nYour blog post is now live on your website!');
                
                resetForm();
                showSection('posts');
                loadPosts(); // Reload from API
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                return;
            }
        } catch (error) {
            console.warn('API save error (falling back to GitHub/localStorage):', error);
            // Fall through to GitHub/localStorage method
        }
    }
    
    // Fallback: Use GitHub/localStorage method
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
    
    // Try to auto-publish to GitHub
    const token = typeof getGitHubToken === 'function' ? getGitHubToken() : null;
    
    if (token && typeof publishToGitHub === 'function') {
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
                alert(`⚠️ Auto-publish failed: ${errorMsg}\n\nPost saved locally. Please check your token in Settings.`);
            }
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            return;
        }
    }
    
    // If no token, guide to setup
    if (!token) {
        const setupToken = confirm('🚀 Enable Auto-Publish!\n\nTo publish posts directly to your website:\n1. Click OK to go to Settings\n2. Add your GitHub Personal Access Token OR Database API URL\n3. Posts will auto-publish when you save!\n\nClick OK to set up now.');
        
        if (setupToken) {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            showSection('settings');
            setTimeout(() => {
                const apiInput = document.getElementById('apiBaseUrl');
                if (apiInput && !apiInput.value) {
                    apiInput.focus();
                } else {
                    document.getElementById('githubToken').focus();
                }
            }, 500);
            return;
        } else {
            alert('✅ Post saved to admin panel.\n\n💡 Add Database API URL or GitHub token in Settings to enable auto-publish.');
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

// Edit post - Try to fetch from API if available
async function editPost(id) {
    // Try API first if configured
    const apiUrl = localStorage.getItem('apiBaseUrl');
    if (apiUrl && typeof fetchPostById === 'function') {
        try {
            const post = await fetchPostById(id);
            if (post) {
                currentPostId = post.id;
                document.getElementById('postTitle').value = post.title;
                document.getElementById('postDate').value = post.date;
                document.getElementById('postCategory').value = post.category || '';
                quill.root.innerHTML = post.content;
                document.getElementById('post-form-title').textContent = 'Edit Blog Post';
                showSection('new-post');
                return;
            }
        } catch (error) {
            console.warn('API fetch error (falling back to localStorage):', error);
            // Fall through to localStorage
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

// Delete post - Try API first, then GitHub fallback
async function deletePost(id) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const post = posts.find(p => p.id === id);
    
    if (!confirm(`Are you sure you want to delete "${post?.title || 'this post'}"?`)) {
        return;
    }

    // Try API first if configured
    const apiUrl = localStorage.getItem('apiBaseUrl');
    if (apiUrl && typeof deletePostFromAPI === 'function') {
        try {
            await deletePostFromAPI(id);
            alert('✅ Post deleted from database successfully!');
            loadPosts(); // Reload from API
            return;
        } catch (error) {
            console.warn('API delete error (falling back to local delete):', error);
            // Fall through to local delete
        }
    }
    
    // Fallback: Local delete and GitHub publish
    const updatedPosts = posts.filter(p => p.id !== id);
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
    loadPosts();
    
    // If token exists, try to auto-publish the updated list
    const token = typeof getGitHubToken === 'function' ? getGitHubToken() : null;
    if (token && typeof publishToGitHub === 'function') {
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

