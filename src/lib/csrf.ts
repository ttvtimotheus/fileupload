import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new CSRF token
 * 
 * This is used for double-submit CSRF protection:
 * 1. We generate a token and include it in the page as a meta tag
 * 2. When making requests, we send this token both as an HTTP header and in the form data
 * 3. The server validates that both tokens match to prevent CSRF attacks
 */
export function generateCsrfToken(): string {
  return uuidv4();
}
