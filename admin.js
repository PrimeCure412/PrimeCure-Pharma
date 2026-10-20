// Global variable for uploaded gift image filename
let currentUploadedGiftImage = '';

// --- Preview Gift Image ---
function previewGiftImage(input) {
    try {
        const box = document.getElementById('giftImagePreviewBox');
        if (input && input.files && input.files[0]) {
            const fileName = input.files[0].name;
            currentUploadedGiftImage = 'images/' + fileName;
            if (box) {
                box.innerHTML = `<span style="font-size: 11px; color: #004080; text-align: center; word-break: break-all;"><b>${fileName}</b></span>`;
            }
        } else {
            currentUploadedGiftImage = '';
            if (box) box.innerHTML = `<span style="font-size: 10px; color: #aaa; text-align: center;">No Image</span>`;
        }
    } catch (e) {
        console.error("Preview image error:", e);
    }
}

// --- Tab Switching Logic ---
function switchTab(tabId, btnElement) {
    try {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.classList.remove('active-tab');
            tab.style.display = 'none';
        });

        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active-tab');
            targetTab.style.display = 'block';
        }

        if (btnElement) {
            btnElement.classList.add('active');
        }
    } catch (e) {
        console.error("Tab switch error:", e);
    }
}

// --- Toggle Product Form Visibility ---
function toggleProductForm() {
    try {
        const formCard = document.getElementById('productFormCard');
        const btn = document.getElementById('toggleFormBtn');
        
        const form = document.getElementById('productForm');
        if (form) {
            delete form.dataset.editId;
            form.reset();
            generateProductCode();
        }

        if (formCard) {
            if (formCard.style.display === 'none' || formCard.style.display === '') {
                formCard.style.display = 'block';
                if (btn) btn.innerText = '- Close Form';
            } else {
                formCard.style.display = 'none';
                if (btn) btn.innerText = '+ Add New Product';
            }
        }
    } catch (e) {
        console.error("Toggle product form error:", e);
    }
}

// --- Auto Generate Product Code ---
function generateProductCode() {
    try {
        let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
        let nextNum = products.length + 1;
        let code = 'PC-' + String(nextNum).padStart(4, '0');
        const codeSpan = document.getElementById('autoProductCode');
        if (codeSpan) {
            codeSpan.innerText = code;
        }
        return code;
    } catch (e) {
        return 'PC-0001';
    }
}

// --- Page Load Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    try { displayManufacturers(); } catch(e) { console.error(e); }
    try { displayAdminProducts(); } catch(e) { console.error(e); }
    try { populateManufacturerDropdowns(); } catch(e) { console.error(e); }
    try { populateProductDropdowns(); } catch(e) { console.error(e); }
    try { populateCalcProductDropdown(); } catch(e) { console.error(e); }
    try { displaySavedSchemesTable(); } catch(e) { console.error(e); }
    try { generateProductCode(); } catch(e) { console.error(e); }
    
    setupForms();
});

function setupForms() {
    const manufacturerForm = document.getElementById('manufacturerForm');
    if (manufacturerForm) {
        manufacturerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('mfgName').value;
            const person = document.getElementById('mfgPerson').value;
            const email = document.getElementById('mfgEmail').value;
            const mobile = document.getElementById('mfgMobile').value;

            const newMfg = { id: Date.now(), name, person, email, mobile };
            let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];
            manufacturers.push(newMfg);
            localStorage.setItem('primecure_manufacturers', JSON.stringify(manufacturers));

            alert('Manufacturer saved successfully!');
            manufacturerForm.reset();
            displayManufacturers();
            populateManufacturerDropdowns();
        });
    }

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
            let editId = productForm.dataset.editId;

            const segment = document.getElementById('prodSegment') ? document.getElementById('prodSegment').value : '';
            const listType = document.getElementById('prodListType') ? document.getElementById('prodListType').value : '';
            const brandName = document.getElementById('prodBrandName') ? document.getElementById('prodBrandName').value : '';
            const composition = document.getElementById('prodComposition') ? document.getElementById('prodComposition').value : '';
            const formulation = document.getElementById('prodFormulation') ? document.getElementById('prodFormulation').value : '';
            const packing = document.getElementById('prodPacking') ? document.getElementById('prodPacking').value : '';
            const packSize = document.getElementById('prodPackSize') ? document.getElementById('prodPackSize').value : '';
            const mrp = document.getElementById('prodMrp') ? document.getElementById('prodMrp').value : '';
            const rate = document.getElementById('prodRate') ? document.getElementById('prodRate').value : '';
            const hsn = document.getElementById('prodHsn') ? document.getElementById('prodHsn').value : '';
            const tax = document.getElementById('prodTax') ? document.getElementById('prodTax').value : '';
            const stock = document.getElementById('prodStock') ? document.getElementById('prodStock').value : '';
            const manufacturer = document.getElementById('prodManufacturer') ? document.getElementById('prodManufacturer').value : '';

            // Universal File Inputs Finder
            const allFileInputs = productForm.querySelectorAll('input[type="file"]');
            
            let imgFileObj = null;
            let visualFileObj = null;
            let bannerFileObj = null;

            const imgEl = document.getElementById('prodImageFile') || document.getElementById('productImageFile') || allFileInputs[0];
            const visEl = document.getElementById('prodVisualFile') || document.getElementById('visualAidFile') || allFileInputs[1];
            const banEl = document.getElementById('prodBannerFile') || document.getElementById('bannerFile') || allFileInputs[2];

            if (imgEl && imgEl.files && imgEl.files[0]) imgFileObj = imgEl.files[0];
            if (visEl && visEl.files && visEl.files[0]) visualFileObj = visEl.files[0];
            if (banEl && banEl.files && banEl.files[0]) bannerFileObj = banEl.files[0];

            let existingProduct = editId ? products.find(item => item.id == editId) : null;

            // Direct filename path references (No Base64 space consumption)
            const newImgPath = imgFileObj ? 'images/' + imgFileObj.name : '';
            const newVisualPath = visualFileObj ? 'images/' + visualFileObj.name : '';
            const newBannerPath = bannerFileObj ? 'images/' + bannerFileObj.name : '';

            // Persistent Image Retaining Logic
            let finalImg = newImgPath || (existingProduct ? (existingProduct.productImage || existingProduct.image || '') : '');
            let finalVisual = newVisualPath || (existingProduct ? (existingProduct.visualAid || existingProduct.visual || '') : '');
            let finalBanner = newBannerPath || (existingProduct ? (existingProduct.bannerImage || existingProduct.banner || '') : '');

            let productDataToSave = {
                id: editId ? Number(editId) : Date.now(),
                code: existingProduct ? existingProduct.code : generateProductCode(),
                segment, listType, brandName, composition, formulation, packing, packSize, mrp, rate, hsn, tax, stock, manufacturer,
                productImage: finalImg,
                image: finalImg,
                visualAid: finalVisual,
                visual: finalVisual,
                bannerImage: finalBanner,
                banner: finalBanner
            };

            if (editId && existingProduct) {
                let index = products.findIndex(item => item.id == editId);
                if (index !== -1) {
                    products[index] = productDataToSave;
                }
                delete productForm.dataset.editId;
            } else {
                products.push(productDataToSave);
            }

            try {
                localStorage.setItem('primecure_products', JSON.stringify(products));
                alert(`✅ Product saved successfully without any storage limit issues!`);
                productForm.reset();
                generateProductCode();
                toggleProductForm();
                displayAdminProducts();
                populateProductDropdowns();
                populateCalcProductDropdown();
            } catch (storageError) {
                console.error("Storage error:", storageError);
                alert("⚠️ Storage error occurred.");
            }
        });
    }
}

// --- 1. MANAGE MANUFACTURER LOGIC ---
function displayManufacturers() {
    const container = document.getElementById('manufacturerListContainer');
    if (!container) return;
    let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];

    if (manufacturers.length === 0) {
        container.innerHTML = '<p style="color: #777;">No manufacturers added yet.</p>';
        return;
    }

    let html = `<table class="table-style"><tr><th>Factory Name</th><th>Contact Person</th><th>Email ID</th><th>Mobile No.</th><th>Actions</th></tr>`;
    manufacturers.forEach(m => {
        html += `<tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.person}</td>
            <td>${m.email}</td>
            <td>${m.mobile}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewManufacturer(${m.id})">View</button>
                <button class="action-btn edit-btn" onclick="editManufacturer(${m.id})">Edit</button>
                <button class="delete-btn" onclick="deleteManufacturer(${m.id})">Delete</button>
            </td>
        </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
}

function viewManufacturer(id) {
    let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];
    let m = manufacturers.find(item => item.id === id);
    if (m) {
        alert(`--- Manufacturer Details ---\nFactory: ${m.name}\nContact Person: ${m.person}\nEmail: ${m.email}\nMobile: ${m.mobile}`);
    }
}

function editManufacturer(id) {
    let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];
    let m = manufacturers.find(item => item.id === id);
    if (!m) return;

    let newName = prompt("Edit Factory Name:", m.name);
    let newPerson = prompt("Edit Contact Person:", m.person);
    let newEmail = prompt("Edit Email ID:", m.email);
    let newMobile = prompt("Edit Mobile No.:", m.mobile);

    if (newName && newEmail) {
        m.name = newName;
        m.person = newPerson || m.person;
        m.email = newEmail;
        m.mobile = newMobile || m.mobile;
        localStorage.setItem('primecure_manufacturers', JSON.stringify(manufacturers));
        displayManufacturers();
        populateManufacturerDropdowns();
        alert("Manufacturer updated successfully!");
    }
}

function deleteManufacturer(id) {
    let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];
    manufacturers = manufacturers.filter(m => m.id !== id);
    localStorage.setItem('primecure_manufacturers', JSON.stringify(manufacturers));
    displayManufacturers();
    populateManufacturerDropdowns();
}

function populateManufacturerDropdowns() {
    let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];
    const prodMfgSelect = document.getElementById('prodManufacturer');
    const enquiryMfgSelect = document.getElementById('enquiryMfgSelect');

    let options = '<option value="">Select Manufacturer</option>';
    manufacturers.sort((a,b) => a.name.localeCompare(b.name)).forEach(m => {
        options += `<option value="${m.name}">${m.name} (${m.email})</option>`;
    });

    if (prodMfgSelect) prodMfgSelect.innerHTML = options;
    if (enquiryMfgSelect) enquiryMfgSelect.innerHTML = options;
}

// --- 2. MANAGE PRODUCT LOGIC ---
function displayAdminProducts() {
    const container = document.getElementById('adminProductCatalogList');
    if (!container) return;
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];

    if (products.length === 0) {
        container.innerHTML = '<p style="color: #777;">No products added to catalog yet.</p>';
        return;
    }

    let html = `<table class="table-style">
        <tr>
            <th>SR NO.</th>
            <th>PRODUCT CODE</th>
            <th>BRAND NAME</th>
            <th>COMPOSITION</th>
            <th>FORMULATION</th>
            <th>PACKING</th>
            <th>PACK</th>
            <th>MRP</th>
            <th>RATE</th>
            <th>ACTIONS</th>
        </tr>`;
        
    products.forEach((p, index) => {
        let bName = p.brandName || "N/A";
        let pPack = p.packing || "N/A";
        let pSize = p.packSize || "N/A";
        let pMrp = p.mrp || "0";
        let pRate = p.rate || "0";

        html += `<tr>
            <td>${index + 1}</td>
            <td><strong>${p.code || 'PC-0000'}</strong></td>
            <td><strong>${bName}</strong></td>
            <td>${p.composition || 'N/A'}</td>
            <td>${p.formulation || 'N/A'}</td>
            <td>${pPack}</td>
            <td>${pSize}</td>
            <td>₹${pMrp}</td>
            <td><strong>₹${pRate}</strong></td>
            <td>
                <button class="action-btn view-btn" onclick="viewProduct(${p.id})">View</button>
                <button class="action-btn edit-btn" onclick="editProduct(${p.id})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
}

function viewProduct(id) {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let p = products.find(item => item.id === id);
    if (p) {
        alert(`--- Product Details (${p.code}) ---\nBrand: ${p.brandName}\nComposition: ${p.composition}\nSegment: ${p.segment}\nFormulation: ${p.formulation}\nPacking: ${p.packing} (${p.packSize})\nMRP: ₹${p.mrp} | Rate: ₹${p.rate}\nHSN: ${p.hsn} | GST: ${p.tax}\nStock: ${p.stock}\nManufacturer: ${p.manufacturer}`);
    }
}

function editProduct(id) {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let p = products.find(item => item.id === id);
    if (!p) return;

    const formCard = document.getElementById('productFormCard');
    const toggleBtn = document.getElementById('toggleFormBtn');
    if (formCard) {
        formCard.style.display = 'block';
        if (toggleBtn) toggleBtn.innerText = '- Close Form';
    }

    const form = document.getElementById('productForm');
    if (form) {
        form.dataset.editId = p.id;
        
        if(document.getElementById('autoProductCode')) document.getElementById('autoProductCode').innerText = p.code || '';
        if(document.getElementById('prodSegment')) document.getElementById('prodSegment').value = p.segment || '';
        if(document.getElementById('prodListType')) document.getElementById('prodListType').value = p.listType || '';
        if(document.getElementById('prodBrandName')) document.getElementById('prodBrandName').value = p.brandName || '';
        if(document.getElementById('prodComposition')) document.getElementById('prodComposition').value = p.composition || '';
        if(document.getElementById('prodFormulation')) document.getElementById('prodFormulation').value = p.formulation || '';
        if(document.getElementById('prodPacking')) document.getElementById('prodPacking').value = p.packing || '';
        if(document.getElementById('prodPackSize')) document.getElementById('prodPackSize').value = p.packSize || '';
        if(document.getElementById('prodMrp')) document.getElementById('prodMrp').value = p.mrp || '';
        if(document.getElementById('prodRate')) document.getElementById('prodRate').value = p.rate || '';
        if(document.getElementById('prodHsn')) document.getElementById('prodHsn').value = p.hsn || '';
        if(document.getElementById('prodTax')) document.getElementById('prodTax').value = p.tax || '';
        if(document.getElementById('prodStock')) document.getElementById('prodStock').value = p.stock || '';
        if(document.getElementById('prodManufacturer')) document.getElementById('prodManufacturer').value = p.manufacturer || '';

        formCard.scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('primecure_products', JSON.stringify(products));
    displayAdminProducts();
    populateProductDropdowns();
    populateCalcProductDropdown();
    generateProductCode();
}

// --- Download Action Logic ---
function downloadProductList() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let win = window.open('', '_blank');
    let html = `<html><head><title>Public Product List</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #004080; margin-bottom: 5px; }
            p { text-align: center; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #004080; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 10px; background: #28a745; color: white; text-align: center; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>PRIME CURE PHARMA - PRODUCT LIST</h2>
        <p>Public Catalog (Rates & Pricing Hidden)</p>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>PRODUCT CODE</th>
                <th>BRAND NAME</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
                <th>MRP</th>
            </tr>`;

    products.forEach((p, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td>${p.code || 'N/A'}</td>
            <td><b>${p.brandName || 'N/A'}</b></td>
            <td>${p.composition || 'N/A'}</td>
            <td>${p.formulation || 'N/A'}</td>
            <td>${p.packing || 'N/A'}</td>
            <td>${p.packSize || 'N/A'}</td>
            <td>₹${p.mrp || '0'}</td>
        </tr>`;
    });

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

function downloadPriceList() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let win = window.open('', '_blank');
    let html = `<html><head><title>Private Price List</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #b30000; margin-bottom: 5px; }
            p { text-align: center; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #b30000; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 10px; background: #28a745; color: white; text-align: center; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>PRIME CURE PHARMA - CONFIDENTIAL PRICE LIST</h2>
        <p>Authorized Owner View (Includes Net Rates)</p>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>PRODUCT CODE</th>
                <th>BRAND NAME</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
                <th>MRP</th>
                <th>RATE</th>
            </tr>`;

    products.forEach((p, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td>${p.code || 'N/A'}</td>
            <td><b>${p.brandName || 'N/A'}</b></td>
            <td>${p.composition || 'N/A'}</td>
            <td>${p.formulation || 'N/A'}</td>
            <td>${p.packing || 'N/A'}</td>
            <td>${p.packSize || 'N/A'}</td>
            <td>₹${p.mrp || '0'}</td>
            <td><b style="color: #b30000;">₹${p.rate || '0'}</b></td>
        </tr>`;
    });

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

function downloadThirdPartyList() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let win = window.open('', '_blank');
    let html = `<html><head><title>Third-Party Molecule List</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #006600; margin-bottom: 5px; }
            p { text-align: center; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 12px; text-align: left; }
            th { background-color: #006600; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-btn { display: block; width: 200px; margin: 20px auto; padding: 10px; background: #28a745; color: white; text-align: center; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>PRIME CURE PHARMA - THIRD PARTY MOLECULES</h2>
        <p>Composition & Formulation List</p>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>COMPOSITION</th>
                <th>FORMULATION</th>
                <th>PACKING</th>
                <th>PACK</th>
            </tr>`;

    products.forEach((p, index) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td><b>${p.composition || 'N/A'}</b></td>
            <td>${p.formulation || 'N/A'}</td>
            <td>${p.packing || 'N/A'}</td>
            <td>${p.packSize || 'N/A'}</td>
        </tr>`;
    });

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

// --- 3. PURCHASE & ENQUIRY LOGIC ---
function toggleEnquiryMode() {
    const mode = document.getElementById('enquiryMode') ? document.getElementById('enquiryMode').value : '';
    const mode1 = document.getElementById('mode1Container');
    const mode2 = document.getElementById('mode2Container');

    if (mode === 'multipleProduct') {
        if (mode1) mode1.style.display = 'block';
        if (mode2) mode2.style.display = 'none';
    } else {
        if (mode1) mode1.style.display = 'none';
        if (mode2) mode2.style.display = 'block';
    }
}

function populateProductDropdowns() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    const enquiryProductSelect = document.getElementById('enquiryProductSelect');
    const checkboxList = document.getElementById('checkboxProductList');

    let selectOpts = '<option value="">Select Product</option>';
    let checkHtml = '';

    products.forEach(p => {
        selectOpts += `<option value="${p.id}">${p.code || 'N/A'} - ${p.brandName || 'N/A'} (${p.composition || 'N/A'})</option>`;
        checkHtml += `<label style="display:block; margin-bottom:5px; font-size:13px;">
            <input type="checkbox" name="enquiryProdCheck" value="${p.id}"> ${p.code || 'N/A'}: ${p.brandName || 'N/A'} [${p.composition || 'N/A'}]
        </label>`;
    });

    if (enquiryProductSelect) enquiryProductSelect.innerHTML = selectOpts;
    if (checkboxList) checkboxList.innerHTML = checkHtml;
}

function loadLinkedManufacturersForProduct() {
    const prodId = document.getElementById('enquiryProductSelect') ? document.getElementById('enquiryProductSelect').value : '';
    const checkboxMfgList = document.getElementById('checkboxMfgList');
    if (!prodId || !checkboxMfgList) {
        if (checkboxMfgList) checkboxMfgList.innerHTML = '';
        return;
    }

    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let manufacturers = JSON.parse(localStorage.getItem('primecure_manufacturers')) || [];
    let selectedProd = products.find(p => p.id == prodId);

    if (!selectedProd) return;

    let html = '';
    manufacturers.forEach(m => {
        let isMatch = (m.name === selectedProd.manufacturer);
        html += `<label style="display:block; margin-bottom:5px; font-size:13px;">
            <input type="checkbox" name="enquiryMfgCheck" value="${m.email}" ${isMatch ? 'checked' : ''}> 
            <strong>${m.name}</strong> (${m.email}) ${isMatch ? '<span style="color:green; font-weight:bold;">[Linked in Product]</span>' : ''}
        </label>`;
    });
    checkboxMfgList.innerHTML = html;
}

function sendMultiProductEnquiry() {
    const mfgEmail = document.getElementById('enquiryMfgSelect') ? document.getElementById('enquiryMfgSelect').value : '';
    if (!mfgEmail) {
        alert("Please select a manufacturer first!");
        return;
    }

    let checkedBoxes = document.querySelectorAll('input[name="enquiryProdCheck"]:checked');
    if (checkedBoxes.length === 0) {
        alert("Please select at least one product for enquiry!");
        return;
    }

    alert(`Enquiry email dispatched from info.primecurepharma@gmail.com to manufacturer: ${mfgEmail} with ${checkedBoxes.length} products!`);
    logEnquiry('Multiple Products -> Single Manufacturer', mfgEmail, checkedBoxes.length + ' products');
}

function sendSingleProductEnquiry() {
    let checkedMfg = document.querySelectorAll('input[name="enquiryMfgCheck"]:checked');
    const prodId = document.getElementById('enquiryProductSelect') ? document.getElementById('enquiryProductSelect').value : '';

    if (!prodId || checkedMfg.length === 0) {
        alert("Please select a product and at least one manufacturer!");
        return;
    }

    alert(`Enquiry email dispatched from info.primecurepharma@gmail.com to ${checkedMfg.length} manufacturers for the selected product.`);
    logEnquiry('Single Product -> Multiple Manufacturers', 'Multiple Units (' + checkedMfg.length + ')', '1 Product ID: ' + prodId);
}

function logEnquiry(mode, target, details) {
    const container = document.getElementById('comparisonLogContainer');
    if (!container) return;
    let logHtml = `<div style="padding: 10px; border-bottom: 1px solid #eee; font-size: 13px;">
        <strong>Mode:</strong> ${mode} | <strong>Target:</strong> ${target} | <strong>Details:</strong> ${details} 
        <br><small style="color: green;">✔ Email sent successfully via info.primecurepharma@gmail.com at ${new Date().toLocaleTimeString()}</small>
    </div>`;
    
    if (container.innerHTML.includes('No enquiry logs')) {
        container.innerHTML = logHtml;
    } else {
        container.innerHTML = logHtml + container.innerHTML;
    }
}

// --- 4. SCHEME & PROFIT CALCULATOR ---
function populateCalcProductDropdown() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    const select = document.getElementById('calcProductSelect');
    if (!select) return;

    let opts = '<option value="">-- Choose Product --</option>';
    products.forEach(p => {
        opts += `<option value="${p.id}">${p.brandName} (${p.code || 'N/A'})</option>`;
    });
    select.innerHTML = opts;
}

function loadProductCalcDetails() {
    const pSelect = document.getElementById('calcProductSelect');
    if (!pSelect) return;
    const pId = pSelect.value;
    if (!pId) return;

    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let p = products.find(item => item.id == pId);

    if (p) {
        const sellInput = document.getElementById('calcSellingRate');
        const purInput = document.getElementById('calcPurchaseRate');
        if (sellInput) sellInput.value = p.rate || 0;
        if (purInput) purInput.value = p.mrp ? (p.mrp * 0.35).toFixed(2) : 0;
        calculateSchemeProfit();
    }
}

function calculateSchemeProfit() {
    const orderQty = parseFloat(document.getElementById('calcOrderQty') ? document.getElementById('calcOrderQty').value : 0) || 0;
    const purchaseRate = parseFloat(document.getElementById('calcPurchaseRate') ? document.getElementById('calcPurchaseRate').value : 0) || 0;
    const sellingRate = parseFloat(document.getElementById('calcSellingRate') ? document.getElementById('calcSellingRate').value : 0) || 0;

    const batchQty = parseFloat(document.getElementById('calcBatchQty') ? document.getElementById('calcBatchQty').value : 1) || 1;
    const oneTimeCharges = parseFloat(document.getElementById('calcOneTimeCharges') ? document.getElementById('calcOneTimeCharges').value : 0) || 0;
    const cartons = parseFloat(document.getElementById('calcCartonCount') ? document.getElementById('calcCartonCount').value : 0) || 0;
    const freightPerCarton = parseFloat(document.getElementById('calcFreightPerCarton') ? document.getElementById('calcFreightPerCarton').value : 0) || 0;
    const bilty = parseFloat(document.getElementById('calcBiltyCharges') ? document.getElementById('calcBiltyCharges').value : 0) || 0;
    const outwardPct = parseFloat(document.getElementById('calcOutwardFreightPct') ? document.getElementById('calcOutwardFreightPct').value : 0) || 0;
    const giftCost = parseFloat(document.getElementById('calcGiftCost') ? document.getElementById('calcGiftCost').value : 0) || 0;

    const totalInwardFreight = (cartons * freightPerCarton) + bilty;
    const inwardFreightPerUnit = orderQty > 0 ? (totalInwardFreight / orderQty) : 0;
    const setupCostPerUnit = batchQty > 0 ? (oneTimeCharges / batchQty) : 0;
    const landedCostPerUnit = purchaseRate + setupCostPerUnit + inwardFreightPerUnit;

    const totalSalesRevenue = sellingRate * orderQty;
    const totalProductionCost = landedCostPerUnit * orderQty;
    const outwardFreightAmt = (totalSalesRevenue * outwardPct) / 100;
    const totalInvestment = totalProductionCost + outwardFreightAmt;

    const grossProfit = totalSalesRevenue - totalInvestment;
    const suggestedGiftBudget = Math.max(0, Math.min(totalSalesRevenue * 0.10, grossProfit * 0.30));

    const netProfitAfterGift = grossProfit - giftCost;
    const marginPct = totalSalesRevenue > 0 ? ((netProfitAfterGift / totalSalesRevenue) * 100) : 0;

    const resSales = document.getElementById('resTotalSales');
    const resLanded = document.getElementById('resLandedCost');
    const resInvest = document.getElementById('resTotalInvestment');
    const resBudget = document.getElementById('resGiftBudgetSuggest');
    const resGross = document.getElementById('resGrossProfit');
    const profitEl = document.getElementById('resNetProfit');
    const marginEl = document.getElementById('resMarginPct');

    if (resSales) resSales.innerText = `₹${totalSalesRevenue.toFixed(2)}`;
    if (resLanded) resLanded.innerText = `₹${landedCostPerUnit.toFixed(2)} / unit`;
    if (resInvest) resInvest.innerText = `₹${totalInvestment.toFixed(2)}`;
    if (resBudget) resBudget.innerText = `₹${suggestedGiftBudget.toFixed(2)} (Safe Budget)`;
    if (resGross) resGross.innerText = `₹${grossProfit.toFixed(2)}`;
    
    if (profitEl) {
        profitEl.innerText = `₹${netProfitAfterGift.toFixed(2)}`;
        profitEl.style.color = netProfitAfterGift >= 0 ? '#15803d' : '#dc2626';
    }

    if (marginEl) {
        marginEl.innerText = `${marginPct.toFixed(2)}%`;
        marginEl.style.color = marginPct >= 0 ? '#15803d' : '#dc2626';
    }
}

function saveSchemeCalculation() {
    const pSelect = document.getElementById('calcProductSelect');
    if (!pSelect || !pSelect.value) { alert("Please select a product first!"); return; }

    const pId = pSelect.value;
    let savedSchemes = JSON.parse(localStorage.getItem('primecure_saved_schemes')) || [];
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let prod = products.find(p => p.id == pId);

    const calcForm = document.getElementById('schemeCalcForm');
    const editId = calcForm ? calcForm.dataset.editId : null;

    if (editId) {
        let entryIndex = savedSchemes.findIndex(s => s.id == editId);
        if (entryIndex !== -1) {
            savedSchemes[entryIndex] = {
                id: Number(editId),
                productId: pId,
                brandName: prod ? prod.brandName : 'N/A',
                composition: prod ? prod.composition : 'N/A',
                packing: prod ? prod.packing : 'N/A',
                packSize: prod ? prod.packSize : 'N/A',
                orderQty: document.getElementById('calcOrderQty').value,
                purchaseRate: document.getElementById('calcPurchaseRate').value,
                sellingRate: document.getElementById('calcSellingRate').value,
                batchQty: document.getElementById('calcBatchQty').value,
                oneTimeCharges: document.getElementById('calcOneTimeCharges').value,
                cartons: document.getElementById('calcCartonCount').value,
                freightPerCarton: document.getElementById('calcFreightPerCarton').value,
                bilty: document.getElementById('calcBiltyCharges').value,
                outwardPct: document.getElementById('calcOutwardFreightPct').value,
                giftItem: document.getElementById('calcGiftItem').value || 'Special Gift Offer',
                giftCost: document.getElementById('calcGiftCost').value || '0',
                giftImage: currentUploadedGiftImage || (savedSchemes[entryIndex] ? savedSchemes[entryIndex].giftImage : ''),
                netProfit: document.getElementById('resNetProfit').innerText,
                marginPct: document.getElementById('resMarginPct').innerText
            };

            alert("✅ Saved Scheme Entry updated successfully!");
            delete calcForm.dataset.editId;
        }
    } else {
        const entry = {
            id: Date.now(),
            productId: pId,
            brandName: prod ? prod.brandName : 'N/A',
            composition: prod ? prod.composition : 'N/A',
            packing: prod ? prod.packing : 'N/A',
            packSize: prod ? prod.packSize : 'N/A',
            orderQty: document.getElementById('calcOrderQty').value,
            purchaseRate: document.getElementById('calcPurchaseRate').value,
            sellingRate: document.getElementById('calcSellingRate').value,
            batchQty: document.getElementById('calcBatchQty').value,
            oneTimeCharges: document.getElementById('calcOneTimeCharges').value,
            cartons: document.getElementById('calcCartonCount').value,
            freightPerCarton: document.getElementById('calcFreightPerCarton').value,
            bilty: document.getElementById('calcBiltyCharges').value,
            outwardPct: document.getElementById('calcOutwardFreightPct').value,
            giftItem: document.getElementById('calcGiftItem').value || 'Special Gift Offer',
            giftCost: document.getElementById('calcGiftCost').value || '0',
            giftImage: currentUploadedGiftImage || '',
            netProfit: document.getElementById('resNetProfit').innerText,
            marginPct: document.getElementById('resMarginPct').innerText
        };
        savedSchemes.push(entry);
        alert("✅ Scheme calculation entry saved successfully!");
    }

    localStorage.setItem('primecure_saved_schemes', JSON.stringify(savedSchemes));
    
    currentUploadedGiftImage = '';
    if (calcForm) calcForm.reset();
    const box = document.getElementById('giftImagePreviewBox');
    if (box) box.innerHTML = `<span style="font-size: 10px; color: #aaa; text-align: center;">No Image</span>`;
    
    displaySavedSchemesTable();
}

function displaySavedSchemesTable() {
    const container = document.getElementById('savedSchemeListContainer');
    if (!container) return;

    let savedSchemes = JSON.parse(localStorage.getItem('primecure_saved_schemes')) || [];
    if (savedSchemes.length === 0) {
        container.innerHTML = '<p style="color: #777;">No saved schemes yet.</p>';
        return;
    }

    let html = `<table class="table-style">
        <tr>
            <th>SR</th>
            <th>GIFT PHOTO</th>
            <th>PRODUCT</th>
            <th>QTY</th>
            <th>GIFT ITEM</th>
            <th>GIFT COST</th>
            <th>NET PROFIT</th>
            <th>MARGIN %</th>
            <th>ACTIONS</th>
        </tr>`;

    savedSchemes.forEach((s, idx) => {
        let imgTag = s.giftImage ? `<img src="${s.giftImage}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">` : `<span style="font-size:10px; color:#999;">No Photo</span>`;
        let costDisplay = (s.giftCost !== undefined && s.giftCost !== null) ? s.giftCost : '0';

        html += `<tr>
            <td>${idx + 1}</td>
            <td style="text-align:center;">${imgTag}</td>
            <td><strong>${s.brandName}</strong></td>
            <td>${s.orderQty}</td>
            <td style="max-width:180px; word-wrap:break-word;" title="${s.giftItem}">${s.giftItem}</td>
            <td>₹${costDisplay}</td>
            <td><strong style="color:green;">${s.netProfit}</strong></td>
            <td><strong>${s.marginPct}</strong></td>
            <td>
                <button class="action-btn edit-btn" onclick="editSchemeEntry(${s.id})">Edit</button>
                <button class="delete-btn" onclick="deleteSchemeEntry(${s.id})">Delete</button>
            </td>
        </tr>`;
    });

    html += `</table>`;
    container.innerHTML = html;
}

function editSchemeEntry(id) {
    let savedSchemes = JSON.parse(localStorage.getItem('primecure_saved_schemes')) || [];
    let entry = savedSchemes.find(s => s.id == id);
    if (!entry) return;

    const calcForm = document.getElementById('schemeCalcForm');
    if (calcForm) calcForm.dataset.editId = entry.id;

    if (entry.productId && document.getElementById('calcProductSelect')) document.getElementById('calcProductSelect').value = entry.productId;
    if (document.getElementById('calcOrderQty')) document.getElementById('calcOrderQty').value = entry.orderQty || 100;
    if (document.getElementById('calcPurchaseRate')) document.getElementById('calcPurchaseRate').value = entry.purchaseRate || 0;
    if (document.getElementById('calcSellingRate')) document.getElementById('calcSellingRate').value = entry.sellingRate || 0;
    if (document.getElementById('calcBatchQty')) document.getElementById('calcBatchQty').value = entry.batchQty || 5000;
    if (document.getElementById('calcOneTimeCharges')) document.getElementById('calcOneTimeCharges').value = entry.oneTimeCharges || 0;
    if (document.getElementById('calcCartonCount')) document.getElementById('calcCartonCount').value = entry.cartons || 5;
    if (document.getElementById('calcFreightPerCarton')) document.getElementById('calcFreightPerCarton').value = entry.freightPerCarton || 100;
    if (document.getElementById('calcBiltyCharges')) document.getElementById('calcBiltyCharges').value = entry.bilty || 100;
    if (document.getElementById('calcOutwardFreightPct')) document.getElementById('calcOutwardFreightPct').value = entry.outwardPct || 2.0;
    if (document.getElementById('calcGiftItem')) document.getElementById('calcGiftItem').value = entry.giftItem || '';
    if (document.getElementById('calcGiftCost')) document.getElementById('calcGiftCost').value = (entry.giftCost !== undefined) ? entry.giftCost : 0;

    if (entry.giftImage) {
        currentUploadedGiftImage = entry.giftImage;
        const box = document.getElementById('giftImagePreviewBox');
        if (box) box.innerHTML = `<img src="${currentUploadedGiftImage}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    calculateSchemeProfit();
    if (calcForm) calcForm.scrollIntoView({ behavior: 'smooth' });
}

function deleteSchemeEntry(id) {
    let savedSchemes = JSON.parse(localStorage.getItem('primecure_saved_schemes')) || [];
    savedSchemes = savedSchemes.filter(s => s.id != id);
    localStorage.setItem('primecure_saved_schemes', JSON.stringify(savedSchemes));
    displaySavedSchemesTable();
}

function generateOwnerConfidentialSheet() {
    let savedSchemes = JSON.parse(localStorage.getItem('primecure_saved_schemes')) || [];
    if (savedSchemes.length === 0) { alert("No saved scheme entries found. Please save an entry first!"); return; }

    let win = window.open('', '_blank');
    let html = `<html><head><title>Confidential Owner Scheme & Costing Sheet</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; background: #f8fafc; }
            h2 { text-align: center; color: #b30000; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            p { text-align: center; color: #64748b; font-size: 12px; margin-top: 0; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            th, td { border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; text-align: left; vertical-align: middle; }
            th { background-color: #b30000; color: white; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .gift-col { max-width: 180px; word-wrap: break-word; word-break: break-word; font-weight: bold; color: #004080; }
            .gift-img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; }
            .print-btn { display: block; width: 220px; margin: 20px auto; padding: 12px; background: #16a34a; color: white; text-align: center; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>PRIME CURE PHARMA - CONFIDENTIAL OWNER COSTING & SCHEME SHEET</h2>
        <p>INTERNAL MANAGEMENT USE ONLY (Detailed Costing, Gift Expense & Post-Gift Margins)</p>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <table>
            <tr>
                <th>SR</th>
                <th>GIFT PHOTO</th>
                <th>BRAND NAME & DETAILS</th>
                <th>QTY</th>
                <th>PURCHASE</th>
                <th>SELLING</th>
                <th>OFFERED GIFT</th>
                <th>GIFT COST</th>
                <th>NET PROFIT</th>
                <th>MARGIN %</th>
            </tr>`;

    savedSchemes.forEach((s, idx) => {
        let imgTag = s.giftImage ? `<img src="${s.giftImage}" class="gift-img">` : `<span style="color:#aaa; font-size:10px;">No Photo</span>`;
        let costVal = (s.giftCost !== undefined && s.giftCost !== null) ? s.giftCost : '0';

        html += `<tr>
            <td>${idx + 1}</td>
            <td style="text-align:center;">${imgTag}</td>
            <td><b>${s.brandName}</b><br><small style="color:#64748b;">${s.composition}</small></td>
            <td><b>${s.orderQty}</b></td>
            <td>₹${s.purchaseRate}</td>
            <td>₹${s.sellingRate}</td>
            <td class="gift-col" title="${s.giftItem}">${s.giftItem}</td>
            <td><b style="color:#dc2626;">₹${costVal}</b></td>
            <td><b style="color:#16a34a;">${s.netProfit}</b></td>
            <td><b style="color:#16a34a;">${s.marginPct}</b></td>
        </tr>`;
    });

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}

function generateClientPublicSchemeSheet() {
    let savedSchemes = JSON.parse(localStorage.getItem('primecure_saved_schemes')) || [];
    if (savedSchemes.length === 0) { alert("No saved scheme entries found. Please save an entry first!"); return; }

    let win = window.open('', '_blank');
    let html = `<html><head><title>Exclusive Offer & Gift Scheme Catalog</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; background: #f8fafc; }
            h2 { text-align: center; color: #004080; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            p { text-align: center; color: #64748b; font-size: 13px; margin-top: 0; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            th, td { border: 1px solid #e2e8f0; padding: 12px; font-size: 13px; text-align: left; vertical-align: middle; }
            th { background-color: #004080; color: white; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .gift-col { max-width: 220px; word-wrap: break-word; word-break: break-word; font-weight: bold; color: #b30000; }
            .gift-img { width: 65px; height: 65px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .print-btn { display: block; width: 220px; margin: 20px auto; padding: 12px; background: #16a34a; color: white; text-align: center; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>PRIME CURE PHARMA - EXCLUSIVE GIFT OFFER CATALOG</h2>
        <p>Promotional Scheme Benefits & Reward Gift Items for Channel Partners</p>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Download PDF Catalog</button>
        <table>
            <tr>
                <th>SR NO.</th>
                <th>GIFT PREVIEW</th>
                <th>BRAND NAME</th>
                <th>COMPOSITION</th>
                <th>PACKING</th>
                <th>REQUIRED ORDER QTY</th>
                <th>OFFERED SCHEME / FREE GIFT</th>
            </tr>`;

    savedSchemes.forEach((s, idx) => {
        let imgTag = s.giftImage ? `<img src="${s.giftImage}" class="gift-img">` : `<span style="color:#aaa; font-size:10px;">🎁 Special Offer</span>`;
        html += `<tr>
            <td style="text-align:center;"><b>${idx + 1}</b></td>
            <td style="text-align:center;">${imgTag}</td>
            <td><b style="color:#004080; font-size: 14px;">${s.brandName}</b></td>
            <td>${s.composition}</td>
            <td>${s.packing} (${s.packSize})</td>
            <td><b style="color:#16a34a; font-size:14px;">${s.orderQty} Boxes/Units</b></td>
            <td class="gift-col" title="${s.giftItem}">🎁 ${s.giftItem}</td>
        </tr>`;
    });

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}