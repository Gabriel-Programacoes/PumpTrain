export interface Exercise {
    id: number;
    name: string;
    description: string | null;
    muscleGroup: string | null;
    exerciseType?: 'strength' | 'cardio' | 'flexibility' | string;
    equipment?: string | null;
}