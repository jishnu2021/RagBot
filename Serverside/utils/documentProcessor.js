const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Process different document types and extract text
 */
const processDocument = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return await processPdf(filePath);
      case '.doc':
      case '.docx':
        return await processWord(filePath);
      case '.txt':
        return await processTxt(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error(`Error processing document: ${error.message}`);
    throw error;
  }
};

/**
 * Extract text from a PDF file
 */
const processPdf = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error processing PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Extract text from a Word document
 */
const processWord = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error(`Error processing Word document: ${error.message}`);
    throw error;
  }
};

/**
 * Extract text from a text file
 */
const processTxt = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error processing text file: ${error.message}`);
    throw error;
  }
};

module.exports = { processDocument };