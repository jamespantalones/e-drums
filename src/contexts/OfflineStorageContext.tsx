import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { del, get, set, entries } from 'idb-keyval';
import { SerializedSequencer } from '../types';
import { Config } from '../config';

/**
 * Storage keys MUST be app-scoped and path-agnostic.
 * Rewrites virtualize paths; IndexedDB does not.
 */
const CACHE_PREFIX = Config.CACHE_PREFIX;
const LEGACY_PREFIX = Config.LEGACY_CACHE_PREFIX;

function updatedTime(project?: SerializedSequencer) {
  return project ? new Date(project.updatedAt).getTime() || 0 : -1;
}

/**
 * Move projects saved under the legacy `ER-1:` prefix to the current one.
 * When both exist, the more recently updated copy wins.
 */
async function migrateLegacyKeys() {
  const all = await entries<string, SerializedSequencer>();

  for (const [key, legacy] of all) {
    if (typeof key !== 'string' || !key.startsWith(`${LEGACY_PREFIX}:`)) {
      continue;
    }
    const id = key.slice(LEGACY_PREFIX.length + 1);
    const newKey = `${CACHE_PREFIX}:${id}`;
    const current = await get<SerializedSequencer>(newKey);

    if (updatedTime(legacy) >= updatedTime(current)) {
      await set(newKey, legacy);
    }
    await del(key);
  }
}

// runs once per page load; every storage call waits for it so nothing
// reads or writes a key while it's being moved
let migration: Promise<void> | undefined;

function ensureMigrated() {
  if (!migration) {
    migration = migrateLegacyKeys().catch((err) => {
      console.error('Failed to migrate saved projects', err);
    });
  }
  return migration;
}

type OfflineStorageContextType = {
  removeFromCache: (id: string) => Promise<void>;
  loadProjectFromCache: (
    id: string
  ) => Promise<SerializedSequencer | undefined>;
  projects: SerializedSequencer[];
  fetchIndexCache: () => Promise<void>;
  migrateLegacyKeys: () => Promise<void>;
  saveProjectToCache: (id: string, data: SerializedSequencer) => Promise<void>;
  importProjects: (
    projects: SerializedSequencer[]
  ) => Promise<{ imported: number; skipped: number }>;
};

const OfflineStorageContext = createContext<
  OfflineStorageContextType | undefined
>(undefined);

export function OfflineStorageProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<SerializedSequencer[]>([]);

  /**
   * Load a single project by id
   */
  const loadProjectFromCache = useCallback(
    async (id: string): Promise<SerializedSequencer | undefined> => {
      await ensureMigrated();
      return await get<SerializedSequencer>(`${CACHE_PREFIX}:${id}`);
    },
    []
  );

  /**
   * Save or update a project
   */
  const saveProjectToCache = useCallback(
    async (id: string, data: SerializedSequencer) => {
      await ensureMigrated();
      await set(`${CACHE_PREFIX}:${id}`, data);
      await fetchIndexCache();
    },
    []
  );

  /**
   * Store projects from a backup file. A project already saved here is
   * only replaced when the file's copy is newer.
   */
  const importProjects = useCallback(
    async (incoming: SerializedSequencer[]) => {
      await ensureMigrated();
      let imported = 0;

      for (const project of incoming) {
        const key = `${CACHE_PREFIX}:${project.id}`;
        const current = await get<SerializedSequencer>(key);
        if (updatedTime(project) >= updatedTime(current)) {
          await set(key, project);
          imported += 1;
        }
      }

      await fetchIndexCache();
      return { imported, skipped: incoming.length - imported };
    },
    []
  );

  /**
   * Remove a project
   */
  const removeFromCache = useCallback(async (id: string) => {
    await ensureMigrated();
    await del(`${CACHE_PREFIX}:${id}`);
    await fetchIndexCache();
  }, []);

  /**
   * Fetch all projects belonging to this app only
   */
  const fetchIndexCache = useCallback(async () => {
    await ensureMigrated();
    const all = await entries<string, SerializedSequencer>();

    const filtered = all
      .filter(
        ([key]) => typeof key === 'string' && key.startsWith(`${CACHE_PREFIX}:`)
      )
      .map(([, value]) => value)
      .sort((a, b) => {
        const at = new Date(a.updatedAt).getTime();
        const bt = new Date(b.updatedAt).getTime();
        return bt - at;
      });

    setProjects(filtered);
  }, []);

  /**
   * Initial load only
   */

  useEffect(() => {
    fetchIndexCache();
  }, [fetchIndexCache]);

  return (
    <OfflineStorageContext.Provider
      value={{
        projects,
        loadProjectFromCache,
        saveProjectToCache,
        removeFromCache,
        fetchIndexCache,
        importProjects,
        migrateLegacyKeys: ensureMigrated,
      }}
    >
      {children}
    </OfflineStorageContext.Provider>
  );
}

export function useOfflineStorage() {
  const context = useContext(OfflineStorageContext);

  if (!context) {
    throw new Error(
      'useOfflineStorage must be used within an OfflineStorageProvider'
    );
  }

  return context;
}
