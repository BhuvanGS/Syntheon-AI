"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MeetingCards } from "@/components/meeting-cards";
import { SpecBlocksDetail } from "@/components/spec-blocks-detail";
import { Kanban } from "@/components/kanban";
import { AllSpecs } from "@/components/all-specs";
import { Settings } from '@/components/setting';

type ViewType =
  | "dashboard"
  | "meetings"
  | "specs"
  | "kanban"
  | "settings"
  | "spec-detail";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    if (view !== "spec-detail") {
      setSelectedMeeting(null);
    }
  };

  const handleMeetingSelect = (meetingId: string) => {
    setSelectedMeeting(meetingId);
    setCurrentView("spec-detail");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 overflow-hidden">
        {currentView === "dashboard" && (
          <div className="p-8 overflow-auto h-full">
            <div className="max-w-7xl">
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                Dashboard
              </h1>
              <p className="text-muted-foreground mb-8">
                Welcome to your meeting management hub
              </p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} />
            </div>
          </div>
        )}

        {currentView === "meetings" && (
          <div className="p-8 overflow-auto h-full">
            <div className="max-w-7xl">
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                Meetings
              </h1>
              <p className="text-muted-foreground mb-8">
                All your recorded meetings
              </p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} />
            </div>
          </div>
        )}

        {currentView === "spec-detail" && selectedMeeting && (
          <div className="p-8 overflow-auto h-full">
            <button
              onClick={() => setCurrentView("meetings")}
              className="mb-6 text-primary hover:text-accent transition-colors font-medium"
            >
              ← Back to Meetings
            </button>
            <SpecBlocksDetail meetingId={selectedMeeting} />
          </div>
        )}

        {currentView === "specs" && (
          <div className="p-8 overflow-auto h-full">
            <div className="max-w-7xl">
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                Spec Blocks
              </h1>
              <p className="text-muted-foreground mb-8">
                All extracted specifications across every meeting
              </p>
              <AllSpecs onSelectMeeting={handleMeetingSelect} />
            </div>
          </div>
        )}

        {currentView === "kanban" && (
          <div className="p-8 overflow-auto h-full">
            <div className="max-w-7xl">
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                Kanban
              </h1>
              <p className="text-muted-foreground mb-8">
                Track your meetings through the pipeline
              </p>
              <Kanban onSelectMeeting={handleMeetingSelect} />
            </div>
          </div>
        )}

        {currentView === 'settings' && (
  <div className="p-8 overflow-auto h-full">
    <div className="max-w-7xl">
      <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Configure your Syntheon workspace</p>
      <Settings />
    </div>
  </div>
)}
      </main>
    </div>
  );
}
