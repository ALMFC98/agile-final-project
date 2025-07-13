#!/bin/bash

echo "🔧 Building Per Shed Intelligence Console..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Deployment aborted."
  exit 1
fi

# Optional backup
timestamp=$(date +%Y%m%d_%H%M)
mkdir -p ~/build-archives
zip -r ~/build-archives/dist_$timestamp.zip dist/ > /dev/null

echo "✅ Build archived to ~/build-archives/dist_$timestamp.zip"

# Reload nginx
echo "🔁 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# Confirm success
if [ $? -eq 0 ]; then
  echo "🚀 Deployment successful at $(date)" | tee -a ~/deployments.log
else
  echo "❌ Nginx reload failed. Check config or SSL."
  exit 2
fi
