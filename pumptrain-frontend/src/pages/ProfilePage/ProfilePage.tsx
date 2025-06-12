import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

// Imports MUI e Icons
import {
    Box, Typography, Grid, Card, CardContent, Avatar, Button,
    TextField, Stack, Tabs, Tab,
    CircularProgress, Alert, Container,
    IconButton, useTheme,
    DialogTitle, DialogContent,
    Dialog,
    Tooltip,
    DialogActions
} from "@mui/material";
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PhotoCamera as ChangeAvatarIcon
} from "@mui/icons-material";

// Hooks e Tipos
import { useUserProfileQuery } from '../../hooks/useUserProfileQuery';
import { useUpdateUserProfileMutation } from '../../hooks/useUpdateUserProfileMutation';
import { User } from '../../types/user';
import {parseNumericInput} from "../../utils/formUtils.ts";

// Utils
import { getInitials } from '../../utils/uiHelpers';
import { PREDEFINED_AVATARS, getAvatarPath } from '../../utils/avatarUtils';


// Componentes/Funções Auxiliares
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel(props: TabPanelProps) { const { children, value, index, ...other } = props; return (<div role="tabpanel" hidden={value !== index} {...other}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>); }
function a11yProps(index: number) { return { id: `profile-tab-${index}`, "aria-controls": `profile-tabpanel-${index}` }; }

// Tipo para os dados do formulário
type ProfileFormData = {
    name: string;
    email: string;
    age: string;
    height: string;
    weight: string;
};

const ProfilePage: React.FC = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const [tempSelectedAvatarKey, setTempSelectedAvatarKey] = useState<string | null | undefined>(null);
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

    const { data: userProfile, isLoading, isError, error } = useUserProfileQuery();
    const updateProfileMutation = useUpdateUserProfileMutation();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
        defaultValues: { name: '', email: '', age: '', height: '', weight: '' }
    });

    // Efeito para preencher/resetar
    useEffect(() => {
        if (userProfile) {
            const formData: Partial<ProfileFormData> = {
                name: userProfile.name ?? '', email: userProfile.email ?? '',
                age: userProfile.age?.toString() ?? '', height: userProfile.height?.toString() ?? '',
                weight: userProfile.weight?.toString() ?? '',
            };
            reset(formData);
            setTempSelectedAvatarKey(userProfile.avatarKey);
        }
    }, [userProfile, reset]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

    const handleEditToggle = () => {
        const newIsEditing = !isEditing;
        setIsEditing(newIsEditing);
        if (!newIsEditing && userProfile) { // Se saiu do modo de edição (clicou em Cancelar principal)
            setTempSelectedAvatarKey(userProfile.avatarKey); // Restaura o avatar para o original do perfil
            // O reset do formulário já é tratado pelo useEffect acima ao userProfile mudar ou no primeiro load
            reset({
                name: userProfile.name ?? '',
                email: userProfile.email ?? '',
                age: userProfile.age?.toString() ?? '',
                height: userProfile.height?.toString() ?? '',
                weight: userProfile.weight?.toString() ?? '',
            });
        }
    };

    const handleOpenAvatarDialog = () => {
        if (isEditing) {
            setAvatarDialogOpen(true);
        }
    };

    const handleAvatarClickInDialog = (key: string) => {
        setTempSelectedAvatarKey(key); // Atualiza a seleção para preview no dialog e para confirmação
    };

    const handleConfirmAvatarSelection = () => {
        setAvatarDialogOpen(false); // tempSelectedAvatarKey já está com o valor escolhido
    };

    const handleCancelAvatarSelection = () => {
        // Reverte tempSelectedAvatarKey para o valor original do perfil ANTES de fechar o dialog.
        if (userProfile) { // Certifique-se de que userProfile está acessível e definido
            setTempSelectedAvatarKey(userProfile.avatarKey);
        }
        setAvatarDialogOpen(false);
    };

    // Função para salvar
    const handleSaveSubmit: SubmitHandler<ProfileFormData> = (formData) => {
        // console.log("Dados VALIDADOS do form (strings) para SALVAR:", formData);
        const payload: Partial<Omit<User, 'id'>> = {
            name: formData.name, email: formData.email,
            age: parseNumericInput(formData.age),
            height: parseNumericInput(formData.height),
            weight: parseNumericInput(formData.weight, true),
            avatarKey: tempSelectedAvatarKey,
        };
        // console.log("Payload formatado para mutação:", payload);
        updateProfileMutation.mutate(payload, {
            onSuccess: (updatedUser) => {
                console.log("Perfil atualizado com sucesso:", updatedUser);
                setIsEditing(false);
            },
        });
    };

    // --- Renderização ---
    if (isLoading) return <Container maxWidth="lg"><CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} /></Container>;
    if (isError) return <Container maxWidth="lg"><Alert severity="error">Erro ao carregar perfil: {error instanceof Error ? error.message : 'Erro desconhecido'}</Alert></Container>;
    if (!userProfile) return <Container maxWidth="lg"><Alert severity="warning">Não foi possível carregar os dados do perfil.</Alert></Container>;


    const avatarToDisplayPath = getAvatarPath(tempSelectedAvatarKey);
    const initials = getInitials(userProfile.name);

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", py: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}> Perfil do Usuário </Typography>
                <Typography variant="body2" color="text.secondary"> Gerencie suas informações pessoais e foto de perfil. </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ mb: 3, position: 'relative' }}>
                        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
                            <Box sx={{ position: 'relative', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: 'primary.dark',
                                        fontSize: '3rem',
                                        cursor: isEditing ? 'pointer' : 'default',
                                        border: isEditing ? `2px dashed ${theme.palette.primary.main}` : 'none'
                                    }}
                                    src={avatarToDisplayPath}
                                    onClick={handleOpenAvatarDialog}
                                >
                                    {!avatarToDisplayPath ? initials : null}
                                </Avatar>
                                {isEditing && (
                                    <Tooltip title="Mudar avatar">
                                        <IconButton
                                            onClick={handleOpenAvatarDialog}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                bgcolor: 'rgba(0,0,0,0.6)',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                                border: `1px solid ${theme.palette.divider}`
                                            }}
                                        >
                                            <ChangeAvatarIcon fontSize="small" sx={{color: 'white'}}/>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>

                            <Typography variant="h5" fontWeight="bold" sx={{ textAlign: 'center' }}>{userProfile.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>{userProfile.email}</Typography>

                            {!isEditing && (
                                <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={handleEditToggle}>
                                    Editar Perfil
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined">
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                                <Tab label="Informações Pessoais" {...a11yProps(0)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0}>
                            <Box sx={{ p: { xs: 2, md: 3 } }}>
                                {isEditing ? (
                                    <Box component="form" onSubmit={handleSubmit(handleSaveSubmit)}>
                                        <Grid container spacing={2.5}>
                                            {/* Campos do formulário como antes (name, email, age, height, weight) */}
                                            <Grid size={{ xs: 12, sm: 6 }}> <Controller name="name" control={control} rules={{ required: 'Nome é obrigatório' }} render={({ field }) => (<TextField fullWidth label="Nome completo" {...field} error={!!errors.name} helperText={errors.name?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}> <Controller name="email" control={control} rules={{ required: 'Email é obrigatório', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' } }} render={({ field }) => (<TextField fullWidth label="Email" {...field} error={!!errors.email} helperText={errors.email?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Controller name="age" control={control} rules={{ pattern: { value: /^\d*$/, message: 'Idade inválida' }, min: {value: 10, message: 'Idade mínima: 10'}, max: {value: 120, message: 'Idade máxima: 120'} }} render={({ field }) => (<TextField fullWidth label="Idade" type="number" {...field} error={!!errors.age} helperText={errors.age?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Controller name="height" control={control} rules={{ pattern: { value: /^\d*$/, message: 'Altura inválida (só números)' }, min: {value: 50, message: 'Altura mínima: 50cm'}, max: {value: 250, message: 'Altura máxima: 250cm'} }} render={({ field }) => (<TextField fullWidth label="Altura (cm)" type="number" {...field} error={!!errors.height} helperText={errors.height?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Controller name="weight" control={control} rules={{ pattern: { value: /^\d*([.,]\d{1,2})?$/, message: 'Peso inválido (ex: 75 ou 75.5)' }, min: {value: 20, message: 'Peso mínimo: 20kg'}, max: {value: 300, message: 'Peso máximo: 300kg'} }} render={({ field }) => (<TextField fullWidth label="Peso (kg)" type="text" inputMode="decimal" {...field} error={!!errors.weight} helperText={errors.weight?.message}
                                                                                                                                                                                                                                                                                                                                                              onChange={(e) => field.onChange(e.target.value.replace(',', '.'))}
                                            />)} /> </Grid>
                                            <Grid size={12}>
                                                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                                                    <Button variant="outlined" color="inherit" startIcon={<CancelIcon />} onClick={handleEditToggle} disabled={updateProfileMutation.isPending}> Cancelar </Button>
                                                    <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={updateProfileMutation.isPending}>
                                                        {updateProfileMutation.isPending ? <CircularProgress size={24} color="inherit"/> : 'Salvar Alterações'}
                                                    </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    // Visualização dos dados como antes
                                    <Box>
                                        <Grid container spacing={3} sx={{ pt: 1 }}>
                                            <Grid size={{ xs: 12, sm: 6 }}> <Typography variant="subtitle2" color="text.secondary">Nome</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.name || '-'}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}> <Typography variant="subtitle2" color="text.secondary">Email</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.email || '-'}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Typography variant="subtitle2" color="text.secondary">Idade</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.age ?? '-'}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Typography variant="subtitle2" color="text.secondary">Altura</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.height ? `${userProfile.height} cm` : '-'}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Typography variant="subtitle2" color="text.secondary">Peso</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.weight ? `${userProfile.weight} kg` : '-'}</Typography> </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog para Seleção de Avatar */}
            <Dialog open={avatarDialogOpen} onClose={handleCancelAvatarSelection} maxWidth="xs" fullWidth>
                <DialogTitle>Escolha seu novo avatar</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt:1 }}>
                        <Avatar
                            src={getAvatarPath(tempSelectedAvatarKey)} // Preview do avatar atualmente selecionado no dialog
                            sx={{ width: 100, height: 100, bgcolor: 'primary.dark', fontSize: '2.5rem' }}
                        >
                            {!getAvatarPath(tempSelectedAvatarKey) ? getInitials(userProfile.name) : null}
                        </Avatar>
                    </Box>
                    <Grid container spacing={2} justifyContent="center">
                        {PREDEFINED_AVATARS.map((avatarOpt) => (
                            <Grid size="auto" key={avatarOpt.key}>
                                <Tooltip title={avatarOpt.name} placement="top">
                                    <IconButton
                                        onClick={() => handleAvatarClickInDialog(avatarOpt.key)}
                                        sx={{
                                            padding: '4px',
                                            border: tempSelectedAvatarKey === avatarOpt.key
                                                ? `3px solid ${theme.palette.primary.main}`
                                                : `3px solid ${theme.palette.background.paper}`, // Borda da cor do fundo para manter o tamanho
                                            borderRadius: '50%',
                                            transition: 'border 0.2s ease-in-out',
                                            backgroundColor: theme.palette.action.hover, // Fundo sutil
                                            '&:hover': {
                                                borderColor: theme.palette.primary.light,
                                            }
                                        }}
                                    >
                                        <Avatar src={avatarOpt.path} alt={avatarOpt.name} sx={{ width: 60, height: 60 }} />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p:2 }}>
                    <Button onClick={handleCancelAvatarSelection} color="inherit">Cancelar</Button>
                    <Button onClick={handleConfirmAvatarSelection} variant="contained">Confirmar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;