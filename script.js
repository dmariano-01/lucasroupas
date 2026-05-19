const products = [
      { id: 0, name: 'Jaqueta Leon RE4',  price: 480, category: 'jaquetas', emoji: '🧥', colors: ['#2c2c2c', '#8b6914', '#1a3a2a'], tag: 'New' },
      { id: 1, name: 'Vestido Azul Esquizóide',       price: 320, category: 'vestidos',   emoji: '👗', colors: ['#1a1520', '#2d1515', '#151a2d'] },
      { id: 2, name: 'Calça SAMVEEAAAUBDMPEEPAESMUEOQIEOQVD',     price: 240, category: 'inferiores',   emoji: '👖', colors: ['#1c1c1c', '#14202a', '#2a1c14'], tag: 'Bestseller' },
      { id: 3, name: 'Camisa Transparente Elegante',       price: 195, category: 'superiores',      emoji: '👔', colors: ['#e8dcc8', '#c8d8e8', '#cce8cc'] },
      { id: 4, name: 'Novelo Gourmet',         price: 285, category: 'superiores',      emoji: '🧶', colors: ['#d4c4b0', '#b0c4d4', '#c4b0d4'] },
      { id: 5, name: 'Camisa Verde-Neon',        price: 210, category: 'inferiores',   emoji: '👕', colors: ['#1a2535', '#35251a', '#252535'] },
      { id: 6, name: 'Blazer',            price: 560, category: 'vestidos', emoji: '🥼', colors: ['#2a2a2a', '#3a2a1a'], tag: 'Limited' },
      { id: 7, name: 'Vestidinhoinho',            price: 175, category: 'vestidos',   emoji: '🩱', colors: ['#2a1520', '#1a2520', '#25201a'] },
    ];

    let currentView = 'landing';
    let selectedProduct = null;
    let userPhotoUploaded = false;
    let generationHistory = [];
    let savedCount = 0;

    function showView(v) {
      document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
      document.getElementById('view-' + v).classList.add('active');
      currentView = v;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (v === 'shop') renderShop('all');
      if (v === 'dashboard') renderDashboard();
    }

    function renderShop(filter) {
      const grid = document.getElementById('shopGrid');
      const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
      grid.innerHTML = filtered.map(p => `
        <div class="product-card" onclick="openProduct(${p.id})">
          <div class="product-img" style="background:${p.colors[0]}">
            <div class="product-img-inner">${p.emoji}</div>
            <div class="product-overlay">
              <button class="try-btn" onclick="event.stopPropagation();selectProductAndTry(${p.id})">Try with AI</button>
            </div>
          </div>
          ${p.tag ? `<div class="product-tag">${p.tag}</div>` : ''}
          <div class="product-info">
            <div class="product-name">${p.name}</div>
            <div class="product-meta">
              <span class="product-price">$${p.price}</span>
              <span class="product-category">${p.category}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    function filterProducts(btn, cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShop(cat);
    }

    function openProduct(id) {
      const p = products[id];
      selectedProduct = p;
      document.getElementById('detailImg').textContent = p.emoji;
      document.getElementById('detailImg').style.background = p.colors[0];
      document.getElementById('detailName').textContent = p.name;
      document.getElementById('detailPrice').textContent = '$' + p.price;
      document.getElementById('detailColors').innerHTML = p.colors
        .map((c, i) => `<div class="color-dot${i === 0 ? ' active' : ''}" style="background:${c}" onclick="selectColor(this)"></div>`)
        .join('');
      showView('product');
    }

    function selectSize(btn) {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function selectColor(dot) {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    }

    function tryCurrentProduct() {
      if (!selectedProduct) return;
      showView('tryon');
      setTimeout(() => {
        const cards = document.getElementById('clothesMiniGrid').querySelectorAll('.clothes-mini-card');
        cards.forEach(c => c.classList.remove('selected'));
        const idx = products.findIndex(p => p.id === selectedProduct.id);
        if (cards[idx % cards.length]) cards[idx % cards.length].classList.add('selected');
        checkGenerateReady();
      }, 100);
    }

    function selectProductAndTry(id) {
      selectedProduct = products[id];
      showView('tryon');
      setTimeout(() => {
        const cards = document.getElementById('clothesMiniGrid').querySelectorAll('.clothes-mini-card');
        cards.forEach(c => c.classList.remove('selected'));
        if (cards[id]) cards[id].classList.add('selected');
        checkGenerateReady();
      }, 100);
    }

    function addToCart() {
      showToast('Added to cart', 'success');
    }

    function initTryOn() {
      document.getElementById('clothesMiniGrid').innerHTML = products.map((p, i) => `
        <div class="clothes-mini-card" onclick="selectCloth(this,${i})">
          <div class="clothes-mini-emoji">${p.emoji}</div>
          <div class="clothes-mini-name">${p.name}</div>
        </div>
      `).join('');
    }
    initTryOn();

    function selectCloth(el, i) {
      document.querySelectorAll('.clothes-mini-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      selectedProduct = products[i];
      checkGenerateReady();
    }

    function handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const prev = document.getElementById('uploadedPreview');
        prev.src = ev.target.result;
        prev.style.display = 'block';
        document.getElementById('uploadIcon').style.display = 'none';
        document.getElementById('uploadLabel').style.display = 'none';
        document.getElementById('uploadSub').style.display = 'none';
        document.getElementById('uploadZone').classList.add('has-image');
        userPhotoUploaded = true;
        checkGenerateReady();
      };
      reader.readAsDataURL(file);
    }

    function checkGenerateReady() {
      document.getElementById('generateBtn').disabled = !(userPhotoUploaded && selectedProduct);
    }

    const loadMessages = [
      'Analyzing your photo...',
      'Mapping body geometry...',
      'Applying garment physics...',
      'Adjusting lighting...',
      'Finalizing your look...',
    ];

    function generateTryOn() {
      if (!userPhotoUploaded) { showToast('Please upload your photo first', 'error'); return; }
      if (!selectedProduct)   { showToast('Please select a garment', 'error'); return; }

      const overlay = document.getElementById('loadingOverlay');
      const loadText = document.getElementById('loadText');
      const loadBar  = document.getElementById('loadBar');

      overlay.classList.add('active');
      loadBar.style.animation = 'none';
      loadBar.offsetHeight;
      loadBar.style.animation = 'loadProgress 3s ease-in-out forwards';

      let msgIdx = 0;
      loadText.textContent = loadMessages[0];
      const msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % loadMessages.length;
        loadText.textContent = loadMessages[msgIdx];
      }, 600);

      setTimeout(() => {
        clearInterval(msgInterval);
        overlay.classList.remove('active');
        showResult();
        showToast('Try-on generated successfully!', 'success');
        generationHistory.unshift({ product: selectedProduct, time: new Date() });
        document.getElementById('dashTrials').textContent = generationHistory.length;
      }, 3000);
    }

    function showResult() {
      document.getElementById('resultEmpty').style.display = 'none';
      const rc = document.getElementById('resultContent');
      rc.style.display = 'flex';

      const prev = document.getElementById('uploadedPreview');
      if (prev.src) {
        document.getElementById('beforeImg').innerHTML =
          `<img src="${prev.src}" style="width:100%;height:100%;object-fit:cover">`;
      }

      document.getElementById('afterImg').innerHTML = `
        <div style="width:100%;height:100%;background:linear-gradient(160deg,${selectedProduct.colors[0]},#0d0d0d);
                    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
          <div style="font-size:80px;filter:drop-shadow(0 0 20px rgba(108,99,255,0.5))">${selectedProduct.emoji}</div>
          <div style="font-size:11px;letter-spacing:2px;color:rgba(255,255,255,0.5);
                      font-family:var(--font-mono);text-transform:uppercase">${selectedProduct.name}</div>
        </div>
      `;
    }

    function downloadResult() { showToast('Downloading your look...', 'success'); }
    function shareResult()    { showToast('Link copied to clipboard!', 'success'); }
    function saveToLookbook() {
      savedCount++;
      document.getElementById('dashSaved').textContent = savedCount;
      showToast('Saved to your lookbook ♡', 'success');
    }

    function renderDashboard() {
      const grid  = document.getElementById('historyGrid');
      const empty = document.getElementById('historyEmpty');
      document.getElementById('dashTrials').textContent = generationHistory.length;
      document.getElementById('dashSaved').textContent  = savedCount;

      if (generationHistory.length === 0) {
        grid.style.display  = 'none';
        empty.style.display = 'block';
        return;
      }

      grid.style.display  = 'grid';
      empty.style.display = 'none';
      grid.innerHTML = generationHistory.map(g => `
        <div style="background:var(--bg2);border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s"
             onmouseenter="this.style.transform='translateY(-4px)'"
             onmouseleave="this.style.transform='translateY(0)'">
          <div style="aspect-ratio:3/4;background:linear-gradient(160deg,${g.product.colors[0]},#0d0d0d);
                      display:flex;align-items:center;justify-content:center;font-size:56px">
            ${g.product.emoji}
          </div>
          <div style="padding:14px">
            <div style="font-size:13px;font-weight:500;margin-bottom:4px">${g.product.name}</div>
            <div style="font-size:11px;color:var(--text3);font-family:var(--font-mono)">${g.time.toLocaleDateString()}</div>
          </div>
        </div>
      `).join('');
    }

    function showToast(msg, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<div class="toast-dot"></div><span>${msg}</span>`;
      container.appendChild(toast);
      requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 3000);
    }

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));