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
let isGameOver = false; // Variable para controlar si el juego ha terminado

// Cargar sonidos
let backgroundMusic = new Audio();
let loseLifeSound = new Audio();
const hitSound = new Audio('sonidos/player-sound.mp3');
backgroundMusic.src = 'sonidos/menu.mp3';
backgroundMusic.currentTime = 11;

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
    // Crear y mostrar el mensaje de Game Over
    const gameOverMessage = document.createElement('div');
    gameOverMessage.classList.add('message');
    gameOverMessage.textContent = `¡Juego Terminado! Tu puntaje final es: ${score}`;
    gameArea.appendChild(gameOverMessage);

    // Bloquear interacciones
    const noInteractionOverlay = document.createElement('div');
    noInteractionOverlay.id = 'no-interaction';
    document.body.appendChild(noInteractionOverlay);

    // Marcar el juego como terminado para evitar más enemigos
    isGameOver = true;

    // Esperar un tiempo antes de mostrar el mensaje de "Volviendo a la pantalla principal..."
    setTimeout(() => {
        gameOverMessage.textContent = 'Volviendo a la pantalla principal...';

        // Eliminar todos los enemigos de la pantalla
        const enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => enemy.remove());

        // Volver a la pantalla principal después de 2 segundos
        setTimeout(() => {
            location.reload(); // Recargar la página y volver al menú
        }, 2000);
    }, 2000); // Mostrar el mensaje de Game Over por 2 segundos
}


function showVictoryMessage() {
    // Crear y mostrar el mensaje de victoria
    const victoryMessage = document.createElement('div');
    victoryMessage.classList.add('message');
    victoryMessage.textContent = `¡Ganaste! Tu puntaje final es: ${score}`;
    gameArea.appendChild(victoryMessage);

    // Bloquear interacciones
    const noInteractionOverlay = document.createElement('div');
    noInteractionOverlay.id = 'no-interaction';
    document.body.appendChild(noInteractionOverlay);

    // Marcar el juego como terminado para evitar más enemigos
    isGameOver = true;

    // Esperar un tiempo antes de mostrar el mensaje de "Volviendo a la pantalla principal..."
    setTimeout(() => {
        victoryMessage.textContent = 'Volviendo a la pantalla principal...';

        // Eliminar todos los enemigos de la pantalla
        const enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => enemy.remove());

        // Volver a la pantalla principal después de 2 segundos
        setTimeout(() => {
            location.reload(); // Recargar la página y volver al menú
        }, 2000);
    }, 2000); // Mostrar el mensaje de victoria por 2 segundos
}



// Función para cambiar la música de fondo y el sonido de perder vida según el nivel
function updateSounds() {
    if (level === 'easy') {
        // Sonidos para el nivel fácil
        backgroundMusic.src = 'sonidos/background.mp3';
        loseLifeSound.src = 'sonidos/enemy-sound.mp3';
    } else if (level === 'medium') {
        // Sonidos para el nivel medio
        backgroundMusic.src = 'sonidos/hoth.mp3';
        loseLifeSound.src = 'sonidos/enemy-sound.mp3';
        backgroundMusic.currentTime = 35;
    } else if (level === 'hard') {
        // Sonidos para el nivel difícil
        backgroundMusic.src = 'sonidos/endor.mp3';
        loseLifeSound.src = 'sonidos/enemy-sound.mp3';
        backgroundMusic.currentTime = 120;
    }
    
    // Configurar la música de fondo
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    // Reproducir la música de fondo si no está en silencio
    if (!isMuted) {
        backgroundMusic.play();
    }
}

function updateBackground() {
    if (level === 'easy') {
        document.body.style.background = 'url("imagenes/DS1.webp") no-repeat center center fixed';
    } else if (level === 'medium') {
        document.body.style.background = 'url("imagenes/hoth.jpg") no-repeat center center fixed';
        document.body.style.backgroundSize = 'cover';
    } else if (level === 'hard') {
        document.body.style.background = "url('imagenes/DS2.webp') no-repeat center center fixed"; 
        document.body.style.backgroundSize = 'cover';
    }
    updateSounds();
}

// Llamar a esta función después de que el jugador haya seleccionado el nivel
// Ejemplo de cómo se puede usar:
document.getElementById('easy-button').addEventListener('click', () => {
    level = 'easy';
    updateBackground(); // Cambiar fondo al seleccionar nivel fácil
});

document.getElementById('medium-button').addEventListener('click', () => {
    level = 'medium';
    updateBackground(); // Cambiar fondo al seleccionar nivel medio
});

document.getElementById('hard-button').addEventListener('click', () => {
    level = 'hard';
    updateBackground(); // Cambiar fondo al seleccionar nivel difícil
});

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
    if (lives <= 0 || isGameOver) return;

    const enemy = document.createElement('img');
    enemy.classList.add('enemy');

    let enemyImage;
    let enemySize = 180;
    let enemyType = 'normal';  // Tipo de enemigo (normal o doble clic)
    let clickCount = 0;  // Contador de clics para los enemigos de tipo doble clic

    // En nivel easy solo generamos enemigos normales
    if (level === 'easy') {
        enemyImage = 'imagenes/stormtrooper.png';  // Imagen del enemigo normal
        enemyType = 'normal';
        enemy.style.width = `${enemySize}px`;
        enemy.style.height = `${enemySize + 100}px`;
    } 
    // En nivel medium, 30% de probabilidad de que el enemigo sea de tipo doble clic
    else if (level === 'medium') {
        if (Math.random() < 0.3) {  // 30% de probabilidad
            enemyImage = 'imagenes/atat.webp';  // Imagen del enemigo de doble clic
            enemyType = 'doubleClick';
            enemy.style.width = `${enemySize}px`;
            enemy.style.height = `${enemySize + 100}px`;
        } else {
            enemyImage = 'imagenes/atst.webp';  // Imagen de los enemigos normales del nivel medium
            enemyType = 'normal';
            enemy.style.width = `${enemySize}px`;
            enemy.style.height = `${enemySize + 100}px`;
        }
    } 
    // En nivel hard, generamos enemigos de tipo normal y de doble clic
    else if (level === 'hard') {
        if (Math.random() < 0.2) {  // 40% de probabilidad de que sea de tipo doble clic
            enemyImage = 'imagenes/ISD.webp';
            enemyType = 'doubleClick';
            enemy.style.width = `${enemySize+100}px`;
            enemy.style.height = `${enemySize}px`;
        } else {
            enemyImage = 'imagenes/tie.png';  // Imagen de los enemigos normales del nivel hard
            enemyType = 'normal';
            enemy.style.width = `${enemySize-50}px`;
            enemy.style.height = `${enemySize-50}px`;
        }
    }

    enemy.src = enemyImage;
    

    // Posiciones aleatorias para los enemigos
    const x = Math.random() * (window.innerWidth - enemySize);
    const y = Math.random() * (window.innerHeight - enemySize - 100); // Deja un espacio por arriba
    enemy.style.position = 'absolute';
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;

    // Función para reproducir el sonido de impacto
    function playHitSound() {
        if (!isMuted) {
            const hitSound = new Audio('sonidos/player-sound.mp3');
            hitSound.play().catch(error => {
                console.error('No se pudo reproducir el sonido:', error);
            });
        }
    }

    // Acción al hacer clic en el enemigo
    enemy.addEventListener('click', () => {
        clickCount++;  // Aumentar el contador de clics

        // Si el enemigo es de tipo doble clic, solo se elimina después de 2 clics
        if (enemyType === 'doubleClick' && clickCount === 2) {
            score++;
            playHitSound();  // Reproducir sonido si no está en mute
            updateScoreboard();

            // Verificar si el jugador ganó (20 enemigos eliminados)
            if (score >= 20) {
                showVictoryMessage();
            }

            // Eliminar el enemigo de la pantalla
            enemy.remove();
        }

        // Si el enemigo es normal, se elimina con el primer clic
        if (enemyType === 'normal') {
            score++;
            playHitSound();
            updateScoreboard();

            // Verificar si el jugador ganó (20 enemigos eliminados)
            if (score >= 20) {
                showVictoryMessage();
            }

            // Eliminar el enemigo de la pantalla
            enemy.remove();
        }
    });

    // Añadir el enemigo al área de juego
    gameArea.appendChild(enemy);

    // Si es nivel hard, mover el enemigo
    if (level === 'hard') {
        let xSpeed = Math.random() * 3 + 1;  // Velocidad aleatoria en x
        let ySpeed = Math.random() * 3 + 1;  // Velocidad aleatoria en y

        // Mover al enemigo en un intervalo
        setInterval(() => {
            if (gameArea.contains(enemy)) {
                const xPos = parseFloat(enemy.style.left);
                const yPos = parseFloat(enemy.style.top);

                // Mover el enemigo
                enemy.style.left = `${xPos + xSpeed}px`;
                enemy.style.top = `${yPos + ySpeed}px`;

                // Cambiar la dirección si alcanza los bordes de la pantalla
                if (xPos + xSpeed >= window.innerWidth - enemySize || xPos + xSpeed <= 0) {
                    xSpeed *= -1;  // Invertir dirección en x
                }
                if (yPos + ySpeed >= window.innerHeight - enemySize || yPos + ySpeed <= 0) {
                    ySpeed *= -1;  // Invertir dirección en y
                }
            }
        }, 20); // Actualizar cada 20 ms
    }

    // Timeout para eliminar el enemigo si no fue clickeado después de 3 segundos
    setTimeout(() => {
        if (gameArea.contains(enemy)) {
            showDamageOverlay();
            lives--;
            updateScoreboard();
            enemy.remove(); // Eliminar el enemigo de la pantalla

            if (!isMuted) loseLifeSound.play(); // Reproducir sonido de perder vida

            if (lives <= 0) {
                setTimeout(() => {
                    gameOver(); // Finalizar el juego si las vidas llegan a 0
                }, 100);
            }
        }
    }, 3000); // 3000 ms de tiempo antes de eliminar al enemigo
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
