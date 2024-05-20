function checkLink(url) {
    return new Promise((resolve) => {
      fetch(url, { method: 'HEAD' })
        .then((response) => {
          if (response.status >= 400) {
            resolve({ url: url, status: response.status });
          } else {
            resolve(null);
          }
        })
        .catch(() => {
          resolve({ url: url, status: 'error' });
        });
    });
  }
  
  async function findBrokenLinks() {
    const links = Array.from(document.querySelectorAll('a'));
    const results = await Promise.all(links.map(link => checkLink(link.href)));
  
    return results.filter(result => result !== null);
  }
  
  findBrokenLinks().then(brokenLinks => {
    chrome.runtime.sendMessage({ action: 'updateResults', brokenLinks: brokenLinks });
  });
  