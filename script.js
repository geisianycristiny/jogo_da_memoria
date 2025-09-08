document.addEventListener('DOMContentLoaded', () => {

    // Elementos DOM
    const initialScreen = document.getElementById('initial-screen');
    const gameScreen = document.getElementById('game-screen');
    const endGameScreen = document.getElementById('end-game-screen');
    const rankingScreen = document.getElementById('ranking-screen');
    const levelUpOverlay = document.getElementById('level-up-overlay');
    const pauseMenu = document.getElementById('pause-menu');

    const levelSelect = document.getElementById('level-select');
    const startBtn = document.getElementById('start-game-btn');
    const showRankingBtn = document.getElementById('show-ranking-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const exitBtn = document.getElementById('exit-btn');

    const gameBoard = document.getElementById('game-board');
    const gameLevelDisplay = document.getElementById('game-level');
    const gameScoreDisplay = document.getElementById('game-score');
    const gameTimerDisplay = document.getElementById('game-timer');

    const endGameTitle = document.getElementById('end-game-title');
    const endGameMessage = document.getElementById('end-game-message');
    const finalScoreDisplay = document.getElementById('final-score');
    const finalLevelDisplay = document.getElementById('final-level');
    const saveScoreForm = document.getElementById('save-score-form');

    const rankingList = document.getElementById('ranking-list');

    // Variáveis do Jogo
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;
    let gameLevel = 1;
    let score = 0;
    let timeRemaining = 60;
    let timerInterval;

    // Constantes do Jogo
    const BASE_TIME = 90; // Tempo base por nível, agora 90 segundos
    const BASE_PAIRS = 4; // Pares base no nível 1
    const POINTS_MATCH = 100;
    const POINTS_ERROR = -5;
    const POINTS_PER_SECOND = 2; // Pontos por segundo restante
    const MAX_LEVEL = 4;

    // Conteúdo das cartas (emojis ou ícones)
    const cardContents = [
        '🍎', '🍊', '🍇', '🍉', '🍓', '🍒', '🍍', '🥭', '🥝', '🍌',
        '🍋', '🍑', '🍐', '🥥', '🥑', '🥦', '🥕', '🥔', '🌶️', '🌽',
        '🍞', '🥐', '🥖', '🥨', '🧀', '🥓', '🍳', '🥞', '🍔', '🍟',
        '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍜', '🍝', '🍣', '🍤'
    ];
    
    // Efeitos sonoros
    const flipSound = new Audio('assets/sounds/carta-virando.mp3');
    const matchSound = new Audio('assets/sounds/efeito-de-acerto.mp3');
    const errorSound = new Audio('assets/sounds/efeito-de-erro.mp3');
    const winSound = new Audio('assets/sounds/efeito-venceu.mp3');
    const gameOverSound = new Audio('assets/sounds/game-over.mp3');

    // --- Funções Principais ---

    // Muda a tela ativa
    const switchScreen = (screenId) => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        // Mostra ou esconde o botão de pausa no cabeçalho
        const showPauseBtn = screenId === 'game-screen';
        pauseBtn.style.display = showPauseBtn ? 'block' : 'none';

        // Mostra ou esconde o cabeçalho de jogo
        const showHeader = screenId === 'game-screen';
        gameLevelDisplay.style.display = showHeader ? 'block' : 'none';
        gameScoreDisplay.style.display = showHeader ? 'block' : 'none';
        gameTimerDisplay.style.display = showHeader ? 'block' : 'none';
    };

    // Inicia um novo jogo
    const startGame = (level) => {
        gameLevel = parseInt(level);
        matchedPairs = 0;
        canFlip = true;

        updateHeaderInfo();

        // Define o número de pares e o tempo com base no nível
        const numPairs = BASE_PAIRS + (gameLevel - 1) * 2;
        timeRemaining = BASE_TIME + (gameLevel - 1) * 15; // Tempo aumentado

        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(auto-fit, minmax(70px, 1fr))`;

        createCards(numPairs);
        shuffleCards();

        switchScreen('game-screen');
        startTimer();
    };

    // Atualiza as informações no cabeçalho
    const updateHeaderInfo = () => {
        gameLevelDisplay.textContent = `Nível: ${gameLevel}`;
        gameScoreDisplay.textContent = `Pontos: ${score}`;
        gameTimerDisplay.textContent = `Tempo: ${timeRemaining}s`;
    };

    // Cria as cartas do jogo
    const createCards = (numPairs) => {
        cards = [];
        const selectedContents = cardContents.slice(0, numPairs);
        const gameContents = [...selectedContents, ...selectedContents];

        gameContents.forEach((content, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.name = content;
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-face">${content}</div>
                    <div class="card-back"><img src="logo-senac.webp" alt="Verso da Carta"></div>
                </div>
            `;
            cardElement.addEventListener('click', flipCard);
            cards.push(cardElement);
            gameBoard.appendChild(cardElement);
        });
    };

    // Embaralha as cartas
    const shuffleCards = () => {
        cards.forEach(card => {
            const randomPos = Math.floor(Math.random() * cards.length);
            card.style.order = randomPos;
        });
    };

    // Inicia o temporizador
    const startTimer = () => {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateHeaderInfo();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                endGame(false); // Game Over por tempo esgotado
            }
        }, 1000);
    };

    // Lógica para virar uma carta
    const flipCard = (event) => {
        if (!canFlip) return;

        const card = event.currentTarget;
        const cardInner = card.querySelector('.card-inner');
        if (cardInner.classList.contains('matched') || cardInner.classList.contains('flipped')) {
            return;
        }

        flipSound.play();
        cardInner.classList.add('flipped');
        flippedCards.push(cardInner);

        if (flippedCards.length === 2) {
            canFlip = false;
            setTimeout(checkMatch, 1000);
        }
    };


    // Verifica se as cartas viradas são um par
    const checkMatch = () => {
        const [card1, card2] = flippedCards;
        const isMatch = card1.parentElement.dataset.name === card2.parentElement.dataset.name;

        if (isMatch) {
            matchSound.play();
            matchedPairs++;
            score += POINTS_MATCH + (timeRemaining * POINTS_PER_SECOND);
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.parentElement.removeEventListener('click', flipCard);
            card2.parentElement.removeEventListener('click', flipCard);

            if (matchedPairs === cards.length / 2) {
                if (gameLevel === MAX_LEVEL) {
                    endGame(true); // Fim de jogo com vitória!
                } else {
                    nextLevel();
                }
            }
        } else {
            errorSound.play();
            score = Math.max(0, score + POINTS_ERROR);
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }

        updateHeaderInfo();
        flippedCards = [];
        canFlip = true;
    };

    // Avança para o próximo nível
    const nextLevel = () => {
        clearInterval(timerInterval); // Para o timer do nível atual
        levelUpOverlay.textContent = `Parabéns! Nível ${gameLevel} Concluído!`;
        levelUpOverlay.classList.add('active');

        setTimeout(() => {
            levelUpOverlay.classList.remove('active');
            gameLevel++; // Incrementa o nível
            startGame(gameLevel); // Inicia o próximo nível
        }, 2000);
    };

    // Pausa o jogo
    const pauseGame = () => {
        clearInterval(timerInterval);
        canFlip = false;
        pauseMenu.classList.remove('hidden');
    };

    // Continua o jogo
    const resumeGame = () => {
        pauseMenu.classList.add('hidden');
        canFlip = true;
        startTimer();
    };

    // Sai do jogo e volta para a tela inicial
    const exitGame = () => {
        clearInterval(timerInterval);
        pauseMenu.classList.add('hidden');
        switchScreen('initial-screen');
    };


    // Finaliza o jogo (vitória ou derrota)
    const endGame = (isWin) => {
        clearInterval(timerInterval);

        if (isWin) {
            winSound.play();
            endGameTitle.textContent = 'Vitória!';
            endGameMessage.textContent = 'Você completou o último nível!';
            endGameMessage.classList.add('win-message');
            endGameMessage.classList.remove('game-over-message');
        } else {
            gameOverSound.play();
            endGameTitle.textContent = 'Fim de Jogo!';
            endGameMessage.textContent = 'O tempo acabou!';
            endGameMessage.classList.add('game-over-message');
            endGameMessage.classList.remove('win-message');
        }

        finalScoreDisplay.textContent = score;
        finalLevelDisplay.textContent = gameLevel;
        switchScreen('end-game-screen');
    };

    // Salva a pontuação no armazenamento local
    const saveScore = (event) => {
        event.preventDefault();
        const playerName = document.getElementById('player-name').value;
        const finalScore = score;
        const finalLevel = gameLevel;

        const ranking = JSON.parse(localStorage.getItem('memoryRanking')) || [];

        ranking.push({ name: playerName, score: finalScore, level: finalLevel });
        ranking.sort((a, b) => b.score - a.score);

        localStorage.setItem('memoryRanking', JSON.stringify(ranking));

        // Redireciona para a tela inicial
        document.getElementById('player-name').value = '';
        switchScreen('initial-screen');
    };

    // Exibe o ranking
    const showRanking = () => {
        const ranking = JSON.parse(localStorage.getItem('memoryRanking')) || [];
        rankingList.innerHTML = '';
        if (ranking.length === 0) {
            rankingList.innerHTML = '<li class="ranking-item">Nenhuma pontuação salva ainda.</li>';
        } else {
            ranking.forEach((entry, index) => {
                const li = document.createElement('li');
                li.classList.add('ranking-item');
                li.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>Pontos: ${entry.score}</span>
                    <span>Nível: ${entry.level}</span>
                `;
                rankingList.appendChild(li);
            });
        }
        switchScreen('ranking-screen');
    };

    // --- Event Listeners ---
    startBtn.addEventListener('click', () => {
        score = 0; // Reseta a pontuação ao iniciar um novo jogo
        startGame(levelSelect.value);
    });
    showRankingBtn.addEventListener('click', showRanking);
    backToStartBtn.addEventListener('click', () => switchScreen('initial-screen'));
    saveScoreForm.addEventListener('submit', saveScore);
    pauseBtn.addEventListener('click', pauseGame);
    resumeBtn.addEventListener('click', resumeGame);
    exitBtn.addEventListener('click', exitGame);
});
