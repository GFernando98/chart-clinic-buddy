import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAll(),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => userService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del usuario ha sido actualizado',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar estado',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: UserRole[] }) =>
      userService.updateRoles(id, roles),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast({
        title: 'Roles actualizados',
        description: `Los roles de ${updatedUser.fullName} han sido actualizados`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar roles',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
