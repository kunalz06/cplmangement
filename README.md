# Order Management System

A comprehensive web application designed to streamline office order tracking and management. Facilitates bulk order imports via Excel, status tracking, and automated PDF report generation. Built using React, Tailwind CSS, and Firebase.

## Features

*   **Excel Import**: Bulk upload orders using standard Excel templates with automatic column mapping and validation.
*   **Order Tracking**: Monitor order status, delivery timelines, and vendor details.
*   **PDF Reporting**: Generate professional vendor follow-up PDF reports with dynamic data.
*   **Dashboard**: Centralized view of all orders with search, filtering, and management capabilities.

## Setup Instructions

### Prerequisites
*   Node.js installed.
*   Active Firebase project.

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd Officeapp
    ```

2.  **Install Dependencies**
    Execute the installation command to fetch required packages:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a file named `.env` in the root directory. Populate the file with the Firebase configuration keys as shown below:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Start Development Server**
    Launch the application locally:
    ```bash
    npm run dev
    ```
    Access the application at `http://localhost:5173`.

5.  **Build for Production**
    Generate a production-ready build:
    ```bash
    npm run build
    ```
