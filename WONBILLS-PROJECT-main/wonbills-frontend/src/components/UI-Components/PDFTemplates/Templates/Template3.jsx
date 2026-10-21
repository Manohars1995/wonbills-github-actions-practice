// import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// const ImgUrl = 'https://res.cloudinary.com/dca9sij3n/image/upload/v1733218612/vdzpaijkr6k0fhvzsl8e.png'
// // Register fonts
// Font.register({
//     family: 'Roboto',
//     src: './fonts/Roboto/Roboto-Regular.ttf',
// });


// // Stylesheet
// const styles = StyleSheet.create({
//     page: {
//         flexDirection: 'column',
//         backgroundColor: '#FFF',
//         padding: 20,
//         // borderRadius should be a number, not a string
//         borderRadius: 10,
//         fontFamily: 'Roboto',
//     },
//     title: {
//         fontSize: 27,
//         fontWeight: 'bold',
//         fontFamily: 'Roboto',
//     },
//     monospaceText: {
//         fontFamily: 'Roboto',
//         fontSize: 12,
//     },
//     header: {
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     section: {
//         marginBottom: 10,
//         // Replaced shorthand '10 0' with specific padding properties
//         paddingVertical: 10,
//         backgroundColor: '#fff',
//         borderRadius: 5,
//     },
//     image: {
//         width: 80,
//         height: 80,
//         marginLeft: 15,
//     },
//     text: {
//         fontSize: 14,
//         lineHeight: 1.1,
//         width: '100%',
//         fontFamily: 'Roboto',
//     },
//     table: {
//         display: 'table',
//         width: 'auto',
//         marginBottom: 10,
//         fontFamily: 'Roboto',
//         // Removed borderStyle: 'none' and borderColor: 'transparent'
//     },
//     tableRow: {
//         margin: 'auto',
//         flexDirection: 'row',
//         borderBottomWidth: 2,
//         borderBottomColor: '#ccc',
//         borderBottomStyle: 'solid',
//         fontFamily: 'Roboto',
//     },
//     tableCol: {
//         width: '12.5%',
//         padding: 5,
//         fontFamily: 'Roboto',
//     },
//     tableCellHeader: {
//         fontSize: 12,
//         fontWeight: 'bold',
//         fontFamily: 'Roboto',
//     },
//     tableCell: {
//         fontSize: 10,
//         fontFamily: 'Roboto',
//     },
//     footer: {
//         position: 'absolute',
//         bottom: 0,
//         width: '100%',
//         height: 30,
//         textAlign: 'center',
//         fontSize: 10,
//         color: '#888',
//         backgroundColor: '#c7ba07',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontFamily: 'Roboto',
//     },
// });


// const Template3 = ({ Data, subtotal, total, clientDetails, invoiceDetails, logoUrl, currencyPreferency }) => (
//     <Document>
//         <Page size="A4" style={styles.page}>

//             {/* Header */}
//             <View style={[styles.section, { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }]}>
//                 <View style={[styles.section, { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0', backgroundColor: 'transparent' }]}>
//                     {logoUrl ? <Image style={styles.image} src={logoUrl} /> : <Text style={[styles.title, { fontSize: 20, }]}>{clientDetails?.company_name?.toUpperCase()}</Text>}
//                 </View>

//                 <Text style={styles.title}>
//                     INVOICE
//                 </Text>

//             </View>

//             {/* Address */}
//             <View style={[styles.section, { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }]}>
//                 <View style={[styles.section, { display: 'flex', marginBottom: '0', backgroundColor: 'transparent', width: '35%' }]}>
//                     <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Invoice to:</Text>
//                     <Text style={{ fontSize: 14 }}>{clientDetails?.client_name || ''}</Text>
//                     <Text style={{ fontSize: 14, color: '#6c757d' }}>{clientDetails?.billing_address?.city}</Text>.
//                     <Text style={{ fontSize: 14, color: '#6c757d' }}>{clientDetails?.billing_address?.province}</Text>.
//                     <Text style={{ fontSize: 14, color: '#6c757d' }}>{clientDetails?.billing_address?.country},{clientDetails?.billing_address?.zip_code}</Text>.
//                 </View>

//                 <View style={[styles.section, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', width: '35%' }]}>
//                     <View style={[styles.section, { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '0', backgroundColor: 'transparent', width: '100%' }]}>
//                         <Text style={[styles.text, { fontSize: 15, fontWeight: '500', textAlign: 'right', width: '40%' }]}>Invoice:</Text>
//                         <Text style={[styles.text, { fontSize: 14, fontWeight: '500', width: '40%', textAlign: 'right' }]}>{invoiceDetails?.id || ''}</Text>
//                     </View>

//                     <View style={[styles.section, { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '0', backgroundColor: 'transparent', width: '100%', alignItems: 'center' }]}>
//                         <Text style={[styles.text, { fontSize: 15, fontWeight: '500', textAlign: 'right', width: '40%', }]}>Due Date:</Text>
//                         <Text style={[styles.text, { fontSize: 14, fontWeight: '500', textAlign: 'right', width: '40%', }]}>{invoiceDetails?.dueDate || ''}</Text>
//                     </View>

//                 </View>
//             </View>

//             <View style={[styles.section, { flexDirection: 'row', justifyContent: 'flex-end' }]}>
//                 <Text style={{ fontSize: 11, fontWeight: 'bold' }}>count: {Data.length}</Text>
//             </View>

//             {/* Table */}
//             <View style={styles.table}>
//                 {/* Table Header */}
//                 <View style={[styles.tableRow]}>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Reference</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Name</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Unit price</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Tax</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Discount</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Quantity</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Final price</Text></View>
//                     <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Total</Text></View>
//                 </View>

//                 {/* Table Rows (Dynamic rendering of rows) */}
//                 {Data.map((item, index) => (
//                     <View style={styles.tableRow} key={index}>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{item.item_id}</Text></View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{item.item_name.length > 10
//                             ? item.item_name.slice(0, 10) + "..."
//                             : item.item_name}</Text>
//                         </View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{item.value}</Text></View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{item.tax}</Text></View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{item.discount}</Text></View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{item.quantity}</Text></View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{currencyPreferency} {item.price}</Text></View>
//                         <View style={styles.tableCol}><Text style={styles.tableCell}>{currencyPreferency} {item.quantity * item.price}</Text></View>
//                     </View>
//                 ))}
//             </View>

//             <View style={[styles.section, { display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', backgroundColor: 'transparent', minWidth: '45%', padding: '0', borderRadius: '0' }]}>
//                 <View style={[styles.section, { display: 'flex', flexDirection: 'row', padding: '3', width: '40%', justifyContent: 'space-between', borderRadius: '0' }]}>
//                     <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'right', width: '35%' }}>Grand Total</Text>
//                     <Text style={{ fontSize: 14, fontWeight: 'bold', width: '65%', textAlign: 'right' }}>{currencyPreferency}{total.toFixed(2)}</Text>
//                 </View>
//             </View>

//             <View style={[styles.section, { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
//                 <Text>Thank you for your business!</Text>
//             </View>

//             <View style={styles.footer}>
//                 <Text style={{ color: '#000' }}>WONbills</Text>
//                 <Text style={{ color: '#000' }}>This is a system-generated invoice. No signature required.</Text>
//             </View>
//         </Page>
//     </Document>
// );


// export default Template3

import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({ family: 'Roboto',       src: './fonts/Roboto/Roboto-Regular.ttf' });
Font.register({ family: 'Roboto-Bold',  src: './fonts/Roboto/Roboto-Bold.ttf'    });
Font.register({ family: 'Roboto-Light', src: './fonts/Roboto/Roboto-Light.ttf'   });

/* ─── Tokens ─────────────────────────────── */
const GOLD       = '#c7ba07';
const GOLD_LIGHT = '#f7f3c0';
const GOLD_MID   = '#a89e06';
const GRAY_900   = '#1c1c1c';
const GRAY_600   = '#555555';
const GRAY_400   = '#999999';
const GRAY_50    = '#fafafa';
const BORDER     = '#e4e4e4';
const WHITE      = '#ffffff';

/* ─── Styles ─────────────────────────────── */
const styles = StyleSheet.create({

    page: {
        backgroundColor: WHITE,
        fontFamily: 'Roboto',
        fontSize: 10,
        color: GRAY_900,
        paddingBottom: 60,
    },

    /* ── TOP ACCENT BAR ── */
    accentBar: {
        height: 5,
        backgroundColor: GOLD,
    },

    /* ── HEADER ── */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 40,
        paddingTop: 32,
        paddingBottom: 28,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    logoImage: {
        width: 80,
        height: 80,
        objectFit: 'contain',
    },
    companyName: {
        fontSize: 22,
        fontFamily: 'Roboto-Bold',
        color: GRAY_900,
        letterSpacing: 1,
    },
    companyTagline: {
        fontSize: 9,
        color: GRAY_400,
        marginTop: 3,
        letterSpacing: 0.5,
    },
    invoiceLabelBlock: {
        alignItems: 'flex-end',
    },
    invoiceLabel: {
        fontSize: 30,
        fontFamily: 'Roboto-Bold',
        color: GRAY_900,
        letterSpacing: 3,
        lineHeight: 1,
    },
    invoiceAccentLine: {
        height: 3,
        backgroundColor: GOLD,
        marginTop: 6,
        width: '100%',
    },
    invoiceNumber: {
        fontSize: 11,
        fontFamily: 'Roboto-Bold',
        color: GOLD_MID,
        marginTop: 8,
        letterSpacing: 0.5,
    },

    /* ── INFO ROW ── */
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingVertical: 24,
        backgroundColor: GRAY_50,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    infoBlock: {
        width: '38%',
    },
    infoBlockRight: {
        width: '30%',
        alignItems: 'flex-end',
    },
    infoBlockLabel: {
        fontSize: 7,
        fontFamily: 'Roboto-Bold',
        color: GOLD_MID,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    infoName: {
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: GRAY_900,
        marginBottom: 3,
    },
    infoLine: {
        fontSize: 9,
        color: GRAY_600,
        lineHeight: 1.6,
    },
    infoDateLabel: {
        fontSize: 8,
        color: GRAY_400,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoDateValue: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: GRAY_900,
        marginBottom: 10,
    },

    /* ── CONTENT ── */
    content: {
        paddingHorizontal: 40,
        paddingTop: 20,
    },

    /* ── TABLE ── */
    table: {
        width: '100%',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 4,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: GRAY_900,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    thCell: {
        width: '12.5%',
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    thText: {
        fontSize: 7,
        fontFamily: 'Roboto-Bold',
        color: GOLD_LIGHT,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: GRAY_50,
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    tdCell: {
        width: '12.5%',
        paddingVertical: 9,
        paddingHorizontal: 8,
        fontSize: 8.5,
        color: GRAY_600,
    },
    tdCellTotal: {
        width: '12.5%',
        paddingVertical: 9,
        paddingHorizontal: 8,
        fontSize: 8.5,
        fontFamily: 'Roboto-Bold',
        color: GRAY_900,
        backgroundColor: GOLD_LIGHT,
    },

    /* ── TOTALS ── */
    totalsOuter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 24,
    },
    totalsBox: {
        width: '38%',
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 4,
        overflow: 'hidden',
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        backgroundColor: WHITE,
    },
    totalsLabel: {
        fontSize: 9,
        color: GRAY_600,
    },
    totalsValue: {
        fontSize: 9,
        color: GRAY_600,
    },
    grandTopBorder: {
        height: 3,
        backgroundColor: GOLD,
    },
    grandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: GRAY_900,
    },
    grandLabel: {
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        color: WHITE,
        letterSpacing: 1,
    },
    grandValue: {
        fontSize: 15,
        fontFamily: 'Roboto-Bold',
        color: GOLD,
    },

    /* ── NOTES ── */
    notesRow: {
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        flexDirection: 'row',
        alignItems: 'center',
    },
    notesBullet: {
        width: 4,
        height: 4,
        backgroundColor: GOLD,
        borderRadius: 2,
        marginRight: 8,
    },
    notesText: {
        fontSize: 9,
        color: GRAY_400,
        fontFamily: 'Roboto-Light',
        letterSpacing: 0.3,
    },

    /* ── FOOTER ── */
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 44,
        backgroundColor: GOLD,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
    },
    footerLeft: {
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: GRAY_900,
        letterSpacing: 1.5,
    },
    footerRight: {
        fontSize: 8,
        color: GRAY_900,
        opacity: 0.7,
        letterSpacing: 0.3,
    },
});

/* ─── Helpers ─────────────────────────────── */
const fmt   = (n)          => Number(n || 0).toFixed(2);
const trunc = (s = '', max) => { const t = String(s); return t.length > max ? t.slice(0, max) + '…' : t; };

/* ─── Component ───────────────────────────── */
const Template3 = ({
    Data,
    subtotal,
    total,
    clientDetails  = {},
    invoiceDetails = {},
    logoUrl,
    currencyPreferency = '$',
}) => {
    const safeData = Array.isArray(Data) ? Data : [];
    const addr = clientDetails?.billing_address || {};

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Gold top accent bar */}
                <View style={styles.accentBar} />

                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View>
                        {logoUrl
                            ? <Image style={styles.logoImage} src={logoUrl} />
                            : <>
                                <Text style={styles.companyName}>
                                    {(clientDetails?.company_name || 'LOGO').toUpperCase()}
                                </Text>
                              </>
                        }
                    </View>

                    <View style={styles.invoiceLabelBlock}>
                        <Text style={styles.invoiceLabel}>INVOICE</Text>
                        <View style={styles.invoiceAccentLine} />
                        <Text style={styles.invoiceNumber}># {invoiceDetails?.id || '—'}</Text>
                    </View>
                </View>

                {/* ── INFO ROW ── */}
                <View style={styles.infoRow}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoBlockLabel}>Billed To</Text>
                        <Text style={styles.infoName}>{clientDetails?.client_name || '—'}</Text>
                        {addr.city     && <Text style={styles.infoLine}>{addr.city}</Text>}
                        {addr.province && <Text style={styles.infoLine}>{addr.province}</Text>}
                        <Text style={styles.infoLine}>
                            {[addr.country, addr.zip_code].filter(Boolean).join(', ')}
                        </Text>
                    </View>

                    <View style={styles.infoBlockRight}>
                        <Text style={styles.infoBlockLabel}>Invoice Details</Text>
                        <Text style={styles.infoDateLabel}>Issue Date</Text>
                        <Text style={styles.infoDateValue}>{invoiceDetails?.date || '—'}</Text>
                        <Text style={styles.infoDateLabel}>Due Date</Text>
                        <Text style={styles.infoDateValue}>{invoiceDetails?.dueDate || '—'}</Text>
                    </View>
                </View>

                {/* ── TABLE ── */}
                <View style={styles.content}>
                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                            {['Ref', 'Name', 'Unit Price', 'Tax', 'Discount', 'Qty', 'Price', 'Total'].map(h => (
                                <View key={h} style={styles.thCell}>
                                    <Text style={styles.thText}>{h}</Text>
                                </View>
                            ))}
                        </View>

                        {safeData.map((item, idx) => (
                            <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                                <View style={styles.tdCell}><Text>{trunc(item?.item_id, 8)}</Text></View>
                                <View style={styles.tdCell}><Text>{trunc(item?.item_name, 10)}</Text></View>
                                <View style={styles.tdCell}><Text>{item?.value ?? 0}</Text></View>
                                <View style={styles.tdCell}><Text>{item?.tax ?? 0}%</Text></View>
                                <View style={styles.tdCell}><Text>{item?.discount ?? 0}%</Text></View>
                                <View style={styles.tdCell}><Text>{item?.quantity ?? 0}</Text></View>
                                <View style={styles.tdCell}><Text>{currencyPreferency}{fmt(item?.price)}</Text></View>
                                <View style={styles.tdCellTotal}>
                                    <Text>{currencyPreferency}{fmt(item?.quantity * item?.price)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* ── TOTALS ── */}
                    <View style={styles.totalsOuter}>
                        <View style={styles.totalsBox}>
                            {subtotal !== undefined && (
                                <View style={styles.totalsRow}>
                                    <Text style={styles.totalsLabel}>Subtotal</Text>
                                    <Text style={styles.totalsValue}>{currencyPreferency}{fmt(subtotal)}</Text>
                                </View>
                            )}
                            <View style={styles.grandTopBorder} />
                            <View style={styles.grandRow}>
                                <Text style={styles.grandLabel}>GRAND TOTAL</Text>
                                <Text style={styles.grandValue}>{currencyPreferency}{fmt(total)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── NOTES ── */}
                <View style={styles.notesRow}>
                    <View style={styles.notesBullet} />
                    <Text style={styles.notesText}>
                        Thank you for your business! · Payment is due by {invoiceDetails?.dueDate || 'the stated due date'}.
                    </Text>
                </View>

                {/* ── FOOTER ── */}
                <View style={styles.footer}>
                    <Text style={styles.footerLeft}>WONbills</Text>
                    <Text style={styles.footerRight}>System-generated invoice · No signature required</Text>
                </View>

            </Page>
        </Document>
    );
};

export default Template3;