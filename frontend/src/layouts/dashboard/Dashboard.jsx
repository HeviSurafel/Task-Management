import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import './dashboard.css';
import welcome from '../../assets/dashboard/welcome.png';
import complete from '../../assets/tasks/complete.png';
import totaltasks from '../../assets/tasks/totaltasks.png';
import totalprogress from '../../assets/tasks/totalprogress.png';
import totalpending from '../../assets/tasks/totalpending.png';
import totalcomplete from '../../assets/tasks/totalcomplete.png';
import { FcStatistics } from 'react-icons/fc';
import Navbar from '../../components/navbar/Navbar';
import axios from 'axios';
import { initGA, logPageView, logEvent } from '../../analytics'; // Import analytics functions

function Dashboard() {
  const [dashboardData, setDashboardData] = useState([]);

  // Initialize Google Analytics
  useEffect(() => {
    initGA('YOUR_TRACKING_ID'); // Replace with your Google Analytics tracking ID
    logPageView(); // Log the initial page view
  }, []);

  const getDashboard = async () => {
    try {
      const response = await axios.get('api/dashboard');
      setDashboardData(response.data);
      logEvent('Dashboard', 'Data Fetched Successfully'); // Log an event when data is fetched
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      logEvent('Dashboard', 'Data Fetch Failed'); // Log an event if data fetch fails
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  return (
    <>
      <div className='app-main-container'>
        <div className='app-main-left-container'>
          <Sidenav />
        </div>
        <div className='app-main-right-container'>
          <Navbar />

          <div className='dashboard-main-container'>
            <div className='dashboard-main-left-container'>
              <div className='task-status-card-container'>
                <div className='add-task-inner-div'>
                  <FcStatistics className='task-stats' />
                  <p className='todo-text'>Employees Statistics</p>
                </div>
                <div className='stat-first-row'>
                  <div className='stats-container container-bg1'>
                    <img className='stats-icon' src={totaltasks} alt='totaltasks' />
                    <div>
                      <p className='stats-num'>1200</p>
                      <p className='stats-text'>Total Employees</p>
                    </div>
                  </div>
                  <div className='stats-container container-bg4'>
                    <img className='stats-icon' src={totalcomplete} alt='totalcomplete' />
                    <div>
                      <p className='stats-num'>1200</p>
                      <p className='stats-text'>Active Employees</p>
                    </div>
                  </div>
                </div>
                <div className='stat-second-row'>
                  <div className='stats-container container-bg2'>
                    <img className='stats-icon' src={totalpending} alt='totalpending' />
                    <div>
                      <p className='stats-num'>1200</p>
                      <p className='stats-text'>In Active Employees</p>
                    </div>
                  </div>
                  <div className='stats-container container-bg3'>
                    <img className='stats-icon' src={totalprogress} alt='totalprogress' />
                    <div>
                      <p className='stats-num'>1200</p>
                      <p className='stats-text'>Terminated Employees</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Repeat for other sections */}
            </div>

            <div className='dashboard-main-right-container'>
              <div className='task-status-card-container'>
                <div className='add-task-inner-div'>
                  <img src={complete} alt='complete' />
                  <p className='todo-text'>Employees Status</p>
                </div>
                <div className='task-status-progress-main-container'>
                  <div>
                    <CircularProgress value={80} color='#05A301' size={'100px'}>
                      <CircularProgressLabel>80%</CircularProgressLabel>
                    </CircularProgress>
                    <p className='completed'>Active</p>
                  </div>
                  <div>
                    <CircularProgress value={60} color='#0225FF' size={'100px'}>
                      <CircularProgressLabel>60%</CircularProgressLabel>
                    </CircularProgress>
                    <p className='progress'>In Active</p>
                  </div>
                  <div>
                    <CircularProgress value={20} color='#F21E1E' size={'100px'}>
                      <CircularProgressLabel>20%</CircularProgressLabel>
                    </CircularProgress>
                    <p className='pending'>Termintaed</p>
                  </div>
                </div>
              </div>
              {/* Repeat for other sections */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;