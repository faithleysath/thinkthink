import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { supabase } from './lib/supabase';

function App() {
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Login />;
  }

  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-bold">ThinkThink</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
          Logout
        </button>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
