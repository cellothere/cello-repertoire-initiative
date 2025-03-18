import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Typography } from '@mui/material';

interface LevelModalProps {
  open: boolean;
  onClose: () => void;
  level: string;
  tooltipContent: string;
}

// Helper function to format the tooltip text by italicizing section headers.
const formatTooltipContent = (content: string) => {
  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '') {
      return <br key={index} />;
    }
    // Check for known headers and render them italicized.
    if (/^(Left Hand:|Right Hand:|Bow Strokes:|Rhythm & Musicality:)/i.test(trimmed)) {
      return (
        <Typography key={index} variant="body1" component="p">
          <em>{trimmed}</em>
        </Typography>
      );
    }
    return (
      <Typography key={index} variant="body1" component="p">
        {line}
      </Typography>
    );
  });
};

const LevelModal: React.FC<LevelModalProps> = ({ open, onClose, level, tooltipContent }) => {
  // Remove any "(Book ...)" text from the level for display purposes.
  const cleanLevel = level.replace(/\s*\(.*\)/, '');
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', m: 0, p: 2 }}>
        {`"${cleanLevel}" Rubric`}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box sx={{ borderTop: '2px solid lightgray', mx: 3, my: 2 }} />
      <DialogContent>
        {formatTooltipContent(tooltipContent)}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LevelModal;
