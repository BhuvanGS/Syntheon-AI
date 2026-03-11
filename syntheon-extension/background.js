// background.js — Syntheon AI Meeting Assistant

// ─── Message Handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {

    case 'sendBot':
      sendBot(request.meetingUrl, request.tabTitle)
        .then(data => sendResponse({ success: true, ...data }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'getTabInfo':
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const tab = tabs[0];
        sendResponse({ url: tab?.url ?? '', title: tab?.title ?? '' });
      });
      return true;
  }
});

// ─── Send Bot to Meeting ───────────────────────────────────────────────────────
async function sendBot(meetingUrl, tabTitle) {
  console.log('Sending bot to:', meetingUrl);

  const res = await fetch('http://localhost:3000/api/bot/create', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ meetingUrl, tabTitle })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send bot');
  }

  return res.json(); // { success, botId, meetingId }
}