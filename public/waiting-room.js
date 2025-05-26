// public/js/waiting-room.js
class WaitingRoom {
    constructor(gameCode, isCreator) {
        this.gameCode = gameCode;
        this.isCreator = isCreator;
        this.hasJoined = isCreator;
        this.socket = io();
        
        this.initializeElements();
        this.setupEventListeners();
        this.connectSocket();
    }
    
    initializeElements() {
        this.playersList = document.getElementById('players');
        this.joinForm = document.getElementById('joinForm');
        this.joinSection = document.getElementById('joinSection');
        this.joinedMessage = document.getElementById('joinedMessage');
        this.playerNameInput = document.getElementById('playerName');
    }
    
    setupEventListeners() {
        if (this.joinForm) {
            this.joinForm.addEventListener('submit', (e) => this.handleJoinSubmit(e));
        }
    }
    
    connectSocket() {
        this.socket.on('connect', () => {
            console.log('Connected with ID:', this.socket.id);
            this.socket.emit('get players', this.gameCode);
        });
        
        this.socket.on('players list', (players) => this.updatePlayersList(players));
        this.socket.on('game updated', (data) => this.handleGameUpdate(data));
        this.socket.on('join success', (data) => this.handleJoinSuccess(data));
        this.socket.on('error', (error) => this.handleError(error));
    }
    
    handleJoinSubmit(e) {
        e.preventDefault();
        if (this.playerNameInput.value.trim() && !this.hasJoined) {
            this.socket.emit('join game', {
                playerName: this.playerNameInput.value.trim(),
                gameCode: this.gameCode
            });
            this.disableForm();
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
            this.showJoinedMessage();
        }
    }
    
    handleError(error) {
        console.error('Socket error:', error);
        alert('Error: ' + error.message);
        this.enableForm();
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
    
    showJoinedMessage() {
        if (this.joinSection) this.joinSection.style.display = 'none';
        if (this.joinedMessage) this.joinedMessage.style.display = 'block';
    }
}