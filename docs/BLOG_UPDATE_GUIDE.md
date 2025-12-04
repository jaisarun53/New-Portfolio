# Blog Update Guide

## How to Add a New Blog Post Daily

Updating your blog is simple! Just follow these steps:

### Step 1: Open `blog.json`
Open the `blog.json` file in your project root.

### Step 2: Add a New Post
Add a new blog post object to the `posts` array. Here's the format:

```json
{
  "id": 2,
  "date": "2025-01-28",
  "title": "Your Blog Post Title",
  "content": "Your blog post content goes here. You can write as much as you want. This will be displayed on your website.",
  "category": "Technology"
}
```

### Step 3: Important Notes
- **id**: Use a unique number (increment from the last post)
- **date**: Use format `YYYY-MM-DD` (e.g., "2025-01-28")
- **title**: Your blog post title
- **content**: Your blog post content (supports multiple paragraphs)
- **category**: Optional - can be "Technology", "General", "Personal", etc. (or leave empty)

### Step 4: Save and Deploy
1. Save the `blog.json` file
2. Commit and push to your repository
3. Your website will automatically show the new post (newest posts appear first)

### Example Blog Post

```json
{
  "posts": [
    {
      "id": 1,
      "date": "2025-01-27",
      "title": "Welcome to My Blog",
      "content": "This is my first blog post!",
      "category": "General"
    },
    {
      "id": 2,
      "date": "2025-01-28",
      "title": "Learning React Hooks",
      "content": "Today I learned about React hooks and how they can simplify component logic. The useState and useEffect hooks are particularly powerful for managing state and side effects.",
      "category": "Technology"
    }
  ]
}
```

### Tips
- Posts are automatically sorted by date (newest first)
- You can write longer content - it will wrap nicely
- Categories are optional but help organize your posts
- Make sure the JSON syntax is correct (commas, quotes, etc.)

That's it! Your blog is now live and easy to update daily! 🎉

