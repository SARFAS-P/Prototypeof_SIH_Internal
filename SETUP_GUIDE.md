# 🚀 Complete Setup Guide for SIH25219 EHR Companion

## 📁 Project Structure
```
SIH_Internal/
├── .gitignore                 # Root gitignore
├── package.json              # Root package.json
├── server/                   # Backend API
│   ├── .gitignore
│   ├── index.js
│   └── package.json
├── mobile/                   # React Native Mobile App
│   ├── .gitignore
│   ├── package.json
│   ├── app.json
│   ├── babel.config.js
│   ├── metro.config.js
│   └── src/
├── dashboard/                # React Web Dashboard
│   ├── .gitignore
│   ├── package.json
│   └── src/
└── README.md
```

## 🔧 Fix Mobile App Issues

### **Option 1: Automatic Fix (Windows)**
```bash
# Run the fix script
fix-mobile.bat
```

### **Option 2: Manual Fix**
```bash
# Navigate to mobile directory
cd mobile

# Clean install
rm -rf node_modules package-lock.json
npm install

# Install Expo CLI globally
npm install -g @expo/cli

# Install correct Expo modules
npx expo install expo-sqlite expo-secure-store expo-notifications expo-speech

# Fix dependencies
npx expo install --fix
```

## 🚀 Complete Startup Sequence

### **Step 1: Start Backend**
```bash
# In root directory
npm start
```
**Expected:** "Server running on port 3000"

### **Step 2: Initialize Demo Data**
```bash
# In root directory
node demo-setup.js
```
**Expected:** "Demo setup completed successfully!"

### **Step 3: Start Mobile App**
```bash
# In mobile directory
cd mobile
npm start
```
**Expected:** Expo DevTools opens with QR code

### **Step 4: Start Dashboard**
```bash
# In new terminal, dashboard directory
cd dashboard
npm start
```
**Expected:** "webpack compiled successfully"

## 📱 Mobile App Access Methods

### **Method 1: Web Browser**
1. Press `w` in Expo terminal
2. App opens in browser
3. Use browser dev tools for mobile simulation

### **Method 2: Expo Go App**
1. Install Expo Go on phone
2. Scan QR code from terminal
3. App loads on phone

### **Method 3: Android Emulator**
1. Install Android Studio
2. Set up emulator
3. Press `a` in Expo terminal

## 🔐 Demo Credentials

### **ASHA Worker (Mobile App)**
- Phone: `9876543210`
- PIN: `1234`
- Features: Patient registration, visit recording, offline sync

### **PHC Staff (Dashboard)**
- Phone: `9876543211`
- PIN: `5678`
- Features: Patient management, analytics, reports

## 🎯 Testing the Enhanced Features

### **ASHA Worker Features**
1. **Login** with ASHA credentials
2. **Look for green banner** at top: "📝 Ready to Register a Patient?"
3. **Multiple registration buttons**:
   - Banner button
   - Quick Actions section
   - Floating Action Button
4. **Test patient registration** with voice input
5. **Test offline functionality**

### **PHC Staff Features**
1. **Login** with PHC credentials
2. **View patient dashboard** with real-time data
3. **Monitor sync status** and analytics
4. **Generate reports** and export data
5. **Manage patient records**

## 🔧 Troubleshooting

### **Mobile App Won't Start**
```bash
# Clear Expo cache
npx expo start -c

# Reset Metro cache
npx expo start --clear

# Kill port conflicts
npx kill-port 19000 19001 19002
```

### **Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Fix Expo modules
npx expo install --fix
```

### **Database Issues**
```bash
# Delete database and restart
rm server/ehr.db
npm start
node demo-setup.js
```

## 📦 Git Repository Setup

### **Initialize Git Repository**
```bash
# Initialize git
git init

# Add all files
git add .

# Commit initial version
git commit -m "Initial commit: SIH25219 EHR Companion"

# Add remote repository
git remote add origin <your-repo-url>

# Push to repository
git push -u origin main
```

### **Files Included in Repository**
- ✅ All source code
- ✅ Configuration files
- ✅ Documentation
- ✅ Setup scripts
- ❌ node_modules (ignored)
- ❌ Database files (ignored)
- ❌ Build artifacts (ignored)

## 🎉 Success Indicators

### **Backend Running**
- ✅ "Server running on port 3000"
- ✅ Demo data loaded (16 patients)
- ✅ API endpoints responding

### **Mobile App Running**
- ✅ Expo DevTools opens
- ✅ QR code displayed
- ✅ No module errors
- ✅ Login screen loads

### **Dashboard Running**
- ✅ "webpack compiled successfully"
- ✅ Dashboard loads at localhost:3001
- ✅ Login functionality works

## 🚀 Next Steps

1. **Test all features** thoroughly
2. **Fix any remaining issues**
3. **Push to repository**
4. **Prepare for demo/presentation**
5. **Deploy to production** (if needed)

**Your SIH25219 EHR Companion is ready to go! 🎉**
