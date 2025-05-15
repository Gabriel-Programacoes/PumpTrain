export type AchievementRarity = "comum" | "raro" | "épico" | "lendário";

/**
 * Retorna uma cor hexadecimal baseada na raridade da conquista.
 * @param rarity A raridade da conquista.
 * @returns Uma string de cor hexadecimal.
 */
export const getRarityColor = (rarity: AchievementRarity | string): string => {
    switch (rarity) {
        case "Bronze":
            return "#DC803F";
        case "Prata":
            return "#E7E7E7";
        case "Ouro":
            return "#E1B120";
        case "Diamante":
            return "#13B7DC";
        default:
            return "rgba(200, 200, 200, 0.7)";
    }
};