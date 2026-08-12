import { useNavigate, useParams, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import NumberSelection from '../components/NumberSelection';

interface Country {
  id: string;
  name: string;
  flag: string;
  available: number;
}

interface PhoneNumber {
  id: string;
  number: string;
  service: string;
  price: number;
}

export default function NumberSelectionPage() {
  const navigate = useNavigate();
  const { countryId } = useParams();
  const location = useLocation();
  const [country, setCountry] = useState<Country | null>(location.state?.country || null);

  useEffect(() => {
    // If no country in state, fetch it or redirect
    if (!country && countryId) {
      // In a real app, you'd fetch the country data by ID here
      // For now, redirect to dashboard if no country data
      navigate('/dashboard');
    }
  }, [country, countryId, navigate]);

  const handleSelectNumber = (number: PhoneNumber) => {
    navigate(`/dashboard/active/${number.id}`, { 
      state: { number, country, countryId } 
    });
  };

  if (!country) {
    return null; // or a loading spinner
  }

  return <NumberSelection country={country} onSelectNumber={handleSelectNumber} />;
}