import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Box, Typography, LinearProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';

const DropzoneContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDragActive',
})(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
  transition: 'border .24s ease-in-out, background-color .24s ease-in-out',
}));

function FileUpload({ onFilesChange, uploadProgress, multiple }) {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles);
    }

    if (fileRejections.length > 0) {
      const newErrors = fileRejections.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      );
      setErrors(newErrors);
    } else {
      setErrors([]);
    }

    if (acceptedFiles.length > 0) {
      onFilesChange(acceptedFiles);
      if (!multiple) {
        setFiles([]);
      }
    }
  }, [multiple, onFilesChange]);

  useEffect(() => {
    if (uploadProgress === 100) {
      setFiles([]);
    }
  }, [uploadProgress]);

  const removeFile = (fileToRemove) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: multiple ? 4 : 1,
  });

  return (
    <Box>
      <DropzoneContainer {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <Typography>{t('drag_drop_files', 'Arrastra y suelta hasta 4 imágenes aquí, o haz clic para seleccionar')}</Typography>
        <Typography variant="body2" color="textSecondary">{t('file_constraints', 'Imágenes (JPEG, PNG, GIF) de hasta 5MB cada una.')}</Typography>
      </DropzoneContainer>
      
      {errors.length > 0 && (
        <Box mt={2}>
          {errors.map((error, i) => (
            <Typography key={i} color="error">{error}</Typography>
          ))}
        </Box>
      )}

      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, i) => (
            <ListItem
              key={i}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(file)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <img src={file.preview} alt={file.name} style={{ width: 50, height: 50, marginRight: 16, objectFit: 'cover', borderRadius: 4 }} />
              <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
            </ListItem>
          ))}
        </List>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="textSecondary" align="center">{`${Math.round(uploadProgress)}%`}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default FileUpload;
