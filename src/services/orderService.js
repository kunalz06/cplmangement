import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { parseDate, normalizeKey } from '../utils/formatters';

const ORDERS_COLLECTION = 'orders';

export const saveOrders = async (orders) => {
    const batchTimestamp = new Date().toISOString();

    const promises = orders.map(order => {
        // Create a normalized map of the input order for easier access
        const normalizedInput = {};
        Object.keys(order).forEach(key => {
            normalizedInput[normalizeKey(key)] = order[key];
        });

        // 1. Extract specific allowed fields
        const serialNo = normalizedInput['SERIAL NO.'] || normalizedInput['SERIAL NO'] || '';
        const orderId = normalizedInput['ORDER NO.'] || normalizedInput['ORDER NO'] || normalizedInput['Order No'] || normalizedInput['id'];

        // Parse Order Date to dd/mm/yyyy
        const rawOrderDate = normalizedInput['ORDER DATE'] || normalizedInput['Order Date'] || normalizedInput['Date'];
        const poDate = parseDate(rawOrderDate);

        const issuedTo = normalizedInput['ISSUED TO'] || normalizedInput['Issued To'] || normalizedInput['Vendor Name'];
        const vendorLocation = normalizedInput['VENDOR LOCATION'] || normalizedInput['Vendor Location'] || '';
        const subject = normalizedInput['SUBJECT'] || normalizedInput['Subject'] || '';

        const basicOrderValue = normalizedInput['BASIC ORDER VALUE'] || normalizedInput['Basic Order Value'] || ''; // Handles "BASIC ORDER \r\nVALUE" via normalization
        const gst = normalizedInput['GST'] || '';
        const totalOrderValue = normalizedInput['TOTAL ORDER VALUE'] || normalizedInput['Total Order Value'] || '';
        const dealingOfficer = normalizedInput['DEALING OFFICER'] || normalizedInput['Dealing Officer'] || '';

        // Dispatch status logic (keeping this as it's useful, even if column not explicitly in user's strict list, user likely implies these are the IMPORTED VIEWABLE columns)
        // Check if Dispatch column exists in original data (it might be dynamic)
        const dispatchValue = normalizedInput['Dispatch'] || normalizedInput['DISPATCH'] || '';
        const status = (dispatchValue && String(dispatchValue).toLowerCase() === 'yes') ? 'Dispatched' : 'Pending';

        // Additional internal fields
        const remarks = normalizedInput['REMARKS'] || '';

        // Delivery Date logic (keep existing fallback or empty)
        const deliveryDateRaw = normalizedInput['Delivery Date'] || normalizedInput['Expected Delivery Date'] || '';
        const deliveryDate = parseDate(deliveryDateRaw);

        // Construct the strict order object
        const orderData = {
            id: String(orderId || ''), // Ensure ID is part of data
            'SERIAL NO.': serialNo,
            'ORDER NO.': orderId,
            'ORDER DATE': poDate, // Standardized dd/mm/yyyy
            'ISSUED TO': issuedTo,
            'VENDOR LOCATION': vendorLocation,
            'SUBJECT': subject,
            'BASIC ORDER VALUE': basicOrderValue,
            'GST': gst,
            'TOTAL ORDER VALUE': totalOrderValue,
            'DEALING OFFICER': dealingOfficer,

            // Internal/System fields
            createdAt: batchTimestamp,
            status: status,
            remarks: remarks,
            deliveryDate: deliveryDate,
            deliveryTime: '',

            // Mapped keys for PDF compatibility
            'PO Date': poDate,
            'Vendor Name': issuedTo,

            // Dispatch details (if user manually adds them later)
            transporterName: '',
            cnNumber: ''
        };

        if (orderId) {
            // Sanitize ID: replace / with _ to prevent Firestore treating it as a nested path
            const safeId = String(orderId).replace(/\//g, '_');
            return setDoc(doc(db, ORDERS_COLLECTION, safeId), orderData, { merge: true });
        } else {
            return addDoc(collection(db, ORDERS_COLLECTION), orderData);
        }
    });
    return Promise.all(promises);
};

export const getOrders = async () => {
    const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const getOrderById = async (id) => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id };
    } else {
        return null;
    }
};

export const updateOrder = async (id, data) => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, data);
};

export const deleteOrder = async (id) => {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await deleteDoc(docRef);
};
