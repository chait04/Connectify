import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';

function Dashboard() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center">
        <div className="text-center px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {greeting}!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to your dashboard
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
