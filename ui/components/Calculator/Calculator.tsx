import React, { useState } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { themes } from '@/design/theme';
import { Currency } from '@/types';
import { createCalculatorStyles } from './Calculator.styles';

interface CalculatorProps {
    visible: boolean;
    onClose: () => void;
    baseCurrency: Currency;
    targetCurrency: Currency;
    exchangeRate: number;
}

const { width } = Dimensions.get('window');

export default function Calculator({
    visible,
    onClose,
    baseCurrency,
    targetCurrency,
    exchangeRate,
}: CalculatorProps) {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<string | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const colorScheme = useColorScheme();
    const theme = themes[colorScheme ?? 'light'];
    const styles = createCalculatorStyles(theme);

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
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            Quick Calculator
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <FontAwesome name="times" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Exchange Rate Info */}
                    <View style={[styles.rateInfo, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.rateText, { color: theme.colors.textSecondary }]}>
                            {baseCurrency.symbol}1 = {exchangeRate.toFixed(3)} {targetCurrency.code}
                        </Text>
                        <Text style={[styles.rateSubText, { color: theme.colors.textTertiary }]}>
                            Enter {targetCurrency.code} amount to convert
                        </Text>
                    </View>

                    {/* Display */}
                    <View style={[styles.display, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.displayText, { color: theme.colors.text }]}>
                            {display}
                        </Text>
                    </View>

                    {/* Currency Conversion Button */}
                    <View style={styles.conversionRow}>
                        {renderButton(
                            convertCurrency,
                            [styles.conversionButton, { backgroundColor: theme.colors.primary }],
                            [styles.conversionButtonText, { color: theme.colors.background }],
                            `Convert to ${baseCurrency.code}`
                        )}
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
                </View>
            </View>
        </Modal>
    );
}