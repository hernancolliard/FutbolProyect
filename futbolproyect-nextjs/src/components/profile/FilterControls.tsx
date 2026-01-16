'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, InputLabel, Button, Grid, Box } from '@mui/material';

interface FilterControlsProps {
    nacionalidades: string[];
    puestos: string[];
    initialFilters: {
        nacionalidad?: string;
        puesto?: string;
    };
}

export default function FilterControls({ nacionalidades, puestos, initialFilters }: FilterControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState({
        nacionalidad: initialFilters.nacionalidad || '',
        puesto: initialFilters.puesto || '',
    });

    const handleFilterChange = (e: SelectChangeEvent<string>, child?: React.ReactNode) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name as string]: value as string };
        setFilters(newFilters);

        const newParams = new URLSearchParams(searchParams.toString());
        if (value) {
            newParams.set(name as string, value as string);
        } else {
            newParams.delete(name as string);
        }

        startTransition(() => {
            router.push(`?${newParams.toString()}`);
        });
    };

    const clearFilters = () => {
        setFilters({ nacionalidad: '', puesto: '' });
        startTransition(() => {
            router.push('?');
        });
    };

    return (
        <Grid container spacing={2} sx={{ mb: 4 }} component="form">
            <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                    <InputLabel>{t('filter_by_nationality', 'Filtrar por nacionalidad')}</InputLabel>
                    <Select
                        name="nacionalidad"
                        value={filters.nacionalidad}
                        onChange={handleFilterChange}
                        label={t('filter_by_nationality', 'Filtrar por nacionalidad')}
                        disabled={isPending}
                    >
                        <MenuItem value="">
                            <em>{t('all_nationalities', 'Todas')}</em>
                        </MenuItem>
                        {nacionalidades.map(nac => <MenuItem key={nac} value={nac}>{nac}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                    <InputLabel>{t('filter_by_position', 'Filtrar por puesto')}</InputLabel>
                    <Select
                        name="puesto"
                        value={filters.puesto}
                        onChange={handleFilterChange}
                        label={t('filter_by_position', 'Filtrar por puesto')}
                        disabled={isPending}
                    >
                        <MenuItem value="">
                            <em>{t('all_positions', 'Todos')}</em>
                        </MenuItem>
                        {puestos.map(pos => <MenuItem key={pos} value={pos}>{pos}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outlined" onClick={clearFilters} fullWidth disabled={isPending}>
                    {t('clear_filters', 'Limpiar')}
                </Button>
            </Grid>
        </Grid>
    );
}
