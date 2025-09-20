const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'sih25219-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite Database
const db = new sqlite3.Database('./ehr.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    pin_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Patients table
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    sex TEXT NOT NULL,
    type TEXT NOT NULL,
    asha_id TEXT,
    address TEXT,
    language TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asha_id) REFERENCES users (user_id)
  )`);

  // Visits table
  db.run(`CREATE TABLE IF NOT EXISTS visits (
    visit_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    date_visited TEXT NOT NULL,
    vitals TEXT,
    notes TEXT,
    next_visit_date TEXT,
    synced INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
  )`);

  // Vaccinations table
  db.run(`CREATE TABLE IF NOT EXISTS vaccinations (
    vaccine_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    vaccine_name TEXT NOT NULL,
    due_date TEXT NOT NULL,
    administered_date TEXT,
    status TEXT DEFAULT 'due',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
  )`);

  // Sync log table
  db.run(`CREATE TABLE IF NOT EXISTS sync_log (
    sync_id TEXT PRIMARY KEY,
    asha_id TEXT NOT NULL,
    date TEXT NOT NULL,
    items_synced_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asha_id) REFERENCES users (user_id)
  )`);
});

// Encryption/Decryption utilities
const encryptData = (data) => {
  return crypto.AES.encrypt(JSON.stringify(data), 'ehr-secret-key').toString();
};

const decryptData = (encryptedData) => {
  const bytes = crypto.AES.decrypt(encryptedData, 'ehr-secret-key');
  return JSON.parse(bytes.toString(crypto.enc.Utf8));
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- Routes ---

// Authentication
app.post('/api/auth/login', async (req, res) => {
  const { phone, pin } = req.body;

  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPin = await bcrypt.compare(pin, user.pin_hash);
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user_id: user.user_id,
      role: user.role,
      name: user.name,
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register new user (for demo)
app.post('/api/auth/register', async (req, res) => {
  const { role, name, phone, pin } = req.body;

  try {
    const hashedPin = await bcrypt.hash(pin, 10);
    const user_id = uuidv4();

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (user_id, role, name, phone, pin_hash) VALUES (?, ?, ?, ?, ?)',
        [user_id, role, name, phone, hashedPin],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({ message: 'User registered successfully', user_id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Sync data from mobile
app.post('/api/sync/upload', authenticateToken, async (req, res) => {
  const { patients, visits, vaccinations } = req.body;
  const asha_id = req.user.user_id;

  try {
    let syncedCount = 0;

    // Sync patients
    if (patients && patients.length > 0) {
      for (const patient of patients) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR REPLACE INTO patients 
              (patient_id, name, dob, sex, type, asha_id, address, language) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [patient.patient_id, patient.name, patient.dob, patient.sex, 
             patient.type, asha_id, patient.address, patient.language],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        syncedCount++;
      }
    }

    // Sync visits
    if (visits && visits.length > 0) {
      for (const visit of visits) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR REPLACE INTO visits 
              (visit_id, patient_id, date_visited, vitals, notes, next_visit_date, synced) 
              VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [visit.visit_id, visit.patient_id, visit.date_visited, 
             visit.vitals, visit.notes, visit.next_visit_date],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        syncedCount++;
      }
    }

    // Sync vaccinations
    if (vaccinations && vaccinations.length > 0) {
      for (const vaccine of vaccinations) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR REPLACE INTO vaccinations 
              (vaccine_id, patient_id, vaccine_name, due_date, administered_date, status) 
              VALUES (?, ?, ?, ?, ?, ?)`,
            [vaccine.vaccine_id, vaccine.patient_id, vaccine.vaccine_name, 
             vaccine.due_date, vaccine.administered_date, vaccine.status],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        syncedCount++;
      }
    }

    // Log sync
    const sync_id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO sync_log (sync_id, asha_id, date, items_synced_count, status) VALUES (?, ?, ?, ?, ?)',
        [sync_id, asha_id, new Date().toISOString(), syncedCount, 'success'],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ 
      message: 'Sync successful', 
      items_synced: syncedCount,
      sync_id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Get patients for PHC dashboard
app.get('/api/phc/patients', authenticateToken, (req, res) => {
  const { asha_id, village } = req.query;
  
  let query = 'SELECT p.*, u.name as asha_name FROM patients p LEFT JOIN users u ON p.asha_id = u.user_id';
  let params = [];
  
  if (asha_id) {
    query += ' WHERE p.asha_id = ?';
    params.push(asha_id);
  }
  
  if (village) {
    query += asha_id ? ' AND p.address LIKE ?' : ' WHERE p.address LIKE ?';
    params.push(`%${village}%`);
  }
  
  query += ' ORDER BY p.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

// Get metrics for dashboard
app.get('/api/phc/metrics', authenticateToken, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_patients FROM patients',
    'SELECT COUNT(*) as total_visits FROM visits',
    'SELECT COUNT(*) as pending_vaccinations FROM vaccinations WHERE status = "due"',
    'SELECT COUNT(*) as synced_today FROM sync_log WHERE date(date) = date("now")'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(Object.values(row)[0]);
      });
    })
  )).then(([total_patients, total_visits, pending_vaccinations, synced_today]) => {
    res.json({
      total_patients,
      total_visits,
      pending_vaccinations,
      synced_today
    });
  }).catch(err => {
    res.status(500).json({ error: 'Metrics error' });
  });
});

// Export data
app.get('/api/phc/export', authenticateToken, (req, res) => {
  const { format = 'json' } = req.query;
  
  if (format === 'csv') {
    // Return CSV format
    db.all('SELECT * FROM patients', (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Export failed' });
      } else {
        const csv = 'patient_id,name,dob,sex,type,address,language\n' +
          rows.map(row => `${row.patient_id},${row.name},${row.dob},${row.sex},${row.type},${row.address},${row.language}`).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=patients.csv');
        res.send(csv);
      }
    });
  } else {
    // Return JSON format
    db.all('SELECT * FROM patients', (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Export failed' });
      } else {
        res.json(rows);
      }
    });
  }
});


// --- Demo Data Initialization ---
// This function contains the logic to create demo users and patients.
const initializeDemoData = async (req, res) => {
  try {
    // Create demo ASHA user
    const asha_id = uuidv4();
    const hashedPin = await bcrypt.hash('1234', 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO users (user_id, role, name, phone, pin_hash) VALUES (?, ?, ?, ?, ?)',
        [asha_id, 'asha', 'ASHA Lata', '9876543210', hashedPin],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Create demo PHC user
    const phc_id = uuidv4();
    const phcHashedPin = await bcrypt.hash('5678', 10);
    
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO users (user_id, role, name, phone, pin_hash) VALUES (?, ?, ?, ?, ?)',
        [phc_id, 'phc', 'Dr. Sharma', '9876543211', phcHashedPin],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Create demo patients
    const demoPatients = [
      {
        patient_id: uuidv4(), name: 'Priya Sharma', dob: '1995-03-15', sex: 'Female',
        type: 'pregnant', asha_id: asha_id, address: 'Village A, Block B', language: 'hi'
      },
      {
        patient_id: uuidv4(), name: 'Ravi Kumar', dob: '2020-08-10', sex: 'Male',
        type: 'child', asha_id: asha_id, address: 'Village A, Block B', language: 'en'
      }
    ];

    for (const patient of demoPatients) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO patients (patient_id, name, dob, sex, type, asha_id, address, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [patient.patient_id, patient.name, patient.dob, patient.sex, patient.type, patient.asha_id, patient.address, patient.language],
          (err) => err ? reject(err) : resolve()
        );
      });
    }

    res.json({ message: 'Demo data initialized successfully' });
  } catch (error) {
    console.error("Demo initialization failed:", error);
    res.status(500).json({ error: 'Demo initialization failed' });
  }
};

// Assign the handler to both GET and POST routes
app.get('/api/init-demo', initializeDemoData);
app.post('/api/init-demo', initializeDemoData);


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Demo data endpoint: GET or POST http://localhost:${PORT}/api/init-demo`);
});