document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const state = {
        isConnected: false,
        userAccount: null,
        isLoading: true,
        activeCategory: 'all',
        featuredNFTs: [],
        allNFTs: [],
        activeModal: null,
        carouselPosition: 0
    };

    // Sample NFT Data - Replace with blockchain data later
    const sampleNFTs = [
        {
            id: 1,
            name: "CyberNeoBot #001",
            type: "neobot",
            rarity: "legendary",
            price: 1000,
            image: "https://placehold.co/400x400/00e6e6/ffffff?text=NeoBot+001",
            attributes: {
                Power: 95,
                Speed: 88,
                Intelligence: 92,
                Rarity: "Legendary",
                Generation: "Alpha"
            }
        },
        {
            id: 2,
            name: "CyberNeoBot #002",
            type: "neobot",
            rarity: "epic",
            price: 750,
            image: "https://placehold.co/400x400/ff007f/ffffff?text=NeoBot+002",
            attributes: {
                Power: 85,
                Speed: 90,
                Intelligence: 87,
                Rarity: "Epic",
                Generation: "Alpha"
            }
        },
        // Add more sample NFTs...
    ];

    // Initialize Loading Sequence
    async function initializeLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        try {
            // Loading steps with dynamic progress
            const steps = [
                { text: 'Initializing systems...', duration: 500 },
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

            // Fade out loading screen with animation
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.body.classList.add('loaded');
                initializeAnimations();
            }, 500);

        } catch (error) {
            console.error('Initialization error:', error);
            progressText.textContent = 'Error loading marketplace. Click to retry.';
            progressText.style.color = 'var(--error-color)';
            
            loadingScreen.addEventListener('click', () => {
                location.reload();
            });
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
            initializeAnimations();
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Load NFT Data
    async function loadNFTData() {
        // Simulate blockchain data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        state.allNFTs = sampleNFTs;
        state.featuredNFTs = sampleNFTs.filter(nft => nft.rarity === 'legendary');
        renderNFTGrid(state.allNFTs);
    }

    // Initialize Animations
    function initializeAnimations() {
        // Animate stats counters
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.ceil(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            updateCounter();
        });

        // Add hover effects to NFT cards
        document.querySelectorAll('.nft-card').forEach(card => {
            card.addEventListener('mousemove', handleCardHover);
            card.addEventListener('mouseleave', resetCardPosition);
        });
    }

    // Card Hover Effect
    function handleCardHover(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = 
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    }

    function resetCardPosition(e) {
        const card = e.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }

    // Initialize Carousel
    function initializeCarousel() {
        const carousel = document.getElementById('featuredCarousel');
        
        carousel.innerHTML = state.featuredNFTs.map(nft => `
            <div class="featured-card" data-id="${nft.id}">
                <div class="featured-image">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="featured-overlay">
                        <span class="rarity-badge rarity-${nft.rarity}">${nft.rarity}</span>
                    </div>
                </div>
                <div class="featured-info">
                    <h3>${nft.name}</h3>
                    <div class="price-tag">
                        <span class="price-amount">${nft.price} POGs</span>
                        <button class="cyber-button primary buy-btn" data-id="${nft.id}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Initialize carousel controls
        setupCarouselControls();
    }

    // Setup Carousel Controls
    function setupCarouselControls() {
        const carousel = document.getElementById('featuredCarousel');
        const prevBtn = document.querySelector('.control-btn.prev');
        const nextBtn = document.querySelector('.control-btn.next');

        prevBtn.addEventListener('click', () => {
            state.carouselPosition = Math.max(state.carouselPosition - 1, 0);
            updateCarouselPosition();
        });

        nextBtn.addEventListener('click', () => {
            const maxPosition = state.featuredNFTs.length - 3; // Show 3 items at once
            state.carouselPosition = Math.min(state.carouselPosition + 1, maxPosition);
            updateCarouselPosition();
        });
    }

    function updateCarouselPosition() {
        const carousel = document.getElementById('featuredCarousel');
        const cardWidth = 320; // Width of each card + gap
        carousel.scrollTo({
            left: state.carouselPosition * cardWidth,
            behavior: 'smooth'
        });
    }

        // Wallet Connection Handling
    async function connectWallet() {
        try {
            showLoading('Connecting wallet...');
            
            if (typeof window.ethereum === 'undefined') {
                throw new Error('Please install a Web3 wallet to connect');
            }

            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            state.userAccount = accounts[0];
            state.isConnected = true;

            // Add wallet event listeners
            window.ethereum.on('accountsChanged', handleAccountChange);
            window.ethereum.on('chainChanged', handleChainChange);

            updateWalletUI(true);
            showToast('Wallet connected successfully!', 'success');

            // Load user's NFTs and balances
            await loadUserData();

        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            hideLoading();
        }
    }

    // Load User Data
    async function loadUserData() {
        if (!state.isConnected) return;

        try {
            // Simulate loading user data
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update balances
            document.getElementById('pogsBalance').textContent = '1,000 POGs';
            document.getElementById('y2kBalance').textContent = '500 Y2K';
            
            // Update user's NFTs
            // This would be replaced with actual blockchain calls
        } catch (error) {
            showToast('Error loading user data', 'error');
        }
    }

    // Handle Account Change
    function handleAccountChange(accounts) {
        if (accounts.length === 0) {
            disconnectWallet();
        } else if (accounts[0] !== state.userAccount) {
            state.userAccount = accounts[0];
            loadUserData();
            showToast('Account changed', 'info');
        }
    }

    // Handle Chain Change
    function handleChainChange() {
        window.location.reload();
    }

    // Disconnect Wallet
    function disconnectWallet() {
        state.isConnected = false;
        state.userAccount = null;
        updateWalletUI(false);
        showToast('Wallet disconnected', 'info');
    }

    // Update Wallet UI
    function updateWalletUI(connected) {
        const connectBtn = document.getElementById('connectWallet');
        const disconnectBtn = document.getElementById('disconnectWallet');
        const walletInfo = document.querySelector('.wallet-info');

        connectBtn.style.display = connected ? 'none' : 'block';
        disconnectBtn.style.display = connected ? 'block' : 'none';
        walletInfo.style.display = connected ? 'flex' : 'none';
    }

    // NFT Grid Rendering
    function renderNFTGrid(nfts) {
        const grid = document.getElementById('nftGrid');
        
        grid.innerHTML = nfts.map(nft => `
            <div class="nft-card" data-id="${nft.id}">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="nft-overlay">
                        <button class="preview-btn" data-id="${nft.id}">Preview</button>
                    </div>
                </div>
                <div class="nft-info">
                    <h3>${nft.name}</h3>
                    <span class="rarity-badge rarity-${nft.rarity}">${nft.rarity}</span>
                    <div class="nft-attributes">
                        ${Object.entries(nft.attributes)
                            .slice(0, 3)
                            .map(([key, value]) => `
                                <div class="attribute">
                                    <span class="attribute-key">${key}</span>
                                    <span class="attribute-value">${value}</span>
                                </div>
                            `).join('')}
                    </div>
                    <div class="price-tag">
                        <span class="price-amount">${nft.price} POGs</span>
                        <button class="cyber-button primary buy-btn" data-id="${nft.id}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add card hover effects
        document.querySelectorAll('.nft-card').forEach(card => {
            card.addEventListener('mousemove', handleCardHover);
            card.addEventListener('mouseleave', resetCardPosition);
        });
    }

    // Search and Filter Implementation
    function setupFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const rarityFilter = document.getElementById('rarityFilter');
        const priceFilter = document.getElementById('priceFilter');

        const filterNFTs = () => {
            let filtered = [...state.allNFTs];

            // Apply search filter
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
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

        // Add event listeners
        [searchInput, categoryFilter, rarityFilter, priceFilter].forEach(
            element => element.addEventListener('change', filterNFTs)
        );
        searchInput.addEventListener('input', filterNFTs);
    }

    // Modal Handling
    function showNFTModal(nftId) {
        const nft = state.allNFTs.find(n => n.id === parseInt(nftId));
        if (!nft) return;

        const modal = document.getElementById('nftModal');
        const content = modal.querySelector('.nft-preview');

        content.innerHTML = `
            <div class="preview-image">
                <img src="${nft.image}" alt="${nft.name}">
            </div>
            <div class="preview-info">
                <h2>${nft.name}</h2>
                <span class="rarity-badge rarity-${nft.rarity}">${nft.rarity}</span>
                <div class="preview-attributes">
                    ${Object.entries(nft.attributes).map(([key, value]) => `
                        <div class="attribute-item">
                            <span class="attribute-key">${key}</span>
                            <span class="attribute-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="preview-actions">
                    <div class="price-tag">
                        <span class="price-amount">${nft.price} POGs</span>
                    </div>
                    <button class="cyber-button primary buy-btn" data-id="${nft.id}">
                        Buy Now
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    // Toast Notifications
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Loading Screen
    function showLoading(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = loadingScreen.querySelector('.loading-text');
        loadingText.textContent = message;
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }

    function hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }

    // Initialize everything
    initializeLoadingSequence().catch(console.error);

    // Event Listeners
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);

    // Close modal on outside click
    document.getElementById('nftModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.remove('active');
        }
    });

    // Handle buy button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-btn')) {
            handlePurchase(e.target.dataset.id);
        }
    });

    // Purchase Handler
    async function handlePurchase(nftId) {
        if (!state.isConnected) {
            showToast('Please connect your wallet first', 'error');
            return;
        }

        try {
            showLoading('Processing purchase...');
            // Simulate blockchain transaction
            await new Promise(resolve => setTimeout(resolve, 2000));
            showToast('Purchase successful!', 'success');
        } catch (error) {
            showToast('Purchase failed: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
});

                          
