import React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import { CheckCircle, Shield } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const assurances = ['Private document handling', 'Clear verification decisions', 'Built for modern teams'];

export default function AuthLayout({ children, eyebrow = 'WELCOME BACK', title, description }) {
  return (
    <Box sx={{ minHeight: '100dvh', overflowX: 'hidden', py: { xs: 1.5, sm: 2, lg: 4 }, background: 'radial-gradient(circle at 7% 8%, rgba(20,184,166,.16), transparent 29%), radial-gradient(circle at 92% 92%, rgba(14,165,233,.14), transparent 32%), #0f1419' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box component={Link} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: '#F8FAFC', textDecoration: 'none', py: { xs: 1, sm: 1.5 } }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: '#2BC9AD', color: '#062332' }}><Shield fontSize="small" /></Box>
          <Typography fontWeight={800} letterSpacing="-.4px">SignaSecure</Typography>
        </Box>
        <Box sx={{ minHeight: { lg: 'calc(100dvh - 112px)' }, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(280px, .92fr) minmax(400px, 1fr)' }, alignItems: 'center', gap: { xs: 2.5, sm: 3, lg: 9 }, py: { xs: 2, sm: 3, lg: 0 } }}>
          <Box sx={{ display: { xs: 'block', lg: 'block' }, maxWidth: { xs: 510, lg: 440 }, mx: { xs: 'auto', lg: 0 }, textAlign: { xs: 'center', lg: 'left' } }}>
            <Typography fontWeight={800} color="#2DD4BF" fontSize=".76rem" letterSpacing=".14em">{eyebrow}</Typography>
            <Typography component="h1" sx={{ mt: { xs: .8, lg: 2 }, fontSize: { xs: '1.8rem', sm: '2.25rem', lg: '3.65rem' }, lineHeight: 1.08, letterSpacing: '-.055em', fontWeight: 800, color: '#F8FAFC' }}>{title}</Typography>
            <Typography sx={{ mt: { xs: 1, lg: 2.5 }, color: '#AAB8C7', lineHeight: 1.65, fontSize: { xs: '.9rem', sm: '1rem', lg: '1.05rem' } }}>{description}</Typography>
            <Stack spacing={1.6} sx={{ mt: 5, display: { xs: 'none', lg: 'flex' } }}>{assurances.map(item => <Stack direction="row" spacing={1.15} alignItems="center" key={item}><CheckCircle sx={{ color: '#2DD4BF', fontSize: 19 }} /><Typography color="#D1D9E3" fontSize=".9rem">{item}</Typography></Stack>)}</Stack>
            <Box sx={{ mt: 5, width: 180, height: 1, bgcolor: 'rgba(45,212,191,.24)', display: { xs: 'none', lg: 'block' } }} />
            <Typography sx={{ mt: 2, color: '#8C9BAD', fontSize: '.8rem', display: { xs: 'none', lg: 'block' } }}>Secure signature intelligence for confident decisions.</Typography>
          </Box>
          <Box sx={{ width: '100%', minWidth: 0, maxWidth: 510, justifySelf: { lg: 'end' }, mx: 'auto' }}>{children}</Box>
        </Box>
      </Container>
    </Box>
  );
}
