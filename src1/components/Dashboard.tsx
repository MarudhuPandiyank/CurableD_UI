import React from 'react';
import { AppBar, IconButton, Typography, Grid, Card, CardContent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';

const Dashboard: React.FC = () => {
  // Data for the grid cards
  const cardData = [
    { title: 'Clinic', icon: <AddIcon style={{ color: '#f582a7', fontSize: 40 }} /> },
    { title: 'Survey', icon: <CheckIcon style={{ color: '#f582a7', fontSize: 40 }} /> },
    { title: 'Patient Registration', icon: <AddIcon style={{ color: '#f582a7', fontSize: 40 }} /> },
    { title: 'Screening', icon: <CheckIcon style={{ color: '#f582a7', fontSize: 40 }} /> },
    { title: 'Referral To Hospital', icon: <AddIcon style={{ color: '#f582a7', fontSize: 40 }} /> },
    { title: 'Master Data Management', icon: <CheckIcon style={{ color: '#f582a7', fontSize: 40 }} /> }
  ];

  return (
    <div style={{ backgroundColor: '#f5fbff', minHeight: '100vh', padding: '20px' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" style={{ backgroundColor: '#364fbc' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            style={{
              flexGrow: 1,
              textAlign: 'center', // Center-align the text
              color: '#white', // Set the text color
              border: 'none' // Remove the border around the text
            }}
          >
            Cancer Institute (WIA)
          </Typography>
          <IconButton color="inherit" aria-label="account">
            <AccountCircle />
          </IconButton>
        </div>
      </AppBar>

      {/* Grid of Cards (3 per row, 2 rows total) */}
      <Grid container spacing={1} justifyContent="center" alignItems="flex-start" style={{ marginTop: '20px' }}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} display="flex" justifyContent="center">
            <Card 
              variant="outlined" 
              style={{
                width: '5cm', // Fixed width for cards
                height: '6cm', // Fixed height for cards
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start', // Align items at the top
                alignItems: 'center',
                position: 'relative',
                backgroundColor: '#fff', // White background for the card
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', // Grey shadow for the card
                transition: 'transform 0.2s', // Smooth hover transition
                margin: '20px' // Consistent margin for spacing
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <IconButton style={{ fontSize: '2.5rem' }}>
                {card.icon}
              </IconButton>
              <CardContent style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" align="center">
                  {card.title}
                </Typography>
              </CardContent>
              <IconButton size="small" aria-label="info" style={{ position: 'absolute', top: 8, right: 8 }}>
                <InfoIcon />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
