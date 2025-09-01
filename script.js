document.addEventListener('DOMContentLoaded', () => {

    // Elementos DOM
    const initialScreen = document.getElementById('initial-screen');
    const gameScreen = document.getElementById('game-screen');
    const endGameScreen = document.getElementById('end-game-screen');
    const rankingScreen = document.getElementById('ranking-screen');

    const levelSelect = document.getElementById('level-select');
    const startBtn = document.getElementById('start-game-btn');
    const showRankingBtn = document.getElementById('show-ranking-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');

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
    const BASE_TIME = 60; // Tempo base por nível
    const BASE_PAIRS = 4; // Pares base no nível 1
    const POINTS_MATCH = 100;
    const POINTS_ERROR = -5;
    const POINTS_PER_SECOND = 2; // Pontos por segundo restante

    // Conteúdo das cartas (emojis ou ícones)
    const cardContents = [
        '🍎', '🍊', '🍇', '🍉', '🍓', '🍒', '🍍', '🥭', '🥝', '🍌',
        '🍋', '🍑', '🍐', '🥥', '🥑', '🥦', '🥕', '🥔', '🌶️', '🌽',
        '🍞', '🥐', '🥖', '🥨', '🧀', '🥓', '🍳', '🥞', '🍔', '🍟',
        '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍜', '🍝', '🍣', '🍤'
    ];

    // --- Funções Principais ---

    // Muda a tela ativa
    const switchScreen = (screenId) => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    };

    // Inicia um novo jogo
    const startGame = (level) => {
        gameLevel = parseInt(level);
        score = 0;
        matchedPairs = 0;
        canFlip = true;

        updateHeaderInfo();

        // Define o número de pares e o tempo com base no nível
        const numPairs = BASE_PAIRS + (gameLevel - 1) * 2;
        timeRemaining = BASE_TIME + (gameLevel - 1) * 10;

        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(auto-fit, minmax(70px, 1fr))`;

        createCards(numPairs);
        shuffleCards();

        switchScreen('game-screen');
        startTimer();

        // Mostra as informações do jogo no header
        gameLevelDisplay.style.display = 'block';
        gameScoreDisplay.style.display = 'block';
        gameTimerDisplay.style.display = 'block';
    };

    // Atualiza as informações no cabeçalho
    const updateHeaderInfo = () => {
        gameLevelDisplay.textContent = `Nível: ${gameLevel}`;
        gameScoreDisplay.textContent = `Pontos: ${score}`;
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
        gameTimerDisplay.textContent = `Tempo: ${timeRemaining}s`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeRemaining--;
            gameTimerDisplay.textContent = `Tempo: ${timeRemaining}s`;
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
        if (card.classList.contains('matched') || card.classList.contains('flipped')) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            canFlip = false;
            setTimeout(checkMatch, 1000);
        }
    };

    // Verifica se as cartas viradas são um par
    const checkMatch = () => {
        const [card1, card2] = flippedCards;
        const isMatch = card1.dataset.name === card2.dataset.name;

        if (isMatch) {
            matchedPairs++;
            score += POINTS_MATCH + (timeRemaining * POINTS_PER_SECOND);
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.removeEventListener('click', flipCard);
            card2.removeEventListener('click', flipCard);

            if (matchedPairs === cards.length / 2) {
                // Todas as cartas combinadas, ir para o próximo nível
                setTimeout(nextLevel, 1500);
            }
        } else {
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
        gameLevel++;
        matchedPairs = 0;
        // Exibe uma mensagem breve de "Nível Concluído"
        endGameTitle.textContent = 'Parabéns!';
        endGameMessage.textContent = 'Nível Concluído!';
        endGameMessage.classList.remove('game-over-message');
        endGameMessage.classList.add('win-message');
        finalScoreDisplay.textContent = score;
        finalLevelDisplay.textContent = gameLevel - 1;
        switchScreen('end-game-screen');
        // Salva a pontuação para o próximo nível
        localStorage.setItem('tempScore', score);
        localStorage.setItem('tempLevel', gameLevel);

        setTimeout(() => {
            const tempScore = parseInt(localStorage.getItem('tempScore')) || 0;
            const tempLevel = parseInt(localStorage.getItem('tempLevel')) || 1;
            score = tempScore;
            startGame(tempLevel);
        }, 2000);
    };

    // Finaliza o jogo (vitória ou derrota)
    const endGame = (isWin) => {
        clearInterval(timerInterval);

        if (isWin) {
            endGameTitle.textContent = 'Vitória!';
            endGameMessage.textContent = 'Você completou o último nível!';
            endGameMessage.classList.add('win-message');
            endGameMessage.classList.remove('game-over-message');
        } else {
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
    startBtn.addEventListener('click', () => startGame(levelSelect.value));
    showRankingBtn.addEventListener('click', showRanking);
    backToStartBtn.addEventListener('click', () => switchScreen('initial-screen'));
    saveScoreForm.addEventListener('submit', saveScore);
});
