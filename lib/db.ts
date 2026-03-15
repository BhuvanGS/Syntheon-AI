// lib/db.ts
import fs from "fs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "db.json");

// ─── Types ─────────────────────────────────────────────────────
export interface Meeting {
  id:            string;
  projectName:   string;
  meetingId:     string;
  platform:      string;
  transcript:    string;
  specsDetected: number;
  status:        "completed" | "processing" | "failed";
  date:          string;
  filePath:      string;
  botId?:        string;
  branchName?:   string;
  deployUrl?:    string;
}

export interface SpecBlock {
  id:         string;
  title:      string;
  type:       "feature" | "idea" | "constraint" | "improvement";
  confidence: number;
  meeting_id: string;
  timestamp:  string;
}

interface DB {
  meetings: Meeting[];
  specs:    SpecBlock[];
}

// ─── Core ───────────────────────────────────────────────────────
export function loadDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ meetings: [], specs: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function saveDB(data: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── Meetings ───────────────────────────────────────────────────
export function saveMeeting(meeting: Meeting): void {
  const db = loadDB();
  db.meetings.unshift(meeting);
  saveDB(db);
}

export function getMeetings(): Meeting[] {
  return loadDB().meetings;
}

export function getMeetingById(id: string): Meeting | undefined {
  return loadDB().meetings.find(m => m.id === id);
}

export function updateMeetingStatus(
  id:     string,
  status: Meeting["status"]
): void {
  const db      = loadDB();
  const meeting = db.meetings.find(m => m.id === id);
  if (meeting) {
    meeting.status = status;
    saveDB(db);
  }
}

export function updateMeetingSpecs(
  id:            string,
  transcript:    string,
  specsDetected: number
): void {
  const db      = loadDB();
  const meeting = db.meetings.find(m => m.id === id);
  if (meeting) {
    meeting.transcript    = transcript;
    meeting.specsDetected = specsDetected;
    meeting.status        = "completed";
    saveDB(db);
  }
}

export function updateMeetingBranch(id: string, branchName: string): void {
  const db      = loadDB();
  const meeting = db.meetings.find(m => m.id === id);
  if (meeting) {
    meeting.branchName = branchName;
    saveDB(db);
  }
}

export function updateMeetingDeployUrl(id: string, deployUrl: string): void {
  const db      = loadDB();
  const meeting = db.meetings.find(m => m.id === id);
  if (meeting) {
    meeting.deployUrl = deployUrl;
    saveDB(db);
  }
}

// ─── Specs ──────────────────────────────────────────────────────
export function saveSpecs(specs: SpecBlock[]): void {
  const db = loadDB();
  db.specs.push(...specs);
  saveDB(db);
}

export function getSpecsByMeetingId(meetingId: string): SpecBlock[] {
  return loadDB().specs.filter(s => s.meeting_id === meetingId);
}