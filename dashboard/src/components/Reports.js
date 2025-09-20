import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  FileText,
  Activity
} from 'lucide-react';

const Reports = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Load metrics
      const metricsResponse = await fetch('http://localhost:3000/api/phc/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Load patients for detailed analysis
      const patientsResponse = await fetch('http://localhost:3000/api/phc/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const patientsData = await patientsResponse.json();
      setPatients(patientsData);
    } catch (error) {
      console.log('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/phc/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.log('Export failed:', error);
    }
  };

  // Generate mock data for charts
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      visits: Math.floor(Math.random() * 20) + 5,
      registrations: Math.floor(Math.random() * 10) + 2,
      vaccinations: Math.floor(Math.random() * 15) + 3
    }));
  };

  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      patients: Math.floor(Math.random() * 50) + 20,
      visits: Math.floor(Math.random() * 100) + 40,
      vaccinations: Math.floor(Math.random() * 80) + 30
    }));
  };

  const generateVillageData = () => {
    const villages = ['Village A', 'Village B', 'Village C', 'Village D', 'Village E'];
    return villages.map(village => ({
      village,
      patients: Math.floor(Math.random() * 30) + 10,
      pregnant: Math.floor(Math.random() * 15) + 5,
      children: Math.floor(Math.random() * 20) + 5
    }));
  };

  const generateAgeDistribution = () => {
    return [
      { age: '0-1', count: 15, color: '#10B981' },
      { age: '1-2', count: 12, color: '#3B82F6' },
      { age: '2-3', count: 18, color: '#F59E0B' },
      { age: '3-4', count: 14, color: '#EF4444' },
      { age: '4-5', count: 8, color: '#8B5CF6' },
      { age: '20-25', count: 25, color: '#06B6D4' },
      { age: '25-30', count: 30, color: '#84CC16' },
      { age: '30+', count: 20, color: '#F97316' }
    ];
  };

  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();
  const villageData = generateVillageData();
  const ageDistribution = generateAgeDistribution();

  const patientTypeData = [
    { name: 'Pregnant Women', value: patients.filter(p => p.type === 'pregnant').length, color: '#10B981' },
    { name: 'Children', value: patients.filter(p => p.type === 'child').length, color: '#3B82F6' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Health Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={() => handleExport('csv')}
                className="btn-primary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="btn-secondary flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.total_patients || 0}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.total_visits || 0}</div>
                <div className="text-sm text-gray-600">Total Visits</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.pending_vaccinations || 0}</div>
                <div className="text-sm text-gray-600">Due Vaccinations</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.synced_today || 0}</div>
                <div className="text-sm text-gray-600">Synced Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="registrations" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="vaccinations" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Patient Type Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={patientTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {patientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center space-x-4">
              {patientTypeData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="patients" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="vaccinations" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Village-wise Distribution */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Village-wise Patient Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={villageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="village" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#10B981" />
              <Bar dataKey="pregnant" fill="#3B82F6" />
              <Bar dataKey="children" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {ageDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-3" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium">{item.age} years</span>
                  </div>
                  <span className="text-sm font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
