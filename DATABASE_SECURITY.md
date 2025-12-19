# Database Security Guide

This document outlines the database security measures implemented in the restaurant project.

## Overview

The database security implementation includes:
- Robust connection handling with retry logic
- Database indexes for performance and security
- Schema validation at the database level
- Error handling and recovery mechanisms
- Data sanitization and protection

## Database Connection

### Location
`backend/config/db.js`

### Features

#### 1. Retry Logic
- **Maximum Retries**: 5 attempts
- **Retry Delay**: 5 seconds between attempts
- **Automatic Reconnection**: Attempts to reconnect on disconnection

#### 2. Connection Options
```javascript
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,  // Timeout after 5s
  socketTimeoutMS: 45000           // Close sockets after 45s
}
```

#### 3. Error Handling
- Validates `MONGO_URL` environment variable
- Provides clear error messages
- Exits gracefully if connection fails after all retries
- Logs helpful troubleshooting information

#### 4. Connection Events
- **Error Event**: Logs connection errors
- **Disconnected Event**: Automatically attempts reconnection
- **Reconnected Event**: Confirms successful reconnection
- **SIGINT Handler**: Gracefully closes connection on app termination

## Database Indexes

Indexes improve query performance and can prevent certain types of attacks by ensuring data integrity.

### User Model Indexes

```javascript
// Email index (unique)
userSchema.index({ email: 1 });

// Account verification index
userSchema.index({ isAccountVerified: 1 });

// Admin index
userSchema.index({ isAdmin: 1 });
```

**Benefits:**
- Fast email lookups (login, registration)
- Efficient filtering of verified users
- Quick admin role checks

### Food Model Indexes

```javascript
// Category index (for filtering)
foodSchema.index({ category: 1 });

// Name index (for searching)
foodSchema.index({ name: 1 });

// Price index (for sorting)
foodSchema.index({ price: 1 });
```

**Benefits:**
- Fast category-based filtering
- Efficient name searches
- Quick price-based sorting

### Order Model Indexes

```javascript
// User ID index (for user order queries)
orderSchema.index({ userId: 1 });

// Status index (for filtering)
orderSchema.index({ status: 1 });

// Date index (for sorting)
orderSchema.index({ date: -1 });

// Compound index (user orders sorted by date)
orderSchema.index({ userId: 1, date: -1 });
```

**Benefits:**
- Fast retrieval of user orders
- Efficient status filtering
- Quick date-based sorting
- Optimized compound queries

### Category Model Indexes

```javascript
// Name index (unique)
categorySchema.index({ name: 1 });
```

**Benefits:**
- Fast category lookups
- Ensures uniqueness

## Schema Validation

All Mongoose schemas now include validation rules that provide an additional layer of security at the database level.

### User Schema Validation

```javascript
name: {
  required: [true, "Name is required"],
  minlength: [2, "Name must be at least 2 characters"],
  maxlength: [50, "Name cannot exceed 50 characters"],
  trim: true
}

email: {
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
}

password: {
  required: [true, "Password is required"],
  minlength: [8, "Password must be at least 8 characters"]
}
```

### Food Schema Validation

```javascript
name: {
  required: [true, "Food name is required"],
  minlength: [2, "Food name must be at least 2 characters"],
  maxlength: [100, "Food name cannot exceed 100 characters"]
}

price: {
  required: [true, "Price is required"],
  min: [0.01, "Price must be greater than 0"],
  max: [10000, "Price cannot exceed 10000"]
}
```

### Order Schema Validation

```javascript
status: {
  enum: {
    values: ["Order Processing", "Out for delivery", "Delivered", "Cancelled"],
    message: "Status must be one of: Order Processing, Out for delivery, Delivered, Cancelled"
  }
}

items: {
  validate: {
    validator: function(v) {
      return Array.isArray(v) && v.length > 0;
    },
    message: "Order must contain at least one item"
  }
}
```

## Data Protection

### Sensitive Data Protection

#### User Model
- **Password**: Never returned in queries (handled by toJSON method)
- **OTPs**: Marked with `select: false` to prevent accidental exposure
- **verifyOtp**: Hidden from default queries
- **resetOtp**: Hidden from default queries

#### toJSON Method
```javascript
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.verifyOtp;
    delete obj.resetOtp;
    return obj;
};
```

This ensures sensitive data is never accidentally sent in API responses.

## Error Handling

### Database Error Handler

**Location**: `backend/middleware/dbErrorHandler.js`

Handles MongoDB-specific errors:

#### 1. Validation Errors
```javascript
// Returns 400 with validation messages
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field error 1", "Field error 2"]
}
```

#### 2. Duplicate Key Errors
```javascript
// Returns 409 for unique constraint violations
{
  "success": false,
  "message": "email already exists",
  "error": "A record with this email already exists"
}
```

#### 3. Cast Errors (Invalid ObjectId)
```javascript
// Returns 400 for invalid IDs
{
  "success": false,
  "message": "Invalid ID format",
  "error": "The provided ID is not valid"
}
```

#### 4. Connection Errors
```javascript
// Returns 503 for database connection issues
{
  "success": false,
  "message": "Database connection error",
  "error": "Unable to connect to database. Please try again later."
}
```

## Timestamps

All models now include automatic timestamps:
- `createdAt`: Automatically set on document creation
- `updatedAt`: Automatically updated on document modification

This helps with:
- Audit trails
- Data tracking
- Debugging
- Analytics

## Security Best Practices

### Implemented ✅

1. **Connection Security**
   - Retry logic prevents connection failures
   - Graceful error handling
   - Automatic reconnection

2. **Data Validation**
   - Schema-level validation
   - Type checking
   - Length constraints
   - Format validation

3. **Index Security**
   - Prevents duplicate entries (unique indexes)
   - Improves query performance
   - Reduces database load

4. **Sensitive Data Protection**
   - Passwords never returned
   - OTPs hidden from queries
   - toJSON method sanitizes output

5. **Error Handling**
   - User-friendly error messages
   - Proper HTTP status codes
   - No sensitive information leaked

### Recommendations 🔄

1. **Backup Strategy**
   - Implement regular database backups
   - Test backup restoration procedures
   - Store backups securely

2. **Connection Pooling**
   - Consider connection pooling for high traffic
   - Monitor connection usage

3. **Query Optimization**
   - Use `.select()` to limit returned fields
   - Use `.lean()` for read-only queries
   - Implement pagination for large datasets

4. **Monitoring**
   - Monitor database performance
   - Set up alerts for connection failures
   - Track slow queries

5. **Access Control**
   - Use MongoDB authentication
   - Limit database user permissions
   - Use read-only users where possible

## Performance Impact

### Index Benefits

**Before Indexes:**
- Email lookup: O(n) - scans all documents
- User orders: O(n) - scans all orders
- Category filter: O(n) - scans all food items

**After Indexes:**
- Email lookup: O(log n) - uses B-tree index
- User orders: O(log n) - uses compound index
- Category filter: O(log n) - uses category index

### Query Optimization

Indexes significantly improve:
- Login queries (email lookup)
- Order history queries (userId + date)
- Category filtering (category index)
- Admin role checks (isAdmin index)

## Testing Database Security

### Test Connection Handling

1. **Stop MongoDB server**
   - Server should retry connection
   - Should log retry attempts
   - Should exit gracefully after max retries

2. **Restart MongoDB server**
   - Server should automatically reconnect
   - Should log reconnection success

### Test Validation

```javascript
// Test invalid email
const user = new userModel({
  name: "Test",
  email: "invalid-email",
  password: "Password123"
});
await user.save(); // Should throw validation error
```

### Test Indexes

```javascript
// Query should use index (check with explain())
const result = await userModel.find({ email: "test@example.com" }).explain();
// Check executionStats.executionStages.stage === "IXSCAN"
```

## Troubleshooting

### Connection Issues

1. **Check MONGO_URL**
   - Verify environment variable is set
   - Check connection string format
   - Ensure MongoDB server is running

2. **Check Network**
   - Verify network connectivity
   - Check firewall settings
   - Test connection from terminal

3. **Check MongoDB Logs**
   - Review MongoDB server logs
   - Check for authentication errors
   - Verify database permissions

### Performance Issues

1. **Check Indexes**
   ```javascript
   // List all indexes
   db.collection.getIndexes()
   ```

2. **Analyze Queries**
   ```javascript
   // Explain query execution
   db.collection.find({...}).explain("executionStats")
   ```

3. **Monitor Slow Queries**
   - Enable MongoDB slow query log
   - Review query patterns
   - Add missing indexes

## Migration Notes

If you have existing data:

1. **Indexes will be created automatically** on next server start
2. **Validation rules apply to new documents** - existing documents may need updates
3. **Timestamps added automatically** - existing documents won't have createdAt/updatedAt
4. **toJSON method applies immediately** - passwords/OTPs won't be returned

## Summary

The database security implementation provides:
- ✅ Robust connection handling
- ✅ Performance optimization through indexes
- ✅ Data validation at schema level
- ✅ Protection of sensitive data
- ✅ Comprehensive error handling
- ✅ Automatic timestamps for auditing

All database operations are now more secure, performant, and reliable.








