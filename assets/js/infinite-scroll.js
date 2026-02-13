// assets/js/infinite-scroll.js
function setupInfiniteScroll(callback) {
  const sentinel = document.createElement('div')
  sentinel.id = 'sentinel'
  sentinel.className = 'h-20'
  document.querySelector('main').appendChild(sentinel)

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) callback()
  }, { rootMargin: '200px' })

  observer.observe(sentinel)
}
