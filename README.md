# 💰 SplitTripBills - Travel Expense Splitting App

A React Native mobile application built with Expo that helps travelers split bills and calculate currency exchanges automatically.

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

### 🎨 Enhanced User Experience

#### ⌨️ Enhanced Input Handling
- **Keyboard-Aware Interface**: All screens automatically adjust when the keyboard appears
- **Smart Scrolling**: Input fields at the bottom of forms are automatically scrollable
- **Focus Management**: Tapping input fields ensures they remain visible above the keyboard
- **Cross-Platform Compatibility**: Optimized keyboard behavior for both iOS and Android

#### 🎭 Smooth Navigation Animations
- **Fluid Transitions**: Seamless slide animations between screens eliminate white flashes
- **Theme-Aware Backgrounds**: Consistent background colors during navigation transitions
- **Gesture-Enabled Navigation**: Smooth swipe-back gestures on supported platforms
- **Optimized Performance**: Hardware-accelerated animations with proper timing
- **Anti-Flicker Technology**: Advanced transition handling prevents white screen flashes
- **Platform-Optimized**: Different animation styles for iOS and Android following platform guidelines

#### 🎨 Theme System
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
   - **🔍 Search & Filter Bills**: Quick search by description or category with advanced filtering
   - **📅 Date Filtering**: Filter bills by Today, This Week, This Month, or All Time
   - **🏷️ Category Filtering**: Filter by multiple expense categories simultaneously
   - **🔄 Smart Results**: Real-time filtering with active filter indicators
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

7. **🧮 Universal Calculator Tab**
   - **Independent Calculator**: Standalone calculator accessible from main navigation
   - **Manual Exchange Rate**: Set any exchange rate manually for any currency pair
   - **Multi-Currency Support**: Choose from all supported currencies as base and target
   - **Real-time Updates**: Change exchange rates anytime without affecting trip settings
   - **Standard Operations**: Full calculator functionality (+, -, ×, ÷)
   - **Quick Conversion**: One-tap conversion from target to base currency
   - **Perfect for Travel**: Calculate costs on the go with current market rates

8. **🧮 Quick Calculator (Trip-Specific)**
   - **One-tap Access**: Calculator button in trip dashboard header
   - **Currency Conversion**: Convert target country currency back to your base currency (MYR)
   - **Basic Calculations**: Standard calculator functions (+, -, ×, ÷)
   - **Travel-focused**: Designed for travelers who need to convert foreign prices to home currency
   - **Always Available**: Accessible whenever you're viewing trip bills
   - **High Precision**: Shows 3 decimal places for accurate financial calculations

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

### 🔍 Searching and Filtering Bills

1. **Quick Search**:
   - Use the search bar at the top of any trip dashboard
   - Search by bill description or category name
   - Results update in real-time as you type
   - Clear search with the X button

2. **Advanced Filtering**:
   - Tap the **"Filter"** button next to the search bar
   - **iPhone-Style Date Picker**:
     - Select custom start date ("From" date) with intuitive day/month/year picker
     - Select custom end date ("To" date) with scrollable date components
     - Native iOS-style interface with separate day, month, and year selection
     - Smooth scrolling with snap-to-item behavior for precise selection
     - "Cancel" and "Done" buttons for easy confirmation
   - **Category Selection**:
     - Choose multiple categories simultaneously
     - Each category shows its icon and color coding
     - Filter by Food, Transportation, Accommodation, etc.

3. **Filter Management**:
   - **Active filter badge** shows number of applied filters
   - **Filter chips** display currently active filters below controls
   - **Clear button** appears when filters are active
   - **"Clear All"** resets all search and filter criteria

4. **Smart Results**:
   - Empty state changes based context (no bills vs. no results)
   - Filtered results maintain chronological order (newest first)
   - Combines search and filter criteria intelligently

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

### 🧮 Using the Universal Calculator

1. **Access the calculator**:
   - Tap the **"Calculator"** tab in the main navigation (middle tab)
   - Independent of any specific trip - works with any currency pair
2. **Select currencies**:
   - Tap the **base currency** dropdown to choose your home currency
   - Tap the **target currency** dropdown to choose the foreign currency
   - Exchange icon shows the conversion direction
3. **Set exchange rate**:
   - Tap the **exchange rate** area to open the rate input modal
   - Enter the current market rate (e.g., 4.500 for MYR to USD)
   - Tap **"Update"** to save the new rate
4. **Perform calculations**:
   - Use the calculator as normal for any mathematical operations
   - Enter amounts in the target currency
   - Tap **"Convert to [Base Currency]"** to see the equivalent
5. **Real-world usage**:
   - Check current exchange rates online and input them manually
   - Calculate costs before travel to different countries
   - Compare prices across different currencies
   - Get accurate conversions independent of any trip settings

### 🧮 Using the Quick Calculator (Trip-Specific)

1. **Access the calculator**:
   - From any trip dashboard, tap the **calculator icon** in the top-right corner
   - Calculator shows the conversion rate from target currency to your base currency
2. **Perform calculations**:
   - Use standard operations: +, -, ×, ÷
   - Enter amounts using the number pad
   - Clear calculations with the red "C" button
3. **Currency conversion**:
   - Enter the amount in the **target country's currency** (e.g., Korean Won, Japanese Yen)
   - Tap **"Convert to [Base Currency]"** to see the equivalent in your home currency (MYR)
   - Results show 3 decimal places for financial accuracy
4. **Real-world usage**:
   - Check menu prices to understand the real cost in MYR
   - Convert shopping prices before making purchases
   - Quickly evaluate if group expenses are reasonable
   - Calculate your portion of shared costs in familiar currency

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

---

## 🎆 **Ready to Split Bills Like a Pro?**

🚀 **Get Started**: Clone this repo and follow the installation guide above!

💬 **Questions?** Check the troubleshooting section or create an issue.

✨ **Contributions**: PRs welcome! Follow the project structure guidelines.