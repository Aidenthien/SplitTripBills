# 💰 SplitTripBills - Travel Expense Splitting App

A React Native mobile application built with Expo that helps travelers split bills and calculate currency exchanges automatically.

## 📱 **Screenshots & Demo**

> *Add screenshots here when available*

## 🎯 **Key Features at a Glance**

- 🏠 **Trip Room Management** - Create and organize travel expense groups
- 👥 **Multi-Traveler Support** - Add unlimited travelers to any trip
- 💱 **Currency Exchange** - Automatic conversions with custom rates
- 📊 **Smart Bill Splitting** - Equal or custom amount distribution
- 📸 **Receipt Photos** - Capture and embed receipt images
- 📄 **PDF Export** - Professional bill summaries with embedded photos
- 📱 **Native Sharing** - Share PDFs via WhatsApp, email, and more
- 🌙 **Dark Mode** - Automatic theme switching
- 💾 **Local Storage** - All data stored securely on device

## 🛠️ **Project Architecture**

This project follows a **clean architecture** with proper separation of concerns:

```
├── app/                    # Expo Router screens (entry points)
├── design/                 # Design System
│   └── theme/             # Colors, Typography, Spacing
├── ui/                    # UI Components
│   └── components/        # Reusable UI components
├── components/            # Business Logic
│   ├── business/          # Context providers & hooks
│   ├── hooks/            # Custom business hooks
│   └── providers/        # React Context providers
├── screens/              # Screen Components (using new architecture)
├── utils/                # Utilities & Helpers
├── types/                # TypeScript type definitions
└── constants/            # App constants
```

## 📝 Project Overview

SplitTripBills is designed to simplify the process of splitting travel expenses among friends while handling currency conversions automatically. The app allows users to create trip rooms, set up currency exchange rates, and split bills with automatic MYR (Malaysian Ringgit) conversions.

## ✨ User Experience Improvements

### ⌨️ Enhanced Input Handling
- **Keyboard-Aware Interface**: All screens automatically adjust when the keyboard appears
- **Smart Scrolling**: Input fields at the bottom of forms are automatically scrollable
- **Focus Management**: Tapping input fields ensures they remain visible above the keyboard
- **Cross-Platform Compatibility**: Optimized keyboard behavior for both iOS and Android

### 🎨 Theme System
- **Automatic Theme Detection**: Follows system light/dark mode preference
- **Real-time Theme Switching**: Changes instantly when system theme is modified
- **Consistent Design**: All UI elements maintain proper contrast in both themes
- **Accessibility Compliant**: Colors meet accessibility standards for readability

## Features

### Core Functionality

1. **Trip Room Management**
   - Create trip rooms/categories (e.g., "Korea 2024", "Japan Trip")
   - View all active trips with status indicators
   - Delete trips with confirmation

2. **Trip Setup**
   - Add travelers to the trip by name
   - Select base currency (default: Malaysian Ringgit - MYR)
   - Choose target currency from a dropdown list
   - Set custom exchange rates for accurate calculations

3. **Internal Trip Dashboard**
   - View trip details including travelers and exchange rates
   - Access all split bills for the trip
   - Create new split bills
   - Navigate to bill summaries

4. **Split Bill Creation**
   - Enter bill description and total amount
   - Select who paid for the bill (radio button selection)
   - Assign individual amounts to each traveler
   - Equal split functionality for convenience
   - Real-time MYR conversion display

5. **Bill Summary & Records**
   - Clean interface showing all bill details
   - Individual split breakdown
   - Payment summary showing who owes whom
   - Automatic MYR conversions for easy understanding
   - Bill history tracking
   - **Receipt Photo Attachments**: Optional photo capture for expense verification
   - **PDF Export & Sharing**: Generate professional PDF summaries with embedded receipt images

6. **Advanced Sharing Features**
   - **Automated PDF Generation**: One-click PDF creation with complete bill information
   - **Receipt Photo Integration**: All receipt photos embedded directly in PDF documents
   - **Smart Filename Convention**: PDFs named with trip, bill, date, and time (e.g., Korea2025_ThemeCafe_20Jan2025_1920.pdf)
   - **Cross-Platform Sharing**: Native sharing to WhatsApp, email, Google Drive, and other apps
   - **No Storage Impact**: Temporary PDF files automatically deleted after sharing
   - **Professional Layout**: Clean, print-ready PDF format with company branding

7. **Receipt Photo Management**
   - **Camera Integration**: Take photos directly within the app
   - **Multiple Photos**: Support for up to 5 receipt photos per bill
   - **Image Optimization**: Automatic base64 conversion for APK compatibility
   - **Thumbnail Preview**: Grid layout with photo numbering
   - **File Size Display**: Monitor storage usage per photo
   - **Easy Removal**: Delete photos with confirmation dialogs

8. **History Tab**
   - View all bills across all trips
   - Chronological bill history
   - Quick overview of past expenses

## 🔧 Technical Specifications

### 💻 Technology Stack
- **⚙️ Framework**: React Native with Expo
- **🧭 Navigation**: Expo Router (file-based routing)
- **📝 Language**: TypeScript
- **💾 Storage**: AsyncStorage for local data persistence
- **🎨 UI Components**: Custom components with Themed support
- **🎨 Icons**: FontAwesome from @expo/vector-icons
- **📸 Image Handling**: expo-image-picker for camera integration
- **📄 PDF Generation**: expo-print for automated document creation
- **📱 File Sharing**: expo-sharing for cross-platform sharing capabilities
- **📋 File System**: expo-file-system for image processing and file management

### 💱 Supported Currencies
- Malaysian Ringgit (MYR) - Default base currency
- South Korean Won (KRW)
- Japanese Yen (JPY)
- US Dollar (USD)
- Euro (EUR)
- British Pound (GBP)
- Singapore Dollar (SGD)
- Thai Baht (THB)
- Vietnamese Dong (VND)
- Indonesian Rupiah (IDR)

## 📦 Installation Guide

### 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)

### 🚀 Setup Instructions

1. **Clone the project** (if applicable) or navigate to the project directory:
   ```bash
   cd \"c:\\programming files\\Project\\SplitTripBills\"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install additional packages** (if not automatically installed):
   ```bash
   npx expo install expo-image-picker expo-print expo-sharing
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on device**:
   - Scan the QR code with Expo Go app (Android) or Camera app (iOS)
   - Or press 'w' for web preview
   - Or press 'a' for Android emulator (if configured)

## ⚙️ Configuration

### 💱 Currency Settings
The app uses Malaysian Ringgit (MYR) as the default base currency. To modify this:
1. Edit `constants/Currencies.ts`
2. Update the `DEFAULT_BASE_CURRENCY` constant

### 💹 Exchange Rates
- Exchange rates are manually entered by users for each trip
- Rates are stored per trip for historical accuracy
- Format: 1 MYR = X [Target Currency]

## 📚 Usage Instructions

### 🎆 Creating Your First Trip

1. **Open the app** and you'll see the \"Trip Rooms\" tab
2. **Tap the \"+\" button** to create a new trip
3. **Enter a trip name** (e.g., \"Korea 2024\")
4. **Tap \"Create\"** to proceed to trip setup

### 🛠️ Setting Up a Trip

1. **Add travelers** by entering names and tapping the \"+\" button
2. **Select target currency** from the dropdown (base currency is MYR)
3. **Enter exchange rate** (e.g., 300 for Korean Won)
4. **Tap \"Save & Continue\"** to access the trip dashboard

### ✂️ Creating Split Bills

1. **From the trip dashboard**, tap \"New Bill\"
2. **Enter bill details**:
   - Description (e.g., \"Lunch at Restaurant\")
   - Total amount in target currency
3. **Select category** from the dropdown list
4. **Add receipt photos** (optional but recommended):
   - Tap \"Take Receipt Photo\" to capture images
   - Add up to 5 photos per bill for verification
   - Photos are automatically optimized for sharing
5. **Select who paid** using radio buttons
6. **Assign amounts** to each traveler:
   - Enter individual amounts manually, or
   - Use \"Equal Split\" for even distribution
7. **Tap \"Create Bill\"** to generate the summary

### 📈 Understanding Bill Summaries

The bill summary shows:
- **Bill details**: Description, date, total amount
- **Individual splits**: What each person owes
- **Payment summary**: Who owes whom and how much
- **Currency conversions**: Both target currency and MYR amounts
- **Receipt photos**: Thumbnail grid of attached photos with tap-to-expand

### 📱 Sharing Bill Summaries

1. **From any bill summary**, tap the **share icon** in the top-right corner
2. **Automatic PDF generation**:
   - Creates a professional PDF with complete bill information
   - Embeds all receipt photos at full resolution
   - Uses smart filename: `TripName_BillTitle_20Jan2025_1920.pdf`
3. **Share options**:
   - WhatsApp, Email, Google Drive, and other installed apps
   - PDF is automatically deleted from device after sharing
   - No permanent storage impact on your device

### 📷 Managing Receipt Photos

1. **Taking photos**:
   - Use \"Take Receipt Photo\" button during bill creation
   - Camera opens directly within the app
   - Photos are automatically numbered and organized
2. **Viewing photos**:
   - Tap any thumbnail to view full-size image
   - Photos display in modal with dark overlay
   - Swipe or tap to close full-size view
3. **Removing photos**:
   - Tap the X button on any photo thumbnail
   - Confirmation dialog prevents accidental deletion

## 🔧 Troubleshooting

### ⚠️ Common Issues

1. **App won't start**: Ensure all dependencies are installed with `npm install`
2. **QR code not scanning**: Check that your device and computer are on the same network
3. **Data not saving**: The app uses local storage; data persists on the device only
4. **Currency calculations wrong**: Verify the exchange rate entered in trip setup
5. **Camera not working**: Ensure camera permissions are granted in device settings
6. **PDF generation failed**: Check that expo-print and expo-sharing are installed
7. **Receipt photos not displaying**: Images are converted to base64 for APK compatibility
8. **Share button disabled**: Ensure bill and trip data are fully loaded

### 🎯 Error Handling
- Invalid exchange rates are rejected with user-friendly messages
- Bill amounts are validated for mathematical consistency
- Required fields are enforced with appropriate error messages
- Camera permission requests are handled gracefully
- PDF generation errors provide detailed feedback
- Image conversion failures fall back to original file URIs

### 🔄 Resetting Data
To clear all app data:
1. Uninstall and reinstall the Expo Go app, or
2. Clear app data through device settings

## 🏗️ Architecture

### 📁 File Structure
```
app/
├── (tabs)/
│   ├── index.tsx          # Trip Rooms screen
│   ├── two.tsx            # History screen
│   └── _layout.tsx        # Tab navigation
├── trip-setup.tsx         # Trip setup screen
├── trip-dashboard.tsx     # Trip dashboard
├── create-bill.tsx        # Bill creation screen
├── bill-summary.tsx       # Bill summary screen
└── _layout.tsx           # Root navigation

ui/components/
├── BillShareButton/       # PDF generation and sharing
├── ReceiptPhotoUpload/    # Camera integration and photo management
├── Button/                # Reusable button components
├── Card/                  # Card layout components
└── providers/             # React Context providers

types/
└── index.ts              # TypeScript interfaces (includes ReceiptPhoto)

constants/
├── Colors.ts             # Theme colors
└── Currencies.ts         # Currency definitions
```

## 🚀 Future Enhancements

### 📋 Planned Features
1. **🌐 Multi-language support** for international travelers
2. **🔄 Automatic exchange rate updates** via API integration
3. **👥 Group chat integration** for bill discussions

---

## 🎆 **Ready to Split Bills Like a Pro?**

🚀 **Get Started**: Clone this repo and follow the installation guide above!

💬 **Questions?** Check the troubleshooting section or create an issue.

✨ **Contributions**: PRs welcome! Follow the project structure guidelines.