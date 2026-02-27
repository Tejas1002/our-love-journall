
document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Login Sequence ---
    const loginScreen = document.getElementById('login-screen');
    const loginBtn = document.getElementById('login-btn');
    const secretPassword = document.getElementById('secret-password');
    const loginError = document.getElementById('login-error');

    // Acceptable cute passwords
    const validPasswords = ['iloveyou', 'i love you', 'forever', 'cutie', 'always'];

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const val = secretPassword.value.toLowerCase().trim();
            if (validPasswords.includes(val)) {
                // Success! Fade out login
                loginScreen.style.opacity = '0';
                setTimeout(() => {
                    loginScreen.style.visibility = 'hidden';
                    loginScreen.style.display = 'none';
                    // Little confetti pop on unlock
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 }, colors: ['#FFC4C4', '#ffffff', '#FF9B9B'] });
                }, 1000);
            } else {
                // Shake and show error
                secretPassword.classList.add('chosen-wrong');
                loginError.classList.remove('hidden');
                setTimeout(() => {
                    secretPassword.classList.remove('chosen-wrong');
                    loginError.classList.add('hidden');
                }, 1500);
            }
        });

        secretPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

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

    // --- 3.5 The Love Jar (NEW FUNCTIONALITY) ---
    const loveJar = document.getElementById('love-jar');
    const pulledNote = document.getElementById('pulled-note');
    const noteText = document.getElementById('note-text');

    const loveReasons = [
        "Your smile lights up my entire world. ✨",
        "You always know exactly how to make me laugh.",
        "The way your eyes sparkle when you talk about things you love.",
        "Your hugs feel like home. 🏡",
        "You are my biggest supporter and my best friend.",
        "I love the way you wrinkle your nose when you're thinking. 🥺",
        "Even doing absolutely nothing is fun when I'm with you.",
        "You have the kindest heart of anyone I know. 💖",
        "I just love everything about you, forever.",
        "You make me a better person every single day."
    ];

    if (loveJar) {
        loveJar.addEventListener('click', () => {
            // Popping animation on click
            loveJar.classList.remove('pulse');
            loveJar.style.transform = 'scale(0.9) rotate(-3deg)';
            setTimeout(() => { loveJar.style.transform = ''; }, 150);

            // Pop some confetti out of the jar opening
            const rect = loveJar.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top) / window.innerHeight;

            confetti({
                particleCount: 25,
                spread: 50,
                origin: { x, y: y },
                colors: ['#FFC4C4', '#ffffff', '#FF9B9B'],
                startVelocity: 15,
                gravity: 0.8
            });

            // Hide the old note if any
            pulledNote.classList.remove('show');

            // Show new one after a tiny delay
            setTimeout(() => {
                const randomReason = loveReasons[Math.floor(Math.random() * loveReasons.length)];
                noteText.innerText = randomReason;
                pulledNote.classList.add('show');
            }, 300);
        });
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

    // --- 5.5 Date Night Wheel ---
    const spinBtn = document.getElementById('spin-btn');
    const dateWheel = document.getElementById('date-wheel');
    const spinResult = document.getElementById('spin-result');
    let isSpinning = false;

    // The options on the wheel
    const dateOptions = [
        "Movie Night 🍿",
        "Stargazing ✨",
        "Cook Dinner 🍳",
        "Cuddles 🥰",
        "Surprise 🎁",
        "Game Night 🎮"
    ];

    if (spinBtn && dateWheel) {
        spinBtn.addEventListener('click', () => {
            if (isSpinning) return;
            isSpinning = true;
            spinResult.classList.add('hidden');

            // Randomly select one of the 6 options (0 to 5)
            const selectedIdx = Math.floor(Math.random() * 6);

            // Calculate degrees. Each slice is 60 degrees.
            // We want the selected slice to be at the TOP (pointer is at the top).
            // Initially, slice 0 is at bottom-right.
            // Adjusting rotation so selectedIdx lands perfectly under the pointer:
            // This math might need slight tweaking, but basically spin full 5 times (1800deg)
            // Plus offset for the specific slice. 
            // Since Slice 0 centers at ~330 deg to be at the top, we rotate by +30 deg:
            const sliceDegree = 60;
            const extraSpins = 360 * 5;
            const offset = - (selectedIdx * sliceDegree) + 30; // Perfect alignment!

            const totalDegree = extraSpins + offset;

            dateWheel.style.transform = `rotate(${totalDegree}deg)`;

            setTimeout(() => {
                isSpinning = false;
                spinResult.innerHTML = `Let's go for:<br><span style="color: var(--accent-pink); font-size: 2.5rem">${dateOptions[selectedIdx]}</span>`;
                spinResult.classList.remove('hidden');

                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ['#FFC4C4', '#DCEbd2', '#ffffff']
                });
            }, 4000); // Matches the 4s CSS transition
        });
    }

    // --- 5.8 Love Coupons Logic ---
    const coupons = document.querySelectorAll('.coupon');
    coupons.forEach(coupon => {
        coupon.addEventListener('click', () => {
            if (!coupon.classList.contains('redeemed')) {
                coupon.classList.add('redeemed');
                coupon.classList.remove('pulse');

                // Small confetti pop
                const rect = coupon.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;

                confetti({
                    particleCount: 30,
                    spread: 40,
                    origin: { x, y },
                    colors: ['#A02B2B', '#FFC4C4']
                });
            }
        });
    });

    // --- 7. Interactive Ring Drag Proposal ---
    const theRing = document.getElementById('draggable-ring');
    const ringDropzone = document.getElementById('ring-dropzone');
    const proposalZone = document.getElementById('proposal-zone');
    const dragInstruction = document.getElementById('drag-instruction');
    const proposalContent = document.getElementById('proposal-content');

    // The Cinematic Finale Logic
    function unlockProposal() {
        proposalContent.classList.remove('hidden');

        // Massive cute confetti explosion
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFC4C4', '#FF9B9B', '#ffffff'] });

        // Fade in subtext and run the literal finale
        const proposalSubtext = document.getElementById('proposal-subtext');

        setTimeout(() => {
            proposalSubtext.classList.add('show');
            executeFinale();
        }, 1500);
    }

    function executeFinale() {
        // Continuous confetti celebration
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;

        // Function to create DOM butterflies
        function createButterfly() {
            const butterfly = document.createElement('div');
            butterfly.classList.add('butterfly');
            butterfly.innerText = '🦋';

            // Randomize starting X position a bit, left or right
            const startX = Math.random() < 0.5 ? (Math.random() * 20 - 10) + '%' : (Math.random() * 20 + 90) + '%';
            butterfly.style.left = startX;

            // Randomize animation duration and delay slightly
            const animDuration = 3 + Math.random() * 2;
            butterfly.style.animationDuration = `${animDuration}s`;

            // Randomize size
            const startScale = 0.5 + Math.random() * 1.5;
            butterfly.style.transform = `scale(${startScale})`;

            document.body.appendChild(butterfly);

            // Remove after animation completes
            setTimeout(() => {
                butterfly.remove();
            }, animDuration * 1000);
        }

        // Spawn a batch of butterflies initially
        for (let i = 0; i < 30; i++) {
            setTimeout(createButterfly, Math.random() * 2000);
        }

        (function frame() {
            // Standard Confetti while butterflies fly
            confetti({
                particleCount: 15,
                angle: 60,
                spread: 70,
                origin: { x: 0, y: 0.8 },
                colors: ['#FFC4C4', '#DCEbd2', '#ffffff', '#FF9B9B', '#ffd700'],
                zIndex: 1000
            });
            confetti({
                particleCount: 15,
                angle: 120,
                spread: 70,
                origin: { x: 1, y: 0.8 },
                colors: ['#FFC4C4', '#DCEbd2', '#ffffff', '#FF9B9B', '#ffd700'],
                zIndex: 1000
            });

            // Continuously spawn more butterflies during the 5 second loop
            if (Math.random() > 0.7) {
                createButterfly();
            }

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        }());
    }

    if (theRing && ringDropzone) {
        let isDragging = false;
        let startX, startY;
        let initialLeft = 0;
        let initialTop = 0;

        function onDragStart(e) {
            isDragging = true;
            theRing.style.transition = 'none'; // remove pulse/snap transition during drag
            theRing.classList.remove('pulse');

            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }

            // Get current transform
            const style = window.getComputedStyle(theRing);
            const matrix = new DOMMatrixReadOnly(style.transform);
            initialLeft = matrix.m41;
            initialTop = matrix.m42;
        }

        function onDragMove(e) {
            if (!isDragging) return;
            e.preventDefault(); // prevent scrolling while dragging ring

            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const dx = clientX - startX;
            const dy = clientY - startY;

            theRing.style.transform = `translate(${initialLeft + dx}px, ${initialTop + dy}px)`;

            // Check collision with dropzone
            const ringRect = theRing.getBoundingClientRect();
            const dropRect = ringDropzone.getBoundingClientRect();

            if (
                ringRect.left < dropRect.right &&
                ringRect.right > dropRect.left &&
                ringRect.top < dropRect.bottom &&
                ringRect.bottom > dropRect.top
            ) {
                ringDropzone.classList.add('highlight');
            } else {
                ringDropzone.classList.remove('highlight');
            }
        }

        function onDragEnd(e) {
            if (!isDragging) return;
            isDragging = false;

            const ringRect = theRing.getBoundingClientRect();
            const dropRect = ringDropzone.getBoundingClientRect();

            if (
                ringRect.left < dropRect.right &&
                ringRect.right > dropRect.left &&
                ringRect.top < dropRect.bottom &&
                ringRect.bottom > dropRect.top
            ) {
                // Success! Snap to finger perfectly
                ringDropzone.classList.remove('highlight');
                theRing.classList.add('snapped');
                theRing.classList.add('ring-accepted');

                // Snap visually
                const dx = dropRect.left - ringRect.left + (dropRect.width - ringRect.width) / 2;
                const dy = dropRect.top - ringRect.top + (dropRect.height - ringRect.height) / 2;

                const style = window.getComputedStyle(theRing);
                const matrix = new DOMMatrixReadOnly(style.transform);
                theRing.style.transform = `translate(${matrix.m41 + dx}px, ${matrix.m42 + dy}px)`;

                // Small victory pop
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#ffd700', '#ffffff', '#FF9B9B'] });

                // Trigger cinematic proposal unlock after the bounce animation finishes
                setTimeout(() => {
                    proposalZone.style.opacity = '0';
                    dragInstruction.style.opacity = '0';
                    setTimeout(() => {
                        proposalZone.style.display = 'none';
                        dragInstruction.style.display = 'none';
                        unlockProposal();
                    }, 500);
                }, 1200);

            } else {
                // Return to original position nicely
                theRing.classList.add('snapped');
                theRing.style.transform = `translate(0px, 0px)`;
                setTimeout(() => {
                    theRing.classList.remove('snapped');
                    theRing.classList.add('pulse');
                }, 500);
            }
        }

        theRing.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove, { passive: false });
        window.addEventListener('mouseup', onDragEnd);

        theRing.addEventListener('touchstart', onDragStart, { passive: false });
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragEnd);
    }
});
