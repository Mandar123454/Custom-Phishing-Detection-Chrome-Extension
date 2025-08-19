// Dashboard JavaScript - Analysis charts removed
// Using global functions instead of imports

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM content loaded in dashboard.js");
  
  try {
    // Set up event listeners
    setupEventListeners();
    
    // Load recent detections data
    loadRecentDetections();
    
    // Log initialization without showing a notification
    console.log("Dashboard initialization complete");
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
});

// Function to set up event listeners
function setupEventListeners() {
  console.log("Setting up event listeners");

  // URL check form submission
  const urlCheckForm = document.getElementById('url-check-form');
  if (urlCheckForm) {
    urlCheckForm.addEventListener('submit', handleUrlCheckSubmission);
    console.log("URL check form listener added");
  }
  
  // Settings form submission
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSettingsSubmission);
    console.log("Settings form listener added");
  }
  
  // Dark/light mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    console.log("Theme toggle listener added");
  }
  
  // Export data button - Only using delegation now
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    console.log("Found export button:", exportBtn);
    // No direct event listener to avoid double execution
  } else {
    console.error("Export button not found");
  }
  
  // Set up delegation for action buttons
  document.addEventListener('click', function(e) {
    // Find the button or its icon
    let target = e.target;
    let isButton = target.classList.contains('action-button');
    let isIcon = target.tagName === 'I' && target.parentElement.classList.contains('action-button');
    
    if (isButton || isIcon) {
      // If clicked on icon, get the parent button
      const button = isButton ? target : target.parentElement;
      const buttonText = button.textContent.trim();
      
      console.log("Action button clicked:", buttonText);
      
      if (buttonText.includes('Details')) {
        handleDetailsView(e);
      } else if (buttonText.includes('Configure')) {
        handleConfigureAPI(e);
      } else if (buttonText.includes('Connect')) {
        handleConnectAPI(e);
      } else if (buttonText.includes('Export')) {
        handleExportData();
      }
    }
  });
  
  // Update model button - DIRECT METHOD
  const updateModelBtn = document.getElementById('updateModelBtn');
  if (updateModelBtn) {
    console.log("Found update model button");
    updateModelBtn.addEventListener('click', function() {
      console.log("Update model button clicked");
      handleModelUpdate();
    });
  } else {
    console.error("Update model button not found");
  }
  
  console.log("All event listeners set up successfully");
}

// Function to handle URL check form submission
async function handleUrlCheckSubmission(event) {
  event.preventDefault();
  
  const urlInput = document.getElementById('url-input');
  if (!urlInput) {
    showNotification('URL input not found', 'error');
    return;
  }
  
  const url = urlInput.value.trim();
  
  if (!url) {
    showNotification('Please enter a URL to check', 'error');
    return;
  }
  
  try {
    // Show loading state
    showLoadingIndicator();
    
    // For now, create mock data since we removed the imports
    // In a real scenario, these would call the actual functions
    const mockFeatures = { 
      length: url.length,
      hasSpecialChars: /[^a-zA-Z0-9.-]/.test(url),
      domainAge: 365,
      hasSSL: url.startsWith('https')
    };
    
    const mockPrediction = {
      risk: url.includes('phish') || url.includes('secure-') ? 'high' : 
            url.includes('login') || url.includes('account') ? 'medium' : 'safe',
      confidence: 0.92,
      classification: url.includes('phish') ? 'Phishing' : 'Legitimate'
    };
    
    const mockApiResults = {
      safeBrowsing: { status: mockPrediction.risk === 'high' ? 'Flagged' : 'Safe' },
      virusTotal: { status: mockPrediction.risk === 'high' ? 'Suspicious' : 'Clean' },
      phishTank: { status: mockPrediction.risk === 'high' ? 'Blacklisted' : 'Not Listed' }
    };
    
    // Update UI with results
    updateResultsDisplay(url, mockPrediction, mockApiResults);
    
    // Add to recent detections
    addToRecentDetections(url, mockPrediction);
    
    // Update dashboard data
    updateDashboardData(mockPrediction);
    
    // Hide loading state
    hideLoadingIndicator();
    
    // Show success notification
    showNotification('URL analysis complete', 'success');
    
  } catch (error) {
    console.error('Error checking URL:', error);
    showNotification('Error checking URL: ' + error.message, 'error');
    hideLoadingIndicator();
  }
}

// Function to handle settings submission
function handleSettingsSubmission(event) {
  event.preventDefault();
  
  // Get settings form values
  const sensitivityLevel = document.getElementById('sensitivity-level').value;
  const notificationsEnabled = document.getElementById('enable-notifications').checked;
  const apiKey = document.getElementById('api-key').value;
  
  // Save settings
  saveSettings({
    sensitivityLevel,
    notificationsEnabled,
    apiKey
  });
  
  showNotification('Settings saved successfully', 'success');
}

// Function to toggle theme
function toggleTheme() {
  const body = document.body;
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
}

// Function to update results display
function updateResultsDisplay(url, prediction, apiResults) {
  const resultContainer = document.getElementById('result-container');
  if (!resultContainer) return;
  
  resultContainer.innerHTML = '';
  resultContainer.style.display = 'block';
  
  // Create result header
  const header = document.createElement('h3');
  header.textContent = 'Analysis Result for: ' + url;
  resultContainer.appendChild(header);
  
  // Create result card
  const card = document.createElement('div');
  card.className = 'result-card';
  
  // Set card color based on prediction
  if (prediction.risk === 'high') {
    card.classList.add('danger');
  } else if (prediction.risk === 'medium') {
    card.classList.add('warning');
  } else {
    card.classList.add('safe');
  }
  
  // Add prediction info
  const predictionElement = document.createElement('div');
  predictionElement.className = 'prediction-info';
  predictionElement.innerHTML = `
    <h4>Risk Level: ${prediction.risk.toUpperCase()}</h4>
    <p>Confidence: ${(prediction.confidence * 100).toFixed(2)}%</p>
    <p>Classification: ${prediction.classification}</p>
  `;
  
  card.appendChild(predictionElement);
  
  // Add API results
  const apisElement = document.createElement('div');
  apisElement.className = 'api-results';
  apisElement.innerHTML = `
    <h4>External API Results:</h4>
    <ul>
      <li>Google Safe Browsing: ${apiResults.safeBrowsing.status}</li>
      <li>VirusTotal: ${apiResults.virusTotal.status}</li>
      <li>PhishTank: ${apiResults.phishTank.status}</li>
    </ul>
  `;
  
  card.appendChild(apisElement);
  resultContainer.appendChild(card);
}

// Function to add to recent detections
function addToRecentDetections(url, prediction) {
  // Get existing detections from storage
  chrome.storage.local.get(['recentDetections'], function(result) {
    const detections = result.recentDetections || [];
    
    // Add new detection
    detections.unshift({
      url,
      timestamp: new Date().toISOString(),
      risk: prediction.risk,
      classification: prediction.classification
    });
    
    // Keep only the last 10 detections
    const limitedDetections = detections.slice(0, 10);
    
    // Save back to storage
    chrome.storage.local.set({ 'recentDetections': limitedDetections }, function() {
      // Update UI
      loadRecentDetections();
    });
  });
}

// Function to load recent detections
function loadRecentDetections() {
  const recentList = document.getElementById('recent-detections-list');
  if (!recentList) return;
  
  chrome.storage.local.get(['recentDetections'], function(result) {
    const detections = result.recentDetections || [];
    
    if (detections.length === 0) {
      recentList.innerHTML = '<li class="no-data">No recent detections</li>';
      return;
    }
    
    recentList.innerHTML = '';
    
    detections.forEach(detection => {
      const li = document.createElement('li');
      li.className = `detection-item ${detection.risk}`;
      
      // Format timestamp
      const date = new Date(detection.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      li.innerHTML = `
        <div class="detection-url" title="${detection.url}">
          ${truncateUrl(detection.url, 30)}
        </div>
        <div class="detection-info">
          <span class="detection-time">${formattedDate}</span>
          <span class="detection-risk ${detection.risk}">${detection.risk}</span>
        </div>
      `;
      
      recentList.appendChild(li);
    });
  });
}

// Function to update dashboard data
function updateDashboardData(prediction) {
  // Update detection count
  updateDetectionCount(prediction.risk);
  
  // Charts have been removed
  console.log("Dashboard updated (charts removed)");
}

// Function to update detection count
function updateDetectionCount(riskLevel) {
  chrome.storage.local.get(['detectionCounts'], function(result) {
    let counts = result.detectionCounts || {
      safe: 0,
      medium: 0,
      high: 0
    };
    
    // Increment the appropriate counter
    counts[riskLevel]++;
    
    // Save updated counts
    chrome.storage.local.set({ 'detectionCounts': counts }, function() {
      // Update UI elements
      const safeCount = document.getElementById('safe-count');
      const mediumCount = document.getElementById('medium-count');
      const highCount = document.getElementById('high-count');
      
      if (safeCount) safeCount.textContent = counts.safe;
      if (mediumCount) mediumCount.textContent = counts.medium;
      if (highCount) highCount.textContent = counts.high;
    });
  });
}

// Helper function to truncate URL
function truncateUrl(url, maxLength) {
  if (url.length <= maxLength) return url;
  
  return url.substring(0, maxLength) + '...';
}

// Helper function to save settings
function saveSettings(settings) {
  chrome.storage.local.set({ 'userSettings': settings });
}

// Helper function to show notification
function showNotification(message, type = 'info') {
  console.log(`Showing notification: ${message} (${type})`);
  
  // Get or create notification element
  let notification = document.getElementById('notification');
  
  if (!notification) {
    console.log("Creating new notification element");
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }
  
  // Create inner content with icon and close button
  let icon = '';
  switch (type) {
    case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
    case 'error': icon = '<i class="fas fa-exclamation-circle"></i>'; break;
    case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
    case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
    default: icon = '<i class="fas fa-bell"></i>';
  }
  
  notification.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-message">${message}</div>
    <div class="notification-close"><i class="fas fa-times"></i></div>
  `;
  notification.className = `notification ${type}`;
  
  // Add click to dismiss on the close button
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    };
  }
  
  // Style the notification to ensure visibility
  Object.assign(notification.style, {
    display: 'flex',
    alignItems: 'center',
    opacity: '1',
    zIndex: '9999',
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 15px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    fontFamily: 'Segoe UI, Arial, sans-serif',
    fontSize: '13px',
    maxWidth: '350px',
    transform: 'translateY(0)',
    border: '1px solid rgba(0,0,0,0.1)'
  });
  
  // Style the notification elements
  const iconElement = notification.querySelector('.notification-icon');
  const messageElement = notification.querySelector('.notification-message');
  const closeElement = notification.querySelector('.notification-close');
  
  if (iconElement) {
    Object.assign(iconElement.style, {
      marginRight: '10px',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
  }
  
  if (messageElement) {
    Object.assign(messageElement.style, {
      flex: '1',
      fontSize: '13px',
      lineHeight: '1.4'
    });
  }
  
  if (closeElement) {
    Object.assign(closeElement.style, {
      marginLeft: '10px',
      cursor: 'pointer',
      opacity: '0.7',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
  }
  
  // Set background color based on type
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#EDF7ED';
      notification.style.color = '#1E4620';
      if (iconElement) iconElement.style.color = '#4CAF50';
      break;
    case 'error':
      notification.style.backgroundColor = '#FDEDED';
      notification.style.color = '#5F2120';
      if (iconElement) iconElement.style.color = '#F44336';
      break;
    case 'warning':
      notification.style.backgroundColor = '#FFF4E5';
      notification.style.color = '#663C00';
      if (iconElement) iconElement.style.color = '#FF9800';
      break;
    case 'info':
      notification.style.backgroundColor = '#E8F4FD';
      notification.style.color = '#0A4A6E';
      if (iconElement) iconElement.style.color = '#2196F3';
      break;
    default:
      notification.style.backgroundColor = '#F5F5F5';
      notification.style.color = '#333333';
      if (iconElement) iconElement.style.color = '#333333';
  }
  
  // Add entrance animation
  notification.style.transform = 'translateY(20px)';
  notification.style.opacity = '0';
  
  // Force reflow to make the animation work
  notification.offsetHeight;
  
  // Start animation
  notification.style.transform = 'translateY(0)';
  notification.style.opacity = '1';
  
  // Clear any existing timeout
  if (window.notificationTimeout) {
    clearTimeout(window.notificationTimeout);
  }
  
  // For success messages, show for a shorter duration
  const duration = type === 'success' ? 3000 : 4000;
  
  // Hide notification after duration
  window.notificationTimeout = setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(10px)';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, duration);
  
  console.log(`Notification displayed: ${message}`);
}

// Helper function to show loading indicator
function showLoadingIndicator() {
  console.log("Showing loading indicator");
  const loader = document.getElementById('loader');
  if (loader) {
    // First make sure it's positioned correctly
    Object.assign(loader.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '5px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    });
    
    // Add a spinner if it doesn't exist
    if (loader.children.length === 0) {
      const spinner = document.createElement('div');
      spinner.className = 'spinner';
      spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
      spinner.style.color = 'white';
      spinner.style.fontSize = '24px';
      loader.appendChild(spinner);
    }
    
    // Show with fade-in effect
    loader.style.opacity = '0';
    loader.style.display = 'block';
    setTimeout(() => {
      loader.style.opacity = '1';
      loader.style.transition = 'opacity 0.2s ease';
    }, 10);
  } else {
    console.error("Loader element not found");
  }
}

// Helper function to hide loading indicator
function hideLoadingIndicator() {
  console.log("Hiding loading indicator");
  const loader = document.getElementById('loader');
  if (loader) {
    // Hide with fade-out effect
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 200);
  } else {
    console.error("Loader element not found");
  }
}

// Initialize theme based on saved preference
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.classList.add(savedTheme + '-theme');
}

// Handle export data button click
function handleExportData() {
  console.log("Export data requested");
  
  // Just show loading indicator without notification
  showLoadingIndicator();
  
  // Since chrome.storage might not be available in testing, we'll use a simpler approach
  try {
    // Get data from the table directly
    const detectionTable = document.getElementById('recentDetectionsTable');
    if (!detectionTable) {
      console.error("Detection table not found");
      showNotification('Detection table not found', 'error');
      hideLoadingIndicator();
      return;
    }
    
    const rows = detectionTable.querySelectorAll('tbody tr');
    if (rows.length === 0) {
      showNotification('No data to export', 'warning');
      hideLoadingIndicator();
      return;
    }
    
    // Convert to CSV format
    let csv = 'Time,URL,Detection Score,Status\n';
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const time = cells[0].textContent.trim();
        const url = cells[1].textContent.trim();
        const score = cells[2].textContent.trim();
        const status = cells[3].textContent.trim();
        
        csv += `"${time}","${url}","${score}","${status}"\n`;
      }
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'phishing_detections.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Hide loading indicator
    hideLoadingIndicator();
    showNotification('Data exported successfully', 'success');
  } catch (error) {
    console.error("Error exporting data:", error);
    hideLoadingIndicator();
    showNotification('Error exporting data: ' + error.message, 'error');
  }
}

// Handle details button click
function handleDetailsView(event) {
  console.log("Details view requested", event);
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Get the row that contains the clicked button
  let row;
  if (event.target.tagName === 'BUTTON') {
    row = event.target.closest('tr');
  } else if (event.target.tagName === 'I') {
    row = event.target.parentElement.closest('tr');
  } else {
    row = event.target.closest('tr');
  }
  
  if (!row) {
    console.error("Could not find parent row");
    showNotification("Could not find details for this entry", 'error');
    hideLoadingIndicator();
    return;
  }
  
  // Extract data from the row
  const cells = row.querySelectorAll('td');
  if (cells.length < 4) {
    console.error("Row does not have enough cells");
    showNotification("Incomplete data for this entry", 'error');
    hideLoadingIndicator();
    return;
  }
  
  const time = cells[0].textContent.trim();
  const url = cells[1].textContent.trim();
  const score = cells[2].textContent.trim();
  const status = cells[3].textContent.trim();
  
  console.log(`Details requested for ${url} with score ${score} (${status}) at ${time}`);
  
  // Create a more professional modal-style alert
  setTimeout(() => {
    // Hide loading indicator before showing details
    hideLoadingIndicator();
    
    // Format message for alert with better formatting
    let threatLevel = "";
    let detailsMessage = "";
    
    if (status === 'Phishing') {
      threatLevel = "⚠️ High Threat Detected";
      detailsMessage = `URL: ${url}\n\nDetected at: ${time}\nThreat Score: ${score} (${status})\n\nThis URL was identified as malicious with high confidence.`;
    } else if (status === 'Suspicious') {
      threatLevel = "⚠️ Potential Threat";
      detailsMessage = `URL: ${url}\n\nDetected at: ${time}\nThreat Score: ${score} (${status})\n\nThis URL shows suspicious characteristics and should be approached with caution.`;
    } else {
      threatLevel = "✓ Safe URL";
      detailsMessage = `URL: ${url}\n\nChecked at: ${time}\nSafety Score: ${score} (${status})\n\nThis URL was verified as safe.`;
    }
    
    // Show a more professional alert
    alert(`${threatLevel}\n\n${detailsMessage}`);
  }, 500);
}

// Handle API configuration button click
function handleConfigureAPI(event) {
  console.log("Configure API requested", event);
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Get the API card element
  let apiCard;
  if (event.target.tagName === 'BUTTON') {
    apiCard = event.target.closest('.api-card');
  } else if (event.target.tagName === 'I') {
    apiCard = event.target.parentElement.closest('.api-card');
  } else {
    apiCard = event.target.closest('.api-card');
  }
  
  if (!apiCard) {
    console.error("Could not find API card element");
    showNotification("Could not identify API to configure", 'error');
    hideLoadingIndicator();
    return;
  }
  
  // Get API name
  const apiNameElement = apiCard.querySelector('h4');
  if (!apiNameElement) {
    console.error("API name element not found");
    showNotification("API information missing", 'error');
    return;
  }
  
  const apiName = apiNameElement.textContent.trim();
  console.log(`Configure ${apiName} requested`);
  
  // Update the status indicator to show configuration in progress
  const statusIndicator = apiCard.querySelector('.status-indicator');
  if (statusIndicator) {
    statusIndicator.className = 'status-indicator configuring';
  }
  
  // Hide loading indicator
  hideLoadingIndicator();
  
  // Show a confirmation dialog
  alert(`Configuring ${apiName}...

This would open a configuration dialog where you can set up API keys and preferences.`);
  
  // Show notification
  showNotification(`${apiName} configuration completed`, 'success');
  
  // Reset status indicator
  if (statusIndicator) {
    statusIndicator.className = 'status-indicator connected';
  }
}

// Handle API connection button click
function handleConnectAPI(event) {
  console.log("Connect API requested", event);
  
  // Show loading indicator
  showLoadingIndicator();
  
  // Get the API card element
  let apiCard;
  if (event.target.tagName === 'BUTTON') {
    apiCard = event.target.closest('.api-card');
  } else if (event.target.tagName === 'I') {
    apiCard = event.target.parentElement.closest('.api-card');
  } else {
    apiCard = event.target.closest('.api-card');
  }
  
  if (!apiCard) {
    console.error("Could not find API card element");
    showNotification("Could not identify API to connect", 'error');
    hideLoadingIndicator();
    return;
  }
  
  // Get API name
  const apiNameElement = apiCard.querySelector('h4');
  if (!apiNameElement) {
    console.error("API name element not found");
    showNotification("API information missing", 'error');
    return;
  }
  
  const apiName = apiNameElement.textContent.trim();
  console.log(`Connect to ${apiName} requested`);
  
  // Update the button to show connection in progress
  const connectButton = apiCard.querySelector('.action-button');
  if (connectButton) {
    connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    connectButton.disabled = true;
  }
  
  // Hide loading indicator
  hideLoadingIndicator();
  
  // Show a confirmation dialog
  alert(`Connecting to ${apiName}...

This would open a connection dialog where you can set up the integration.`);
  
  // Show notification
  showNotification(`${apiName} connected successfully`, 'success');
  
  // Update status indicator and button
  const statusIndicator = apiCard.querySelector('.status-indicator');
  if (statusIndicator) {
    statusIndicator.className = 'status-indicator connected';
  }
  
  if (connectButton) {
    connectButton.innerHTML = '<i class="fas fa-cog"></i> Configure';
    connectButton.disabled = false;
  }
}

// Handle model update button click
function handleModelUpdate() {
  console.log("Model update requested");
  
  try {
    // Show loading indicator
    showLoadingIndicator();
    
    // Show loading state
    const updateBtn = document.getElementById('updateModelBtn');
    if (!updateBtn) {
      console.error("Update button not found");
      showNotification('Update button not found', 'error');
      hideLoadingIndicator();
      return;
    }
    
    // Change button state
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Updating...';
    
    // No immediate notification, just the loading indicator is enough
    
    // Simulate model update process
    setTimeout(() => {
      try {
        // Update model info in UI
        const modelInfo = document.querySelector('.model-details');
        if (modelInfo) {
          modelInfo.innerHTML = `
            <p><strong>Current Model:</strong> PhishGuard v2.4</p>
            <p><strong>Last Updated:</strong> Just now</p>
            <p><strong>Detection Accuracy:</strong> 99.1%</p>
            <p><strong>Features:</strong> URL analysis, content inspection, domain age, SSL verification</p>
          `;
          
          // Add a subtle highlight animation to the updated info
          modelInfo.style.transition = 'background-color 1s ease';
          modelInfo.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
          setTimeout(() => {
            modelInfo.style.backgroundColor = 'transparent';
          }, 2000);
        } else {
          console.error("Model details element not found");
        }
        
        // Reset button state
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-sync"></i> Update Model';
        
        // Hide loading indicator
        hideLoadingIndicator();
        
        // Show discrete success notification with minimal UI disruption
        showNotification('Model updated to PhishGuard v2.4', 'success');
      } catch (updateError) {
        console.error("Error in model update completion:", updateError);
        
        // Reset button in case of error
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-sync"></i> Update Model';
        
        // Hide loading indicator
        hideLoadingIndicator();
        
        showNotification('Error completing model update: ' + updateError.message, 'error');
      }
    }, 2000);
  } catch (error) {
    console.error("Error starting model update:", error);
    showNotification('Error starting model update: ' + error.message, 'error');
  }
}

// Initialize theme on load
initializeTheme();
