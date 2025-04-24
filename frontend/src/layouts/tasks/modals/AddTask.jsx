import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Input,
    Textarea,
    Tag,
    Select,
    Flex,
    Box,
    Heading,
    Divider,
    useDisclosure,
    Collapse
} from '@chakra-ui/react';
import { useToast, Spinner } from '@chakra-ui/react';
import useAdminStore from '../../../store/admin.store';
import useUserStore from '../../../store/auth';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

function AddTaskModal({ isOpen, onClose, projects, employees }) {
    const toast = useToast();
    const { user } = useUserStore();
    const { createTask, loading } = useAdminStore();
    const { isOpen: isDeptOpen, onToggle: onToggleDept } = useDisclosure();
console.log("employees",employees)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignTo: '',
        department: '',
        project: '',
        startDate: '',
        dueDate: '',
        priority: 'Most Important',
        createdBy: user?.id || ''
    });

    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [employeesByDepartment, setEmployeesByDepartment] = useState({});
    const [projectsData, setProjectsData] = useState([]);

    const departments = ['Developer', 'Graphics Design', 'Marketing', 'Promotion', 'Video Editing'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // When department changes, filter employees
        if (name === 'department') {
            const filtered = employees.data.data.filter(emp => emp.department === value);
            setFilteredEmployees(filtered);
            setFormData(prev => ({ ...prev, assignTo: '' })); // Reset assignee when department changes
        }
    };

    const handleTagClick = (priority) => {
        setFormData({ ...formData, priority });
    };

    useEffect(() => {
        if (employees?.data?.data) {
            // Group employees by department
            const grouped = employees.data.data.reduce((acc, employee) => {
                const dept = employee.department;
                if (!acc[dept]) acc[dept] = [];
                acc[dept].push(employee);
                return acc;
            }, {});
            setEmployeesByDepartment(grouped);
        }

        if (projects?.data) {
            setProjectsData(projects.data);
        }

        if (user?.id) {
            setFormData(prev => ({ ...prev, createdBy: user.id }));
        }
    }, [employees, projects, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate due date is after start date
            if (formData.dueDate && formData.startDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
                toast({
                    title: 'Due date must be after start date',
                    status: 'error',
                    position: 'top',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            // Validate department is selected when assigning to someone
            if (formData.assignTo && !formData.department) {
                toast({
                    title: 'Please select a department first',
                    status: 'error',
                    position: 'top',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            await createTask(formData);
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                assignTo: '',
                department: '',
                project: '',
                startDate: '',
                dueDate: '',
                priority: 'Most Important',
                createdBy: user?.id || ''
            });
            
            toast({
                title: 'Task added successfully',
                status: 'success',
                position: 'top',
                duration: 5000,
                isClosable: true,
            });
            
            onClose();
        } catch (error) {
            toast({
                title: error.response?.data?.message || 'Failed to create task',
                status: 'error',
                position: 'top',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} isCentered>
            <ModalOverlay />
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Add Task</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input 
                            mt={3} 
                            mb={3} 
                            placeholder='Title' 
                            type='text' 
                            required 
                            name='title' 
                            value={formData.title} 
                            onChange={handleChange} 
                        />
                        <Textarea 
                            rows={7} 
                            mt={3} 
                            mb={3} 
                            placeholder='Description' 
                            type='text' 
                            required 
                            name='description' 
                            value={formData.description} 
                            onChange={handleChange} 
                        />

                        <Box mb={4}>
                            <Flex 
                                justifyContent="space-between" 
                                alignItems="center" 
                                cursor="pointer" 
                                onClick={onToggleDept}
                                p={2}
                                bg="gray.50"
                                borderRadius="md"
                            >
                                <Heading size="sm">Department Assignment</Heading>
                                {isDeptOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </Flex>
                            <Collapse in={isDeptOpen} animateOpacity>
                                <Box p={4} borderWidth="1px" borderRadius="md" mt={2}>
                                    <Select 
                                        mt={3} 
                                        mb={3} 
                                        placeholder='Select Department' 
                                        name='department' 
                                        value={formData.department} 
                                        onChange={handleChange}
                                        required={!!formData.assignTo}
                                    >
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </Select>

                                    {formData.department && (
                                        <>
                                            <Divider my={3} />
                                            <Select 
                                                mt={3} 
                                                mb={3} 
                                                placeholder='Assign To (Optional)' 
                                                name='assignTo' 
                                                value={formData.assignTo} 
                                                onChange={handleChange}
                                            >
                                                <option value="">None (Assign to whole department)</option>
                                                {employeesByDepartment[formData.department]?.map(employee => (
                                                    <option key={employee._id} value={employee._id}>
                                                        {`${employee.firstName} ${employee.lastName}`}
                                                    </option>
                                                ))}
                                            </Select>
                                        </>
                                    )}
                                </Box>
                            </Collapse>
                        </Box>

                        <Select 
                            mt={3} 
                            mb={3} 
                            placeholder='Project' 
                            required 
                            name='project' 
                            value={formData.project} 
                            onChange={handleChange}
                        >
                            {projectsData.map(project => (
                                <option key={project._id} value={project._id}>
                                    {project.title}
                                </option>
                            ))}
                        </Select>

                        <Flex gap={3} mt={3} mb={3}>
                            <Input 
                                flex={1}
                                placeholder='Start Date' 
                                type='date' 
                                required 
                                name='startDate' 
                                value={formData.startDate} 
                                onChange={handleChange} 
                            />
                            <Input 
                                flex={1}
                                placeholder='Due Date' 
                                type='date' 
                                name='dueDate' 
                                value={formData.dueDate} 
                                onChange={handleChange}
                                min={formData.startDate}
                            />
                        </Flex>

                        <Flex align="center" gap={3} mt={4} mb={4}>
                            <Box>Priority:</Box>
                            <Tag
                                size='lg'
                                cursor={'pointer'}
                                colorScheme={formData.priority === 'Most Important' ? 'red' : 'gray'}
                                borderRadius='full'
                                onClick={() => handleTagClick('Most Important')}
                            >
                                Most Important
                            </Tag>
                            <Tag
                                size='lg'
                                cursor={'pointer'}
                                colorScheme={formData.priority === 'Important' ? 'yellow' : 'gray'}
                                borderRadius='full'
                                onClick={() => handleTagClick('Important')}
                            >
                                Important
                            </Tag>
                            <Tag
                                size='lg'
                                cursor={'pointer'}
                                colorScheme={formData.priority === 'Least Important' ? 'green' : 'gray'}
                                borderRadius='full'
                                onClick={() => handleTagClick('Least Important')}
                            >
                                Least Important
                            </Tag>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='solid' color="white" bg='darkcyan' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button 
                            variant='outline' 
                            type='submit'
                            disabled={loading}
                            colorScheme="blue"
                        >
                            {loading ? <Spinner size="sm" /> : 'Add Task'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default AddTaskModal;