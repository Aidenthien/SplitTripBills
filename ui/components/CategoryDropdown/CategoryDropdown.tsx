import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { BillCategory } from '@/types';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { createCategoryDropdownStyles } from './CategoryDropdown.styles';

interface CategoryDropdownProps {
    selectedCategory: BillCategory;
    categories: BillCategory[];
    onSelectCategory: (category: BillCategory) => void;
    placeholder?: string;
}

export default function CategoryDropdown({
    selectedCategory,
    categories,
    onSelectCategory,
    placeholder = 'Select category'
}: CategoryDropdownProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const colorScheme = useColorScheme();
    const styles = createCategoryDropdownStyles(colorScheme);

    const renderCategoryItem = ({ item }: { item: BillCategory }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory.id === item.id && styles.selectedCategoryItem
            ]}
            onPress={() => {
                onSelectCategory(item);
                setIsDropdownOpen(false);
            }}
        >
            <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
                <FontAwesome name={item.icon as any} size={16} color={item.color} />
            </View>
            <Text style={[
                styles.categoryText,
                selectedCategory.id === item.id && styles.selectedCategoryText
            ]}>
                {item.name}
            </Text>
            {selectedCategory.id === item.id && (
                <FontAwesome name="check" size={16} color="#007AFF" style={styles.checkIcon} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.dropdownButton,
                    { borderColor: Colors[colorScheme ?? 'light'].text + '40' }
                ]}
                onPress={() => setIsDropdownOpen(true)}
            >
                <View style={styles.selectedCategory}>
                    <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color + '20' }]}>
                        <FontAwesome name={selectedCategory.icon as any} size={16} color={selectedCategory.color} />
                    </View>
                    <Text style={[styles.selectedCategoryText, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {selectedCategory.name}
                    </Text>
                </View>
                <FontAwesome
                    name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={Colors[colorScheme ?? 'light'].text + '60'}
                />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isDropdownOpen}
                onRequestClose={() => setIsDropdownOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDropdownOpen(false)}
                >
                    <View style={[styles.dropdownModal, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                                Select Category
                            </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsDropdownOpen(false)}
                            >
                                <FontAwesome name="times" size={18} color={Colors[colorScheme ?? 'light'].text} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={categories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            style={styles.categoryList}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}