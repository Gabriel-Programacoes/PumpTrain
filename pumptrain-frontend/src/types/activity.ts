export interface Activity {

    // Geral
    id: string | number; // O ID da própria atividade/registro
    exerciseId: string | number; // O ID do exercício (da lista de exercícios disponíveis)
    exerciseName: string; // O nome do exercício (pode vir do backend ou ser buscado depois)
    notes?: string | null;
    exerciseType?: string;

    // Força
    sets?: number | null; // Número de séries (opcional ou nulo)
    repetitions?: number | null; // Número de repetições (opcional ou nulo)
    weightKg?: number | null; // Peso utilizado (opcional ou nulo)

    durationMinutes?: number | null;   // Duração em minutos
    distanceKm?: number | null;        // Distância em KM
    intensity?: number | null;    // <-- NOVO NOME
    incline?: number | null;      // <-- NOVO NOME

    // Adicionar MAIS CAMPOS conforme o que a API ou a lista dentro do treino retorna
}