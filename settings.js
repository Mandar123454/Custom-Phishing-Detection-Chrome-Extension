document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const saveSettingsButton = document.getElementById('saveSettings');
  const resetSettingsButton = document.getElementById('resetSettings');
  const clearHistoryButton = document.getElementById('clearHistory');
  const resetWhitelistButton = document.getElementById('resetWhitelist');
  const addDomainButton = document.getElementById('addDomain');
  const newDomainInput = document.getElementById('newDomain');
  const whitelistContainer = document.getElementById('whitelistContainer');
  const statusMessage = document.getElementById('statusMessage');
  
  // Settings sliders with value display
  const sensitivitySlider = document.getElementById('sensitivityLevel');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const riskThresholdSlider = document.getElementById('riskThreshold');
  const riskThresholdValue = document.getElementById('riskThresholdValue');
  
  // Update slider value displays
  sensitivitySlider.addEventListener('input', function() {
    sensitivityValue.textContent = this.value;
  });
  
  riskThresholdSlider.addEventListener('input', function() {
    riskThresholdValue.textContent = this.value;
  });
  
  // Default settings
  const defaultSettings = {
    enableExtension: true,
    showNotifications: true,
    blockHighRiskSites: false,
    scanOnLoad: true,
    sensitivityLevel: 7,
    riskThreshold: 40,
    checkDomain: true,
    checkUrl: true,
    checkContent: true,
    checkForms: true,
    checkSSL: true,
    useEnhancedDetection: true,
    saveHistory: true,
    historyLimit: 20
  };
  
  // Default API configuration
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
  
  // Load settings
  loadSettings();
  loadWhitelist();
  
  // Save settings button click handler
  saveSettingsButton.addEventListener('click', function() {
    saveSettings();
    showStatus('Settings saved successfully!', 'success');
  });
  
  // Reset settings button click handler
  resetSettingsButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      resetSettings();
      showStatus('Settings reset to defaults', 'success');
    }
  });
  
  // Clear history button click handler
  clearHistoryButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all scan history?')) {
      clearHistory();
      showStatus('Scan history cleared', 'success');
    }
  });
  
  // Reset whitelist button click handler
  resetWhitelistButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the whitelist to default domains?')) {
      resetWhitelist();
      showStatus('Whitelist reset to defaults', 'success');
    }
  });
  
  // Add domain button click handler
  addDomainButton.addEventListener('click', function() {
    addDomainToWhitelist();
  });
  
  // Enter key in domain input
  newDomainInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addDomainToWhitelist();
    }
  });
  
  // Load settings from storage
  function loadSettings() {
    // Load general settings
    chrome.storage.sync.get('settings', function(data) {
      const settings = data.settings || defaultSettings;
      
      // Apply settings to form elements
      document.getElementById('enableExtension').checked = settings.enableExtension;
      document.getElementById('showNotifications').checked = settings.showNotifications;
      document.getElementById('blockHighRiskSites').checked = settings.blockHighRiskSites;
      document.getElementById('scanOnLoad').checked = settings.scanOnLoad;
      document.getElementById('sensitivityLevel').value = settings.sensitivityLevel;
      sensitivityValue.textContent = settings.sensitivityLevel;
      document.getElementById('riskThreshold').value = settings.riskThreshold;
      riskThresholdValue.textContent = settings.riskThreshold;
      document.getElementById('checkDomain').checked = settings.checkDomain;
      document.getElementById('checkUrl').checked = settings.checkUrl;
      document.getElementById('checkContent').checked = settings.checkContent;
      document.getElementById('checkForms').checked = settings.checkForms;
      document.getElementById('checkSSL').checked = settings.checkSSL;
      document.getElementById('useEnhancedDetection').checked = settings.useEnhancedDetection !== false; // Default to true
      document.getElementById('saveHistory').checked = settings.saveHistory;
      document.getElementById('historyLimit').value = settings.historyLimit;
    });
    
    // Load API configuration
    chrome.storage.sync.get('apiConfig', function(data) {
      const apiConfig = data.apiConfig || defaultApiConfig;
      
      // Google Safe Browsing
      document.getElementById('enableGoogleSafeBrowsing').checked = apiConfig.googleSafeBrowsing.enabled;
      document.getElementById('googleSafeBrowsingKey').value = apiConfig.googleSafeBrowsing.apiKey;
      
      // VirusTotal
      document.getElementById('enableVirusTotal').checked = apiConfig.virusTotal.enabled;
      document.getElementById('virusTotalKey').value = apiConfig.virusTotal.apiKey;
      
      // PhishTank
      document.getElementById('enablePhishTank').checked = apiConfig.phishTank.enabled;
      document.getElementById('phishTankKey').value = apiConfig.phishTank.apiKey;
    });
  }
  
  // Save settings to storage
  function saveSettings() {
    // Save general settings
    const settings = {
      enableExtension: document.getElementById('enableExtension').checked,
      showNotifications: document.getElementById('showNotifications').checked,
      blockHighRiskSites: document.getElementById('blockHighRiskSites').checked,
      scanOnLoad: document.getElementById('scanOnLoad').checked,
      sensitivityLevel: parseInt(document.getElementById('sensitivityLevel').value),
      riskThreshold: parseInt(document.getElementById('riskThreshold').value),
      checkDomain: document.getElementById('checkDomain').checked,
      checkUrl: document.getElementById('checkUrl').checked,
      checkContent: document.getElementById('checkContent').checked,
      checkForms: document.getElementById('checkForms').checked,
      checkSSL: document.getElementById('checkSSL').checked,
      useEnhancedDetection: document.getElementById('useEnhancedDetection').checked,
      saveHistory: document.getElementById('saveHistory').checked,
      historyLimit: parseInt(document.getElementById('historyLimit').value)
    };
    
    chrome.storage.sync.set({ settings: settings });
    
    // Save API configuration
    const apiConfig = {
      googleSafeBrowsing: {
        enabled: document.getElementById('enableGoogleSafeBrowsing').checked,
        apiKey: document.getElementById('googleSafeBrowsingKey').value.trim()
      },
      virusTotal: {
        enabled: document.getElementById('enableVirusTotal').checked,
        apiKey: document.getElementById('virusTotalKey').value.trim()
      },
      phishTank: {
        enabled: document.getElementById('enablePhishTank').checked,
        apiKey: document.getElementById('phishTankKey').value.trim()
      }
    };
    
    chrome.storage.sync.set({ apiConfig: apiConfig });
    
    // Send message to background script to update configuration
    chrome.runtime.sendMessage({
      action: 'updateDetectionConfig',
      config: {
        useMachineLearning: settings.useEnhancedDetection,
        useAPIs: apiConfig.googleSafeBrowsing.enabled || 
                apiConfig.virusTotal.enabled || 
                apiConfig.phishTank.enabled,
        useHeuristics: true,
        apiConfig: apiConfig
      }
    });
  }
  
  // Reset settings to defaults
  function resetSettings() {
    chrome.storage.sync.set({ 
      settings: defaultSettings,
      apiConfig: defaultApiConfig
    }, function() {
      loadSettings();
    });
  }
  
  // Clear scan history
  function clearHistory() {
    chrome.storage.local.set({ scanHistory: [] });
  }
  
  // Load whitelist domains
  function loadWhitelist() {
    chrome.storage.local.get('trustedDomains', function(data) {
      const whitelist = data.trustedDomains || [];
      
      // Clear current whitelist
      whitelistContainer.innerHTML = '';
      
      // Add each domain to the UI
      whitelist.forEach(function(domain) {
        addWhitelistItemToUI(domain);
      });
    });
  }
  
  // Add whitelist item to UI
  function addWhitelistItemToUI(domain) {
    const item = document.createElement('div');
    item.className = 'whitelist-item';
    
    const domainSpan = document.createElement('span');
    domainSpan.textContent = domain;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'whitelist-actions';
    
    const removeButton = document.createElement('button');
    removeButton.className = 'danger';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
      removeFromWhitelist(domain);
    });
    
    actionsDiv.appendChild(removeButton);
    item.appendChild(domainSpan);
    item.appendChild(actionsDiv);
    whitelistContainer.appendChild(item);
  }
  
  // Add domain to whitelist
  function addDomainToWhitelist() {
    const domain = newDomainInput.value.trim();
    
    if (!domain) {
      showStatus('Please enter a domain', 'error');
      return;
    }
    
    // Simple domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      showStatus('Please enter a valid domain (e.g., example.com)', 'error');
      return;
    }
    
    chrome.storage.local.get('trustedDomains', function(data) {
      let whitelist = data.trustedDomains || [];
      
      if (whitelist.includes(domain)) {
        showStatus(`${domain} is already in the whitelist`, 'error');
        return;
      }
      
      whitelist.push(domain);
      chrome.storage.local.set({ trustedDomains: whitelist }, function() {
        addWhitelistItemToUI(domain);
        newDomainInput.value = '';
        showStatus(`${domain} added to whitelist`, 'success');
      });
    });
  }
  
  // Remove domain from whitelist
  function removeFromWhitelist(domain) {
    chrome.storage.local.get('trustedDomains', function(data) {
      let whitelist = data.trustedDomains || [];
      
      const index = whitelist.indexOf(domain);
      if (index !== -1) {
        whitelist.splice(index, 1);
        chrome.storage.local.set({ trustedDomains: whitelist }, function() {
          loadWhitelist();
          showStatus(`${domain} removed from whitelist`, 'success');
        });
      }
    });
  }
  
  // Reset whitelist to defaults
  function resetWhitelist() {
    const defaultWhitelist = [
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
    
    chrome.storage.local.set({ trustedDomains: defaultWhitelist }, function() {
      loadWhitelist();
    });
  }
  
  // Show status message
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    
    setTimeout(function() {
      statusMessage.className = 'status';
    }, 3000);
  }
});
