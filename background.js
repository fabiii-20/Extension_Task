chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateResults') {
      chrome.runtime.sendMessage({ action: 'updateResults', brokenLinks: message.brokenLinks });
    }
  });
  