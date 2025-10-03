import React, { useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    TouchableOpacity,
    Modal,
    Dimensions,
    TextInput,
    Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { Currency } from '@/types';
import { CURRENCIES } from '@/constants/Currencies';

const { width } = Dimensions.get('window');

export default function CalculatorScreen() {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(4.5); // Default MYR to USD rate
    const [baseCurrency, setBaseCurrency] = useState<Currency>(CURRENCIES[0]); // MYR
    const [targetCurrency, setTargetCurrency] = useState<Currency>(CURRENCIES[3]); // USD
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [selectingCurrency, setSelectingCurrency] = useState<'base' | 'target'>('base');
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [rateInput, setRateInput] = useState('');

    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];

    const inputNumber = (num: string) => {
        if (waitingForOperand) {
            setDisplay(num);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const performOperation = (nextOperation: string) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(String(inputValue));
        } else if (operation) {
            const prevValue = parseFloat(previousValue);
            let result: number;

            switch (operation) {
                case '+':
                    result = prevValue + inputValue;
                    break;
                case '-':
                    result = prevValue - inputValue;
                    break;
                case '×':
                    result = prevValue * inputValue;
                    break;
                case '÷':
                    result = prevValue / inputValue;
                    break;
                default:
                    return;
            }

            setDisplay(String(result));
            setPreviousValue(String(result));
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const calculate = () => {
        performOperation('=');
        setOperation(null);
        setPreviousValue(null);
        setWaitingForOperand(true);
    };

    const convertCurrency = () => {
        const amount = parseFloat(display);
        const converted = amount / exchangeRate;
        setDisplay(converted.toFixed(3));
        setWaitingForOperand(true);
    };

    const openCurrencyPicker = (type: 'base' | 'target') => {
        setSelectingCurrency(type);
        setCurrencyModalVisible(true);
    };

    const selectCurrency = (currency: Currency) => {
        if (selectingCurrency === 'base') {
            setBaseCurrency(currency);
        } else {
            setTargetCurrency(currency);
        }
        setCurrencyModalVisible(false);
    };

    const openRateModal = () => {
        setRateInput(exchangeRate.toString());
        setRateModalVisible(true);
    };

    const updateExchangeRate = () => {
        const newRate = parseFloat(rateInput);
        if (!isNaN(newRate) && newRate > 0) {
            setExchangeRate(newRate);
            setRateModalVisible(false);
        } else {
            Alert.alert('Invalid Rate', 'Please enter a valid exchange rate.');
        }
    };

    const renderButton = (
        onPress: () => void,
        style: any,
        textStyle: any,
        content: string | React.ReactNode
    ) => (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            {typeof content === 'string' ? (
                <Text style={[styles.buttonText, textStyle]}>{content}</Text>
            ) : (
                content
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Universal Calculator
                </Text>
            </View>

            {/* Currency Selection */}
            <View style={[styles.currencySection, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.currencyRow}>
                    <TouchableOpacity
                        style={[styles.currencyButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={() => openCurrencyPicker('base')}
                    >
                        <Text style={[styles.currencyText, { color: theme.colors.text }]}>
                            {baseCurrency.code}
                        </Text>
                        <FontAwesome name="chevron-down" size={12} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <FontAwesome name="exchange" size={16} color={theme.colors.textSecondary} style={styles.exchangeIcon} />

                    <TouchableOpacity
                        style={[styles.currencyButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={() => openCurrencyPicker('target')}
                    >
                        <Text style={[styles.currencyText, { color: theme.colors.text }]}>
                            {targetCurrency.code}
                        </Text>
                        <FontAwesome name="chevron-down" size={12} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Exchange Rate Input */}
                <View style={styles.rateSection}>
                    <Text style={[styles.rateLabel, { color: theme.colors.textSecondary }]}>
                        Exchange Rate: {baseCurrency.symbol}1 =
                    </Text>
                    <TouchableOpacity
                        style={[styles.rateInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                        onPress={openRateModal}
                    >
                        <Text style={[styles.rateText, { color: theme.colors.text }]}>
                            {exchangeRate.toFixed(3)} {targetCurrency.code}
                        </Text>
                        <FontAwesome name="edit" size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Display */}
            <View style={[styles.display, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.displayText, { color: theme.colors.text }]}>
                    {display}
                </Text>
            </View>

            {/* Currency Conversion Button */}
            <View style={styles.conversionRow}>
                <TouchableOpacity
                    style={[styles.conversionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={convertCurrency}
                >
                    <Text style={[styles.conversionButtonText, { color: theme.colors.background }]}>
                        Convert to {baseCurrency.code}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Calculator Buttons */}
            <View style={styles.buttonGrid}>
                <View style={styles.row}>
                    {renderButton(
                        clear,
                        [styles.operatorButton, { backgroundColor: theme.colors.error }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        'C'
                    )}
                    {renderButton(
                        () => performOperation('÷'),
                        [styles.operatorButton, { backgroundColor: theme.colors.secondary }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        '÷'
                    )}
                    {renderButton(
                        () => performOperation('×'),
                        [styles.operatorButton, { backgroundColor: theme.colors.secondary }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        '×'
                    )}
                    {renderButton(
                        () => {
                            if (display !== '0') {
                                setDisplay(display.slice(0, -1) || '0');
                            }
                        },
                        [styles.operatorButton, { backgroundColor: theme.colors.secondary }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        <FontAwesome name="arrow-left" size={18} color={theme.colors.background} />
                    )}
                </View>

                <View style={styles.row}>
                    {renderButton(
                        () => inputNumber('7'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '7'
                    )}
                    {renderButton(
                        () => inputNumber('8'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '8'
                    )}
                    {renderButton(
                        () => inputNumber('9'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '9'
                    )}
                    {renderButton(
                        () => performOperation('-'),
                        [styles.operatorButton, { backgroundColor: theme.colors.secondary }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        '-'
                    )}
                </View>

                <View style={styles.row}>
                    {renderButton(
                        () => inputNumber('4'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '4'
                    )}
                    {renderButton(
                        () => inputNumber('5'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '5'
                    )}
                    {renderButton(
                        () => inputNumber('6'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '6'
                    )}
                    {renderButton(
                        () => performOperation('+'),
                        [styles.operatorButton, { backgroundColor: theme.colors.secondary }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        '+'
                    )}
                </View>

                <View style={styles.row}>
                    {renderButton(
                        () => inputNumber('1'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '1'
                    )}
                    {renderButton(
                        () => inputNumber('2'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '2'
                    )}
                    {renderButton(
                        () => inputNumber('3'),
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '3'
                    )}
                    {renderButton(
                        calculate,
                        [styles.equalsButton, { backgroundColor: theme.colors.primary }],
                        [styles.operatorButtonText, { color: theme.colors.background }],
                        '='
                    )}
                </View>

                <View style={styles.row}>
                    {renderButton(
                        () => inputNumber('0'),
                        [styles.zeroButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '0'
                    )}
                    {renderButton(
                        inputDecimal,
                        [styles.numberButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
                        { color: theme.colors.text },
                        '.'
                    )}
                </View>
            </View>

            {/* Currency Selection Modal */}
            <Modal visible={currencyModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Select {selectingCurrency === 'base' ? 'Base' : 'Target'} Currency
                            </Text>
                            <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                                <FontAwesome name="times" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.currencyList}>
                            {CURRENCIES.map((currency) => (
                                <TouchableOpacity
                                    key={currency.code}
                                    style={[styles.currencyItem, { borderBottomColor: theme.colors.border }]}
                                    onPress={() => selectCurrency(currency)}
                                >
                                    <Text style={[styles.currencyItemText, { color: theme.colors.text }]}>
                                        {currency.code} - {currency.name}
                                    </Text>
                                    <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
                                        {currency.symbol}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Exchange Rate Input Modal */}
            <Modal visible={rateModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Set Exchange Rate
                            </Text>
                            <TouchableOpacity onPress={() => setRateModalVisible(false)}>
                                <FontAwesome name="times" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.rateModalContent}>
                            <Text style={[styles.rateModalLabel, { color: theme.colors.textSecondary }]}>
                                {baseCurrency.symbol}1 = ? {targetCurrency.code}
                            </Text>
                            <TextInput
                                style={[styles.rateModalInput, {
                                    backgroundColor: theme.colors.card,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.text
                                }]}
                                value={rateInput}
                                onChangeText={setRateInput}
                                keyboardType="numeric"
                                placeholder="Enter exchange rate"
                                placeholderTextColor={theme.colors.textTertiary}
                                autoFocus
                            />
                            <View style={styles.rateModalButtons}>
                                <TouchableOpacity
                                    style={[styles.rateModalButton, { backgroundColor: theme.colors.secondary }]}
                                    onPress={() => setRateModalVisible(false)}
                                >
                                    <Text style={[styles.rateModalButtonText, { color: theme.colors.background }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.rateModalButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={updateExchangeRate}
                                >
                                    <Text style={[styles.rateModalButtonText, { color: theme.colors.background }]}>
                                        Update
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    currencySection: {
        padding: 20,
    },
    currencyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    currencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        flex: 0.4,
        justifyContent: 'space-between',
    },
    currencyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    exchangeIcon: {
        flex: 0.2,
        textAlign: 'center',
    },
    rateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rateLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    rateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        gap: 8,
    },
    rateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    display: {
        padding: 20,
        alignItems: 'flex-end',
        minHeight: 80,
        justifyContent: 'center',
    },
    displayText: {
        fontSize: 32,
        fontWeight: '300',
    },
    conversionRow: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    conversionButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    conversionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    buttonGrid: {
        paddingHorizontal: 20,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 10,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '500',
    },
    numberButton: {
        flex: 1,
        borderWidth: 1,
    },
    operatorButton: {
        flex: 1,
    },
    operatorButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    equalsButton: {
        flex: 1,
    },
    zeroButton: {
        flex: 2,
        marginRight: 10,
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    currencyList: {
        paddingHorizontal: 20,
    },
    currencyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    currencyItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    currencySymbol: {
        fontSize: 16,
        fontWeight: '600',
    },
    rateModalContent: {
        padding: 20,
    },
    rateModalLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 12,
        textAlign: 'center',
    },
    rateModalInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    rateModalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    rateModalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    rateModalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});