import { Box, Tooltip } from '@mui/material';
import { toast } from 'sonner';
import { copyText } from '../../lib/copyText';
import type { ReactNode } from 'react';

type CopyableCellProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
};

export default function CopyableCell({ value, children, disabled = false }: CopyableCellProps) {
  const trimmedValue = value.trim();
  const isCopyable = !disabled && trimmedValue.length > 0 && trimmedValue !== '—';

  if (!isCopyable) {
    return <>{children}</>;
  }

  const handleCopy = async () => {
    const copied = await copyText(trimmedValue);
    if (copied) {
      toast.success('Copied to clipboard', { description: trimmedValue });
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <Tooltip title="Click to copy" placement="top">
      <Box
        component="span"
        onClick={handleCopy}
        sx={{
          display: 'inline-flex',
          maxWidth: '100%',
          cursor: 'pointer',
          borderRadius: 0.5,
          transition: 'color 0.15s ease',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
