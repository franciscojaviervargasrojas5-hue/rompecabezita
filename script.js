document.addEventListener('DOMContentLoaded', () => {
  // Configuración de imagen (Soporte foto1.jpg y foto1.jpeg)
  const imageSources = ['foto1.jpg.jpeg', 'foto1.jpg', 'foto1.jpeg'];
  let activeImageSrc = imageSources[0];

  // Carta de amor
  const loveLetterText = 
    "Eres la mujer más maravillosa del mundo.  Cada pieza de este rompecabezas representa un momento especial a tu lado, " +
    "un recuerdo que siempre llevo en mi corazón cucha. Gracias por iluminar mis días con tu sonrisa y ser la mujer con la que siempre sueño, la que amo con toda mi alma. " +
    "¡Te amo infinitamente mi Frania y te amare ara siempre , porque algo que puedo asegurarte es que solo te amo a ti y a nadie mas que a ti! ❤️";

  // Variables del Estado del Juego
  let gridSize = 6;
  let pieces = [];
  let selectedPiece = null;
  let movesCount = 0;
  let timerInterval = null;
  let secondsElapsed = 0;

  // Elementos DOM
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const board = document.getElementById('puzzle-board');
  const startBtn = document.getElementById('start-btn');
  const diffButtons = document.querySelectorAll('.btn-diff');
  const movesDisplay = document.getElementById('moves');
  const timerDisplay = document.getElementById('timer');
  const previewBtn = document.getElementById('toggle-preview');
  const previewModal = document.getElementById('preview-modal');
  const previewImg = document.getElementById('preview-img');
  const audioToggle = document.getElementById('audio-toggle');
  const bgMusic = document.getElementById('bg-music');
  const victoryModal = document.getElementById('victory-modal');
  const finalImage = document.getElementById('final-image');
  const typewriterText = document.getElementById('typewriter-text');
  const restartBtn = document.getElementById('restart-btn');

  // Precargar imagen probando formatos
  function loadImage() {
    const img = new Image();
    img.src = activeImageSrc;
    img.onerror = () => {
      if (activeImageSrc === imageSources[0]) {
        activeImageSrc = imageSources[1];
        previewImg.src = activeImageSrc;
        finalImage.src = activeImageSrc;
      }
    };
    previewImg.src = activeImageSrc;
    finalImage.src = activeImageSrc;
  }
  loadImage();

  // Selector de Dificultad
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gridSize = parseInt(btn.dataset.grid);
    });
  });

  // Iniciar Juego
  startBtn.addEventListener('click', () => {
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Reproducir música
    bgMusic.play().catch(() => console.log("Audio autostart bloqueado"));
    
    initGame();
  });

  function initGame() {
    movesCount = 0;
    secondsElapsed = 0;
    movesDisplay.textContent = movesCount;
    timerDisplay.textContent = "00:00";
    
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    createPuzzle();
  }

  function updateTimer() {
    secondsElapsed++;
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
  }

  function createPuzzle() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    const totalPieces = gridSize * gridSize;
    pieces = [];

    // Definir posiciones correctas
    for (let i = 0; i < totalPieces; i++) {
      pieces.push({ id: i, currentPos: i });
    }

    // Mezclar piezas de manera desordenada
    let shuffled = [...pieces];
    do {
      shuffled.sort(() => Math.random() - 0.5);
    } while (isSolved(shuffled));

    // Renderizar en el tablero
    shuffled.forEach((pieceData, index) => {
      const piece = document.createElement('div');
      piece.classList.add('puzzle-piece');
      piece.dataset.id = pieceData.id;
      piece.dataset.currentPos = index;

      // Calcular posición del fondo de la imagen
      const correctRow = Math.floor(pieceData.id / gridSize);
      const correctCol = pieceData.id % gridSize;
      const percentage = 100 / (gridSize - 1);

      piece.style.backgroundImage = `url('${activeImageSrc}')`;
      piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
      piece.style.backgroundPosition = `${correctCol * percentage}% ${correctRow * percentage}%`;

      // Evento Click/Táctil
      piece.addEventListener('click', () => handlePieceClick(piece));

      board.appendChild(piece);
    });
  }

  function handlePieceClick(piece) {
    if (!selectedPiece) {
      selectedPiece = piece;
      piece.classList.add('selected');
    } else if (selectedPiece === piece) {
      selectedPiece.classList.remove('selected');
      selectedPiece = null;
    } else {
      // Intercambiar piezas
      swapPieces(selectedPiece, piece);
      selectedPiece.classList.remove('selected');
      selectedPiece = null;
      
      movesCount++;
      movesDisplay.textContent = movesCount;

      if (checkWin()) {
        setTimeout(handleWin, 300);
      }
    }
  }

  function swapPieces(piece1, piece2) {
    const bgPos1 = piece1.style.backgroundPosition;
    const id1 = piece1.dataset.id;

    piece1.style.backgroundPosition = piece2.style.backgroundPosition;
    piece1.dataset.id = piece2.dataset.id;

    piece2.style.backgroundPosition = bgPos1;
    piece2.dataset.id = id1;
  }

  function isSolved(currentPieces) {
    return currentPieces.every((p, idx) => p.id === idx);
  }

  function checkWin() {
    const currentBoardPieces = document.querySelectorAll('.puzzle-piece');
    for (let i = 0; i < currentBoardPieces.length; i++) {
      if (parseInt(currentBoardPieces[i].dataset.id) !== i) {
        return false;
      }
    }
    return true;
  }

  function handleWin() {
    clearInterval(timerInterval);
    victoryModal.classList.remove('hidden');

    // Efecto Confeti de Corazones
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Efecto Máquina de Escribir
    typewriterText.textContent = '';
    let i = 0;
    function typeWriter() {
      if (i < loveLetterText.length) {
        typewriterText.textContent += loveLetterText.charAt(i);
        i++;
        setTimeout(typeWriter, 40);
      }
    }
    typeWriter();
  }

  // Vista Previa
  previewBtn.addEventListener('click', () => previewModal.classList.remove('hidden'));
  previewModal.addEventListener('click', () => previewModal.classList.add('hidden'));

  // Control Audio
  audioToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play();
      audioToggle.textContent = '🎵 Música: ON';
    } else {
      bgMusic.pause();
      audioToggle.textContent = '🔇 Música: OFF';
    }
  });

  // Reiniciar
  restartBtn.addEventListener('click', () => {
    victoryModal.classList.add('hidden');
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
  });
});
