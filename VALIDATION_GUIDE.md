# Input Validation & Sanitization Guide

This document explains the validation and sanitization system implemented in the restaurant project.

## Overview

All user inputs are validated and sanitized before processing to prevent:
- SQL/NoSQL injection attacks
- XSS (Cross-Site Scripting) attacks
- Invalid data causing application errors
- File upload vulnerabilities

## Validation Middleware

### Location
- `backend/middleware/validation.js` - Core validation utilities
- `backend/middleware/validationSchemas.js` - Validation schemas for each endpoint
- `backend/middleware/fileUploadValidation.js` - File upload validation

### How It Works

1. **Sanitization**: All string inputs are automatically sanitized:
   - HTML tags are escaped
   - Strings are trimmed
   - Dangerous characters are removed

2. **Validation**: Inputs are validated against schemas:
   - Required fields checked
   - Type validation (string, number, object, etc.)
   - Format validation (email, MongoDB ID, etc.)
   - Length validation (min/max)
   - Custom validation functions

3. **Error Response**: If validation fails, a 400 status is returned with:
   ```json
   {
     "success": false,
     "message": "Validation failed",
     "errors": ["field1 error", "field2 error"]
   }
   ```

## Validation Schemas

### Authentication Schemas

#### Register Schema
```javascript
{
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    isAlphanumeric: true,
    noHtml: true
  },
  email: {
    type: 'string',
    required: true,
    isEmail: true,
    maxLength: 100
  },
  password: {
    type: 'string',
    required: true,
    custom: validatePassword // 8+ chars, uppercase, lowercase, number
  }
}
```

#### Login Schema
```javascript
{
  email: {
    type: 'string',
    required: true,
    isEmail: true
  },
  password: {
    type: 'string',
    required: true,
    minLength: 1
  }
}
```

### Food Item Schemas

#### Add Food Schema
```javascript
{
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    noHtml: true
  },
  description: {
    type: 'string',
    required: true,
    minLength: 10,
    maxLength: 500,
    noHtml: true
  },
  price: {
    type: 'number',
    required: true,
    min: 0.01,
    max: 10000
  },
  category: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    noHtml: true
  }
}
```

### Category Schemas

#### Add Category Schema
```javascript
{
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    isAlphanumeric: true,
    noHtml: true
  }
}
```

### Order Schemas

#### Place Order Schema
```javascript
{
  ordersdata: {
    type: 'object',
    required: true,
    custom: (value) => {
      // Validates address, items array, and amount
    }
  }
}
```

## Password Validation

Password must meet these requirements:
- Minimum 8 characters
- Maximum 128 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- (Optional) Special characters can be added

## File Upload Validation

### Image Upload Rules

**Allowed Types:**
- JPEG/JPG
- PNG
- GIF
- WebP

**Size Limit:**
- Maximum 5MB per file

**Validation Process:**
1. File type checked by MIME type
2. File extension validated
3. File size checked
4. If validation fails, uploaded file is automatically deleted

### File Upload Middleware

```javascript
// Require file upload (for add operations)
requireFileUpload

// Validate image upload (for add/edit operations)
validateImageUpload
```

## Sanitization

### Automatic Sanitization

All string inputs are automatically sanitized:
- **HTML Escaping**: `<script>` becomes `&lt;script&gt;`
- **Trimming**: Removes leading/trailing whitespace
- **XSS Prevention**: Prevents script injection

### Sanitization Functions

```javascript
// Sanitize a single string
sanitizeString(str)

// Sanitize an entire object recursively
sanitizeObject(obj)
```

## Applied Routes

### Authentication Routes
- ✅ `/api/auth/register` - Registration validation
- ✅ `/api/auth/login` - Login validation
- ✅ `/api/auth/verify-account` - Email verification validation
- ✅ `/api/auth/send-verify-otp` - OTP request validation
- ✅ `/api/auth/send-reset-otp` - Password reset request validation
- ✅ `/api/auth/reset-password` - Password reset validation

### Food Routes
- ✅ `/api/food/add` - Food creation + file validation
- ✅ `/api/food/edit` - Food editing + file validation
- ✅ `/api/food/remove` - Food removal validation

### Category Routes
- ✅ `/api/category/addCategory` - Category creation + file validation
- ✅ `/api/category/editCategory` - Category editing + file validation
- ✅ `/api/category/removeCategory` - Category removal validation

### Cart Routes
- ✅ `/cart/add` - Cart item validation
- ✅ `/cart/remove` - Cart item validation

### Order Routes
- ✅ `/api/order/placeorder` - Order placement validation
- ✅ `/api/order/status` - Order status update validation

## Error Messages

### Common Validation Errors

- `"field is required"` - Required field is missing
- `"field must be of type X"` - Wrong data type
- `"field must be at least X characters long"` - Too short
- `"field must be no more than X characters long"` - Too long
- `"field must be a valid email address"` - Invalid email format
- `"field must contain only letters, numbers, and spaces"` - Invalid characters
- `"field cannot contain HTML tags"` - HTML detected
- `"Invalid ID format"` - Invalid MongoDB ObjectId
- `"Password must be at least 8 characters long"` - Weak password
- `"File size must be less than 5MB"` - File too large
- `"File type X is not allowed"` - Invalid file type

## Testing Validation

### Test Invalid Inputs

```bash
# Test registration with invalid email
POST /api/auth/register
{
  "name": "Test",
  "email": "invalid-email",
  "password": "weak"
}

# Response:
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email address",
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number"
  ]
}
```

### Test File Upload Validation

```bash
# Test with invalid file type
POST /api/food/add
Content-Type: multipart/form-data
file: document.pdf

# Response:
{
  "success": false,
  "message": "File validation failed",
  "errors": [
    "File type application/pdf is not allowed. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp"
  ]
}
```

## Security Benefits

### Protection Against:

1. **SQL/NoSQL Injection**
   - Inputs are sanitized and validated
   - MongoDB queries use parameterized inputs

2. **XSS Attacks**
   - HTML tags are escaped
   - Script injection prevented

3. **File Upload Attacks**
   - File types restricted
   - File sizes limited
   - Malicious files rejected

4. **Data Corruption**
   - Type validation prevents wrong data types
   - Length validation prevents buffer overflows
   - Required fields ensure data completeness

## Best Practices

1. **Always validate on the backend** - Never trust client-side validation alone
2. **Sanitize before storing** - Clean data before database operations
3. **Validate file uploads** - Check type, size, and content
4. **Use strong password requirements** - Enforce password complexity
5. **Provide clear error messages** - Help users fix validation errors
6. **Log validation failures** - Monitor for attack attempts

## Future Enhancements

- [ ] Add rate limiting for validation failures
- [ ] Implement CAPTCHA for registration
- [ ] Add image content validation (check actual image data)
- [ ] Implement file virus scanning
- [ ] Add more granular password requirements
- [ ] Implement input length limits per field type







