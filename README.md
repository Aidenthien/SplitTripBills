# SplitTripBills - Travel Expense Splitting App

A React Native mobile application built with Expo that helps travelers split bills and calculate currency exchanges automatically.

## 🏗️ **Project Architecture**

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

### **Design System Structure**
- **`design/theme/colors.ts`** - Comprehensive color palette with light/dark themes
- **`design/theme/typography.ts`** - Typography scale and text styles
- **`design/theme/spacing.ts`** - Consistent spacing, shadows, and layout constants
- **`design/theme/index.ts`** - Main theme export and utilities

### **UI Components Structure**
- **`ui/components/Button/`** - Themeable button component with variants
- **`ui/components/Card/`** - Card component with elevation and padding options
- **`ui/components/Input/`** - Smart input with validation and auto-scroll
- **`ui/components/Screen/`** - Screen wrapper with keyboard handling

### **Business Logic Structure**
- **`components/providers/TripProvider.tsx`** - Trip data management context
- **`components/hooks/useBillCalculations.ts`** - Bill calculation logic
- **`components/hooks/useFormValidation.ts`** - Form validation utilities

### **Utilities Structure**
- **`utils/currency.ts`** - Currency formatting and conversion utilities
- **`utils/date.ts`** - Date formatting and manipulation utilities
- **`utils/validation.ts`** - Form validation rules and helpers
- **`utils/helpers.ts`** - General utility functions

## 📁 **File Organization Principles**

### **1. Separation of Concerns**
- **Design**: Pure design tokens and theme definitions
- **UI**: Presentation components with no business logic
- **Business**: Data management and business rules
- **Screens**: Composition of UI components with business logic
- **Utils**: Pure functions and utilities

### **2. Co-location**
- Related files are grouped together (component + styles + types)
- Each component has its own folder with index.ts for clean imports
- Styles are separated into `.styles.ts` files

### **3. Clean Imports**
```typescript
// ✅ Good - Clean imports
import { Button, Card, Input } from '@/ui/components';
import { useTripContext } from '@/components/business';
import { formatCurrency } from '@/utils';

// ❌ Bad - Direct file imports
import Button from '@/ui/components/Button/Button';
import { useTripContext } from '@/components/providers/TripProvider';
```

### **4. Style Separation**
```typescript
// Component file (MyComponent.tsx)
import { createMyComponentStyles } from './MyComponent.styles';

// Styles file (MyComponent.styles.ts)
export const createMyComponentStyles = (theme: Theme) => StyleSheet.create({
  // styles here
});
```

## Project Overview

SplitTripBills is designed to simplify the process of splitting travel expenses among friends while handling currency conversions automatically. The app allows users to create trip rooms, set up currency exchange rates, and split bills with automatic MYR (Malaysian Ringgit) conversions.

## User Experience Improvements

### Enhanced Input Handling
- **Keyboard-Aware Interface**: All screens automatically adjust when the keyboard appears
- **Smart Scrolling**: Input fields at the bottom of forms are automatically scrollable
- **Focus Management**: Tapping input fields ensures they remain visible above the keyboard
- **Cross-Platform Compatibility**: Optimized keyboard behavior for both iOS and Android

### Theme System
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

6. **History Tab**
   - View all bills across all trips
   - Chronological bill history
   - Quick overview of past expenses

## Technical Specifications

### Technology Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Storage**: AsyncStorage for local data persistence
- **UI Components**: Custom components with Themed support
- **Icons**: FontAwesome from @expo/vector-icons

### Supported Currencies
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

## Installation Guide

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)

### Setup Instructions

1. **Clone the project** (if applicable) or navigate to the project directory:
   ```bash
   cd \"c:\\programming files\\Project\\SplitTripBills\"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device**:
   - Scan the QR code with Expo Go app (Android) or Camera app (iOS)
   - Or press 'w' for web preview
   - Or press 'a' for Android emulator (if configured)

## Configuration

### Currency Settings
The app uses Malaysian Ringgit (MYR) as the default base currency. To modify this:
1. Edit `constants/Currencies.ts`
2. Update the `DEFAULT_BASE_CURRENCY` constant

### Exchange Rates
- Exchange rates are manually entered by users for each trip
- Rates are stored per trip for historical accuracy
- Format: 1 MYR = X [Target Currency]

## Usage Instructions

### Creating Your First Trip

1. **Open the app** and you'll see the \"Trip Rooms\" tab
2. **Tap the \"+\" button** to create a new trip
3. **Enter a trip name** (e.g., \"Korea 2024\")
4. **Tap \"Create\"** to proceed to trip setup

### Setting Up a Trip

1. **Add travelers** by entering names and tapping the \"+\" button
2. **Select target currency** from the dropdown (base currency is MYR)
3. **Enter exchange rate** (e.g., 331.65 for Korean Won)
4. **Tap \"Save & Continue\"** to access the trip dashboard

### Creating Split Bills

1. **From the trip dashboard**, tap \"New Bill\"
2. **Enter bill details**:
   - Description (e.g., \"Lunch at Restaurant\")
   - Total amount in target currency
3. **Select who paid** using radio buttons
4. **Assign amounts** to each traveler:
   - Enter individual amounts manually, or
   - Use \"Equal Split\" for even distribution
5. **Tap \"Create Bill\"** to generate the summary

### Understanding Bill Summaries

The bill summary shows:
- **Bill details**: Description, date, total amount
- **Individual splits**: What each person owes
- **Payment summary**: Who owes whom and how much
- **Currency conversions**: Both target currency and MYR amounts

## Troubleshooting

### Common Issues

1. **App won't start**: Ensure all dependencies are installed with `npm install`
2. **QR code not scanning**: Check that your device and computer are on the same network
3. **Data not saving**: The app uses local storage; data persists on the device only
4. **Currency calculations wrong**: Verify the exchange rate entered in trip setup

### Error Handling
- Invalid exchange rates are rejected with user-friendly messages
- Bill amounts are validated for mathematical consistency
- Required fields are enforced with appropriate error messages

### Resetting Data
To clear all app data:
1. Uninstall and reinstall the Expo Go app, or
2. Clear app data through device settings

## Architecture

### File Structure
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

types/
└── index.ts              # TypeScript interfaces

constants/
├── Colors.ts             # Theme colors
└── Currencies.ts         # Currency definitions
```

### Data Models
- **Trip**: Contains travelers, currencies, exchange rate, and bills
- **Bill**: Contains splits, payer information, and amounts
- **Traveler**: Basic user information for trip participants
- **Currency**: Currency definitions with symbols and names

### Storage Strategy
- All data is stored locally using AsyncStorage
- Data persists between app sessions
- No cloud synchronization (future enhancement opportunity)

## Future Enhancements

### Planned Features
1. **Cloud synchronization** for data backup and sharing
2. **Photo attachments** for bill receipts
3. **Multiple currency support** per bill
4. **Trip expense analytics** and reporting
5. **Push notifications** for payment reminders
6. **Export functionality** for trip summaries

### Technical Improvements
1. **Offline support** with data synchronization
2. **Real-time exchange rate** API integration
3. **Database migration** from AsyncStorage to SQLite
4. **User authentication** and profile management
5. **Performance optimizations** for large datasets

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain consistent code formatting
3. Add proper error handling for all async operations
4. Update documentation for new features
5. Test on both iOS and Android platforms

### Code Style
- Use meaningful variable and function names
- Add comments for complex business logic
- Follow React Native performance best practices
- Implement proper error boundaries

## Support

### Getting Help
- Check the troubleshooting section above
- Review the usage instructions
- Test with the provided sample data flow

### Known Limitations
- Data is stored locally only (no cloud backup)
- Exchange rates must be entered manually
- Limited to 10 predefined currencies
- No receipt photo storage

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Platform**: React Native (iOS/Android)  
**License**: MIT