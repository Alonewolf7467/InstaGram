// Instagram Data Extractor Pro - Content Script

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractData") {
    extractData().then(data => {
      // Send data to background script for storage
      chrome.runtime.sendMessage({ 
        action: "saveExtraction", 
        data: data 
      });
      
      // Copy to clipboard
      copyToClipboard(formatData(data, "tab"));
      
      // Send response back
      sendResponse({ success: true, data: data });
    });
    return true; // Keep the message channel open for async response
  }
});

// Extract data from Instagram page
async function extractData() {
  try {
    const url = window.location.href;
    const username = extractUsername();
    const likes = extractLikes();
    const postType = url.includes("/reel/") ? "Reel" : "Post";
    
    // Get identifier name from storage
    const identifierName = await getIdentifierName();
    
    return {
      url: url,
      username: username,
      likes: likes,
      identifiedBy: identifierName,
      postType: postType,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error extracting data:", error);
    return {
      url: window.location.href,
      username: "Error extracting",
      likes: "Error extracting",
      identifiedBy: await getIdentifierName(),
      postType: "Unknown",
      timestamp: new Date().toISOString()
    };
  }
}

// Extract username using multiple selectors for resilience
function extractUsername() {
  // Try multiple selectors for username
  const selectors = [
    'a[class*="x1i10hfl"][href*="/"][role="link"]',
    'h2 a',
    'span._aap6._aap7._aap8 a',
    'div.x1q0g3np a',
    'a[class*="_a6hd"]',
    'header h2 a'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  return "Username not found";
}

// Extract likes count using multiple selectors for resilience
function extractLikes() {
  // Try multiple selectors for likes
  const selectors = [
    'span.xdj266r', 
    'span[class*="xdj266r"]',
    'section span span',
    'div.x1i10hfl section span',
    'span._aacl._aaco._aacw._aacx._aada._aade',
    'span[class*="html-span xdj266r"]'
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent.trim();
      // Check if it might be a likes count (contains numbers)
      if (/\d/.test(text)) {
        // Return as is, with formatting
        return text;
      }
    }
  }
  
  return "Likes not found";
}

// Get identifier name from storage
function getIdentifierName() {
  return new Promise((resolve) => {
    chrome.storage.local.get("identifiedName", (result) => {
      resolve(result.identifiedName || "Avinash");
    });
  });
}

// Format data based on format type
function formatData(data, format) {
  switch (format) {
    case "tab":
      return `${data.url}\t${data.username}\t${data.likes}\t${data.identifiedBy}`;
    case "csv":
      return `"${data.url}","${data.username}","${data.likes}","${data.identifiedBy}"`;
    case "pipe":
      return `${data.url} | ${data.username} | ${data.likes} | ${data.identifiedBy}`;
    default:
      return `${data.url}\t${data.username}\t${data.likes}\t${data.identifiedBy}`;
  }
}

// Copy text to clipboard
function copyToClipboard(text) {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  
  // Select and copy
  textarea.select();
  document.execCommand('copy');
  
  // Clean up
  document.body.removeChild(textarea);
}

// Listen for URL changes (for SPA navigation on Instagram)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Wait for page to load
    setTimeout(() => {
      // Check if this is a post or reel
      if (location.href.includes("/p/") || location.href.includes("/reel/")) {
        console.log("Instagram Data Extractor: URL changed to a post/reel");
      }
    }, 1500);
  }
}).observe(document, { subtree: true, childList: true });