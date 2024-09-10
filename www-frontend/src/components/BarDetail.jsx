import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bar, setBar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await fetch(`/api/bars/${id}`);
        const data = await response.json();
        setBar(data);
      } catch (error) {
        console.error('Error fetching bar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBar();
  }, [id]);

  const handleViewEventsClick = () => {
    if (bar && bar.id) {
      navigate(`/bars/${bar.id}/events`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bar) {
    return <div>Bar not found.</div>;
  }

  return (
    <div className="bar-detail">
      <h1>{bar.name}</h1>
      <p>Address: {bar.address.line1}, {bar.address.line2}, {bar.address.city}</p>
      <p>Location: {bar.latitude}, {bar.longitude}</p>

      <button onClick={handleViewEventsClick}>View Events</button>
    </div>
  );
};

export default BarDetail;