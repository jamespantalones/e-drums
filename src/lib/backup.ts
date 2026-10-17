import { Config } from '../config';
import { SerializedSequencer } from '../types';

/**
 * Projects as a downloadable file, so they outlive cleared browser storage.
 * Import also takes a bare project or an array of them.
 */
export type Backup = {
  app: 'edrums';
  version: 1;
  exportedAt: string;
  projects: SerializedSequencer[];
};

// ids end up in URLs and storage keys
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function toBackup(projects: SerializedSequencer[]): Backup {
  return {
    app: 'edrums',
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
  };
}

function toProject(value: unknown): SerializedSequencer | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Partial<SerializedSequencer>;

  if (typeof p.id !== 'string' || !SAFE_ID.test(p.id)) return null;
  if (!p.state || !Array.isArray(p.state.tracks)) return null;

  const now = new Date().toISOString();
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback;

  return {
    ...p,
    id: p.id,
    name: typeof p.name === 'string' ? p.name : p.id,
    bpm: num(p.bpm, Config.DEFAULT_BPM),
    swing: num(p.swing, 0),
    reverb: num(p.reverb, 0),
    delay: num(p.delay, 0),
    volume: num(p.volume, Config.DEFAULT_VOLUME),
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : now,
    state: { ...p.state, rhythmIndex: num(p.state.rhythmIndex, -1) },
  };
}

/** Projects found in a backup file; throws when there are none */
export function parseBackup(text: string): SerializedSequencer[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'projects' in data
      ? (data as Backup).projects
      : [data];

  const projects = (Array.isArray(list) ? list : [])
    .map(toProject)
    .filter((p): p is SerializedSequencer => p !== null);

  if (!projects.length) {
    throw new Error('No e-drums sequences found in that file.');
  }
  return projects;
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // give the download a moment to start before freeing the blob
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A filename-safe slug, e.g. for "Late Night Groove" */
export function slug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'sequence'
  );
}
