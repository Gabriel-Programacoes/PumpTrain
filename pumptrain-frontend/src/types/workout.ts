import { Activity } from './activity';

export interface Workout {
    id: string | number;
    sessionDate: string;
    name: string | null;
    completedAt?: string | null;
    // Adicionar outros campos que GET /api/workouts retorna
}

export interface WorkoutDetails extends Workout {
    notes?: string | null;
    activities: Activity[];
    // Adicionar outros campos que GET /api/workouts/{id} retorna
}