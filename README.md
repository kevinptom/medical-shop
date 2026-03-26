# MediManage | Premium Medical Shop System

This is a complete full-stack Medical Shop Management system built with Node.js, Express, MongoDB, and Vanilla HTML/CSS/JS.

## Features

- **Beautiful Premium UI**: Glassmorphism, modern gradients, fluid animations, and high-quality UX conventions.
- **RESTful API**: Node.js & Express API for robust management.
- **Database Storage**: MongoDB backend with Mongoose schemas.
- **Real-Time Validations & Updates**: DOM instantly updates on delete/create.
- **Smart Filtering**: Live search by name or brand, and smart sorting by Name, Expiry, or Stock.
- **Dashboard Analytics**: Automatically calculates total medicines, low stock alerts, and expiring soon notifications.

## Prerequisites

To run this application, you must have the following installed on your system:
1. **[Node.js](https://nodejs.org/)** (v14 or higher)
2. **[MongoDB](https://www.mongodb.com/try/download/community)** (Running locally on `mongodb://127.0.0.1:27017`)

## Running the Application

1. Open your terminal or powershell in this directory.
2. Install the required Node.js dependencies:
    ```bash
    npm install
    ```
    *(Note: If `npm` is not recognized, please download and install Node.js from the official website and restart your terminal).*

3. Ensure your local MongoDB server is running.
4. Start the backend server:
    ```bash
    npm start
    ```
    *(Alternatively: `node server.js`)*

5. Open your web browser and navigate to:
    **[http://localhost:3000](http://localhost:3000)**

## Architecture Overview

- **`server.js`**: Connects to MongoDB, defines the `Medicine` Mongoose schema, and provides the `GET`, `POST`, and `DELETE` endpoints.
- **`public/index.html`**: The UI skeleton featuring Font Awesome icons and Google Fonts.
- **`public/style.css`**: CSS styling utilizing custom variables, box shadows, radial gradients, and fluid transitions.
- **`public/app.js`**: Frontend JavaScript to call the backend APIs, handle state management, update DOM, and perform local sorting and filtering logic.
