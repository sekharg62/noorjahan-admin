import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { MenuItem } from '../../types/menuSubmenu';

type DeleteMenuSubmenuDialogProps = {
  open: boolean;
  item: MenuItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteMenuSubmenuDialog({
  open,
  item,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteMenuSubmenuDialogProps) {
  const isMenu = item && !item.parentId;

  return (
    <Dialog open={open} onClose={isDeleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete {isMenu ? 'menu' : 'submenu'}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isMenu ? (
            <>
              Are you sure you want to delete <strong>{item?.name}</strong>? This will also delete
              all of its submenus.
            </>
          ) : (
            <>
              Are you sure you want to delete <strong>{item?.name}</strong>? This action cannot be
              undone.
            </>
          )}
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
