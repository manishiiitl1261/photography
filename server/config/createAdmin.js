/**
 * List of predefined admin email addresses
 * 
 * This file contains manually defined email addresses that have admin access.
 * Authentication checks against this list instead of using role-based permissions.
 */

const adminEmails = [
  'admin@photography.com',
  'superadmin@photography.com',
  'manishrawat3703@gmail.com',
  // Add more admin emails as needed
];

/**
 * Check if an email is in the admin list
 * @param {string} email - The email to check
 * @returns {boolean} - Whether the email is an admin
 */
const isAdminEmail = (email) => {
  return adminEmails.includes(email.toLowerCase());
};

module.exports = {
  adminEmails,
  isAdminEmail
}; 