document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup DOM loaded");
    
    document.getElementById('copyToChat').addEventListener('click', () => {
      console.log("Copy to Chat button clicked");
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log("Current active tab:", tabs[0]);
        chrome.tabs.sendMessage(tabs[0].id, {action: "getEmailBody"}, (response) => {
          console.log("Received response from content script:", response);
          if (chrome.runtime.lastError) {
            console.error("Error getting email body:", chrome.runtime.lastError);
            return;
          }
          if (response && response.emailBody) {
            chrome.storage.sync.get(['prependText', 'appendText'], (items) => {
              console.log("Retrieved storage items:", items);
              const fullText = `${items.prependText || ''}\n\n${response.emailBody}\n\n${items.appendText || ''}`.trim();
              console.log("Prepared full text:", fullText);
              chrome.storage.sync.get(['customGptUrl'], (urlItem) => {
                chrome.runtime.sendMessage({action: "openChatGPT", fullText: fullText, customUrl: urlItem.customGptUrl}, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error("Error sending message to background script:", chrome.runtime.lastError);
                  } else {
                    console.log("Message sent to background script:", response);
                  }
                });
              });
            });
          } else {
            console.error("No email body received from content script");
          }
        });
      });
    });
  
    document.getElementById('openSettings').addEventListener('click', () => {
      console.log("Open Settings button clicked");
      chrome.runtime.openOptionsPage();
    });
  });