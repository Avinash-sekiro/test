/**
 * Chat Module for AI-Language-Labs
 * Handles all chat-related functionality including displaying messages and managing the chat UI
 */

// Chat module using IIFE pattern for encapsulation
const ChatModule = (function() {
  // Private variables
  let chatHistory;
  let chatSection;
  let chatToggle;
  let isChatVisible = true;
  
  // Initialize the chat module
  function init() {
    chatHistory = document.getElementById('chatHistory');
    chatSection = document.getElementById('chat-section');
    chatToggle = document.getElementById('chat-toggle');
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Chat module initialized');
    return this;
  }
  
  // Set up event listeners for chat functionality
  function setupEventListeners() {
    if (chatToggle) {
      chatToggle.addEventListener('click', toggleChatVisibility);
    }
  }
  
  // Toggle chat visibility
  function toggleChatVisibility() {
    isChatVisible = !isChatVisible;
    if (chatSection) {
      chatSection.style.display = isChatVisible ? 'block' : 'none';
    }
  }
  
  // Add a processing message to the chat
  function addProcessingMessage() {
    const processingDiv = document.createElement('div');
    processingDiv.classList.add('message', 'processingMessage');
    processingDiv.textContent = "Processing audio...";
    processingDiv.id = "processing-message";
    chatHistory.appendChild(processingDiv);
    
    // Clear floats
    addClearfix();
    
    // Scroll to the bottom
    scrollToBottom();
    
    return processingDiv;
  }
  
  // Remove the processing message
  function removeProcessingMessage() {
    const processingMessage = document.getElementById('processing-message');
    if (processingMessage) {
      processingMessage.remove();
    }
  }
  
  // Add a user message to the chat
  function addUserMessage(text) {
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'userMessage');
    userMessageDiv.textContent = "Student: " + text;
    chatHistory.appendChild(userMessageDiv);
    
    // Clear floats
    addClearfix();
    
    // Scroll to the bottom
    scrollToBottom();
    
    return userMessageDiv;
  }
  
  // Add a bot/system message to the chat
  function addBotMessage(text) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.classList.add('message', 'botMessage');
    botMessageDiv.textContent = text;
    chatHistory.appendChild(botMessageDiv);
    
    // Clear floats
    addClearfix();
    
    // Scroll to the bottom
    scrollToBottom();
    
    return botMessageDiv;
  }
  
  // Add an error message to the chat
  function addErrorMessage(text) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('message', 'botMessage', 'error');
    errorDiv.textContent = 'Error: ' + (text || 'Could not process your request');
    chatHistory.appendChild(errorDiv);
    
    // Clear floats
    addClearfix();
    
    // Scroll to the bottom
    scrollToBottom();
    
    return errorDiv;
  }
  
  // Add a clearfix div to the chat
  function addClearfix() {
    const clearDiv = document.createElement('div');
    clearDiv.classList.add('clearfix');
    chatHistory.appendChild(clearDiv);
  }
  
  // Scroll to the bottom of the chat
  function scrollToBottom() {
    if (chatHistory) {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  }
  
  // Clear the chat history
  function clearChat() {
    if (chatHistory) {
      chatHistory.innerHTML = '';
    }
  }
  
  // Public API
  return {
    init: init,
    addProcessingMessage: addProcessingMessage,
    removeProcessingMessage: removeProcessingMessage,
    addUserMessage: addUserMessage,
    addBotMessage: addBotMessage,
    addErrorMessage: addErrorMessage,
    scrollToBottom: scrollToBottom,
    clearChat: clearChat,
    toggleVisibility: toggleChatVisibility
  };
})();

// Export the module for use in other files
window.ChatModule = ChatModule;
