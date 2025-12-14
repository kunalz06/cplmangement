import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrder } from '../services/orderService';
import { ArrowLeft, Save, Bell, FileText, Calendar, Clock } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { scheduleNotification } from '../utils/notification';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [remarks, setRemarks] = useState('');
    const [status, setStatus] = useState('Pending');

    // Dispatch Details
    const [transporterName, setTransporterName] = useState('');
    const [cnNumber, setCnNumber] = useState('');

    // Report Settings
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');

    const [reminderTime, setReminderTime] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                if (data) {
                    setOrder(data);
                    setDeliveryDate(data.deliveryDate || '');
                    setDeliveryTime(data.deliveryTime || '');
                    setRemarks(data.remarks || '');
                    setStatus(data.status || 'Pending');
                    setTransporterName(data.transporterName || '');
                    setCnNumber(data.cnNumber || '');
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateOrder(id, {
                deliveryDate,
                deliveryTime,
                remarks,
                status,
                transporterName,
                cnNumber
            });
            // Update local state to reflect saved status if needed
            alert('Order details updated successfully!');
        } catch (error) {
            console.error("Error updating order:", error);
            alert('Failed to update order.');
        } finally {
            setSaving(false);
        }
    };

    const handleSetReminder = () => {
        if (!reminderTime) return alert('Please select a time for the reminder.');
        scheduleNotification(order, reminderTime);
        alert(`Reminder set for ${reminderTime}`);
    };

    const handleGeneratePDF = () => {
        generatePDF({ ...order, deliveryDate, status, transporterName, cnNumber, remarks }, reportStartDate, reportEndDate);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!order) return <div className="p-8 text-center">Order not found.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-sm text-gray-500 mt-1">ID: {order.id}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FileText size={18} /> Generate PDF
                        </button>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Order Data from Excel */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Information</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.entries(order)
                                .filter(([key]) => !['id', 'createdAt', 'status', 'deliveryDate', 'deliveryTime', 'remarks', '_tempId', 'PO Date', 'Vendor Name', 'transporterName', 'cnNumber'].includes(key))
                                .map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-xs font-medium text-gray-500 uppercase">{key}</span>
                                        <span className="text-gray-900">{String(value)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Delivery & Remarks</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Dispatch Details */}
                        {status === 'Dispatched' && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                                <h4 className="font-semibold text-blue-800">Dispatch Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="transporter" className="text-sm font-medium text-gray-700">Transporter Name</label>
                                        <input
                                            type="text"
                                            id="transporter"
                                            value={transporterName}
                                            onChange={(e) => setTransporterName(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter vehicle/transporter"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="cnNumber" className="text-sm font-medium text-gray-700">CN Number</label>
                                        <input
                                            type="text"
                                            id="cnNumber"
                                            value={cnNumber}
                                            onChange={(e) => setCnNumber(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter CN No."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="delivery-date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} /> Delivery Date
                                </label>
                                <input
                                    type="date"
                                    id="delivery-date"
                                    name="delivery-date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="delivery-time" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Clock size={16} /> Delivery Time
                                </label>
                                <input
                                    type="time"
                                    id="delivery-time"
                                    name="delivery-time"
                                    value={deliveryTime}
                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="remarks" className="text-sm font-medium text-gray-700">Remarks</label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Add notes about this order..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>

                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Set Reminder</h3>
                            <div className="flex gap-2">
                                <label htmlFor="reminder-time" className="sr-only">Reminder Time</label>
                                <input
                                    type="datetime-local"
                                    id="reminder-time"
                                    name="reminder-time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleSetReminder}
                                    className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <Bell size={18} /> Set
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                * Browser notifications must be allowed for reminders to work.
                            </p>
                        </div>

                        {/* Report Settings */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">PDF Report Settings</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="reportStart" className="text-sm font-medium text-gray-700">Period From</label>
                                    <input
                                        type="date"
                                        id="reportStart"
                                        value={reportStartDate}
                                        onChange={(e) => setReportStartDate(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="reportEnd" className="text-sm font-medium text-gray-700">Period To</label>
                                    <input
                                        type="date"
                                        id="reportEnd"
                                        value={reportEndDate}
                                        onChange={(e) => setReportEndDate(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
