import dayjs from 'dayjs';

/**
 * Formata uma string de data ou um objeto Date/Dayjs.
 * @param d A data a ser formatada.
 * @param formatPattern O padrão de formatação (default: 'DD/MM/YYYY').
 * @returns A data formatada ou 'N/A' se a data for inválida.
 */
export const formatDate = (
    d: string | null | undefined | Date | dayjs.Dayjs,
    formatPattern: string = 'DD/MM/YYYY'
): string => {
    if (!d) return 'N/A';
    try {
        const date = dayjs(d); // dayjs lida com string, Date, ou Dayjs
        return date.isValid() ? date.format(formatPattern) : 'Data Inválida';
    } catch (e) {
        console.error("Erro ao formatar data:", d, e);
        return 'Erro Data';
    }
};

/**
 * Formata um total de minutos para o formato "Xh Ym".
 * @param totalMinutes O total de minutos.
 * @returns String formatada (ex: "1h 30m", "45m", "0m").
 */
export const formatTimeMinutes = (totalMinutes: number | undefined | null): string => {
    if (totalMinutes == null || totalMinutes === 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours === 0) result += `${minutes}m`; // Mostra 0m se hours for 0 e minutes for 0
    return result.trim();
};