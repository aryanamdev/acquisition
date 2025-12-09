import type { ZodError } from 'zod';

export const formatValidationError = (error: ZodError): string => {
  const messages = error.issues.map(issue => {
    const field = issue.path.join('.') || 'value';

    switch (issue.code) {
      // REQUIRED or wrong type
      case 'invalid_type': {
        // missing field ⇒ required
        if (typeof issue.input === 'undefined') {
          return `${field} is required`;
        }
        // wrong type but present
        return `${field} must be of type ${String(issue.expected)}`;
      }

      case 'too_small': {
        const origin = issue.origin; // string | array | number | ...
        const min = issue.minimum;

        if (origin === 'string') {
          return `${field} must be at least ${min} characters`;
        }
        if (origin === 'array') {
          return `${field} must contain at least ${min} items`;
        }
        if (origin === 'number' || origin === 'int' || origin === 'bigint') {
          return `${field} must be greater than or equal to ${min}`;
        }
        return `${field} is too small`;
      }

      case 'too_big': {
        const origin = issue.origin;
        const max = issue.maximum;

        if (origin === 'string') {
          return `${field} must be at most ${max} characters`;
        }
        if (origin === 'array') {
          return `${field} must contain at most ${max} items`;
        }
        if (origin === 'number' || origin === 'int' || origin === 'bigint') {
          return `${field} must be less than or equal to ${max}`;
        }
        return `${field} is too big`;
      }

      case 'not_multiple_of': {
        const divisor = issue.divisor;
        return `${field} must be a multiple of ${divisor}`;
      }

      case 'unrecognized_keys': {
        const keys = issue.keys || [];
        return `Unrecognized key(s): ${keys.join(', ')}`;
      }

      case 'invalid_union':
        return `${field} is invalid`;

      case 'invalid_key':
        return `Invalid key in ${field}`;

      case 'invalid_element':
        return `Invalid element in ${field}`;

      case 'invalid_value':
        return `Invalid value for ${field}`;

      case 'custom':
        // if you used .refine() with custom messages
        return issue.message || `${field} is invalid`;

      //Default message if none of the above matches
      default:
        return issue.message;
    }
  });

  // Single, plain string
  return messages.join('; ');
};
