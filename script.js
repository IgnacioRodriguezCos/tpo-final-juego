const gameArea = document.getElementById('game-area');
const scoreboard = document.getElementById('scoreboard');
const muteButton = document.getElementById('mute-button');
let score = 0;
let lives = 3;

// Cargar sonidos
const loseLifeSound = new Audio('sonidos/enemy-sound.mp3'); // Sonido al perder una vida
const backgroundMusic = new Audio('sonidos/background.mp3'); // Canción de fondo
backgroundMusic.loop = true; // Asegura que la música se repita
backgroundMusic.volume = 0.5; // Ajusta el volumen si es necesario

// Iniciar música de fondo
backgroundMusic.play();

// Actualizar el marcador
function updateScoreboard() {
    scoreboard.firstChild.textContent = `Puntos: ${score} | Vidas: ${lives}`;
}

// Función para mostrar el rectángulo rojo al perder una vida
function showDamageOverlay() {
    const damageOverlay = document.getElementById('damage-overlay'); // Asegúrate de seleccionar el elemento
    if (damageOverlay) {
        damageOverlay.style.display = 'block'; // Muestra el rectángulo
        setTimeout(() => {
            damageOverlay.style.display = 'none'; // Oculta el rectángulo después de 300ms
        }, 300);
    } else {
        console.error('Elemento damage-overlay no encontrado en el DOM.');
    }
}


// Función para terminar el juego
function gameOver() {
    alert(`¡Juego terminado! Tu puntaje final es: ${score}`);
    backgroundMusic.pause(); // Detiene la música cuando el juego termina
    location.reload(); // Reinicia el juego
}

// Función para manejar el botón de silencio
let isMuted = false; // Estado de la música
muteButton.addEventListener('click', () => {
    isMuted = !isMuted; // Cambiar el estado
    if (isMuted) {
        backgroundMusic.pause(); // Pausa la música
        muteButton.textContent = '🔇'; // Cambia el ícono
    } else {
        backgroundMusic.play(); // Reproduce la música
        muteButton.textContent = '🔊'; // Cambia el ícono
    }
});

let spawnInterval = 1000; // Intervalo inicial de 1 segundo
let spawnTimer; // Para controlar el intervalo de generación de enemigos
let gameStartTime = Date.now(); // Tiempo de inicio del juego

// Función para generar enemigos
function spawnEnemy() {
    if (lives <= 0) return; // Detener generación de enemigos si el juego ha terminado

    const enemy = document.createElement('img'); // Crear un elemento de imagen
    enemy.classList.add('enemy');
    enemy.src = 'imagenes/stormtrooper.png'; // Cambia esta ruta por la de tu imagen

    // Posición aleatoria con límites
    const enemySize = 100;
    const x = Math.random() * (window.innerWidth - enemySize);
    const y = Math.random() * (window.innerHeight - enemySize - 100);
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;

    // Función para reproducir el sonido del clic en enemigo
    function playHitSound() {
        const hitSound = new Audio('sonidos/player-sound.mp3'); // Sonido al presionar el enemigo
        hitSound.play(); // Reproducir el sonido
    }
    
    // Evento de clic para eliminar enemigo
    enemy.addEventListener('click', () => {
        score++;
        if (!isMuted) playHitSound(); // Reproducir sonido de disparo si no está silenciado
        updateScoreboard();
        enemy.remove();
    });

    gameArea.appendChild(enemy);

    // Restar una vida si no se elimina el enemigo en 3 segundos
    setTimeout(() => {
        if (gameArea.contains(enemy)) {
            showDamageOverlay(); // Muestra el rectángulo rojo
            lives--;
            updateScoreboard(); // Actualiza el marcador antes de verificar el estado del juego
            enemy.remove();
            if (!isMuted) loseLifeSound.play(); // Reproducir sonido de pérdida de vida si no está silenciado

            if (lives <= 0) {
                setTimeout(() => {
                    gameOver(); // Llama a gameOver con un pequeño retraso
                }, 100); // Retraso de 100ms para asegurar la actualización del DOM
            }
        }
    }, 3000);
}

// Cambiar la frecuencia de aparición de los enemigos después de 2 minutos
function adjustEnemySpawnFrequency() {
    const elapsedTime = Date.now() - gameStartTime; // Tiempo transcurrido desde el inicio
    if (elapsedTime >= 120000) { // Si han pasado 2 minutos (120000 ms)
        if (spawnInterval > 500) { // Cambiar la frecuencia a la mitad si es mayor de 500ms
            spawnInterval = 500;
            clearInterval(spawnTimer); // Detener el intervalo anterior
            spawnTimer = setInterval(spawnEnemy, spawnInterval); // Iniciar nuevo intervalo más rápido
        }
    }
}

// Iniciar la generación de enemigos
spawnTimer = setInterval(spawnEnemy, spawnInterval);

// Llamar a la función para ajustar la frecuencia cada segundo
setInterval(adjustEnemySpawnFrequency, 1000);

// Inicializar marcador
updateScoreboard();
