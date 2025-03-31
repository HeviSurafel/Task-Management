import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import { 
  CircularProgress, 
  CircularProgressLabel, 
  Tag,
  Box,
  Text,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stack,
  Heading,
  Button,
  Badge
} from '@chakra-ui/react';
import {Grid} from '@chakra-ui/react';
import {GridItem} from '@chakra-ui/react';
import {Flex} from '@chakra-ui/react';
import "./tasks.css";
import pending from '../../assets/tasks/Pending.png';
import complete from '../../assets/tasks/complete.png';
import book from '../../assets/tasks/Book.png';
import totaltasks from '../../assets/tasks/totaltasks.png';
import totalprogress from '../../assets/tasks/totalprogress.png';
import totalpending from '../../assets/tasks/totalpending.png';
import totalcomplete from '../../assets/tasks/totalcomplete.png';
import { IoReaderOutline,  } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { FcStatistics } from "react-icons/fc";
import Navbar from '../../components/navbar/Navbar';
import AddTaskModal from './modals/AddTask';
import ReadTaskModal from './modals/ReadTask';
import useAdminStore from '../../store/admin.store';

function Tasks() {
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isReadTaskModalOpen, setIsReadTaskModalOpen] = useState(false);
    const { taskDahboard, tasksDashboard, projects, employeesData, getProjects, getEmployees } = useAdminStore();
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    
    const openAddTaskModal = () => setIsAddTaskModalOpen(true);
    const openReadTaskModal = () => setIsReadTaskModalOpen(true);
    const closeAddTaskModal = () => setIsAddTaskModalOpen(false);
    const closeReadTaskModal = () => setIsReadTaskModalOpen(false);

    useEffect(() => {
        taskDahboard();
        getProjects();
        getEmployees();
    }, []);

    const dashboardData = tasksDashboard?.data?.data?.globalStats || {};
    const recentTasks = dashboardData.recentTasks || [];
console.log("taskDahboard",tasksDashboard)
    // Calculate percentages
    const calculatePercentage = (value, total) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const completedPercentage = calculatePercentage(dashboardData.completedTasks || 0, dashboardData.totalTasks || 1);
    const inProgressPercentage = calculatePercentage(dashboardData.inProgressTasks || 0, dashboardData.totalTasks || 1);
    const pendingPercentage = calculatePercentage(dashboardData.pendingTasks || 0, dashboardData.totalTasks || 1);
    const overduePercentage = calculatePercentage(dashboardData.overdueTasks || 0, dashboardData.totalTasks || 1);

    // Stats data
    const statsData = [
        {
            icon: totaltasks,
            value: dashboardData.totalTasks || 0,
            label: "Total Tasks",
            colorScheme: "blue"
        },
        {
            icon: totalcomplete,
            value: dashboardData.completedTasks || 0,
            label: "Completed",
            colorScheme: "green"
        },
        {
            icon: totalprogress,
            value: dashboardData.inProgressTasks || 0,
            label: "In Progress",
            colorScheme: "orange"
        },
        {
            icon: totalpending,
            value: dashboardData.pendingTasks || 0,
            label: "Pending",
            colorScheme: "red"
        },
        {
            icon: totalpending,
            value: dashboardData.overdueTasks || 0,
            label: "Overdue",
            colorScheme: "purple"
        }
    ];

    // Priority distribution
    const priorityData = dashboardData.priorityDistribution || {
        High: 0,
        Medium: 0,
        Low: 0
    };

    return (
        <>
            <AddTaskModal isOpen={isAddTaskModalOpen} onClose={closeAddTaskModal} projects={projects} employees={employeesData} />
            <ReadTaskModal isOpen={isReadTaskModalOpen} onClose={closeReadTaskModal} />
            
            <div className='app-main-container'>
              <div className='app-main-right-container'>
                
                    <Box p={4}>
                        {/* Stats Overview */}
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
                            {statsData.map((stat, index) => (
                                <StatCard 
                                    key={index}
                                    icon={stat.icon}
                                    value={stat.value}
                                    label={stat.label}
                                    colorScheme={stat.colorScheme}
                                />
                            ))}
                        </SimpleGrid>

                        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                            {/* Left Column */}
                            <GridItem>
                                {/* Recent Tasks */}
                                <Card bg={cardBg} mb={6}>
                                    <CardHeader>
                                        <Flex align="center">
                                            <FcStatistics size={24} />
                                            <Heading size="md" ml={2}>Recent Tasks</Heading>
                                        </Flex>
                                    </CardHeader>
                                    <CardBody>
                                        {recentTasks.length > 0 ? (
                                            <Stack spacing={4}>
                                                {recentTasks.map((task, index) => (
                                                    <TaskCard 
                                                        key={index}
                                                        title={task.title}
                                                        assignee={task.assignee?.name || 'Unassigned'}
                                                        status={task.status}
                                                        onRead={openReadTaskModal}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Text>No recent tasks</Text>
                                        )}
                                    </CardBody>
                                </Card>

                                {/* Priority Distribution */}
                                <Card bg={cardBg}>
                                    <CardHeader>
                                        <Heading size="md">Task Priority Distribution</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <SimpleGrid columns={3} spacing={4}>
                                            {Object.entries(priorityData).map(([priority, count]) => (
                                                <Box key={priority} textAlign="center">
                                                    <Text fontSize="sm" color={textColor}>{priority}</Text>
                                                    <Heading size="lg">{count}</Heading>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            </GridItem>

                            {/* Right Column */}
                            <GridItem>
                                {/* Task Status */}
                                <Card bg={cardBg} mb={6}>
                                    <CardHeader>
                                        <Flex align="center">
                                            <img src={complete} alt="Task status" style={{ width: '24px' }} />
                                            <Heading size="md" ml={2}>Task Status</Heading>
                                        </Flex>
                                    </CardHeader>
                                    <CardBody>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <ProgressCircle 
                                                value={completedPercentage} 
                                                label="Completed" 
                                                colorScheme="green" 
                                            />
                                            <ProgressCircle 
                                                value={inProgressPercentage} 
                                                label="In Progress" 
                                                colorScheme="blue" 
                                            />
                                            <ProgressCircle 
                                                value={pendingPercentage} 
                                                label="Pending" 
                                                colorScheme="orange" 
                                            />
                                            <ProgressCircle 
                                                value={overduePercentage} 
                                                label="Overdue" 
                                                colorScheme="red" 
                                            />
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>

                                {/* Quick Actions */}
                                <Card bg={cardBg}>
                                    <CardHeader>
                                        <Heading size="md">Quick Actions</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <Button 
                                            leftIcon={<IoMdAdd />} 
                                            colorScheme="teal" 
                                            w="full"
                                            onClick={openAddTaskModal}
                                        >
                                            Add New Task
                                        </Button>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    </Box>
                </div>
            </div>
        </>
    )
}

// Reusable Stat Card Component
const StatCard = ({ icon, value, label, colorScheme }) => (
    <Card variant="outline" borderLeft={`4px solid`} borderColor={`${colorScheme}.400`}>
        <CardBody>
            <Flex align="center">
                <Box mr={4}>
                    <img src={icon} alt={label} style={{ width: '30px' }} />
                </Box>
                <Box>
                    <Text fontSize="sm">{label}</Text>
                    <Heading size="lg">{value}</Heading>
                </Box>
            </Flex>
        </CardBody>
    </Card>
);

// Reusable Task Card Component
const TaskCard = ({ title, assignee, status, onRead }) => {
    const statusColor = {
        'Completed': 'green',
        'In Progress': 'blue',
        'Pending': 'orange',
        'Overdue': 'red'
    }[status] || 'gray';

    return (
        <Card variant="outline">
            <CardBody>
                <Flex justify="space-between" align="center">
                    <Box>
                        <Heading size="sm">{title}</Heading>
                        <Text fontSize="sm" color="gray.500">{assignee}</Text>
                    </Box>
                    <Badge colorScheme={statusColor}>{status}</Badge>
                </Flex>
            </CardBody>
        </Card>
    );
};

// Reusable Progress Circle Component
const ProgressCircle = ({ value, label, colorScheme }) => (
    <Box textAlign="center">
        <CircularProgress value={value} color={`${colorScheme}.400`} size="80px" thickness="8px">
            <CircularProgressLabel>{value}%</CircularProgressLabel>
        </CircularProgress>
        <Text mt={2} fontWeight="medium">{label}</Text>
    </Box>
);

export default Tasks;