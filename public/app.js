document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let medicines = [];
    const API_URL = '/api/medicines';

    // --- DOM Elements ---
    const medicineTableBody = document.getElementById('medicineTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const totalMedicinesStat = document.getElementById('totalMedicinesStat');
    const lowStockStat = document.getElementById('lowStockStat');
    const expiringStat = document.getElementById('expiringStat');
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');

    // Modal Elements
    const medicineModal = document.getElementById('medicineModal');
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const medicineForm = document.getElementById('medicineForm');

    // --- Core Logic ---

    // Fetch medicines from backend
    const fetchMedicines = async () => {
        try {
            loadingIndicator.style.display = 'block';
            medicineTableBody.innerHTML = '';
            
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            medicines = await response.json();
            renderTable();
            updateStats();
        } catch (error) {
            console.error('Error fetching medicines:', error);
            // Optionally show error notification
        } finally {
            loadingIndicator.style.display = 'none';
        }
    };

    // Calculate Status Tag
    const getStatusInfo = (medicine) => {
        const now = new Date();
        const expiry = new Date(medicine.expiryDate);
        const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (medicine.stock <= 10) return { label: 'Low Stock', class: 'status-danger' };
        if (daysToExpiry <= 30) return { label: 'Expiring Soon', class: 'status-low' };
        return { label: 'Good', class: 'status-good' };
    };

    // Render Table
    const renderTable = () => {
        // Filter based on search
        const searchTerm = searchInput.value.toLowerCase();
        let filteredMedicines = medicines.filter(med => 
            med.name.toLowerCase().includes(searchTerm) || 
            med.brand.toLowerCase().includes(searchTerm)
        );

        // Sort Data
        const sortBy = sortFilter.value;
        if (sortBy === 'name') filteredMedicines.sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === 'expiry') filteredMedicines.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        if (sortBy === 'stock') filteredMedicines.sort((a, b) => a.stock - b.stock);

        medicineTableBody.innerHTML = '';

        if (filteredMedicines.length === 0) {
            medicineTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:40px;">No medicines found.</td></tr>`;
            return;
        }

        filteredMedicines.forEach(med => {
            const status = getStatusInfo(med);
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><strong>${med.name}</strong></td>
                <td>${med.brand}</td>
                <td style="font-weight:600; color:var(--primary-color)">₹${med.price.toFixed(2)}</td>
                <td>${med.stock}</td>
                <td>${new Date(med.expiryDate).toLocaleDateString()}</td>
                <td><span class="status-badge ${status.class}">${status.label}</span></td>
                <td>
                    <button class="action-btn" onclick="deleteMedicine('${med._id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            medicineTableBody.appendChild(tr);
        });
    };

    // Update Dashboard Stats
    const updateStats = () => {
        totalMedicinesStat.textContent = medicines.length.toString();
        
        let lowStockCount = 0;
        let expiringCount = 0;
        const now = new Date();

        medicines.forEach(med => {
            const expiry = new Date(med.expiryDate);
            const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

            if (med.stock <= 10) lowStockCount++;
            if (daysToExpiry <= 30) expiringCount++;
        });

        lowStockStat.textContent = lowStockCount.toString();
        expiringStat.textContent = expiringCount.toString();

        if (notificationBadge) {
            if (expiringCount > 0) {
                notificationBadge.textContent = expiringCount.toString();
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    };

    // Delete Medicine global handler
    window.deleteMedicine = async (id) => {
        if (!confirm('Are you sure you want to delete this medicine?')) return;
        
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Deletion failed');
            
            medicines = medicines.filter(m => m._id !== id);
            renderTable();
            updateStats();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // --- Event Listeners ---

    // Modal Handlers
    const openModal = () => medicineModal.classList.remove('hidden');
    const closeModal = () => {
        medicineModal.classList.add('hidden');
        medicineForm.reset();
    };

    openAddModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelFormBtn.addEventListener('click', closeModal);

    // Form Submission
    medicineForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newMedicine = {
            name: document.getElementById('medName').value,
            brand: document.getElementById('medBrand').value,
            price: parseFloat(document.getElementById('medPrice').value),
            stock: parseInt(document.getElementById('medStock').value),
            expiryDate: document.getElementById('medExpiry').value
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMedicine)
            });

            if (!response.ok) throw new Error('Failed to save');
            
            const savedMed = await response.json();
            medicines.push(savedMed); // Add to local state
            
            renderTable();
            updateStats();
            closeModal();
            
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save medicine. Ensure backend is running.');
        }
    });

    // Filtering & Searching Event Listeners
    searchInput.addEventListener('input', renderTable);
    sortFilter.addEventListener('change', renderTable);

    // --- Navigation & Views ---
    const navInventory = document.getElementById('navInventory');
    const navAnalytics = document.getElementById('navAnalytics');
    const navSettings = document.getElementById('navSettings');
    const navItems = document.querySelectorAll('.nav-item');
    const inventoryView = document.getElementById('inventoryView');
    const analyticsView = document.getElementById('analyticsView');
    const settingsView = document.getElementById('settingsView');
    
    // Notification & Profile Elements
    const notificationBtn = document.getElementById('notificationBtn');
    const adminProfileBtn = document.getElementById('adminProfileBtn');
    const alertModal = document.getElementById('alertModal');
    const alertTitle = document.getElementById('alertTitle');
    const notificationBadge = document.getElementById('notificationBadge');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertBtn = document.getElementById('closeAlertBtn');

    let chart1 = null;
    let chart2 = null;

    const renderCharts = () => {
        const labels = medicines.map(m => m.name);
        const stockData = medicines.map(m => m.stock);
        const priceData = medicines.map(m => m.price);

        const ctx1 = document.getElementById('stockChart').getContext('2d');
        if (chart1) chart1.destroy();
        chart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Current Stock Unit Count',
                    data: stockData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });

        const ctx2 = document.getElementById('priceChart').getContext('2d');
        if (chart2) chart2.destroy();
        chart2 = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price in ₹',
                    data: priceData,
                    backgroundColor: 'rgba(5, 150, 105, 0.2)',
                    borderColor: 'rgba(5, 150, 105, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    };

    navInventory.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        navInventory.classList.add('active');
        inventoryView.style.display = 'block';
        analyticsView.style.display = 'none';
        settingsView.style.display = 'none';
    });

    navAnalytics.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        navAnalytics.classList.add('active');
        inventoryView.style.display = 'none';
        analyticsView.style.display = 'block';
        settingsView.style.display = 'none';
        
        // Timeout ensures the canvas is visible before rendering
        setTimeout(renderCharts, 50); 
    });

    navSettings.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        navSettings.classList.add('active');
        inventoryView.style.display = 'none';
        analyticsView.style.display = 'none';
        settingsView.style.display = 'block';
    });

    // Utility to show Alert
    const showAlert = (title, message) => {
        alertTitle.textContent = title;
        alertMessage.innerText = message;
        alertModal.classList.remove('hidden');
    };

    if (closeAlertBtn) {
        closeAlertBtn.addEventListener('click', () => {
            alertModal.classList.add('hidden');
        });
    }

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            const expiringMedCount = medicines.filter(m => {
                const daysToExpiry = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                return daysToExpiry <= 30;
            }).length;
            
            let msg = expiringMedCount > 0 
                ? `You have ${expiringMedCount} medicines expiring soon! Please check your inventory.` 
                : 'You have no urgent notifications at the moment.';
                
            showAlert('System Notifications', msg);

            if (notificationBadge) {
                notificationBadge.style.display = 'none';
            }
        });
    }

    if (adminProfileBtn) {
        adminProfileBtn.addEventListener('click', () => {
            showAlert('System Administrator', 'Current user: Admin\n\nRole details: Full access to Inventory, Analytics, and Shop Settings.');
        });
    }

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const isDark = document.getElementById('themeToggle').checked;
            if(isDark) {
                document.documentElement.style.setProperty('--bg-color', '#0f172a');
                document.documentElement.style.setProperty('--card-bg', '#1e293b');
                document.documentElement.style.setProperty('--text-dark', '#f8fafc');
                document.documentElement.style.setProperty('--text-muted', '#94a3b8');
                document.documentElement.style.setProperty('--border-color', '#334155');
            } else {
                document.documentElement.style.setProperty('--bg-color', '#f4f7fe');
                document.documentElement.style.setProperty('--card-bg', '#ffffff');
                document.documentElement.style.setProperty('--text-dark', '#1e293b');
                document.documentElement.style.setProperty('--text-muted', '#64748b');
                document.documentElement.style.setProperty('--border-color', '#e2e8f0');
            }
            showAlert('Success', 'Shop settings & theme configuration saved successfully!');
        });
    }

    // Initial Fetch
    fetchMedicines();
});
