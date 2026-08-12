import { useNavigate } from 'react-router';
import SignUpViktohs from '../components/SignUpViktohs';
import { SEO } from '../components/SEO';

export default function SignUpPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <>
      <SEO
        title="Sign Up - Viktohs SMS"
        description="Create your Viktohs SMS account today and start verifying accounts with virtual phone numbers."
        canonical="https://viktohssms.com/signup"
      />
      <SignUpViktohs onSignIn={handleSignIn} />
    </>
  );
}