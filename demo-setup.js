// Demo Setup Script for SIH25219 EHR Companion
// Run this script to initialize demo data

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function setupDemo() {
  console.log('🚀 Setting up SIH25219 EHR Companion Demo...\n');

  try {
    // Initialize demo data
    console.log('📊 Initializing demo data...');
    const initResponse = await axios.post(`${API_BASE}/api/init-demo`);
    console.log('✅ Demo data initialized successfully\n');

    // Test ASHA login
    console.log('👩‍⚕️ Testing ASHA login...');
    const ashaLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      phone: '9876543210',
      pin: '1234'
    });
    console.log(`✅ ASHA login successful: ${ashaLogin.data.name}\n`);

    // Test PHC login
    console.log('🏥 Testing PHC login...');
    const phcLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      phone: '9876543211',
      pin: '5678'
    });
    console.log(`✅ PHC login successful: ${phcLogin.data.name}\n`);

    // Test metrics endpoint
    console.log('📈 Testing metrics endpoint...');
    const metricsResponse = await axios.get(`${API_BASE}/api/phc/metrics`, {
      headers: {
        'Authorization': `Bearer ${phcLogin.data.token}`
      }
    });
    console.log('✅ Metrics loaded:', metricsResponse.data);

    // Test patients endpoint
    console.log('👥 Testing patients endpoint...');
    const patientsResponse = await axios.get(`${API_BASE}/api/phc/patients`, {
      headers: {
        'Authorization': `Bearer ${phcLogin.data.token}`
      }
    });
    console.log(`✅ Patients loaded: ${patientsResponse.data.length} patients\n`);

    console.log('🎉 Demo setup completed successfully!');
    console.log('\n📱 Demo Credentials:');
    console.log('ASHA Worker: 9876543210 / 1234');
    console.log('PHC Staff: 9876543211 / 5678');
    console.log('\n🌐 Access Points:');
    console.log('Mobile App: http://localhost:19006 (Expo)');
    console.log('Dashboard: http://localhost:3001');
    console.log('API: http://localhost:3000');

  } catch (error) {
    console.error('❌ Demo setup failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDemo();
}

module.exports = { setupDemo };
