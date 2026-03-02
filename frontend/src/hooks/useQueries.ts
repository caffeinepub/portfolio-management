import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, MonthlySnapshot } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetPortfolio() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPortfolio();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGetDashboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboard();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMonthlySnapshots() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MonthlySnapshot[]>({
    queryKey: ['monthlySnapshots'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMonthlySnapshots();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSaveMonthlySnapshot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (snapshot: MonthlySnapshot) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveMonthlySnapshot(snapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySnapshots'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
