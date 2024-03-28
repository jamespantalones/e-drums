import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { del, get, set, values } from 'idb-keyval';
import { Config } from '../config';
import { SerializedSequencer } from '../types';
import { useRouter } from 'next/router';

const OfflineStorageContext = createContext<
  | {
      removeFromCache: (id: string) => Promise<void>;
      loadProjectFromCache: (
        id: string
      ) => Promise<SerializedSequencer | undefined>;
      projects: SerializedSequencer[];
      fetchIndexCache: () => void;
      saveProjectToCache: (id: string, data: any) => Promise<void>;
    }
  | undefined
>(undefined);

export function OfflineStorageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [projects, setProjects] = useState<SerializedSequencer[]>([]);

  async function loadProjectFromCache(
    id: string
  ): Promise<SerializedSequencer | undefined> {
    const val = await get<SerializedSequencer>(`${Config.CACHE_PREFIX}/${id}`);

    return val;
  }

  async function saveProjectToCache(id: string, data: SerializedSequencer) {
    await set(`${Config.CACHE_PREFIX}/${id}`, data);
  }

  async function removeFromCache(id: string) {
    // delete item
    await del(`${Config.CACHE_PREFIX}/${id}`);
  }

  const retrieveIndexCache = useCallback(async (): Promise<
    SerializedSequencer[]
  > => {
    return await values<SerializedSequencer>();
  }, []);

  const fetchIndexCache = useCallback(async () => {
    retrieveIndexCache().then((cache) => {
      if (cache) {
        setProjects(cache);
      }
    });
  }, [retrieveIndexCache]);

  useEffect(() => {
    fetchIndexCache();
  }, [fetchIndexCache, router.asPath]);

  return (
    <OfflineStorageContext.Provider
      value={{
        projects,
        loadProjectFromCache,
        saveProjectToCache,
        removeFromCache,
        fetchIndexCache,
      }}
    >
      {children}
    </OfflineStorageContext.Provider>
  );
}
export function useOfflineStorage() {
  const context = useContext(OfflineStorageContext);
  if (context === undefined) {
    throw new Error(
      `useOfflineStorage must be used within an OfflineStorageProvider`
    );
  }

  return context;
}
