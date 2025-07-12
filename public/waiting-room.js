// public/js/waiting-room.js
class WaitingRoom {
    constructor(gameCode, isCreator, playerName = '', cardsPerPlayer = 5) {
        this.gameCode = gameCode;
        this.isCreator = isCreator;
        this.playerName = playerName;
        this.cardsPerPlayer = cardsPerPlayer;
        this.hasJoined = isCreator;
        this.submissionCount = 0;
        this.socket = io();
        
        this.initializeElements();
        this.setupEventListeners();
        this.connectSocket();
    }
    
    initializeElements() {
        // Player list elements
        this.playersList = document.getElementById('players');
        
        // Join form elements
        this.joinForm = document.getElementById('joinForm');
        this.joinSection = document.getElementById('joinSection');
        this.joinedMessage = document.getElementById('joinedMessage');
        this.playerNameInput = document.getElementById('playerName');
        
        // Submission elements
        this.submissionSection = document.getElementById('submissionSection');
        this.sentenceForm = document.getElementById('sentenceForm');
        this.sentenceInput = document.getElementById('sentenceInput');
        this.submitSentenceBtn = document.getElementById('submitSentenceBtn');
        this.submissionCountSpan = document.getElementById('submissionCount');
        this.maxSubmissionsSpan = document.getElementById('maxSubmissions');
        this.submissionComplete = document.getElementById('submissionComplete');
    }
    
    setupEventListeners() {
        if (this.joinForm) {
            this.joinForm.addEventListener('submit', (e) => this.handleJoinSubmit(e));
        }
        
        if (this.sentenceForm) {
            this.sentenceForm.addEventListener('submit', (e) => this.handleSentenceSubmit(e));
        }
    }
    
    connectSocket() {
        this.socket.on('connect', () => {
            console.log('Connected with ID:', this.socket.id);
            this.socket.emit('get players', this.gameCode);
            
            // If player has joined, show submission section and get their count
            if (this.hasJoined && this.playerName) {
                this.showSubmissionSection();
                this.socket.emit('get submission count', {
                    gameCode: this.gameCode,
                    playerName: this.playerName
                });
            }
        });
        
        this.socket.on('players list', (players) => this.updatePlayersList(players));
        this.socket.on('game updated', (data) => this.handleGameUpdate(data));
        this.socket.on('join success', (data) => this.handleJoinSuccess(data));
        this.socket.on('submission count', (data) => this.handleSubmissionCount(data));
        this.socket.on('submission success', (data) => this.handleSubmissionSuccess(data));
        this.socket.on('submission update', (data) => this.handleSubmissionUpdate(data));
        this.socket.on('error', (error) => this.handleError(error));
    }
    
    handleJoinSubmit(e) {
        e.preventDefault();
        if (this.playerNameInput.value.trim() && !this.hasJoined) {
            this.playerName = this.playerNameInput.value.trim();
            this.socket.emit('join game', {
                playerName: this.playerName,
                gameCode: this.gameCode
            });
            this.disableForm();
        }
    }
    
    handleSentenceSubmit(e) {
        e.preventDefault();
        if (this.sentenceInput.value.trim() && this.submissionCount < this.cardsPerPlayer) {
            this.socket.emit('submit sentence', {
                gameCode: this.gameCode,
                playerName: this.playerName,
                sentence: this.sentenceInput.value.trim()
            });
            this.disableSentenceForm();
        }
    }
    
    handleGameUpdate(data) {
        if (data.gameCode === this.gameCode) {
            this.updatePlayersList(data.players);
        }
    }
    
    handleJoinSuccess(data) {
        if (data.gameCode === this.gameCode) {
            this.hasJoined = true;
            this.playerName = data.playerName;
            this.showJoinedMessage();
            this.showSubmissionSection();
            
            // Get initial submission count
            this.socket.emit('get submission count', {
                gameCode: this.gameCode,
                playerName: this.playerName
            });
        }
    }
    
    handleSubmissionCount(data) {
        if (data.gameCode === this.gameCode && data.playerName === this.playerName) {
            this.submissionCount = data.count;
            this.updateSubmissionDisplay();
        }
    }
    
    handleSubmissionSuccess(data) {
        if (data.gameCode === this.gameCode && data.playerName === this.playerName) {
            this.submissionCount = data.newCount;
            this.updateSubmissionDisplay();
            this.enableSentenceForm();
            this.sentenceInput.value = ''; // Clear the form
            
            if (this.submissionCount >= data.maxCount) {
                this.showSubmissionComplete();
            }
        }
    }
    
    handleSubmissionUpdate(data) {
        if (data.gameCode === this.gameCode) {
            // Update UI to show that someone made a submission
            console.log(`${data.playerName} submitted sentence ${data.submissionCount}/${data.maxCount}`);
            // You could add visual feedback here
        }
    }
    
    handleError(error) {
        console.error('Socket error:', error);
        alert('Error: ' + error.message);
        this.enableForm();
        this.enableSentenceForm();
    }
    
    updatePlayersList(players) {
        this.playersList.innerHTML = '';
        if (players.length === 0) {
            this.addEmptyPlayersMessage();
        } else {
            players.forEach(player => this.addPlayerToList(player));
        }
    }
    
    addEmptyPlayersMessage() {
        const li = document.createElement('li');
        li.textContent = 'No players yet...';
        li.style.fontStyle = 'italic';
        li.style.color = '#666';
        this.playersList.appendChild(li);
    }
    
    addPlayerToList(player) {
        const li = document.createElement('li');
        li.textContent = player.playerName;
        if (player.isCreator) {
            li.textContent += ' (Creator)';
            li.style.fontWeight = 'bold';
            li.style.color = '#007bff';
        }
        this.playersList.appendChild(li);
    }
    
    showSubmissionSection() {
        if (this.submissionSection) {
            this.submissionSection.style.display = 'block';
        }
    }
    
    updateSubmissionDisplay() {
        if (this.submissionCountSpan) {
            this.submissionCountSpan.textContent = this.submissionCount;
        }
        if (this.maxSubmissionsSpan) {
            this.maxSubmissionsSpan.textContent = this.cardsPerPlayer;
        }
    }
    
    showSubmissionComplete() {
        if (this.sentenceForm) {
            this.sentenceForm.style.display = 'none';
        }
        if (this.submissionComplete) {
            this.submissionComplete.style.display = 'block';
        }
    }
    
    disableForm() {
        if (this.joinForm) {
            this.joinForm.style.opacity = '0.5';
            this.playerNameInput.disabled = true;
            this.joinForm.querySelector('button').disabled = true;
        }
    }
    
    enableForm() {
        if (this.joinForm) {
            this.joinForm.style.opacity = '1';
            this.playerNameInput.disabled = false;
            this.joinForm.querySelector('button').disabled = false;
        }
    }
    
    disableSentenceForm() {
        if (this.sentenceInput) this.sentenceInput.disabled = true;
        if (this.submitSentenceBtn) this.submitSentenceBtn.disabled = true;
        if (this.sentenceForm) this.sentenceForm.style.opacity = '0.5';
    }
    
    enableSentenceForm() {
        if (this.sentenceInput) this.sentenceInput.disabled = false;
        if (this.submitSentenceBtn) this.submitSentenceBtn.disabled = false;
        if (this.sentenceForm) this.sentenceForm.style.opacity = '1';
    }
    
    showJoinedMessage() {
        if (this.joinSection) this.joinSection.style.display = 'none';
        if (this.joinedMessage) this.joinedMessage.style.display = 'block';
    }
}