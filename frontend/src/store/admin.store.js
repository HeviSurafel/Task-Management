import {create} from "zustand";
import axios from "../lib/axios";
const useAdminStore = create((set, get) => ({
    dashboardData: [],
    employeesData: [],
    projectsDashboard: [],
    tasksDashboard: [],
    projects: [],
    tasks: [],
    loading: false,
    error: null,
    getDashboard: async () => {
        set({ loading: true });
        try {
            const  data  = await axios.get("/dashboard");
            set({ dashboardData: data });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to get dashboard data" });
        } finally {
            set({ loading: false });
        }
    },
    getEmployees: async () => {
        set({ loading: true });
        try {
            const  data  = await axios.get("/employees");
            set({ employeesData: data });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to get employees data" });
        } finally {
            set({ loading: false });
        }
    },
    addEmployee: async (formData) => {
        set({ loading: true });
        try {
            const response = await axios.post("/employee", formData);
            set({ S: response });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to add employee" });
        } finally {
            set({ loading: false });
        }
    },
    addProject: async (formData) => {
        set({ loading: true });
        try {
            const response = await axios.post("/project", formData);
            set({ S: response });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to add project" });
        } finally {
            set({ loading: false });
        }
    },
    projectDashboard: async () => {
        set({ loading: true });
        try {
            const  data  = await axios.get("/project/dashboard");
            set({ projectsDashboard: data });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to get dashboard data" });
        } finally {
            set({ loading: false });
        }
    },
    taskDahboard: async () => {
        set({ loading: true });
        try {
            const  data  = await axios.get("/task/dashboard");
            set({ tasksDashboard: data });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to get dashboard data" });
        }
        finally {
            set({ loading: false });
        }
    },
    getProjects: async () => {
        set({ loading: true });
        try {
            const  data  = await axios.get("/projects");
            set({ projects: data });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to get dashboard data" });
        } finally {
            set({ loading: false });
        }
    },
    createTask: async (formData) => {
        set({ loading: true });
        try {
            const response = await axios.post("/task", formData);
            set({ tasks: response });
        } catch (error) {
            set({ error: error.response?.data?.message || "Failed to add task" });
        } finally {
            set({ loading: false });
        }
    }
}));
export default useAdminStore;