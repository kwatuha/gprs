import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * @param {{ variant?: 'inline' | 'fixed' }} props
 * — inline: sits in document flow (e.g. bottom of main column)
 * — fixed: full viewport width at bottom (e.g. login/register)
 */
export default function AppFooter({ variant = 'inline' }) {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        width: '100%',
        flexShrink: 0,
        bgcolor: '#424242',
        color: 'rgba(255, 255, 255, 0.88)',
        py: 1.25,
        px: 2,
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        ...(variant === 'fixed'
          ? {
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1300,
            }
          : {}),
      }}
    >
      <Typography variant="caption" component="p" sx={{ m: 0, fontSize: '0.8125rem' }}>
        Copyright {year} - GPRIS. All rights reserved.
      </Typography>
    </Box>
  );
}
