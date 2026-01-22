import { Typography, Box } from "@mui/material";

export default function ProfileNotFound() {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Perfil no encontrado
      </Typography>
      <Typography>
        Este perfil no existe o fue eliminado de FutbolProyect.
      </Typography>
    </Box>
  );
}
