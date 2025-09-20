import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, Wifi, Bell } from 'lucide-react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(phone, pin);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const demoLogin = (role) => {
    if (role === 'phc') {
      setPhone('9876543211');
      setPin('5678');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            EHR Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            PHC Staff Portal - SIH25219
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field mt-1"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-field mt-1"
                placeholder="Enter PIN"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Account</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => demoLogin('phc')}
              className="mt-4 w-full btn-secondary"
            >
              PHC Staff (9876543211 / 5678)
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Patient Management</h3>
              <p className="text-xs text-gray-500">View and manage patient records</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Real-time Sync</h3>
              <p className="text-xs text-gray-500">Monitor data synchronization</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Wifi className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Offline Support</h3>
              <p className="text-xs text-gray-500">Works in low-connectivity areas</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Bell className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">Smart Alerts</h3>
              <p className="text-xs text-gray-500">Vaccination and visit reminders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
