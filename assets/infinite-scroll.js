function setupInfiniteScroll(loadMoreCallback) {
    const sentinel = document.getElementById('sentinel');

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            loadMoreCallback();
        }
    }, { threshold: 0.1 });

    observer.observe(sentinel);
}
