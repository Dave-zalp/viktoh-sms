import { useNavigate, useParams, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import ActiveNumber from '../components/ActiveNumber';

interface PhoneNumber {
  id: string;
  number: string;
  service: string;
  price: number;
}

export default function ActiveNumberPage() {
  const navigate = useNavigate();
  const { numberId } = useParams();
  const location = useLocation();
  const [number, setNumber] = useState<PhoneNumber | null>(location.state?.number || null);

  useEffect(() => {
    // If no number in state, fetch it or redirect
    if (!number && numberId) {
      // In a real app, you'd fetch the number data by ID here
      // For now, redirect to dashboard if no number data
      navigate('/dashboard');
    }
  }, [number, numberId, navigate]);

  if (!number) {
    return null; // or a loading spinner
  }

  return <ActiveNumber number={number} />;
}