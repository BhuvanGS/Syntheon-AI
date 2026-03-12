# Syntheon AI Meeting Assistant

An intelligent meeting management platform that combines a web application with a browser extension to automatically record, transcribe, and extract actionable specifications from your online meetings.

## Features

### Web Application
- **Dashboard**: Central hub for managing all your meetings and extracted specifications
- **Meeting Management**: View and organize recorded meetings with detailed transcripts
- **Spec Blocks**: Automatically extracted specifications and action items from meetings
- **Kanban Board**: Workflow management (coming soon)
- **Settings**: Configure preferences (coming soon)

### Browser Extension
- **Multi-Platform Support**: Works with Google Meet, Zoom, and Microsoft Teams
- **Automatic Recording**: Captures audio from online meetings
- **Real-time Transcription**: Uses Deepgram AI for accurate speech-to-text
- **Seamless Integration**: Automatically syncs with the web application

## Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5.7.3** - Type-safe development
- **TailwindCSS 4.2.0** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend & Services
- **Deepgram SDK 3.9.0** - Speech-to-text transcription
- **Groq SDK 1.1.1** - AI model integration
- **Node.js** - Runtime environment

### Browser Extension
- **Manifest V3** - Modern Chrome extension API
- **Content Scripts** - Injects functionality into meeting platforms
- **Background Service Worker** - Handles background tasks

## Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Google Chrome (for browser extension)

### Web Application Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Syntheon-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your API keys:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Browser Extension Setup

1. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" in the top right

2. **Load the extension**
   - Click "Load unpacked"
   - Select the `syntheon-extension` directory

3. **Verify installation**
   - The Syntheon AI icon should appear in your browser toolbar
   - Extension should be active for Google Meet, Zoom, and Teams

## Usage

### Recording a Meeting

1. **Join a meeting** on Google Meet, Zoom, or Teams
2. **Start the extension** by clicking the Syntheon AI icon
3. **Begin recording** - the extension will automatically capture audio
4. **End recording** when the meeting concludes
5. **View results** in the web application dashboard

### Managing Meetings

1. **Access the dashboard** at http://localhost:3000
2. **Browse meetings** in the Meetings section
3. **View transcripts** and extracted specifications
4. **Organize spec blocks** for project management

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPGRAM_API_KEY` | Deepgram API key for transcription | Yes |
| `GROQ_API_KEY` | Groq API key for AI processing | Yes |

### Deepgram Setup
1. Sign up at [Deepgram](https://deepgram.com)
2. Create a new project
3. Generate an API key
4. Add the key to your `.env.local` file

### Groq Setup
1. Sign up at [Groq](https://groq.com)
2. Create an API key
3. Add the key to your `.env.local` file

## Project Structure

```
Syntheon-AI/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Main dashboard page
│   └── ...                # Other app pages
├── components/             # React components
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── meeting-cards.tsx  # Meeting display cards
│   └── ...                # UI components
├── lib/                   # Utility libraries
│   ├── deepgram.ts        # Deepgram transcription service
│   ├── db.ts              # Database utilities
│   └── ...                # Other utilities
├── syntheon-extension/    # Browser extension
│   ├── manifest.json      # Extension configuration
│   ├── content.js         # Meeting platform integration
│   ├── background.js      # Background service worker
│   ├── popup/             # Extension popup UI
│   └── icons/             # Extension icons
├── recordings/            # Local audio storage
├── public/                # Static assets
└── styles/                # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Notes

### Browser Extension Development
- The extension uses Manifest V3 for modern Chrome compatibility
- Content scripts are injected into meeting platforms to capture audio
- Background service worker handles communication with the web app

### Audio Processing
- Recordings are stored locally in the `recordings/` directory
- Deepgram provides real-time transcription with speaker diarization
- Audio files are processed asynchronously to avoid blocking the UI

### Data Flow
1. Extension captures audio from meeting platforms
2. Audio is sent to Deepgram for transcription
3. Transcripts are processed by Groq for spec extraction
4. Results are stored and displayed in the web application

## Troubleshooting

### Common Issues

**Extension not loading**
- Ensure Developer mode is enabled in Chrome
- Check that the extension path is correct
- Verify manifest.json syntax

**Transcription not working**
- Check DEEPGRAM_API_KEY is valid and in .env.local
- Verify Deepgram API quota and usage limits
- Ensure audio files are being saved correctly

**Connection issues between extension and web app**
- Make sure both are running on localhost:3000
- Check CORS settings in Next.js configuration
- Verify extension permissions in manifest.json

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Deepgram](https://deepgram.com) for speech-to-text API
- [Groq](https://groq.com) for AI model services
- [Radix UI](https://radix-ui.com) for accessible components
- [TailwindCSS](https://tailwindcss.com) for styling utilities
