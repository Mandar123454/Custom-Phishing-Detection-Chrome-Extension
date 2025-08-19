// Content script runs on each page load
console.log("Phishing Detection Extension - Content Script Loaded");

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeContent') {
    const results = analyzePageContent();
    
    // Send results back to background script
    chrome.runtime.sendMessage({
      action: 'contentAnalysisDone',
      results: results
    });
    
    // Also send page information for ML analysis
    chrome.runtime.sendMessage({
      action: 'analyzeUrl',
      url: window.location.href,
      documentData: collectPageDataForML()
    });
    
    return true;
  }
  
  // Handle request for page data for ML analysis
  if (message.action === 'getPageDataForML') {
    sendResponse(collectPageDataForML());
    return true;
  }
});

// Collect page information for ML analysis
function collectPageDataForML() {
  // This function collects key information from the page that will be used
  // by the ML model for analysis. We can't send the full document object,
  // so we extract the important parts.
  
  try {
    const pageData = {
      // URL information
      url: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      
      // Document metadata
      title: document.title,
      hasCanonicalLink: !!document.querySelector('link[rel="canonical"]'),
      hasFavicon: !!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]'),
      
      // Form information
      formCount: document.forms.length,
      inputCount: document.querySelectorAll('input').length,
      passwordFieldCount: document.querySelectorAll('input[type="password"]').length,
      
      // Link information
      linkCount: document.querySelectorAll('a').length,
      externalLinkCount: Array.from(document.querySelectorAll('a[href]'))
        .filter(a => {
          try {
            const linkUrl = new URL(a.href);
            return linkUrl.hostname !== window.location.hostname;
          } catch (e) {
            return false;
          }
        }).length,
      
      // Other embedded content
      iframeCount: document.querySelectorAll('iframe').length,
      scriptCount: document.querySelectorAll('script').length,
      
      // Page text for analysis
      bodyText: document.body.innerText.substring(0, 20000), // Limit to 20K chars
      
      // Text to HTML ratio (approximation)
      textToHtmlRatio: document.body.innerText.length / document.documentElement.innerHTML.length,
      
      // Security indicators
      hasHttps: window.location.protocol === 'https:',
      
      // Authentication indicators
      hasSocialAuthButtons: !!document.querySelector(
        '[class*="login"], [class*="signin"], [class*="google"], [class*="facebook"], ' +
        '[class*="twitter"], [class*="apple"], [class*="oauth"], [id*="login"], [id*="signin"]'
      ),
      
      // Other potential phishing indicators
      hasHiddenFields: document.querySelectorAll('input[type="hidden"]').length,
      hiddenContentCount: document.querySelectorAll(
        '[style*="display:none"], [style*="display: none"], ' + 
        '[style*="visibility:hidden"], [style*="visibility: hidden"]'
      ).length
    };
    
    return pageData;
  } catch (error) {
    console.error('Error collecting page data:', error);
    return {
      error: error.message,
      url: window.location.href
    };
  }
}

// Analyze the content of the current page for phishing indicators
function analyzePageContent() {
  const results = {
    hasForms: false,
    hasPasswordFields: false,
    hasMultipleRedirects: false,
    loginFormOnNonSecurePage: false,
    suspiciousElements: [],
    legitElements: []
  };
  
  // Check if page has forms
  const forms = document.querySelectorAll('form');
  results.hasForms = forms.length > 0;
  
  // Check for password fields
  const passwordFields = document.querySelectorAll('input[type="password"]');
  results.hasPasswordFields = passwordFields.length > 0;
  
  // If there's a password field on a non-HTTPS page, that's very suspicious
  if (results.hasPasswordFields && location.protocol !== 'https:') {
    results.loginFormOnNonSecurePage = true;
    results.suspiciousElements.push('Password field on non-secure connection');
  }
  
  // Check for iframes (commonly used in phishing to load legitimate site in frame)
  const iframes = document.querySelectorAll('iframe');
  if (iframes.length > 0) {
    results.suspiciousElements.push(`Found ${iframes.length} iframe(s)`);
  }
  
  // Check for common form targets used in phishing
  forms.forEach(form => {
    const action = form.getAttribute('action');
    if (action) {
      if (action.includes('formsubmit') || 
          action.includes('formspree') || 
          action.includes('formkeep') ||
          action.includes('formcarry') ||
          action.includes('sheets.googleapis.com')) {
        results.suspiciousElements.push('Form submits data to a generic form processing service');
      }
    }
  });
  
  // Check for hidden fields that may be used for phishing
  const hiddenFields = document.querySelectorAll('input[type="hidden"][name*="email" i], input[type="hidden"][name*="pass" i]');
  if (hiddenFields.length > 0) {
    results.suspiciousElements.push('Hidden fields potentially collecting sensitive information');
  }
  
  // Check for suspicious text content
  const bodyText = document.body.innerText.toLowerCase();
  const suspiciousTexts = [
    'verify your account',
    'confirm your identity',
    'unusual activity',
    'account suspended',
    'limited access',
    'update your payment',
    'security alert',
    'suspicious login attempt'
  ];
  
  suspiciousTexts.forEach(text => {
    if (bodyText.includes(text.toLowerCase())) {
      results.suspiciousElements.push(`Page contains suspicious text: "${text}"`);
    }
  });
  
  // Check for legitimate security indicators
  if (document.querySelector('link[rel="canonical"]')) {
    results.legitElements.push('Page has canonical URL set');
  }
  
  // Look for common secure login patterns
  if (document.querySelector('meta[name="google-signin-client_id"]')) {
    results.legitElements.push('Google Sign-In integration detected');
  }
  
  if (document.querySelector('script[src*="facebook.com/sdk"]')) {
    results.legitElements.push('Facebook SDK integration detected');
  }
  
  // Look for privacy policy and terms links (common on legitimate sites)
  const links = document.querySelectorAll('a');
  let hasPrivacyPolicy = false;
  let hasTerms = false;
  
  links.forEach(link => {
    const href = link.href.toLowerCase();
    const text = link.textContent.toLowerCase();
    
    if (href.includes('privacy') || text.includes('privacy policy')) {
      hasPrivacyPolicy = true;
    }
    
    if (href.includes('terms') || text.includes('terms')) {
      hasTerms = true;
    }
  });
  
  if (hasPrivacyPolicy) {
    results.legitElements.push('Privacy Policy link found');
  }
  
  if (hasTerms) {
    results.legitElements.push('Terms & Conditions link found');
  }
  
  return results;
}
