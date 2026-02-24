document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Audio & Preloader Sequence ---
    const startBtn = document.getElementById('start-btn');
    const bgMusic = document.getElementById('bg-music');
    const audioBtn = document.getElementById('audio-btn');
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('journal-content');
    const floatingControls = document.getElementById('float-ui');
    let isPlaying = false;
    startBtn.addEventListener('click', () => {
        document.body.classList.remove('locked');
        bgMusic.volume = 0.4;
        bgMusic.play().then(() => {
            isPlaying = true;
            audioBtn.classList.add('playing');
        }).catch(e => console.log('Audio error:', e));
        // Fade out intro, show main
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.style.visibility = 'hidden';
            introScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            floatingControls.classList.remove('hidden');
            // Pop some cute confetti
            confetti({
                particleCount: 100, spread: 70, origin: { y: 0.6 },
                colors: ['#FFC4C4', '#DCEbd2', '#ffffff']
            });
        }, 1000);
    });
    audioBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            audioBtn.classList.remove('playing');
            isPlaying = false;
        } else {
            bgMusic.play();
            audioBtn.classList.add('playing');
            isPlaying = true;
        }
    });
    // --- 2. Interactive Envelope ---
    const waxSeal = document.getElementById('wax-seal');
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    waxSeal.addEventListener('click', () => {
        envelopeWrapper.classList.add('open');
        // Little confetti pop from seal
        const rect = waxSeal.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({ particleCount: 30, spread: 50, origin: { x, y }, colors: ['#A02B2B', '#E6D4C1'] });
    });
    // --- 3. Polaroid Rub-to-Reveal ---
    const canvas = document.getElementById('polaroid-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const photoArea = document.querySelector('.photo-area');
        const caption = document.getElementById('photo-caption');
        let isDrawing = false;
        let revealedPixels = 0;
        let totalPixels = 0;
        let canvasCompleted = false;
        // Setup Canvas 
        function resizeCanvas() {
            canvas.width = photoArea.offsetWidth;
            canvas.height = photoArea.offsetHeight;
            // Fill with dark undeveloped film color
            ctx.fillStyle = "#2A2A2A";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add subtle instruction
            ctx.font = "italic 16px Quicksand";
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.textAlign = "center";
            ctx.fillText("Rub gently...", canvas.width / 2, canvas.height / 2);
            ctx.globalCompositeOperation = "destination-out"; // This makes drawing erase
            totalPixels = canvas.width * canvas.height;
        }
        resizeCanvas();
        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }
        function scratch(e) {
            if (!isDrawing || canvasCompleted) return;
            e.preventDefault(); // Prevent scrolling on touch
            const pos = getMousePos(e);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2, false);
            ctx.fill();
            // Check if scratched enough periodically (1 in 5 mouse moves)
            if (Math.random() > 0.8) checkCompletion();
        }
        function checkCompletion() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let cleared = 0;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] === 0) cleared++;
            }
            if (cleared > totalPixels * 0.5) { // 50% cleared
                canvasCompleted = true;
                // Animate fade out
                canvas.style.transition = 'opacity 1s ease';
                canvas.style.opacity = '0';
                setTimeout(() => {
                    canvas.style.display = 'none';
                    caption.classList.add('show');
                }, 1000);
            }
        }
        canvas.addEventListener('mousedown', () => isDrawing = true);
        canvas.addEventListener('touchstart', () => isDrawing = true);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('touchmove', scratch);
        window.addEventListener('mouseup', () => isDrawing = false);
        window.addEventListener('touchend', () => isDrawing = false);
    }
    // --- 4. The Love Quiz Logic ---
    const quizBoxes = document.querySelectorAll('.quiz-box');
    const quizSuccess = document.getElementById('quiz-success');
    quizBoxes.forEach((box, index) => {
        const btns = box.querySelectorAll('.quiz-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('correct')) {
                    btn.classList.add('chosen-correct');
                    // Disable others
                    btns.forEach(b => b.style.pointerEvents = 'none');
                    // Show next quiz or success
                    setTimeout(() => {
                        if (index + 1 < quizBoxes.length) {
                            quizBoxes[index + 1].classList.remove('hidden');
                        } else {
                            quizSuccess.classList.remove('hidden');
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#FFC4C4', '#ffffff'] });
                        }
                    }, 500);
                } else {
                    btn.classList.add('chosen-wrong');
                    setTimeout(() => btn.classList.remove('chosen-wrong'), 500);
                }
            });
        });
    });
    // --- 5. Memory Match Game ---
    const memoryGrid = document.getElementById('memory-grid');
    const successMsg = document.getElementById('game-success-msg');
    const symbols = ['🌸', '✨', '💖', '💍', '💌', '🌹', '🍓', '🦋'];
    let cards = [...symbols, ...symbols];
    let flippedCards = [];
    let matchedPairs = 0;

    // Shuffle
    cards.sort(() => Math.random() - 0.5);

    if (memoryGrid) {
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card pulse';
            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front">?</div>
                    <div class="memory-card-back">${symbol}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (card.classList.contains('flipped') || flippedCards.length >= 2) return;

                card.classList.add('flipped');
                flippedCards.push({ card, symbol });

                if (flippedCards.length === 2) {
                    setTimeout(checkMatch, 800);
                }
            });

            memoryGrid.appendChild(card);
        });
    }

    function checkMatch() {
        if (flippedCards[0].symbol === flippedCards[1].symbol) {
            matchedPairs++;
            if (matchedPairs === symbols.length) {
                successMsg.classList.remove('hidden');
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 }, colors: ['#FFC4C4', '#DCEbd2', '#ffffff'] });
            }
        } else {
            flippedCards[0].card.classList.remove('flipped');
            flippedCards[1].card.classList.remove('flipped');
        }
        flippedCards = [];
    }

    // --- 6. Heartbeat Sync Logic (Hold to Fill) ---
    const heartLock = document.getElementById('heart-lock');
    const filledHeart = document.getElementById('filled-heart');
    const proposalContent = document.getElementById('proposal-content');
    let fillAmount = 100; // inverted for polygon % (100 = empty, 0 = full)
    let fillInterval;
    let isHolding = false;
    let unlocked = false;
    // Apply init state
    filledHeart.style.clipPath = `polygon(0 100%, 100% 100%, 100% 100%, 0 100%)`;
    function startFilling() {
        if (unlocked) return;
        isHolding = true;
        clearInterval(fillInterval);
        fillInterval = setInterval(() => {
            fillAmount -= 2; // Speed of fill
            if (fillAmount <= 0) {
                fillAmount = 0;
                unlockHeart();
            }
            updateHeartClip();
        }, 30);
    }
    function stopFilling() {
        if (unlocked) return;
        isHolding = false;
        clearInterval(fillInterval);
        // Slowly drain if they let go early
        fillInterval = setInterval(() => {
            fillAmount += 5;
            if (fillAmount >= 100) {
                fillAmount = 100;
                clearInterval(fillInterval);
            }
            updateHeartClip();
        }, 30);
    }
    function updateHeartClip() {
        // creates a horizontal cut-off moving upwards
        filledHeart.style.clipPath = `polygon(0 ${fillAmount}%, 100% ${fillAmount}%, 100% 100%, 0 100%)`;
    }
    function unlockHeart() {
        unlocked = true;
        clearInterval(fillInterval);
        heartLock.querySelector('.hold-text').classList.add('hidden');
        proposalContent.classList.remove('hidden');
        // Massive cute confetti explosion
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFC4C4', '#FF9B9B', '#ffffff'] });
    }
    heartLock.addEventListener('mousedown', startFilling);
    heartLock.addEventListener('touchstart', (e) => { e.preventDefault(); startFilling(); });
    window.addEventListener('mouseup', stopFilling);
    window.addEventListener('touchend', stopFilling);
    // --- Final Buttons (Interactive Proposal) ---
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    function executeFinale() {
        btnYes.closest('.decision-buttons').innerHTML = `
            <div style="font-family: var(--font-script); font-size: 4rem; color: var(--accent-pink);">
                I love you so much. 💕
            </div>
        `;
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const colors = ['#FFC4C4', '#DCEbd2', '#ffffff', '#FF9B9B', '#ffd700'];

        (function frame() {
            // Flower Blast Confetti (using actual emoji for a literal "flower blast")
            confetti({
                particleCount: 15, // lots of flowers per frame
                angle: 60,
                spread: 70,
                origin: { x: 0, y: 0.8 },
                colors: colors,
                zIndex: 1000,
                shapes: ['circle'],
                scalar: 1.5, // Make them a bit larger
                ticks: 300 // Last longer on screen
            });
            confetti({
                particleCount: 15,
                angle: 120,
                spread: 70,
                origin: { x: 1, y: 0.8 },
                colors: colors,
                zIndex: 1000,
                shapes: ['circle'],
                scalar: 1.5,
                ticks: 300
            });
            // We can even add an intermittent burst of specific shapes or extra large pieces
            if (Date.now() % 3 === 0) {
                confetti({
                    particleCount: 10,
                    angle: 90,
                    spread: 120,
                    origin: { x: 0.5, y: 1 },
                    colors: ['#FFC4C4', '#FF9B9B', '#ffd700'],
                    zIndex: 1000,
                    shapes: ['star'] // star shapes sort of look like pointy flowers!
                });
            }

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        }());
    }

    if (btnYes) btnYes.addEventListener('click', executeFinale);

    // The "No" button runs away
    if (btnNo) {
        btnNo.addEventListener('mouseover', function () {
            const container = btnNo.closest('.decision-buttons');
            const rect = container.getBoundingClientRect();

            // Generate random positions within the container
            const newX = Math.random() * (rect.width - 150); // 150 is approx button width
            const newY = (Math.random() - 0.5) * 100; // Move up or down slightly

            btnNo.style.transition = 'all 0.2s ease';
            btnNo.style.left = `${newX}px`;
            btnNo.style.transform = `translateY(${newY}px)`;
        });

        btnNo.addEventListener('click', () => {
            // Just in case they somehow press it
            btnNo.innerText = "Nice try 😜";
        });
    }
});
