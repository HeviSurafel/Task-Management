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
import AddEmployeeModal from "./modals/AddEmployee";
import useAdminStore from "../../store/admin.store";

function Employees() {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const { employeesData, getEmployees } = useAdminStore();

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
              <span className="btn-text">Add Employee</span>
            </button>
          </div>
          <div className="table-responsive-container">
            <TableContainer className="table-main-container">
              <Table variant="striped" colorScheme="teal">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th className="responsive-hide">Role</Th>
                    <Th className="responsive-hide">Status</Th>
                    <Th className="responsive-hide">Gender</Th>
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
                        <Td className="responsive-hide">{employee.role}</Td>
                        <Td className="responsive-hide">{employee.status}</Td>
                        <Td className="responsive-hide">{employee.gender}</Td>
                        <Td>Button</Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </>
  );
}

export default Employees;