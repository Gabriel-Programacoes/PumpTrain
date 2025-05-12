import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
// Importe os ícones que mapIconNameToComponent pode retornar
import {
    LocalFireDepartment as FireIcon,
    FitnessCenter as DumbbellIcon,
    EmojiEvents as TrophyIcon,
    Whatshot as HotstreakIcon,
    CalendarMonth as CalendarIcon,
    Timer as TimerIcon,
    Bolt as BoltIcon,
    Favorite as HeartIcon,
    Star as StarIcon,
    Lock as LockIcon,
    Share as ShareIcon,
    Celebration as CelebrationIcon,// Ou CalendarMonth
    // Adicione outros ícones que você usa aqui
} from "@mui/icons-material";

/**
 * Gera iniciais a partir de um nome.
 * @param name O nome completo.
 * @returns As duas primeiras iniciais em maiúsculas.
 */
export const getInitials = (name: string = ""): string => {
    if (!name || typeof name !== 'string') return "";
    return name
        .split(' ')
        .map(word => word[0])
        .filter(char => !!char) // Remove undefineds se houver múltiplos espaços
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

/**
 * Mapeia um nome de ícone (string) para o componente MUI Icon correspondente.
 * @param iconName O nome do ícone.
 * @returns Um ReactNode representando o ícone.
 */
export const mapIconNameToComponent = (iconName?: string): ReactNode => {
    switch (iconName) {
        case 'LocalFireDepartment': return <FireIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'FitnessCenter': return <DumbbellIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Star': return <StarIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Trophy': return <TrophyIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'CalendarMonth': return <CalendarIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Whatshot': return <HotstreakIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Timer': return <TimerIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Bolt': return <BoltIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Favorite': return <HeartIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Lock': return <LockIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Celebration': return <CelebrationIcon fontSize='small' sx={{color: 'background.default'}} />;
        case 'Share': return <ShareIcon fontSize='small' sx={{color: 'background.default'}} />;

        // Adicione mais casos aqui para outros ícones que sua API possa retornar
        default: return <StarIcon fontSize='small' sx={{color: 'background.default'}} />; // Ícone padrão
    }
};

/**
 * Props para o componente TabPanel.
 */
export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

/**
 * Componente para renderizar o conteúdo de uma aba do MUI Tabs.
 */
export function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`} // ID mais genérico
            aria-labelledby={`tab-${index}`} // ID mais genérico
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

/**
 * Gera props de acessibilidade para um MUI Tab.
 * @param index O índice da aba.
 */
export function a11yProps(index: number) {
    return {
        id: `tab-${index}`, // ID mais genérico
        "aria-controls": `tabpanel-${index}`, // ID mais genérico
    };
}