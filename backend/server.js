const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-blog';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    category: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create model
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Blog API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all blog posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await BlogPost.find({})
            .sort({ date: -1 }) // Newest first
            .lean(); // Convert to plain JavaScript objects
        
        res.json({
            success: true,
            posts: posts.map(post => ({
                id: post._id.toString(),
                title: post.title,
                content: post.content,
                date: post.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                category: post.category || null
            }))
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch blog posts'
        });
    }
});

// Get single blog post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).lean();
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        res.json({
            success: true,
            post: {
                id: post._id.toString(),
                title: post.title,
                content: post.content,
                date: post.date.toISOString().split('T')[0],
                category: post.category || null
            }
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch blog post'
        });
    }
});

// Create new blog post
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, date, category } = req.body;
        
        // Validation
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }
        
        const post = new BlogPost({
            title: title.trim(),
            content: content,
            date: date ? new Date(date) : new Date(),
            category: category || null
        });
        
        const savedPost = await post.save();
        
        res.status(201).json({
            success: true,
            post: {
                id: savedPost._id.toString(),
                title: savedPost.title,
                content: savedPost.content,
                date: savedPost.date.toISOString().split('T')[0],
                category: savedPost.category || null
            }
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create blog post'
        });
    }
});

// Update blog post
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { title, content, date, category } = req.body;
        
        // Validation
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required'
            });
        }
        
        const post = await BlogPost.findByIdAndUpdate(
            req.params.id,
            {
                title: title.trim(),
                content: content,
                date: date ? new Date(date) : new Date(),
                category: category || null
            },
            { new: true, runValidators: true }
        ).lean();
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        res.json({
            success: true,
            post: {
                id: post._id.toString(),
                title: post.title,
                content: post.content,
                date: post.date.toISOString().split('T')[0],
                category: post.category || null
            }
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update blog post'
        });
    }
});

// Delete blog post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete blog post'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
});

