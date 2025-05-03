// Instagram selectors utility - helps maintain the selectors in one place

// Instagram's UI can change, and selectors need updates when that happens
// This file centralizes all selectors to make maintenance easier

// Username selectors - multiple options for resilience
// Instagram frequently changes class names, so we use multiple strategies
const usernameSelectors = [
    // Main username selectors for posts and reels
    'a[class*="x1i10hfl"][href*="/"][role="link"]',
    'h2 a',
    'span._aap6._aap7._aap8 a',
    'div.x1q0g3np a',
    
    // Alternative selectors when standard ones fail
    'header h2',
    'header span a',
    'article header a',
    
    // Resilient selector that uses attribute presence
    'a[href][role="link"][tabindex="0"]'
  ];
  
  // Like count selectors - multiple options for resilience
  const likeSelectors = [
    // Main like count selectors for posts and reels
    'span.xdj266r', 
    'span[class*="xdj266r"]',
    'section span span',
    'div.x1i10hfl section span',
    'span._aacl._aaco._aacw._aacx._aada._aade',
    
    // Alternative selectors when standard ones fail
    'section div section span',
    'article section span span',
    'div[role="button"] span',
    
    // Resilient selector based on position
    'article section section span'
  ];
  
  // Helper function to find element using multiple selectors
  function findElementWithSelectors(selectors) {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.trim()) {
          return element.textContent.trim();
        }
      } catch (e) {
        // Continue to next selector if this one fails
        continue;
      }
    }
    return null;
  }
  
  // Process like count text (handles formats like "1.2k", "4.5M")
  function processLikeCount(likeText) {
    if (!likeText) return null;
    
    // Remove "likes" text if present
    likeText = likeText.replace(/likes|like/i, '').trim();
    
    // Return as-is if it's not a number format we need to process
    if (!/[kmb]$/i.test(likeText)) {
      return likeText;
    }
    
    // Process k/m/b suffixes
    const multiplier = likeText.slice(-1).toLowerCase();
    const value = parseFloat(likeText.slice(0, -1));
    
    if (multiplier === 'k') {
      return (value * 1000).toLocaleString();
    } else if (multiplier === 'm') {
      return (value * 1000000).toLocaleString();
    } else if (multiplier === 'b') {
      return (value * 1000000000).toLocaleString();
    }
    
    return likeText;
  }
  
  // Export the selectors and helper functions
  export {
    usernameSelectors,
    likeSelectors,
    findElementWithSelectors,
    processLikeCount
  };