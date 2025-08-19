document.addEventListener('DOMContentLoaded', function() {
  const scanButton = document.getElementById('scanButton');
  const historyButton = document.getElementById('historyButton');
  const dashboardButton = document.getElementById('dashboardButton');
  const historyDiv = document.getElementById('history');
  const historyList = document.getElementById('historyList');
  const resultDiv = document.getElementById('result');
  const loader = document.getElementById('loader');
  const statusText = document.getElementById('statusText');
  const scoreElement = document.getElementById('score');
  const detailsList = document.getElementById('detectionDetails');
  const safetyScore = document.getElementById('safetyScore');
  
  let currentTab = null;
  
  // Get current tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    currentTab = tabs[0];
    checkCurrentPage(currentTab.url);
  });
  
  // Add event listeners
  scanButton.addEventListener('click', function() {
    checkCurrentPage(currentTab.url);
  });
  
  historyButton.addEventListener('click', function() {
    toggleHistory();
  });
  
  dashboardButton.addEventListener('click', function() {
    chrome.tabs.create({url: 'dashboard.html'});
  });
  
  // Check the current page for phishing
  function checkCurrentPage(url) {
    // Reset UI
    resultDiv.style.display = 'none';
    loader.style.display = 'block';
    statusText.textContent = 'Analyzing current page...';
    
    // Clear previous results
    while (detailsList.firstChild) {
      detailsList.removeChild(detailsList.firstChild);
    }
    
    // Simulate detection delay
    setTimeout(function() {
      const result = analyzePage(url);
      displayResults(result);
      saveToHistory(result);
    }, 1500);
  }
  
  // Display results in the popup
  function displayResults(result) {
    // Update status
    loader.style.display = 'none';
    resultDiv.style.display = 'block';
    
    // Set the safety score
    const scoreValue = Math.round(result.score * 100);
    // Ensure score doesn't exceed 100
    const displayScore = Math.min(scoreValue, 100);
    scoreElement.textContent = displayScore + '/100';
    
    // Update the status class
    safetyScore.className = 'safety-score';
    if (result.score < 0.3) {
      safetyScore.classList.add('safe');
      statusText.textContent = 'This website appears to be safe.';
      statusText.style.color = '#4caf50';
    } else if (result.score < 0.7) {
      safetyScore.classList.add('warning');
      statusText.textContent = 'This website has some suspicious characteristics.';
      statusText.style.color = '#ffca28';
    } else {
      safetyScore.classList.add('danger');
      statusText.textContent = 'Warning! This website is likely a phishing attempt.';
      statusText.style.color = '#f44336';
    }
    
    // Add detection details
    result.details.forEach(function(detail) {
      const li = document.createElement('li');
      li.className = detail.type;
      li.innerHTML = `<i class="fas ${detail.icon}"></i> ${detail.text}`;
      detailsList.appendChild(li);
    });
  }
  
  // Save result to history
  function saveToHistory(result) {
    // Get existing history from storage
    chrome.storage.local.get('scanHistory', function(data) {
      let history = data.scanHistory || [];
      
      // Add new entry
      history.unshift({
        url: result.url,
        score: result.score,
        timestamp: new Date().toISOString(),
        classification: result.classification
      });
      
      // Keep only the last 10 entries
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      // Save back to storage
      chrome.storage.local.set({scanHistory: history});
      
      // Update history list if visible
      if (historyDiv.style.display === 'block') {
        updateHistoryList(history);
      }
    });
  }
  
  // Update the history list in the UI
  function updateHistoryList(history) {
    // Clear existing history
    while (historyList.firstChild) {
      historyList.removeChild(historyList.firstChild);
    }
    
    // Add history entries
    history.forEach(function(entry) {
      const li = document.createElement('li');
      
      // Create top info section with score and timestamp
      const scanInfo = document.createElement('div');
      scanInfo.className = 'scan-info';
      
      const scoreSpan = document.createElement('span');
      // Ensure score is between 0 and 1 before multiplying
      const normalizedScore = Math.min(Math.max(entry.score, 0), 1);
      const scoreValue = Math.round(normalizedScore * 100);
      
      let className = '';
      if (normalizedScore < 0.3) {
        className = 'safe';
        li.style.borderLeftColor = '#4caf50';
      } else if (normalizedScore < 0.7) {
        className = 'warning';
        li.style.borderLeftColor = '#ffca28';
      } else {
        className = 'danger';
        li.style.borderLeftColor = '#f44336';
      }
      
      scoreSpan.className = 'score-tag ' + className;
      scoreSpan.textContent = scoreValue + '/100';
      
      const timestamp = document.createElement('div');
      timestamp.className = 'timestamp';
      const date = new Date(entry.timestamp);
      timestamp.textContent = date.toLocaleString();
      
      scanInfo.appendChild(scoreSpan);
      scanInfo.appendChild(timestamp);
      
      // Create URL text section
      const urlSpan = document.createElement('div');
      urlSpan.className = 'url-text';
      // Clean up file:// URLs for display
      let displayUrl = entry.url;
      if (displayUrl.startsWith('file://')) {
        // Extract just the filename or last part of the path
        const urlParts = displayUrl.split('/');
        displayUrl = urlParts[urlParts.length - 1] || displayUrl;
        // Decode URL components
        displayUrl = decodeURIComponent(displayUrl);
      }
      urlSpan.textContent = displayUrl;
      
      // Add to list item
      li.appendChild(scanInfo);
      li.appendChild(urlSpan);
      
      historyList.appendChild(li);
    });
  }
  
  // Toggle history visibility
  function toggleHistory() {
    if (historyDiv.style.display === 'block') {
      historyDiv.style.display = 'none';
    } else {
      historyDiv.style.display = 'block';
      
      // Load history from storage
      chrome.storage.local.get('scanHistory', function(data) {
        const history = data.scanHistory || [];
        updateHistoryList(history);
      });
    }
  }
  
  // Analyze a page for phishing indicators
function analyzePage(url) {
  // In a real extension, this would use the ML model and feature extraction
  // Here we'll simulate the detection with some basic rules
  
  let score = 0;
  const details = [];
  
  // Handle file:// URLs differently
  if (url.startsWith('file://')) {
    score = 0.02; // Assume local files are generally safe
    details.push({
      type: 'safe',
      icon: 'fa-check-circle',
      text: 'Local file access'
    });
  } else {
    // Check URL characteristics
    if (url.length > 100) {
      score += 0.2;
      details.push({
        type: 'danger',
        icon: 'fa-exclamation-triangle',
        text: 'Excessively long URL'
      });
    }
    
    if (!url.startsWith('https://')) {
      score += 0.15;
      details.push({
        type: 'danger',
        icon: 'fa-unlock',
        text: 'Site does not use secure HTTPS connection'
      });
    }
  }    // Check for common safe domains
    const safeDomains = ['google.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'microsoft.com', 'github.com'];
    const hostname = new URL(url).hostname;
    
    const isSafeDomain = safeDomains.some(domain => hostname.includes(domain) && hostname.endsWith(domain));
    
    if (isSafeDomain) {
      score -= 0.3;
      details.push({
        type: 'safe',
        icon: 'fa-check-circle',
        text: 'Domain appears to be well-established'
      });
    } else {
      // Check for suspicious domain characteristics
      if (hostname.includes('secure') || hostname.includes('login') || hostname.includes('account')) {
        score += 0.1;
        details.push({
          type: 'warning',
          icon: 'fa-exclamation-circle',
          text: 'Contains keywords commonly used in phishing attempts'
        });
      }
      
      if (hostname.includes('paypal') || hostname.includes('bank') || hostname.includes('amazon')) {
        if (!isSafeDomain) {
          score += 0.25;
          details.push({
            type: 'danger',
            icon: 'fa-user-secret',
            text: 'Site appears to be impersonating a legitimate brand'
          });
        }
      }
    }
    
    // Add some randomness to simulate real-world variation
    score += Math.random() * 0.2 - 0.1;
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(1, score));
    
    // Determine classification based on score
    let classification;
    if (score < 0.3) {
      classification = 'safe';
    } else if (score < 0.7) {
      classification = 'suspicious';
    } else {
      classification = 'phishing';
    }
    
    // Return the result
    return {
      url: url,
      score: score,
      classification: classification,
      timestamp: new Date().toISOString(),
      details: details
    };
  }
});
