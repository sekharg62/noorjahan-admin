import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'sonner';
import { BannerType, BANNER_TYPE_LABELS, BANNER_TYPE_OPTIONS } from '../../constants/enum';
import { API_URL } from '../../config/env';
import { uploadBannerImage } from '../../utils/generateUrl';

export type BannerFormValues = {
  imgUrl: string;
  redirectUrl: string;
  order: number;
  type: BannerType;
};

type BannerFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: BannerFormValues;
  suggestedOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: BannerFormValues) => Promise<void>;
};

const emptyValues = (order: number): BannerFormValues => ({
  imgUrl: '',
  redirectUrl: '',
  order,
  type: BannerType.HOME,
});

export default function BannerFormModal({
  open,
  mode,
  initialValues,
  suggestedOrder,
  isSubmitting,
  onClose,
  onSubmit,
}: BannerFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<BannerFormValues>(emptyValues(suggestedOrder));
  const [orderInput, setOrderInput] = useState(String(suggestedOrder));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      const nextValues = initialValues ?? emptyValues(suggestedOrder);
      setValues(nextValues);
      setOrderInput(String(nextValues.order));
      setPreviewUrl(initialValues?.imgUrl ?? null);
    }
  }, [open, initialValues, suggestedOrder]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const order = orderInput === '' ? 0 : Math.max(0, Number.parseInt(orderInput, 10));
    await onSubmit({ ...values, order });
  };

  const handleOrderChange = (value: string) => {
    if (value === '') {
      setOrderInput('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    setOrderInput(String(Number.parseInt(value, 10)));
  };

  const handleOrderBlur = () => {
    if (orderInput === '') {
      setOrderInput('0');
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      const imgUrl = await uploadBannerImage(file, API_URL);
      const localPreview = URL.createObjectURL(file);

      setPreviewUrl((current) => {
        if (current?.startsWith('blob:')) {
          URL.revokeObjectURL(current);
        }
        return localPreview;
      });

      setValues((prev) => ({ ...prev, imgUrl }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isSubmitting || isUploading;
  const displayPreview = previewUrl || values.imgUrl || null;

  return (
    <Dialog open={open} onClose={isBusy ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? 'Add banner' : 'Edit banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void handleImageUpload(event)}
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                fullWidth
              >
                {isUploading ? 'Uploading…' : 'Upload banner image'}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Image URL is generated automatically on upload. Upload service will be connected later.
              </Typography>
            </Box>

            {displayPreview && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  variant="rounded"
                  src={displayPreview}
                  alt="Banner preview"
                  sx={{ width: 120, height: 64 }}
                />
                <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                  {values.imgUrl}
                </Typography>
              </Box>
            )}

            <TextField
              label="Redirect URL (optional)"
              value={values.redirectUrl}
              onChange={(e) => setValues((prev) => ({ ...prev, redirectUrl: e.target.value }))}
              fullWidth
              disabled={isBusy}
              placeholder="/products/kurti"
              helperText="Optional link when the banner is clicked"
            />

            <TextField
              label="Order"
              value={orderInput}
              onChange={(e) => handleOrderChange(e.target.value)}
              onBlur={handleOrderBlur}
              required
              fullWidth
              disabled={isBusy}
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                },
              }}
              helperText="Display order (must be unique)"
            />

            <FormControl fullWidth disabled={isBusy}>
              <InputLabel id="banner-type-label">Type</InputLabel>
              <Select
                labelId="banner-type-label"
                label="Type"
                value={values.type}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, type: e.target.value as BannerType }))
                }
              >
                {BANNER_TYPE_OPTIONS.map((type) => (
                  <MenuItem key={type} value={type}>
                    {BANNER_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isBusy || !values.imgUrl.trim() || orderInput === ''}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
