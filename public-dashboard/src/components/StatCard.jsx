import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatCurrency, formatNumber } from '../utils/formatters';

const StatCard = ({ title, count, budget, color, icon: Icon, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      elevation={0}
      sx={{ 
        height: '100%',
        borderTop: `4px solid ${color}`,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          borderColor: color,
          ...(onClick && {
            '& .view-details': {
              opacity: 1
            },
            '& .icon-container': {
              transform: 'scale(1.1) rotate(5deg)',
              background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
            }
          })
        }
      }}
      className="fade-in"
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.85rem', letterSpacing: '0.02em' }}>
            {title}
          </Typography>
          {Icon && (
            <Box
              className="icon-container"
              sx={{
                background: `linear-gradient(135deg, ${color}22 0%, ${color}15 100%)`,
                borderRadius: '50%',
                p: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 4px 12px ${color}30`
              }}
            >
              <Icon sx={{ fontSize: 26, color }} />
            </Box>
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            color: color, 
            fontSize: '1.75rem', 
            mb: 0.75,
            textShadow: `0 2px 8px ${color}20`,
            letterSpacing: '-0.02em'
          }}
        >
          {formatNumber(count)}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
          Budget: {formatCurrency(budget)}
        </Typography>
        
        {onClick && (
          <Typography 
            variant="caption" 
            className="view-details"
            sx={{ 
              mt: 0.5,
              display: 'block',
              color: color,
              fontWeight: 600,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              fontSize: '0.7rem'
            }}
          >
            Click to view projects →
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;

