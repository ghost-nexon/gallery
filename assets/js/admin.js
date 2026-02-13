document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const adminContent = document.getElementById('admin-content');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const uploadForm = document.getElementById('upload-form');
    const imageFile = document.getElementById('image-file');
    const preview = document.getElementById('preview');
    const previewImage = document.getElementById('preview-image');
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const uploadFeedback = document.getElementById('upload-feedback');
    const imagesList = document.getElementById('images-list');

    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showAdminContent();
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showAdminContent();⁸
        } catch (err) {
            authError.textContent = err.message;
            authError.classList.remove('hidden');
        }
    });

    function showAdminContent() {
        loginForm.classList.add('hidden');
        adminContent.classList.remove('hidden');
        loadImages();
        setupRealtime();
    }

    imageFile.addEventListener('change', () => {
        const file = imageFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = imageFile.files[0];
        if (!file) return;

        uploadFeedback.textContent = 'Uploading...';
        uploadFeedback.className = 'text-blue-600';

        try {
            const filePath = `public/\( {crypto.randomUUID()}- \){file.name}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
            const imageUrl = urlData.publicUrl;

            const { error: insertError } = await supabase.from('images').insert({
                title: title.value,
                description: description.value,
                image_url: imageUrl
            });
            if (insertError) throw insertError;

            uploadFeedback.textContent = 'Upload successful!';
            uploadFeedback.className = 'text-green-600';
            uploadForm.reset();
            preview.classList.add('hidden');
        } catch (err) {
            uploadFeedback.textContent = `Error: ${err.message}`;
            uploadFeedback.className = 'text-red-600';
        }
    });

    async function loadImages() {
        try {
            const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false });
            if (error) throw error;

            imagesList.innerHTML = '';
            data.forEach(image => {
                const div = document.createElement('div');
                div.className = 'mb-6 p-4 border rounded';
                div.innerHTML = `
                    <img src="\( {image.image_url}" alt=" \){image.title}" class="w-32 mb-2">
                    <input type="text" value="\( {image.title}" class="w-full mb-2 p-1 border rounded" data-id=" \){image.id}" data-field="title">
                    <textarea class="w-full mb-2 p-1 border rounded" data-id="\( {image.id}" data-field="description"> \){image.description}</textarea>
                    <button class="bg-blue-600 text-white p-1 rounded mr-2" onclick="updateImage('${image.id}')">Update</button>
                    <button class="bg-red-600 text-white p-1 rounded" onclick="deleteImage('\( {image.id}', ' \){image.image_url}')">Delete</button>
                `;
                imagesList.appendChild(div);
            });

            // Add event listeners for updates
            imagesList.querySelectorAll('input, textarea').forEach(el => {
                el.addEventListener('change', (e) => {
                    // Changes handled on update button
                });
            });
        } catch (err) {
            console.error('Error loading images:', err);
        }
    }

    window.updateImage = async (id) => {
        const titleInput = imagesList.querySelector(`input[data-id="${id}"][data-field="title"]`);
        const descInput = imagesList.querySelector(`textarea[data-id="${id}"][data-field="description"]`);

        try {
            const { error } = await supabase.from('images').update({
                title: titleInput.value,
                description: descInput.value
            }).eq('id', id);
            if (error) throw error;
            alert('Update successful!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    window.deleteImage = async (id, imageUrl) => {
        if (!confirm('Are you sure?')) return;

        try {
            const filePath = imageUrl.split('/images/')[1];
            const { error: storageError } = await supabase.storage.from('images').remove([filePath]);
            if (storageError) throw storageError;

            const { error: dbError } = await supabase.from('images').delete().eq('id', id);
            if (dbError) throw dbError;

            loadImages();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    function setupRealtime() {
        supabase.channel('images-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'images' }, () => {
                loadImages();
            })
            .subscribe();
    }
});
