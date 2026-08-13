import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import Dashboard from '@/pages/Dashboard';
import Visitors from '@/pages/Visitors';
import Visits from '@/pages/Visits';
import Hosts from '@/pages/Hosts';
import Settings from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/visits" element={<Visits />} />
              <Route path="/hosts" element={<Hosts />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;