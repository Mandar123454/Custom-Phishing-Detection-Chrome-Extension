# Custom Phishing Detection Chrome Extension: Technical Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [UI Components](#ui-components)
5. [Machine Learning Model](#machine-learning-model)
6. [API Integrations](#api-integrations)
7. [Dashboard Analysis](#dashboard-analysis)
8. [Security Considerations](#security-considerations)
9. [Performance Optimization](#performance-optimization)
10. [Screenshots Analysis](#screenshots-analysis)

## Introduction

The Custom Phishing Detection Chrome Extension is an advanced security tool that uses multiple detection techniques, including machine learning, heuristic analysis, and API integrations, to identify potential phishing websites and protect users while browsing. This documentation provides a comprehensive analysis of the extension's architecture, components, and functionality.

## Architecture Overview

The extension follows a modular architecture with the following main components:

1. **Background Service Worker**: Runs continuously to monitor browser activity
2. **Content Script**: Analyzes webpage content and DOM structure
3. **Machine Learning Model**: Processes extracted features to generate phishing scores
4. **API Integration Layer**: Communicates with external security services
5. **User Interface**: Popup interface and comprehensive dashboard

The extension uses Chrome's Extension API to interact with browser functions while maintaining a separation of concerns between different components.

## Core Components

### Background Service Worker (`background.js`)

The background script serves as the central coordinator of the extension, handling:
- URL monitoring through the `chrome.tabs.onUpdated` event
- Communication with content scripts via `chrome.runtime.sendMessage`
- Storage management through `chrome.storage.local`
- API request coordination
- Browser notification management

### Content Script (`content.js`)

The content script is injected into each webpage to analyze its content:
- DOM scanning for login forms and sensitive input fields
- Text extraction for keyword analysis
- Meta tag inspection
- URL pattern matching
- Feature extraction for ML model input

### Feature Extraction (`feature_extractor.js`)

This component extracts relevant features from URLs and page content:
- URL length, subdomain count, TLD analysis
- Special character frequency
- Presence of IP addresses
- SSL certificate validation
- Form submission target analysis
- External resource loading patterns

### Machine Learning Integration (`ml_model.js`)

Handles the loading, execution, and interpretation of the TensorFlow.js model:
- Model loading and initialization
- Feature normalization
- Prediction generation
- Confidence score calculation
- Model versioning and updates

## UI Components

### Popup Interface (`popup.html`, `popup.js`, `popup.css`)

The popup interface provides immediate feedback when a user clicks on the extension icon:
- Safety score display
- Risk indicators with color-coding
- Quick actions (whitelist, report false positive)
- Recent scan history
- Links to the full dashboard

### Dashboard (`dashboard.html`, `dashboard.js`, `dashboard.css`)

The dashboard offers comprehensive analytics and management tools:
- Historical data visualization
- Detection statistics
- Detailed scan reports
- API configuration
- Model updating
- Export capabilities

## Machine Learning Model

The extension uses a supervised learning model trained on a dataset of known phishing and legitimate URLs:

- **Model Type**: Binary classification
- **Framework**: TensorFlow.js
- **Features**: 28 numerical features extracted from URLs and content
- **Accuracy**: ~98.2% (PhishGuard v2.3) to 99.1% (PhishGuard v2.4)
- **Model Size**: Optimized for in-browser execution (~1.2MB)

The model provides not only classification results but also confidence scores that help users understand the reliability of predictions.

## API Integrations

The extension integrates with multiple external APIs to enhance detection capabilities:

### Google Safe Browsing API
- Checks URLs against Google's database of known unsafe sites
- Provides binary classification (safe/unsafe)
- Requires API key configuration

### VirusTotal API
- Offers comprehensive URL and domain reputation data
- Returns multiple security vendors' verdicts
- Has rate limits that require careful request management

### PhishTank API
- Community-driven phishing URL database
- Provides verified phishing reports
- Open source integration options

## Dashboard Analysis

The dashboard serves as the command center for the extension, offering detailed insights into browsing protection:

### Statistical Overview
- Detection counts by category (safe, suspicious, phishing)
- Protection rate calculation
- Timeline visualization of detection events

### Recent Detections Table
- Chronological list of scanned URLs
- Detection scores and status
- Detailed view options for each entry
- Export functionality for further analysis

### Model Management
- Current model information display
- Update mechanism for new model versions
- Performance metrics tracking

### API Configuration
- Connection status indicators
- Configuration interfaces for API keys
- Testing capabilities

## Security Considerations

The extension implements several security measures to protect user data:

1. **Local Processing**: Prioritizes local processing of sensitive data when possible
2. **API Security**: Uses secure HTTPS for all API communications
3. **Data Minimization**: Only sends necessary information to external services
4. **Permission Control**: Requests only required permissions in manifest.json
5. **Update Verification**: Validates model updates before installation

## Performance Optimization

To ensure minimal impact on browsing experience:

1. **Lazy Loading**: Defers loading of non-critical components
2. **Incremental Processing**: Analyzes page content incrementally
3. **Caching**: Stores recent results to avoid redundant processing
4. **Efficient DOM Traversal**: Uses optimized selectors and traversal methods
5. **Background Processing**: Performs intensive operations in the background script

## Screenshots Analysis

### Dashboard Overview

![Dashboard 1](./Screenshots/Dashboard%201.png)

The main dashboard provides a comprehensive overview of the extension's protection activities:

1. **Header Section**: Features the extension name and logo, along with time range selector
2. **Stats Cards**: Display key metrics including:
   - Safe sites count
   - Suspicious sites count
   - Phishing sites count
   - Overall protection rate
3. **Detection Summary**: Visual representation of score distribution across all detections
4. **Recent Detections Table**: Chronological listing of recently analyzed URLs with:
   - Timestamp
   - URL
   - Detection score
   - Status indicator (color-coded)
   - Action buttons for detailed analysis

The dashboard uses a dark theme by default for reduced eye strain during extended use.

![Dashboard 2](./Screenshots/Dashboard%202.png)

The second dashboard view showcases:

1. **API Integration Panel**: Shows the status of connected security APIs
2. **Model Information**: Displays current ML model details including:
   - Version information
   - Last update timestamp
   - Detection accuracy statistics
   - Feature set description
3. **Update Model Button**: Allows users to check for and install model updates

The interface uses intuitive icons and clear status indicators to convey information efficiently.

![Dashboard 3](./Screenshots/Dashboard%203.png)

The expanded dashboard view demonstrates:

1. **Additional Analysis Tools**: Extended options for URL investigation
2. **Configuration Panel**: Interface for customizing detection sensitivity
3. **Historical Data**: Longer-term trends in detection activities

### Extension Popup

![Extension](./Screenshots/Extension.png)

The extension popup provides immediate feedback when clicked:

1. **Header**: Extension name and icon
2. **Primary Detection Result**: Clear status indicator for the current site
3. **URL Information**: The URL being analyzed
4. **Score Display**: Numerical representation of the detection confidence
5. **Status Indicator**: Text status with appropriate color-coding
6. **Alert Description**: Brief explanation of the detection result

The popup is designed for quick assessment, with more detailed options available through the dashboard.

![Pop up](./Screenshots/Pop%20up.png)

The standard popup view shows:

1. **Risk Assessment**: Color-coded risk level indication
2. **Specific Details**: Information about the detected threat
3. **Time Information**: When the detection occurred
4. **Action Buttons**: Options for user response

![Recent Scan in Pop up](./Screenshots/Recent%20Scan%20in%20Pop%20up.png)

The recent scan popup displays:

1. **Scan History**: List of recently analyzed URLs
2. **Status Indicators**: Color-coded status for each entry
3. **Timestamp**: When each URL was analyzed
4. **Quick Navigation**: Ability to revisit analysis details

### Detection Examples

![Example 1](./Screenshots/Example%201.png)

This screenshot demonstrates a high-confidence phishing detection:

1. **Warning Notification**: Prominent alert indicating danger
2. **URL Analysis**: Highlighting of suspicious URL components
3. **Confidence Score**: High detection confidence (0.96)
4. **Status**: Clear "Phishing" classification
5. **Context**: Additional information about the detection

![Example 2](./Screenshots/Example%202.png)

Example of a model update notification:

1. **Success Message**: Confirmation of successful update
2. **Version Information**: New model version (PhishGuard v2.4)
3. **Accuracy Improvement**: Updated detection accuracy (99.1%)

![Example 3](./Screenshots/Example%203.png)

Another detection example showing:

1. **Different Threat Type**: Alternate detection scenario
2. **Score Variation**: Different confidence level
3. **Specific Indicators**: Unique warning elements

### Time Range Selection

![Time Range](./Screenshots/Time%20Range.png)

The time range selector interface allows users to:

1. **Filter Data**: View detection statistics for different time periods
2. **Options Include**:
   - Last 24 Hours
   - Last 7 Days
   - Last 30 Days
   - Last Year
3. **Dynamic Updates**: Dashboard visualizations adjust based on selected time range

This feature enables both recent monitoring and long-term trend analysis.
