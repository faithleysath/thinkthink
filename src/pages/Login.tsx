import { supabase } from '../lib/supabase';
import { loginWithPasskey, registerWithPasskey } from '../lib/passkey';

export default function Login() {
  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="mb-6 text-3xl font-bold text-center">ThinkThink</h1>
        <div className="space-y-4">
          <button
            onClick={handleGitHubLogin}
            className="w-full px-4 py-2 font-bold text-white bg-gray-800 rounded hover:bg-gray-900"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={loginWithPasskey}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Sign in with Passkey
          </button>
          <div className="text-center text-sm text-gray-500">
            New here?{' '}
            <button onClick={() => {
                const email = window.prompt("Please enter your email to register with a passkey:");
                if (email) {
                    registerWithPasskey(email);
                }
            }} className="font-medium text-blue-600 hover:underline">
              Register with Passkey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
