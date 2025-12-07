'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { Container, Typography, Box, Button, Grid, Card, Stack, Paper } from '@mui/material';

interface Document {
    id: number;
    original_filename: string;
    created_at: string;
}

export default function DashboardPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const storedId = localStorage.getItem('socrates_user_id');
        if (storedId) {
            setUserId(storedId);
            loadDocuments(storedId);
        }
    }, []);

    const loadDocuments = async (uid: string) => {
        try {
            const docs = await fetchAPI(`/api/users/${uid}/documents`);
            setDocuments(docs);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !userId) return;
        setUploading(true);

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/${userId}/documents`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');

            await loadDocuments(userId);
            alert('Document uploaded! Reading plan is being generated in background.');
        } catch (error) {
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                    My Library
                </Typography>
                <Button
                    variant="contained"
                    component="label"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                    <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        accept=".pdf,image/*,.txt"
                    />
                </Button>
            </Box>

            <Grid container spacing={3}>
                {documents.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No documents yet. Upload one to start!
                            </Typography>
                        </Paper>
                    </Grid>
                ) : (
                    documents.map((doc) => (
                        <Grid item xs={12} key={doc.id}>
                            <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                                <Box>
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        {doc.original_filename}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        component={Link}
                                        href={`/read/${doc.id}`}
                                        variant="outlined"
                                        color="primary"
                                    >
                                        Read
                                    </Button>
                                    <Button
                                        component={Link}
                                        href={`/summary/${doc.id}`}
                                        variant="outlined"
                                        color="secondary"
                                    >
                                        Summary
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}
