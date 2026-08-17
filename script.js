const lock = document.getElementById('lock');
const status = document.getElementById('status');

if (lock && status) {
    let unlocked = false;

    function toggleLock() {
        unlocked = !unlocked;
        lock.classList.toggle('unlocked', unlocked);
        status.classList.toggle('unlocked', unlocked);
        status.textContent = unlocked ? 'UNLOCKED' : 'LOCKED';
    }

    setInterval(toggleLock, 2300);
    lock.addEventListener('click', toggleLock);
}

const startBtn = document.getElementById('getStarted');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        window.location.href = 'files.html';
    });
}
