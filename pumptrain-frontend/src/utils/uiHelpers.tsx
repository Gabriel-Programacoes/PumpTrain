import React, { ReactNode } from 'react';
import {Box, Card, Chip, Paper} from '@mui/material';
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
    Celebration as CelebrationIcon,
    // Adicione outros ícones que você usa aqui
} from "@mui/icons-material";
import {alpha, styled} from "@mui/material/styles";

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

export const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: "#0a0b14",
    borderRadius: theme.spacing(1),
    border: "1px solid rgba(119, 204, 136, 0.1)",
    color: "#fffffc",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    position: "relative",
    overflow: "hidden",
    "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        background: "linear-gradient(90deg, #77cc88 0%, rgba(119, 204, 136, 0.3) 100%)",
    },
}));

export const ActivityCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: "#0a0b14",
    border: "1px solid rgba(119, 204, 136, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        borderColor: "rgba(119, 204, 136, 0.3)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
}))

export const StyledChip = styled(Chip)<{ chipType?: 'strength' | 'cardio' | string | undefined }>(({chipType }) => {
    let color = "#77cc88"
    if (chipType === 'strength') color = "#cc7777";
    else if (chipType === 'cardio') color = "#77aabb";

    return {
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: "medium",
        border: `1px solid ${color}40`,
    }
})

export const PageHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "flex-start",
        gap: theme.spacing(2),
    },
}));

export const HeaderTitle = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
}));

export const HeaderActions = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
        width: "100%",
        justifyContent: "space-between",
    },
}));

export const DateChip = styled(Chip)(() => ({ // Adicionado theme para consistência, embora não usado aqui
    backgroundColor: "rgba(255, 255, 252, 0.05)",
    color: "#fffffc",
    border: "1px solid rgba(255, 255, 252, 0.1)",
    fontWeight: "medium",
}));


export const ActivityEntryBox = styled(Box)(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1.5),
}));

export const StyledChipDetail = styled(Chip)(({ theme }) => ({
    height: 'auto',
    '& .MuiChip-label': {
        paddingTop: '2px',
        paddingBottom: '2px',
        fontSize: '0.75rem'
    },
    '& .MuiChip-icon': {
        marginLeft: '8px',
        marginRight: '-4px',
        fontSize: '1rem',
    },
    borderColor: alpha(theme.palette.primary.main, 0.4),
    color: alpha(theme.palette.text.primary, 0.9),
    backgroundColor: alpha(theme.palette.primary.main, 0.05)
}));