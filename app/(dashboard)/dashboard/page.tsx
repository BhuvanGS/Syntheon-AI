'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { MeetingCards } from '@/components/meeting-cards';
import { SpecBlocksDetail } from '@/components/spec-blocks-detail';
import { Kanban } from '@/components/kanban';
import { AllSpecs } from '@/components/all-specs';
import { Settings } from '@/components/setting';

type ViewType = 'dashboard' | 'meetings' | 'specs' | 'kanban' | 'settings' | 'spec-detail';

const pageStyle: React.CSSProperties = {
  padding:    '2rem 2.5rem',
  overflowY:  'auto',
  height:     '100%',
  background: '#faf8f4',
};

const headingStyle: React.CSSProperties = {
  fontFamily:    "'DM Serif Display', serif",
  fontSize:      '2.2rem',
  fontWeight:    '400',
  color:         '#2c2c28',
  marginBottom:  '0.25rem',
};

const subStyle: React.CSSProperties = {
  fontSize:     '14px',
  color:        '#8a8a80',
  fontWeight:   '300',
  marginBottom: '2rem',
  fontFamily:   "'DM Sans', sans-serif",
};

export default function Home() {
  const [currentView, setCurrentView]       = useState<ViewType>('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  function handleViewChange(view: ViewType) {
    setCurrentView(view);
    if (view !== 'spec-detail') setSelectedMeeting(null);
  }

  function handleMeetingSelect(meetingId: string) {
    setSelectedMeeting(meetingId);
    setCurrentView('spec-detail');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#faf8f4' }}>
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{
          height:       '56px',
          borderBottom: '1px solid #e8dfd0',
          background:   '#faf8f4',
          display:      'flex',
          alignItems:   'center',
          padding:      '0 2.5rem',
          justifyContent: 'space-between',
          flexShrink:   0,
        }}>
          <p style={{ fontSize: '13px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            {currentView === 'dashboard'  && 'Overview of your meetings and specs'}
            {currentView === 'meetings'   && 'All your recorded meetings'}
            {currentView === 'specs'      && 'All extracted specifications'}
            {currentView === 'kanban'     && 'Track your pipeline'}
            {currentView === 'settings'   && 'Configure your workspace'}
            {currentView === 'spec-detail' && 'Spec blocks for this meeting'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8aab7e' }} />
            <span style={{ fontSize: '12px', color: '#8aab7e', fontFamily: "'DM Sans', sans-serif" }}>Live</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>

          {currentView === 'dashboard' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Dashboard</h1>
              <p style={subStyle}>Welcome to your meeting management hub</p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'meetings' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Meetings</h1>
              <p style={subStyle}>All your recorded meetings</p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'spec-detail' && selectedMeeting && (
            <div style={pageStyle}>
              <button
                onClick={() => handleViewChange('meetings')}
                style={{
                  background:   'none',
                  border:       'none',
                  cursor:       'pointer',
                  fontSize:     '14px',
                  color:        '#5c7c5d',
                  fontFamily:   "'DM Sans', sans-serif",
                  fontWeight:   '500',
                  marginBottom: '1.5rem',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '6px',
                  padding:      0,
                }}
              >
                ← Back to Meetings
              </button>
              <SpecBlocksDetail meetingId={selectedMeeting} />
            </div>
          )}

          {currentView === 'specs' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Spec Blocks</h1>
              <p style={subStyle}>All extracted specifications across every meeting</p>
              <AllSpecs onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'kanban' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Kanban</h1>
              <p style={subStyle}>Track your meetings through the pipeline</p>
              <Kanban onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'settings' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Settings</h1>
              <p style={subStyle}>Configure your Syntheon workspace</p>
              <Settings />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}