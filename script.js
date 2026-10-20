document.addEventListener('DOMContentLoaded', () => {
    loadHomeShowcaseAndBanners();
    attachButtonListeners();
});

function loadHomeShowcaseAndBanners() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];

    const prodDisplay = document.getElementById('productImageDisplay');
    const visualDisplay = document.getElementById('visualPageDisplay');
    const bannerContainer = document.getElementById('dynamicBannerContainer');

    if (products.length > 0) {
        // Combined Sync Showcase (Product & Visual Aid animate together at the exact same time)
        let showcaseIndex = 0;
        function updateShowcases() {
            let p = products[showcaseIndex % products.length];
            
            // 1. Product Image Showcase
            let imgSrc = p.productImage || p.image || p.img || '';
            let brand = p.brandName || 'PrimeCure Product';
            let composition = p.composition || '';

            if (prodDisplay) {
                if (imgSrc) {
                    prodDisplay.innerHTML = `
                        <div style="text-align: center; padding: 10px; animation: fadeIn 0.8s ease-in-out;">
                            <img src="${imgSrc}" alt="${brand}" style="max-height: 290px; width: auto; max-width: 100%; object-fit: contain; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 6px 12px rgba(0,0,0,0.15);">
                            <h4 style="color: #004080; margin: 8px 0; font-size: 19px; font-weight: bold;">${brand}</h4>
                            <p style="color: #555; font-size: 13px; margin: 0; max-height: 40px; overflow: hidden;">${composition}</p>
                        </div>
                    `;
                } else {
                    prodDisplay.innerHTML = `<p style="color: #777; font-style: italic; padding: 50px; text-align: center;">No product image uploaded for ${brand}.</p>`;
                }
            }

            // 2. Visual Aid Page Showcase (In 100% Sync with Product)
            let rawVisual = p.visualAid || p.visual || p.visualImage || '';
            let visualSrc = '';
            if (rawVisual) {
                if (!rawVisual.includes('VISUAL') && !rawVisual.includes('images/')) {
                    visualSrc = 'images/' + rawVisual.replace('images/', '');
                } else {
                    visualSrc = rawVisual;
                }
            }

            if (visualDisplay) {
                if (visualSrc) {
                    visualDisplay.innerHTML = `
                        <div style="text-align: center; padding: 10px; animation: fadeIn 0.8s ease-in-out;">
                            <img src="${visualSrc}" alt="${brand} Visual Aid" style="max-height: 290px; width: auto; max-width: 100%; object-fit: contain; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 6px 12px rgba(0,0,0,0.15);">
                            <h4 style="color: #b30000; margin: 8px 0; font-size: 19px; font-weight: bold;">${brand} Visual Aid</h4>
                            <p style="color: #555; font-size: 13px; margin: 0;">Promotional Presentation Page</p>
                        </div>
                    `;
                } else {
                    visualDisplay.innerHTML = `<p style="color: #777; font-style: italic; padding: 60px 20px; text-align: center; font-size: 15px;">No visual aid uploaded for ${brand}.</p>`;
                }
            }

            showcaseIndex++;
        }

        updateShowcases();
        setInterval(updateShowcases, 4000); // Dono ab ek hi timer par ek sath chalenge

        // 3. Dynamic Banners from Products (Enhanced Aspect Ratio & Size Support)
        let customBanners = [];
        products.forEach(p => {
            let bannerSrc = p.banner || p.bannerImage || '';
            if (bannerSrc) {
                customBanners.push({
                    title: p.brandName ? `Special Offer: ${p.brandName}` : 'PCD Pharma Franchise Offer',
                    text: p.composition || 'High quality medical formulations with best profit margins.',
                    image: bannerSrc
                });
            }
        });

        if (customBanners.length > 0 && bannerContainer) {
            let bannerHtml = '';
            customBanners.forEach((b, idx) => {
                bannerHtml += `
                    <div class="slide ${idx === 0 ? 'active-slide' : ''}" style="background: url('${b.image}') no-repeat center center; background-size: cover; position: relative; min-height: 350px;">
                        <div style="background: rgba(0, 0, 0, 0.45); padding: 25px; border-radius: 8px; display: inline-block; max-width: 80%;">
                            <h2 style="color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); font-size: 26px; margin-bottom: 10px;">${b.title}</h2>
                            <p style="color: #fff; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); font-size: 15px; margin: 0;">${b.text}</p>
                        </div>
                    </div>
                `;
            });
            bannerContainer.innerHTML = bannerHtml;
        }
    }

    startBannerSlider();
}

function startBannerSlider() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active-slide');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active-slide');
        }, 4000);
    }
}

// Automatically attach click events to PCD & Third-Party buttons
function attachButtonListeners() {
    const allButtons = document.querySelectorAll('button, a');
    allButtons.forEach(btn => {
        let text = btn.innerText.toLowerCase();
        if (text.includes('pcd product list') || text.includes('explore pcd')) {
            btn.onclick = (e) => { e.preventDefault(); openPcdProductList(); };
        }
        if (text.includes('third-party product list') || text.includes('explore third-party') || text.includes('third party')) {
            btn.onclick = (e) => { e.preventDefault(); openThirdPartyProductList(); };
        }
    });
}

function openPcdProductList() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let pcdProducts = products.filter(p => !p.listType || p.listType === 'PCD');
    openPublicListWindow('PCD PRODUCT LIST', pcdProducts);
}

function openThirdPartyProductList() {
    let products = JSON.parse(localStorage.getItem('primecure_products')) || [];
    let thirdPartyProducts = products.filter(p => p.listType === 'ThirdParty');
    openPublicListWindow('THIRD PARTY MANUFACTURING LIST', thirdPartyProducts.length ? thirdPartyProducts : products);
}

function openPublicListWindow(title, prodArray) {
    let win = window.open('', '_blank');
    let html = `<html><head><title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; color: #004080; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; text-align: left; }
            th { background-color: #004080; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-btn { display: block; width: 180px; margin: 20px auto; padding: 10px; background: #28a745; color: white; text-align: center; border: none; border-radius: 5px; cursor: pointer; font-size: 15px; }
            @media print { .print-btn { display: none; } }
        </style></head><body>
        <h2>PRIME CURE PHARMA - ${title}</h2>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
        <table>
            <tr><th>SR</th><th>BRAND NAME</th><th>COMPOSITION</th><th>PACKING</th><th>PACK SIZE</th><th>MRP</th></tr>`;

    prodArray.forEach((p, idx) => {
        html += `<tr>
            <td>${idx + 1}</td>
            <td><b>${p.brandName}</b></td>
            <td>${p.composition}</td>
            <td>${p.packing || 'N/A'}</td>
            <td>${p.packSize || 'N/A'}</td>
            <td>₹${p.mrp || '0'}</td>
        </tr>`;
    });

    html += `</table></body></html>`;
    win.document.write(html);
    win.document.close();
}