import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

export default function App() {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Navbar />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/structure" element={<Structure />} /> */}
              {/* <Route path="/processes" element={<Processes />} /> */}
              {/* <Route path="/scheduling" element={<Scheduling />} /> */}
              {/* <Route path="/deadlocks" element={<Deadlocks />} /> */}
            </Routes>
          </main>
        </div>
      </Router>
    );
  }