import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  Assessment,
  FileDownload,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../services/api';

const cardSx = {
  background: 'linear-gradient(145deg,#1e293b,#1a1f2e)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 3,
};

export default function ReportsPage() {
  const navigate = useNavigate();

  const [reportType, setReportType] = useState('verification');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateFrom(lastMonth.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await api.get('/verification/templates/');
      setTemplates(res.data.templates || []);
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  };

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      setError('Please select date range');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const verHistory = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
      const enrollHistory = JSON.parse(localStorage.getItem('enrolledTemplates') || '[]');

      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);

      const filteredVerifications = verHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= fromDate && itemDate <= toDate;
      });

      const filteredEnrollments = enrollHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= fromDate && itemDate <= toDate;
      });

      const totalVerifications = filteredVerifications.length;
      const matchedCount = filteredVerifications.filter(v => v.status === 'match').length;
      const avgScore = filteredVerifications.length > 0
        ? Math.round(filteredVerifications.reduce((sum, v) => sum + v.matchScore, 0) / filteredVerifications.length)
        : 0;

      const reportContent = {
        type: reportType,
        dateFrom,
        dateTo,
        generatedAt: new Date().toLocaleString(),
        statistics: {
          totalVerifications,
          matchedCount,
          failedCount: totalVerifications - matchedCount,
          matchRate: totalVerifications > 0 ? Math.round((matchedCount / totalVerifications) * 100) : 0,
          avgScore,
          templatesEnrolled: filteredEnrollments.length,
        },
        verifications: filteredVerifications,
        enrollments: filteredEnrollments,
        templates: templates.length,
      };

      setReportData(reportContent);
      toast.success('✅ Report generated successfully!');
    } catch (e) {
      const errorMsg = e?.message || 'Failed to generate report';
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportData) return;

    setGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      pdf.setFontSize(20);
      pdf.setTextColor(20, 184, 166);
      pdf.text('SignaSecure Enterprise', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Verification Report', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      pdf.text(`Generated: ${reportData.generatedAt}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Period: ${reportData.dateFrom} to ${reportData.dateTo}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Report Type: ${reportData.type.toUpperCase()}`, 20, yPosition);

      yPosition += 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);

      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(20, 184, 166);
      pdf.text('Statistics Summary', 20, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      const stats = [
        `Total Verifications: ${reportData.statistics.totalVerifications}`,
        `Matched: ${reportData.statistics.matchedCount}`,
        `Failed: ${reportData.statistics.failedCount}`,
        `Match Rate: ${reportData.statistics.matchRate}%`,
        `Average Score: ${reportData.statistics.avgScore}%`,
        `Templates Enrolled: ${reportData.statistics.templatesEnrolled}`,
      ];

      stats.forEach(stat => {
        pdf.text(stat, 20, yPosition);
        yPosition += 7;
      });

      if (reportData.verifications.length > 0) {
        yPosition += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);

        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(20, 184, 166);
        pdf.text('Recent Verifications', 20, yPosition);

        yPosition += 10;

        const tableData = reportData.verifications.slice(0, 10).map(v => [
          v.type === 'compare' ? 'Comparison' : 'Verification',
          `${v.matchScore}%`,
          v.status === 'match' ? 'Matched' : 'Not Matched',
          new Date(v.timestamp).toLocaleString(),
        ]);

        pdf.autoTable({
          head: [['Type', 'Score', 'Status', 'Time']],
          body: tableData,
          startY: yPosition,
          margin: { left: 20, right: 20 },
          theme: 'grid',
          headStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255] },
          bodyStyles: { textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });
      }

      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      pdf.save(`SignaSecure_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('✅ PDF downloaded successfully!');
    } catch (e) {
      toast.error('❌ Failed to generate PDF');
      console.error('PDF generation error:', e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: 'text.secondary', minWidth: 0, p: 1 }}
        />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Reports
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Generate and download verification reports
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={5}>
            <Card sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Generate Report
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: 'text.secondary' }}>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Report Type"
                    sx={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <MenuItem value="verification">Verification Report</MenuItem>
                    <MenuItem value="enrollment">Enrollment Report</MenuItem>
                    <MenuItem value="comprehensive">Comprehensive Report</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover fieldset': { borderColor: '#14b8a6' },
                      '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                  }}
                />

                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&:hover fieldset': { borderColor: '#14b8a6' },
                      '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                  }}
                />

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                  onClick={generateReport}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={7}>
            {reportData ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card sx={cardSx}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Report Preview
                      </Typography>
                      <Chip
                        label="Ready to Download"
                        icon={<CheckCircle />}
                        sx={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                      />
                    </Box>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1.5, background: 'rgba(20,184,166,0.1)', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ color: '#14b8a6', fontWeight: 700 }}>
                            {reportData.statistics.totalVerifications}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Verifications
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1.5, background: 'rgba(16,185,129,0.1)', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                            {reportData.statistics.matchRate}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Match Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1.5, background: 'rgba(59,130,246,0.1)', borderRadius: 2 }}>
                          <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                            {reportData.statistics.avgScore}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Avg Score
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        <strong>Generated:</strong> {reportData.generatedAt}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        <strong>Period:</strong> {reportData.dateFrom} to {reportData.dateTo}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Type:</strong> {reportData.type.toUpperCase()}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={generating ? <CircularProgress size={20} /> : <FileDownload />}
                      onClick={downloadPDF}
                      disabled={generating}
                      sx={{
                        background: 'linear-gradient(135deg,#10b981,#a3e635)',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1.5,
                      }}
                    >
                      {generating ? 'Generating PDF...' : 'Download PDF Report'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card sx={cardSx}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 64, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Select date range and click "Generate Report" to create a report
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {reportData && (
            <Grid item xs={12}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Recent Verifications
                  </Typography>

                  {reportData.verifications.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Score</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.verifications.slice(0, 10).map((item, idx) => (
                            <TableRow key={idx} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <TableCell sx={{ fontSize: '0.75rem' }}>
                                {item.type === 'compare' ? 'Comparison' : 'Verification'}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 600 }}>
                                {item.matchScore}%
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem' }}>
                                <Chip
                                  label={item.status === 'match' ? 'Matched' : 'Not Matched'}
                                  size="small"
                                  sx={{
                                    background: item.status === 'match' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: item.status === 'match' ? '#10b981' : '#ef4444',
                                    fontSize: '0.65rem',
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                      No verifications in this period
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
