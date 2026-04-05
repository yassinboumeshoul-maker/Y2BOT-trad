document.addEventListener('DOMContentLoaded', () => {
    // State
    let state = {
        isLoggedIn: localStorage.getItem('yb_logged_in') === 'true',
        user: localStorage.getItem('yb_user') || 'YASSINE BOUMESHOULE',
        selectedAsset: localStorage.getItem('yb_selected_asset') || 'BTC/USDT',
        trialCount: parseInt(localStorage.getItem('yb_trial_count') || '0'),
        history: JSON.parse(localStorage.getItem('yb_history') || '[]'),
        isAnalyzing: false,
        uploadedImage: null
    };

    // DOM Elements
    const views = {
        login: document.getElementById('login-view'),
        app: document.getElementById('app-ui'),
        setup: document.getElementById('setup-view'),
        result: document.getElementById('result-view'),
        payment: document.getElementById('payment-view'),
        plan: document.getElementById('plan-selection'),
        success: document.getElementById('success-view')
    };
    
    // Auth Elements
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const displayName = document.getElementById('display-name');

    // Dashboard Elements
    const assetCards = document.querySelectorAll('.asset-card');
    const priceInput = document.getElementById('price-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const resChartImg = document.getElementById('res-chart-img');
    
    // Modal/Payment Elements
    const modal = document.getElementById('subscription-modal');
    const unlockBtn = document.getElementById('unlock-btn');
    const goToPayment = document.getElementById('go-to-payment');
    const confirmPayment = document.getElementById('confirm-payment');
    const closeModals = document.querySelectorAll('.close-modal, .modal-backdrop, .close-modal-success');

    // Result Elements
    const resSymbol = document.getElementById('result-symbol');
    const resSignal = document.getElementById('signal-value');
    const resConfidence = document.getElementById('confidence-pct');
    const resPrice = document.getElementById('res-market-price');
    const resEntry = document.getElementById('res-entry');
    const resTP = document.getElementById('res-tp');
    const resSL = document.getElementById('res-sl');
    const resRR = document.getElementById('res-rr');
    const resLogic = document.getElementById('logic-text');
    const resStrategy = document.getElementById('res-strategy-badge');
    const indContainer = document.querySelector('.indicator-items');
    const sumBuy = document.getElementById('sum-buy');
    const sumSell = document.getElementById('sum-sell');

    // --- Initialization ---
    if (state.isLoggedIn) {
        showApp();
    } else {
        showLogin();
    }
    renderHistory();
    updateTrialUI();

    // --- Auth Handlers ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const policy = document.getElementById('policy-agg').checked;
        
        if (!policy) {
            alert('Please accept the Privacy Policy to continue with Google.');
            return;
        }

        // Simulate Google Auth
        const simulatedGoogleUser = 'YASSINE BOUMESHOULE'; // Automatically assigned via Google simulation
        state.isLoggedIn = true;
        state.user = simulatedGoogleUser;
        
        // Comprehensive Save
        saveState();
        
        showApp();
    });

    logoutBtn.addEventListener('click', () => {
        state.isLoggedIn = false;
        saveState();
        showLogin();
    });

    function saveState() {
        localStorage.setItem('yb_logged_in', state.isLoggedIn);
        localStorage.setItem('yb_user', state.user);
        localStorage.setItem('yb_selected_asset', state.selectedAsset);
        localStorage.setItem('yb_trial_count', state.trialCount);
        localStorage.setItem('yb_history', JSON.stringify(state.history.slice(0, 10)));
    }

    function showLogin() {
        views.login.classList.remove('hidden');
        views.app.classList.add('hidden');
    }

    function showApp() {
        views.login.classList.add('hidden');
        views.app.classList.remove('hidden');
        displayName.innerText = state.user;
        
        // Ensure Lucide icons refresh
        lucide.createIcons();
        
        // Re-init asset active states
        assetCards.forEach(card => {
            if (card.dataset.asset === state.selectedAsset) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    // --- Dashboard Handlers ---
    assetCards.forEach(card => {
        card.addEventListener('click', () => {
            assetCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            state.selectedAsset = card.dataset.asset;
            saveState(); // Ensure property is saved on change
        });
    });

    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                state.uploadedImage = event.target.result;
                imgPreview.src = event.target.result;
                imgPreview.classList.remove('hidden-img');
                uploadPlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeBtn.addEventListener('click', startAnalysis);

    function startAnalysis() {
        if (state.isAnalyzing) return;
        
        if (state.trialCount >= 1) {
            showSubscription();
            return;
        }

        const price = parseFloat(priceInput.value);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid market price.');
            return;
        }

        if (!state.uploadedImage) {
            alert('Please upload a chart screenshot for AI Vision analysis.');
            return;
        }

        state.isAnalyzing = true;
        analyzeBtn.innerText = 'ANALYZING CHART VISION...';
        analyzeBtn.disabled = true;

        setTimeout(() => {
            const result = generateAnalysis(state.selectedAsset, price);
            state.history.unshift(result);
            state.trialCount++;
            state.isAnalyzing = false;
            
            saveState(); // Save all properties comprehensively
            
            showResult(result);
            updateTrialUI();
            renderHistory();
        }, 3000);
    }

    function generateAnalysis(symbol, price) {
        const seedStr = symbol + price;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0;
        }
        const seed = Math.abs(hash);

        // Define Strategies
        const strategies = [
            "Triple Confirmation Alpha",
            "Mean Reversion Pulse",
            "Institutional Volume Flow",
            "Harmonic Wave Sniper",
            "Price Action Breakout",
            "Liquidity Sweep Engine"
        ];
        const strategyName = strategies[seed % strategies.length];

        const signals = ['BUY', 'SELL', 'WAIT'];
        const signal = signals[seed % signals.length];
        const confidence = 82 + (seed % 15);
        
        // Tighter TP/SL (Realistic values: 0.5% to 1.5%)
        const baseVolatility = 0.005 + (seed % 100) / 10000; // 0.5% to 1.5%
        let tpOffset, slOffset;
        
        if (signal === 'BUY') {
            tpOffset = 1 + (baseVolatility * 1.8);
            slOffset = 1 - baseVolatility;
        } else if (signal === 'SELL') {
            tpOffset = 1 - (baseVolatility * 1.8);
            slOffset = 1 + baseVolatility;
        } else {
            tpOffset = 1 + (baseVolatility * 0.5);
            slOffset = 1 - (baseVolatility * 0.5);
        }

        const tp = price * tpOffset;
        const sl = price * slOffset;

        const indicators = [
            { name: 'RSI(14)', sig: signal === 'BUY' ? 'OVERSOLD' : (signal === 'SELL' ? 'OVERBOUGHT' : 'NEUTRAL'), desc: 'Momentum Check' },
            { name: 'MACD(26,12,9)', sig: (seed % 2 === 0) ? 'BULLISH' : 'BEARISH', desc: 'Signal Line Cross' },
            { name: 'B-BANDS', sig: (seed % 3 === 0) ? 'LOWER REJECTION' : (seed % 3 === 1 ? 'UPPER REJECTION' : 'STABLE'), desc: 'Volatility Extension' },
            { name: 'VOLUME PROFILE', sig: (seed % 4 === 0) ? 'ACCUMULATION' : 'DISTRIBUTION', desc: 'Price/Value Node' }
        ];

        const explanations = [
            `The AI Vision detected a significant bullish divergence on the 1H timeframe. Using the ${strategyName} strategy, we confirmed a bounce off the previous Value Area Low.`,
            `The Market structure indicates a potential double top formation. The ${strategyName} algorithm suggests a short entry as the price fails to hold above the recent liquidity sweep.`,
            `Current volatility is contracting into a tight wedge. The ${strategyName} terminal recommended a temporary wait until a confirmed breakout of the current price channel.`,
            `Institutional order flow shows heavy buying pressure hidden within the lower wick. The ${strategyName} strategy identifies a high-probability reversal zone here.`
        ];

        return {
            id: Date.now(),
            symbol,
            price,
            signal,
            confidence,
            tp,
            sl,
            rr: signal === 'WAIT' ? 'N/A' : '1:1.8',
            explanation: explanations[seed % explanations.length],
            strategy: strategyName,
            indicators,
            chart: state.uploadedImage
        };
    }

    function showResult(data) {
        resSymbol.innerText = data.symbol;
        resSignal.innerText = data.signal;
        resSignal.className = 'signal-value text-' + data.signal.toLowerCase();
        resConfidence.innerText = data.confidence;
        resPrice.innerText = '$' + data.price.toLocaleString();
        resEntry.innerText = '$' + data.price.toLocaleString();
        resTP.innerText = '$' + data.tp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
        resSL.innerText = '$' + data.sl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
        resRR.innerText = data.rr;
        resLogic.innerText = data.explanation;
        resStrategy.innerText = `STRATEGY: ${data.strategy}`;
        resChartImg.src = data.chart;

        // Indicators
        indContainer.innerHTML = '';
        let buys = 0, sells = 0;
        data.indicators.forEach(ind => {
            if (ind.sig.includes('BUY') || ind.sig.includes('BULL') || ind.sig.includes('ACCUM') || ind.sig.includes('LOWER')) buys++;
            if (ind.sig.includes('SELL') || ind.sig.includes('BEAR') || ind.sig.includes('DIST') || ind.sig.includes('UPPER')) sells++;
            
            const div = document.createElement('div');
            div.className = 'ind-item';
            div.innerHTML = `
                <div class="ind-head">
                    <span class="ind-name">${ind.name}</span>
                    <span class="ind-sig ${getSigColor(ind.sig)}">${ind.sig}</span>
                </div>
                <div class="ind-desc">${ind.desc}</div>
            `;
            indContainer.appendChild(div);
        });
        
        sumBuy.innerText = `${buys} BUYS`;
        sumSell.innerText = `${sells} SELLS`;

        views.setup.classList.add('hidden');
        views.result.classList.remove('hidden');
        lucide.createIcons();
    }

    function getSigColor(sig) {
        if (sig.includes('BULL') || sig.includes('LOWER') || sig.includes('ACC') || sig.includes('OVERSOLD')) return 'text-green';
        if (sig.includes('BEAR') || sig.includes('UPPER') || sig.includes('DIST') || sig.includes('OVERBOUGHT')) return 'text-red';
        return 'text-yellow';
    }

    function updateTrialUI() {
        const progressFill = document.querySelector('.progress-fill');
        const trialLabel = document.querySelector('.trial-msg');
        
        progressFill.style.width = (state.trialCount * 100) + '%';
        analyzeBtn.innerText = 'START AI ANALYSIS';
        analyzeBtn.disabled = false;
        
        if (state.trialCount >= 1) {
            trialLabel.innerText = 'Daily limit reached';
            progressFill.style.backgroundColor = 'var(--accent-red)';
        } else {
            trialLabel.innerText = '1 Free analysis available';
            progressFill.style.backgroundColor = 'var(--accent-blue)';
        }
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (state.history.length === 0) {
            historyList.innerHTML = '<div class="empty-history"><i data-lucide="image"></i><p>No history yet</p></div>';
            lucide.createIcons();
            return;
        }

        state.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.cssText = 'background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; margin-bottom: 12px; cursor: pointer;';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 12px; font-weight: 900;">${item.symbol}</span>
                    <span style="font-size: 10px; font-weight: 900; color: ${item.signal === 'BUY' ? '#10b981' : '#ef4444'}">${item.signal}</span>
                </div>
                <div style="font-size: 9px; font-weight: 700; color: #8b5cf6; margin-bottom: 4px;">${item.strategy}</div>
                <div style="font-size: 10px; font-family: monospace; color: var(--text-muted);">$${item.price.toLocaleString()}</div>
            `;
            div.addEventListener('click', () => showResult(item));
            historyList.appendChild(div);
        });
    }

    document.getElementById('re-analyze-btn').addEventListener('click', () => {
        views.result.classList.add('hidden');
        views.setup.classList.remove('hidden');
        startAnalysis();
    });

    document.getElementById('new-asset-btn').addEventListener('click', () => {
        views.result.classList.add('hidden');
        views.setup.classList.remove('hidden');
    });

    // --- Subscription & Payment Handlers ---
    unlockBtn.addEventListener('click', showSubscription);
    
    function showSubscription() {
        modal.classList.remove('hidden');
        views.plan.classList.remove('hidden');
        views.payment.classList.add('hidden');
        views.success.classList.add('hidden');
    }

    goToPayment.addEventListener('click', () => {
        views.plan.classList.add('hidden');
        views.payment.classList.remove('hidden');
    });

    confirmPayment.addEventListener('click', () => {
        confirmPayment.innerText = 'PROCESSING...';
        setTimeout(() => {
            views.payment.classList.add('hidden');
            views.success.classList.remove('hidden');
            state.trialCount = 0; // Reset trial/unlimited
            saveState(); // Update saved state perfectly
            updateTrialUI();
        }, 2000);
    });

    closeModals.forEach(el => {
        el.addEventListener('click', () => {
            modal.classList.add('hidden');
            confirmPayment.innerText = 'CONFIRM PAYMENT';
        });
    });
});
