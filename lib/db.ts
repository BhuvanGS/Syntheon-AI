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
  projectId?:    string; // ← links meeting to a project
}

export interface SpecBlock {
  id:            string;
  title:         string;
  type:          "feature" | "idea" | "constraint" | "improvement";
  confidence:    number;
  meeting_id:    string;
  timestamp:     string;
  note?:         string;
  projectId?:    string; // ← links spec to a project
  parentSpecId?: string; // ← links follow-up spec to original
}

export interface Project {
  id:          string;
  name:        string;
  repo:        string;           // e.g. "BhuvanGS/Syntheon-test"
  deployUrl?:  string;           // live URL
  branchBase:  string;           // branch all follow-ups are based on (main)
  meetings:    string[];         // ordered list of meeting IDs
  specIds:     string[];         // all spec IDs across all meetings
  files:       string[];         // all files committed so far
  context:     string;           // summary of what this project is
  createdAt:   string;
  updatedAt:   string;
}

interface DB {
  meetings: Meeting[];
  specs:    SpecBlock[];
  projects: Project[];
}

// ─── Core ───────────────────────────────────────────────────────
export function loadDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ meetings: [], specs: [], projects: [] }, null, 2)
    );
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  // Migrate old db.json that doesn't have projects
  if (!data.projects) data.projects = [];
  return data;
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

export function updateMeetingStatus(id: string, status: Meeting["status"]): void {
  const db      = loadDB();
  const meeting = db.meetings.find(m => m.id === id);
  if (meeting) { meeting.status = status; saveDB(db); }
}

export function updateMeetingSpecs(id: string, transcript: string, specsDetected: number): void {
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
  if (meeting) { meeting.branchName = branchName; saveDB(db); }
}

export function updateMeetingDeployUrl(id: string, deployUrl: string): void {
  const db      = loadDB();
  const meeting = db.meetings.find(m => m.id === id);
  if (meeting) { meeting.deployUrl = deployUrl; saveDB(db); }
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

export function getSpecsByProjectId(projectId: string): SpecBlock[] {
  return loadDB().specs.filter(s => s.projectId === projectId);
}

// ─── Projects ───────────────────────────────────────────────────
export function saveProject(project: Project): void {
  const db = loadDB();
  db.projects.unshift(project);
  saveDB(db);
}

export function getProjects(): Project[] {
  return loadDB().projects;
}

export function getProjectById(id: string): Project | undefined {
  return loadDB().projects.find(p => p.id === id);
}

export function getProjectByMeetingId(meetingId: string): Project | undefined {
  return loadDB().projects.find(p => p.meetings.includes(meetingId));
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const db      = loadDB();
  const project = db.projects.find(p => p.id === id);
  if (project) {
    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    saveDB(db);
  }
}

export function addMeetingToProject(projectId: string, meetingId: string): void {
  const db      = loadDB();
  const project = db.projects.find(p => p.id === projectId);
  if (project && !project.meetings.includes(meetingId)) {
    project.meetings.push(meetingId);
    project.updatedAt = new Date().toISOString();
    saveDB(db);
  }
}

export function addSpecsToProject(projectId: string, specIds: string[]): void {
  const db      = loadDB();
  const project = db.projects.find(p => p.id === projectId);
  if (project) {
    project.specIds = [...new Set([...project.specIds, ...specIds])];
    project.updatedAt = new Date().toISOString();
    saveDB(db);
  }
}

export function addFilesToProject(projectId: string, files: string[]): void {
  const db      = loadDB();
  const project = db.projects.find(p => p.id === projectId);
  if (project) {
    project.files = [...new Set([...project.files, ...files])];
    project.updatedAt = new Date().toISOString();
    saveDB(db);
  }
}