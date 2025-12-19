import validator from "validator";

/**
 * Sanitize string input - remove dangerous characters and trim
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return validator.escape(validator.trim(str));
};

/**
 * Sanitize object - recursively sanitize all string values
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Validation middleware factory
 * Creates a middleware function that validates request body against a schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const routePath = req.path || req.route?.path || "unknown";
    console.log(`[VALIDATION] ========== VALIDATION START ==========`);
    console.log(`[VALIDATION] Route: ${req.method} ${routePath}`);
    console.log(`[VALIDATION] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[VALIDATION] Schema fields:`, Object.keys(schema).join(", "));
    
    const errors = [];
    
    // Sanitize request body first
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Validate each field in schema
    for (const field in schema) {
      const rules = schema[field];
      const value = req.body[field];
      
      console.log(`[VALIDATION] Validating field: ${field}, value: ${value === undefined ? "undefined" : value === null ? "null" : typeof value === "string" ? `"${value}"` : value}`);
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        const errorMsg = `${field} is required`;
        console.error(`[VALIDATION] ERROR: ${errorMsg}`);
        errors.push(errorMsg);
        continue;
      }
      
      // Skip validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }
      
      // String validations
      if (rules.type === 'string' || typeof value === 'string') {
        // Min length
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }
        
        // Max length
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
        }
        
        // Email validation
        if (rules.isEmail && !validator.isEmail(value)) {
          errors.push(`${field} must be a valid email address`);
        }
        
        // Alphanumeric validation
        if (rules.isAlphanumeric && !validator.isAlphanumeric(value, 'en-US', { ignore: ' ' })) {
          errors.push(`${field} must contain only letters, numbers, and spaces`);
        }
        
        // No HTML tags
        if (rules.noHtml && validator.contains(value, '<')) {
          errors.push(`${field} cannot contain HTML tags`);
        }
      }
      
      // Number validations
      if (rules.type === 'number' || typeof value === 'number') {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(numValue)) {
          errors.push(`${field} must be a valid number`);
          continue;
        }
        
        // Min value
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        
        // Max value
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`);
        }
      }
      
      // Custom validation function
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    if (errors.length > 0) {
      console.error(`[VALIDATION] ========== VALIDATION FAILED ==========`);
      console.error(`[VALIDATION] Route: ${req.method} ${routePath}`);
      console.error(`[VALIDATION] Number of errors: ${errors.length}`);
      console.error(`[VALIDATION] Errors:`, errors);
      console.error(`[VALIDATION] Request body received:`, JSON.stringify(req.body, null, 2));
      console.error(`[VALIDATION] ========================================`);
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
        receivedBody: req.body,
        route: `${req.method} ${routePath}`
      });
    }
    
    console.log(`[VALIDATION] Validation passed for route: ${req.method} ${routePath}`);
    console.log(`[VALIDATION] ========== VALIDATION SUCCESS ==========`);
    next();
  };
};

/**
 * Password strength validator
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (password.length > 128) return "Password must be no more than 128 characters long";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  // Optional: special character requirement
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
  return null;
};

/**
 * Disposable email domain validator
 */
export const validateNonDisposableEmail = (email) => {
  if (!email) return "Email is required";
  if (typeof email !== "string") return "Email must be a string";

  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return null; // isEmail check will handle format

  const domain = email.slice(atIndex + 1).toLowerCase();

  // Simple blocklist of known disposable providers (can be extended)
  const disposableDomains = [
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "yopmail.com",
    "guerrillamail.com",
    "trashmail.com",
  ];

  if (disposableDomains.includes(domain)) {
    return "Disposable email addresses are not allowed. Please use a real email provider.";
  }

  return null;
};

/**
 * MongoDB ObjectId validator
 */
export const validateObjectId = (id) => {
  if (!id) return "ID is required";
  if (typeof id !== 'string') return "ID must be a string";
  if (!validator.isMongoId(id)) return "Invalid ID format";
  return null;
};








