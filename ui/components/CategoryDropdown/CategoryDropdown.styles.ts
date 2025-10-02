import { StyleSheet, Platform } from 'react-native';
import Colors from '@/constants/Colors';

export const createCategoryDropdownStyles = (colorScheme: 'light' | 'dark' | null) =>
    StyleSheet.create({
        container: {
            marginBottom: 16,
        },

        dropdownButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
        },

        selectedCategory: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },

        categoryIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },

        selectedCategoryText: {
            fontSize: 16,
            flex: 1,
        },

        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },

        dropdownModal: {
            width: '100%',
            maxHeight: '70%',
            borderRadius: 12,
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                },
                android: {
                    elevation: 12,
                },
            }),
        },

        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 20,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: Colors[colorScheme ?? 'light'].text + '20',
        },

        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
        },

        closeButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].surface || Colors[colorScheme ?? 'light'].background,
        },

        categoryList: {
            maxHeight: 400,
        },

        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: Colors[colorScheme ?? 'light'].text + '10',
        },

        selectedCategoryItem: {
            backgroundColor: Colors[colorScheme ?? 'light'].surface || Colors[colorScheme ?? 'light'].background,
        },

        categoryText: {
            fontSize: 16,
            flex: 1,
            color: Colors[colorScheme ?? 'light'].text,
        },

        checkIcon: {
            marginLeft: 8,
        },
    });