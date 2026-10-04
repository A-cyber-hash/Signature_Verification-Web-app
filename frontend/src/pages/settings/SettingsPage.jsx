import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Switch, FormControlLabel, Avatar, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { Save, Security, Notifications, Person } from '@mui/icons-material';
import toast from 'react-hot-toast';

const sectionCard = { background: 'linear-gradient(145deg,#1e293b,#1a1f2e)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 };
const inputSx = { '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' }, '&:hover fieldset': { borderColor: '#14b8a6' } }, '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' } };

export default function SettingsPage() {
  const { user } = useSelector(s => s.auth);
  const [notif, setNotif] = useState(true);
  const [emailAlert, setEmailAlert] = useState(true);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage your profile, security, and preferences</Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Profile */}
        <Grid item xs={12} lg={6}>
          <Card sx={sectionCard}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Person sx={{ color: '#14b8a6' }} />
                <Typography variant="h6" fontWeight={700}>Profile</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Avatar sx={{ width: 64, height: 64, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', fontSize: '1.5rem', fontWeight: 700 }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>{user?.first_name} {user?.last_name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user?.email}</Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth size="small" label="First Name" defaultValue={user?.first_name} sx={inputSx} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Last Name" defaultValue={user?.last_name} sx={inputSx} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Email" defaultValue={user?.email} sx={inputSx} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Phone" defaultValue={user?.phone} sx={inputSx} /></Grid>
              </Grid>
              <Button variant="contained" startIcon={<Save />} onClick={() => toast.success('Profile saved')} sx={{ mt: 2, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', borderRadius: 2 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} lg={6}>
          <Card sx={sectionCard}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Security sx={{ color: '#14b8a6' }} />
                <Typography variant="h6" fontWeight={700}>Security</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth size="small" label="Current Password" type="password" sx={inputSx} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="New Password" type="password" sx={inputSx} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Confirm Password" type="password" sx={inputSx} /></Grid>
              </Grid>
              <Button variant="outlined" onClick={() => toast.success('Password changed')} sx={{ mt: 2, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Card sx={sectionCard}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Notifications sx={{ color: '#14b8a6' }} />
                <Typography variant="h6" fontWeight={700}>Notifications</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Push Notifications', sub: 'In-app alerts for verification events', val: notif, set: setNotif },
                  { label: 'Email Alerts', sub: 'Email notification on fraud detection', val: emailAlert, set: setEmailAlert },
                ].map(({ label, sub, val, set }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{label}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{sub}</Typography>
                    </Box>
                    <Switch checked={val} onChange={e => set(e.target.checked)} sx={{ '& .MuiSwitch-thumb': { background: '#14b8a6' }, '& .Mui-checked + .MuiSwitch-track': { background: 'rgba(20,184,166,0.5)' } }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
