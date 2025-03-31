import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Sidenav from "../../components/sidenav/Sidenav";
import "./employees.css";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { IoMdAdd } from "react-icons/io";

import totaltasks from "../../assets/tasks/totaltasks.png";
import totalprogress from "../../assets/tasks/totalprogress.png";
import totalpending from "../../assets/tasks/totalpending.png";
import totalcomplete from "../../assets/tasks/totalcomplete.png";
import { FcStatistics } from "react-icons/fc";
import AddEmployeeModal from "./modals/AddEmployee";
import axios from "axios";
import useAdminStore from "../../store/admin.store";
function Employees() {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [employeesStats, setEmployeesStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inActiveEmployees: 0,
    terminatedEmployees: 0,
  });
  const {employeesData,getEmployees}=useAdminStore();

  const openAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(true);
  };

  const closeAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(false);
  };
  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <>
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={closeAddEmployeeModal}
      />
      <div className="app-main-container">
       
        <div className="app-main-right-container">
      
          
          <div className="table-main-header">
            <p className="table-header-text">Employees</p>
            <button className="table-btn" onClick={openAddEmployeeModal}>
              <IoMdAdd />
              Add Employee
            </button>
          </div>
          <TableContainer className="table-main-container">
            <Table variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Gender</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {employeesData &&
                  employeesData?.data?.data?.map((employee) => (
                    <Tr key={employee._id}>
                      <Td>{employee.employee_id}</Td>
                      <Td>{`${employee.firstName} ${employee.lastName}`}</Td>
                      <Td>{employee.email}</Td>
            
                      <Td>{employee.role}</Td>
                      <Td>{employee.status}</Td>
                      <Td>{employee.gender}</Td>
                      <Td>Button</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
}

export default Employees;
