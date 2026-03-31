// background.js — Syntheon AI Meeting Assistant
importScripts('config.js');

// ─── Message Handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'sendBot':
      sendBot(request.meetingUrl, request.tabTitle)
        .then((data) => sendResponse({ success: true, ...data }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
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

  // 🔥 GET API KEY
  const { apiKey } = await chrome.storage.local.get(['apiKey']);

  if (!apiKey) {
    throw new Error('API key not set. Open settings.');
  }

  const res = await fetch(getApiUrl('/api/bot/create'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`, // 🔥 THIS WAS MISSING
    },
    body: JSON.stringify({ meetingUrl, tabTitle }),
  });

  // 🔥 SAFER PARSING
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('Non-JSON response:', text);
    throw new Error('Server returned invalid response');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to send bot');
  }

  return data;
}
