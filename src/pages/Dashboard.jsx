import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '../services/orderService';
import { Search, ChevronRight, Calendar, Clock, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        Object.values(order).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await deleteOrder(id);
                setOrders(orders.filter(order => order.id !== id));
            } catch (error) {
                console.error("Error deleting order:", error);
                alert("Failed to delete order.");
            }
        }
    };

    // Group orders by createdAt date
    const groupedOrders = filteredOrders.reduce((groups, order) => {
        const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown Date';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(order);
        return groups;
    }, {});

    // Sort groups by date descending
    const sortedGroups = Object.entries(groupedOrders).sort((a, b) => {
        // Handle 'Unknown Date' case or invalid dates if necessary
        return new Date(b[0]) - new Date(a[0]);
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Order Dashboard</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg">No orders found.</p>
                    <Link to="/upload" className="mt-4 inline-block text-indigo-600 font-medium hover:underline">
                        Upload new orders
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedGroups.map(([date, groupOrders]) => (
                        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-700">Uploaded: {date}</h3>
                                <span className="text-sm text-gray-500">{groupOrders.length} orders</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left hidden md:table">
                                    <thead className="bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groupOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                    #{order.id.slice(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide mr-1">Vendor:</span>
                                                        {order['ISSUED TO'] || order['Vendor Name'] || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {order.deliveryDate ? (
                                                        <div className="flex flex-col text-sm text-gray-600">
                                                            <span className="flex items-center gap-1"><Calendar size={14} /> {order.deliveryDate}</span>
                                                            {order.deliveryTime && <span className="flex items-center gap-1 text-gray-400"><Clock size={14} /> {order.deliveryTime}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Not scheduled</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {order.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            to={`/order/${order.id}`}
                                                            className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                                                        >
                                                            View <ChevronRight size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(order.id)}
                                                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4 p-4">
                                    {groupOrders.map((order) => (
                                        <div key={order.id} className="bg-white p-4 border rounded-lg shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}...</span>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="font-semibold">Vendor:</span> {order['ISSUED TO'] || order['Vendor Name'] || 'N/A'}
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                                                <div className="flex gap-4">
                                                    {order.deliveryDate ? (
                                                        <span className="flex items-center gap-1"><Calendar size={14} /> {order.deliveryDate}</span>
                                                    ) : (
                                                        <span className="italic text-gray-400">No Date</span>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <Link to={`/order/${order.id}`} className="text-indigo-600 font-medium text-sm">View</Link>
                                                    <button onClick={() => handleDelete(order.id)} className="text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
