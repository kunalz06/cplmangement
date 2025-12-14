export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return false;
    }

    let permission = Notification.permission;

    if (permission === "granted") {
        return true;
    } else if (permission !== "denied") {
        permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const scheduleNotification = async (order, reminderTime) => {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
        alert("Notification permission denied. Cannot set reminder.");
        return;
    }

    const now = new Date().getTime();
    const reminderDate = new Date(reminderTime).getTime();
    const timeUntilReminder = reminderDate - now;

    if (timeUntilReminder <= 0) {
        alert("Please select a future time for the reminder.");
        return;
    }

    // In a real production app, this should be handled by a Service Worker or backend
    // because setTimeout will be cleared if the tab is closed.
    // For this demo/MVP, we'll use setTimeout and warn the user.

    setTimeout(() => {
        new Notification("Order Reminder", {
            body: `Reminder for Order #${order.id}. Delivery scheduled for ${order.deliveryDate} ${order.deliveryTime}`,
            icon: '/vite.svg' // specific to vite project structure
        });
    }, timeUntilReminder);

    console.log(`Reminder set for ${timeUntilReminder}ms from now`);
};
