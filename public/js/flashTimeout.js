function hideDivAfterTimeout() {
    const flashMessage = document.getElementById('flash-div');
    if (flashMessage) {
        flashMessage.style.opacity = 0;
        setTimeout(() => {
            flashMessage.style.display = 'none'; 
        }, 3000);
    }
}
window.onload = hideDivAfterTimeout;