// options.js
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();
    
    // Save settings button
    document.getElementById('save-btn').addEventListener('click', function() {
      saveSettings();
    });
    
    // Reset settings button
    document.getElementById('reset-btn').addEventListener('click', function() {
      resetSettings();
    });
  });
  
  // Function to load settings from storage
  function loadSettings() {
    chrome.storage.local.get([
      'identifiedName', 
      'outputFormat', 
      'historyLimit',
      'notificationsEnabled',
      'autoExtract',
      'autoCopy'
    ], function(result) {
      // Set identifier name
      const nameInput = document.getElementById('identifier-name');
      nameInput.value = result.identifiedName || 'Avinash';
      
      // Set output format
      const formatSelect = document.getElementById('output-format');
      formatSelect.value = result.outputFormat || 'tab';
      
      // Set history limit
      const limitInput = document.getElementById('history-limit');
      limitInput.value = result.historyLimit || 100;
      
      // Set toggles
      document.getElementById('notifications-enabled').checked = result.notificationsEnabled !== false;
      document.getElementById('auto-extract').checked = result.autoExtract === true;
      document.getElementById('auto-copy').checked = result.autoCopy !== false;
    });
  }
  
  // Function to save settings
  function saveSettings() {
    const settings = {
      identifiedName: document.getElementById('identifier-name').value.trim() || 'Avinash',
      outputFormat: document.getElementById('output-format').value,
      historyLimit: parseInt(document.getElementById('history-limit').value) || 100,
      notificationsEnabled: document.getElementById('notifications-enabled').checked,
      autoExtract: document.getElementById('auto-extract').checked,
      autoCopy: document.getElementById('auto-copy').checked
    };
    
    // Validate settings
    if (settings.historyLimit < 10) settings.historyLimit = 10;
    if (settings.historyLimit > 500) settings.historyLimit = 500;
    
    chrome.storage.local.set(settings, function() {
      showStatusMessage('Settings saved successfully!', 'success');
    });
  }
  
  // Function to reset settings to default
  function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        identifiedName: 'Avinash',
        outputFormat: 'tab',
        historyLimit: 100,
        notificationsEnabled: true,
        autoExtract: false,
        autoCopy: true
      };
      
      chrome.storage.local.set(defaultSettings, function() {
        loadSettings(); // Reload the UI
        showStatusMessage('Settings reset to default!', 'success');
      });
    }
  }
  
  // Function to display status message
  function showStatusMessage(message, type) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    // Clear the message after 3 seconds
    setTimeout(function() {
      statusElement.style.display = 'none';
    }, 3000);
  }