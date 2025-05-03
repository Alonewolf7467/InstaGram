// Instagram Data Extractor Pro - Background Script

// Listen for commands (keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
  if (command === "extract-data") {
    // Get active tab and extract data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "extractData" });
      }
    });
  } else if (command === "open-popup") {
    // Open the popup (handled by Chrome)
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveExtraction") {
    // Save extracted data
    saveExtraction(request.data);
    sendResponse({ success: true });
  } else if (request.action === "getLastExtraction") {
    // Get last extraction
    getLastExtraction().then(data => {
      sendResponse({ data: data });
    });
    return true; // Keep the message channel open for the async response
  } else if (request.action === "getExtractionHistory") {
    // Get extraction history
    getExtractionHistory().then(history => {
      sendResponse({ history: history });
    });
    return true; // Keep the message channel open for the async response
  } else if (request.action === "clearHistory") {
    // Clear extraction history
    clearHistory().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for the async response
  }
});

// Save extraction to storage
function saveExtraction(data) {
  // Add timestamp
  data.timestamp = new Date().toISOString();
  
  // Save as last extraction
  chrome.storage.local.set({ lastExtraction: data });
  
  // Add to history
  getExtractionHistory().then(history => {
    history.unshift(data); // Add to beginning of array
    
    // Limit history to 100 items
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    
    chrome.storage.local.set({ extractionHistory: history });
  });
}

// Get last extraction
function getLastExtraction() {
  return new Promise((resolve) => {
    chrome.storage.local.get("lastExtraction", (result) => {
      resolve(result.lastExtraction || null);
    });
  });
}

// Get extraction history
function getExtractionHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get("extractionHistory", (result) => {
      resolve(result.extractionHistory || []);
    });
  });
}

// Clear history
function clearHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.remove("extractionHistory", () => {
      resolve();
    });
  });
}

// Set default identifier name if not set
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("identifiedName", (result) => {
    if (!result.identifiedName) {
      chrome.storage.local.set({ identifiedName: "Avinash" });
    }
  });
});