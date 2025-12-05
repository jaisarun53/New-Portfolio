const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
        trim: true,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
blogPostSchema.index({ date: -1 });
blogPostSchema.index({ createdAt: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Blog API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all blog posts (sorted by date, newest first)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await BlogPost.find({})
            .sort({ date: -1, createdAt: -1 })
            .lean();
        
        // Convert MongoDB _id to id and format dates
        const formattedPosts = posts.map(post => ({
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            date: post.date.toISOString().split('T')[0],
            category: post.category,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }));
        
        res.json({ posts: formattedPosts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ 
            error: 'Failed to fetch blog posts',
            message: error.message 
        });
    }
});

// Get single blog post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id).lean();
        
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        
        const formattedPost = {
            id: post._id.toString(),
            title: post.title,
            content: post.content,
            date: post.date.toISOString().split('T')[0],
            category: post.category,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };
        
        res.json({ post: formattedPost });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ 
            error: 'Failed to fetch blog post',
            message: error.message 
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
                error: 'Title and content are required' 
            });
        }
        
        const newPost = new BlogPost({
            title: title.trim(),
            content: content,
            date: date ? new Date(date) : new Date(),
            category: category ? category.trim() : null
        });
        
        const savedPost = await newPost.save();
        
        const formattedPost = {
            id: savedPost._id.toString(),
            title: savedPost.title,
            content: savedPost.content,
            date: savedPost.date.toISOString().split('T')[0],
            category: savedPost.category,
            createdAt: savedPost.createdAt,
            updatedAt: savedPost.updatedAt
        };
        
        res.status(201).json({ 
            message: 'Blog post created successfully',
            post: formattedPost 
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ 
            error: 'Failed to create blog post',
            message: error.message 
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
                error: 'Title and content are required' 
            });
        }
        
        const updateData = {
            title: title.trim(),
            content: content,
            date: date ? new Date(date) : new Date(),
            category: category ? category.trim() : null,
            updatedAt: new Date()
        };
        
        const updatedPost = await BlogPost.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).lean();
        
        if (!updatedPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        
        const formattedPost = {
            id: updatedPost._id.toString(),
            title: updatedPost.title,
            content: updatedPost.content,
            date: updatedPost.date.toISOString().split('T')[0],
            category: updatedPost.category,
            createdAt: updatedPost.createdAt,
            updatedAt: updatedPost.updatedAt
        };
        
        res.json({ 
            message: 'Blog post updated successfully',
            post: formattedPost 
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ 
            error: 'Failed to update blog post',
            message: error.message 
        });
    }
});

// Delete blog post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const deletedPost = await BlogPost.findByIdAndDelete(req.params.id).lean();
        
        if (!deletedPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        
        res.json({ 
            message: 'Blog post deleted successfully',
            post: {
                id: deletedPost._id.toString(),
                title: deletedPost.title
            }
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ 
            error: 'Failed to delete blog post',
            message: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
    console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
});

