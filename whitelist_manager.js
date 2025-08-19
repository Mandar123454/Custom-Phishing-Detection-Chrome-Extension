// Whitelist management for trusted domains

// Default whitelisted domains
const DEFAULT_WHITELIST = [
  'google.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'facebook.com',
  'youtube.com',
  'gmail.com',
  'outlook.com',
  'github.com',
  'linkedin.com'
];

// Initialize whitelist in storage
function initializeWhitelist() {
  chrome.storage.local.get('trustedDomains', (data) => {
    if (!data.trustedDomains) {
      chrome.storage.local.set({ trustedDomains: DEFAULT_WHITELIST });
    }
  });
}

// Add a domain to whitelist
function addToWhitelist(domain) {
  return new Promise((resolve, reject) => {
    try {
      // Extract base domain if a full URL is provided
      if (domain.startsWith('http')) {
        domain = new URL(domain).hostname;
      }
      
      // Remove www. prefix if present
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      
      // Get current whitelist
      chrome.storage.local.get('trustedDomains', (data) => {
        let whitelist = data.trustedDomains || [];
        
        // Add domain if not already in whitelist
        if (!whitelist.includes(domain)) {
          whitelist.push(domain);
          chrome.storage.local.set({ trustedDomains: whitelist }, () => {
            resolve({
              success: true,
              message: `${domain} added to trusted domains`,
              whitelist: whitelist
            });
          });
        } else {
          resolve({
            success: true,
            message: `${domain} is already in trusted domains`,
            whitelist: whitelist
          });
        }
      });
    } catch (error) {
      reject({
        success: false,
        message: `Error adding domain: ${error.message}`
      });
    }
  });
}

// Remove a domain from whitelist
function removeFromWhitelist(domain) {
  return new Promise((resolve, reject) => {
    try {
      // Get current whitelist
      chrome.storage.local.get('trustedDomains', (data) => {
        let whitelist = data.trustedDomains || [];
        
        // Remove domain if found
        const index = whitelist.indexOf(domain);
        if (index !== -1) {
          whitelist.splice(index, 1);
          chrome.storage.local.set({ trustedDomains: whitelist }, () => {
            resolve({
              success: true,
              message: `${domain} removed from trusted domains`,
              whitelist: whitelist
            });
          });
        } else {
          resolve({
            success: false,
            message: `${domain} not found in trusted domains`,
            whitelist: whitelist
          });
        }
      });
    } catch (error) {
      reject({
        success: false,
        message: `Error removing domain: ${error.message}`
      });
    }
  });
}

// Get the current whitelist
function getWhitelist() {
  return new Promise((resolve) => {
    chrome.storage.local.get('trustedDomains', (data) => {
      resolve(data.trustedDomains || []);
    });
  });
}

// Check if a domain is whitelisted
function isWhitelisted(url) {
  return new Promise((resolve) => {
    try {
      // Extract domain from URL
      const hostname = new URL(url).hostname;
      let domain = hostname;
      
      // Remove www. prefix if present
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
      
      // Get current whitelist and check
      chrome.storage.local.get('trustedDomains', (data) => {
        const whitelist = data.trustedDomains || [];
        
        // Check if domain or any parent domain is whitelisted
        const domainParts = domain.split('.');
        let trusted = false;
        
        // Check the domain and its parent domains
        for (let i = 0; i < domainParts.length - 1; i++) {
          const checkDomain = domainParts.slice(i).join('.');
          if (whitelist.includes(checkDomain)) {
            trusted = true;
            break;
          }
        }
        
        resolve({
          url: url,
          domain: domain,
          trusted: trusted
        });
      });
    } catch (error) {
      resolve({
        url: url,
        trusted: false,
        error: error.message
      });
    }
  });
}

// Reset whitelist to defaults
function resetWhitelist() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ trustedDomains: DEFAULT_WHITELIST }, () => {
      resolve({
        success: true,
        message: 'Whitelist reset to defaults',
        whitelist: DEFAULT_WHITELIST
      });
    });
  });
}

// Export whitelist functions
export {
  initializeWhitelist,
  addToWhitelist,
  removeFromWhitelist,
  getWhitelist,
  isWhitelisted,
  resetWhitelist
};
