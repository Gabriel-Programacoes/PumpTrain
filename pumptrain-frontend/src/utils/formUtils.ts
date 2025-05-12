/**
 * Converte uma string (geralmente de um input) para número ou null.
 * Trata strings vazias e não numéricas como null.
 * @param value O valor a ser convertido (string, number, null, ou undefined).
 * @param allowFloat Se true, usa parseFloat; senão, usa parseInt.
 * @returns Um número ou null.
 */
export const parseNumericInput = (
    value: string | number | null | undefined,
    allowFloat = false
): number | null => {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'number') {
        return isNaN(value) ? null : value; // Retorna o número se já for, ou null se for NaN
    }
    // Se for string
    if (value.trim() === '') {
        return null; // Trata string vazia ou só espaços como null
    }
    const number = allowFloat ? parseFloat(value) : parseInt(value, 10);
    return isNaN(number) ? null : number; // Retorna null se não for um número válido
};