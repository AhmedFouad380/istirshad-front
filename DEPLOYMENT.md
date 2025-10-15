# Deployment Guide for Gadeer Angular App

## What Was Fixed

The main issue causing images not to load on the server was **incorrect asset paths** in `angular.json`:

### Before (❌ Wrong):
```json
"assets": [
  {
    "glob": "**/*",
    "input": "public",
    "output": "/public"  // Leading slash causes issues
  },
  {
    "glob": "**/*",
    "input": "src/assets/images",
    "output": "/assets/images"  // Leading slash causes issues
  }
]
```

### After (✅ Correct):
```json
"assets": [
  {
    "glob": "**/*",
    "input": "public"
  },
  {
    "glob": "**/*",
    "input": "src/assets",
    "output": "assets"  // No leading slash
  },
  "src/firebase-messaging-sw.js"
]
```

## Build for Production

```bash
npm run build
```

The output will be in `dist/gadeer/browser/` folder.

## Deployment Steps

### 1. Upload Files to Server

Upload the contents of `dist/gadeer/browser/` to your web server root directory.

**Important**: Upload the **contents** of the `browser` folder, not the folder itself.

Your server structure should look like:
```
/var/www/html/  (or your webroot)
├── assets/
│   ├── fonts/
│   └── images/
├── media/
├── index.html
├── main-XXXXXX.js
├── styles-XXXXXX.css
├── polyfills-XXXXXX.js
├── favicon.ico
└── firebase-messaging-sw.js
```

### 2. Configure Server

#### For Apache (.htaccess)

Create or update `.htaccess` in your webroot:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Enable caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### For Nginx (nginx.conf)

Add this to your server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

### 3. If Deploying to Subdirectory

If you're deploying to a subdirectory (e.g., `https://yourdomain.com/gadeer/`), you need to:

1. Build with base href:
```bash
ng build --base-href /gadeer/
```

2. Update your router configuration if needed.

### 4. Environment Variables

Make sure your production environment is configured correctly in `src/environments/environment.ts`.

### 5. Testing Checklist

After deployment, verify:

- [ ] Home page loads correctly
- [ ] All images are visible (check browser console for 404 errors)
- [ ] Navigation/routing works (refresh on any page should work)
- [ ] Firebase notifications work
- [ ] API calls work correctly
- [ ] Forms submit correctly
- [ ] Authentication works

## Common Issues

### Images Still Not Loading?

1. **Check browser console** for 404 errors
2. **Verify file permissions** on the server (755 for directories, 644 for files)
3. **Clear browser cache** and CDN cache if using one
4. **Check base href** matches your deployment path
5. **Verify CORS** if images are on different domain

### Routing Not Working?

Make sure you've configured server rewrites (see step 2 above).

### Firebase Not Working?

1. Check `firebase-messaging-sw.js` is at the root
2. Verify Firebase config in environment files
3. Check browser console for errors

## Useful Commands

```bash
# Build for production
npm run build

# Build with specific base href
ng build --base-href /subfolder/

# Test production build locally
npx http-server dist/gadeer/browser -p 8080

# Check file sizes
du -sh dist/gadeer/browser/*
```

## Performance Optimization

Your current bundle size is 6.23 MB. Consider:

1. **Lazy loading modules** - Load routes on demand
2. **Image optimization** - Compress images before deployment
3. **Enable CDN** - Serve static assets from CDN
4. **Tree shaking** - Already enabled in production build

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify all files uploaded correctly
4. Test locally with production build first
