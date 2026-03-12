// popup/popup.js — Syntheon AI Meeting Assistant

class SyntheonPopup {
  constructor() {
    this.meetingUrl = null;
    this.tabTitle   = null;
    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.loadTabInfo();
  }

  bindElements() {
    this.sendBotButton    = document.getElementById('sendBotButton');
    this.sendBotText      = document.getElementById('sendBotText');
    this.statusDot        = document.getElementById('statusDot');
    this.statusText       = document.getElementById('statusText');
    this.meetingUrlEl     = document.getElementById('meetingUrl');
    this.platformName     = document.getElementById('platformName');
    this.recordingsButton = document.getElementById('recordingsButton');
  }

  bindEvents() {
    this.sendBotButton.addEventListener('click', async () => {
      const stored = await chrome.storage.local.get('botState');
      if (stored.botState?.active) {
        // Bot already active — click clears state so user can send new bot
        await chrome.storage.local.remove('botState');
        this.sendBotText.textContent  = 'Send Bot to Meeting';
        this.sendBotButton.disabled   = false;
        this.updateStatus('Ready to send bot', 'ready');
      } else {
        this.sendBot();
      }
    });

    this.recordingsButton?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:3000' });
    });
  }

  async loadTabInfo() {
    try {
      // Check if bot is already active from a previous popup session
      const stored = await chrome.storage.local.get('botState');
      if (stored.botState?.active) {
        this.meetingUrlEl.textContent = this.formatUrl(stored.botState.meetingUrl);
        this.platformName.textContent = stored.botState.platform;
        this.sendBotButton.disabled   = false; // allow click to clear
        this.sendBotText.textContent  = 'Bot Active — Click to Reset';
        this.updateStatus('Syntheon - AI will join shortly', 'success');
        return;
      }

      // No active bot — detect current tab
      const response = await chrome.runtime.sendMessage({ action: 'getTabInfo' });
      const url   = response?.url   ?? '';
      const title = response?.title ?? '';

      if (this.isMeetingUrl(url)) {
        this.meetingUrl = url;
        this.tabTitle   = title;
        this.meetingUrlEl.textContent = this.formatUrl(url);
        this.platformName.textContent = this.getPlatformName(url);
        this.sendBotButton.disabled   = false;
        this.updateStatus('Ready to send bot', 'ready');
      } else {
        this.meetingUrlEl.textContent = 'No meeting detected';
        this.platformName.textContent = '—';
        this.sendBotButton.disabled   = true;
        this.updateStatus('Open a meeting first', 'idle');
      }
    } catch (error) {
      console.error('loadTabInfo error:', error);
      this.updateStatus('Could not detect tab', 'error');
    }
  }

  isMeetingUrl(url) {
    if (!url) return false;
    return ['meet.google.com', 'zoom.us', 'teams.microsoft.com'].some(p => url.includes(p));
  }

  formatUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname + u.pathname.slice(0, 20) + '...';
    } catch { return url; }
  }

  getPlatformName(url) {
    if (url.includes('meet.google.com'))     return 'Google Meet';
    if (url.includes('zoom.us'))             return 'Zoom';
    if (url.includes('teams.microsoft.com')) return 'Microsoft Teams';
    return 'Unknown';
  }

  async sendBot() {
    this.sendBotButton.disabled = true;
    this.updateStatus('Sending bot...', 'recording');
    this.sendBotText.textContent = 'Sending...';

    try {
      const res = await chrome.runtime.sendMessage({
        action:     'sendBot',
        meetingUrl: this.meetingUrl,
        tabTitle:   this.tabTitle
      });

      console.log('sendBot response:', res);
      if (!res?.success) throw new Error(res?.error || 'No response from background');

      // Persist state so it survives popup close/reopen
      await chrome.storage.local.set({
        botState: {
          active:     true,
          botId:      res.botId,
          meetingId:  res.meetingId,
          meetingUrl: this.meetingUrl,
          platform:   this.getPlatformName(this.meetingUrl)
        }
      });

      this.sendBotButton.disabled  = false; // allow reset click
      this.sendBotText.textContent = 'Bot Active — Click to Reset';
      this.updateStatus('Syntheon - AI will join shortly', 'success');

    } catch (error) {
      console.error('Failed to send bot:', error);
      this.updateStatus(error.message || 'Failed to send bot', 'error');
      this.sendBotText.textContent = 'Send Bot to Meeting';
      this.sendBotButton.disabled  = false;
    }
  }

  updateStatus(text, type) {
    this.statusText.textContent = text;
    this.statusDot.className    = `status-dot ${type}`;
    const colors = {
      ready:     '#5c7c5d',
      idle:      '#6b7280',
      success:   '#5c7c5d',
      error:     '#f59e0b',
      recording: '#c0534a'
    };
    this.statusDot.style.background = colors[type] || '#6b7280';
  }
}

document.addEventListener('DOMContentLoaded', () => new SyntheonPopup());