const playerIds = ['ssml', 'rawtext'];

function changeAudio(isTestAudio = false) {
    let ssmlPlayer = document.getElementById('ssml-player');
    let rawtextPlayer = document.getElementById('rawtext-player');

    // Set the selected audio file as the source for the audio player
    if (isTestAudio) {
        let audioSelect = document.getElementById('audio-select');
        ssmlPlayer.src = "./audio-tests/dttec/dttec-" + audioSelect.value;
        rawtextPlayer.src = "./audio-tests/se/se-" + audioSelect.value;
        return;
    }
    ssmlPlayer.src = "./resources/audio/ssml/";
    rawtextPlayer.src = "./resources/audio/rawtext/";

    // Get the last generated audio file in each directory
    fetch('./resources/audio/ssml/')
        .then(response => response.text())
        .then(html => {
            console.log("SSML Files: " + html);
            let lastFile = html.match(/<a href="(.*)">/)[0];
            console.log("Last SSML File: " + lastFile);
            ssmlPlayer.src += lastFile;
        });

    fetch('./resources/audio/rawtext/')
        .then(response => response.text())
        .then(html => {
            console.log("Raw Text Files: " + html);
            let lastFile = html.match(/<a href="(.*)">/)[0];
            console.log("Last Raw Text File: " + lastFile);
            rawtextPlayer.src += lastFile;
        });

    ssmlPlayer.load();
    rawtextPlayer.load();
}

function loadAudioPair(index) {
    // Construct the file names for the current pair
    let rawtextFilename = `./audio-tests/se/se-audio-${index}.wav`;
    let ssmlFilename = `./audio-tests/dttec/dttec-audio-${index}.wav`;
    let rawtextPlayer = document.getElementById('rawtext-audio');
    let ssmlPlayer = document.getElementById('ssml-audio');

    // Set the audio sources
    rawtextPlayer.src = rawtextFilename;
    ssmlPlayer.src = ssmlFilename;

    // Reset the audio players
    rawtextPlayer.pause();
    ssmlPlayer.pause();

    // Reset the evaluation form
    evalForm.reset();
}

function toggleAudio(playerId = null) {
    if (playerId === null) {
        toggleAudio("ssml");
        toggleAudio("rawtext");
        return;
    }

    let controlId = playerId + '-player-controls';
    let audioPlayer = document.getElementById(playerId + '-audio');
    let playBtn = document.querySelector(`#${controlId} > * > .play-btn`);
    let pauseBtn = document.querySelector(`#${controlId} > * > .pause-btn`);
    let stopBtn = document.querySelector(`#${controlId} > * > .stop-btn`);

    playBtn.addEventListener('click', () => {
        pauseOtherPlayers(playerId);
        audioPlayer.play();
    });

    pauseBtn.addEventListener('click', () => { audioPlayer.pause(); });

    stopBtn.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    });
}

function updateSeekBar(playerId = null) {
    if (playerId === null) {
        updateSeekBar("ssml");
        updateSeekBar("rawtext");
        return;
    }
    
    let seekbar = document.querySelector(`#${playerId}-player-controls .seekbar input`);
    let audioPlayer = document.getElementById(playerId + '-audio');
    let timeDisplay = document.querySelector(`#${playerId}-player-controls .player-duration`);

    audioPlayer.addEventListener('timeupdate', () => {
        seekbar.value = audioPlayer.currentTime;
        let minutes = Math.floor(audioPlayer.currentTime / 60);
        let seconds = Math.floor(audioPlayer.currentTime % 60);
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
        timeDisplay.textContent = '0:00';
    });
}

function pauseOtherPlayers(currentPlayerId) {
    if (!currentPlayerId) { return; }
    playerIds.forEach(playerId => {
        if (playerId !== currentPlayerId) {
            let otherAudioPlayer = document.getElementById(playerId + '-audio');
            let seekbar = document.querySelector(`#${playerId}-player-controls .seekbar input`);
            let timeDisplay = document.querySelector(`#${playerId}-player-controls .player-duration`);
            otherAudioPlayer.pause();
            otherAudioPlayer.currentTime = 0;
            seekbar.value = 0;
            timeDisplay.textContent = '0:00';
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("SynthTnT Audio Manager loaded");
});