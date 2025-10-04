import React from 'react';
import { TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Trip, Bill, PaymentSummary } from '@/types';
import { createBillShareButtonStyles } from './BillShareButton.styles';
import { useColorScheme } from '@/components/useColorScheme';
import { useNotification } from '@/components/providers/NotificationProvider';
import { ColorSchemeName } from 'react-native';

interface BillShareButtonProps {
    trip: Trip | null;
    bill: Bill | null;
    paymentSummary: PaymentSummary[];
    disabled?: boolean;
}

export default function BillShareButton({
    trip,
    bill,
    paymentSummary,
    disabled = false
}: BillShareButtonProps) {
    const colorScheme = useColorScheme();
    const styles = createBillShareButtonStyles((colorScheme as 'light' | 'dark') ?? 'light');
    const { showError, showSuccess, showInfo } = useNotification();

    const generateHTMLContentWithBase64Images = (base64Images: string[]) => {
        if (!trip || !bill) return '';

        const payer = trip.travelers.find(t => t.id === bill.payerId);
        const billDate = new Date(bill.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let receiptPhotosHTML = '';
        if (base64Images.length > 0) {
            receiptPhotosHTML = `
                <div class="section">
                    <h3>📷 Receipt Photos</h3>
                    <div class="photos-grid">
                        ${base64Images.map((base64Image, index) => `
                            <div class="photo-container">
                                <img src="${base64Image}" alt="Receipt ${index + 1}" class="receipt-photo">
                                <div class="photo-number">${index + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bill Summary - ${bill.description}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .container { 
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .header { 
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #007AFF;
                }
                .app-name { 
                    color: #007AFF;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .bill-title { 
                    font-size: 32px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 8px;
                }
                .bill-date { 
                    color: #666;
                    font-size: 16px;
                    margin-bottom: 4px;
                }
                .bill-category { 
                    color: #007AFF;
                    font-size: 14px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .section { 
                    margin-bottom: 30px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #007AFF;
                }
                .section h3 { 
                    font-size: 20px;
                    margin-bottom: 15px;
                    color: #333;
                }
                .detail-row { 
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #eee;
                }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { 
                    font-weight: 500;
                    color: #666;
                }
                .detail-value { 
                    font-weight: 600;
                    color: #333;
                }
                .total-row {
                    border-top: 2px solid #007AFF;
                    margin-top: 8px;
                    padding-top: 12px;
                }
                .total-label {
                    font-weight: 700;
                    font-size: 18px;
                    color: #007AFF;
                }
                .total-value {
                    font-weight: 700;
                    font-size: 18px;
                    color: #007AFF;
                }
                .split-row { 
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                }
                .split-row:last-child { border-bottom: none; }
                .traveler-name { 
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 4px;
                }
                .traveler-amount { 
                    color: #007AFF;
                    font-weight: 600;
                }
                .traveler-amount-myr { 
                    color: #666;
                    font-size: 14px;
                }
                .payer-badge { 
                    background: #4CAF50;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .payment-row { 
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                }
                .payment-row:last-child { border-bottom: none; }
                .payment-text { 
                    margin-bottom: 8px;
                    font-size: 16px;
                }
                .debtor { 
                    color: #FF6B6B;
                    font-weight: bold;
                }
                .creditor { 
                    color: #4CAF50;
                    font-weight: bold;
                }
                .payment-amounts { 
                    display: flex;
                    justify-content: space-between;
                }
                .payment-amount { 
                    color: #FF9500;
                    font-weight: bold;
                }
                .photos-grid { 
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 15px;
                }
                .photo-container { 
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    background: #f8f9fa;
                    padding: 10px;
                }
                .receipt-photo { 
                    width: 100%;
                    height: auto;
                    max-height: 400px;
                    object-fit: contain;
                    border-radius: 4px;
                    background: white;
                }
                .photo-number { 
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: #007AFF;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                }
                .footer { 
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
                @media print {
                    body { background: white; }
                    .container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="app-name">📱 SplitTripBills</div>
                    <div class="bill-title">${bill.description}</div>
                    <div class="bill-date">${billDate}</div>
                    <div class="bill-category">${bill.category.name}</div>
                </div>

                <div class="section">
                    <h3>💰 Bill Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Base Amount</span>
                        <span class="detail-value">${trip.targetCurrency.symbol}${(bill.totalAmount - (bill.additionalCharges || 0)).toFixed(2)} ${trip.targetCurrency.code}</span>
                    </div>
                    ${bill.additionalCharges && bill.additionalCharges > 0 ? `
                    <div class="detail-row">
                        <span class="detail-label">Additional Charges</span>
                        <span class="detail-value">${trip.targetCurrency.symbol}${bill.additionalCharges.toFixed(2)} ${trip.targetCurrency.code}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row total-row">
                        <span class="detail-label total-label">Total Amount</span>
                        <span class="detail-value total-value">${trip.targetCurrency.symbol}${bill.totalAmount.toFixed(2)} ${trip.targetCurrency.code}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount (MYR)</span>
                        <span class="detail-value">RM ${(bill.totalAmount / trip.exchangeRate).toFixed(3)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Paid by</span>
                        <span class="detail-value">${payer?.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Exchange Rate</span>
                        <span class="detail-value">1 ${trip.baseCurrency.code} = ${trip.exchangeRate} ${trip.targetCurrency.code}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>👥 Individual Splits</h3>
                    ${bill.splits.map(split => {
            const traveler = trip.travelers.find(t => t.id === split.travelerId);
            const isPayer = split.travelerId === bill.payerId;
            return `
                            <div class="split-row">
                                <div>
                                    <div class="traveler-name">${traveler?.name} ${isPayer ? '(Payer)' : ''}</div>
                                    <div class="traveler-amount">${trip.targetCurrency.symbol}${split.amount.toFixed(2)} ${trip.targetCurrency.code}</div>
                                    <div class="traveler-amount-myr">≈ RM ${split.amountMYR.toFixed(3)}</div>
                                </div>
                                ${isPayer ? '<span class="payer-badge">PAID</span>' : ''}
                            </div>
                        `;
        }).join('')}
                </div>

                ${paymentSummary.length > 0 ? `
                <div class="section">
                    <h3>💸 Payment Summary</h3>
                    ${paymentSummary.map(payment => `
                        <div class="payment-row">
                            <div class="payment-text">
                                <span class="debtor">${payment.travelerName}</span> owes 
                                <span class="creditor">${payment.owesToName}</span>
                            </div>
                            <div class="payment-amounts">
                                <span class="payment-amount">${trip.targetCurrency.symbol}${payment.totalOwed.toFixed(2)} ${trip.targetCurrency.code}</span>
                                <span>RM ${payment.totalOwedMYR.toFixed(3)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${receiptPhotosHTML}

                <div class="footer">
                    Generated on ${new Date().toLocaleDateString()} by SplitTripBills App
                </div>
            </div>
        </body>
        </html>
        `;

        return html;
    };

    const convertImageToBase64 = async (uri: string): Promise<string> => {
        try {
            console.log('Converting image to base64...', uri);

            // If URI is already base64, return it as-is
            if (uri.startsWith('data:image/')) {
                console.log('Image is already in base64 format');
                return uri;
            }

            // Check if file exists first
            const fileInfo = await FileSystem.getInfoAsync(uri);
            console.log('File info:', fileInfo);

            if (!fileInfo.exists) {
                throw new Error(`File does not exist at path: ${uri}`);
            }

            // Convert to base64 using legacy FileSystem
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('Base64 conversion successful, length:', base64.length);
            return `data:image/jpeg;base64,${base64}`;

        } catch (error) {
            console.error('Error converting image to base64:', error);
            console.error('Original URI:', uri);

            // Show user-friendly error
            showError('Failed to process receipt image. Using fallback.');

            // Return original URI as fallback
            return uri;
        }
    };

    const generatePDF = async () => {
        if (!trip || !bill) {
            showError('Bill data not available for sharing.');
            return;
        }

        try {
            // Convert receipt photos to base64
            let processedPhotos: string[] = [];
            let conversionErrors = 0;

            if (bill.receiptPhotos && bill.receiptPhotos.length > 0) {
                for (let i = 0; i < bill.receiptPhotos.length; i++) {
                    const photo = bill.receiptPhotos[i];
                    console.log(`Processing photo ${i + 1}/${bill.receiptPhotos.length}:`, photo.uri);

                    const base64Image = await convertImageToBase64(photo.uri);
                    processedPhotos.push(base64Image);

                    // Check if conversion failed (fallback to original URI)
                    if (!base64Image.startsWith('data:image/')) {
                        conversionErrors++;
                    }
                }

                if (conversionErrors > 0) {
                    showInfo(`${conversionErrors} images using fallback mode. PDF may not display properly in some apps.`);
                }
            }

            // Generate HTML content with processed images
            const htmlContent = generateHTMLContentWithBase64Images(processedPhotos);

            // Create descriptive filename in format: TripName_BillTitle_20Jan2025_1920.pdf
            const billDate = new Date(bill.createdAt);

            // Format date as 20Jan2025
            const day = billDate.getDate().toString().padStart(2, '0');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[billDate.getMonth()];
            const year = billDate.getFullYear();
            const formattedDate = `${day}${month}${year}`;

            // Format time as 1920 (24-hour format)
            const hours = billDate.getHours().toString().padStart(2, '0');
            const minutes = billDate.getMinutes().toString().padStart(2, '0');
            const formattedTime = `${hours}${minutes}`;

            // Clean strings for filename (replace spaces and special chars with underscores)
            const cleanTripName = trip.name.replace(/[^a-zA-Z0-9]/g, '').trim();
            const cleanBillTitle = bill.description.replace(/[^a-zA-Z0-9]/g, '').trim();

            // Generate PDF using expo-print with custom filename
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false,
            });

            // Create new filename in format: TripName_BillTitle_20Jan2025_1920.pdf
            const customFilename = `${cleanTripName}_${cleanBillTitle}_${formattedDate}_${formattedTime}.pdf`;
            const newPdfPath = FileSystem.documentDirectory + customFilename;

            console.log('Moving PDF to custom filename:', customFilename);
            await FileSystem.moveAsync({
                from: uri,
                to: newPdfPath
            });

            console.log('PDF generated successfully at:', newPdfPath);

            // Share the PDF file with custom filename
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(newPdfPath, {
                    mimeType: 'application/pdf',
                    dialogTitle: `${cleanTripName}_${cleanBillTitle}_${formattedDate}_${formattedTime}`,
                    UTI: 'com.adobe.pdf',
                });
            } else {
                // Fallback to native share
                await Share.share({
                    url: newPdfPath,
                    title: `${cleanTripName}_${cleanBillTitle}_${formattedDate}_${formattedTime}`,
                });
            }

            // Clean up: Delete the temporary PDF file after sharing
            try {
                console.log('Cleaning up temporary PDF file...');
                await FileSystem.deleteAsync(newPdfPath, { idempotent: true });
                console.log('Temporary PDF file deleted successfully');
            } catch (cleanupError) {
                console.error('Error cleaning up temporary PDF file:', cleanupError);
                // Don't show error to user as this is just cleanup
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            showError(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleShare = async () => {
        await generatePDF();
    };

    const isDisabled = disabled || !trip || !bill;

    return (
        <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareButton, isDisabled && styles.disabledButton]}
            disabled={isDisabled}
        >
            <FontAwesome
                name="share-alt"
                size={20}
                color={isDisabled ? styles.disabledIcon.color : styles.activeIcon.color}
            />
        </TouchableOpacity>
    );
}