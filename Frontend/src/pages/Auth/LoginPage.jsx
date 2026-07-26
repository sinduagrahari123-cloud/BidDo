import LoginForm from '../../components/auth/LoginForm';
import { Link } from "react-router-dom";
function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LoginForm />
      <div className="text-right mt-2 mb-4">
    <Link
        to="/forgot-password"
        className="text-blue-600 hover:underline"
    >
        Forgot Password?
    </Link>
</div>
    </div>
  );
}

export default LoginPage;