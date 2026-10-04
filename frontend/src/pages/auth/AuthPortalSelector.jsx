import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { AdminPanelSettings, Person, Shield } from '@mui/icons-material';

export default function AuthPortalSelector() {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'user',
      title: 'User Portal',
      description: 'Access your signature verification workspace',
      icon: Person,
      features: ['Verify signatures', 'Manage templates', 'View analytics', 'Generate reports'],
      color: '#14b8a6',
      path: '/login',
    },
    {
      id: 'admin',
      title: 'Administrator Portal',
      description: 'Manage users, access, and security',
      icon: AdminPanelSettings,
      features: ['User management', 'Fraud monitoring', 'Audit logs', 'Data export'],
      color: '#4f46e5',
      path: '/admin/login',
    },
  ];

  const handlePortalClick = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Shield sx={{ fontSize: 40, color: '#14b8a6' }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: '#14b8a6',
              }}
            >
              SignaSecure
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: '#cbd5e1',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Enterprise Signature Verification
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#94a3b8',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Select your portal to access the secure workspace
          </Typography>
        </Box>

        {/* Portal Cards */}
        <Grid container spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Grid item xs={12} sm={6} key={portal.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    background: 'linear-gradient(145deg, rgba(30,41,59,.95), rgba(15,23,42,.95))',
                    border: `1px solid rgba(${portal.color === '#14b8a6' ? '20,184,166' : '79,70,229'},.2)`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      borderColor: portal.color,
                      background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))',
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px rgba(${portal.color === '#14b8a6' ? '20,184,166' : '79,70,229'},.15)`,
                    },
                  }}
                  onClick={() => handlePortalClick(portal.path)}
                >
                  <CardContent sx={{ p: 4 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${portal.color}20, ${portal.color}10)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: portal.color }} />
                    </Box>

                    {/* Title & Description */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#f1f5f9',
                        mb: 1,
                      }}
                    >
                      {portal.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#94a3b8',
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {portal.description}
                    </Typography>

                    {/* Features */}
                    <Stack spacing={1} sx={{ mb: 3 }}>
                      {portal.features.map((feature) => (
                        <Box
                          key={feature}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            color: '#cbd5e1',
                            fontSize: '0.875rem',
                          }}
                        >
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: portal.color,
                            }}
                          />
                          {feature}
                        </Box>
                      ))}
                    </Stack>

                    {/* Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handlePortalClick(portal.path)}
                      sx={{
                        background: `linear-gradient(135deg, ${portal.color}, ${portal.color}dd)`,
                        color: portal.color === '#14b8a6' ? '#062b35' : '#fff',
                        fontWeight: 800,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${portal.color}dd, ${portal.color})`,
                          boxShadow: `0 12px 24px rgba(${portal.color === '#14b8a6' ? '20,184,166' : '79,70,229'},.25)`,
                        },
                      }}
                    >
                      Access {portal.title}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            © 2024 SignaSecure Enterprise. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
