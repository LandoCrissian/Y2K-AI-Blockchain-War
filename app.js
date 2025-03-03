document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const state = {
        isConnected: false,
        userAccount: null,
        isLoading: true,
        activeCategory: 'all',
        featuredNFTs: [],
        allNFTs: [],
        scene: null,
        renderer: null,
        camera: null,
        activeNeobot: null
    };

    // Initialize loading sequence
    initializeLoadingSequence();

    // THREE.js Setup for 3D NeoBots
    function initThreeJS() {
        state.scene = new THREE.Scene();
        state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const pointLight = new THREE.PointLight(0x00e6e6, 1, 100);
        pointLight.position.set(10, 10, 10);
        state.scene.add(ambientLight, pointLight);

        // Camera position
        state.camera.position.z = 5;
    }

    // Loading Sequence
    async function initializeLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        const loadingSteps = [
            { text: 'Initializing marketplace...', duration: 500 },
            { text: 'Loading NeoBots...', duration: 800 },
            { text: 'Connecting to network...', duration: 600 },
            { text: 'Preparing interface...', duration: 600 }
        ];

        let progress = 0;
        
        for (const step of loadingSteps) {
            progressText.textContent = step.text;
            await animateProgress(progress, progress + 25, step.duration, progressFill);
            progress += 25;
        }

        // Initialize marketplace components
        await initializeMarketplace();
        
        // Hide loading screen with fade effect
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            state.isLoading = false;
        }, 500);
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
        initThreeJS();
        await loadNFTData();
        initializeCarousel();
        setupEventListeners();
        setupFilters();
    }

    // Load NFT Data
    async function loadNFTData() {
        // This would normally fetch from the blockchain
        // Using sample data for demo
        state.allNFTs = [
            {
                id: 1,
                name: "CyberNeoBot #001",
                type: "neobot",
                rarity: "legendary",
                price: 1000,
                image: "path/to/neobot1.jpg",
                model: "path/to/3d/model1.glb",
                attributes: {
                    power: 95,
                    speed: 88,
                    intelligence: 92
                }
            },
            // Add more NFTs here
        ];

        state.featuredNFTs = state.allNFTs.filter(nft => nft.rarity === "legendary");
    }

    // Initialize Featured Carousel
    function initializeCarousel() {
        const carousel = document.getElementById('featuredCarousel');
        
        state.featuredNFTs.forEach(nft => {
            const card = createFeatureCard(nft);
            carousel.appendChild(card);
        });

        // Initialize 3D models for featured NFTs
        state.featuredNFTs.forEach(nft => {
            initializeNeobot3DModel(nft);
        });
    }

    // Create Feature Card with 3D Preview
    function createFeatureCard(nft) {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
            <div class="model-container" id="model-${nft.id}"></div>
            <div class="card-info">
                <h3>${nft.name}</h3>
                <p class="rarity ${nft.rarity}">${nft.rarity}</p>
                <div class="price-info">
                    <span>${nft.price} POGs</span>
                    <button class="btn btn-primary buy-btn" data-id="${nft.id}">
                        Buy Now
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    // Initialize 3D Model
    function initializeNeobot3DModel(nft) {
        const container = document.getElementById(`model-${nft.id}`);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const pointLight = new THREE.PointLight(0x00e6e6, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(ambientLight, pointLight);

        // Load 3D model
        const loader = new THREE.GLTFLoader();
        loader.load(nft.model, (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Animation
            function animate() {
                requestAnimationFrame(animate);
                model.rotation.y += 0.005;
                renderer.render(scene, camera);
            }
            animate();
        });
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

        // NFT Card Click Events
        document.getElementById('nftGrid').addEventListener('click', (e) => {
            const buyBtn = e.target.closest('.buy-btn');
            if (buyBtn) {
                handleNFTPurchase(buyBtn.dataset.id);
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
            const searchTerm = searchInput.value.toLowerCase();
            const category = categoryFilter.value;
            const rarity = rarityFilter.value;
            const sortBy = priceFilter.value;

            let filtered = state.allNFTs;

            // Apply filters
            if (category !== 'all') {
                filtered = filtered.filter(nft => nft.type === category);
            }
            if (rarity !== 'all') {
                filtered = filtered.filter(nft => nft.rarity === rarity);
            }
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
                    default:
                        return b.id - a.id;
                }
            });

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
            <div class="nft-card" data-id="${nft.id}">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="nft-overlay">
                        <button class="btn btn-primary view-btn">View Details</button>
                    </div>
                </div>
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

    // NFT Purchase Handler
    async function handleNFTPurchase(nftId) {
        if (!state.isConnected) {
            showError('Please connect your wallet first');
            return;
        }

        try {
            showLoading('Processing purchase...');
            // This would interact with the smart contract
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate blockchain interaction
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
        const loadingText = loadingScreen.querySelector('.loading-text');
        loadingText.textContent = message;
        loadingScreen.style.display = 'flex';
    }

    function hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.display = 'none';
    }

    function showError(message) {
        // Implementation of error toast
    }

    function showSuccess(message) {
        // Implementation of success toast
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        if (state.camera && state.renderer) {
            state.camera.aspect = window.innerWidth / window.innerHeight;
            state.camera.updateProjectionMatrix();
            state.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });
});
