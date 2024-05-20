document.getElementById('doneButton').addEventListener('click', function() {
    const checkBox = document.getElementById('checkBox').checked;
    if (checkBox) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        console.log('tabs query result:', tabs);
        if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
          console.error('Failed to query tabs:', chrome.runtime.lastError);
          return;
        }
  
        const tabId = tabs[0].id;
        if (!tabId) {
          console.error('No active tab found');
          return;
        }
  
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }, (result) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to execute script:', chrome.runtime.lastError);
            return;
          }
          // Script executed successfully, switch view
          document.getElementById('initial-view').style.display = 'none';
          document.getElementById('result-view').style.display = 'block';
        });
      });
    }
  });
  
  document.getElementById('backButton').addEventListener('click', function() {
    document.getElementById('result-view').style.display = 'none';
    document.getElementById('initial-view').style.display = 'block';
    document.getElementById('result').innerHTML = '';
  });
  
  chrome.runtime.onMessage.addListener((message) => {
    console.log('Message received in popup:', message); // Log received messages
    if (message.action === 'updateResults') {
      const resultElement = document.getElementById('result');
      resultElement.innerHTML = '';
      if (message.brokenLinks.length === 0) {
        resultElement.innerHTML = '<li>No broken links found.</li>';
      } else {
        message.brokenLinks.forEach(link => {
          const li = document.createElement('li');
          li.textContent = `${link.url} - ${link.status}`;
          resultElement.appendChild(li);
        });
      }
    }
  });
  