// assets/js/admin.js  (updated bucket = 'images')
document.addEventListener('DOMContentLoaded', () => {
  const loginPage    = document.getElementById('login')
  const dashboard    = document.getElementById('dashboard')
  const loginForm    = document.getElementById('login-form')
  const loginError   = document.getElementById('login-error')
  const signoutBtn   = document.getElementById('signout')
  const uploadForm   = document.getElementById('upload-form')
  const fileInput    = document.getElementById('file')
  const preview      = document.getElementById('preview')
  const previewImg   = document.getElementById('preview-img')
  const titleEl      = document.getElementById('title')
  const descEl       = document.getElementById('description')
  const uploadMsg    = document.getElementById('upload-msg')
  const imagesList   = document.getElementById('images-list')

  // Session check
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) showDashboard()
  })

  // Login
  loginForm.onsubmit = async e => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      loginError.textContent = error.message
      loginError.classList.remove('hidden')
      return
    }

    loginError.classList.add('hidden')
    showDashboard()
  }

  function showDashboard() {
    loginPage.classList.add('hidden')
    dashboard.classList.remove('hidden')
    loadAdminImages()
    setupRealtime()
  }

  signoutBtn.onclick = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  // Preview
  fileInput.onchange = () => {
    const file = fileInput.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      previewImg.src = e.target.result
      preview.classList.remove('hidden')
    }
    reader.readAsDataURL(file)
  }

  // Upload
  uploadForm.onsubmit = async e => {
    e.preventDefault()
    const file = fileInput.files[0]
    if (!file) {
      uploadMsg.textContent = 'Select an image first'
      uploadMsg.className = 'text-red-600'
      return
    }

    uploadMsg.textContent = 'Uploading...'
    uploadMsg.className = 'text-blue-600'

    try {
      const ext = file.name.split('.').pop()
      const filename = `\( {crypto.randomUUID()}. \){ext}`
      const path = filename   // or `uploads/${filename}` if you want subfolder

      const { error: uploadErr } = await supabase.storage
        .from('images')
        .upload(path, file)

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(path)

      const publicUrl = urlData.publicUrl

      const { error: dbErr } = await supabase
        .from('images')
        .insert({
          title: titleEl.value.trim() || 'Untitled',
          description: descEl.value.trim() || '',
          image_url: publicUrl
        })

      if (dbErr) throw dbErr

      uploadMsg.textContent = 'Upload successful ✓'
      uploadMsg.className = 'text-green-600'

      uploadForm.reset()
      preview.classList.add('hidden')
      loadAdminImages()

    } catch (err) {
      uploadMsg.textContent = err.message || 'Upload failed'
      uploadMsg.className = 'text-red-600'
      console.error(err)
    }
  }

  async function loadAdminImages() {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      imagesList.innerHTML = '<p class="text-red-600 col-span-full">Error loading images</p>'
      return
    }

    imagesList.innerHTML = ''

    data.forEach(item => {
      const card = document.createElement('div')
      card.className = 'bg-white rounded-xl shadow overflow-hidden'
      card.innerHTML = `
        <img src="\( {item.image_url}" alt=" \){item.title}" class="w-full h-48 object-cover"/>
        <div class="p-4">
          <input value="\( {item.title || ''}" data-id=" \){item.id}" data-field="title"
                 class="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          <textarea data-id="${item.id}" data-field="description" rows="2"
                    class="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400">${item.description || ''}</textarea>
          <div class="flex gap-3">
            <button onclick="updateImage('${item.id}')"
                    class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Update</button>
            <button onclick="deleteImage('\( {item.id}', ' \){item.image_url}')"
                    class="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700">Delete</button>
          </div>
        </div>
      `
      imagesList.appendChild(card)
    })
  }

  window.updateImage = async id => {
    const title = document.querySelector(`input[data-id="${id}"][data-field="title"]`).value.trim()
    const desc  = document.querySelector(`textarea[data-id="${id}"][data-field="description"]`).value.trim()

    const { error } = await supabase
      .from('images')
      .update({ title, description: desc })
      .eq('id', id)

    if (error) alert('Update failed: ' + error.message)
    else alert('Updated')
  }

  window.deleteImage = async (id, url) => {
    if (!confirm('Delete this image?')) return

    try {
      // Extract path from public URL
      const parts = url.split('/storage/v1/object/public/images/')
      const path = parts[1] || ''

      if (path) {
        const { error: storageErr } = await supabase.storage
          .from('images')
          .remove([path])

        if (storageErr && !storageErr.message.includes('not found')) throw storageErr
      }

      const { error: dbErr } = await supabase
        .from('images')
        .delete()
        .eq('id', id)

      if (dbErr) throw dbErr

      loadAdminImages()
      alert('Deleted')

    } catch (err) {
      alert('Delete failed: ' + err.message)
      console.error(err)
    }
  }

  function setupRealtime() {
    supabase
      .channel('images-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'images' }, () => {
        loadAdminImages()
      })
      .subscribe()
  }
})
