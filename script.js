const gameArea = document.getElementById('game-area');
const scoreboard = document.getElementById('scoreboard');
const muteButton = document.getElementById('mute-button');
const startMenu = document.getElementById('start-menu');
let score = 0;
let lives = 3;
let level = 'easy'; // Nivel inicial
let spawnInterval = 1000; // Intervalo de aparición de enemigos
let spawnTimer;
let gameStartTime = Date.now();

// Cargar sonidos
const loseLifeSound = new Audio('sonidos/enemy-sound.mp3');
const backgroundMusic = new Audio('sonidos/background.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

backgroundMusic.play();

function updateScoreboard() {
    scoreboard.firstChild.textContent = `Puntos: ${score} | Vidas: ${lives}`;
}

function showDamageOverlay() {
    const damageOverlay = document.getElementById('damage-overlay');
    if (damageOverlay) {
        damageOverlay.style.display = 'block';
        setTimeout(() => {
            damageOverlay.style.display = 'none';
        }, 300);
    }
}

function gameOver() {
    alert(`¡Juego terminado! Tu puntaje final es: ${score}`);
    backgroundMusic.pause();
    location.reload();
}

function showVictoryMessage() {
    const victoryMessage = document.createElement('div');
    victoryMessage.classList.add('message');
    victoryMessage.textContent = `¡Ganaste! Tu puntaje final es: ${score}`;
    gameArea.appendChild(victoryMessage);

    setTimeout(() => {
        victoryMessage.textContent = 'Volviendo a la pantalla principal...';
        setTimeout(() => {
            location.reload(); // Volver a la pantalla principal
        }, 2000);
    }, 2000);
}

let isMuted = false;
muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
        backgroundMusic.pause();
        muteButton.textContent = '🔇';
    } else {
        backgroundMusic.play();
        muteButton.textContent = '🔊';
    }
});

// Función para generar enemigos
function spawnEnemy() {
    if (lives <= 0) return;

    const enemy = document.createElement('img');
    enemy.classList.add('enemy');
    enemy.src = 'imagenes/stormtrooper.png';

    // Tamaño de los enemigos según el nivel
    const enemySize = level === 'easy' ? 180 : level === 'medium' ? 180 : 180;

    // Posiciones aleatorias para los enemigos
    const x = Math.random() * (window.innerWidth - enemySize);
    const y = Math.random() * (window.innerHeight - enemySize - 100); // Deja un espacio por arriba
    enemy.style.position = 'absolute';
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;
    enemy.style.width = `${enemySize}px`;
    enemy.style.height = `${enemySize}px`;

    function playHitSound() {
        const hitSound = new Audio('sonidos/player-sound.mp3');
        hitSound.play();
    }

    enemy.addEventListener('click', () => {
        score++;
        if (!isMuted) playHitSound();
        updateScoreboard();

        // Verificar si el jugador ganó (20 enemigos eliminados)
        if (score >= 20) {
            showVictoryMessage();
        }

        enemy.remove();
    });

    gameArea.appendChild(enemy);

    setTimeout(() => {
        if (gameArea.contains(enemy)) {
            showDamageOverlay();
            lives--;
            updateScoreboard();
            enemy.remove();
            if (!isMuted) loseLifeSound.play();

            if (lives <= 0) {
                setTimeout(() => {
                    gameOver();
                }, 100);
            }
        }
    }, 3000);
}

// Función para ajustar la frecuencia de aparición de los enemigos según el nivel
function adjustEnemySpawnFrequency() {
    switch (level) {
        case 'easy':
            spawnInterval = 1000;
            break;
        case 'medium':
            spawnInterval = 800;
            break;
        case 'hard':
            spawnInterval = 600;
            break;
    }

    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnEnemy, spawnInterval);
}

function startGame(levelSelected) {
    level = levelSelected;
    startMenu.style.display = 'none';
    gameArea.style.display = 'block';
    scoreboard.style.display = 'block';
    spawnInterval = 1000;
    spawnTimer = setInterval(spawnEnemy, spawnInterval);
    adjustEnemySpawnFrequency();
}

document.getElementById('easy-button').addEventListener('click', () => startGame('easy'));
document.getElementById('medium-button').addEventListener('click', () => startGame('medium'));
document.getElementById('hard-button').addEventListener('click', () => startGame('hard'));

// Función para pausar el juego con la tecla ESC
let isPaused = false;

function togglePause() {
    if (isPaused) {
        spawnTimer = setInterval(spawnEnemy, spawnInterval);
        backgroundMusic.play();
    } else {
        clearInterval(spawnTimer);
        backgroundMusic.pause();
    }
    isPaused = !isPaused;

    // Mostrar mensaje de pausa
    const pauseMessage = document.createElement('div');
    pauseMessage.classList.add('message');
    pauseMessage.textContent = 'PAUSA';
    gameArea.appendChild(pauseMessage);

    setTimeout(() => {
        pauseMessage.remove();
    }, 1500);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        togglePause();
    }
});

updateScoreboard();
