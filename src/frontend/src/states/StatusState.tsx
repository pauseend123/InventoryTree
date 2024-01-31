import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { api } from '../App';
import { StatusCodeListInterface } from '../components/render/StatusRenderer';
import { statusCodeList } from '../defaults/backendMappings';
import { ApiEndpoints } from '../enums/ApiEndpoints';
import { ModelType } from '../enums/ModelType';
import { apiUrl } from './ApiState';
import { useSessionState } from './SessionState';

type StatusLookup = Record<ModelType | string, StatusCodeListInterface>;

interface ServerStateProps {
  status?: StatusLookup;
  setStatus: (newStatus: StatusLookup) => void;
  fetchStatus: () => void;
}

export const useGlobalStatusState = create<ServerStateProps>()(
  persist(
    (set) => ({
      status: undefined,
      setStatus: (newStatus: StatusLookup) => set({ status: newStatus }),
      fetchStatus: async () => {
        // Fetch status data for rendering labels
        console.log('fetchGlobalState:', useSessionState.getState().hasToken());
        if (!useSessionState.getState().hasToken()) {
          return;
        }

        await api
          .get(apiUrl(ApiEndpoints.global_status))
          .then((response) => {
            const newStatusLookup: StatusLookup = {} as StatusLookup;
            for (const key in response.data) {
              newStatusLookup[statusCodeList[key] || key] =
                response.data[key].values;
            }
            set({ status: newStatusLookup });
          })
          .catch(() => {
            console.error('Error fetching global status information');
          });
      }
    }),
    {
      name: 'global-status-state',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
