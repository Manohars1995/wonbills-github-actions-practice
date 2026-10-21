import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Roboto',
    src: './fonts/Roboto/Roboto-Regular.ttf',
});

Font.register({
    family: 'Roboto-Bold',
    src: './fonts/Roboto/Roboto-Bold.ttf',
});

Font.register({
    family: 'Roboto-Light',
    src: './fonts/Roboto/Roboto-Light.ttf',
});

/* ─── Design Tokens ──────────────────────────────────────────── */
const BLUE_DARK   = '#1a4971';   // deep navy accent
const BLUE_MID    = '#2b6cb0';   // mid-tone for text highlights
const BLUE_LIGHT  = '#c6e2f7';   // original brand blue (header, accents)
const BLUE_PALE   = '#e8f4fd';   // alternate row tint
const STRIPE      = '#0d3458';   // left sidebar stripe
const TEXT_DARK   = '#0f2235';
const TEXT_MID    = '#2d4a63';
const TEXT_SOFT   = '#6b8aa0';
const WHITE       = '#ffffff';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',        // ← split: left sidebar + main content
        backgroundColor: WHITE,
        padding: 0,
        fontFamily: 'Roboto',
        fontSize: 10,
        color: TEXT_DARK,
    },

    /* ─── LEFT SIDEBAR ─────────────────────────── */
    sidebar: {
        width: '28%',
        backgroundColor: STRIPE,
        minHeight: '100%',
        padding: 24,
        flexDirection: 'column',
    },
    sidebarAccentBar: {
        width: 3,
        height: 40,
        backgroundColor: BLUE_LIGHT,
        marginBottom: 16,
    },
    sidebarTitle: {
        fontSize: 28,
        fontFamily: 'Roboto-Bold',
        color: WHITE,
        letterSpacing: 4,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    sidebarSubtitle: {
        fontSize: 9,
        color: BLUE_LIGHT,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 36,
    },
    sidebarLogoBox: {
        backgroundColor: BLUE_DARK,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        width: 72,
        height: 72,
    },
    sidebarImage: {
        width: 60,
        height: 60,
        objectFit: 'contain',
    },
    sidebarCompanyName: {
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        color: WHITE,
        marginBottom: 32,
        lineHeight: 1.4,
    },
    sidebarSectionLabel: {
        fontSize: 7,
        color: BLUE_LIGHT,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 6,
        marginTop: 20,
    },
    sidebarDivider: {
        height: 1,
        backgroundColor: BLUE_MID,
        marginBottom: 10,
        opacity: 0.5,
    },
    sidebarField: {
        fontSize: 9,
        color: '#a8cce4',
        marginBottom: 4,
        lineHeight: 1.5,
    },
    sidebarFieldBold: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: WHITE,
        marginBottom: 3,
    },
    sidebarBadge: {
        backgroundColor: BLUE_MID,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: 'auto',
        marginBottom: 20,
    },
    sidebarBadgeText: {
        fontSize: 8,
        fontFamily: 'Roboto-Bold',
        color: WHITE,
        letterSpacing: 1,
    },

    /* ─── MAIN CONTENT ─────────────────────────── */
    main: {
        width: '72%',
        flexDirection: 'column',
        padding: 28,
        paddingBottom: 60,
    },

    /* Top strip */
    topStrip: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: BLUE_LIGHT,
    },
    invoiceIdBox: {
        backgroundColor: BLUE_PALE,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    invoiceIdLabel: {
        fontSize: 7,
        color: TEXT_SOFT,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    invoiceIdValue: {
        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        color: BLUE_DARK,
        marginTop: 2,
    },

    /* Date row */
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 20,
        marginBottom: 24,
    },
    dateChip: {
        alignItems: 'flex-end',
    },
    dateLabel: {
        fontSize: 7,
        color: TEXT_SOFT,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    dateValue: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: TEXT_MID,
        marginTop: 2,
    },

    /* Count pill */
    countPill: {
        backgroundColor: BLUE_LIGHT,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    countPillText: {
        fontSize: 8,
        fontFamily: 'Roboto-Bold',
        color: BLUE_DARK,
        letterSpacing: 0.5,
    },

    /* ─── TABLE ─────────────────────────────────── */
    table: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#d4e8f5',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: BLUE_DARK,
    },
    tableColHeader: {
        width: '12.5%',
        paddingVertical: 8,
        paddingHorizontal: 5,
        fontSize: 7,
        fontFamily: 'Roboto-Bold',
        color: BLUE_LIGHT,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        borderRightWidth: 1,
        borderRightColor: BLUE_MID,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#ddeef9',
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: BLUE_PALE,
        borderBottomWidth: 1,
        borderBottomColor: '#ddeef9',
    },
    tableData: {
        width: '12.5%',
        paddingVertical: 7,
        paddingHorizontal: 5,
        fontSize: 8,
        color: TEXT_MID,
        borderRightWidth: 1,
        borderRightColor: '#e8f2fa',
    },
    tableDataHighlight: {
        width: '12.5%',
        paddingVertical: 7,
        paddingHorizontal: 5,
        fontSize: 8,
        fontFamily: 'Roboto-Bold',
        color: BLUE_DARK,
    },

    /* ─── TOTALS ─────────────────────────────────── */
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalsBox: {
        width: '46%',
        borderWidth: 1,
        borderColor: BLUE_LIGHT,
        borderRadius: 8,
        overflow: 'hidden',
    },
    totalsHeader: {
        backgroundColor: BLUE_LIGHT,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    totalsHeaderText: {
        fontSize: 8,
        fontFamily: 'Roboto-Bold',
        color: BLUE_DARK,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    totalsBody: {
        padding: 14,
    },
    subtotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddeef9',
    },
    subtotalLabel: {
        fontSize: 9,
        color: TEXT_SOFT,
    },
    subtotalValue: {
        fontSize: 9,
        color: TEXT_MID,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    grandTotalLabel: {
        fontSize: 11,
        fontFamily: 'Roboto-Bold',
        color: TEXT_DARK,
    },
    grandTotalValue: {
        fontSize: 15,
        fontFamily: 'Roboto-Bold',
        color: BLUE_DARK,
    },

    /* ─── FOOTER ─────────────────────────────────── */
    footer: {
        position: 'absolute',
        bottom: 0,
        left: '28%',          // aligns under main content only
        right: 0,
        height: 44,
        backgroundColor: BLUE_LIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 28,
    },
    footerBrand: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: BLUE_DARK,
        letterSpacing: 1,
    },
    footerText: {
        fontSize: 8,
        color: TEXT_MID,
    },
});

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toFixed(2);
const trunc = (str = '', max = 11) => {
    const s = String(str);
    return s.length > max ? `${s.slice(0, max)}…` : s;
};

/* ─── Component ───────────────────────────────────────────────── */
const Template2 = ({
    Data,
    subtotal,
    total,
    clientDetails = {},
    invoiceDetails = {},
    logoUrl,
    currencyPreferency = '$',
}) => {
    const safeData = Array.isArray(Data) ? Data : [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ══════════ SIDEBAR ══════════ */}
                <View style={styles.sidebar}>
                    <View style={styles.sidebarAccentBar} />

                    <Text style={styles.sidebarTitle}>INV</Text>
                    <Text style={styles.sidebarSubtitle}>Invoice Document</Text>

                    {/* Logo / Company */}
                    {logoUrl ? (
                        <View style={styles.sidebarLogoBox}>
                            <Image style={styles.sidebarImage} src={logoUrl} />
                        </View>
                    ) : (
                        <Text style={styles.sidebarCompanyName}>
                            {(clientDetails?.company_name || 'LOGO').toUpperCase()}
                        </Text>
                    )}

                    {/* Bill To */}
                    <Text style={styles.sidebarSectionLabel}>Billed To</Text>
                    <View style={styles.sidebarDivider} />
                    <Text style={styles.sidebarFieldBold}>
                        {clientDetails?.client_name || '—'}
                    </Text>
                    {clientDetails?.billing_address?.city ? (
                        <Text style={styles.sidebarField}>
                            {clientDetails.billing_address.city}
                        </Text>
                    ) : null}
                    {clientDetails?.billing_address?.province ? (
                        <Text style={styles.sidebarField}>
                            {clientDetails.billing_address.province}
                        </Text>
                    ) : null}
                    <Text style={styles.sidebarField}>
                        {[
                            clientDetails?.billing_address?.country,
                            clientDetails?.billing_address?.zip_code,
                        ].filter(Boolean).join(', ')}
                    </Text>

                    {/* Invoice Meta */}
                    <Text style={styles.sidebarSectionLabel}>Invoice Info</Text>
                    <View style={styles.sidebarDivider} />
                    <Text style={styles.sidebarField}>Invoice #</Text>
                    <Text style={styles.sidebarFieldBold}>{invoiceDetails?.id || '—'}</Text>

                    <Text style={[styles.sidebarField, { marginTop: 8 }]}>Issue Date</Text>
                    <Text style={styles.sidebarFieldBold}>{invoiceDetails?.date || '—'}</Text>

                    <Text style={[styles.sidebarField, { marginTop: 8 }]}>Due Date</Text>
                    <Text style={styles.sidebarFieldBold}>{invoiceDetails?.dueDate || '—'}</Text>

                    {/* Item count badge pushed to bottom */}
                    <View style={{ flex: 1 }} />
                    <View style={styles.sidebarBadge}>
                        <Text style={styles.sidebarBadgeText}>
                            {safeData.length} {safeData.length === 1 ? 'ITEM' : 'ITEMS'}
                        </Text>
                    </View>
                </View>

                {/* ══════════ MAIN ══════════ */}
                <View style={styles.main}>

                    {/* Top header strip */}
                    <View style={styles.topStrip}>
                        <View style={styles.invoiceIdBox}>
                            <Text style={styles.invoiceIdLabel}>Invoice Number</Text>
                            <Text style={styles.invoiceIdValue}>
                                {invoiceDetails?.id || 'INV-0000'}
                            </Text>
                        </View>
                    </View>

                    {/* Date chips */}
                    <View style={styles.dateRow}>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateLabel}>Date Issued</Text>
                            <Text style={styles.dateValue}>{invoiceDetails?.date || '—'}</Text>
                        </View>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateLabel}>Due Date</Text>
                            <Text style={styles.dateValue}>{invoiceDetails?.dueDate || '—'}</Text>
                        </View>
                    </View>

                    {/* Count pill */}
                    <View style={styles.countPill}>
                        <Text style={styles.countPillText}>
                            {safeData.length} line {safeData.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>

                    {/* Table */}
                    <View style={styles.table}>
                        {/* Header */}
                        <View style={styles.tableHeader}>
                            {['ID', 'Name', 'Unit Price', 'Tax', 'Discount', 'Qty', 'Price', 'Total'].map((h) => (
                                <View key={h} style={styles.tableColHeader}>
                                    <Text>{h}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Rows */}
                        {safeData.map((item, idx) => (
                            <View
                                key={idx}
                                style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                            >
                                <View style={styles.tableData}>
                                    <Text>{trunc(item?.item_id, 8)}</Text>
                                </View>
                                <View style={styles.tableData}>
                                    <Text>{trunc(item?.item_name, 10)}</Text>
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
                                    <Text>{currencyPreferency}{fmt(item?.price)}</Text>
                                </View>
                                <View style={styles.tableDataHighlight}>
                                    <Text>{currencyPreferency}{fmt(item?.total)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Totals */}
                    <View style={styles.totalsRow}>
                        <View style={styles.totalsBox}>
                            <View style={styles.totalsHeader}>
                                <Text style={styles.totalsHeaderText}>Summary</Text>
                            </View>
                            <View style={styles.totalsBody}>
                                {subtotal !== undefined && (
                                    <View style={styles.subtotalRow}>
                                        <Text style={styles.subtotalLabel}>Subtotal</Text>
                                        <Text style={styles.subtotalValue}>
                                            {currencyPreferency}{fmt(subtotal)}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.grandTotalRow}>
                                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                                    <Text style={styles.grandTotalValue}>
                                        {currencyPreferency}{fmt(total)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ══════════ FOOTER ══════════ */}
                <View style={styles.footer}>
                    <Text style={styles.footerBrand}>WONbills</Text>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={styles.footerText}>System-generated · No signature required</Text>
                </View>

            </Page>
        </Document>
    );
};

export default Template2;