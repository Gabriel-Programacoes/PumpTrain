import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';

// Imports MUI e Icons
import {
    Box, Typography, Grid, Card, CardContent, Avatar, Button,
    TextField, Stack, Tabs, Tab,
    CircularProgress, Alert, Container
} from "@mui/material";
import {
    Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon
} from "@mui/icons-material";

// Hooks e Tipos
import { useUserProfileQuery } from '../../hooks/useUserProfileQuery';
import { useUpdateUserProfileMutation } from '../../hooks/useUpdateUserProfileMutation';
import { User } from '../../types/user';
import {parseNumericInput} from "../../utils/formUtils.ts";

// Componentes/Funções Auxiliares
interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel(props: TabPanelProps) { const { children, value, index, ...other } = props; return (<div role="tabpanel" hidden={value !== index} {...other}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>); }
function a11yProps(index: number) { return { id: `profile-tab-${index}`, "aria-controls": `profile-tabpanel-${index}` }; }
const getInitials = (name: string = ""): string => name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();

// Tipo para os dados do formulário
type ProfileFormData = {
    name: string;
    email: string;
    age: string;
    height: string;
    weight: string;
};

const ProfilePage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

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
        }
    }, [userProfile, isEditing, reset]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
    const handleEditToggle = () => setIsEditing(!isEditing);

    // Função para salvar
    const handleSaveSubmit: SubmitHandler<ProfileFormData> = (formData) => {
        console.log("Dados VALIDADOS do form (strings) para SALVAR:", formData);
        const payload: Partial<Omit<User, 'id'>> = {
            name: formData.name, email: formData.email,
            age: parseNumericInput(formData.age),
            height: parseNumericInput(formData.height),
            weight: parseNumericInput(formData.weight, true),
        };
        console.log("Payload formatado para mutação:", payload);
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

    const userInitials = getInitials(userProfile.name);

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            {/* Cabeçalho */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}> Perfil do Usuário </Typography>
                <Typography variant="body2" color="text.secondary"> Gerencie suas informações pessoais e acompanhe seu progresso </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Coluna Esquerda */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3 }}>
                            <Avatar sx={{ width: 120, height: 120, mb: 2, /*...*/ }} src={userProfile.avatarUrl ?? ''}>
                                {!userProfile.avatarUrl ? userInitials : null}
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold">{userProfile.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{userProfile.email}</Typography>
                            <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={handleEditToggle} sx={{ mb: 2 }}>
                                {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Coluna Direita */}
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
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}> <Controller name="name" control={control} rules={{ required: 'Nome é obrigatório' }} render={({ field }) => (<TextField fullWidth label="Nome" {...field} size="small" error={!!errors.name} helperText={errors.name?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}> <Controller name="email" control={control} rules={{ required: 'Email é obrigatório', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' } }} render={({ field }) => (<TextField fullWidth label="Email" {...field} size="small" error={!!errors.email} helperText={errors.email?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Controller name="age" control={control} rules={{ pattern: { value: /^\d*$/, message: 'Idade inválida' }, min: {value: 10, message: 'Min 10'}, max: {value: 120, message: 'Max 120'} }} render={({ field }) => (<TextField fullWidth label="Idade" type="number" {...field} size="small" error={!!errors.age} helperText={errors.age?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Controller name="height" control={control} rules={{ pattern: { value: /^\d*$/, message: 'Altura inválida (só números)' } }} render={({ field }) => (<TextField fullWidth label="Altura (cm)" type="number" {...field} size="small" error={!!errors.height} helperText={errors.height?.message} />)} /> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Controller name="weight" control={control} rules={{ pattern: { value: /^\d*(\.\d{1,2})?$/, message: 'Peso inválido (ex: 75 ou 75.5)' } }} render={({ field }) => (<TextField fullWidth label="Peso (kg)" type="number" slotProps={{ htmlInput: { step: "0.1" } }} {...field} size="small" error={!!errors.weight} helperText={errors.weight?.message} />)} /> </Grid>
                                            <Grid size={12}> {/* <<< Grid V2 >>> */}
                                                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                                                    <Button variant="outlined" color="inherit" startIcon={<CancelIcon />} onClick={handleEditToggle} disabled={updateProfileMutation.isPending}> Cancelar </Button>
                                                    <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={updateProfileMutation.isPending}>
                                                        {updateProfileMutation.isPending ? <CircularProgress size={24} color="inherit"/> : 'Salvar'}
                                                    </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Grid container spacing={2} sx={{ pt: 1 }}>
                                            {/* <<< Grid V2 >>> */}
                                            <Grid size={{ xs: 12, sm: 6 }}> <Typography variant="body2" color="text.secondary">Nome</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.name}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }}> <Typography variant="body2" color="text.secondary">Email</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.email}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Typography variant="body2" color="text.secondary">Idade</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.age ?? '-'}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Typography variant="body2" color="text.secondary">Altura</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.height ? `${userProfile.height} cm` : '-'}</Typography> </Grid>
                                            <Grid size={{ xs: 12, sm: 4 }}> <Typography variant="body2" color="text.secondary">Peso</Typography> <Typography variant="body1" fontWeight="medium">{userProfile.weight ? `${userProfile.weight} kg` : '-'}</Typography> </Grid>
                                        </Grid>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;