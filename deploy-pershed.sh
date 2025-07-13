#!/bin/bash

echo "🔧 Starting deployment..."

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building project..."
npm run build
npm run export

echo "📁 Moving build to dist/"
mv -f out dist

echo "🚀 Restarting nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
#!/bin/bash

echo "🔧 Starting deployment..."

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building project..."
npm run build
npm run export

echo "📁 Moving build to dist/"
mv -f out dist

echo "🚀 Restarting nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"


