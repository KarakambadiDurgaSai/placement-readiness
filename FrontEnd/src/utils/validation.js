/**
 * Shared validation utilities used across Registration and Student Profile pages.
 * Centralizes email, phone, name, and date validation logic to avoid duplication.
 */

// ─── Valid Top-Level Domains ───────────────────────────────────────────────────
export const VALID_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "mil", "in", "io", "ai", "me", "info",
  "biz", "us", "uk", "ca", "de", "fr", "jp", "au", "tech", "app", "dev",
  "online", "store", "cc", "tv", "fm", "xyz"
]);

// ─── Email Validation ──────────────────────────────────────────────────────────
/**
 * Validates an email address against standard format rules and a TLD whitelist.
 * - Checks overall format via regex
 * - Rejects consecutive dots in domain
 * - Validates each domain label (no leading/trailing hyphens)
 * - Ensures the final TLD is in the whitelist
 * @param {string} email - The email address (should already be lowercased)
 * @returns {boolean} true if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [username, domain] = parts;
  if (domain.includes("..")) return false;
  
  // Reject explicitly invalid/fake domains
  const INVALID_DOMAINS = new Set(["hmail.com", "gmai.com", "gmil.com", "gmal.com", "yaho.com"]);
  if (INVALID_DOMAINS.has(domain)) return false;

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;

  const domainLabelRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  for (const part of domainParts) {
    if (!domainLabelRegex.test(part)) return false;
  }

  const finalTld = domainParts[domainParts.length - 1];
  return VALID_TLDS.has(finalTld);
};

// ─── Phone Validation ──────────────────────────────────────────────────────────
/**
 * Validates an Indian mobile phone number.
 * - Exactly 10 digits
 * - First digit must be 6–9
 * @param {string} phone - Digits-only string
 * @returns {boolean} true if valid
 */
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

// ─── Company Contact Validation ────────────────────────────────────────────────
/**
 * Validates a company contact number (Mobile, Landline, or Toll-free).
 * - Mobile: 10 digits starting with 6-9
 * - Landline: 10-11 digits starting with 0
 * - Toll-free: 11 digits starting with 1800
 * @param {string} contact - The contact string (can contain spaces or hyphens)
 * @returns {boolean} true if valid
 */
export const isValidCompanyContact = (contact) => {
  if (!contact || !contact.trim()) return false;
  // Remove all spaces and hyphens for length/format checking
  const cleaned = contact.replace(/[\s-]/g, "");
  
  // Mobile: exactly 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(cleaned)) return true;
  
  // Landline: starts with 0, total 10 or 11 digits
  if (/^0\d{9,10}$/.test(cleaned)) return true;
  
  // Toll-free: starts with 1800, total 11 digits
  if (/^1800\d{7}$/.test(cleaned)) return true;

  return false;
};

// ─── Alpha-Only Validation (Names, States) ─────────────────────────────────────
/**
 * Validates that a string contains only letters (A-Z, a-z) and single spaces
 * between words. Rejects numbers, symbols, consecutive spaces, and
 * leading/trailing spaces.
 * @param {string} value - The string to validate
 * @returns {boolean} true if valid
 */
export const isAlphaOnly = (value) => {
  if (!value || value.trim() !== value) return false;           // no leading/trailing spaces
  if (/\s{2,}/.test(value)) return false;                       // no consecutive spaces
  return /^[A-Za-z]+(\s[A-Za-z]+)*$/.test(value);
};

// ─── Alpha Input Filter ────────────────────────────────────────────────────────
/**
 * Filters a raw input value to keep only letters and spaces,
 * trims leading spaces, and collapses consecutive spaces to one.
 * Use in onChange handlers for name/state fields.
 * @param {string} raw - The raw input value
 * @returns {string} The filtered value
 */
export const filterAlphaInput = (raw) => {
  let filtered = raw.replace(/[^A-Za-z\s]/g, "");  // strip non-alpha, non-space
  filtered = filtered.replace(/^\s+/, "");           // trim leading spaces
  filtered = filtered.replace(/\s{2,}/g, " ");      // collapse consecutive spaces
  return filtered;
};

// ─── Date Helpers ──────────────────────────────────────────────────────────────
/**
 * Returns today's date as a YYYY-MM-DD string, suitable for the
 * native date input's `max` attribute.
 * @returns {string}
 */
export const getTodayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ─── College Email Validation ──────────────────────────────────────────────────
/**
 * Validates a college email address.
 * - Must pass standard email rules (isValidEmail)
 * - Must have an educational domain (.edu, .ac.xx)
 * - Must not be a known personal email provider
 * @param {string} email - The email address
 * @returns {boolean} true if valid
 */
export const isValidCollegeEmail = (email) => {
  if (!isValidEmail(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;
  
  const [username, domain] = parts;

  // Username must start with a letter and contain only valid characters
  if (!/^[a-z][a-z0-9._-]*$/i.test(username)) return false;
  
  // No consecutive dots in username
  if (username.includes("..")) return false;

  // Reject personal email providers explicitly
  const PERSONAL_PROVIDERS = new Set([
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "proton.me", "protonmail.com", "live.com", "aol.com"
  ]);
  
  if (PERSONAL_PROVIDERS.has(domain)) return false;

  // Accept educational domains: ends with .edu, .edu.xx, or .ac.xx
  // This regex matches domains ending in .edu, or .ac.<2-letter-tld> like .ac.in
  const eduRegex = /(\.edu(\.[a-z]{2})?|\.ac\.[a-z]{2})$/i;
  return eduRegex.test(domain);
};

// ─── Skill Validation ──────────────────────────────────────────────────────────
/**
 * Validates a single skill string.
 * - Must contain at least one alphabet.
 * - Allowed: letters, digits, spaces, and . + # - , characters.
 * @param {string} skill - A single trimmed skill name
 * @returns {boolean} true if valid
 */
export const isValidSkill = (skill) => {
  if (!skill || !skill.trim()) return false;
  const trimmed = skill.trim();
  // Must have at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  // Only allowed characters: letters, digits, spaces, . + # - ,
  if (!/^[a-zA-Z0-9\s.+#\-,]+$/.test(trimmed)) return false;
  return true;
};

// ─── Project Title Validation ──────────────────────────────────────────────────
/**
 * Validates a project title.
 * - Must contain at least one alphabet.
 * - Allowed: letters, digits, spaces.
 * @param {string} title - The project title
 * @returns {boolean} true if valid
 */
export const isValidProjectTitle = (title) => {
  if (!title || !title.trim()) return false;
  const trimmed = title.trim();
  // Must have at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  // Only allowed characters: letters, digits, spaces
  if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) return false;
  return true;
};

// ─── URL Validation ────────────────────────────────────────────────────────────
/**
 * Validates a project URL.
 * - Must start with http:// or https://
 * - Must have a valid domain with at least one dot
 * - No bare domains (e.g. "github.com" without protocol)
 * @param {string} url - The URL string
 * @returns {boolean} true if valid
 */
export const isValidURL = (url) => {
  if (!url || !url.trim()) return false;
  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(url)) return false;
  // After the protocol there must be a meaningful host (no bare "https://")
  const withoutProtocol = url.replace(/^https?:\/\//i, "");
  if (!withoutProtocol || withoutProtocol.length < 3) return false;
  // Host must contain at least one dot (e.g. github.com)
  const host = withoutProtocol.split("/")[0];
  if (!host.includes(".")) return false;
  // No spaces
  if (/\s/.test(url)) return false;
  return true;
};

// ─── Company Email Validation ──────────────────────────────────────────────────
/**
 * Validates a professional company email address.
 * - Must pass standard email rules (isValidEmail)
 * - Must not be a known personal email provider
 * @param {string} email - The email address
 * @returns {boolean} true if valid
 */
export const isValidCompanyEmail = (email) => {
  if (!isValidEmail(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;
  
  const [username, domain] = parts;

  // Username must start with a letter and contain only valid characters
  if (!/^[a-z][a-z0-9._-]*$/i.test(username)) return false;
  
  // No consecutive dots in username
  if (username.includes("..")) return false;

  // Reject personal email providers explicitly
  const PERSONAL_PROVIDERS = new Set([
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "proton.me", "protonmail.com", "live.com", "aol.com"
  ]);
  
  if (PERSONAL_PROVIDERS.has(domain)) return false;

  return true;
};

// ─── Location Validation ───────────────────────────────────────────────────────
/**
 * Validates a location (like HQ or City).
 * - Must contain at least one alphabet.
 * - Allowed: letters, digits, spaces, comma, hyphen, period.
 * @param {string} location - The location string
 * @returns {boolean} true if valid
 */
export const isValidLocation = (location) => {
  if (!location || !location.trim()) return false;
  const trimmed = location.trim();
  // Must have at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  // Only allowed characters
  if (!/^[a-zA-Z0-9\s,.\-]+$/.test(trimmed)) return false;
  return true;
};
