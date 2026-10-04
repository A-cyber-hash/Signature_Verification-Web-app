import React, { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PhotoCamera,
  SmartToy,
  Dashboard,
  Settings,
  Language,
} from '@mui/icons-material';
import CameraSystem from '@components/mobile/CameraSystem';
import AIChatbot from '@components/mobile/AIChatbot';
import { useLanguage } from '@context/LanguageContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function MobileApp() {
  const { t, language, toggleLanguage } = useLanguage();
  const [tabValue, setTabValue] = useState(0);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#0f172a' }}>
      {/* App Bar */}
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(90deg, rgba(30,41,59,.95) 0%, rgba(15,23,42,.95) 100%)',
          border: '1px solid rgba(148,163,184,.16)',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
              }}
            >
              S
            </Box>
            <Typography variant="h6" fontWeight={800}>
              SignaSecure
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title={t('language')}>
              <IconButton
                onClick={() => setShowLanguageDialog(true)}
                sx={{ color: '#94a3b8' }}
              >
                <Language />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ flex: 1, py: 2 }}>
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            {/* Stats Cards */}
            <Card sx={{ background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))', border: '1px solid rgba(148,163,184,.16)' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                      {t('totalVerifications')}
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      156
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                      {t('genuineSignatures')}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#10b981' }}>
                      148
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                      {t('forgedDetected')}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#ef4444' }}>
                      8
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 0.5 }}>
                      {t('accuracy')}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#0ea5e9' }}>
                      94.9%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Stack spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<PhotoCamera />}
                fullWidth
                onClick={() => setTabValue(1)}
                sx={{
                  background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                {t('captureSignature')}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                {t('uploadSignature')}
              </Button>
            </Stack>
          </Stack>
        </TabPanel>

        {/* Camera Tab */}
        <TabPanel value={tabValue} index={1}>
          <CameraSystem />
        </TabPanel>

        {/* Chatbot Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card sx={{ background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))', border: '1px solid rgba(148,163,184,.16)' }}>
            <CardContent sx={{ p: 2 }}>
              <AIChatbot />
            </CardContent>
          </Card>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card sx={{ background: 'linear-gradient(145deg, rgba(30,41,59,.98), rgba(15,23,42,.98))', border: '1px solid rgba(148,163,184,.16)' }}>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                    {t('language')}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowLanguageDialog(true)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {language === 'en' ? t('english') : t('hindi')}
                  </Button>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                    About
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SignaSecure Enterprise v1.0.0
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Advanced AI-powered signature verification system
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      {/* Bottom Navigation Tabs */}
      <Box sx={{ borderTop: '1px solid rgba(148,163,184,.16)', bgcolor: 'rgba(15,23,42,.5)' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              color: '#94a3b8',
              '&.Mui-selected': {
                color: '#14b8a6',
              },
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
            },
          }}
        >
          <Tab icon={<Dashboard />} label={t('dashboard')} />
          <Tab icon={<PhotoCamera />} label={t('verification')} />
          <Tab icon={<SmartToy />} label={t('chatbot')} />
          <Tab icon={<Settings />} label={t('settings')} />
        </Tabs>
      </Box>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onClose={() => setShowLanguageDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('language')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Button
              variant={language === 'en' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => {
                if (language !== 'en') toggleLanguage();
                setShowLanguageDialog(false);
              }}
              sx={{
                background: language === 'en' ? 'linear-gradient(135deg, #14b8a6, #0ea5e9)' : 'transparent',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
              }}
            >
              {t('english')}
            </Button>
            <Button
              variant={language === 'hi' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => {
                if (language !== 'hi') toggleLanguage();
                setShowLanguageDialog(false);
              }}
              sx={{
                background: language === 'hi' ? 'linear-gradient(135deg, #14b8a6, #0ea5e9)' : 'transparent',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
              }}
            >
              {t('hindi')}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowLanguageDialog(false)} variant="outlined">
            {t('cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
