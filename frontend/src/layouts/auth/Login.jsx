import React, { useState, useEffect } from 'react';
import "./login.css";
import loginpic from "../../assets/register/login.png";
import email from "../../assets/register/email.png";
import password from "../../assets/register/password.png";
import { Link } from 'react-router-dom';
import { useToast, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

function Login() {
    const navigate = useNavigate();
    const toast = useToast();
    const { user, login } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    useEffect(() => {
        if (user && (user.role === "Ceo" || user.role === "Employee" || user.role === "Department Head" || user.role === "supervisor")) {
            navigate("/admin/dashboard");
        } else if (user && user.role === "Employee") {
            navigate("/employee/overview");
        } else if (user) {
            navigate("/");
        }
    }, [user, navigate]);
    

    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        login(formData.email, formData.password);
    };

    return (
        <div className='login-main-container'>
            <div className='login-container'>
                <div className='login-left-container'>
                    <p className='signup-text'>Sign In</p>
                    <form onSubmit={handleSubmit}>
                        <div className='input-main-container'>
                            <img className='input-icon' src={email} alt="input" />
                            <input
                                placeholder='Email *'
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='input-main-container'>
                            <img className='input-icon' src={password} alt="input" />
                            <input
                                placeholder='Password *'
                                type={showPassword ? 'text' : 'password'} // Toggle input type
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className='password-toggle-icon'
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <button className='login-btn' type='submit'>
                            <p>{loading ? <Spinner color='white' /> : 'Login'}</p>
                        </button>
                    </form>
                    <p className='account-text'>Don’t have an account? <Link to='/register'><span>Sign Up</span></Link></p>
                </div>
                <div className='login-right-container'>
                    <img className='login-img' src={loginpic} alt="login" />
                </div>
            </div>
        </div>
    );
}

export default Login;