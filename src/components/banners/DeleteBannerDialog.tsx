import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { Banner } from '../../types/banner';

type DeleteBannerDialogProps = {
  open: boolean;
  banner: Banner | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteBannerDialog({
  open,
  banner,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteBannerDialogProps) {
  return (
    <Dialog open={open} onClose={isDeleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete banner?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete banner at order <strong>{banner?.order}</strong>? This
          action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => void onConfirm()}
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
