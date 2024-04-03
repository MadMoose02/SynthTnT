const playerIds = ['dttec', 'se'];

// Function to change audio file
function changeAudio(isTestAudio = false) {
    let dttecAudioPlayer = document.getElementById('dttec-audio-player');
    let seAudioPlayer    = document.getElementById('se-audio-player');

    // Set the selected audio file as the source for the audio player
    if (isTestAudio) {
        let audioSelect      = document.getElementById('audio-select');
        dttecAudioPlayer.src = "./audio-tests/dttec/dttec-" + audioSelect.value;
        seAudioPlayer.src    = "./audio-tests/se/se-" + audioSelect.value;
        return;
    }
    dttecAudioPlayer.src =  "./audio-gen/watson-tts-ssml.wav";
    seAudioPlayer.src    =  "./audio-gen/watson-tts.wav";
}

// Function to handle play, pause, and stop actions
function toggleAudio(playerId) {
    if (playerId === '' || playerId === null) {
        toggleAudio("dttec");
        toggleAudio("se");
        return;
    }
    let audioPlayer = document.getElementById(playerId + '-audio-player');
    let playBtn     = document.getElementById(playerId + '-play-btn');
    let pauseBtn    = document.getElementById(playerId + '-pause-btn');
    let stopBtn     = document.getElementById(playerId + '-stop-btn');

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
    playerIds.forEach(playerId => {
        if (playerId !== currentPlayerId) {
            let otherAudioPlayer = document.getElementById(playerId + '-audio-player');
            otherAudioPlayer.pause();
        }
    });
}

// Function to update seek bar and timer
function updateSeekBar(playerId) {
    if (playerId === '' || playerId === null) {
        updateSeekBar('dttec');
        updateSeekBar('se');
        return;
    }
    let audioPlayer = document.getElementById(playerId + '-audio-player');
    let seekbar     = document.getElementById(playerId + '-seekbar');
    let timeDisplay = document.getElementById(playerId + '-time');

    audioPlayer.addEventListener('timeupdate', () => {
        let currentTime = audioPlayer.currentTime;

        // Update seek bar value
        seekbar.value = currentTime;

        // Update timer display
        let minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        let formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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

document.addEventListener("DOMContentLoaded", function() {
    console.log("SynthTnT Audio Manager loaded");
});