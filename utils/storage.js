// Storage utility functions for Instagram Data Extractor Pro

// Get a value from Chrome storage
function getStorageValue(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }
  
  // Set a value in Chrome storage
  function setStorageValue(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }
  
  // Get the current user's identifier name (default: Avinash)
  async function getIdentifierName() {
    const name = await getStorageValue("identifiedName");
    return name || "Avinash"; 
  }
  
  // Set the user's identifier name
  function setIdentifierName(name) {
    return setStorageValue("identifiedName", name);
  }
  
  // Get the last extraction data
  function getLastExtraction() {
    return getStorageValue("lastExtraction");
  }
  
  // Set the last extraction data
  function setLastExtraction(data) {
    return setStorageValue("lastExtraction", data);
  }
  
  // Get the extraction history array
  async function getExtractionHistory() {
    const history = await getStorageValue("extractionHistory");
    return history || [];
  }
  
  // Add an item to the extraction history
  async function addToExtractionHistory(data) {
    // Get the current history
    const history = await getExtractionHistory();
    
    // Add new item at the beginning
    history.unshift(data);
    
    // Limit history size to 100 items
    if (history.length > 100) {
      history.pop();
    }
    
    // Save the updated history
    return setStorageValue("extractionHistory", history);
  }
  
  // Clear all extraction history
  function clearExtractionHistory() {
    return chrome.storage.local.remove("extractionHistory");
  }
  
  // Export functions
  export {
    getStorageValue,
    setStorageValue,
    getIdentifierName,
    setIdentifierName,
    getLastExtraction,
    setLastExtraction,
    getExtractionHistory,
    addToExtractionHistory,
    clearExtractionHistory
  };