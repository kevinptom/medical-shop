const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medical_shop_db';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB successfully.");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

// Medicine Schema & Model
const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    expiryDate: { type: Date, required: true }
});

const Medicine = mongoose.model('Medicine', medicineSchema);

// --- REST API Routes ---

// POST - Add new medicine
app.post('/api/medicines', async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        res.status(201).json(medicine);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET - Get all medicines
app.get('/api/medicines', async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Remove medicine
app.delete('/api/medicines/:id', async (req, res) => {
    try {
        await Medicine.findByIdAndDelete(req.params.id);
        res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
