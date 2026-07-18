export const FAQ_ITEMS = [
  {
    q: 'What is Syntheon Hub?',
    a: 'Syntheon Hub is an AI project manager that joins your meetings, transcribes them, and automatically extracts structured tickets with titles, descriptions, priorities, and labels. It organizes everything onto a Kanban board and maps dependencies — so your team never has to write tickets manually.',
  },
  {
    q: 'What platforms does Syntheon Hub support?',
    a: 'Syntheon Hub works with Google Meet, Zoom, and Microsoft Teams. The bot joins as a participant, records the meeting, and leaves automatically when it ends. No browser extension or installation required.',
  },
  {
    q: 'What counts as a meeting?',
    a: 'A meeting is any call where the Syntheon Hub bot joins and transcribes. Whether it is 5 minutes or 2 hours, it counts as one meeting against your monthly limit.',
  },
  {
    q: 'How does AI ticket extraction work?',
    a: 'After each meeting, Syntheon Hub analyzes the transcript using AI to identify action items, decisions, insights, and blockers. Each becomes a structured ticket with a title, description, priority, type, and estimate. Dependencies between tickets are also mapped automatically.',
  },
  {
    q: 'Do I need any extensions or integrations?',
    a: 'No. Syntheon Hub works entirely in the browser. Just sign up, start a meeting, and the bot joins your call automatically. No Chrome extension, no GitHub connection, no Linear setup — everything is self-contained.',
  },
  {
    q: 'Can I edit the tickets after extraction?',
    a: 'Absolutely. Every ticket is fully editable — title, description, priority, type, estimate, labels, assignee, and column. You stay in complete control. You can also reject tickets before they hit the board.',
  },
  {
    q: 'What is the dependency graph?',
    a: 'The dependency graph visualizes hard and soft blockers between tickets. Syntheon Hub automatically infers dependencies from meeting context, so you know what must ship first before work gets stuck.',
  },
  {
    q: 'What happens if I exceed my meeting limit?',
    a: 'We will notify you when you reach 80% of your limit. Once exceeded, the bot feature pauses until your next billing cycle. You can upgrade anytime to continue.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. Every plan starts with a 7-day free trial. No credit card required to start. If you are not satisfied within 7 days and have processed fewer than 2 meetings, we offer a full refund.',
  },
  {
    q: 'Can I change plans anytime?',
    a: 'Yes. Upgrades take effect immediately (pro-rated). Downgrades take effect at the next billing cycle.',
  },
  {
    q: 'Do you offer annual pricing?',
    a: 'Annual plans with a 20% discount are coming soon. Contact us at support@syntheonhub.com to discuss early access.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay. All prices are in INR inclusive of GST.',
  },
  {
    q: 'Is my meeting data secure?',
    a: 'Audio files are deleted immediately after transcription. We never store raw audio. Transcripts are encrypted at rest and can be deleted by you at any time. We do not read your transcripts manually or use them to train AI models.',
  },
  {
    q: 'Do I need consent from meeting participants?',
    a: 'Yes. You are solely responsible for obtaining consent from all meeting participants before using the Syntheon Hub bot. Recording laws vary by jurisdiction. The bot appears as "Syntheon Hub" in the call, making it clear to everyone that the meeting is being recorded.',
  },
  {
    q: 'Can I use Syntheon Hub for multiple projects?',
    a: 'Yes. Depending on your plan, you can have 1, 5, or unlimited projects. Each project has its own Kanban board, tickets, dependencies, and sprint tracking.',
  },
  {
    q: 'What is sprint tracking?',
    a: 'Sprint tracking shows burndown charts, cycle time, velocity, and milestone progress. Everything updates automatically as your team moves tickets across the board — no manual reporting required.',
  },
] as const;
