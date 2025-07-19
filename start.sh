#!/bin/bash
# Test script for ChatBot React App

echo "🚀 Starting ChatBot React App..."
echo "📁 Current directory: $(pwd)"
echo "📦 Installing dependencies..."
npm install
echo "🔧 Building project..."
npm run build
echo "🚀 Starting development server..."
npm run dev
