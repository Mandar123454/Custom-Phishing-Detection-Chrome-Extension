// Test script for the Phishing Detection Extension
console.log('Testing extension functionality...');

// Test the ML model
import { PhishingDetectionModel } from './ml_model.js';
import { FeatureExtractor } from './feature_extractor.js';
import { ApiService } from './api_integration.js';

// Test initialization
function runTests() {
  console.log('Running tests...');
  
  // Test Feature Extractor
  try {
    const featureExtractor = new FeatureExtractor();
    console.log('Feature extractor initialized successfully');
    
    // Test URL feature extraction
    const features = featureExtractor.extractUrlFeatures('http://suspicious-looking-site.com/login/secure');
    console.log('URL Features extracted:', features);
  } catch(e) {
    console.error('Feature extractor test failed:', e);
  }
  
  // Test ML Model
  try {
    const model = new PhishingDetectionModel();
    console.log('ML model initialized successfully');
    console.log('Model version:', model.version);
    console.log('Model accuracy:', model.accuracy);
  } catch(e) {
    console.error('ML model test failed:', e);
  }
  
  // Test API Service
  try {
    const apiService = new ApiService();
    console.log('API service initialized successfully');
    console.log('Available APIs:', Object.keys(apiService.apis));
  } catch(e) {
    console.error('API service test failed:', e);
  }
  
  console.log('Tests completed');
}

// Run tests
runTests();
