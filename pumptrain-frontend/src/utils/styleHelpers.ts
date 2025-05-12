// Tipo para a raridade, para garantir consistência
export type AchievementRarity = "comum" | "raro" | "épico" | "lendário";

/**
 * Retorna uma cor hexadecimal baseada na raridade da conquista.
 * @param rarity A raridade da conquista.
 * @returns Uma string de cor hexadecimal.
 */
export const getRarityColor = (rarity: AchievementRarity | string): string => {
    // O parâmetro pode ser o tipo estrito ou uma string genérica para flexibilidade
    switch (rarity) {
        case "comum":
            return "rgba(200, 200, 200, 0.8)"; // Um cinza claro, por exemplo
        case "raro":
            // Poderia usar theme.palette.primary.main se o tema fosse passado ou importado
            return "#77cc88"; // Sua cor primária (verde esmeralda)
        case "épico":
            return "#9c27b0"; // Um roxo do MUI, por exemplo
        case "lendário":
            return "#ffc107"; // Um amarelo/dourado do MUI, por exemplo
        default:
            return "rgba(200, 200, 200, 0.7)"; // Fallback
    }
};

// Você pode adicionar outras funções auxiliares de estilo aqui no futuro.