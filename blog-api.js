// Blog API Client for MongoDB Backend
// Handles all API calls to the Node.js/Express backend

// Get API base URL from localStorage or use default
function getApiBaseUrl() {
    const savedUrl = localStorage.getItem('apiBaseUrl');
    if (savedUrl) {
        return savedUrl.trim().replace(/\/$/, ''); // Remove trailing slash
    }
    // Default to localhost for development
    return 'http://localhost:3000';
}

// Save API base URL
function saveApiBaseUrl(url) {
    localStorage.setItem('apiBaseUrl', url.trim().replace(/\/$/, ''));
}

// Test API connection
async function testApiConnection() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/health`);
        if (response.ok) {
            const data = await response.json();
            return { success: true, message: data.message || 'API is connected' };
        } else {
            return { success: false, error: `API returned status ${response.status}` };
        }
    } catch (error) {
        return { success: false, error: `Connection failed: ${error.message}` };
    }
}

// Fetch all blog posts
async function fetchPostsFromAPI() {
    try {
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            throw new Error('API Base URL not configured');
        }
        
        const response = await fetch(`${baseUrl}/api/posts`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // Backend returns { posts: [...] }
        return Array.isArray(data.posts) ? data.posts : (Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

// Fetch single blog post by ID
async function fetchPostById(id) {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/posts/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Blog post not found');
            }
            throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.post;
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

// Create new blog post
async function createPostInAPI(post) {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: post.title,
                content: post.content,
                date: post.date || new Date().toISOString().split('T')[0],
                category: post.category || null
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to create post: ${response.status}`);
        }
        
        const data = await response.json();
        return data.post;
    } catch (error) {
        console.error('API create error:', error);
        throw error;
    }
}

// Update existing blog post
async function updatePostInAPI(postId, post) {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: post.title,
                content: post.content,
                date: post.date || new Date().toISOString().split('T')[0],
                category: post.category || null
            })
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Blog post not found');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to update post: ${response.status}`);
        }
        
        const data = await response.json();
        return data.post;
    } catch (error) {
        console.error('API update error:', error);
        throw error;
    }
}

// Delete blog post
async function deletePostFromAPI(postId) {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Blog post not found');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to delete post: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API delete error:', error);
        throw error;
    }
}

