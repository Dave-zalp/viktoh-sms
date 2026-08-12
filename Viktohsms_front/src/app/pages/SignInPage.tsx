import { useNavigate } from 'react-router';
import SignInViktohs from '../components/SignInViktohs';
import { SEO } from '../components/SEO';

export default function SignInPage() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <>
      <SEO
        title="Sign In - Viktohs SMS"
        description="Sign in to your Viktohs SMS account to access virtual phone numbers for SMS verification."
        canonical="https://viktohssms.com/signin"
      />
      <SignInViktohs onSignUp={handleSignUp} onResetPassword={handleResetPassword} />
    </>
  );
}