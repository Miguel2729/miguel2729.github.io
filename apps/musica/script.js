const fileInput = document.getElementById('fileInput');
const playlist = document.getElementById('playlist');
const player = document.getElementById('player');

let tracks = JSON.parse(localStorage.getItem('tracks')) || [];

function loadTracks() {
  playlist.innerHTML = '';
  tracks.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = track.name;
    li.onclick = () => {
      player.src = track.url;
      player.play();
    };
    playlist.appendChild(li);
  });
}

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function () {
      const track = { name: file.name, url: reader.result };
      tracks.push(track);
      localStorage.setItem('tracks', JSON.stringify(tracks));
      loadTracks();
    };
    reader.readAsDataURL(file);
  });
});

loadTracks();