import React, { useState, useRef } from 'react';
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
    FormControl,
    FormLabel,
    Box,
    Text,
    IconButton
} from '@chakra-ui/react';
import { useToast, Spinner } from '@chakra-ui/react';
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons';
import useAdminStore from '../../../store/admin.store';
function AddProjectModal({ isOpen, onClose }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const {addProject}=useAdminStore();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        clientName: '',
        startDate: '',
        status: 'On Hold',
        priority: 'Most Important'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusClick = (status) => {
        setFormData({ ...formData, status });
    };

    const handleTagClick = (priority) => {
        setFormData({ ...formData, priority });
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
     
            const formDataToSend = new FormData();

            // Append regular form data
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            // Append files
            files.forEach((file) => {
                formDataToSend.append('files', file);
            });
             await addProject(formDataToSend);

            // Reset form and files
            setFormData({
                title: '',
                description: '',
                clientName: '',
                startDate: '',
                status: 'On Hold',
                priority: 'Most Important'
            });
            setFiles([]);

            toast({
                title: "Project added successfully",
                status: 'success',
                position: 'top',
                duration: 5000,
                isClosable: true,
            });
            
            setLoading(false);
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            toast({
                title: errorMessage,
                status: 'error',
                position: 'top',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} isCentered>
            <ModalOverlay />
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>Add Project</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired mb={4}>
                            <Input placeholder='Title' type='text' name='title' value={formData.title} onChange={handleChange} />
                        </FormControl>

                        <FormControl isRequired mb={4}>
                            <Textarea rows={7} placeholder='Description' name='description' value={formData.description} onChange={handleChange} />
                        </FormControl>

                        <FormControl isRequired mb={4}>
                            <Input placeholder='Client Name' type='text' name='clientName' value={formData.clientName} onChange={handleChange} />
                        </FormControl>

                        <FormControl isRequired mb={4}>
                            <FormLabel>Start Date</FormLabel>
                            <Input placeholder="Start Date" type="date" name='startDate' value={formData.startDate} onChange={handleChange} />
                        </FormControl>

                        <FormControl mb={4}>
                            <FormLabel>Files (Optional)</FormLabel>
                            <Box border="1px dashed" borderColor="gray.200" p={4} borderRadius="md" textAlign="center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    multiple
                                    style={{ display: 'none' }}
                                />
                                <Button 
                                    leftIcon={<AttachmentIcon />} 
                                    onClick={() => fileInputRef.current.click()}
                                    variant="outline"
                                >
                                    Add Files
                                </Button>
                                <Text mt={2} fontSize="sm" color="gray.500">
                                    Upload project documents, images, or other files
                                </Text>
                            </Box>

                            {files.length > 0 && (
                                <Box mt={2}>
                                    {files.map((file, index) => (
                                        <Box 
                                            key={index} 
                                            display="flex" 
                                            alignItems="center" 
                                            justifyContent="space-between" 
                                            p={2} 
                                            borderWidth="1px" 
                                            borderRadius="md" 
                                            mb={1}
                                        >
                                            <Text isTruncated maxWidth="80%">{file.name}</Text>
                                            <IconButton
                                                icon={<CloseIcon />}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeFile(index)}
                                                aria-label="Remove file"
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </FormControl>

                        <FormControl isRequired mb={4}>
                            <FormLabel>Status</FormLabel>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                {['On Hold', 'In Progress', 'Testing', 'Completed'].map(status => (
                                    <Tag
                                        key={status}
                                        size='lg'
                                        cursor='pointer'
                                        colorScheme={formData.status === status ? 
                                            (status === 'On Hold' ? 'red' : 
                                             status === 'In Progress' ? 'blue' : 
                                             status === 'Testing' ? 'yellow' : 'green') : 'gray'}
                                        borderRadius='full'
                                        onClick={() => handleStatusClick(status)}
                                    >
                                        {status}
                                    </Tag>
                                ))}
                            </Box>
                        </FormControl>

                        <FormControl isRequired mb={4}>
                            <FormLabel>Priority</FormLabel>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                {['Most Important', 'Important', 'Least Important'].map(priority => (
                                    <Tag
                                        key={priority}
                                        size='lg'
                                        cursor='pointer'
                                        colorScheme={formData.priority === priority ? 
                                            (priority === 'Most Important' ? 'red' : 
                                             priority === 'Important' ? 'yellow' : 'green') : 'gray'}
                                        borderRadius='full'
                                        onClick={() => handleTagClick(priority)}
                                    >
                                        {priority}
                                    </Tag>
                                ))}
                            </Box>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant='solid' color="white" bg='darkcyan' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='outline' type='submit' isLoading={loading} loadingText="Submitting...">
                            Add Project
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}

export default AddProjectModal;