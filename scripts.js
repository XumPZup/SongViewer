async function init() {
  async function fetchSongList() {
    const response = await fetch('songs/');
    const html = await response.text();
    const files = [...html.matchAll(/href="([^"]+\.txt)"/g)].map(m => m[1]);
    return files;
  }
  // Only works locally or on a real server
  //const SONGS = await fetchSongList();

  const SONGS = [
	"Água de Beber.txt",
	"Aquarela do Brasil.txt",
	"Corcovado.txt",
	"Corrida de Jangada.txt",  
	"Desafinado.txt",          
	"Fotografia.txt",
	"Garota de Ipanema.txt",
	"Mas Que Nada.txt",
	"Menino das Laranjas.txt",
	"Onde Anda Você.txt",
	"Samba de Orfeu.txt",
	"Sei lá, (A vida tem sempre razão).txt",
	"Você e Eu.txt"
  ]

  const select = document.getElementById('song-select');
  const songDiv = document.getElementById('song');

  // Populate dropdown
  SONGS.forEach(song => {
    const opt = document.createElement('option');
    opt.value = song;
    opt.textContent = song.replace('.txt', '');
    select.appendChild(opt);
  });

  // Load song when selected
  select.addEventListener('change', async () => {
    const file = select.value;
    if (!file) {
      songDiv.innerHTML = '';
      return;
    }

    const response = await fetch(`songs/${file}`);
    const text = await response.text();
    const lines = text.split('\n');

    let html = '';
    let titleRendered = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (!titleRendered && trimmed) {
        // First non-empty line becomes the title
        html += `<h1 id="title">${trimmed}</h2>`;
        titleRendered = true;
        continue;
      }

      if (line.includes('|')) {
        html += `<p class="chords">${line}</p>`;
      } else if (trimmed === '') {
        html += '<br>';
      } else {
        html += `<p class="lyrics">${line}</p>`;
      }
    }

    songDiv.innerHTML = html;
  });
}

const SHARP_CHORDS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// map common flat names to their sharp equivalents for normalization
const FLAT_TO_SHARP = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

const CHORDS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#',
  'G', 'G#', 'A', 'A#', 'B'
];


function normalizeNote(note) {
  // note is like "C", "Db", "F#", etc.
  return FLAT_TO_SHARP[note] || note;
}

function transposeNote(note, semitones) {
  const n = normalizeNote(note);
  const idx = SHARP_CHORDS.indexOf(n);
  if (idx === -1) return note; // not a recognized root (leave as-is)
  const newIdx = (idx + semitones + 12) % 12;
  return SHARP_CHORDS[newIdx];
}


// Transpose helper (preserves whitespace)
function transposeLine(line, semitones) {
  return line.replace(/\b([A-G](?:#|b)?)([^\/\s|]*)(?:\/([A-G](?:#|b)?))?/g,
    (match, root, modifiers, bass) => {
      const newRoot = transposeNote(root, semitones);
      const newBass = bass ? '/' + transposeNote(bass, semitones) : '';
      return newRoot + (modifiers || '') + newBass;
    }
  );
} 


function transposeSong(semitones) {
  document.querySelectorAll('.chords').forEach(p => {
    const newText = transposeLine(p.textContent, semitones);
    p.textContent = newText;
  });
}

document.getElementById('transpose-up').addEventListener('click', () => transposeSong(1));
document.getElementById('transpose-down').addEventListener('click', () => transposeSong(-1));


init(); // run it

