// Feature extraction module for phishing detection
// This module analyzes URLs and web content to extract features for the ML model

// Common phishing indicators
const SUSPICIOUS_KEYWORDS = [
  'verify', 'account', 'secure', 'banking', 'login', 'signin',
  'confirm', 'update', 'security', 'official', 'password',
  'authenticate', 'validation', 'wallet', 'alert'
];

// TLD risk scores (higher = more risky)
const TLD_RISK = {
  'com': 0.1,
  'org': 0.1,
  'net': 0.2,
  'edu': 0.05,
  'gov': 0.01,
  'tk': 0.8,
  'ga': 0.8,
  'cf': 0.8,
  'ml': 0.8,
  'gq': 0.8,
  'top': 0.7,
  'xyz': 0.6,
  'info': 0.5,
  'site': 0.5,
  'online': 0.4
};

/**
 * Extracts features from URL for phishing detection
 * @param {string} url - URL to analyze
 * @return {Object} Extracted features
 */
function extractUrlFeatures(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Basic URL features
    const urlLength = url.length;
    const domainLength = domain.length;
    const pathLength = urlObj.pathname.length;
    
    // Count special characters
    const specialCharCount = (url.match(/[^a-zA-Z0-9]/g) || []).length;
    
    // Check for IP address instead of domain
    const hasIpAddress = /\d+\.\d+\.\d+\.\d+/.test(domain);
    
    // Count subdomains
    const subdomainCount = (domain.match(/\./g) || []).length;
    
    // Check for suspicious TLD
    const tld = domain.split('.').pop().toLowerCase();
    const tldRiskScore = TLD_RISK[tld] || 0.3; // Default risk if unknown TLD
    
    // Check for suspicious keywords in domain
    const suspiciousKeywordCount = SUSPICIOUS_KEYWORDS.reduce((count, keyword) => {
      return count + (domain.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    // URL entropy (higher entropy often indicates randomized/phishing domains)
    const entropy = calculateEntropy(domain);
    
    return {
      urlLength,
      domainLength,
      pathLength,
      specialCharCount,
      hasIpAddress,
      subdomainCount,
      tldRiskScore,
      suspiciousKeywordCount,
      entropy
    };
  } catch (error) {
    console.error("Error extracting URL features:", error);
    return {};
  }
}

/**
 * Extracts features from page content for phishing detection
 * @param {Document} document - DOM document to analyze
 * @return {Object} Extracted features
 */
function extractContentFeatures(document) {
  // Form analysis
  const forms = document.querySelectorAll('form');
  const hasLoginForm = Array.from(forms).some(form => {
    const formHTML = form.innerHTML.toLowerCase();
    return (formHTML.includes('password') || formHTML.includes('login'));
  });
  
  // Password field count
  const passwordFieldCount = document.querySelectorAll('input[type="password"]').length;
  
  // External resource count
  const externalResourceCount = Array.from(document.querySelectorAll('img, script, iframe, link'))
    .filter(el => {
      if (!el.src && !el.href) return false;
      const url = el.src || el.href;
      try {
        const urlObj = new URL(url, document.location.href);
        return urlObj.hostname !== document.location.hostname;
      } catch (e) {
        return false;
      }
    }).length;
  
  // Check for favicon
  const hasFavicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]') !== null;
  
  // Check for legitimate security indicators
  const hasHttpsIndicator = document.querySelectorAll('img[src*="https"], img[src*="lock"], img[src*="secure"]').length > 0;
  
  // Brand logos (potential brand impersonation)
  const imgElements = document.querySelectorAll('img');
  const hasPopularBrandLogo = Array.from(imgElements).some(img => {
    const imgSrc = (img.src || '').toLowerCase();
    const imgAlt = (img.alt || '').toLowerCase();
    return ['paypal', 'bank', 'visa', 'mastercard', 'amazon', 'google', 'facebook', 'apple']
      .some(brand => imgSrc.includes(brand) || imgAlt.includes(brand));
  });
  
  return {
    hasLoginForm,
    passwordFieldCount,
    externalResourceCount,
    hasFavicon,
    hasHttpsIndicator,
    hasPopularBrandLogo
  };
}

/**
 * Calculate Shannon entropy of a string
 * @param {string} str - Input string
 * @return {number} Entropy value
 */
function calculateEntropy(str) {
  const len = str.length;
  const frequencies = {};
  
  // Count character frequencies
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  // Calculate entropy
  return Object.values(frequencies).reduce((entropy, count) => {
    const p = count / len;
    return entropy - p * Math.log2(p);
  }, 0);
}

/**
 * Extracts all features for phishing detection
 * @param {string} url - URL to analyze
 * @param {Document} document - DOM document to analyze
 * @return {Object} Combined features
 */
function extractFeatures(url, document = null) {
  const urlFeatures = extractUrlFeatures(url);
  const contentFeatures = document ? extractContentFeatures(document) : {};
  
  return {
    ...urlFeatures,
    ...contentFeatures,
    timestamp: Date.now()
  };
}

export {
  extractFeatures,
  extractUrlFeatures,
  extractContentFeatures
};
