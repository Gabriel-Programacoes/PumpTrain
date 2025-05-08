export interface Activity {
    id: string | number; // O ID da própria atividade/registro
    exerciseId: string | number; // O ID do exercício (da lista de exercícios disponíveis)
    exerciseName: string; // O nome do exercício (pode vir do backend ou ser buscado depois)
    sets?: number | null; // Número de séries (opcional ou nulo)
    repetitions?: number | null; // Número de repetições (opcional ou nulo)
    weightKg?: number | null; // Peso utilizado (opcional ou nulo)
    notes?: string | null; // Anotações específicas da atividade (opcional ou nulo)
    // Adicionar MAIS CAMPOS conforme o que a API ou a lista dentro do treino retorna
}