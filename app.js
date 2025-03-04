document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const state = {
        isConnected: false,
        userAccount: null,
        isLoading: true,
        activeCategory: 'all',
        featuredNFTs: [],
        allNFTs: [],
    };

    // Sample NFT Data
    const sampleNFTs = [
        {
            id: 1,
            name: "CyberNeoBot #001",
            type: "neobot",
            rarity: "legendary",
            price: 1000,
            image: "path/to/neobot1.jpg",
            attributes: {
                power: 95,
                speed: 88,
                intelligence: 92
            }
        },
        {
            id: 2,
            name: "Mystery Box Alpha",
            type: "mystery",
            rarity: "epic",
            price: 500,
            image: "path/to/mysterybox.jpg",
            attributes: {
                potential: "Unknown",
                level: "Alpha"
            }
        },
        // Add more sample NFTs
    ];

    // Initialize Loading Sequence
    async function initializeLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        try {
            // Loading steps
            const steps = [
                { text: 'Initializing marketplace...', duration: 500 },
                { text: 'Loading NeoBots...', duration: 800 },
                { text: 'Connecting to network...', duration: 600 },
                { text: 'Preparing interface...', duration: 600 }
            ];

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                progressText.textContent = step.text;
                await animateProgress(
                    (i * 25),
                    ((i + 1) * 25),
                    step.duration,
                    progressFill
                );
            }

            // Initialize marketplace
            await initializeMarketplace();

            // Hide loading screen
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                state.isLoading = false;
            }, 500);

        } catch (error) {
            console.error('Initialization error:', error);
            progressText.textContent = 'Error loading marketplace. Please refresh.';
            progressText.style.color = 'var(--error-color)';
        }
    }

    // Progress Animation
    function animateProgress(start, end, duration, element) {
        return new Promise(resolve => {
            const startTime = performance.now();
            
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const current = start + (end - start) * progress;
                element.style.width = `${current}%`;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(update);
        });
    }

    // Initialize Marketplace
    async function initializeMarketplace() {
        try {
            await loadNFTData();
            initializeCarousel();
            setupEventListeners();
            setupFilters();
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Load NFT Data
    async function loadNFTData() {
        // Simulate loading from blockchain
        await new Promise(resolve => setTimeout(resolve, 1000));
        state.allNFTs = sampleNFTs;
        state.featuredNFTs = sampleNFTs.filter(nft => nft.rarity === 'legendary');
        renderNFTGrid(state.allNFTs);
    }

    // Initialize Carousel
    function initializeCarousel() {
        const carousel = document.getElementById('featuredCarousel');
        carousel.innerHTML = state.featuredNFTs.map(nft => `
            <div class="featured-card">
                <img src="${nft.image}" alt="${nft.name}" class="featured-image">
                <div class="featured-info">
                    <h3>${nft.name}</h3>
                    <p class="rarity ${nft.rarity}">${nft.rarity}</p>
                    <div class="price">
                        <span>${nft.price} POGs</span>
                        <button class="btn btn-primary buy-btn" data-id="${nft.id}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Wallet Connection
        document.getElementById('connectWallet').addEventListener('click', connectWallet);
        document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);

        // Mobile Menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        const closeNavBtn = document.querySelector('.close-nav-btn');

        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });

        closeNavBtn.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });

        // Carousel Controls
        const prevBtn = document.querySelector('.control-btn.prev');
        const nextBtn = document.querySelector('.control-btn.next');
        const carousel = document.getElementById('featuredCarousel');

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -300, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: 300, behavior: 'smooth' });
        });

        // Buy Buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-btn')) {
                handlePurchase(e.target.dataset.id);
            }
        });
    }

    // Setup Filters
    function setupFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const rarityFilter = document.getElementById('rarityFilter');
        const priceFilter = document.getElementById('priceFilter');

        const filterNFTs = () => {
            let filtered = [...state.allNFTs];

            // Apply search filter
            if (searchInput.value) {
                const searchTerm = searchInput.value.toLowerCase();
                filtered = filtered.filter(nft => 
                    nft.name.toLowerCase().includes(searchTerm) ||
                    nft.rarity.toLowerCase().includes(searchTerm)
                );
            }

            // Apply category filter
            if (categoryFilter.value !== 'all') {
                filtered = filtered.filter(nft => nft.type === categoryFilter.value);
            }

            // Apply rarity filter
            if (rarityFilter.value !== 'all') {
                filtered = filtered.filter(nft => nft.rarity === rarityFilter.value);
            }

            // Apply price sorting
            switch (priceFilter.value) {
                case 'price-low':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    filtered.sort((a, b) => b.id - a.id);
                    break;
            }

            renderNFTGrid(filtered);
        };

        // Add event listeners to filters
        [searchInput, categoryFilter, rarityFilter, priceFilter].forEach(
            element => element.addEventListener('change', filterNFTs)
        );
        searchInput.addEventListener('input', filterNFTs);
    }

    // Render NFT Grid
    function renderNFTGrid(nfts) {
        const grid = document.getElementById('nftGrid');
        grid.innerHTML = nfts.map(nft => `
            <div class="nft-card">
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-info">
                    <h3>${nft.name}</h3>
                    <p class="rarity ${nft.rarity}">${nft.rarity}</p>
                    <div class="attributes">
                        ${Object.entries(nft.attributes).map(([key, value]) => `
                            <div class="attribute">
                                <span class="key">${key}</span>
                                <span class="value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="price-info">
                        <span>${nft.price} POGs</span>
                        <button class="btn btn-primary buy-btn" data-id="${nft.id}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Wallet Connection
    async function connectWallet() {
        try {
            showLoading('Connecting wallet...');
            
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Please install a Web3 wallet');
            }

            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            state.userAccount = accounts[0];
            state.isConnected = true;
            updateWalletUI(true);
            showSuccess('Wallet connected successfully!');

        } catch (error) {
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    // Disconnect Wallet
    function disconnectWallet() {
        state.isConnected = false;
        state.userAccount = null;
        updateWalletUI(false);
        showSuccess('Wallet disconnected');
    }

    // Update Wallet UI
    function updateWalletUI(connected) {
        document.getElementById('connectWallet').style.display = 
            connected ? 'none' : 'block';
        document.getElementById('disconnectWallet').style.display = 
            connected ? 'block' : 'none';
        document.querySelector('.wallet-info').style.display = 
            connected ? 'flex' : 'none';
    }

    // Handle Purchase
    async function handlePurchase(nftId) {
        if (!state.isConnected) {
            showError('Please connect your wallet first');
            return;
        }

        try {
            showLoading('Processing purchase...');
            // Simulate blockchain transaction
            await new Promise(resolve => setTimeout(resolve, 2000));
            showSuccess('Purchase successful!');
        } catch (error) {
            showError('Purchase failed: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    // Utility Functions
    function showLoading(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        document.querySelector('.loading-text').textContent = message;
        loadingScreen.style.display = 'flex';
    }

    function hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'none';
    }

    function showSuccess(message) {
        showMessage(message, 'success');
    }

    function showError(message) {
        showMessage(message, 'error');
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Start Initialization
    initializeLoadingSequence().catch(console.error);
});
