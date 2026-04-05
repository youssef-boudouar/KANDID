import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


function KanbanBoard()
{
    const status = ['screening', 'interview', 'technical', 'hired', 'rejected'];
    const [applications, setApplications] = useState([]);
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState('');

    useEffect(()=>{
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8000/job-offers/${id}/applications', {
            headers: {Authorization: `Bearer ${token}`}
        }).then(response => {
            setApplications(response.data);
        })
    },[])

}

export default KanbanBoard;
