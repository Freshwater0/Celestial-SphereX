import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';

export const WidgetContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  overflow: 'hidden',
  position: 'relative',
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const WidgetHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: 56,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

export const WidgetTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  color: theme.palette.text.primary,
  fontSize: '1.1rem',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
}));

export const WidgetContent = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  overflow: 'auto',
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  '&::-webkit-scrollbar': {
    width: '0.4em',
    height: '0.4em',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      background: theme.palette.text.disabled,
    },
  },
  '& > *': {
    minWidth: 0, // Ensures content doesn't force widget to grow
  },
}));

export const WidgetFooter = styled('div')(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}));
