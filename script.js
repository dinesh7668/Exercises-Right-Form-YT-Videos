document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const modal = document.getElementById('modal');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const closeBtn = document.querySelector('.close');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const categoryForm = document.getElementById('categoryForm');
    const videoForm = document.getElementById('videoForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // State
    let currentCategoryId = null;
    
    // Load data from localStorage
    let categories = JSON.parse(localStorage.getItem('workoutVideos')) || [];
    
    // Event Listeners
    addCategoryBtn.addEventListener('click', () => openModal('category'));
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    document.getElementById('saveVideoBtn').addEventListener('click', saveVideo);
    
    // Functions
    function openModal(type, categoryId = null) {
        modal.style.display = 'block';
        if (type === 'category') {
            modalTitle.textContent = 'Add New Category';
            categoryForm.style.display = 'block';
            videoForm.style.display = 'none';
            document.getElementById('categoryName').value = '';
        } else {
            modalTitle.textContent = 'Add New Video';
            categoryForm.style.display = 'none';
            videoForm.style.display = 'block';
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoTitle').value = '';
            currentCategoryId = categoryId;
        }
    }
    
    function closeModal() {
        modal.style.display = 'none';
        currentCategoryId = null;
    }
    
    function saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        if (name) {
            const category = {
                id: Date.now(),
                name,
                videos: []
            };
            categories.push(category);
            saveToLocalStorage();
            renderCategories();
            closeModal();
        }
    }
    
    function saveVideo() {
        const url = document.getElementById('videoUrl').value.trim();
        const title = document.getElementById('videoTitle').value.trim();
        
        if (url && title && currentCategoryId) {
            const embedUrl = getEmbedUrl(url);
            const category = categories.find(c => c.id === currentCategoryId);
            if (category) {
                category.videos.push({
                    id: Date.now(),
                    title,
                    embedUrl
                });
                saveToLocalStorage();
                renderCategories();
                closeModal();
            }
        }
    }
    
    function getEmbedUrl(url) {
        // Convert various YouTube URL formats to embed URL
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    }
    
    function deleteVideo(categoryId, videoId) {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            category.videos = category.videos.filter(v => v.id !== videoId);
            saveToLocalStorage();
            renderCategories();
        }
    }
    
    function deleteCategory(categoryId) {
        categories = categories.filter(c => c.id !== categoryId);
        saveToLocalStorage();
        renderCategories();
    }
    
    function saveToLocalStorage() {
        localStorage.setItem('workoutVideos', JSON.stringify(categories));
    }
    
    function renderCategories() {
        categoriesContainer.innerHTML = categories.map(category => `
            <div class="category">
                <div class="category-header">
                    <h2 class="category-title">${category.name}</h2>
                    <div>
                        <button class="btn" onclick="openModal('video', ${category.id})">Add Video</button>
                        <button class="delete-btn" onclick="deleteCategory(${category.id})">Delete</button>
                    </div>
                </div>
                <div class="video-grid">
                    ${category.videos.map(video => `
                        <div class="video-card">
                            <iframe src="${video.embedUrl}" allowfullscreen></iframe>
                            <div class="video-title">
                                ${video.title}
                                <button class="delete-btn" onclick="deleteVideo(${category.id}, ${video.id})">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // Make functions available globally
    window.openModal = openModal;
    window.deleteVideo = deleteVideo;
    window.deleteCategory = deleteCategory;
    
    // Initial render
    renderCategories();
});