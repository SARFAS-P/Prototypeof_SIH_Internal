#!/bin/bash

echo "🔧 Fixing Mobile App Dependencies..."

# Navigate to mobile directory
cd mobile

# Clean install
echo "📦 Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# Install Expo CLI globally if not installed
echo "📱 Installing Expo CLI..."
npm install -g @expo/cli

# Install correct Expo modules
echo "🔧 Installing correct Expo modules..."
npx expo install expo-sqlite expo-secure-store expo-notifications expo-speech

# Fix any dependency issues
echo "🔧 Fixing dependencies..."
npx expo install --fix

echo "✅ Mobile app setup complete!"
echo "🚀 Run 'cd mobile && npm start' to start the app"
