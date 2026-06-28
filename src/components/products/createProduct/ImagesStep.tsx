import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { toast } from 'sonner';
import type { ProductImageDraft } from './types';

type ImagesStepProps = {
  images: ProductImageDraft[];
  error?: string;
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onSetPrimary: (id: string) => void;
};

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export default function ImagesStep({
  images,
  error,
  onAddFiles,
  onRemove,
  onReorder,
  onSetPrimary,
}: ImagesStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const validFiles = Array.from(fileList).filter(isImageFile);
    if (validFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    if (validFiles.length < fileList.length) {
      toast.error('Some files were skipped because they are not images');
    }

    onAddFiles(validFiles);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleDropZoneDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleCardDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleCardDragOver = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    onReorder(dragIndex, index);
    setDragIndex(index);
  };

  const handleCardDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Product images
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload multiple images, drag to reorder, and choose one as the primary image.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDropZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: isDragOver ? 'primary.main' : 'divider',
          bgcolor: isDragOver ? 'action.hover' : 'background.paper',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleInputChange}
        />
        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Drag &amp; drop images here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          or click to browse — JPG, PNG, WEBP supported
        </Typography>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}

      {images.length > 0 && (
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            {images.length} image{images.length === 1 ? '' : 's'} — drag cards to reorder
          </Typography>

          <Stack spacing={1.5}>
            {images.map((image, index) => (
              <Paper
                key={image.id}
                variant="outlined"
                draggable
                onDragStart={() => handleCardDragStart(index)}
                onDragOver={(e) => handleCardDragOver(e, index)}
                onDragEnd={handleCardDragEnd}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'grab',
                  opacity: dragIndex === index ? 0.6 : 1,
                  borderColor: image.isPrimary ? 'primary.main' : 'divider',
                  bgcolor: image.isPrimary ? 'action.selected' : 'background.paper',
                }}
              >
                <DragIndicatorIcon color="action" sx={{ flexShrink: 0 }} />

                <Chip
                  label={`#${image.displayOrder}`}
                  size="small"
                  color={image.isPrimary ? 'primary' : 'default'}
                  sx={{ minWidth: 44 }}
                />

                <Box
                  component="img"
                  src={image.previewUrl}
                  alt=""
                  sx={{
                    width: 72,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {image.file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(image.file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>

                <FormControlLabel
                  control={
                    <Radio
                      checked={image.isPrimary}
                      onChange={() => onSetPrimary(image.id)}
                      value={image.id}
                      name="primary-image"
                    />
                  }
                  label="Primary"
                  sx={{ mr: 0, flexShrink: 0 }}
                />

                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove image"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(image.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
