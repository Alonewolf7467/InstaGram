// Instagram Data Extractor Pro - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the popup
  initTabs();
  loadLastExtraction();
  loadHistory();
  loadSettings();
  setupEventListeners();
});

// Initialize tabs
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and panes
      tabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding pane
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Load last extraction
function loadLastExtraction() {
  chrome.runtime.sendMessage({ action: "getLastExtraction" }, (response) => {
    if (response && response.data) {
      displayLastExtraction(response.data);
    }
  });
}

// Display last extraction
function displayLastExtraction(data) {
  const container = document.getElementById('last-extraction-details');
  
  if (!data) {
    container.innerHTML = '<div class="no-data">No data extracted yet</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="extraction-item">
      <p><span class="extraction-label">URL:</span> ${truncateText(data.url, 30)}</p>
      <p><span class="extraction-label">Username:</span> ${data.username}</p>
      <p><span class="extraction-label">Likes:</span> ${data.likes}</p>
      <p><span class="extraction-label">Identified By:</span> ${data.identifiedBy}</p>
    </div>
  `;
}

// Load extraction history
function loadHistory() {
  chrome.runtime.sendMessage({ action: "getExtractionHistory" }, (response) => {
    if (response && response.history) {
      displayHistory(response.history);
    }
  });
}

// Display extraction history
function displayHistory(history) {
  const container = document.getElementById('history-container');
  
  if (!history || history.length === 0) {
    container.innerHTML = '<div class="no-data">No extraction history</div>';
    return;
  }
  
  let html = '';
  history.forEach(item => {
    const date = new Date(item.timestamp);
    const formattedDate = formatDate(date);
    
    html += `
      <div class="history-item">
        <div class="history-item-header">
          <div class="history-item-type">${item.postType}</div>
          <div class="history-item-time">${formattedDate}</div>
        </div>
        <p>${truncateText(item.url, 40)}</p>
        <p><strong>Username:</strong> ${item.username}</p>
        <p><strong>Likes:</strong> ${item.likes}</p>
        <p><strong>Identified By:</strong> ${item.identifiedBy}</p>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Load settings
function loadSettings() {
  chrome.storage.local.get("identifiedName", (result) => {
    if (result.identifiedName) {
      document.getElementById('identifier-name').value = result.identifiedName;
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Extract button
  document.getElementById('extract-button').addEventListener('click', () => {
    extractData();
  });
  
  // Format buttons
  document.getElementById('copy-tab').addEventListener('click', () => {
    copyFormattedData("tab");
  });
  
  document.getElementById('copy-csv').addEventListener('click', () => {
    copyFormattedData("csv");
  });
  
  document.getElementById('copy-pipe').addEventListener('click', () => {
    copyFormattedData("pipe");
  });
  
  // Export history button
  document.getElementById('export-history').addEventListener('click', () => {
    exportHistory();
  });
  
  // Clear history button
  document.getElementById('clear-history').addEventListener('click', () => {
    clearHistory();
  });
  
  // Save name button
  document.getElementById('save-name').addEventListener('click', () => {
    saveIdentifierName();
  });
}

// Extract data from current tab
function extractData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Check if URL is Instagram
    if (tabs[0] && tabs[0].url.includes("instagram.com")) {
      setStatusMessage("Extracting data...");
      
      // Send message to content script
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractData" }, (response) => {
        if (chrome.runtime.lastError) {
          setStatusMessage("Error: Instagram page not fully loaded. Please refresh the page.", "error");
        } else if (response && response.success) {
          setStatusMessage("Data extracted successfully!", "success");
          loadLastExtraction();
          loadHistory();
        } else {
          setStatusMessage("Failed to extract data. Make sure you're on an Instagram post or reel.", "error");
        }
      });
    } else {
      setStatusMessage("Not an Instagram page. Navigate to Instagram first.", "error");
    }
  });
}

// Copy formatted data to clipboard
function copyFormattedData(format) {
  chrome.runtime.sendMessage({ action: "getLastExtraction" }, (response) => {
    if (response && response.data) {
      const data = response.data;
      let formattedData = "";
      
      switch (format) {
        case "tab":
          formattedData = `${data.url}\n${data.username}\t${data.likes}\t${data.identifiedBy}`;
          break;
        case "csv":
          formattedData = `"${data.url}","${data.username}","${data.likes}","${data.identifiedBy}"`;
          break;
        case "pipe":
          formattedData = `${data.url}\n${data.username} | ${data.likes} | ${data.identifiedBy}`;
          break;
      }
      
      // Copy to clipboard
      navigator.clipboard.writeText(formattedData).then(() => {
        setStatusMessage(`Copied as ${format === "tab" ? "tab-separated" : format === "csv" ? "CSV" : "pipe-separated"} format!`, "success");
      }).catch(err => {
        setStatusMessage("Failed to copy to clipboard.", "error");
      });
    } else {
      setStatusMessage("No data to copy. Extract data first.", "error");
    }
  });
}

// Export history to CSV file
function exportHistory() {
  chrome.runtime.sendMessage({ action: "getExtractionHistory" }, (response) => {
    if (response && response.history && response.history.length > 0) {
      const history = response.history;
      let csv = "URL,Username,Likes,Identified By,Post Type,Timestamp\n";
      
      history.forEach(item => {
        csv += `"${item.url}","${item.username}","${item.likes}","${item.identifiedBy}","${item.postType}","${item.timestamp}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instagram-data-export-${formatDateForFilename(new Date())}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatusMessage("History exported to CSV!", "success");
    } else {
      setStatusMessage("No history to export.", "error");
    }
  });
}

// Clear history
function clearHistory() {
  if (confirm("Are you sure you want to clear all extraction history?")) {
    chrome.runtime.sendMessage({ action: "clearHistory" }, (response) => {
      if (response && response.success) {
        document.getElementById('history-container').innerHTML = '<div class="no-data">No extraction history</div>';
        setStatusMessage("History cleared successfully!", "success");
      } else {
        setStatusMessage("Failed to clear history.", "error");
      }
    });
  }
}

// Save identifier name
function saveIdentifierName() {
  const name = document.getElementById('identifier-name').value.trim();
  
  if (name) {
    chrome.storage.local.set({ identifiedName: name }, () => {
      setStatusMessage("Name saved successfully!", "success");
    });
  } else {
    setStatusMessage("Please enter a valid name.", "error");
  }
}

// Set status message
function setStatusMessage(message, type = null) {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  
  // Remove existing status classes
  statusElement.classList.remove('status-success', 'status-error');
  
  // Add status class if type is provided
  if (type === "success") {
    statusElement.classList.add('status-success');
  } else if (type === "error") {
    statusElement.classList.add('status-error');
  }
}

// Helper function to format date
function formatDate(date) {
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Helper function to format date for filename
function formatDateForFilename(date) {
  return date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}