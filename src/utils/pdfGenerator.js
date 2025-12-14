import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseDate } from '../utils/formatters';

export const generatePDF = (order, startDate, endDate) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

    // --- Header ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CRESCENT POWER LIMITED', 148.5, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('VENDOR FOLLOW-UP DETAILS', 148.5, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    // Use provided dates or empty space
    const periodText = `For the period from [ ${startDate || '           '} ] to [ ${endDate || '           '} ]`;
    doc.text(periodText, 148.5, 40, { align: 'center' });

    // --- Data Preparation ---
    // Determine Overdue status
    const isOverdue = () => {
        if (!order.deliveryDate) return 'N/A';
        const today = new Date();
        const deliveryDate = new Date(order.deliveryDate);
        // Reset time for date comparison
        today.setHours(0, 0, 0, 0);
        deliveryDate.setHours(0, 0, 0, 0);

        const status = (order.status || 'Pending').toLowerCase();

        // If status is updated to Dispatched, Completed, or Cancelled, it's not overdue in the sense of "action required"
        // User request: "if the user hasn't updated the delivery date and status and the delivery date has crossed"
        if (['dispatched', 'completed', 'cancelled', 'delivered'].includes(status)) {
            return 'NO';
        }

        // If status is Pending and date has passed
        return today > deliveryDate ? 'YES' : 'NO';
    };

    const overdueStatus = isOverdue();

    // Table Columns
    const tableColumn = [
        "PO No.",
        "PO Date",
        "Vendor Name",
        "Expected\nDelivery\nDate",
        "Current\nStatus",
        "Update On",
        "Despatch\nDetails",
        "Overdue\nYes / No",
        "Remarks",
        "Next\nFollow-up"
    ];

    // Construct Dispatch Details string
    const getDispatchDetails = () => {
        if (order.transporterName || order.cnNumber) {
            return `${order.transporterName || ''}\n${order.cnNumber ? 'CN: ' + order.cnNumber : ''}`;
        }
        // Fallback or existing logic
        return order['Dispatch'] || order['Despatch Details'] || 'Transporter\nName & CN\nNo.';
    };

    // Table Rows
    const tableRows = [
        [
            order.id || order['ORDER NO'] || 'xx',
            parseDate(order['PO Date'] || order['ORDER DATE'] || new Date(order.createdAt)),
            order['Vendor Name'] || order['VENDOR NAME'] || 'xx',
            parseDate(order.deliveryDate) || 'xx',
            order.status || 'Pending',
            parseDate(new Date()), // Update On
            getDispatchDetails(),
            overdueStatus,
            order.remarks || 'Xx',
            order['Next Follow-up'] || 'xx'
        ]
    ];

    // --- Table Generation ---
    autoTable(doc, {
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle',
            fontStyle: 'bold'
        },
        bodyStyles: {
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
        },
        styles: {
            font: 'helvetica',
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        columnStyles: {
            4: { textColor: [255, 0, 0] }, // Current Status in Red
            6: { textColor: [255, 0, 0] }, // Despatch Details in Red
            7: { textColor: [255, 0, 0] }  // Overdue in Red
        },
        didParseCell: function (data) {
            // Custom styling logic if needed
        }
    });

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0); // Red color for footer as per image hint (Report Run date)
    doc.text(`(Report Run date: ${parseDate(new Date())})`, 280, pageHeight - 10, { align: 'right' });

    doc.save(`Order_Report_${order.id}.pdf`);
};
