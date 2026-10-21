
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Roboto',
    src: './fonts/Roboto/Roboto-Regular.ttf',
});

Font.register({
    family: 'Roboto-Bold',
    src: './fonts/Roboto/Roboto-Bold.ttf',
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        padding: 40,
        fontSize: 11,
        color: '#2d3748',
        backgroundColor: '#ffffff',
    },
    section: {
        marginBottom: 25,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Roboto-Bold',
        color: '#1a202c',
        letterSpacing: 1,
    },
    image: {
        width: 90,
        height: 90,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 22,
        fontFamily: 'Roboto-Bold',
        color: '#2b6cb0',
        letterSpacing: 0.5,
    },
    invoiceInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        backgroundColor: '#f7fafc',
        padding: 20,
        borderRadius: 8,
    },
    infoSection: {
        width: '48%',
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        color: '#2d3748',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoText: {
        fontSize: 10,
        color: '#4a5568',
        marginBottom: 3,
        lineHeight: 1.4,
    },
    infoBold: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: '#2d3748',
        marginBottom: 3,
    },
    countBadge: {
        alignSelf: 'flex-end',
        backgroundColor: '#edf2f7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginBottom: 15,
    },
    countText: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: '#4a5568',
    },
    table: {
        display: 'table',
        width: 'auto',
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2b6cb0',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#f7fafc',
    },
    tableColHeader: {
        width: '12.5%',
        padding: 10,
        fontSize: 9,
        fontFamily: 'Roboto-Bold',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    tableData: {
        width: '12.5%',
        padding: 10,
        fontSize: 9,
        color: '#4a5568',
        borderRightWidth: 1,
        borderRightColor: '#f1f1f1',
    },
    tableDataLast: {
        width: '12.5%',
        padding: 10,
        fontSize: 9,
        color: '#4a5568',
    },
    totalsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        marginBottom: 40,
    },
    totalsBox: {
        width: '45%',
        backgroundColor: '#f7fafc',
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 12,
        color: '#4a5568',
    },
    totalValue: {
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: '#2d3748',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 12,
        borderTopWidth: 2,
        borderTopColor: '#cbd5e0',
    },
    grandTotalLabel: {
        fontSize: 14,
        fontFamily: 'Roboto-Bold',
        color: '#1a202c',
    },
    grandTotalValue: {
        fontSize: 16,
        fontFamily: 'Roboto-Bold',
        color: '#2b6cb0',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    footerBrand: {
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: '#2b6cb0',
        marginBottom: 4,
    },
    footerText: {
        fontSize: 9,
        color: '#718096',
        marginBottom: 2,
    },
});

/* ---------- Helpers ---------- */
const formatMoney = (n) => Number(n || 0).toFixed(2);

const TruncatedText = ({ value = '', max = 12 }) => {
    const text = String(value);
    return <Text>{text.length > max ? `${text.slice(0, max)}...` : text}</Text>;
};

/* ---------- Component ---------- */
const Template1 = ({
    Data,
    subtotal,
    total,
    clientDetails = {},
    invoiceDetails = {},
    logoUrl,
    currencyPreferency,
}) => {
    const safeData = Array.isArray(Data) ? Data : [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View>
                        {logoUrl ? (
                            <Image style={styles.image} src={logoUrl} />
                        ) : (
                            <Text style={styles.companyName}>
                                {(clientDetails?.company_name || 'LOGO')}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.title}>INVOICE</Text>
                </View>

                {/* Invoice & Client Info */}
                <View style={styles.invoiceInfoContainer}>
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Invoice To:</Text>
                        <Text style={styles.infoBold}>{clientDetails?.client_name || 'Client Name'}</Text>
                        <Text style={styles.infoText}>{clientDetails?.billing_address?.city || ''}</Text>
                        <Text style={styles.infoText}>
                            {clientDetails?.billing_address?.country || ''}{clientDetails?.billing_address?.zip_code ? `, ${clientDetails.billing_address.zip_code}` : ''}
                        </Text>
                    </View>

                    <View style={[styles.infoSection, { alignItems: 'flex-end' }]}>
                        <Text style={styles.infoBold}>Invoice #: {invoiceDetails?.id || 'INV-0000'}</Text>
                        <Text style={styles.infoText}>Due Date: {invoiceDetails?.dueDate || 'N/A'}</Text>
                    </View>
                </View>

                {/* Item Count Badge */}
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>
                        {safeData.length} {safeData.length === 1 ? 'Item' : 'Items'}
                    </Text>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        {['ID', 'Name', 'Unit Price', 'Tax', 'Discount', 'Qty', 'Price', 'Total']
                            .map((h, idx) => (
                                <View key={h} style={styles.tableColHeader}>
                                    <Text>{h}</Text>
                                </View>
                            ))}
                    </View>

                    {/* Table Rows */}
                    {safeData.map((item, index) => (
                        <View style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={index}>
                            <View style={styles.tableData}>
                                <TruncatedText value={item?.item_id} max={14} />
                            </View>
                            <View style={styles.tableData}>
                                <TruncatedText value={item?.item_name} max={10} />
                            </View>
                            <View style={styles.tableData}>
                                <Text>{item?.value ?? 0}</Text>
                            </View>
                            <View style={styles.tableData}>
                                <Text>{item?.tax ?? 0}%</Text>
                            </View>
                            <View style={styles.tableData}>
                                <Text>{item?.discount ?? 0}%</Text>
                            </View>
                            <View style={styles.tableData}>
                                <Text>{item?.quantity ?? 0}</Text>
                            </View>
                            <View style={styles.tableData}>
                                <Text>{currencyPreferency}{formatMoney(item?.price)}</Text>
                            </View>
                            <View style={styles.tableDataLast}>
                                <Text style={{ fontFamily: 'Roboto-Bold' }}>
                                    {currencyPreferency}{formatMoney(item?.total)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Grand Total Section */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalsBox}>
                        {subtotal && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal</Text>
                                <Text style={styles.totalValue}>
                                    {currencyPreferency}{formatMoney(subtotal)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Grand Total</Text>
                            <Text style={styles.grandTotalValue}>
                                {currencyPreferency}{formatMoney(total)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerBrand}>WONbills</Text>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={styles.footerText}>This is a system-generated invoice. No signature required.</Text>
                </View>

            </Page>
        </Document>
    );
};

export default Template1;
