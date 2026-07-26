export interface Badge {
  id: string;
  protectedAreaId: string;
  name: string;
  description: string;
  message: string;
  imageUrl: string;
  createdAt: string;
}

export interface FindBadgesParams {
  protectedAreaId: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

/**
 * Resultado de revisar el avance de un área: `justUnlocked` solo trae las
 * insignias otorgadas en esta llamada (para disparar el confeti una sola
 * vez), `earnedBadges` siempre trae todas las que el estudiante ya tiene
 * para esa área.
 */
export interface BadgeAwardResult {
  completed: boolean;
  justUnlocked: Badge[];
  earnedBadges: Badge[];
}
