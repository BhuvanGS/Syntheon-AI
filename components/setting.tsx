'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Zap, Bell, Palette, Code, Save } from 'lucide-react';

export function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [botName, setBotName] = useState('Syntheon AI');
  const [silenceDetection, setSilence] = useState('0.45');
  const [notifications, setNotifications] = useState(true);
  const [autoShip, setAutoShip] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings
    const stored = localStorage.getItem('syntheon-settings');
    if (stored) {
      const s = JSON.parse(stored);
      setDarkMode(s.darkMode ?? false);
      setBotName(s.botName ?? 'Syntheon AI');
      setSilence(s.silenceDetection ?? '0.45');
      setNotifications(s.notifications ?? true);
      setAutoShip(s.autoShip ?? false);
    }

    // Apply dark mode
    const isDark = localStorage.getItem('syntheon-settings')
      ? JSON.parse(localStorage.getItem('syntheon-settings')!).darkMode
      : false;
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
  }

  function saveSettings() {
    localStorage.setItem(
      'syntheon-settings',
      JSON.stringify({
        darkMode,
        botName,
        silenceDetection,
        notifications,
        autoShip,
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="font-playfair font-bold text-foreground text-lg">Appearance</h2>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Dark Mode</p>
            <p className="text-sm text-muted-foreground">Switch to a darker interface</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              darkMode ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <p className="text-sm text-muted-foreground">
              Currently using {darkMode ? 'dark' : 'light'} mode
            </p>
          </div>
        </div>
      </div>

      {/* Bot Settings */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="font-playfair font-bold text-foreground text-lg">Bot Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Bot Name</label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Syntheon AI"
            />
            <p className="text-xs text-muted-foreground mt-1">Name shown to meeting participants</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Silence Detection (minutes)
            </label>
            <input
              type="number"
              value={silenceDetection}
              onChange={(e) => setSilence(e.target.value)}
              step="0.1"
              min="0.1"
              max="10"
              className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Bot leaves after this many minutes of silence
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="font-playfair font-bold text-foreground text-lg">Notifications</h2>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Transcription Ready</p>
            <p className="text-sm text-muted-foreground">Notify when meeting is processed</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              notifications ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                notifications ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">Auto Ship</p>
            <p className="text-sm text-muted-foreground">
              Automatically ship all specs without review
            </p>
          </div>
          <button
            onClick={() => setAutoShip(!autoShip)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              autoShip ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                autoShip ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-4 h-4 text-primary" />
          <h2 className="font-playfair font-bold text-foreground text-lg">About</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Syntheon AI <span className="text-foreground font-medium">v1.0.0</span>
          </p>
          <p>
            Built by <span className="text-foreground font-medium">Bhuvan GS</span>
          </p>
          <p>Turns conversations into software.</p>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={saveSettings}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
