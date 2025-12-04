// Database API for Supabase Integration
// This file handles all database operations for blog posts

// Supabase Configuration
// Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

function getSupabaseConfig() {
    const config = localStorage.getItem('supabaseConfig');
    if (!config) return null;
    try {
        return JSON.parse(config);
    } catch (e) {
        return null;
    }
}

function saveSupabaseConfig(url, anonKey) {
    const config = { url, anonKey };
    localStorage.setItem('supabaseConfig', JSON.stringify(config));
}

// Initialize Supabase client (if using Supabase JS library)
// For REST API approach (no library needed), we'll use fetch directly

// Get Supabase REST API endpoint
function getSupabaseEndpoint(table = 'posts') {
    const config = getSupabaseConfig();
    if (!config) return null;
    return `${config.url}/rest/v1/${table}`;
}

// Get Supabase headers
function getSupabaseHeaders() {
    const config = getSupabaseConfig();
    if (!config) return null;
    return {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
}

// Test Supabase connection
async function testSupabaseConnection() {
    const config = getSupabaseConfig();
    if (!config) {
        return { success: false, error: 'No Supabase configuration found' };
    }
    
    try {
        const headers = getSupabaseHeaders();
        const endpoint = getSupabaseEndpoint('posts');
        
        // Try to fetch (limit to 1 row for testing)
        const response = await fetch(`${endpoint}?select=id&limit=1`, {
            method: 'GET',
            headers: headers
        });
        
        if (response.ok) {
            return { success: true };
        } else {
            const error = await response.text();
            return { success: false, error: `Connection failed: ${error}` };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Fetch all blog posts from database
async function fetchPostsFromDatabase() {
    const headers = getSupabaseHeaders();
    const endpoint = getSupabaseEndpoint('posts');
    
    if (!headers || !endpoint) {
        throw new Error('Supabase not configured. Please set up in Settings.');
    }
    
    try {
        const response = await fetch(`${endpoint}?select=*&order=date.desc`, {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to fetch posts: ${error}`);
        }
        
        const posts = await response.json();
        return posts;
    } catch (error) {
        console.error('Database fetch error:', error);
        throw error;
    }
}

// Save a single post to database (create or update)
async function savePostToDatabase(post) {
    const headers = getSupabaseHeaders();
    const endpoint = getSupabaseEndpoint('posts');
    
    if (!headers || !endpoint) {
        throw new Error('Supabase not configured. Please set up in Settings.');
    }
    
    try {
        // Check if post exists (has id and exists in DB)
        let response;
        
        if (post.id) {
            // Try to update existing post
            response = await fetch(`${endpoint}?id=eq.${post.id}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({
                    title: post.title,
                    content: post.content,
                    date: post.date,
                    category: post.category || null,
                    updated_at: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const updated = await response.json();
                return updated[0] || post;
            } else if (response.status === 404 || response.status === 0) {
                // Post doesn't exist, create new one
                return await createPostInDatabase(post);
            }
        } else {
            // Create new post
            return await createPostInDatabase(post);
        }
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to save post: ${error}`);
        }
        
        const result = await response.json();
        return result[0] || result;
    } catch (error) {
        console.error('Database save error:', error);
        throw error;
    }
}

// Create a new post in database
async function createPostInDatabase(post) {
    const headers = getSupabaseHeaders();
    const endpoint = getSupabaseEndpoint('posts');
    
    // Generate new ID if not provided
    const newPost = {
        title: post.title,
        content: post.content,
        date: post.date || new Date().toISOString().split('T')[0],
        category: post.category || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(newPost)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to create post: ${error}`);
        }
        
        const result = await response.json();
        return result[0] || { ...newPost, id: Date.now() };
    } catch (error) {
        console.error('Database create error:', error);
        throw error;
    }
}

// Delete a post from database
async function deletePostFromDatabase(postId) {
    const headers = getSupabaseHeaders();
    const endpoint = getSupabaseEndpoint('posts');
    
    if (!headers || !endpoint) {
        throw new Error('Supabase not configured. Please set up in Settings.');
    }
    
    try {
        const response = await fetch(`${endpoint}?id=eq.${postId}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to delete post: ${error}`);
        }
        
        return true;
    } catch (error) {
        console.error('Database delete error:', error);
        throw error;
    }
}

// Sync all posts to database (useful for migration)
async function syncAllPostsToDatabase(posts) {
    const results = [];
    for (const post of posts) {
        try {
            const saved = await savePostToDatabase(post);
            results.push({ success: true, post: saved });
        } catch (error) {
            results.push({ success: false, post, error: error.message });
        }
    }
    return results;
}

