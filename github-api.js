// GitHub API Integration for Auto-Publish

// Save GitHub token to localStorage (encrypted)
function saveGitHubToken(token) {
    // Simple base64 encoding (not super secure, but better than plain text)
    const encoded = btoa(token);
    localStorage.setItem('githubToken', encoded);
    return true;
}

// Get GitHub token from localStorage
function getGitHubToken() {
    const encoded = localStorage.getItem('githubToken');
    if (!encoded) return null;
    try {
        return atob(encoded);
    } catch (e) {
        return null;
    }
}

// Publish blog.json to GitHub automatically
async function publishToGitHub() {
    const token = getGitHubToken();
    if (!token) {
        alert('GitHub token not configured. Please go to Settings and add your GitHub Personal Access Token.');
        return false;
    }

    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    if (posts.length === 0) {
        alert('No posts to publish');
        return false;
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

    const content = JSON.stringify(blogData, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // Get current file SHA (needed for update)
    let sha = null;
    const authHeader = token.startsWith('github_pat_') 
        ? `Bearer ${token}` 
        : `token ${token}`;
        
    try {
        const fileResponse = await fetch('https://api.github.com/repos/jaisarun53/New-Portfolio/contents/data/blog.json', {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            sha = fileData.sha;
        }
    } catch (e) {
        console.log('File does not exist or error fetching:', e);
    }

    // Create or update file
    const apiUrl = 'https://api.github.com/repos/jaisarun53/New-Portfolio/contents/data/blog.json';
    const payload = {
        message: `Update blog posts - ${new Date().toISOString()}`,
        content: encodedContent,
        branch: 'main'
    };

    if (sha) {
        payload.sha = sha;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Publish successful:', result);
            return true;
        } else {
            const error = await response.json();
            console.error('Publish failed:', error);
            throw new Error(error.message || 'Failed to publish');
        }
    } catch (error) {
        console.error('GitHub API Error:', error);
        throw error;
    }
}

// Test GitHub token
async function testGitHubToken(token) {
    try {
        // Support both classic tokens (ghp_) and fine-grained tokens (github_pat_)
        const authHeader = token.startsWith('github_pat_') 
            ? `Bearer ${token}` 
            : `token ${token}`;
            
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.ok;
    } catch (e) {
        return false;
    }
}

