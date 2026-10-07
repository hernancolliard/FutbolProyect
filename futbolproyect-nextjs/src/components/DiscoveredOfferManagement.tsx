'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography } from '@mui/material';
import apiClient from '@/lib/apiClient';

type Draft = { contacto_postulacion?: string; titulo: string; descripcion: string; puesto?: string; ubicacion?: string;
  salario?: number | null; horarios?: string; nivel?: string; detalles_adicionales?: string };
type Candidate = { id: number; version: number; draft: Draft; extracted: Record<string, any>; status: string; flags: string[];
  source_url: string; source_urls: string[]; consulted_at: string; updated_at: string; possible_duplicate_ids: number[]; published_offer_id?: number };
type Run = { id: number; status: string; started_at: string; stats: Record<string, number>; errors: string[] };
const fields: [keyof Draft, string][] = [['contacto_postulacion','Contacto o enlace de postulación (obligatorio)'],['titulo','Título'],['descripcion','Resumen en español'],['puesto','Puesto'],
  ['ubicacion','Ubicación'],['nivel','Categoría'],['horarios','Modalidad'],['salario','Salario (importe revisado)'],['detalles_adicionales','Requisitos y postulación']];
const extractedLabels: Record<string,string> = {title:'Título original',role:'Puesto',organization:'Organización',country:'País',city:'Ciudad',
  category:'Categoría',modality:'Modalidad',requirements:'Requisitos',salary:'Salario',currency:'Moneda',benefits:'Beneficios',
  publicationDate:'Fecha de publicación comprobada',closingDate:'Fecha de cierre comprobada',applicationMethod:'Método de postulación',
  applicationUrl:'Enlace de postulación',contact:'Contacto publicado',validity:'Vigencia indicada por la fuente',
  vacancyEvidence:'Evidencia de vacante',publicationEvidence:'Evidencia de publicación',closingEvidence:'Evidencia de cierre',validityEvidence:'Evidencia de vigencia'};
const flagLabels: Record<string,string> = {posible_duplicado:'Posible duplicado',vencida:'Vencida',fecha_sin_verificar:'Fecha sin verificar',
  vigencia_sin_verificar:'Vigencia sin verificar',fuente_original_sin_verificar:'Fuente sin verificar',datos_extraidos_por_ia:'Datos por revisar',
  actualizacion_pendiente:'Actualización pendiente',varias_fuentes:'Varias fuentes',postulacion_sin_verificar:'Postulación sin verificar',contacto_faltante:'Contacto faltante'};
const messageOf = (error: any) => {
  const body = error.response?.data;
  const details = body?.errors ? Object.entries(body.errors).map(([field,messages]) => `${field}: ${(messages as string[]).join(', ')}`).join('; ') : '';
  return [body?.message || 'No se pudo completar la operación.',details].filter(Boolean).join(' ');
};
export default function DiscoveredOfferManagement() {
  const [items,setItems] = useState<Candidate[]>([]), [runs,setRuns] = useState<Run[]>([]);
  const [status,setStatus] = useState('pendiente'), [flag,setFlag] = useState(''), [q,setQ] = useState('');
  const [page,setPage] = useState(1), [total,setTotal] = useState(0), [busy,setBusy] = useState(false);
  const [error,setError] = useState(''), [notice,setNotice] = useState('');
  const [selected,setSelected] = useState<Candidate | null>(null), [draft,setDraft] = useState<Draft | null>(null);
  const [reviewed,setReviewed] = useState(false), [salaryConfirmed,setSalaryConfirmed] = useState(false);
  const [configText,setConfigText] = useState(''), [configOpen,setConfigOpen] = useState(false);
  const [ready,setReady] = useState(false), [schedule,setSchedule] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const [list,history] = await Promise.all([apiClient.get('/admin/discovered-offers',{params:{status,flag,q,page}}),apiClient.get('/admin/discovered-offers/runs')]);
      setItems(list.data.items);setTotal(list.data.total);setRuns(history.data);
    } catch(e) {setError(messageOf(e));}
  },[status,flag,q,page]);
  useEffect(() => {void refresh();},[refresh]);
  useEffect(() => {
    apiClient.get('/admin/discovered-offers/config').then(({data}) => {
      setConfigText(JSON.stringify(data.config,null,2));setReady(data.ready);setSchedule(data.scheduleEnabled);
    }).catch(e => setError(messageOf(e)));
  },[]);
  const running = runs.some(run => run.status === 'running');
  useEffect(() => {if(!running) return; const timer = setInterval(() => void refresh(),5000); return () => clearInterval(timer);},[running,refresh]);
  const action = async (fn: () => Promise<void>) => {
    setBusy(true);setError('');setNotice('');
    try {await fn();await refresh();} catch(e) {setError(messageOf(e));} finally {setBusy(false);}
  };
  const open = (item: Candidate) => {setSelected(item);setDraft({...item.draft,contacto_postulacion:item.draft.contacto_postulacion ?? [item.extracted.contact,item.extracted.applicationUrl].filter(Boolean).join('\n')});setReviewed(false);setSalaryConfirmed(false);};
  const save = async () => {
    const {data} = await apiClient.patch(`/admin/discovered-offers/${selected.id}`,{draft,expectedVersion:selected.version});
    setSelected({...selected,draft,version:data.version});setNotice('Edición guardada.');
  };
  const expired = selected && (selected.extracted.validity === 'closed' || (selected.extracted.closingDate && selected.extracted.closingDate < new Date().toISOString().slice(0,10)));
  return <Stack spacing={2}>
    <Typography variant="h5">Ofertas encontradas</Typography>
    {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
    {notice && <Alert severity="success">{notice}</Alert>}
    {!ready && <Alert severity="info">Configura BRAVE_SEARCH_API_KEY y OPENAI_API_KEY en el servidor para realizar búsquedas reales.</Alert>}
    <Typography variant="body2">Publicación automática desactivada. Programación: {schedule ? 'habilitada en el entorno (requiere tarea cron)' : 'desactivada'}. Las ofertas externas se publican desde tu cuenta administradora con atribución a la fuente.</Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button variant="contained" disabled={busy || running || !ready} onClick={() => action(async () => {
        await apiClient.post('/admin/discovered-offers/search');setNotice('Búsqueda iniciada. Los resultados aparecerán en el historial.');
      })}>{running ? 'Buscando…' : 'Buscar ahora'}</Button>
      <Button onClick={() => setConfigOpen(true)}>Configurar búsqueda</Button>
      <Button disabled={busy} onClick={() => void refresh()}>Actualizar</Button>
    </Stack>
    <Stack direction={{xs:'column',md:'row'}} spacing={2}>
      <TextField select label="Estado" value={status} onChange={e => {setStatus(e.target.value);setPage(1);}}>
        <MenuItem value="">Todos</MenuItem>{['pendiente','publicada','descartada'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </TextField>
      <TextField select label="Indicador" value={flag} sx={{minWidth:200}} onChange={e => {setFlag(e.target.value);setPage(1);}}>
        <MenuItem value="">Todos</MenuItem>{['posible_duplicado','vencida','fecha_sin_verificar','vigencia_sin_verificar','actualizacion_pendiente','contacto_faltante'].map(v => <MenuItem key={v} value={v}>{flagLabels[v]}</MenuItem>)}
      </TextField>
      <TextField label="Título u organización" value={q} onChange={e => {setQ(e.target.value);setPage(1);}} />
    </Stack>
    <Paper sx={{overflowX:'auto'}}><Table size="small"><TableHead><TableRow>
      <TableCell>Oferta / organización</TableCell><TableCell>Estado</TableCell><TableCell>Indicadores</TableCell><TableCell>Acciones</TableCell>
    </TableRow></TableHead><TableBody>{items.map(item => <TableRow key={item.id}>
      <TableCell>{item.draft.titulo || 'Título no informado'}<Typography variant="body2">{item.extracted.organization || 'No informado'}</Typography></TableCell>
      <TableCell>{item.status}</TableCell><TableCell>{item.flags.map(f => <Chip key={f} size="small" sx={{m:0.25}} label={flagLabels[f] || f} color={f === 'vencida' ? 'error':'default'} />)}</TableCell>
      <TableCell><Button onClick={() => open(item)}>Revisar</Button></TableCell>
    </TableRow>)}{!items.length && <TableRow><TableCell colSpan={4}>Sin ofertas para estos filtros.</TableCell></TableRow>}</TableBody></Table></Paper>
    <Stack direction="row" spacing={1} alignItems="center"><Button disabled={page <= 1} onClick={() => setPage(page-1)}>Anterior</Button>
      <Typography>Página {page} · {total} resultados</Typography><Button disabled={page*30 >= total} onClick={() => setPage(page+1)}>Siguiente</Button></Stack>
    <Typography variant="h6">Historial de ejecuciones</Typography>
    {runs.map(run => <Paper key={run.id} sx={{p:2}}><Typography>#{run.id} · {new Date(run.started_at).toLocaleString('es-AR')} · {run.status}</Typography>
      <Typography variant="body2">Consultas: {run.stats.searches || 0} · Páginas: {run.stats.pages || 0} · Nuevas: {run.stats.created || 0} · Actualizadas: {run.stats.updated || 0} · Repetidas: {run.stats.unchanged || 0} · Omitidas: {run.stats.skipped || 0} · Reserva estimada: USD {run.stats.reservedCostUsd || 0}</Typography>
      {run.errors.length > 0 && <Typography color="error" variant="body2">{run.errors.join(', ')}</Typography>}</Paper>)}
    <Dialog open={Boolean(selected)} onClose={() => !busy && setSelected(null)} fullWidth maxWidth="md">
      <DialogTitle>Revisar oferta encontrada</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
        {error && <Alert severity="error">{error}</Alert>}
        {selected && <><Alert severity={expired ? 'error':'info'}>{expired ? 'Oferta vencida: no se puede publicar.' : 'Comprueba la fuente, los datos, la vigencia y los posibles duplicados antes de publicar.'}</Alert>
          <Button component="a" href={selected.source_url} target="_blank" rel="noopener noreferrer">Abrir fuente original</Button>
          <Typography variant="body2">Consultada: {new Date(selected.consulted_at).toLocaleString('es-AR')}</Typography>
          {selected.source_urls.length > 1 && <Typography variant="body2">Fuentes encontradas: {selected.source_urls.join(' · ')}</Typography>}
          {selected.possible_duplicate_ids.length > 0 && <Typography>Ofertas existentes para comparar: {selected.possible_duplicate_ids.map(id => <Button key={id} component="a" href={`/offers/${id}`} target="_blank" rel="noopener noreferrer">#{id}</Button>)}</Typography>}
          {selected.published_offer_id && <Alert severity="warning">Esta revisión actualizará la oferta #{selected.published_offer_id}.</Alert>}
          <Box component="dl" sx={{m:0}}>{Object.entries(extractedLabels).map(([key,label]) => <Box key={key} sx={{mb:1}}>
            <Typography component="dt" fontWeight="bold" variant="body2">{label}</Typography><Typography component="dd" variant="body2" sx={{m:0,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{selected.extracted[key] ?? 'No informado'}</Typography>
          </Box>)}</Box>
          <Typography variant="h6">Edición antes de publicar</Typography>
          {fields.map(([key,label]) => <TextField key={key} label={label} disabled={selected.status !== 'pendiente'}
            value={draft?.[key] ?? ''} type={key === 'salario' ? 'number':'text'} multiline={['descripcion','detalles_adicionales','contacto_postulacion'].includes(key)}
            minRows={key === 'descripcion' ? 4 : undefined}
            onChange={e => setDraft({...draft,[key]:key === 'salario' ? (e.target.value ? Number(e.target.value):null) : e.target.value})} />)}
          <Typography variant="body2">La fuente y atribución se agregan al resumen al publicar. Completa título (5–100 caracteres) y descripción (mínimo 20). Salario y moneda originales se conservan en los datos extraídos.</Typography>
          <FormControlLabel control={<Checkbox checked={reviewed} onChange={e => setReviewed(e.target.checked)} />} label="Revisé la fuente, los datos ausentes, la vigencia y los posibles duplicados." />
          {draft?.salario && <FormControlLabel control={<Checkbox checked={salaryConfirmed} onChange={e => setSalaryConfirmed(e.target.checked)} />} label="Confirmé el importe y escribí la moneda en la descripción." />}
        </>}
      </Stack></DialogContent><DialogActions sx={{flexWrap:'wrap'}}>
        <Button disabled={busy} onClick={() => setSelected(null)}>Cerrar</Button>
        <Button disabled={busy || selected?.status !== 'pendiente'} onClick={() => action(save)}>Guardar edición</Button>
        <Button color="error" disabled={busy || selected?.status !== 'pendiente'} onClick={() => action(async () => {
          await apiClient.post(`/admin/discovered-offers/${selected.id}/discard`,{expectedVersion:selected.version});setSelected(null);setNotice('Oferta descartada.');
        })}>Descartar</Button>
        <Button variant="contained" disabled={busy || !reviewed || expired || selected?.status !== 'pendiente' || Boolean(draft?.salario && !salaryConfirmed)} onClick={() => action(async () => {
          await apiClient.post(`/admin/discovered-offers/${selected.id}/publish`,{draft,confirmReviewed:reviewed,salaryConfirmed,expectedVersion:selected.version});setSelected(null);setNotice('Oferta publicada.');
        })}>{selected?.published_offer_id ? 'Publicar actualización':'Publicar'}</Button>
      </DialogActions></Dialog>
    <Dialog open={configOpen} onClose={() => !busy && setConfigOpen(false)} fullWidth maxWidth="md"><DialogTitle>Configurar búsqueda</DialogTitle>
      <DialogContent>{error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}<Typography sx={{mb:2}}>Países y puestos, idiomas (es, en, pt, fr, de, it), dominios de fuentes y dominios excluidos. Antigüedad inicial: 7 días cuando exista una fecha comprobable. Los límites se aplican por ejecución. La publicación automática permanece desactivada.</Typography>
        <TextField label="Configuración JSON" multiline minRows={18} fullWidth value={configText} onChange={e => setConfigText(e.target.value)} inputProps={{style:{fontFamily:'monospace'}}} /></DialogContent>
      <DialogActions><Button disabled={busy} onClick={() => setConfigOpen(false)}>Cerrar</Button><Button disabled={busy} onClick={() => action(async () => {
        let config;try {config=JSON.parse(configText);} catch {throw {response:{data:{message:'El JSON de configuración no es válido.'}}};}
        const {data} = await apiClient.put('/admin/discovered-offers/config',config);setConfigText(JSON.stringify(data,null,2));setConfigOpen(false);setNotice('Configuración guardada.');
      })}>Guardar configuración</Button></DialogActions></Dialog>
  </Stack>;
}
