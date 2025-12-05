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
                    <button id="setupTokenBtn" 
                            style="background: var(--bg-color); color: var(--main-color); border: none; padding: 1.2rem 2.5rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; font-size: 1.6rem; white-space: nowrap; transition: 0.3s ease;">
                        Set Up Now →
                    </button>
                `;
                // Add event listeners to avoid CSP violations
                const setupBtn = reminder.querySelector('#setupTokenBtn');
                if (setupBtn) {
                    setupBtn.addEventListener('click', function() {
                        showSection('settings');
                        setTimeout(() => {
                            const tokenInput = document.getElementById('githubToken');
                            if (tokenInput) tokenInput.focus();
                        }, 300);
                    });
                    setupBtn.addEventListener('mouseenter', function() {
                        this.style.transform = 'scale(1.05)';
                    });
                    setupBtn.addEventListener('mouseleave', function() {
                        this.style.transform = 'scale(1)';
                    });
                }
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
    // CRITICAL: Check if we just saved a post - protect it from being overwritten
    const lastSaveTime = localStorage.getItem('lastSaveTime') || '0';
    const lastPublishTime = localStorage.getItem('lastPublishTime') || '0';
    const now = Date.now();
    const timeSinceSave = now - parseInt(lastSaveTime);
    const timeSincePublish = now - parseInt(lastPublishTime);
    
    // If we just saved/published (within last 10 minutes), NEVER sync from server
    // This prevents posts from disappearing
    const justSaved = timeSinceSave < 600000; // 10 minutes
    const justPublished = timeSincePublish < 600000; // 10 minutes
    
    if (justSaved || justPublished) {
        // Use local posts immediately - don't risk overwriting
        const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        if (localPosts.length > 0) {
            displayPosts(localPosts);
            console.log('Using local posts (recently saved - protected from overwrite)');
            return;
        }
    }
    
    const apiUrl = localStorage.getItem('apiBaseUrl');
    
    // Try API first if configured
    if (apiUrl && typeof fetchPostsFromAPI === 'function') {
        try {
            const posts = await fetchPostsFromAPI();
            // CRITICAL: Only use API posts if they exist AND we haven't just saved
            if (posts && Array.isArray(posts) && posts.length > 0) {
                // Smart merge: Preserve local posts that don't exist in API
                const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
                const apiPostIds = new Set(posts.map(p => String(p.id)));
                
                // Find local posts not in API (newly created, not yet synced)
                const newLocalPosts = localPosts.filter(p => !apiPostIds.has(String(p.id)));
                
                // Merge: API posts + new local posts
                const mergedPosts = [...posts, ...newLocalPosts];
                
                // Only update if we have merged posts or if API has posts we don't have locally
                if (mergedPosts.length > 0 || (posts.length > 0 && !justSaved)) {
                    localStorage.setItem('blogPosts', JSON.stringify(mergedPosts));
                    displayPosts(mergedPosts);
                    return;
                }
            }
            // If API returns empty or error, fall through to use local posts
        } catch (error) {
            console.warn('API load error (falling back to local storage):', error);
            // Fall through to use local posts
        }
    }
    
    // Fallback: Use existing GitHub/localStorage method
    let localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const lastSyncTime = localStorage.getItem('lastBlogSync') || '0';
    
    // Only sync with server if:
    // 1. We haven't just saved/published (10 minute protection)
    // 2. It's been more than 5 minutes since last sync
    const shouldSync = !justSaved && !justPublished && (now - parseInt(lastSyncTime)) > 300000; // 5 minutes
    
    if (!shouldSync && localPosts.length > 0) {
        // Use local posts if recently synced or just saved (preserves new posts)
        displayPosts(localPosts);
        return;
    }
    
    // Try to sync with blog.json (server file) - but only if safe
    if (!justSaved && !justPublished) {
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
                    const serverPostIds = new Set(data.posts.map(p => String(p.id)));
                    
                    // Find local posts that aren't on server (newly created, not yet on server)
                    const newLocalPosts = localPosts.filter(p => !serverPostIds.has(String(p.id)));
                    
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
    } else {
        // Just saved - use local posts only
        displayPosts(localPosts);
    }
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

    postsList.innerHTML = posts.map(post => {
        // Use data attributes instead of inline onclick to avoid CSP violations
        const postId = escapeHtml(String(post.id));
        return `
        <div class="post-card">
            <div class="post-card-header">
                <h3>${escapeHtml(post.title)}</h3>
                <div class="post-actions">
                    <button class="btn-edit" data-post-id="${postId}" data-action="edit" title="Edit">
                        <i class="bx bx-edit"></i>
                    </button>
                    <button class="btn-delete" data-post-id="${postId}" data-action="delete" title="Delete">
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
    `;
    }).join('');
    
    // Add event listeners using event delegation to avoid CSP violations
    postsList.addEventListener('click', function(e) {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        const postId = button.getAttribute('data-post-id');
        const action = button.getAttribute('data-action');
        
        if (action === 'edit') {
            // Handle both string and number IDs
            const id = isNaN(postId) ? postId : parseInt(postId);
            editPost(id);
        } else if (action === 'delete') {
            // Handle both string and number IDs
            const id = isNaN(postId) ? postId : parseInt(postId);
            deletePost(id);
        }
    });
}

// Switch between Visual Editor and HTML Code modes
function switchEditorMode(mode) {
    const visualBtn = document.querySelector('[data-mode="visual"]');
    const htmlBtn = document.querySelector('[data-mode="html"]');
    const editor = document.getElementById('editor');
    const htmlEditor = document.getElementById('htmlEditor');
    
    if (!editor || !htmlEditor) {
        console.error('Editor elements not found');
        return;
    }
    
    if (mode === 'visual') {
        if (visualBtn) visualBtn.classList.add('active');
        if (htmlBtn) htmlBtn.classList.remove('active');
        editor.style.display = 'block';
        htmlEditor.style.display = 'none';
        
        // Sync HTML to Quill if HTML editor had content
        if (htmlEditor.value.trim() && quill) {
            quill.root.innerHTML = htmlEditor.value.trim();
        }
    } else {
        if (visualBtn) visualBtn.classList.remove('active');
        if (htmlBtn) htmlBtn.classList.add('active');
        editor.style.display = 'none';
        htmlEditor.style.display = 'block';
        
        // Sync Quill content to HTML editor
        if (quill && quill.root.innerHTML) {
            htmlEditor.value = quill.root.innerHTML;
        }
        
        // Focus on HTML editor
        htmlEditor.focus();
    }
}

// Save post (create or update) - Try API first, then GitHub fallback
async function savePost() {
    const title = document.getElementById('postTitle').value.trim();
    const date = document.getElementById('postDate').value;
    const category = document.getElementById('postCategory').value.trim();
    
    // Get content from active editor mode
    let content = '';
    const htmlEditor = document.getElementById('htmlEditor');
    const isHtmlMode = htmlEditor && htmlEditor.style.display !== 'none';
    
    if (isHtmlMode) {
        // HTML Code mode - get content directly from textarea
        content = htmlEditor.value.trim();
        if (!content) {
            alert('Please enter HTML content');
            return;
        }
        
        // IMPORTANT: Preserve code blocks - don't modify content inside <pre> or <code> tags
        // Split content into parts: code blocks and regular content
        try {
            const codeBlockRegex = /(<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/gi;
            const parts = [];
            let lastIndex = 0;
            let match;
            const matches = [];
            
            // First, collect all matches (avoiding regex.exec() infinite loop issues)
            let regex = /(<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/gi;
            let tempMatch;
            while ((tempMatch = regex.exec(content)) !== null) {
                matches.push({
                    index: tempMatch.index,
                    text: tempMatch[0]
                });
            }
            
            // Process matches
            for (let i = 0; i < matches.length; i++) {
                match = matches[i];
                // Add content before code block
                if (match.index > lastIndex) {
                    parts.push({
                        type: 'content',
                        text: content.substring(lastIndex, match.index)
                    });
                }
                // Add code block (preserved as-is)
                parts.push({
                    type: 'code',
                    text: match.text
                });
                lastIndex = match.index + match.text.length;
            }
            // Add remaining content after last code block
            if (lastIndex < content.length) {
                parts.push({
                    type: 'content',
                    text: content.substring(lastIndex)
                });
            }
            
            // If no code blocks found, treat entire content as regular content
            if (parts.length === 0) {
                parts.push({
                    type: 'content',
                    text: content
                });
            }
            
            // Process only regular content (not code blocks)
            const processedParts = parts.map(part => {
                if (part.type === 'code') {
                    // Preserve code blocks exactly as-is
                    return part.text;
                } else {
                    // Process regular content
                    let processed = part.text;
                    
                    // Auto-fix common visibility issues: replace black text colors with white
                    // This ensures HTML content is visible on dark background
                    processed = processed.replace(/color:\s*black/gi, 'color: white');
                    processed = processed.replace(/color:\s*#000(?!\d)/gi, 'color: white');
                    processed = processed.replace(/color:\s*#000000/gi, 'color: white');
                    processed = processed.replace(/color:\s*rgb\(0,\s*0,\s*0\)/gi, 'color: white');
                    processed = processed.replace(/color:\s*rgba\(0,\s*0,\s*0,\s*[^)]+\)/gi, 'color: white');
                    
                    // Remove white/light backgrounds that cause glare on dark website
                    processed = processed.replace(/background:\s*white/gi, 'background: transparent');
                    processed = processed.replace(/background:\s*#fff(?!\d)/gi, 'background: transparent');
                    processed = processed.replace(/background:\s*#ffffff/gi, 'background: transparent');
                    processed = processed.replace(/background:\s*rgb\(255,\s*255,\s*255\)/gi, 'background: transparent');
                    processed = processed.replace(/background-color:\s*white/gi, 'background-color: transparent');
                    processed = processed.replace(/background-color:\s*#fff(?!\d)/gi, 'background-color: transparent');
                    processed = processed.replace(/background-color:\s*#ffffff/gi, 'background-color: transparent');
                    processed = processed.replace(/background-color:\s*rgb\(255,\s*255,\s*255\)/gi, 'background-color: transparent');
                    
                    // Also fix any style attributes with black colors and white backgrounds
                    processed = processed.replace(/style="([^"]*)"/gi, 
                        (match, styles) => {
                            let fixedStyles = styles;
                            // Fix black text colors
                            fixedStyles = fixedStyles.replace(/color:\s*(?:black|#000|#000000|rgb\(0,\s*0,\s*0\))/gi, 'color: white');
                            // Fix white backgrounds
                            fixedStyles = fixedStyles.replace(/background(?:-color)?:\s*(?:white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))/gi, 'background: transparent');
                            return `style="${fixedStyles}"`;
                        });
                    
                    return processed;
                }
            });
            
            // Reassemble content
            content = processedParts.join('');
        } catch (error) {
            // If code block processing fails, preserve code blocks by using a simpler approach
            // that only modifies content outside of <pre> and <code> tags
            console.warn('Code block processing failed, using safe fallback:', error);
            
            // Split content into code blocks and regular content using a simpler method
            const codeBlockPattern = /(<pre[^>]*>[\s\S]*?<\/pre>|<code[^>]*>[\s\S]*?<\/code>)/gi;
            const parts = [];
            let lastIndex = 0;
            let match;
            
            // Collect all code blocks first
            const codeBlocks = [];
            const regex = new RegExp(codeBlockPattern);
            while ((match = regex.exec(content)) !== null) {
                codeBlocks.push({
                    index: match.index,
                    endIndex: match.index + match[0].length,
                    text: match[0]
                });
            }
            
            // Process content in segments, preserving code blocks
            for (let i = 0; i < codeBlocks.length; i++) {
                const codeBlock = codeBlocks[i];
                
                // Add content before code block and process it
                if (codeBlock.index > lastIndex) {
                    let segment = content.substring(lastIndex, codeBlock.index);
                    // Apply style fixes only to this segment (outside code blocks)
                    segment = segment.replace(/style="([^"]*)"/gi, 
                        (match, styles) => {
                            let fixedStyles = styles;
                            fixedStyles = fixedStyles.replace(/color:\s*(?:black|#000|#000000|rgb\(0,\s*0,\s*0\))/gi, 'color: white');
                            fixedStyles = fixedStyles.replace(/background(?:-color)?:\s*(?:white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))/gi, 'background: transparent');
                            return `style="${fixedStyles}"`;
                        });
                    parts.push(segment);
                }
                
                // Add code block exactly as-is (no modifications)
                parts.push(codeBlock.text);
                lastIndex = codeBlock.endIndex;
            }
            
            // Add remaining content after last code block and process it
            if (lastIndex < content.length) {
                let segment = content.substring(lastIndex);
                // Apply style fixes only to this segment (outside code blocks)
                segment = segment.replace(/style="([^"]*)"/gi, 
                    (match, styles) => {
                        let fixedStyles = styles;
                        fixedStyles = fixedStyles.replace(/color:\s*(?:black|#000|#000000|rgb\(0,\s*0,\s*0\))/gi, 'color: white');
                        fixedStyles = fixedStyles.replace(/background(?:-color)?:\s*(?:white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))/gi, 'background: transparent');
                        return `style="${fixedStyles}"`;
                    });
                parts.push(segment);
            }
            
            // If no code blocks found, process entire content
            if (codeBlocks.length === 0) {
                content = content.replace(/style="([^"]*)"/gi, 
                    (match, styles) => {
                        let fixedStyles = styles;
                        fixedStyles = fixedStyles.replace(/color:\s*(?:black|#000|#000000|rgb\(0,\s*0,\s*0\))/gi, 'color: white');
                        fixedStyles = fixedStyles.replace(/background(?:-color)?:\s*(?:white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))/gi, 'background: transparent');
                        return `style="${fixedStyles}"`;
                    });
            } else {
                // Reassemble: processed segments + preserved code blocks
                content = parts.join('');
            }
        }
    } else {
        // Visual Editor mode - get content from Quill
        if (!quill) {
            alert('Editor not initialized. Please refresh the page.');
            return;
        }
        content = quill.root.innerHTML;
    }

    if (!title || !date || !content || (content === '<p><br></p>' && !isHtmlMode)) {
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
                // Update localStorage with the saved post from API
                const currentPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
                const existingIndex = currentPosts.findIndex(p => String(p.id) === String(savedPost.id));
                if (existingIndex >= 0) {
                    currentPosts[existingIndex] = savedPost;
                } else {
                    currentPosts.push(savedPost);
                }
                localStorage.setItem('blogPosts', JSON.stringify(currentPosts));
                
                // Set protection flags
                const now = Date.now();
                localStorage.setItem('lastSaveTime', now.toString());
                localStorage.setItem('lastPublishTime', now.toString());
                
                alert('✅ Post saved to database successfully!\n\nYour blog post is now live on your website!');
                
                // Display from localStorage immediately (don't call loadPosts which might overwrite)
                displayPosts(currentPosts);
                resetForm();
                showSection('posts');
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

    // Save to localStorage FIRST to ensure it's preserved
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    localStorage.setItem('lastBlogSync', '0');
    
    // CRITICAL: Set flags to prevent sync that might overwrite the new post
    const now = Date.now();
    localStorage.setItem('lastSaveTime', now.toString()); // Track when we saved (10 min protection)
    localStorage.setItem('lastPublishTime', now.toString()); // Track when we published
    
    // Try to auto-publish to GitHub
    const token = typeof getGitHubToken === 'function' ? getGitHubToken() : null;
    
    if (token && typeof publishToGitHub === 'function') {
        try {
            await publishToGitHub();
            
            // Update protection flags
            const now = Date.now();
            localStorage.setItem('lastSaveTime', now.toString());
            localStorage.setItem('lastPublishTime', now.toString());
            localStorage.setItem('lastBlogSync', '0');
            
            alert('✅ Post saved and published successfully!\n\nYour blog post is now live on your website!\n\nIt may take 1-2 minutes to appear on the main site.');
            
            // Display from localStorage immediately (don't call loadPosts which might overwrite)
            const currentPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            displayPosts(currentPosts);
            resetForm();
            showSection('posts');
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
            // Set protection flags even without publishing
            const now = Date.now();
            localStorage.setItem('lastSaveTime', now.toString());
            
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
    // Handle both string and number ID matching
    const post = posts.find(p => {
        const pId = typeof p.id === 'string' ? p.id : String(p.id);
        const searchId = typeof id === 'string' ? id : String(id);
        return pId === searchId || p.id === id;
    });
    
    if (!post) {
        alert('Post not found');
        return;
    }

    currentPostId = id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postDate').value = post.date;
    document.getElementById('postCategory').value = post.category || '';
    
    // Set content in both editors
    if (quill) {
        quill.root.innerHTML = post.content;
    }
    const htmlEditor = document.getElementById('htmlEditor');
    if (htmlEditor) {
        htmlEditor.value = post.content;
    }
    
    document.getElementById('post-form-title').textContent = 'Edit Blog Post';

    showSection('new-post');
}

// Delete post - Try API first, then GitHub fallback
async function deletePost(id) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    // Handle both string and number ID matching
    const post = posts.find(p => {
        const pId = typeof p.id === 'string' ? p.id : String(p.id);
        const searchId = typeof id === 'string' ? id : String(id);
        return pId === searchId || p.id === id;
    });
    
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
    // Handle both string and number ID matching when filtering
    const updatedPosts = posts.filter(p => {
        const pId = typeof p.id === 'string' ? p.id : String(p.id);
        const searchId = typeof id === 'string' ? id : String(id);
        return pId !== searchId && p.id !== id;
    });
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
            alert('✅ Post deleted locally!\n\n⚠️ Auto-publish failed. Post removed from admin panel.');
        }
    } else {
        alert('✅ Post deleted from admin panel!\n\n💡 Add Database API URL or GitHub token in Settings to enable auto-publish.');
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
    if (quill) {
        quill.root.innerHTML = '';
    }
    const htmlEditor = document.getElementById('htmlEditor');
    if (htmlEditor) {
        htmlEditor.value = '';
    }
    // Reset to visual editor mode
    switchEditorMode('visual');
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

