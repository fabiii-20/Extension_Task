document.getElementById('done-button').addEventListener('click', () => {
  const isEnabled = document.getElementById('enable-check').checked;
  
  if (isEnabled) {
    const startTime = Date.now();
    const timerElement = document.getElementById('timer');
    let timerInterval = setInterval(()=>{
      const elapsedTime = Math.floor((Date.now()-startTime)/1000)
      timerElement.textContent = `Loading time : ${elapsedTime}s`
    },1000)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, () => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.action === 'updateResults') {
            clearInterval(timerInterval);
            updateUI(message.links);
            sendResponse({ status: 'success' });
          }
        });
      });
    });
  } else {
    alert('Please enable the link check by ticking the checkbox.');
  }
});

function updateUI(links) {
  const resultView = document.getElementById('result-view');
  const initialView = document.getElementById('initial-view');
  const linksList = document.getElementById('links-list');
  const brokenLinksList = document.getElementById('broken-links-list');

  linksList.innerHTML = '';
  brokenLinksList.innerHTML = '';

  links.forEach(link => {
    const row = document.createElement('tr');
    const urlCell = document.createElement('td');
    urlCell.textContent = link.url;
    const statusCell = document.createElement('td');
    statusCell.textContent = link.status;
    row.appendChild(urlCell);
    row.appendChild(statusCell);
    linksList.appendChild(row);

    if (link.status == 400 || link.status == 404 || link.status == 410 ||  link.status === 'error') { //more conditions to be added
      const brokenRow = document.createElement('tr');
      const brokenUrlCell = document.createElement('td');
      brokenUrlCell.textContent = link.url;
      const brokenStatusCell = document.createElement('td');
      brokenStatusCell.textContent = link.status;
      brokenRow.appendChild(brokenUrlCell);
      brokenRow.appendChild(brokenStatusCell);
      brokenLinksList.appendChild(brokenRow);
    }
  });

  initialView.style.display = 'none';
  resultView.style.display = 'block';
}

document.getElementById('back').addEventListener('click', () => {
  document.getElementById('result-view').style.display = 'none';
  document.getElementById('initial-view').style.display = 'block';
});

document.getElementById('download-pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

 
  doc.text('All Links', 10, 10);
  doc.autoTable({
    head: [['URL', 'Status']],
    body: Array.from(document.querySelectorAll('#links-list tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    }),
    startY: 20
  });

  
  doc.text('Broken Links', 10, doc.lastAutoTable.finalY + 10);
  doc.autoTable({
    head: [['URL', 'Status']],
    body: Array.from(document.querySelectorAll('#broken-links-list tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    }),
    startY: doc.lastAutoTable.finalY + 20
  });

  doc.save('links_report.pdf');
});
