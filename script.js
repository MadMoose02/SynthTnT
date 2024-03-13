// Get text from input field
function getData() {
    var textData = document.getElementById('textarea').value;

    console.log("Text data:", textData);
}

// Function to change audio file
function changeAudio() {
    const audioSelect = document.getElementById('audio-select');
    const ceAudioPlayer = document.getElementById('ce-audio-player');
    const seAudioPlayer = document.getElementById('se-audio-player');
    var textData = document.getElementById('display-area');
    const sampleText = ["Hey, there's a Phagwa celebration today",
    "Don't get me started on Patrice, she only likes to cause Bacchanal",
    "Ah catch ah vap the other day"]

    switch(audioSelect.value){
        case("audio-1.wav"):
            textData.placeholder = sampleText[0];
            break;
        case("audio-2.wav"):
            textData.placeholder = sampleText[1];
            break;
        case("audio-3.wav"):
            textData.placeholder = sampleText[2];
            break;
    }

    // Set the selected audio file as the source for the audio player
    ceAudioPlayer.src =  './ce-audio/ce-' + audioSelect.value;
    seAudioPlayer.src =  './se-audio/se-' + audioSelect.value;
}

// Function to handle play, pause, and stop actions
function toggleAudio(playerId) {
    const audioPlayer = document.getElementById(playerId + '-audio-player');
    const playBtn = document.getElementById(playerId + '-play-btn');
    const pauseBtn = document.getElementById(playerId + '-pause-btn');
    const stopBtn = document.getElementById(playerId + '-stop-btn');

    playBtn.addEventListener('click', () => {
        // If other player is playing it will be paused
        // before playing audio from the next
        pauseOtherPlayer(playerId);
        audioPlayer.play();
    });

    pauseBtn.addEventListener('click', () => {
        audioPlayer.pause();
    });

    stopBtn.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    });
}

// Function to pause the other player
function pauseOtherPlayer(currentPlayerId) {
    const playerIds = ['ce', 'se'];

    playerIds.forEach(playerId => {
        if (playerId !== currentPlayerId) {
            const otherAudioPlayer = document.getElementById(playerId + '-audio-player');
            otherAudioPlayer.pause();
        }
    });
}

// Function to update seek bar and timer
function updateSeekBar(playerId) {
    const audioPlayer = document.getElementById(playerId + '-audio-player');
    const seekbar = document.getElementById(playerId + '-seekbar');
    const timeDisplay = document.getElementById(playerId + '-time');

    audioPlayer.addEventListener('timeupdate', () => {
        const duration = audioPlayer.duration;
        const currentTime = audioPlayer.currentTime;

        // Update seek bar value
        seekbar.value = currentTime;

        // Update timer display
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        timeDisplay.textContent = formattedTime;
    });

    // Update seek bar max value based on audio duration
    audioPlayer.addEventListener('loadedmetadata', () => {
        seekbar.max = audioPlayer.duration;
    });

    // Seek functionality
    seekbar.addEventListener('input', () => {
        audioPlayer.currentTime = seekbar.value;
    });

    // Reset seek bar after the audio has ended
    audioPlayer.addEventListener('ended', () => {
        seekbar.value = 0;
        timeDisplay.textContent = '00:00';
    });
}

toggleAudio('ce');
toggleAudio('se');
updateSeekBar('ce');
updateSeekBar('se');

document.addEventListener("DOMContentLoaded", function() {
    // Show/hide the button based on scroll position
    window.onscroll = function() {
        showScrollTopButton();
    };

    function showScrollTopButton() {
        var scrollToTopBtn = document.getElementById("scroll-to-top-arrow");

        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    }

    // Scroll to the top function
    document.getElementById("scroll-to-top-arrow").addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});