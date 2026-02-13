document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const noImages = document.getElementById('no-images');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');

    let offset = 0;
    const limit = 10;
    let loading = false;
    let hasMore = true;

    async function loadImages() {
        if (loading || !hasMore) return;
        loading = true;

        try {
            const { data, error } = await supabase
                .from('images')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (data.length === 0) {
                hasMore = false;
                if (offset === 0) noImages.classList.remove('hidden');
                return;
            }

            data.forEach(image => {
                const div = document.createElement('div');
                div.className = 'break-inside-avoid mb-4 cursor-pointer';
                div.innerHTML = `
                    <img src="\( {image.image_url}" alt=" \){image.title}" loading="lazy" class="w-full rounded shadow">
                    <h3 class="text-lg font-semibold mt-2">${image.title}</h3>
                    <p class="text-gray-600">${image.description}</p>
                `;
                div.addEventListener('click', () => {
                    modalImage.src = image.image_url;
                    modalImage.alt = image.title;
                    modal.classList.remove('hidden');
                });
                gallery.appendChild(div);
            });

            offset += limit;
        } catch (err) {
            console.error('Error loading images:', err);
        } finally {
            loading = false;
        }
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // Initial load
    loadImages();

    // Setup infinite scroll
    setupInfiniteScroll(loadImages);
});
