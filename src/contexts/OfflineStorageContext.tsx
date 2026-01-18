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

type OfflineStorageContextType = {
  removeFromCache: (id: string) => Promise<void>;
  loadProjectFromCache: (
    id: string
  ) => Promise<SerializedSequencer | undefined>;
  projects: SerializedSequencer[];
  fetchIndexCache: () => Promise<void>;
  migrateLegacyKeys: () => Promise<void>;
  saveProjectToCache: (id: string, data: SerializedSequencer) => Promise<void>;
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
      return await get<SerializedSequencer>(`${CACHE_PREFIX}:${id}`);
    },
    []
  );

  /**
   * Save or update a project
   */
  const saveProjectToCache = useCallback(
    async (id: string, data: SerializedSequencer) => {
      await set(`${CACHE_PREFIX}:${id}`, data);
      await fetchIndexCache();
    },
    []
  );

  /**
   * Remove a project
   */
  const removeFromCache = useCallback(async (id: string) => {
    await del(`${CACHE_PREFIX}:${id}`);
    await fetchIndexCache();
  }, []);

  /**
   * Fetch all projects belonging to this app only
   */
  const fetchIndexCache = useCallback(async () => {
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

  async function migrateLegacyKeys() {
    const all = await entries<string, any>();

    for (const [key, value] of all) {
      if (typeof key !== 'string') continue;

      if (key.startsWith('ER-1:')) {
        const id = key.slice('ER-1:'.length);
        const newKey = `edrums:project:${id}`;

        await set(newKey, value);
        await del(key);
      }
    }
  }

  /**
   * Initial load only
   */

  useEffect(() => {
    migrateLegacyKeys().then(fetchIndexCache);
  }, [fetchIndexCache]);

  return (
    <OfflineStorageContext.Provider
      value={{
        projects,
        loadProjectFromCache,
        saveProjectToCache,
        removeFromCache,
        fetchIndexCache,
        migrateLegacyKeys,
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
