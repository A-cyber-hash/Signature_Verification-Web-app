import React from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowForward,
  CheckCircle,
  Description,
  Lock,
  Shield,
  UploadFile,
  VerifiedUser,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const featureItems = [
  ['AI-powered comparison', 'Spot subtle differences and potential forgeries in seconds.', VerifiedUser],
  ['Private by design', 'Your documents are protected with enterprise-grade controls.', Lock],
  ['Clear audit trail', 'Give every verification a traceable, shareable result.', Description],
];

const workflow = [
  ['01', 'Upload', 'Add a signature image or document.'],
  ['02', 'Analyse', 'Our verification engine compares key details.'],
  ['03', 'Decide', 'Receive a clear confidence score and report.'],
];

export default function LandingPage() {
  const navigate = useNavigate();
  const compact = useMediaQuery('(max-width:700px)');

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', bgcolor: '#071B2B', color: '#F5FAFC' }}>
      <Box
        sx={{
          minHeight: { xs: 'auto', md: '790px' },
          position: 'relative',
          background: 'radial-gradient(circle at 82% 12%, rgba(31, 196, 166, .24), transparent 30%), radial-gradient(circle at 50% 105%, rgba(42, 110, 171, .28), transparent 42%), #071B2B',
          '&:before': {
            content: '""', position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .35,
            backgroundImage: 'linear-gradient(rgba(155, 207, 219, .06) 1px, transparent 1px), linear-gradient(90deg, rgba(155, 207, 219, .06) 1px, transparent 1px)',
            backgroundSize: '48px 48px', maskImage: 'linear-gradient(to bottom, black, transparent 82%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box component="header" sx={{ height: 84, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: '12px', bgcolor: '#23C6A7', color: '#062235', boxShadow: '0 8px 24px rgba(35,198,167,.26)' }}>
                <Shield fontSize="small" />
              </Box>
              <Typography fontWeight={800} letterSpacing="-.5px" fontSize="1.1rem">SignaSecure</Typography>
            </Stack>
            <Stack direction="row" spacing={compact ? 0.5 : 1.5} alignItems="center">
              {!compact && <Button color="inherit" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</Button>}
              <Button color="inherit" onClick={() => navigate('/login')}>User login</Button>
              <Button color="inherit" onClick={() => navigate('/admin/login')}>Admin login</Button>
              {!compact && <Button variant="contained" onClick={() => navigate('/register')} sx={{ bgcolor: '#23C6A7', color: '#062235', '&:hover': { bgcolor: '#54D8C0' } }}>Get started</Button>}
            </Stack>
          </Box>

          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center" sx={{ pt: { xs: 7, md: 12 }, pb: { xs: 8, md: 12 } }}>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
                <Chip icon={<CheckCircle sx={{ color: '#78E4D1 !important' }} />} label="Trusted signature intelligence" sx={{ mb: 3, color: '#BDEEE6', bgcolor: 'rgba(35,198,167,.1)', border: '1px solid rgba(104,230,207,.22)', fontWeight: 600 }} />
                <Typography component="h1" sx={{ maxWidth: 610, fontSize: { xs: '2.65rem', sm: '3.6rem', md: '4.25rem' }, lineHeight: 1.04, letterSpacing: '-.06em', fontWeight: 800 }}>
                  Decisions you can <Box component="span" sx={{ color: '#48D4BC' }}>stand behind.</Box>
                </Typography>
                <Typography sx={{ mt: 3, maxWidth: 530, color: '#A9C5CE', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
                  Verify signatures with a transparent confidence score, a defensible audit trail, and a workflow your team will actually enjoy using.
                </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                  <Button size="large" variant="contained" endIcon={<ArrowForward />} onClick={() => navigate('/auth')} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, bgcolor: '#23C6A7', color: '#062235', px: 3, '&:hover': { bgcolor: '#61DDC8', transform: 'translateY(-1px)' } }}>
                    Access Portal
                  </Button>
                  <Button size="large" variant="outlined" onClick={() => navigate('/register')} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 3, color: '#E6F5F6', borderColor: 'rgba(216,245,245,.3)', '&:hover': { borderColor: '#65DCC8', bgcolor: 'rgba(255,255,255,.04)' } }}>
                    Create workspace
                  </Button>
                </Stack>
                <Stack direction="row" spacing={3} sx={{ mt: 4, color: '#92B9C3' }}>
                  <Typography variant="body2"><Box component="span" sx={{ color: '#F5FAFC', fontWeight: 800 }}>2 min</Box> to first result</Typography>
                  <Typography variant="body2"><Box component="span" sx={{ color: '#F5FAFC', fontWeight: 800 }}>98.4%</Box> confidence view</Typography>
                  <Typography variant="body2"><Box component="span" sx={{ color: '#F5FAFC', fontWeight: 800 }}>1 trail</Box> for every decision</Typography>
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, scale: .96, x: 18 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: .65, delay: .1 }}>
                <Box sx={{ maxWidth: 510, ml: { md: 'auto' }, p: { xs: 2, sm: 2.5 }, borderRadius: '24px', bgcolor: 'rgba(10, 42, 58, .78)', border: '1px solid rgba(163,223,223,.16)', boxShadow: '0 28px 70px rgba(0,0,0,.32)', backdropFilter: 'blur(16px)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 2.25, borderBottom: '1px solid rgba(171,223,223,.12)' }}>
            <Stack direction="row" spacing={1.2} alignItems="center"><Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'rgba(35,198,167,.15)', display: 'grid', placeItems: 'center', color: '#54D8C0' }}><VerifiedUser fontSize="small" /></Box><Box><Typography fontWeight={700} fontSize=".9rem">Decision workspace</Typography><Typography color="#8FB4BD" fontSize=".73rem">Document #SG-2048 · just now</Typography></Box></Stack>
                    <Chip size="small" label="Ready to approve" sx={{ bgcolor: 'rgba(35,198,167,.14)', color: '#70E5D1', fontWeight: 700 }} />
                  </Stack>
                  <Box sx={{ my: 2.5, p: 2.25, borderRadius: 3, bgcolor: '#F7FBFA', color: '#14333A', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', width: 100, height: 100, bgcolor: 'rgba(35,198,167,.13)', borderRadius: '50%', right: -28, top: -38 }} />
                    <Typography variant="caption" color="#60777C" fontWeight={700} letterSpacing=".08em">SIGNATURE MATCH</Typography>
                    <Stack direction="row" alignItems="end" justifyContent="space-between" sx={{ mt: .5 }}><Typography sx={{ fontSize: '2.6rem', lineHeight: 1, letterSpacing: '-.07em', fontWeight: 800 }}>98.4%</Typography><Typography color="#14836F" fontWeight={800} fontSize=".8rem">HIGH CONFIDENCE</Typography></Stack>
                    <Box sx={{ height: 8, mt: 2, borderRadius: 10, bgcolor: '#D8E7E4', overflow: 'hidden' }}><Box sx={{ width: '98.4%', height: '100%', borderRadius: 10, bgcolor: '#23C6A7' }} /></Box>
                  </Box>
                  <Stack spacing={1.4}>
                    {['Signature structure', 'Stroke consistency', 'Reference comparison'].map((label, index) => <Stack key={label} direction="row" justifyContent="space-between" alignItems="center"><Typography color="#B5D0D5" fontSize=".85rem">{label}</Typography><Stack direction="row" spacing={.7} alignItems="center"><Box sx={{ width: 54, height: 5, borderRadius: 5, bgcolor: 'rgba(255,255,255,.12)', overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${92 - index * 4}%`, bgcolor: '#4ED7BE' }} /></Box><CheckCircle sx={{ color: '#4ED7BE', fontSize: 16 }} /></Stack></Stack>)}
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#F4F8F8', color: '#102F38', py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography component="p" textAlign="center" color="#6B858C" fontWeight={700} fontSize=".73rem" letterSpacing=".14em">ONE CALM WORKSPACE FOR HIGH-STAKES DECISIONS</Typography>
          <Grid container spacing={2.5} sx={{ mt: 2 }}>
            {featureItems.map(([title, description, Icon]) => <Grid item xs={12} md={4} key={title}><Box sx={{ height: '100%', p: 3, borderRadius: 4, bgcolor: '#FFF', border: '1px solid #E0EBEA', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 32px rgba(16,47,56,.1)' } }}><Box sx={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 2.5, bgcolor: '#E1F6F1', color: '#168D78', mb: 2 }}><Icon /></Box><Typography fontWeight={800} fontSize="1.1rem">{title}</Typography><Typography color="#668087" sx={{ mt: .75, lineHeight: 1.65 }}>{description}</Typography></Box></Grid>)}
          </Grid>
        </Container>
      </Box>

      <Box id="how-it-works" sx={{ py: { xs: 7, md: 10 }, bgcolor: '#FFFFFF', color: '#102F38' }}>
        <Container maxWidth="lg"><Grid container spacing={5} alignItems="center"><Grid item xs={12} md={4}><Typography color="#168D78" fontWeight={800} fontSize=".8rem" letterSpacing=".1em">SIMPLE BY DESIGN</Typography><Typography sx={{ mt: 1, fontWeight: 800, fontSize: { xs: '2rem', md: '2.6rem' }, lineHeight: 1.14, letterSpacing: '-.04em' }}>A clear path to a confident decision.</Typography></Grid><Grid item xs={12} md={8}><Grid container spacing={2}>{workflow.map(([number, title, copy]) => <Grid item xs={12} sm={4} key={number}><Box sx={{ p: 2.25, borderLeft: '2px solid #55D7C0' }}><Typography color="#168D78" fontWeight={800}>{number}</Typography><Typography fontWeight={800} sx={{ mt: 2 }}>{title}</Typography><Typography color="#668087" fontSize=".88rem" sx={{ mt: .5, lineHeight: 1.55 }}>{copy}</Typography></Box></Grid>)}</Grid></Grid></Grid></Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: '#071B2B', py: 3 }}><Container maxWidth="lg"><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}><Typography color="#D7EAEC" fontWeight={700}>SignaSecure</Typography><Typography color="#7DA2AB" variant="body2">Secure signature verification for modern teams.</Typography></Stack></Container></Box>
    </Box>
  );
}
