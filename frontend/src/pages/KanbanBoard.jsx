import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function KanbanBoard() {
    const status = ["screening", "interview", "technical", "hired", "rejected"];
    const [applications, setApplications] = useState([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`http://localhost:8000/api/job-offers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setJobTitle(response.data.title);
            });
        axios
            .get(`http://localhost:8000/api/job-offers/${id}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setApplications(response.data);
            });
    }, []);

    const getByStatus = (status) => {
        return applications.filter((app) => app.status === status);
    };

    const onDragEnd = (result) => {
        if (!result.destination) return; // if the drag was out of droppable zones

        if (
            result.source.droppableId === result.destination.droppableId && // dropped on same place
            result.source.index === result.destination.index
        )
            return;

        const updatedApplications = applications.map((app) => {
            if (app.id === parseInt(result.draggableId)) {
                app.status = result.destination.droppableId;
                app.kanban_order = result.destination.index;
            }
            return app;
        });

        setApplications(updatedApplications);

        axios.put(
            `http://localhost:8000/api/applications/${result.draggableId}/move`,
            {
                status: result.destination.droppableId,
                kanban_order: result.destination.index,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    };
    return <div>Kanban Board - {jobTitle}</div>;
}

export default KanbanBoard;
