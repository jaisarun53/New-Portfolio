// API Configuration
// Update this with your backend API URL

// For local development
const API_BASE_URL = 'http://localhost:3001/api';

// For production (update with your deployed backend URL)
// const API_BASE_URL = 'https://your-backend.railway.app/api';
// const API_BASE_URL = 'https://your-backend.onrender.com/api';

// Get API base URL from localStorage or use default
function getApiBaseUrl() {
    const savedUrl = localStorage.getItem('apiBaseUrl');
    return savedUrl || API_BASE_URL;
}

function setApiBaseUrl(url) {
    localStorage.setItem('apiBaseUrl', url);
}

// API Helper Functions
const BlogAPI = {
    // Get all posts
    async getAllPosts() {
        try {
            const response = await fetch(`${getApiBaseUrl()}/posts`);
            const data = await response.json();
            if (data.success) {
                return data.posts;
            }
            throw new Error(data.error || 'Failed to fetch posts');
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Get single post by ID
    async getPostById(id) {
        try {
            const response = await fetch(`${getApiBaseUrl()}/posts/${id}`);
            const data = await response.json();
            if (data.success) {
                return data.post;
            }
            throw new Error(data.error || 'Post not found');
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Create new post
    async createPost(post) {
        try {
            const response = await fetch(`${getApiBaseUrl()}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            });
            const data = await response.json();
            if (data.success) {
                return data.post;
            }
            throw new Error(data.error || 'Failed to create post');
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Update post
    async updatePost(id, post) {
        try {
            const response = await fetch(`${getApiBaseUrl()}/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            });
            const data = await response.json();
            if (data.success) {
                return data.post;
            }
            throw new Error(data.error || 'Failed to update post');
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Delete post
    async deletePost(id) {
        try {
            const response = await fetch(`${getApiBaseUrl()}/posts/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                return true;
            }
            throw new Error(data.error || 'Failed to delete post');
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Test API connection
    async testConnection() {
        try {
            const response = await fetch(`${getApiBaseUrl()}/health`);
            const data = await response.json();
            return data.status === 'ok';
        } catch (error) {
            return false;
        }
    }
};

