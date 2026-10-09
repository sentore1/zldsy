# How to Add App Icons to Flutter Mobile App

## Overview
App icons appear on the device home screen and app drawer. Flutter apps need icons for different platforms (Android & iOS) in various sizes.

## Current Icon Locations

### Android Icons
**Location**: `android/app/src/main/res/`

Directory structure:
```
android/app/src/main/res/
├── mipmap-hdpi/
│   └── ic_launcher.png (72x72)
├── mipmap-mdpi/
│   └── ic_launcher.png (48x48)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144x144)
└── mipmap-xxxhdpi/
    └── ic_launcher.png (192x192)
```

### iOS Icons
**Location**: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

Contains various sizes from 20x20 to 1024x1024 pixels.

## Easy Method: Using flutter_launcher_icons Package

### 1. Add Package to pubspec.yaml

```yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/images/app_icon.png"
  # Optional: Use different icons for different platforms
  # image_path_android: "assets/images/icon_android.png"
  # image_path_ios: "assets/images/icon_ios.png"
  
  # Optional: Adaptive icon for Android
  adaptive_icon_background: "#005555"  # Your brand color
  adaptive_icon_foreground: "assets/images/app_icon_foreground.png"
```

### 2. Prepare Your Icon

**Requirements**:
- Size: 1024x1024 pixels (minimum)
- Format: PNG with transparency
- Design: Simple, recognizable at small sizes
- Location: `assets/images/app_icon.png`

**Tips**:
- Use your logo or brand mark
- Avoid thin lines (may not show at small sizes)
- High contrast colors work best
- Leave some padding around edges

### 3. Generate Icons

Run these commands:

```bash
# Install dependencies
flutter pub get

# Generate all icon sizes
flutter pub run flutter_launcher_icons
```

This automatically creates all required icon sizes for both platforms!

### 4. Rebuild the App

```bash
# Clean build
flutter clean

# Rebuild for Android
flutter build apk

# Or for development
flutter run
```

**Note**: Icon changes only appear after rebuilding the app, not with hot reload!

## Manual Method (Not Recommended)

If you want to add icons manually:

### For Android
1. Create icons in required sizes
2. Place in respective `mipmap-*` folders
3. Name them `ic_launcher.png`

### For iOS
1. Open `ios/Runner.xcworkspace` in Xcode
2. Select `Runner` > `Assets.xcassets` > `AppIcon`
3. Drag and drop icons for each size slot

## Adaptive Icons (Android Only)

Adaptive icons allow different shapes on different Android devices.

### Structure
```
android/app/src/main/res/
├── mipmap-anydpi-v26/
│   └── ic_launcher.xml
├── drawable/
│   └── ic_launcher_background.xml  (or .png)
└── drawable/
    └── ic_launcher_foreground.xml  (or .png)
```

### Using flutter_launcher_icons for Adaptive
```yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/images/app_icon.png"
  adaptive_icon_background: "#005555"  # Background color
  adaptive_icon_foreground: "assets/images/app_icon_foreground.png"
```

The foreground should be a transparent PNG with your logo centered in the middle 66% of the canvas.

## Recommended Workflow

1. **Design Icon**: Create 1024x1024 PNG with transparent background
2. **Save to Assets**: Place in `assets/images/app_icon.png`
3. **Update pubspec.yaml**: Add flutter_launcher_icons configuration
4. **Generate**: Run `flutter pub run flutter_launcher_icons`
5. **Test**: Rebuild and install app on device
6. **Verify**: Check home screen and app drawer

## Icon Design Tips

### Good Practices
- Use your brand colors
- Simple, recognizable design
- Works well at small sizes (48x48)
- Sufficient contrast with backgrounds
- Consistent with brand identity

### Avoid
- Text (hard to read at small sizes)
- Complex details (won't show up)
- Very thin lines
- Low contrast colors
- Photos (use stylized versions)

## Current ZLD Services Icon Suggestion

Based on your branding:

**Colors**: 
- Primary: #005555 (Teal)
- Secondary: #28A8AC (Light Teal)

**Design Ideas**:
1. "ZLD" monogram on teal background
2. Service tools icon with brand colors
3. Abstract wave/service mark
4. Company logo simplified

**Quick Start**:
```bash
# 1. Add your icon to assets/images/app_icon.png
# 2. Update pubspec.yaml with the configuration above
# 3. Run:
flutter pub get
flutter pub run flutter_launcher_icons
flutter clean
flutter run
```

## Troubleshooting

### Icon Not Updating
- Run `flutter clean` before rebuilding
- Uninstall old app completely
- Restart device (sometimes needed)
- Clear launcher cache

### Icon Looks Blurry
- Ensure source image is high resolution (1024x1024)
- Use PNG format, not JPG
- Don't scale up low-res images

### Adaptive Icon Not Working
- Check Android version (needs API 26+)
- Verify file paths are correct
- Ensure foreground has transparent background

## Useful Commands

```bash
# Get dependencies
flutter pub get

# Generate icons
flutter pub run flutter_launcher_icons

# Clean build
flutter clean

# Rebuild app
flutter run

# Build release APK
flutter build apk --release
```

## Resources

- [flutter_launcher_icons package](https://pub.dev/packages/flutter_launcher_icons)
- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Icon Generator Tool](https://appicon.co/)

---

**Quick Reference**:
- Icon location: `assets/images/app_icon.png`
- Minimum size: 1024x1024 pixels
- Format: PNG with transparency
- After adding: Run `flutter pub run flutter_launcher_icons`
- Then: `flutter clean && flutter run`
