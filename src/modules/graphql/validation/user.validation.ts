import { GraphQLError } from "graphql";

export class UserValidation {
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new GraphQLError('Invalid email format', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }
  }

  static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new GraphQLError('Password must be at least 8 characters long', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new GraphQLError('Password must contain uppercase, lowercase letters and numbers', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }
  }

  static validateName(name: string): void {
    if (name.length < 2) {
      throw new GraphQLError('Name must be at least 2 characters long', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }

    if (name.length > 50) {
      throw new GraphQLError('Name must not exceed 50 characters', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }
  }
}

export class PostValidation {
  static validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new GraphQLError('Post content cannot be empty', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }

    if (content.length > 1000) {
      throw new GraphQLError('Post content must not exceed 1000 characters', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }
  }

  static validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new GraphQLError('Page must be at least 1', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }

    if (limit < 1 || limit > 100) {
      throw new GraphQLError('Limit must be between 1 and 100', {
        extensions: { code: 'VALIDATION_ERROR', statusCode: 400 }
      });
    }
  }
}