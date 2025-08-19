// Direct chart initialization script
// This script guarantees charts will be created regardless of module loading issues

console.log("Direct chart script loaded");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM content loaded in direct chart script");
  
  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.error("Chart.js is not loaded! Loading it now...");
    loadChartJS();
  } else {
    console.log("Chart.js found, initializing charts after short delay");
    setTimeout(initializeChartsDirectly, 300);
  }
});

// Fallback: Also listen for window load event
window.addEventListener('load', function() {
  console.log("Window loaded in direct chart script");
  
  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.error("Chart.js is not loaded after window load! Loading it now...");
    loadChartJS();
  } else if (document.getElementById('detectionTrendsChart') && !document.getElementById('detectionTrendsChart').hasAttribute('data-initialized')) {
    console.log("Chart.js found after window load, initializing charts");
    setTimeout(initializeChartsDirectly, 100);
  }
});

// Function to load Chart.js
function loadChartJS() {
  const script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js";
  script.onload = function() {
    console.log("Chart.js loaded successfully, now initializing charts");
    setTimeout(initializeChartsDirectly, 100);
  };
  document.head.appendChild(script);
}

// Function to directly initialize charts
function initializeChartsDirectly() {
  console.log("Starting direct chart initialization");
  
  // Check if detection trends chart is already initialized
  const trendsCtx = document.getElementById('detectionTrendsChart');
  if (!trendsCtx) {
    console.error("Detection trends chart element not found");
    return;
  }
  
  if (trendsCtx.hasAttribute('data-initialized')) {
    console.log("Charts already initialized, skipping");
    return;
  }
  
  try {
    console.log("Initializing detection trends chart");
    trendsCtx.setAttribute('data-initialized', 'true');
    
    // Create detection trends chart
    new Chart(trendsCtx, {
      type: 'line',
      data: {
        labels: ['7 Days Ago', '6 Days Ago', '5 Days Ago', '4 Days Ago', '3 Days Ago', '2 Days Ago', 'Yesterday', 'Today'],
        datasets: [
          {
            label: 'Safe Sites',
            data: [25, 20, 22, 18, 29, 31, 24, 27],
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Suspicious Sites',
            data: [5, 3, 6, 4, 7, 2, 3, 2],
            borderColor: '#ffca28',
            backgroundColor: 'rgba(255, 202, 40, 0.2)',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Phishing Sites',
            data: [2, 1, 3, 0, 4, 2, 1, 1],
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e6e6fa',
              font: {
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }
            }
          },
          title: {
            display: true,
            text: 'Detection Trends Over Time',
            color: '#e6e6fa',
            font: {
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              size: 16
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#b5b5c9'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#b5b5c9'
            },
            beginAtZero: true
          }
        }
      }
    });
    
    // Feature Importance Chart
    const featureCtx = document.getElementById('featureImportanceChart');
    if (featureCtx) {
      console.log("Initializing feature importance chart");
      new Chart(featureCtx, {
        type: 'bar',
        data: {
          labels: ['URL Length', 'Special Characters', 'Domain Age', 'SSL Certificate', 'Suspicious Keywords', 'Redirect Count', 'IP in URL', 'Subdomain Count'],
          datasets: [{
            label: 'Feature Importance',
            data: [0.85, 0.78, 0.72, 0.65, 0.58, 0.52, 0.48, 0.42],
            backgroundColor: [
              'rgba(63, 81, 181, 0.7)',
              'rgba(63, 81, 181, 0.65)',
              'rgba(63, 81, 181, 0.6)',
              'rgba(63, 81, 181, 0.55)',
              'rgba(63, 81, 181, 0.5)',
              'rgba(63, 81, 181, 0.45)',
              'rgba(63, 81, 181, 0.4)',
              'rgba(63, 81, 181, 0.35)'
            ],
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'ML Model Feature Importance',
              color: '#e6e6fa',
              font: {
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                size: 16
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#b5b5c9'
              },
              max: 1.0,
              beginAtZero: true
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: '#b5b5c9'
              }
            }
          }
        }
      });
      
      console.log("Charts initialized successfully!");
    }
  } catch (error) {
    console.error("Error initializing charts:", error);
  }
}
