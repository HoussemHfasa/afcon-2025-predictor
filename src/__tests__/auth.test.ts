/**
 * Unit tests for authentication validation
 */

import { z } from 'zod';

// Registration schema (same as in register/route.ts)
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Password reset schema (same as in reset-password/route.ts)
const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

describe('Auth Validation', () => {
  describe('Registration Schema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser123',
        password: 'Password1',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        username: 'testuser',
        password: 'Password1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject username shorter than 3 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'ab',
        password: 'Password1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject username with special characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'user@name!',
        password: 'Password1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'PASSWORD1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Pass1',
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Schema', () => {
    it('should accept valid reset data', () => {
      const validData = {
        token: 'valid-token-123',
        password: 'NewPassword1',
      };
      const result = resetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const invalidData = {
        token: '',
        password: 'NewPassword1',
      };
      const result = resetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password in reset', () => {
      const invalidData = {
        token: 'valid-token',
        password: 'weak',
      };
      const result = resetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
