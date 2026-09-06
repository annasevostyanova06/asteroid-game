let currentUser = null;
let isTransitioning = false;

function loadUsers() {
    return JSON.parse(localStorage.getItem('gameUsers')) || {};
}

function saveUsers(users) {
    localStorage.setItem('gameUsers', JSON.stringify(users));
}

function isValidUsername(username) {
    if (!username || username.length < 3 || username.length > 20) return false;
    return /^[a-zA-Z0-9_.-]+$/.test(username);
}

function isValidPassword(password) {
    if (!password || password.length < 4 || password.length > 20) return false;
    return /^[a-zA-Z0-9_.-]+$/.test(password);
}

function handleLogin() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const users = loadUsers();
    
    if (!username || !password) {
        showMessage('ENTER USERNAME AND PASSWORD');
        return;
    }
    
    if (!isValidUsername(username)) {
        showMessage('LOGIN: 3-20 chars, a-z A-Z 0-9 _ . -');
        return;
    }
    
    if (!isValidPassword(password)) {
        showMessage('PASSWORD: 4-20 chars, a-z A-Z 0-9 _ . -');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        showMessage('WELCOME, ' + username.toUpperCase() + '!');
        updateMenu();
        backToMenu();
    } else {
        showMessage('INVALID USERNAME OR PASSWORD');
    }
}

function handleRegister() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const users = loadUsers();
    
    if (!username || !password) {
        showMessage('ENTER USERNAME AND PASSWORD');
        return;
    }
    
    if (!isValidUsername(username)) {
        showMessage('LOGIN: 3-20 chars, a-z A-Z 0-9 _ . -');
        return;
    }
    
    if (!isValidPassword(password)) {
        showMessage('PASSWORD: 4-20 chars, a-z A-Z 0-9 _ . -');
        return;
    }
    
    if (users[username]) {
        showMessage('USER ALREADY EXISTS');
        return;
    }
    
    users[username] = { password: password, score: 0 };
    saveUsers(users);
    showMessage('REGISTERED! LOG IN NOW');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateMenu();
    showMessage('LOGGED OUT');
}

function showGuest() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateMenu();
    showMessage('PLAYING AS GUEST');
    backToMenu();
}

function checkAuth() {
    const saved = localStorage.getItem('currentUser');
    if (saved && loadUsers()[saved]) {
        currentUser = saved;
    }
    updateMenu();
}

function updateMenu() {
    const info = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    if (currentUser) {
        info.textContent = '👤 ' + currentUser.toUpperCase();
        logoutBtn.style.display = 'inline-block';
    } else {
        info.textContent = '👤 GUEST';
        logoutBtn.style.display = 'none';
    }
}


function switchScreen(screenName) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    const overlay = document.getElementById('fadeOverlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.remove('active');
        });
        
        const screen = document.getElementById(screenName + 'Screen');
        if (screen) screen.classList.add('active');
        
        overlay.classList.remove('active');
        isTransitioning = false;
    }, 500);
}

function showAuth() {
    switchScreen('auth');
}

function backToMenu() {
    if (isTransitioning) return;
    if (game) game.stop();
    
    const overlay = document.getElementById('fadeOverlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.remove('active');
        });
        
        const screen = document.getElementById('menuScreen');
        if (screen) screen.classList.add('active');
        
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('gameOverScreen').style.display = 'none';
        
        overlay.classList.remove('active');
        updateMenu();
        isTransitioning = false;
    }, 500);
}

function startGame() {
    if (isTransitioning) return;
    
    const overlay = document.getElementById('fadeOverlay');
    overlay.classList.add('active');
    
    setTimeout(() => {
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.remove('active');
        });
        
        const screen = document.getElementById('gameScreen');
        if (screen) screen.classList.add('active');
        
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('gameOverScreen').style.display = 'none';
        
        overlay.classList.remove('active');
        
        setTimeout(() => {
            if (game) {
                game.reset();
                game.start();
            }
        }, 300);
        
        isTransitioning = false;
    }, 500);
}

function restartGame() {
    if (isTransitioning) return;
    
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('gameOverScreen').style.display = 'none';
    
    setTimeout(() => {
        if (game) {
            game.reset();
            game.start();
        }
    }, 300);
}

function showRecords() {
    switchScreen('records');
    const users = loadUsers();
    const sorted = Object.entries(users)
        .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
        .slice(0, 10);
    
    const list = document.getElementById('recordsList');
    if (sorted.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);">NO RECORDS YET</div>';
    } else {
        list.innerHTML = sorted.map(([name, data], i) => {
            const medal = ['🥇', '🥈', '🥉'][i] || `${i+1}.`;
            return `<div style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
                <span>${medal} ${name.toUpperCase()}</span>
                <span style="color:#00ff88;">${data.score || 0}</span>
            </div>`;
        }).join('');
    }
}

function showMessage(text) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        z-index: 999;
        background: rgba(0,0,0,0.95);
        color: #ffffff;
        padding: 25px 50px;
        border: 1px solid rgba(255,255,255,0.1);
        font-family: 'VT323', monospace;
        font-size: 32px;
        text-shadow: 0 0 30px rgba(255,255,255,0.1);
        box-shadow: 0 0 60px rgba(0,0,0,0.8);
        text-align: center;
        max-width: 90%;
        animation: fadeIn 0.3s ease-out;
    `;
    el.textContent = text;
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s';
        setTimeout(() => el.remove(), 500);
    }, 2000);
}



const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const starsFar = [];
for (let i = 0; i < 200; i++) {
    starsFar.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1.5 + Math.random() * 1,
        speed: 0.2,
        brightness: 0.6 + Math.random() * 0.4
    });
}

const starsMid = [];
for (let i = 0; i < 150; i++) {
    starsMid.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 2 + Math.random() * 1.5,
        speed: 0.6,
        brightness: 0.7 + Math.random() * 0.3
    });
}

const starsNear = [];
for (let i = 0; i < 100; i++) {
    starsNear.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 3 + Math.random() * 2,
        speed: 1.2,
        brightness: 0.8 + Math.random() * 0.2
    });
}

const speedX = 0.3;
const speedY = 0.15;

function drawStars(stars, speedMultiplier) {
    stars.forEach(star => {
        star.x -= speedX * star.speed * speedMultiplier * 0.5;
        star.y -= speedY * star.speed * speedMultiplier * 0.5;

        if (star.x < 0) { star.x = canvas.width + 10; star.y = Math.random() * canvas.height; }
        if (star.x > canvas.width) { star.x = -10; star.y = Math.random() * canvas.height; }
        if (star.y < 0) { star.y = canvas.height + 10; star.x = Math.random() * canvas.width; }
        if (star.y > canvas.height) { star.y = -10; star.x = Math.random() * canvas.width; }

        const twinkle = Math.sin(Date.now() / 1500 + star.x * 50) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    });
}

function animateSpace() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars(starsFar, 0.3);
    drawStars(starsMid, 0.8);
    drawStars(starsNear, 1.5);

    requestAnimationFrame(animateSpace);
}

animateSpace();

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


class Game {
    constructor() {
        this.canvas = canvas;
        this.ctx = ctx;
        this.running = false;
        this.score = 0;
        this.lives = 3;
        this.keys = {};
        this.particles = [];
        
        this.ship = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            angle: 0,
            vx: 0,
            vy: 0,
            size: 20,
            radius: 15
        };
        
        this.bullets = [];
        this.asteroids = [];
        this.cooldown = 0;
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.shoot();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.reset();
    }
    
    reset() {
        this.score = 0;
        this.lives = 3;
        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        this.ship.x = canvas.width / 2;
        this.ship.y = canvas.height / 2;
        this.ship.vx = 0;
        this.ship.vy = 0;
        this.ship.angle = 0;
        this.cooldown = 0;
        
        for (let i = 0; i < 5; i++) {
            this.asteroids.push(this.createAsteroid());
        }
        
        document.getElementById('score').textContent = '0';
        this.updateLivesDisplay();
    }
    
    createAsteroid() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        const size = 30 + Math.random() * 30;
        const colors = ['#ff8844', '#ffaa44', '#ff6644', '#ffcc44', '#ff8844'];
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            radius: size * 0.8,
            health: 2 + Math.floor(Math.random() * 2),
            points: 8 + Math.floor(Math.random() * 6),
            angle: Math.random() * Math.PI * 2,
            rotation: (Math.random() - 0.5) * 0.03,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
    }
    
    createExplosion(x, y, count, color, speed, size) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: Math.random() * size + 2,
                life: 30 + Math.random() * 30,
                maxLife: 60,
                color: color || `hsl(${Math.random() * 60 + 20}, 100%, ${50 + Math.random() * 30}%)`
            });
        }
    }
    
    shoot() {
        if (this.cooldown > 0 || !this.running) return;
        const s = this.ship;
        this.bullets.push({
            x: s.x + Math.cos(s.angle) * s.size,
            y: s.y + Math.sin(s.angle) * s.size,
            vx: Math.cos(s.angle) * 7 + s.vx,
            vy: Math.sin(s.angle) * 7 + s.vy,
            radius: 3,
            life: 60
        });
        this.cooldown = 10;
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    }
    
    stop() {
        this.running = false;
    }
    
    updateLivesDisplay() {
        const display = document.getElementById('livesDisplay');
        display.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const ship = document.createElement('div');
            ship.className = 'life-ship';
            display.appendChild(ship);
        }
    }
    
    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
    
    update() {
        const s = this.ship;
        const canvas = this.canvas;
        
        if (this.keys['ArrowLeft'] || this.keys['a']) s.angle -= 0.05;
        if (this.keys['ArrowRight'] || this.keys['d']) s.angle += 0.05;
        if (this.keys['ArrowUp'] || this.keys['w']) {
            s.vx += Math.cos(s.angle) * 0.15;
            s.vy += Math.sin(s.angle) * 0.15;
        }
        
        s.vx *= 0.99;
        s.vy *= 0.99;
        
        const maxSpeed = 5;
        const sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (sp > maxSpeed) {
            s.vx = (s.vx / sp) * maxSpeed;
            s.vy = (s.vy / sp) * maxSpeed;
        }
        
        s.x += s.vx;
        s.y += s.vy;
        
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
        
        if (this.cooldown > 0) this.cooldown--;
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;
            if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height || b.life <= 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        for (const a of this.asteroids) {
            a.x += a.vx;
            a.y += a.vy;
            a.angle += a.rotation;
            if (a.x < 0) a.x = canvas.width;
            if (a.x > canvas.width) a.x = 0;
            if (a.y < 0) a.y = canvas.height;
            if (a.y > canvas.height) a.y = 0;
        }
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const a = this.asteroids[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < a.radius + b.radius) {
                    this.bullets.splice(i, 1);
                    a.health--;
                    if (a.health <= 0) {
                        this.createExplosion(a.x, a.y, 40, a.color, 5, 6);
                        this.asteroids.splice(j, 1);
                        this.score += 10;
                        document.getElementById('score').textContent = this.score;
                        this.asteroids.push(this.createAsteroid());
                    }
                    break;
                }
            }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            const dx = s.x - a.x;
            const dy = s.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.radius + s.radius) {
                this.createExplosion(s.x, s.y, 50, '#ffffff', 8, 8);
                this.asteroids.splice(i, 1);
                this.lives--;
                this.updateLivesDisplay();
                if (this.lives <= 0) {
                    this.saveScore();
                    this.gameOver();
                    return;
                }
                s.x = canvas.width / 2;
                s.y = canvas.height / 2;
                s.vx = 0;
                s.vy = 0;
                this.asteroids.push(this.createAsteroid());
                break;
            }
        }
    }
    
    saveScore() {
        if (currentUser) {
            const users = loadUsers();
            if (users[currentUser]) {
                const currentScore = users[currentUser].score || 0;
                if (this.score > currentScore) {
                    users[currentUser].score = this.score;
                    saveUsers(users);
                }
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        const s = this.ship;
        
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1;
        
        if (this.lives > 0) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle);
            
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            
            ctx.beginPath();
            ctx.moveTo(s.size, 0);
            ctx.lineTo(-s.size * 0.7, -s.size * 0.7);
            ctx.lineTo(-s.size * 0.3, 0);
            ctx.lineTo(-s.size * 0.7, s.size * 0.7);
            ctx.closePath();
            ctx.stroke();
            
            if (this.keys['ArrowUp'] || this.keys['w']) {
                ctx.shadowColor = '#ff8800';
                ctx.shadowBlur = 30;
                ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
                ctx.beginPath();
                ctx.moveTo(-s.size * 0.3, 0);
                ctx.lineTo(-s.size * 1.2, -6 + Math.random() * 12);
                ctx.lineTo(-s.size * 1.2, 6 + Math.random() * 12);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        for (const b of this.bullets) {
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ff2200';
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        for (const a of this.asteroids) {
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(a.angle);
            ctx.shadowColor = a.color;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = a.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i < a.points; i++) {
                const angle = (i / a.points) * Math.PI * 2;
                const r = a.size * (0.7 + Math.sin(i * 5) * 0.2);
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.shadowBlur = 0;
    }
    
    gameOver() {
        this.running = false;
        document.getElementById('finalScore').textContent = this.score;
        const overlay = document.getElementById('gameOverScreen');
        overlay.style.display = 'flex';
        overlay.classList.add('active');
        
        const h1 = overlay.querySelector('h1');
        const p = overlay.querySelector('p');
        const btns = overlay.querySelectorAll('.btn');
        
        h1.style.animation = 'none';
        p.style.animation = 'none';
        btns.forEach(b => b.style.animation = 'none');
        
        void h1.offsetWidth;
        
        h1.style.animation = 'blinkRed 0.8s ease-in-out 4';
        p.style.animation = 'fadeInWhite 0.5s ease forwards';
        p.style.animationDelay = '2.5s';
        btns.forEach((b, i) => {
            b.style.animation = 'fadeInWhite 0.5s ease forwards';
            b.style.animationDelay = `${2.8 + i * 0.2}s`;
        });
    }
}



const game = new Game();
checkAuth();

console.log('Game loaded!');