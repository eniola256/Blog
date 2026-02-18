# Backend Fix Required

## Error
```
/api/admin/categories:1 Failed to load resource: the server responded with a status of 500 ()
error: next is not a function
```

## Problem
The `/api/admin/categories` endpoint in your Express.js backend is throwing a 500 error with "next is not a function".

## Fix Required

In your backend code, find the route handler for `/api/admin/categories` (likely in a file like `routes/admin.js` or `routes/category.js`) and fix the issue.

### Common Causes & Solutions:

1. **Missing `next()` call in error handler:**
```javascript
// WRONG - missing next parameter
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
    // Missing next() - if using middleware
  }
});

// CORRECT
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

2. **Error middleware format issue:**
```javascript
// If using error-handling middleware, make sure format is correct:
app.use((err, req, res, next) => {
  //                        ^^^^ NEXT IS REQUIRED
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
```

3. **Missing async/await handling:**
```javascript
// Make sure async routes properly handle errors
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (error) {
    next(error);  // Pass error to error handler
  }
});
```

4. **Check if the Category model is imported correctly:**
```javascript
const Category = require('../models/Category');  // Make sure path is correct
```

## Quick Checklist
- [ ] Check your Express server terminal for the full error stack trace
- [ ] Verify the `/api/admin/categories` route exists in your routes file
- [ ] Verify the Category model is properly imported
- [ ] Make sure MongoDB connection is working
- [ ] Check for any syntax errors in the route handler

## Expected Response Format
The frontend expects the API to return either:
- An array: `[{ name: "Gaming", slug: "gaming", ... }]`
- Or an object: `{ categories: [{ name: "Gaming", slug: "gaming", ... }] }`
