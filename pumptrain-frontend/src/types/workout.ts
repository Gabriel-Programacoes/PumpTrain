import { Activity } from './activity';

export interface Workout {
    id: string | number;
    sessionDate: string;
    name: string | null;
    completedAt?: string | null;
}

export interface WorkoutDetails extends Workout {
    notes?: string | null;
    activities: Activity[];
}