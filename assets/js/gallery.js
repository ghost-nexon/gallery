// assets/js/gallery.js
let loading = false
let hasMore = true
let offset = 0
const limit = 12

const gallery   = document.getElementById('gallery')
const loadingEl = document.getElementById('loading')
const endEl     = document.getElementById('end')
const modal     = document.getElementById('modal')
const modalImg  = document.getElementById('modal-img')
const closeBtn  = document.getElementById('close')

async function loadImages() {
  if (loading || !hasMore) return
  loading = true
  loadingEl.classList.remove('hidden')

  try {
    const { data, error, count } = await supabase
      .from('images')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    if (data.length === 0) {
      hasMore = false
      endEl.classList.remove('hidden')
      return
    }

    data.forEach(img => {
      const div = document.createElement('div')
      div.className = 'break-inside-avoid mb-4'
      div.innerHTML = `
        <div class="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <img src="\( {img.image_url}" alt=" \){img.title || 'Image'}"
               class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
               loading="lazy">
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <div class="text-white">
              <p class="font-medium">${img.title || 'Untitled'}</p>
              <p class="text-sm opacity-90">${img.description || ''}</p>
            </div>
          </div>
        </div>
      `
      div.querySelector('img').addEventListener('click', () => {
        modalImg.src = img.image_url
        modalImg.alt = img.title || 'Image'
        modal.classList.remove('hidden')
      })
      gallery.appendChild(div)
    })

    offset += limit

    if (offset >= count) {
      hasMore = false
      endEl.classList.remove('hidden')
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading = false
    loadingEl.classList.add('hidden')
  }
}

// Modal controls
closeBtn.onclick = () => modal.classList.add('hidden')
modal.onclick = e => {
  if (e.target === modal) modal.classList.add('hidden')
}

// Initial load + infinite scroll
document.addEventListener('DOMContentLoaded', () => {
  loadImages()
  setupInfiniteScroll(loadImages)
})
