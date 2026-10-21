const fs = require('fs');
const PdfPrinter = require('pdfmake');
const path = require('path');

const fonts = {
    Roboto: {
        normal: path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname, 'fonts', 'Roboto-Bold.ttf'),
        italics: path.join(__dirname, 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, 'fonts', 'Roboto-BoldItalic.ttf')
    }
};

// Initialize the printer
const printer = new PdfPrinter(fonts);

function generateTableBody(data,currency,grandTotal) {
    // Define the column headers
    const columnHeaders = [
        { text: 'Reference', style: 'tableHeader' },
        { text: 'Name', style: 'tableHeader' },
        { text: 'Unit Price', style: 'tableHeader' },
        { text: 'Tax', style: 'tableHeader' },
        { text: 'Discount', style: 'tableHeader' },
        { text: 'Final Price', style: 'tableHeader' },
        { text: 'Quantity', style: 'tableHeader' },
        { text: 'Total', style: 'tableHeader' }
    ];

    // Transform the data rows to include styling
    const dataRows = data?.map(row => {
        return [
            { text: row.reference || '', style: 'tableData' },
            { text: row.name || '', style: 'tableData' },
            { text: `${currency}${row.unitPrice || 0}`, style: 'tableData' },
            { text: `${row.tax || 0}%`, style: 'tableData' },
            { text: `${row.discount || 0}%`, style: 'tableData' },
            { text: `${currency}${row.finalPrice || 0}`, style: 'tableData' },
            { text: row.quantity || 0, style: 'tableData' },
            { text: `${grandTotal || 0}`, style: 'tableData' }
        ];
    });

    return [columnHeaders, ...dataRows];
}

function calculateGrandTotal(tableData) {
    return tableData.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
}

const generateInvoicePDF1 = (invoiceData = {}) => {
    const { customerName, invoice, items, grandTotal,currencyType } = invoiceData;

    // Format customer and invoice information
    const leftStackItems = [
        { text: `Name: ${customerName.name}`, margin: [0, 0, 0, 5] }, 
        { text: `Address: ${customerName.address}`, margin: [0, 0, 0, 5] },
        { text: `City: ${customerName.city}`, margin: [0, 0, 0, 5] },
        { text: `Email: ${customerName.email}`, margin: [0, 0, 0, 5] },
        { text: `Phone: ${customerName.phone}`, margin: [0, 0, 0, 5] },
    ];
    
    const rightStackItems = [
        { text: `Invoice ID: ${invoice.ID}`, margin: [0, 0, 0, 5] },
        { text: `Date: ${invoice.date}`, margin: [0, 0, 0, 5] },
    ];

    // Generate table body
    const tableBody = generateTableBody(items,currencyType,grandTotal);

    const docDefinition = {
        content: [
            {
                stack: ['INVOICE'],
                style: 'header',
            },
            {
                columns: [
                    {
                        width: '50%',
                        stack: leftStackItems,
                        alignment: 'left',
                    },
                    {
                        width: '50%',
                        margin: [0, 15, 0, 0],
                        stack: rightStackItems,
                        alignment: 'right',
                    },
                ],
            },
            {
                margin: [0, 40, 0, 0],
                table: {
                    widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
                    body: tableBody,
                },
            },
            {
                text: `Grand Total: ${grandTotal}`,
                style: 'grandTotal',
                alignment: 'right',
                margin: [0, 10, 0, 0],
            },
        ],
        footer: function (currentPage, pageCount) {
            return {
                stack: [
                    {
                        text: 'WONBILLS',
                        alignment: 'center',
                        style: 'footerText',
                        margin: [0, 0, 0, 5],
                    },
                    {
                        text: 'This is system-generated, no need for a signature.',
                        alignment: 'center',
                        style: 'footerText',
                    },
                ],
            };
        },
        styles: {
            header: {
                fontSize: 25,
                bold: true,
                alignment: 'right',
                margin: [0, 0, 0, 0],
            },
            tableHeader: {
                fontSize: 11,
                bold: true,
                fillColor: '#eeeeee',
                alignment: 'center',
            },
            tableData: {
                fontSize: 11,
                alignment: 'center',
            },
            grandTotal: {
                fontSize: 12,
                bold: true,
                color: 'black',
            },
            footerText: {
                fontSize: 9,
                color: 'gray',
            },
            subheader: {
                fontSize: 14,
            },
            superMargin: {
                margin: [0, 0, 0, 0],
                fontSize: 15,
            },
        },
        defaultStyle: {
            font: 'Roboto',
        },
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
    };

    return new Promise((resolve, reject) => {
        try {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const outputPath = './invoice.pdf';
            const writeStream = fs.createWriteStream(outputPath);

            writeStream.on('finish', () => {
                resolve(outputPath);
            });

            writeStream.on('error', (error) => {
                reject(error);
            });

            pdfDoc.pipe(writeStream);
            pdfDoc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateInvoicePDF1 };