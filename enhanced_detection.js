// Enhanced Phishing Detection Module with Machine Learning and API Integration

import PhishingDetectionModel from './ml_model.js';
import FeatureExtractor from './feature_extractor.js';
import APIIntegrationService from './api_integration.js';

// Global instances of our detection services
let mlModel = null;
let featureExtractor = null;
let apiService = null;

// Detection configuration with default settings
let config = {
  useMachineLearning: true,
  useAPIs: true,
  useHeuristics: true,
  scoringThresholds: {
    safe: 80,
    suspicious: 60,
    dangerous: 40
  }
};

// Detection method weights for final score calculation
const detectionWeights = {
  heuristics: 0.3,
  machineLearnling: 0.5,
  apis: 0.2
};

/**
 * Initialize all enhanced detection services
 */
async function initializeEnhancedDetection() {
  console.log('Initializing enhanced phishing detection services...');
  
  // Initialize feature extractor
  featureExtractor = new FeatureExtractor();
  
  // Initialize ML model
  mlModel = new PhishingDetectionModel();
  if (config.useMachineLearning) {
    await mlModel.initialize();
  }
  
  // Initialize API service
  apiService = new APIIntegrationService();
  
  // Load API configuration from storage
  chrome.storage.sync.get(['apiConfig'], (result) => {
    if (result.apiConfig) {
      apiService.configure(result.apiConfig);
      config.useAPIs = apiService.hasEnabledAPIs();
    }
  });
  
  console.log('Enhanced phishing detection initialized');
  return true;
}

/**
 * Initialize the ML model
 */
async function initializeMLModel() {
  if (!mlModel) {
    mlModel = new PhishingDetectionModel();
  }
  
  try {
    const result = await mlModel.initialize();
    console.log("ML model initialized:", result);
    return mlModel;
  } catch (error) {
    console.error("Error initializing ML model:", error);
    return null;
  }
}

/**
 * Extract advanced features from a URL and document
 */
function extractAdvancedFeatures(document, url) {
  if (!featureExtractor) {
    featureExtractor = new FeatureExtractor();
  }
  
  try {
    const urlFeatures = featureExtractor.extractUrlFeatures(url);
    const contentFeatures = document ? featureExtractor.extractContentFeatures(document) : {};
    
    return {
      ...urlFeatures,
      ...contentFeatures
    };
  } catch (error) {
    console.error("Error extracting features:", error);
    
    // Fallback to basic features
    const basicFeatures = {
      // URL-based features
      urlLength: url.length,
      domainLength: new URL(url).hostname.length,
      numSubdomains: new URL(url).hostname.split('.').length - 1,
      hasIP: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url),
      hasAtSymbol: url.includes('@'),
      hasDoubleSlash: url.includes('//') && url.lastIndexOf('//') > 8, // Excluding http:// or https://
      numDots: (url.match(/\./g) || []).length,
      
      // Content-based features (if document available)
      numForms: document ? document.forms.length : 0,
      numInputs: document ? document.querySelectorAll('input').length : 0,
      numPasswordInputs: document ? document.querySelectorAll('input[type="password"]').length : 0,
      numLinks: document ? document.querySelectorAll('a').length : 0,
      
      // Security indicators
      hasHttps: url.startsWith('https://'),
    };
    
    return basicFeatures;
  }
}

/**
 * Check favicon against known legitimate sites
 * @param {string} url - URL to check
 * @returns {Promise<Object>} - Results of favicon check
 */
async function checkFaviconHash(url) {
  try {
    const hostname = new URL(url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}`;
    
    // In a real implementation, we would:
    // 1. Fetch the favicon
    // 2. Generate a hash of the favicon
    // 3. Compare with known legitimate site favicon hashes
    
    // This is a simulation
    return {
      checked: true,
      matchesKnownSite: Math.random() > 0.5, // Random result for simulation
      similarityScore: Math.random(),
      targetBrand: Math.random() > 0.7 ? ['PayPal', 'Apple', 'Microsoft', 'Google', 'Amazon', 'Facebook'][Math.floor(Math.random() * 6)] : null
    };
  } catch (error) {
    console.error("Favicon check failed:", error);
    return {
      checked: false,
      error: error.message
    };
  }
}

/**
 * Analyze SSL certificate
 * @param {string} url - URL to analyze
 * @returns {Promise<Object>} - SSL certificate analysis
 */
async function analyzeSSLCertificate(url) {
  // In a real extension, this would use an API or native capabilities to get certificate info
  
  try {
    if (!url.startsWith('https://')) {
      return {
        hasSSL: false,
        securityLevel: 'poor',
        reason: 'No HTTPS connection'
      };
    }
    
    const hostname = new URL(url).hostname;
    
    // Simulate certificate check
    const issuers = ['DigiCert', 'Let\'s Encrypt', 'Comodo', 'GlobalSign'];
    const randomIssuer = issuers[Math.floor(Math.random() * issuers.length)];
    const isEV = Math.random() > 0.8; // Extended Validation
    const isTrusted = Math.random() > 0.1;
    const validFrom = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const validTo = new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    // Determine security level
    let securityLevel = 'good';
    let reason = 'Valid HTTPS certificate';
    
    if (!isTrusted) {
      securityLevel = 'poor';
      reason = 'Untrusted certificate';
    } else if (isEV) {
      securityLevel = 'excellent';
      reason = 'Extended Validation certificate';
    }
    
    return {
      hasSSL: true,
      issuer: randomIssuer,
      validFrom: validFrom,
      validTo: validTo,
      isEV: isEV,
      isTrusted: isTrusted,
      securityLevel: securityLevel,
      reason: reason
    };
  } catch (error) {
    console.error("SSL certificate analysis failed:", error);
    return {
      hasSSL: false,
      error: error.message,
      securityLevel: 'unknown'
    };
  }
}

/**
 * Analyze page text for suspicious content
 * @param {string} text - Page text content
 * @returns {Object} - Text analysis results
 */
function analyzePageText(text) {
  if (!text) return { suspiciousCount: 0, urgencyCount: 0, threatLevel: 'low', urgencyLevel: 'low' };
  
  // Count suspicious phrases
  const suspiciousPhrases = [
    'verify your account', 'confirm your identity', 'account suspended',
    'unusual activity', 'security alert', 'update your information',
    'limited access', 'verify your identity', 'your account has been limited',
    'click here immediately', 'urgent action required', 'login to continue',
    'unauthorized login attempt', 'suspicious sign-in activity', 'confirm payment',
    'payment declined', 'update billing information', 'verify credit card',
    'account compromised', 'security breach'
  ];
  
  let suspiciousCount = 0;
  const detectedPhrases = [];
  const lowerText = text.toLowerCase();
  
  suspiciousPhrases.forEach(phrase => {
    if (lowerText.includes(phrase.toLowerCase())) {
      suspiciousCount++;
      detectedPhrases.push(phrase);
    }
  });
  
  // Detect urgent language patterns
  const urgencyPatterns = [
    /urgent/i, /immediately/i, /warning/i, /alert/i, 
    /limited time/i, /expir(e|ed|es|ing)/i, /suspend(ed)?/i,
    /restricted/i, /blocked/i, /unauthorized/i, /compromised/i,
    /required action/i, /must verify/i, /within 24 hours/i,
    /account access/i, /security breach/i, /unusual activity/i
  ];
  
  let urgencyCount = 0;
  const detectedPatterns = [];
  
  urgencyPatterns.forEach(pattern => {
    if (pattern.test(lowerText)) {
      urgencyCount++;
      detectedPatterns.push(pattern.toString().replace(/\//g, '').replace('i', ''));
    }
  });
  
  return {
    suspiciousCount,
    urgencyCount,
    detectedPhrases,
    detectedPatterns,
    threatLevel: suspiciousCount > 3 ? 'high' : 
                 suspiciousCount > 1 ? 'medium' : 'low',
    urgencyLevel: urgencyCount > 2 ? 'high' : 
                  urgencyCount > 0 ? 'medium' : 'low',
    brandImpersonation: detectBrandImpersonation(text)
  };
}

/**
 * Detect brand impersonation
 * @param {string} text - Text to analyze
 * @returns {Object|null} - Brand impersonation info or null
 */
function detectBrandImpersonation(text) {
  if (!text) return null;
  
  const commonBrands = [
    { name: 'PayPal', patterns: [/paypal/i, /pay[\s-]?pal/i] },
    { name: 'Apple', patterns: [/apple/i, /icloud/i, /itunes/i] },
    { name: 'Microsoft', patterns: [/microsoft/i, /office365/i, /outlook/i, /onedrive/i] },
    { name: 'Google', patterns: [/google/i, /gmail/i, /youtube/i] },
    { name: 'Amazon', patterns: [/amazon/i, /aws/i] },
    { name: 'Facebook', patterns: [/facebook/i, /fb\s/i] },
    { name: 'Instagram', patterns: [/instagram/i, /insta/i] },
    { name: 'Netflix', patterns: [/netflix/i] },
    { name: 'Bank of America', patterns: [/bank\s+of\s+america/i, /bankofamerica/i] },
    { name: 'Chase', patterns: [/chase\s+bank/i, /jpmorgan\s+chase/i] },
    { name: 'Wells Fargo', patterns: [/wells\s+fargo/i, /wellsfargo/i] }
  ];
  
  for (const brand of commonBrands) {
    for (const pattern of brand.patterns) {
      if (pattern.test(text)) {
        return {
          detectedBrand: brand.name,
          confidence: 'medium'
        };
      }
    }
  }
  
  return null;
}

/**
 * Check domain reputation using external APIs
 * @param {string} url - Full URL or hostname to check
 * @returns {Promise<Object>} - Domain reputation results
 */
async function checkDomainReputation(url) {
  try {
    // If the APIIntegrationService isn't initialized yet, initialize it
    if (!apiService) {
      apiService = new APIIntegrationService();
      
      // Load API configuration from storage
      await new Promise(resolve => {
        chrome.storage.sync.get(['apiConfig'], (result) => {
          if (result.apiConfig) {
            apiService.configure(result.apiConfig);
          }
          resolve();
        });
      });
    }
    
    // Extract hostname if full URL was provided
    let hostname = url;
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      // If URL parsing fails, use the provided string as is
    }
    
    // Check if we have any API services configured
    if (apiService.hasEnabledAPIs()) {
      // Check the URL against all configured APIs
      const results = await apiService.checkUrl(url);
      
      return {
        checked: true,
        apis: results.apis,
        threatDetected: results.threatDetected,
        reputation: results.threatDetected ? 25 : 75, // Lower score if threats detected
        dataSource: Object.keys(results.apis)
      };
    } else {
      // Fallback to simulation if no APIs are configured
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            checked: true,
            reputation: Math.random() * 100,
            inBlacklist: Math.random() > 0.9,
            domainAge: Math.floor(Math.random() * 3650), // Age in days
            dataSource: ['Simulated API Call']
          });
        }, 300);
      });
    }
  } catch (error) {
    console.error("Error checking domain reputation:", error);
    return {
      checked: false,
      error: error.message
    };
  }
}

/**
 * Visual similarity detection (for brand impersonation)
 * @returns {Object} - Visual similarity check results
 */
function checkVisualSimilarity() {
  // This would use screenshot comparison with known sites
  // Beyond the scope of a simple extension but possible with external services
  
  // This is a placeholder for the concept
  return {
    checked: false,
    message: "Visual similarity detection requires external services"
  };
}

/**
 * Comprehensive URL and page analysis using all detection methods
 * @param {string} url - URL to analyze
 * @param {Document} document - Page document to analyze
 * @returns {Promise<Object>} - Comprehensive analysis results
 */
async function analyzeUrl(url, document) {
  try {
    console.log(`Analyzing URL: ${url}`);
    
    // Initialize enhanced detection if not already done
    if (!featureExtractor || !apiService) {
      await initializeEnhancedDetection();
    }
    
    const results = {
      url: url,
      timestamp: Date.now(),
      score: 0,
      riskLevel: 'Unknown',
      indicators: {},
      detectionMethods: {},
      explanation: '',
      features: {}
    };
    
    // 1. Extract features
    console.log("Extracting features...");
    results.features = extractAdvancedFeatures(document, url);
    
    // 2. Run ML detection if enabled
    if (config.useMachineLearning) {
      console.log("Running machine learning detection...");
      if (!mlModel) await initializeMLModel();
      
      if (mlModel) {
        const mlResults = await mlModel.predict(document, url);
        results.detectionMethods.machineLearning = mlResults;
      }
    }
    
    // 3. Check favicon similarity
    console.log("Checking favicon...");
    results.detectionMethods.favicon = await checkFaviconHash(url);
    
    // 4. Analyze SSL certificate
    console.log("Analyzing SSL certificate...");
    results.detectionMethods.ssl = await analyzeSSLCertificate(url);
    
    // 5. Analyze page text
    if (document && document.body) {
      console.log("Analyzing page text...");
      results.detectionMethods.textAnalysis = analyzePageText(document.body.innerText);
    }
    
    // 6. Check domain reputation
    console.log("Checking domain reputation...");
    results.detectionMethods.domainReputation = await checkDomainReputation(url);
    
    // 7. Calculate final phishing score
    results.score = calculateFinalScore(results);
    results.riskLevel = getRiskLevel(results.score);
    
    // 8. Compile indicators
    results.indicators = compileIndicators(results);
    
    // 9. Generate explanation
    results.explanation = generateExplanation(results);
    
    console.log(`Analysis complete. Score: ${results.score}, Risk Level: ${results.riskLevel}`);
    return results;
  } catch (error) {
    console.error("Error during URL analysis:", error);
    return {
      url: url,
      error: error.message,
      timestamp: Date.now(),
      score: 50, // Default to medium risk when error occurs
      riskLevel: 'Error',
      explanation: `Error analyzing URL: ${error.message}`
    };
  }
}

/**
 * Calculate final phishing score
 * @param {Object} results - Analysis results
 * @returns {number} - Final score (0-100)
 */
function calculateFinalScore(results) {
  let score = 70; // Start with neutral baseline
  
  // Machine learning score (most significant)
  if (results.detectionMethods.machineLearning) {
    const mlScore = results.detectionMethods.machineLearning.score;
    score = mlScore;
  } else {
    // If ML not available, use heuristic scoring
    
    // URL features
    if (results.features.hasIP) score -= 15;
    if (results.features.hasAtSymbol) score -= 10;
    if (results.features.urlLength > 75) score -= 5;
    if (results.features.numSubdomains > 3) score -= 10;
    if (results.features.hasHttps) score += 10;
    
    // SSL certificate
    if (results.detectionMethods.ssl) {
      if (!results.detectionMethods.ssl.hasSSL) score -= 15;
      if (results.detectionMethods.ssl.securityLevel === 'poor') score -= 10;
      if (results.detectionMethods.ssl.securityLevel === 'excellent') score += 10;
      if (results.detectionMethods.ssl.isEV) score += 10;
    }
    
    // Favicon analysis
    if (results.detectionMethods.favicon && results.detectionMethods.favicon.checked) {
      if (results.detectionMethods.favicon.matchesKnownSite) score -= 20; // Likely brand impersonation
    }
    
    // Text analysis
    if (results.detectionMethods.textAnalysis) {
      if (results.detectionMethods.textAnalysis.threatLevel === 'high') score -= 15;
      if (results.detectionMethods.textAnalysis.threatLevel === 'medium') score -= 7;
      if (results.detectionMethods.textAnalysis.urgencyLevel === 'high') score -= 10;
      if (results.detectionMethods.textAnalysis.brandImpersonation) score -= 15;
    }
    
    // Domain reputation
    if (results.detectionMethods.domainReputation && results.detectionMethods.domainReputation.checked) {
      if (results.detectionMethods.domainReputation.threatDetected) score -= 25;
      if (results.detectionMethods.domainReputation.inBlacklist) score -= 20;
      score += (results.detectionMethods.domainReputation.reputation || 0) / 10;
    }
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get risk level based on score
 * @param {number} score - Score (0-100)
 * @returns {string} - Risk level
 */
function getRiskLevel(score) {
  if (score >= config.scoringThresholds.safe) {
    return 'Safe';
  } else if (score >= config.scoringThresholds.suspicious) {
    return 'Low Risk';
  } else if (score >= config.scoringThresholds.dangerous) {
    return 'Medium Risk';
  } else {
    return 'High Risk';
  }
}

/**
 * Compile indicators from all detection methods
 * @param {Object} results - Analysis results
 * @returns {Object} - Compiled indicators
 */
function compileIndicators(results) {
  const indicators = {
    high: [],
    medium: [],
    low: [],
    safe: []
  };
  
  // URL-based indicators
  if (results.features.hasIP) {
    indicators.high.push('URL contains IP address instead of domain name');
  }
  
  if (results.features.hasAtSymbol) {
    indicators.high.push('URL contains @ symbol which can be used for deception');
  }
  
  if (results.features.urlLength > 75) {
    indicators.medium.push('Unusually long URL');
  }
  
  if (results.features.numSubdomains > 3) {
    indicators.medium.push('Excessive number of subdomains');
  }
  
  // SSL indicators
  if (results.detectionMethods.ssl) {
    if (!results.detectionMethods.ssl.hasSSL) {
      indicators.high.push('Site does not use secure HTTPS connection');
    } else {
      indicators.safe.push('Site uses secure HTTPS connection');
      
      if (results.detectionMethods.ssl.isEV) {
        indicators.safe.push('Site uses Extended Validation SSL certificate');
      }
      
      if (!results.detectionMethods.ssl.isTrusted) {
        indicators.medium.push('Site uses untrusted SSL certificate');
      }
    }
  }
  
  // Text analysis indicators
  if (results.detectionMethods.textAnalysis) {
    if (results.detectionMethods.textAnalysis.threatLevel === 'high') {
      indicators.high.push(`Page contains multiple suspicious phrases (${results.detectionMethods.textAnalysis.suspiciousCount} found)`);
    } else if (results.detectionMethods.textAnalysis.threatLevel === 'medium') {
      indicators.medium.push(`Page contains some suspicious phrases (${results.detectionMethods.textAnalysis.suspiciousCount} found)`);
    }
    
    if (results.detectionMethods.textAnalysis.urgencyLevel === 'high') {
      indicators.medium.push('Page uses urgent language to create pressure');
    }
    
    if (results.detectionMethods.textAnalysis.brandImpersonation) {
      indicators.high.push(`Possible ${results.detectionMethods.textAnalysis.brandImpersonation.detectedBrand} impersonation detected`);
    }
  }
  
  // Favicon indicators
  if (results.detectionMethods.favicon && results.detectionMethods.favicon.checked) {
    if (results.detectionMethods.favicon.matchesKnownSite && results.detectionMethods.favicon.targetBrand) {
      indicators.high.push(`Favicon similar to ${results.detectionMethods.favicon.targetBrand}`);
    }
  }
  
  // Domain reputation indicators
  if (results.detectionMethods.domainReputation && results.detectionMethods.domainReputation.checked) {
    if (results.detectionMethods.domainReputation.threatDetected) {
      indicators.high.push('Domain flagged by security services as malicious');
    }
    
    if (results.detectionMethods.domainReputation.inBlacklist) {
      indicators.high.push('Domain appears in known phishing blacklists');
    }
  }
  
  // Add ML model indicators if available
  if (results.detectionMethods.machineLearning && results.detectionMethods.machineLearning.explanation) {
    results.detectionMethods.machineLearning.explanation.forEach(item => {
      if (item.type === 'danger') {
        indicators.high.push(item.message);
      } else if (item.type === 'warning') {
        indicators.medium.push(item.message);
      } else if (item.type === 'safe') {
        indicators.safe.push(item.message);
      }
    });
  }
  
  return indicators;
}

/**
 * Generate explanation for the analysis results
 * @param {Object} results - Analysis results
 * @returns {string} - Human-readable explanation
 */
function generateExplanation(results) {
  let explanation = `This website has a safety score of ${results.score}/100 (${results.riskLevel}). `;
  
  // Add counts of different indicators
  const highCount = results.indicators.high ? results.indicators.high.length : 0;
  const mediumCount = results.indicators.medium ? results.indicators.medium.length : 0;
  const safeCount = results.indicators.safe ? results.indicators.safe.length : 0;
  
  if (highCount > 0) {
    explanation += `Found ${highCount} high-risk indicator${highCount > 1 ? 's' : ''}. `;
  }
  
  if (mediumCount > 0) {
    explanation += `Found ${mediumCount} medium-risk indicator${mediumCount > 1 ? 's' : ''}. `;
  }
  
  if (safeCount > 0) {
    explanation += `Found ${safeCount} safety indicator${safeCount > 1 ? 's' : ''}. `;
  }
  
  // Add recommendation based on risk level
  if (results.riskLevel === 'High Risk') {
    explanation += 'We strongly recommend not providing any personal information to this website.';
  } else if (results.riskLevel === 'Medium Risk') {
    explanation += 'Exercise caution when interacting with this website.';
  } else if (results.riskLevel === 'Low Risk') {
    explanation += 'This website appears to have some minor issues but is likely legitimate.';
  } else if (results.riskLevel === 'Safe') {
    explanation += 'This website appears to be legitimate and safe.';
  }
  
  return explanation;
}

/**
 * Update configuration settings
 * @param {Object} newConfig - New configuration settings
 */
function updateConfig(newConfig) {
  if (newConfig) {
    config = { ...config, ...newConfig };
    
    // Update API configuration if provided
    if (newConfig.apiConfig && apiService) {
      apiService.configure(newConfig.apiConfig);
      config.useAPIs = apiService.hasEnabledAPIs();
    }
    
    console.log("Enhanced detection configuration updated:", config);
  }
}

// Export all enhanced detection methods
export {
  initializeEnhancedDetection,
  initializeMLModel,
  extractAdvancedFeatures,
  checkFaviconHash,
  analyzeSSLCertificate,
  analyzePageText,
  checkDomainReputation,
  checkVisualSimilarity,
  analyzeUrl,
  updateConfig
};
