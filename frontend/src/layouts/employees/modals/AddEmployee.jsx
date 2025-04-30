
import React, { useState } from 'react';
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
    Tag,
    Select,
    FormControl,
    FormLabel,
    Stack,
    Text
} from '@chakra-ui/react';
import axios from 'axios';
import { useToast, Spinner } from '@chakra-ui/react';
import useAdminStore from '../../../store/admin.store';

function AddEmployeeModal({ isOpen, onClose }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        dateOfBirth: '',
        department:'',
        startDate: '',
        status: 'Active',
        gender: 'Male'
    });

    const { addEmployee } = useAdminStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusClick = (status) => {
        setFormData({ ...formData, status });
    };

    const handleGenderClick = (gender) => {
        setFormData({ ...formData, gender });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await addEmployee(formData);
            setFormData({
                employee_id: '1',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                residentialAddress: '',
                cnic: '',
                role: '',
                dateOfBirth: '',
                startDate: '',
                department:'',
                status: 'Active',
                gender: 'Male'
            });
            let Message = response.data.message;
            toast({
                title: "sucessfull created user",
                status: 'success',
                position: 'top',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
            onClose();
        } catch (error) {
            toast(error);
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} isCentered>
            <ModalOverlay />
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Add Employee</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={4}>
                            <Input type='text' required placeholder='First Name' name='firstName' value={formData.firstName} onChange={handleChange} />
                            <Input type='text' required placeholder='Last Name' name='lastName' value={formData.lastName} onChange={handleChange} />
                            <Input type='email' required placeholder='Email' name='email' value={formData.email} onChange={handleChange} />
                            <Input type='number' required placeholder='Phone' name='phone' value={formData.phone} onChange={handleChange} />
                            <Input type='text' required placeholder='Password' name='password' value={formData.password} onChange={handleChange} />
                            
                            <FormControl isRequired>
                                <Select 
                                    placeholder="Select Role" 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange}
                                >
                                    <option value="Ceo">Ceo</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Department Head">Department Head</option>
                                    <option value="Supervisor">Supervisor</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <Select 
                                    placeholder="Select departement" 
                                    name="department" 
                                    value={formData.department} 
                                    onChange={handleChange}
                                >
                                    <option value="Developer">Developer</option>
                                    <option value="Graphics Design">Graphics Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Promotion">Promotion</option>
                                    <option value="Video Editing">Video Editing</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Date of Birth</FormLabel>
                                <Input 
                                    placeholder="Date Of Birth" 
                                    type="date" 
                                    name='dateOfBirth' 
                                    value={formData.dateOfBirth} 
                                    onChange={handleChange} 
                                />
                                <Text fontSize="sm" color="gray.500">Select employee's date of birth</Text>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Start Date</FormLabel>
                                <Input 
                                    placeholder="Start Date" 
                                    type="date" 
                                    name='startDate' 
                                    value={formData.startDate} 
                                    onChange={handleChange} 
                                />
                                <Text fontSize="sm" color="gray.500">Select employee's start date</Text>
                            </FormControl>

                            <div className='priority-container'>
                                <p>Status: </p>
                                <Tag
                                    size='lg'
                                    cursor={'pointer'}
                                    colorScheme={formData.status === 'Active' ? 'green' : 'gray'}
                                    borderRadius='full'
                                    onClick={() => handleStatusClick('Active')}
                                >
                                    <p className='tag-text'>Active</p>
                                </Tag>
                                <Tag
                                    size='lg'
                                    cursor={'pointer'}
                                    colorScheme={formData.status === 'In Active' ? 'yellow' : 'gray'}
                                    borderRadius='full'
                                    onClick={() => handleStatusClick('In Active')}
                                >
                                    <p className='tag-text'>In Active</p>
                                </Tag>
                                <Tag
                                    size='lg'
                                    cursor={'pointer'}
                                    colorScheme={formData.status === 'Terminated' ? 'red' : 'gray'}
                                    borderRadius='full'
                                    onClick={() => handleStatusClick('Terminated')}
                                >
                                    <p className='tag-text'>Terminated</p>
                                </Tag>
                            </div>

                            <div className='priority-container'>
                                <p>Gender: </p>
                                <Tag
                                    size='lg'
                                    cursor={'pointer'}
                                    colorScheme={formData.gender === 'Male' ? 'green' : 'gray'}
                                    borderRadius='full'
                                    onClick={() => handleGenderClick('Male')}
                                >
                                    <p className='tag-text'>Male</p>
                                </Tag>
                                <Tag
                                    size='lg'
                                    cursor={'pointer'}
                                    colorScheme={formData.gender === 'Female' ? 'yellow' : 'gray'}
                                    borderRadius='full'
                                    onClick={() => handleGenderClick('Female')}
                                >
                                    <p className='tag-text'>Female</p>
                                </Tag>
                            </div>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='solid' color="white" bg='darkcyan' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='outline' type="submit">
                            {loading ? <Spinner color='green' /> : 'Add Employee'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default AddEmployeeModal;
