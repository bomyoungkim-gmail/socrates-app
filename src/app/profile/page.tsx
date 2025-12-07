'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    SelectChangeEvent
} from '@mui/material';

export default function ProfilePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: '',
        idade: '',
        grau_de_instrucao: '',
        education_year: '',
        profissao: '',
        nacionalidade: '',
        lingua_nativa: 'Português',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData(prev => ({ ...prev, grau_de_instrucao: e.target.value as string }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                idade: parseInt(formData.idade) || 0
            };

            const user = await fetchAPI('/api/profile', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            // Simple auth: store ID in localStorage
            localStorage.setItem('socrates_user_id', user.id.toString());
            router.push('/dashboard');
        } catch (error) {
            alert('Error creating profile: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.default',
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom color="primary.main" fontWeight="bold">
                        Create your Profile
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" paragraph>
                        Tell us a bit about yourself to personalize your learning.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Stack spacing={3}>
                            <TextField
                                name="nome"
                                label="Name"
                                fullWidth
                                required
                                value={formData.nome}
                                onChange={handleChange}
                            />

                            <TextField
                                name="idade"
                                label="Age"
                                type="number"
                                fullWidth
                                required
                                value={formData.idade}
                                onChange={handleChange}
                            />

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <FormControl fullWidth required>
                                    <InputLabel id="education-label">Education Level</InputLabel>
                                    <Select
                                        labelId="education-label"
                                        label="Education Level"
                                        value={formData.grau_de_instrucao}
                                        onChange={handleSelectChange}
                                    >
                                        <MenuItem value="Ensino Fundamental">Ensino Fundamental</MenuItem>
                                        <MenuItem value="Ensino Médio">Ensino Médio</MenuItem>
                                        <MenuItem value="Ensino Superior (Cursando)">Ensino Superior (Cursando)</MenuItem>
                                        <MenuItem value="Ensino Superior (Concluído)">Ensino Superior (Concluído)</MenuItem>
                                        <MenuItem value="Pós-graduação">Pós-graduação</MenuItem>
                                        <MenuItem value="Mestrado">Mestrado</MenuItem>
                                        <MenuItem value="Doutorado">Doutorado</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    name="education_year"
                                    label="Year/Semester"
                                    fullWidth
                                    placeholder="e.g. 3º Ano, 5º Semestre"
                                    value={formData.education_year}
                                    onChange={handleChange}
                                />
                            </Box>

                            <TextField
                                name="profissao"
                                label="Profession"
                                fullWidth
                                required
                                value={formData.profissao}
                                onChange={handleChange}
                            />

                            <TextField
                                name="nacionalidade"
                                label="Nationality"
                                fullWidth
                                required
                                value={formData.nacionalidade}
                                onChange={handleChange}
                            />

                            <TextField
                                name="lingua_nativa"
                                label="Native Language"
                                fullWidth
                                required
                                value={formData.lingua_nativa}
                                onChange={handleChange}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? 'Saving...' : 'Start Learning'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
