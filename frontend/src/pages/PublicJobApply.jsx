import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublicJobApply() {
    const { id } = useParams();
    const navigate = useNavigate();
    const resumeRef = useRef(null);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fileName, setFileName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/api/public/jobs/${id}`)
            .then((response) => {
                setJob(response.data);
                setLoading(false);
            });
    }, []);

    const handleFileChange = (e) => {
        setFileName(e.target.files[0].name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('resume', resumeRef.current.files[0]);

        axios.post(`http://localhost:8000/api/public/jobs/${id}/apply`, formData)
        .then(() => {
            setSubmitted(true);
        })
        .catch(()=>{
            setError('Failed to submit application');
        });
    };

}

export default PublicJobApply;
