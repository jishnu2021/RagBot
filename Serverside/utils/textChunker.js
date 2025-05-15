/**
 * Text chunking utility to split documents into manageable pieces
 */

/**
 * Split text into chunks with optional overlap
 * 
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Size of each chunk (characters)
 * @param {number} overlap - Overlap between chunks (characters)
 * @returns {string[]} Array of text chunks
 */
function chunkText(text, chunkSize = 500, overlap = 100) {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid text provided to chunker:', text);
    return [];
  }
  
  // Use more memory-efficient chunking algorithm
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate end index for this chunk
    let endIndex = Math.min(startIndex + chunkSize, text.length);
    
    // If we're not at the end of the text and not at a good breaking point,
    // look for a better breaking point (sentence or paragraph end)
    if (endIndex < text.length) {
      // Look backwards from the endIndex to find a good breaking point
      const goodBreakPoints = ['.', '!', '?', '\n', '\r\n', ';'];
      
      // Look for a good break point within the last 20% of the chunk
      const searchStartIndex = Math.max(startIndex, endIndex - Math.floor(chunkSize * 0.2));
      
      let foundBreakPoint = false;
      for (let i = endIndex; i >= searchStartIndex; i--) {
        if (goodBreakPoints.includes(text[i])) {
          endIndex = i + 1; // Include the breaking character
          foundBreakPoint = true;
          break;
        }
      }
      
      // If no good break point was found, just use the calculated endIndex
      if (!foundBreakPoint) {
        // Try to break at a space at least
        for (let i = endIndex; i >= searchStartIndex; i--) {
          if (text[i] === ' ') {
            endIndex = i + 1;
            break;
          }
        }
      }
    }
    
    // Extract the chunk
    chunks.push(text.substring(startIndex, endIndex));
    
    // Move to the next chunk start position, accounting for overlap
    startIndex = endIndex - overlap;
    
    // If the next chunk would be too small, just end here
    if (startIndex + overlap >= text.length) {
      break;
    }
  }
  
  return chunks;
}

module.exports = {
  chunkText
}; 