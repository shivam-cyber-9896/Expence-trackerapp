import { jwtDecode } from 'jwt-decode';

/**
 * Decodes a JWT token safely.
 * @param {string} token - The JWT token to decode.
 * @returns {object|null} The decoded token payload, or null if invalid.
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Checks if a JWT token has expired.
 * @param {string} token - The JWT token to check.
 * @returns {boolean} True if expired or invalid, false otherwise.
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000; // in seconds
  return decoded.exp < currentTime;
};

/**
 * Extracts employee user details from the JWT token.
 * @param {string} token - The JWT token.
 * @returns {object|null} Object containing email and role, or null if invalid.
 */
export const getUserFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    email: decoded.sub, // Subject in Spring Security JWT is usually the email/username
    role: decoded.role || null,
    employeeId: decoded.employeeId || null,
    exp: decoded.exp
  };
};
