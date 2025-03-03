document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const state = {
        isConnected: false,
        userAccount: null,
        nfts: [],
        activities: [],
        currentCategory: 'all',
        currentSort: 'newest'
    };

    // UI Elements
    const elements = {
        connectButton: document.getElementById('connectWallet'),
        disconnectButton: document.getElementById('disconnectWallet'),
        walletInfo: document.querySelector('.wallet-info'),
        userDashboard: document.getElementById('userDashboard'),
        nftGrid: document.getElementById('nftGrid'),
        activityList: document.getElementById('activityList'),
        searchInput: document.getElementById('searchInput'),
        categoryFilter: document.getElementById('categoryFilter'),
        priceFilter: document.getElementById('priceFilter'),
        categoryTabs: document.querySelectorAll('.category-tab'),
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        navMenu: document.querySelector('.nav-menu'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingMessage: document.getElementById('loadingMessage'),
        nftModal: document.getElementById('nftModal'),
        listModal: document.getElementById('listModal')
    };

    // Sample NFT Data (Replace with blockchain data later)
    const sampleNFTs = [
        {
            id: 1,
            name: "NeoBot #001",
            image: "https://placehold.co/300x300",
            price: 1000,
            currency: "POGs",
            rarity: "Legendary",
            category: "neobots",
            attributes: {
                power: 95,
                speed: 88,
                intelligence: 92
            }
        },
        {
            id: 2,
            name: "Mystery Box #42",
            image: "https://placehold.co/300x300",
            price: 500,
            currency: "POGs",
            rarity: "Rare",
            category: "mystery",
            attributes: {
                potential: "Unknown",
                level: "Rare+"
            }
        },
        // Add more sample NFTs here
    ];

    // Wallet Connection Logic
    async function connectWallet() {
        try {
            showLoading('Connecting wallet...');
            
            // Check for various wallet providers
            let provider;
            if (window.ethereum) {
                provider = window.ethereum;
            } else if (window.coinbaseWalletExtension) {
                provider = window.coinbaseWalletExtension;
            } else if (window.deficonnectProvider) {
                provider = window.deficonnectProvider;
            } else if (window.trustwallet) {
                provider = window.trustwallet;
            } else {
                throw new Error('No Web3 wallet detected! Please install a wallet.');
            }

            // Initialize Web3
            window.web3 = new Web3(provider);

            // Request account access
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            state.userAccount = accounts[0];
            
            // Update UI
            updateWalletUI(true);
            showSuccess('Wallet connected successfully!');
            
            // Load user's NFTs and activities
            await loadUserData();

        } catch (error) {
            console.error('Connection Error:', error);
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

    // Update UI based on wallet connection
    function updateWalletUI(connected) {
        state.isConnected = connected;
        elements.connectButton.style.display = connected ? 'none' : 'block';
        elements.disconnectButton.style.display = connected ? 'block' : 'none';
        elements.walletInfo.style.display = connected ? 'flex' : 'none';
        elements.userDashboard.style.display = connected ? 'block' : 'none';
        
        if (connected) {
            loadUserData();
        }
    }

    // Load User Data
    async function loadUserData() {
        try {
            showLoading('Loading your collection...');
            // Here you would fetch user's NFTs and activities from blockchain
            // For now, using sample data
            state.nfts = sampleNFTs;
            updateDashboard();
            renderNFTs();
            renderActivities();
        } catch (error) {
            showError('Error loading user data');
        } finally {
            hideLoading();
        }
    }

    // Render NFTs
    function renderNFTs(filtered = state.nfts) {
        elements.nftGrid.innerHTML = filtered.map(nft => `
            <div class="nft-card" data-id="${nft.id}">
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-info">
                    <h3 class="nft-title">${nft.name}</h3>
                    <div class="nft-details">
                        <p>Rarity: ${nft.rarity}</p>
                        <p>Category: ${nft.category}</p>
                    </div>
                    <div class="price-info">
                        <span>${nft.price} ${nft.currency}</span>
                        <button class="btn btn-primary buy-btn" data-id="${nft.id}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to NFT cards
        attachNFTCardListeners();
    }

    // Filter NFTs
    function filterNFTs() {
        const searchTerm = elements.searchInput.value.toLowerCase();
        const category = state.currentCategory;
        const sortBy = elements.priceFilter.value;

        let filtered = state.nfts;

        // Apply category filter
        if (category !== 'all') {
            filtered = filtered.filter(nft => nft.category === category);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(nft => 
                nft.name.toLowerCase().includes(searchTerm) ||
                nft.rarity.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rarity':
                    return b.rarity.localeCompare(a.rarity);
                default:
                    return b.id - a.id; // newest first
            }
        });

        renderNFTs(filtered);
    }

    // Show NFT Details Modal
    function showNFTDetails(nftId) {
        const nft = state.nfts.find(n => n.id === parseInt(nftId));
        if (!nft) return;

        elements.nftModal.querySelector('.modal-content').innerHTML = `
            <span class="close-modal">&times;</span>
            <div class="nft-detail-content">
                <img src="${nft.image}" alt="${nft.name}" class="nft-detail-image">
                <h2>${nft.name}</h2>
                <div class="nft-attributes">
                    ${Object.entries(nft.attributes).map(([key, value]) => `
                        <div class="attribute-item">
                            <span class="attribute-label">${key}:</span>
                            <span class="attribute-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="nft-actions">
                    <button class="btn btn-primary buy-btn" data-id="${nft.id}">
                        Buy for ${nft.price} ${nft.currency}
                    </button>
                </div>
            </div>
        `;

        elements.nftModal.style.display = 'block';
    }

    // Utility Functions
    function showLoading(message) {
        elements.loadingMessage.textContent = message;
        elements.loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        elements.loadingOverlay.style.display = 'none';
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'status-message status-error';
        errorDiv.textContent = message;
        document.querySelector('main').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'status-message status-success';
        successDiv.textContent = message;
        document.querySelector('main').prepend(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }

    // Event Listeners
    elements.connectButton.addEventListener('click', connectWallet);
    elements.disconnectButton.addEventListener('click', disconnectWallet);
    elements.searchInput.addEventListener('input', filterNFTs);
    elements.categoryFilter.addEventListener('change', filterNFTs);
    elements.priceFilter.addEventListener('change', filterNFTs);
    
    elements.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentCategory = tab.dataset.category;
            filterNFTs();
        });
    });

    // Mobile Menu Toggle
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.navMenu.classList.toggle('active');
    });

    // Close Modals
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            elements.nftModal.style.display = 'none';
            elements.listModal.style.display = 'none';
        });
    });

    // Initial Load
    renderNFTs();
});
