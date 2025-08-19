// Test script for Dark Mode functionality
console.log('Testing dark mode functionality...');

// Simulate toggling dark mode
function testDarkMode() {
  // Get the current theme or default to system preference
  const currentTheme = localStorage.getItem('theme');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  console.log('Current theme:', currentTheme);
  console.log('System prefers dark:', prefersDarkScheme.matches);
  
  // Toggle theme
  if (currentTheme === 'dark') {
    console.log('Switching to light mode...');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    console.log('Switching to dark mode...');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  
  // Verify the change
  const newTheme = localStorage.getItem('theme');
  console.log('New theme set to:', newTheme);
  console.log('Document theme attribute:', document.documentElement.getAttribute('data-theme'));
  
  // Log CSS variables to verify they're applied
  const styles = window.getComputedStyle(document.documentElement);
  console.log('Background color:', styles.getPropertyValue('--bg-color'));
  console.log('Text color:', styles.getPropertyValue('--text-color'));
}

// Run test when loaded in the dashboard page
if (document.readyState === 'complete') {
  testDarkMode();
} else {
  window.addEventListener('DOMContentLoaded', testDarkMode);
}
