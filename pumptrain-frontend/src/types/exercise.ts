export interface Exercise {
    // O tipo do ID é number se for Long/Integer no Java, ou string se for UUID, etc.
    id: number;

    // Nome geralmente é obrigatório
    name: string;

    // Descrição e Grupo Muscular podem ser opcionais ou nulos
    description: string | null;
    muscleGroup: string | null;

    // Adicionar aqui quaisquer outros campos que API retorna para um exercício:
    // equipment?: string | null;
    // videoUrl?: string | null;
}