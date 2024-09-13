console.log("ChatGPT content script loaded");

function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error(`Timeout waiting for element: ${selector}`));
      }
    }, 100);
  });
}

function simulateSend(textarea) {
  return new Promise((resolve, reject) => {
    const sendButton = document.querySelector('button[data-testid="send-button"]');
    if (sendButton) {
      sendButton.click();
      console.log("Clicked send button");
      resolve();
    } else {
      console.error("Send button not found");
      reject(new Error("Send button not found"));
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in ChatGPT content script:", request);
  if (request.action === "pasteEmail") {
    console.log("Attempting to paste email");
    waitForElement('#prompt-textarea')
      .then((textarea) => {
        console.log("Textarea found:", textarea);
        
        // Clear existing content
        textarea.innerHTML = '';
        
        // Create a new paragraph element and set its text content
        const p = document.createElement('p');
        p.textContent = request.emailBody;
        
        // Append the paragraph to the textarea
        textarea.appendChild(p);
        
        // Dispatch an input event to trigger any necessary updates
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("Text pasted into textarea");
        
        // Wait a short time before sending to ensure the UI has updated
        setTimeout(() => {
          simulateSend(textarea)
            .then(() => {
              console.log("Prompt sent successfully");
              sendResponse({success: true, message: "Email pasted and sent successfully"});
            })
            .catch((error) => {
              console.error("Error sending prompt:", error);
              sendResponse({success: false, message: "Failed to send prompt"});
            });
        }, 500);
      })
      .catch((error) => {
        console.error("Error finding textarea:", error);
        sendResponse({success: false, message: error.toString()});
      });
    return true; // Indicates that the response is sent asynchronously
  }
});

console.log("ChatGPT content script loaded");