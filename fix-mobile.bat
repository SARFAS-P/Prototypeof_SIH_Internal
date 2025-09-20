@echo off
echo 🔧 Fixing Mobile App Dependencies...

cd mobile

echo 📦 Cleaning and reinstalling dependencies...
rmdir /s /q node_modules
del package-lock.json
npm install

echo 📱 Installing Expo CLI...
npm install -g @expo/cli

echo 🔧 Installing correct Expo modules...
npx expo install expo-sqlite expo-secure-store expo-notifications expo-speech

echo 🔧 Fixing dependencies...
npx expo install --fix

echo ✅ Mobile app setup complete!
echo 🚀 Run 'cd mobile && npm start' to start the app
