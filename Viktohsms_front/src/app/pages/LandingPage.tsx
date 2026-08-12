import { useNavigate } from 'react-router';
import ViktohsLanding from '../components/ViktohsLanding';
import { SEO } from '../components/SEO';
import { StructuredData } from '../components/StructuredData';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signin');
  };

  return (
    <>
      <SEO
        title="Viktohs SMS - Instant Virtual Phone Numbers for SMS Verification"
        description="Get instant virtual phone numbers from 150+ countries. Verify any account, protect your privacy, and receive SMS codes instantly. Premium SMS verification service."
        keywords="virtual phone numbers, SMS verification, temporary phone numbers, SMS verification codes, online verification, social media verification, disposable phone numbers, SMS receive, Viktohs SMS"
        canonical="https://viktohssms.com/"
      />
      <StructuredData />
      <ViktohsLanding onGetStarted={handleGetStarted} />
    </>
  );
}