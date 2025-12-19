import { validatePassword, validateObjectId, validateNonDisposableEmail } from "./validation.js";

/**
 * Validation schemas for different endpoints
 * Used with the validate middleware
 */

// Registration schema
export const registerSchema = {
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
    maxLength: 100,
    custom: validateNonDisposableEmail
  },
  password: {
    type: 'string',
    required: true,
    custom: validatePassword
  }
};

// Login schema
export const loginSchema = {
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
};

// Email verification schema
export const verifyEmailSchema = {
  userId: {
    type: 'string',
    required: true,
    custom: validateObjectId
  },
  otp: {
    type: 'string',
    required: true,
    minLength: 6,
    maxLength: 6
  }
};

// Send verify OTP schema
export const sendVerifyOtpSchema = {
  userId: {
    type: 'string',
    required: true,
    custom: validateObjectId
  }
};

// Password reset request schema
export const sendResetOtpSchema = {
  email: {
    type: 'string',
    required: true,
    isEmail: true
  }
};

// Reset password schema
export const resetPasswordSchema = {
  email: {
    type: 'string',
    required: true,
    isEmail: true
  },
  otp: {
    type: 'string',
    required: true,
    minLength: 6,
    maxLength: 6
  },
  newPassword: {
    type: 'string',
    required: true,
    custom: validatePassword
  }
};

// Food item schema
export const foodSchema = {
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
};

// Edit food schema (all fields optional except id)
export const editFoodSchema = {
  id: {
    type: 'string',
    required: true,
    custom: validateObjectId
  },
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 100,
    noHtml: true
  },
  description: {
    type: 'string',
    required: false,
    minLength: 10,
    maxLength: 500,
    noHtml: true
  },
  price: {
    type: 'number',
    required: false,
    min: 0.01,
    max: 10000
  },
  category: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 50,
    noHtml: true
  }
};

// Remove food schema
export const removeFoodSchema = {
  id: {
    type: 'string',
    required: true,
    custom: validateObjectId
  }
};

// Category schema
export const categorySchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    isAlphanumeric: true,
    noHtml: true
  }
};

// Edit category schema
export const editCategorySchema = {
  id: {
    type: 'string',
    required: true,
    custom: validateObjectId
  },
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 50,
    isAlphanumeric: true,
    noHtml: true
  }
};

// Remove category schema
export const removeCategorySchema = {
  id: {
    type: 'string',
    required: true,
    custom: validateObjectId
  }
};

// Order placement schema
export const placeOrderSchema = {
  ordersdata: {
    type: 'object',
    required: true,
    custom: (value) => {
      if (!value) return "Order data is required";
      // Check for address (note: there's a typo in the model - 'adress' instead of 'address')
      if (!value.address && !value.adress) {
        return "Order address is required";
      }
      if (!value.items || !Array.isArray(value.items) || value.items.length === 0) {
        return "Order must contain at least one item";
      }
      if (!value.amount || typeof value.amount !== 'number' || value.amount <= 0) {
        return "Order amount must be a positive number";
      }
      return null;
    }
  }
};

// Update order status schema
export const updateOrderStatusSchema = {
  orderId: {
    type: 'string',
    required: true,
    custom: validateObjectId
  },
  status: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    noHtml: true
  }
};

// Cart operations schema
export const cartItemSchema = {
  itemId: {
    type: 'string',
    required: true,
    custom: validateObjectId
  }
};

