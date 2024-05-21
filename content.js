async function checkLink(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return { url: url, status: response.status };
  } catch (error) {
    return { url: url, status: 'error' };
  }
}

async function findAllLinks() {
  const links = Array.from(document.querySelectorAll('a'));
  const results = await Promise.all(links.map(link => checkLink(link.href)));
  return results;
}

findAllLinks().then(links => {
  chrome.runtime.sendMessage({ action: 'updateResults', links: links });
});


  