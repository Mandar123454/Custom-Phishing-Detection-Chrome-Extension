# Advanced Phishing Detection Chrome Extension

A Chrome extension that uses machine learning, API integration, and advanced heuristics to detect and alert users about potential phishing websites.

![Extension](./Screenshots/Extension.png)

## Features

### Core Detection Features
- **URL Analysis**: Examines domain names, subdomains, TLDs, and URL patterns for suspicious characteristics
- **Content Analysis**: Scans page content for suspicious forms, input fields, and text patterns
- **SSL Certificate Verification**: Checks for secure connections and certificate validity
- **Machine Learning Model**: Uses TensorFlow.js to provide intelligent phishing detection
- **External API Integration**: Connects to security services for enhanced detection
- **Real-time Protection**: Automatically scans pages as you browse
- **Domain Whitelist**: Allows you to mark trusted websites to avoid false positives

### Machine Learning Features
- In-browser ML model using TensorFlow.js
- Feature extraction from URLs and page content
- Explainable AI results with confidence scores
- Model versioning and updates (current: PhishGuard v2.4)

### API Integrations
- Google Safe Browsing API
- VirusTotal API
- PhishTank API

### User Interface
- Clean, intuitive popup interface
- Comprehensive dashboard with statistics and recent scans
- Detailed scan results with risk indicators
- Dark mode support
- Customizable settings

## How It Works

This extension analyzes websites for potential phishing attempts through a multi-layered approach:

### 1. Initial URL Analysis
When a user visits a website, the extension immediately analyzes the URL structure for:
   - Suspicious TLDs (e.g., unusual country codes often used in phishing)
   - Domain age verification (newer domains warrant higher scrutiny)
   - Misspellings of popular domains (typosquatting detection)
   - Presence of IP addresses instead of domain names
   - Excessive subdomain usage
   - URL length and entropy assessment

### 2. Content and DOM Analysis
Once the page loads, the extension examines:
   - Login form detection and destination analysis
   - Password field identification and context
   - Presence of suspicious keywords and phrases
   - Analysis of external resource loading patterns
   - Image and favicon comparison with known brands

### 3. Machine Learning Classification
The extracted features are processed through:
   - Feature normalization and preparation
   - TensorFlow.js model inference
   - Confidence score calculation
   - Decision threshold application

### 4. API Verification
For uncertain cases, external APIs provide additional context:
   - Google Safe Browsing API check
   - VirusTotal reputation lookup
   - PhishTank database comparison

### 5. Result Presentation
Results are presented to the user through:
   - Color-coded risk indicators
   - Detailed explanation of detection reasons
   - Confidence score transparency
   - Recommended actions

## Installation Instructions

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now appear in your Chrome toolbar

## Usage

### Basic Usage
1. The extension automatically scans websites as you browse
2. A color-coded icon indicates the safety status of the current site
3. Click on the extension icon to view detailed analysis

### Dashboard Access
1. Click on the extension icon
2. Select "Open Dashboard" from the popup menu
3. Explore comprehensive statistics and detection history

### Customization
1. Access Settings from the dashboard
2. Adjust detection sensitivity
3. Configure API connections
4. Manage whitelist entries

## Dashboard Features

![Dashboard](./Screenshots/Dashboard%201.png)

The extension includes a comprehensive dashboard that offers:

### Statistical Overview
- Detection counts by category (safe, suspicious, phishing)
- Protection rate calculation and visualization
- Timeline trends of detected threats

### Recent Detections Table
- Chronological list of scanned URLs
- Detection scores and status indicators
- Detailed view options for each entry
- Export functionality for further analysis

### Model Management
- Current model information display
- One-click update mechanism
- Performance metrics tracking

### API Configuration
- Connection status indicators
- Easy configuration interfaces
- Testing capabilities

## Screenshots

### Popup Interface
![Pop up](./Screenshots/Pop%20up.png)

### Dashboard Views
![Dashboard 2](./Screenshots/Dashboard%202.png)

### Detection Examples
![Example 1](./Screenshots/Example%201.png)

### Recent Scan History
![Recent Scan](./Screenshots/Recent%20Scan%20in%20Pop%20up.png)

## Documentation

For comprehensive documentation, please see:
- [Technical Documentation](./docs.md) - Detailed analysis of components and features
- [Technical Report](./report.md) - Project overview, methodology, and results

## Development

### Prerequisites
- Chrome Browser (v88+)
- Basic understanding of JavaScript, HTML, and CSS
- Knowledge of Chrome Extension API

### Project Structure
```
├── background.js         # Background service worker
├── content.js            # Content script for page analysis
├── dashboard.html        # Dashboard interface
├── dashboard.js          # Dashboard functionality
├── dashboard.css         # Dashboard styling
├── feature_extractor.js  # Feature extraction for ML model
├── ml_model.js           # Machine learning model integration
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── api_integration.js    # External API communication
├── whitelist_manager.js  # Whitelist functionality
├── manifest.json         # Extension configuration
└── images/               # Icons and images
```

### Extending the Extension
1. Update manifest.json for any permission changes
2. Modify the detection rules in background.js
3. Enhance content analysis in content.js
4. Update the UI in popup.html and popup.css
5. Test thoroughly on various websites

## License

This project is available under the MIT License. See LICENSE file for details.

## Disclaimer

This extension is for educational purposes only. While it attempts to detect phishing websites, it cannot guarantee 100% accuracy. Always exercise caution when entering sensitive information online.

## Contributors

- Mandar Kajbaje

## Recent Updates

### Version 2.4
- Improved ML model with 99.1% accuracy
- Enhanced UI with better notifications
- Fixed button functionality issues
- Optimized loading indicators
- Refined dashboard presentation
- Added dark mode support to the dashboard
- Automatically detects system preferences for theme
- Allows manual toggling between light/dark mode
- Theme preferences are saved in local storage

### ES Module Support
- Converted core components to use ES modules
- Updated import/export statements for better code organization
- Improved ML model integration with feature extraction
- Added proper API service integration

### Testing
- Added test scripts for extension functionality
- Created test samples for phishing detection validation
- Implemented dark mode testing utilities
