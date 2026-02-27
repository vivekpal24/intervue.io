import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBadge from '../components/HeaderBadge';
import './HomePage.css';

const HomePage: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedRole) {
            navigate(`/${selectedRole}`);
        }
    };

    return (
        <div className="home-wrapper">
            <div className="home-content">
                <div className="text-center mb-8">
                    <HeaderBadge />
                </div>

                <div className="content-inner">
                    <h1 className="home-title">
                        Welcome to the <strong>Live Polling System</strong>
                    </h1>
                    <p className="home-subtitle">
                        Please select the role that best describes you to begin using the live polling<br />system
                    </p>

                    <div className="role-cards">
                        <div
                            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('student')}
                        >
                            <h3>I'm a Student</h3>
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                        </div>

                        <div
                            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('teacher')}
                        >
                            <h3>I'm a Teacher</h3>
                            <p>Submit answers and view live poll results in real-time.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        className="btn-primary continue-btn"
                        onClick={handleContinue}
                        disabled={!selectedRole}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
