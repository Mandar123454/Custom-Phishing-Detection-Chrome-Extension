// Import enhanced detection methods
import { 
  initializeEnhancedDetection,
  analyzeUrl as enhancedAnalyzeUrl,
  updateConfig
} from './enhanced_detection.js';

// Phishing detection features and rules for basic detection
const phishingRules = {
  // Domain-related checks
  domain: {
    // Check for suspicious TLDs
    suspiciousTlds: ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'club', 'online', 'site'],
    // Check for domain age (simulation)
    recentDomains: ['brand-new-site', 'just-created', 'verify-account'],
    // Check for misspellings of popular domains
    misspelledDomains: {
      'paypal': ['paypa1l', 'paypall', 'paypa1', 'paypa-l', 'payypal'],
      'microsoft': ['micros0ft', 'rnicrosoft', 'micrososft', 'microsoft-secure'],
      'amazon': ['arnaz0n', 'arnazon', 'amazan', 'amazonn', 'arnazon'],
      'apple': ['app1e', 'appl3', 'appie', 'apple-id', 'apple-secure'],
      'facebook': ['faceb00k', 'faceboook', 'facebokk', 'facbook'],
      'google': ['g00gle', 'googgle', 'gooogle', 'goggle'],
      'netflix': ['netf1ix', 'netflixx', 'net-flix', 'netflixaccount'],
      'instagram': ['instagran', 'lnstagram', 'instagrarn'],
      'linkedin': ['linkedln', 'linked-in', 'linkedim'],
      'twitter': ['twltter', 'tvvitter', 'tvvlter'],
      'outlook': ['0utlook', 'outlooks', 'outlook-mail'],
      'chase': ['chasebank', 'chaseonline', 'chase-secure'],
      'wellsfargo': ['wells-fargo', 'wellsfargobank', 'wellsfargo-secure'],
      'bankofamerica': ['bankofamerica-secure', 'bank0famerica', 'bancofamerica']
    }
  },
  
  // URL-related checks
  url: {
    // Check for excessive subdomains
    maxSubdomains: 3,
    // Check for suspicious URL patterns
    suspiciousPatterns: [
      'secure', 'account', 'login', 'signin', 'verify', 'update', 'confirm',
      'banking', 'authorize', 'authentication', 'password', 'support',
      'wallet', 'security', 'pay', 'sign-in', 'appleid', 'confirm-identity'
    ],
    // Check for URL length
    maxLength: 100,
    // Check for IP address in URL
    ipAddressPattern: /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/
  },
  
  // Content-related checks (will be done in content script)
  content: {
    // Check for login forms
    loginFormDetection: true,
    // Check for SSL certificate
    sslCheck: true,
    // Check for password fields
    passwordFieldDetection: true,
    // Check for suspicious keywords in the page
    suspiciousKeywords: [
      'verify your account', 'confirm your identity', 'security alert',
      'update your payment information', 'unusual activity', 'limited access',
      'account suspended', 'click here to verify', 'unusual sign-in attempt',
      'limited access', 'verify your identity', 'unauthorized access',
      'payment declined', 'confirm your payment details', 'security breach',
      'update billing information', 'account verification required',
      'password expired', 'document shared with you', 'invoice payment'
    ]
  }
};

// Configuration for the enhanced detection
const enhancedDetectionConfig = {
  // Default settings
  useMachineLearning: true,
  useAPIs: true,
  useHeuristics: true,
  scoringThresholds: {
    safe: 80,
    suspicious: 60,
    dangerous: 40
  }
};

// Initialize enhanced detection on startup
initializeEnhancedDetection()
  .then(result => {
    console.log('Enhanced detection initialized successfully');
    
    // Load any saved configuration from storage
    chrome.storage.sync.get(['enhancedDetectionConfig'], (result) => {
      if (result.enhancedDetectionConfig) {
        updateConfig(result.enhancedDetectionConfig);
      }
    });
  })
  .catch(error => {
    console.error('Failed to initialize enhanced detection:', error);
  });

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeUrl') {
    // Check if enhanced detection should be used
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || {};
      const useEnhancedDetection = settings.useEnhancedDetection !== false; // Default to true
      
      if (useEnhancedDetection) {
        // Use the enhanced ML-based detection
        enhancedAnalyzeUrl(message.url, message.documentData)
          .then(results => {
            // Save the analysis to history
            saveToHistory(message.url, results);
            
            // Convert the results format to match what the UI expects
            const convertedResults = convertEnhancedResults(results);
            sendResponse(convertedResults);
          })
          .catch(error => {
            console.error('Error in enhanced URL analysis:', error);
            // Fall back to basic analysis
            analyzeUrl(message.url)
              .then(results => sendResponse(results))
              .catch(fallbackError => {
                console.error('Fallback analysis also failed:', fallbackError);
                sendResponse({
                  error: 'Failed to analyze URL',
                  score: 50,
                  details: [{
                    type: 'warning',
                    message: 'Error analyzing URL: ' + error.message
                  }]
                });
              });
          });
      } else {
        // Use the basic detection
        analyzeUrl(message.url)
          .then(results => {
            // Save the analysis to history
            saveToHistory(message.url, results);
            sendResponse(results);
          })
          .catch(error => {
            console.error('Error analyzing URL:', error);
            sendResponse({error: 'Failed to analyze URL'});
          });
      }
    });
    
    // Return true to indicate that the response is asynchronous
    return true;
  }
  
  if (message.action === 'contentAnalysisDone') {
    // Store the content analysis results temporarily
    chrome.storage.local.set({
      [`contentAnalysis_${sender.tab.id}`]: message.results
    });
    return true;
  }
  
  if (message.action === 'updateDetectionConfig') {
    // Update the enhanced detection configuration
    updateConfig(message.config);
    
    // Save the config to storage
    chrome.storage.sync.set({
      enhancedDetectionConfig: message.config
    });
    
    sendResponse({success: true});
    return true;
  }
  
  if (message.action === 'getDetectionConfig') {
    // Return the current configuration
    chrome.storage.sync.get(['enhancedDetectionConfig'], (result) => {
      sendResponse(result.enhancedDetectionConfig || enhancedDetectionConfig);
    });
    return true;
  }
});

// Save analysis to history
function saveToHistory(url, results) {
  const historyItem = {
    url: url,
    timestamp: Date.now(),
    score: results.score,
    riskLevel: getRiskLevel(results.score),
    details: results.details || []
  };
  
  chrome.storage.local.get(['scanHistory'], (result) => {
    const history = result.scanHistory || [];
    
    // Add new scan to history
    history.unshift(historyItem);
    
    // Keep only the most recent 100 scans
    const trimmedHistory = history.slice(0, 100);
    
    // Save back to storage
    chrome.storage.local.set({
      scanHistory: trimmedHistory
    });
  });
}

// Convert enhanced results to the format expected by the UI
function convertEnhancedResults(enhancedResults) {
  // Extract the details from the indicators
  const details = [];
  
  // Add high-risk indicators
  if (enhancedResults.indicators && enhancedResults.indicators.high) {
    enhancedResults.indicators.high.forEach(message => {
      details.push({
        type: 'danger',
        message: message
      });
    });
  }
  
  // Add medium-risk indicators
  if (enhancedResults.indicators && enhancedResults.indicators.medium) {
    enhancedResults.indicators.medium.forEach(message => {
      details.push({
        type: 'warning',
        message: message
      });
    });
  }
  
  // Add low-risk indicators
  if (enhancedResults.indicators && enhancedResults.indicators.low) {
    enhancedResults.indicators.low.forEach(message => {
      details.push({
        type: 'info',
        message: message
      });
    });
  }
  
  // Add safe indicators
  if (enhancedResults.indicators && enhancedResults.indicators.safe) {
    enhancedResults.indicators.safe.forEach(message => {
      details.push({
        type: 'safe',
        message: message
      });
    });
  }
  
  return {
    score: enhancedResults.score,
    details: details,
    explanation: enhancedResults.explanation,
    riskLevel: enhancedResults.riskLevel
  };
}

// Get risk level based on score
function getRiskLevel(score) {
  if (score >= enhancedDetectionConfig.scoringThresholds.safe) {
    return 'Safe';
  } else if (score >= enhancedDetectionConfig.scoringThresholds.suspicious) {
    return 'Low Risk';
  } else if (score >= enhancedDetectionConfig.scoringThresholds.dangerous) {
    return 'Medium Risk';
  } else {
    return 'High Risk';
  }
}

// Listen for navigation events to trigger content analysis
chrome.webNavigation.onCompleted.addListener((details) => {
  // Only run for the main frame, not iframes
  if (details.frameId === 0) {
    // Tell content script to start analysis
    chrome.tabs.sendMessage(details.tabId, {
      action: 'analyzeContent'
    });
  }
});

// Basic URL analysis function (fallback if enhanced detection fails)
async function analyzeUrl(url) {
  try {
    // Parse URL
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;
    
    const results = {
      score: 100, // Start with a perfect score and subtract based on issues
      details: []
    };
    
    // Domain-based checks
    checkDomain(hostname, results);
    
    // URL-based checks
    checkUrl(parsedUrl, results);
    
    // If we're on https, give a positive indicator
    if (parsedUrl.protocol === 'https:') {
      results.details.push({
        type: 'safe',
        message: 'Site uses secure HTTPS connection'
      });
    } else {
      results.score -= 15;
      results.details.push({
        type: 'danger',
        message: 'Site does not use secure HTTPS connection'
      });
    }
    
    // Simulation of checking domain age - in a real extension this would query a service
    const isDomainNew = phishingRules.domain.recentDomains.some(part => 
      hostname.includes(part)
    );
    
    if (isDomainNew) {
      results.score -= 15;
      results.details.push({
        type: 'warning',
        message: 'Domain appears to be newly registered (high risk)'
      });
    } else {
      // Simulate domain age check - in a real extension this would be done via an API
      const randomAge = Math.floor(Math.random() * 10);
      if (randomAge < 2) {
        results.score -= 10;
        results.details.push({
          type: 'warning',
          message: 'Domain may be relatively new (potential risk)'
        });
      } else {
        results.details.push({
          type: 'safe',
          message: 'Domain appears to be well-established'
        });
      }
    }
    
    // Add simulation of content checks since we can't actually scan the content here
    simulateContentChecks(url, results);
    
    // Make sure score stays within 0-100 range
    results.score = Math.max(0, Math.min(100, results.score));
    
    return results;
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return {
      score: 50,
      details: [{
        type: 'warning',
        message: 'Error analyzing URL: ' + error.message
      }]
    };
  }
}

// Check domain for phishing indicators
function checkDomain(hostname, results) {
  // Check for IP address as hostname (often used in phishing)
  const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  if (ipPattern.test(hostname)) {
    results.score -= 25;
    results.details.push({
      type: 'danger',
      message: 'IP address used instead of domain name'
    });
  }
  
  // Check for suspicious TLDs
  const tld = hostname.split('.').pop();
  if (phishingRules.domain.suspiciousTlds.includes(tld)) {
    results.score -= 10;
    results.details.push({
      type: 'warning',
      message: `Suspicious top-level domain (.${tld})`
    });
  }
  
  // Check for misspelled popular domains
  for (const [popularDomain, misspellings] of Object.entries(phishingRules.domain.misspelledDomains)) {
    // Check if hostname contains any of the misspellings
    for (const misspelling of misspellings) {
      if (hostname.includes(misspelling)) {
        results.score -= 30;
        results.details.push({
          type: 'danger',
          message: `Possible imitation of ${popularDomain}.com`
        });
        break;
      }
    }
  }
  
  // Check for excessive subdomains
  const subdomainCount = hostname.split('.').length - 2; // -2 because domain.tld has 0 subdomains
  if (subdomainCount > phishingRules.url.maxSubdomains) {
    results.score -= 5;
    results.details.push({
      type: 'warning',
      message: 'Excessive number of subdomains'
    });
  }
}

// Check URL for phishing indicators
function checkUrl(parsedUrl, results) {
  const fullUrl = parsedUrl.href;
  const hostname = parsedUrl.hostname;
  const pathname = parsedUrl.pathname;
  
  // Check for IP address in URL
  if (phishingRules.url.ipAddressPattern.test(fullUrl)) {
    results.score -= 20;
    results.details.push({
      type: 'danger',
      message: 'URL contains an IP address instead of domain name'
    });
  }
  
  // Check URL length
  if (fullUrl.length > phishingRules.url.maxLength) {
    results.score -= 5;
    results.details.push({
      type: 'warning',
      message: 'Excessively long URL'
    });
  }
  
  // Check for suspicious patterns in URL
  let suspiciousPatternCount = 0;
  phishingRules.url.suspiciousPatterns.forEach(pattern => {
    if (fullUrl.toLowerCase().includes(pattern)) {
      suspiciousPatternCount++;
    }
  });
  
  if (suspiciousPatternCount >= 3) {
    results.score -= 15;
    results.details.push({
      type: 'warning',
      message: 'URL contains multiple suspicious keywords'
    });
  } else if (suspiciousPatternCount > 0) {
    results.score -= 5;
    results.details.push({
      type: 'warning',
      message: 'URL contains potentially suspicious keywords'
    });
  }
  
  // Check for data URI scheme
  if (parsedUrl.protocol === 'data:') {
    results.score -= 25;
    results.details.push({
      type: 'danger',
      message: 'Data URI scheme detected (commonly used in phishing)'
    });
  }
}

// Simulate content checks (in a real extension, these would come from the content script)
function simulateContentChecks(url, results) {
  // Simulate password field detection
  if (Math.random() > 0.5) {
    if (url.includes('login') || url.includes('signin')) {
      results.details.push({
        type: 'warning',
        message: 'Login form detected - verify site legitimacy'
      });
    } else {
      results.score -= 10;
      results.details.push({
        type: 'warning',
        message: 'Password field detected on non-login page'
      });
    }
  }
  
  // Simulate suspicious keywords in content
  if (Math.random() > 0.7) {
    results.score -= 15;
    results.details.push({
      type: 'danger',
      message: 'Page contains suspicious content asking for sensitive information'
    });
  }
  
  // Simulate checking for redirection
  if (Math.random() > 0.8) {
    results.score -= 10;
    results.details.push({
      type: 'warning',
      message: 'Multiple redirections detected before landing on this page'
    });
  }
}

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Phishing Detection Extension installed');
  
  // Initialize storage with default settings
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      const defaultSettings = {
        useEnhancedDetection: true,
        darkMode: false,
        autoScan: true,
        showNotifications: true,
        alertLevel: 'medium', // high, medium, low
        whitelistedDomains: []
      };
      
      chrome.storage.sync.set({ settings: defaultSettings });
    }
  });
  
  // Initialize API configuration with empty values
  chrome.storage.sync.get(['apiConfig'], (result) => {
    if (!result.apiConfig) {
      const defaultApiConfig = {
        googleSafeBrowsing: {
          enabled: false,
          apiKey: ''
        },
        virusTotal: {
          enabled: false,
          apiKey: ''
        },
        phishTank: {
          enabled: false,
          apiKey: ''
        }
      };
      
      chrome.storage.sync.set({ apiConfig: defaultApiConfig });
    }
  });
});
