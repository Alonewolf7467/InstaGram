// Data formatting utilities for Instagram Data Extractor Pro

// Format data as tab-separated (default format)
function formatTabSeparated(data) {
    return `${data.url}\n${data.username}\t${data.likes}\t${data.identifiedBy}`;
  }
  
  // Format data as CSV
  function formatCSV(data) {
    return `"${data.url}","${data.username}","${data.likes}","${data.identifiedBy}"`;
  }
  
  // Format data as pipe-separated
  function formatPipeSeparated(data) {
    return `${data.url}\n${data.username} | ${data.likes} | ${data.identifiedBy}`;
  }
  
  // Format all history items as CSV (for export)
  function formatHistoryAsCSV(history) {
    if (!history || history.length === 0) {
      return "";
    }
    
    // CSV header
    let csv = "URL,Username,Likes,Identified By,Post Type,Timestamp\n";
    
    // Add each history item
    history.forEach(item => {
      csv += `"${item.url}","${item.username}","${item.likes}","${item.identifiedBy}","${item.postType}","${item.timestamp}"\n`;
    });
    
    return csv;
  }
  
  // Format a date for display
  function formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }
  
  // Format a date for use in filenames (no spaces or special chars)
  function formatDateForFilename(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    return date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
  }
  
  // Truncate text to specified length with ellipsis
  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
      return text || "";
    }
    return text.substring(0, maxLength) + '...';
  }
  
  // Format data based on specified format type
  function formatData(data, format) {
    switch (format) {
      case "tab":
        return formatTabSeparated(data);
      case "csv":
        return formatCSV(data);
      case "pipe":
        return formatPipeSeparated(data);
      default:
        return formatTabSeparated(data);
    }
  }
  
  // Export formatting functions
  export {
    formatTabSeparated,
    formatCSV,
    formatPipeSeparated,
    formatHistoryAsCSV,
    formatDate,
    formatDateForFilename,
    truncateText,
    formatData
  };