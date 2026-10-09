# Setup API Connection for Mobile App

## Quick Start

### Step 1: Find Your Local IP Address
```bash
# Windows (Command Prompt or PowerShell)
ipconfig

# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

### Step 2: Update Constants File
Open `lib/config/constants.dart` and update:

```dart
static const String apiBaseUrl = 'http://YOUR_IP_HERE:3000';
// Example: 'http://192.168.1.100:3000'
```

### Step 3: Install Dependencies
```bash
cd d:\zldsystem\zldapp
flutter pub get
```

### Step 4: Start Next.js Server
```bash
cd d:\zldsystem\service-management-system
npm run dev
```

The server should start at `http://localhost:3000`

### Step 5: Test API Connection
You can test if the API is accessible from your phone's browser:
1. Open browser on phone
2. Navigate to: `http://YOUR_IP:3000`
3. You should see the ZLD website

### Step 6: Run Mobile App
```bash
cd d:\zldsystem\zldapp
flutter run
```

## Troubleshooting

### Cannot Connect to API
1. **Check Firewall:** Ensure Windows Firewall allows connections on port 3000
   ```powershell
   # Run as Administrator
   New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```

2. **Check Same WiFi Network:** Both computer and phone must be on same network

3. **Test with curl:**
   ```bash
   curl http://YOUR_IP:3000/api/bookings
   ```

### Connection Refused
- Ensure Next.js dev server is running
- Check if port 3000 is in use by another application

### Network Error in App
- Verify API URL in `constants.dart` is correct
- Check phone can access the URL in browser first

## Production Setup

When deploying to production:

1. Deploy Next.js app (e.g., Vercel, AWS, etc.)
2. Get production URL (e.g., `https://zld-system.vercel.app`)
3. Update `constants.dart`:
   ```dart
   static const String apiBaseUrl = 'https://zld-system.vercel.app';
   ```
4. Rebuild app: `flutter build apk --release`

## Environment Variables (Advanced)

For dynamic configuration, you can use environment variables:

```bash
# When running Flutter
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:3000
```

The app already supports this in `constants.dart`:
```dart
static const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);
```
