const btnRec = document.getElementById('btn-rec');
const btnMainStop = document.getElementById('btn-main-stop');
const btnPlayClip = document.getElementById('btn-play-clip');
const btnDeleteClip = document.getElementById('btn-delete-clip');
const btnDownloadClip = document.getElementById('btn-download-clip');
const clipSection = document.querySelector('.clip');

let recording = false;
let mediaStream;
let mediaRecorder;
let chunks = [];

btnRec.addEventListener('click', () => {
    if (!recording) {
        recording = true;
        btnRec.disabled = true;
        btnMainStop.disabled = false;
        btnRec.classList.add('btn-rec-pressed');
        // Comenzar la grabación
        chrome.tabCapture.capture({ audio: true }, (stream) => {
            mediaStream = stream;
            // Continuar reproduciendo el audio capturado para el usuario.
            const output = new AudioContext();
            const source = output.createMediaStreamSource(stream);
            source.connect(output.destination);
            // Crear un MediaRecorder para grabar el audio
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                clipSection.innerHTML = ''; // Limpiar cualquier clip anterior
                clipSection.appendChild(audio);
                btnPlayClip.disabled = false;
                btnDownloadClip.disabled = false;
                btnDeleteClip.disabled = false;
            };
            mediaRecorder.start();
        });
    }
});

btnMainStop.addEventListener('click', () => {
    if (recording) {
        recording = false;
        btnRec.disabled = false;
        btnMainStop.disabled = true;
        btnRec.classList.remove('btn-rec-pressed');
        // Detener la grabación
        if (mediaRecorder) {
            mediaRecorder.stop();
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    } else {
        // Detener la reproducción
        const audio = clipSection.querySelector('audio');
        if (audio) {
            audio.pause();
            btnMainStop.disabled = true;
        }
    }
});

btnPlayClip.addEventListener('click', () => {
    const audio = clipSection.querySelector('audio');
    if (audio) {
        audio.play();
    }
});

btnDownloadClip.addEventListener('click', () => {
    const audio = clipSection.querySelector('audio');
    if (audio) {
        const url = audio.src;
        const filename = 'grabacion_audio.wav';
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});

btnDeleteClip.addEventListener('click', () => {
    chunks = [];
    mediaRecorder = null;
    clipSection.innerHTML = '';
    btnPlayClip.disabled = true;
    btnDownloadClip.disabled = true;
    btnDeleteClip.disabled = true;
});
