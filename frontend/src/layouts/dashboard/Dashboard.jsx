import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import {
  CircularProgress,
  CircularProgressLabel,
  Box,
  Text,
  Flex,
  Grid,
  GridItem,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import "./dashboard.css";
import welcome from "../../assets/dashboard/welcome.png";
import complete from "../../assets/tasks/complete.png";
import totaltasks from "../../assets/tasks/totaltasks.png";
import totalprogress from "../../assets/tasks/totalprogress.png";
import totalpending from "../../assets/tasks/totalpending.png";
import totalcomplete from "../../assets/tasks/totalcomplete.png";
import { FcStatistics, FcApproval, FcClock, FcCancel } from "react-icons/fc";
import { GiProgression } from "react-icons/gi";
import Navbar from "../../components/navbar/Navbar";
import useAdminStore from "../../store/admin.store";

function Dashboard() {
  const { dashboardData, getDashboard } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("teal.600", "teal.300");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await getDashboard();
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getDashboard]);
console.log("dashboardData",dashboardData)
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const employees = dashboardData?.data?.data?.employees || {
    total: 0,
    active: 0,
    inactive: 0,
    terminated: 0,
    genderDistribution: [],
    departmentDistribution: [],
  };

  const activePercentage = calculatePercentage(
    employees.active,
    employees.total
  );
  const inactivePercentage = calculatePercentage(
    employees.inactive,
    employees.total
  );
  const terminatedPercentage = calculatePercentage(
    employees.terminated,
    employees.total
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress isIndeterminate color="teal" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <div className="app-main-container">
      <div className="app-main-right-container">
        {/* Welcome Banner */}
        <Card mb={6} borderRadius="xl" boxShadow="md" bg={cardBg}>
          <Flex direction={{ base: "column", md: "row" }} p={6}>
            <Box flex={2} textAlign={{ base: "center", md: "left" }}>
              <Heading size="lg" color={headingColor} mb={2}>
                Welcome to Task Management System
              </Heading>
              <Text fontSize="lg" color={textColor}>
                {employees.total > 0
                  ? `You have ${employees.total} employees in your organization`
                  : "No employees found"}
              </Text>
            </Box>
            <Box
              flex={1}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <img src={welcome} alt="welcome" style={{ maxHeight: "150px" }} />
            </Box>
          </Flex>
        </Card>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
          {/* Employee Statistics */}
          <GridItem>
            <Card borderRadius="xl" boxShadow="md" bg={cardBg}>
              <CardHeader>
                <Flex align="center">
                  <FcStatistics size={24} />
                  <Heading size="md" ml={2}>
                    Employee Statistics
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <Card
                    variant="outline"
                    p={4}
                    borderLeft="4px"
                    borderColor="teal.400"
                  >
                    <Flex align="center">
                      <Box mr={4}>
                        <img
                          src={totaltasks}
                          alt="total"
                          style={{ width: "40px" }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={textColor}>
                          Total Employees
                        </Text>
                        <Heading size="lg">{employees.total}</Heading>
                      </Box>
                    </Flex>
                  </Card>

                  <Card
                    variant="outline"
                    p={4}
                    borderLeft="4px"
                    borderColor="green.400"
                  >
                    <Flex align="center">
                      <Box mr={4}>
                        <img
                          src={totalcomplete}
                          alt="active"
                          style={{ width: "40px" }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={textColor}>
                          Active Employees
                        </Text>
                        <Heading size="lg">{employees.active}</Heading>
                      </Box>
                    </Flex>
                  </Card>

                  <Card
                    variant="outline"
                    p={4}
                    borderLeft="4px"
                    borderColor="blue.400"
                  >
                    <Flex align="center">
                      <Box mr={4}>
                        <img
                          src={totalpending}
                          alt="inactive"
                          style={{ width: "40px" }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={textColor}>
                          Inactive Employees
                        </Text>
                        <Heading size="lg">{employees.inactive}</Heading>
                      </Box>
                    </Flex>
                  </Card>

                  <Card
                    variant="outline"
                    p={4}
                    borderLeft="4px"
                    borderColor="red.400"
                  >
                    <Flex align="center">
                      <Box mr={4}>
                        <img
                          src={totalprogress}
                          alt="terminated"
                          style={{ width: "40px" }}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" color={textColor}>
                          Terminated
                        </Text>
                        <Heading size="lg">{employees.terminated}</Heading>
                      </Box>
                    </Flex>
                  </Card>
                </SimpleGrid>
              </CardBody>
            </Card>
          </GridItem>

          {/* Employee Status */}
          <GridItem>
            <Card borderRadius="xl" boxShadow="md" bg={cardBg} height="100%">
              <CardHeader>
                <Flex align="center">
                  <img src={complete} alt="status" style={{ width: "24px" }} />
                  <Heading size="md" ml={2}>
                    Employee Status
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Flex direction="column" justify="space-between" height="100%">
                  <SimpleGrid columns={3} spacing={4} textAlign="center">
                    <Box>
                      <CircularProgress
                        value={activePercentage}
                        color="green.400"
                        size="80px"
                        thickness="8px"
                      >
                        <CircularProgressLabel>
                          {activePercentage}%
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Text mt={2} fontWeight="medium">
                        Active
                      </Text>
                    </Box>
                    <Box>
                      <CircularProgress
                        value={inactivePercentage}
                        color="blue.400"
                        size="80px"
                        thickness="8px"
                      >
                        <CircularProgressLabel>
                          {inactivePercentage}%
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Text mt={2} fontWeight="medium">
                        Inactive
                      </Text>
                    </Box>
                    <Box>
                      <CircularProgress
                        value={terminatedPercentage}
                        color="red.400"
                        size="80px"
                        thickness="8px"
                      >
                        <CircularProgressLabel>
                          {terminatedPercentage}%
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Text mt={2} fontWeight="medium">
                        Terminated
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Additional Statistics */}
        {(employees?.genderDistribution.length > 0 ||
          employees?.departmentDistribution.length > 0) && (
          <Card borderRadius="xl" boxShadow="md" bg={cardBg} mb={6}>
            <CardHeader>
              <Heading size="md">Employee Demographics</Heading>
            </CardHeader>
            <CardBody>
              <Stack divider={<StackDivider />} spacing={4}>
                {employees.genderDistribution?.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={4}>
                      Gender Distribution
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {employees.genderDistribution.map((item, index) => (
                        <Card key={index} variant="outline" p={3}>
                          <Text fontSize="sm" color={textColor} mb={1}>
                            {item._id || "Unknown"}
                          </Text>
                          <Flex align="baseline">
                            <Heading size="md" mr={2}>
                              {item.count}
                            </Heading>
                            <Text fontSize="sm" color={textColor}>
                              (
                              {calculatePercentage(item.count, employees.total)}
                              %)
                            </Text>
                          </Flex>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {employees?.departmentDistribution?.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={4}>
                      Department Distribution
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                      {employees?.departmentDistribution?.map((item, index) => (
                        <Card key={index} variant="outline" p={3}>
                          <Text fontSize="sm" color={textColor} mb={1}>
                            {item._id || "Unknown"}
                          </Text>
                          <Flex align="baseline">
                            <Heading size="md" mr={2}>
                              {item.count}
                            </Heading>
                            <Text fontSize="sm" color={textColor}>
                              (
                              {calculatePercentage(item.count, employees.total)}
                              %)
                            </Text>
                          </Flex>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
