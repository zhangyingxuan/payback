import * as THREE from 'three';

// 游戏状态
const state = {
    merit: 0,
    mode: 'normal', // normal, challenge, meditation
    isChallengeActive: false,
    challengeTime: 30,
    challengeTimer: null,
    meditationInterval: null,
    unlocked: {
        sound_deep: false,
        effect_gold: false
    },
    settings: {
        soundType: 'default', // default, deep
        effectType: 'star',   // star, gold
        soundEnabled: true
    }
};

// DOM 元素
const elements = {
    meritCount: document.getElementById('merit-count'),
    container: document.getElementById('floating-text-container'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    modeIndicator: document.getElementById('mode-indicator'),
    storeBtn: document.getElementById('store-btn'),
    storeModal: document.getElementById('store-modal'),
    closeStoreBtn: document.getElementById('close-store'),
    buyBtns: document.querySelectorAll('.buy-btn'),
    challengeModal: document.getElementById('challenge-modal'),
    challengeScore: document.getElementById('challenge-score'),
    closeChallengeBtn: document.getElementById('close-challenge'),
    timerDisplay: document.getElementById('timer-display'),
    timeLeft: document.getElementById('time-left'),
    soundToggle: document.getElementById('sound-toggle'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings'),
    resetSettingsBtn: document.getElementById('reset-settings-btn'),
    settingOptions: document.querySelectorAll('.setting-option'),
    optSoundDeep: document.getElementById('opt-sound-deep'),
    optEffectGold: document.getElementById('opt-effect-gold'),
    canvasContainer: document.getElementById('canvas-container')
};

// Three.js 变量
let scene, camera, renderer;
let fishGroup, fishBody, malletGroup;
let raycaster, mouse;
let particles = [];
let isAnimating = true;
let mousePlane; // 辅助平面
let isStriking = false; // 是否正在敲击
let malletHoverOffset = new THREE.Vector3(1.5, 2.5, 1.0); // 悬停偏移 (右手持握)

// 音频上下文
let audioCtx;

// 初始化音频
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// 播放声音
function playSound(pitchMod = 1.0) {
    if (!state.settings.soundEnabled) return;
    initAudio();

    const t = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // 音色配置
    if (state.settings.soundType === 'deep') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200 * pitchMod, t);
        oscillator.frequency.exponentialRampToValueAtTime(100 * pitchMod, t + 0.15);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
    } else {
        // 默认清脆音
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800 * pitchMod, t);
        oscillator.frequency.exponentialRampToValueAtTime(300 * pitchMod, t + 0.1);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t);
    }

    // 包络
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.8, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(t);
    oscillator.stop(t + 0.3);
}

// 初始化 3D 场景
function init3D() {
    // 场景
    scene = new THREE.Scene();
    // 雾效，增加深度感
    scene.fog = new THREE.FogExp2(0x1c1917, 0.02); // stone-900

    // 相机
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);

    // 渲染器
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    elements.canvasContainer.appendChild(renderer.domElement);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 补光
    const rimLight = new THREE.PointLight(0xfbbf24, 0.8); // amber
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    // 创建木鱼
    createFish();

    // 创建木槌
    createMallet();

    // 创建辅助平面用于鼠标跟随 (y=1.5 大概是木鱼表面高度)
    mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5);

    // 交互
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchstart', onTouchStart, { passive: false });

    // 动画循环
    animate();
}

function createFish() {
    fishGroup = new THREE.Group();

    // 材质 - 卡通风格
    const toonMaterial = new THREE.MeshToonMaterial({
        color: 0xfbbf24, // amber-400
        gradientMap: null // 默认卡通着色
    });

    // 1. 主体 (扁球体)
    const bodyGeo = new THREE.SphereGeometry(1.5, 64, 64);
    fishBody = new THREE.Mesh(bodyGeo, toonMaterial);
    fishBody.scale.set(1, 0.75, 1);
    fishBody.castShadow = true;
    fishBody.receiveShadow = true;
    fishGroup.add(fishBody);

    // 2. 开口 (黑色胶囊体模拟)
    const mouthGeo = new THREE.CapsuleGeometry(0.2, 1.8, 4, 16);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 }); // stone-900
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.z = Math.PI / 2;
    mouth.position.set(0, 0, 1.1); // 放在前面
    // 使用CSG太复杂，直接嵌入一个黑色物体模拟开口
    // 稍微调整形状以贴合表面
    mouth.scale.set(1, 1, 0.5);
    fishGroup.add(mouth);

    // 3. 把手 (顶部圆柱)
    const handleGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 32);
    const handle = new THREE.Mesh(handleGeo, toonMaterial);
    handle.position.set(0, 1.1, 0); // 放在顶部
    handle.castShadow = true;
    fishGroup.add(handle);

    // 4. 眼睛 (装饰)
    const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.8, 0.3, 1.1);
    fishGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.8, 0.3, 1.1);
    fishGroup.add(rightEye);

    scene.add(fishGroup);
}

function createMallet() {
    malletGroup = new THREE.Group();

    // 木槌材质
    const woodMat = new THREE.MeshToonMaterial({ color: 0x78350f }); // amber-900
    const headMat = new THREE.MeshToonMaterial({ color: 0xd97706 }); // amber-600

    // 1. 手柄
    const handleGeo = new THREE.CylinderGeometry(0.08, 0.1, 3, 16);
    const handle = new THREE.Mesh(handleGeo, woodMat);
    handle.position.set(0, -1.5, 0);
    handle.castShadow = true;
    malletGroup.add(handle);

    // 2. 槌头
    const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0, 0); // 槌头在原点，方便旋转
    head.castShadow = true;
    malletGroup.add(head);

    // 初始位置
    malletGroup.position.set(2, 2, 2);
    malletGroup.rotation.z = Math.PI / 4;
    
    scene.add(malletGroup);
}

// 粒子系统
function createParticles(position, color) {
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(position.x, position.y, position.z);
        // 随机速度向外扩散
        velocities.push(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2 + 0.2, // 稍微向上
            (Math.random() - 0.5) * 0.2
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: color,
        size: 0.2,
        transparent: true,
        opacity: 1
    });

    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { velocities: velocities, age: 0 };
    scene.add(particleSystem);
    particles.push(particleSystem);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // 归一化鼠标坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 射线检测平面，获取精确的 3D 坐标
    raycaster.setFromCamera(mouse, camera);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(mousePlane, target);

    if (target) {
        // 限制范围，不要跑太远
        target.clamp(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5));
        
        // 更新木槌目标位置 (悬停状态)
        if (!isStriking && malletGroup) {
            const hoverPos = target.clone().add(malletHoverOffset);
            malletGroup.userData.targetPos = hoverPos;
            
            // 让木槌稍微朝向目标点旋转
            // 默认旋转是 z = PI/4
            // 我们可以根据 x 位置微调 z 轴旋转
            malletGroup.userData.targetRotZ = Math.PI / 4 - (target.x * 0.05);
        }
    }
}

function onMouseDown(event) {
    if (state.mode === 'meditation') return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    checkIntersection(event.clientX, event.clientY);
}

function onTouchStart(event) {
    if (event.touches.length > 0) {
        event.preventDefault();
        if (state.mode === 'meditation') return;
        
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        checkIntersection(touch.clientX, touch.clientY);
    }
}

function checkIntersection(clientX, clientY) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(fishGroup.children);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        knock(point, clientX, clientY);
    }
}

function knock(point3D, screenX, screenY) {
    if (isStriking) return;
    isStriking = true;

    // 1. 声音变调
    const dist = Math.sqrt(point3D.x * point3D.x + point3D.z * point3D.z);
    const pitchMod = 1.0 + (dist / 1.5) * 0.2;
    playSound(pitchMod);

    // 2. 木鱼动画 (挤压)
    const originalScale = new THREE.Vector3(1, 0.75, 1);
    const squashScale = new THREE.Vector3(1.1, 0.65, 1.1);
    
    let startTime = null;
    const duration = 150;

    function animateSquash(time) {
        if (!startTime) startTime = time;
        const squashProgress = (time - startTime) / duration;

        if (squashProgress < 0.5) {
            fishBody.scale.lerpVectors(originalScale, squashScale, squashProgress * 2);
        } else if (squashProgress < 1) {
            fishBody.scale.lerpVectors(squashScale, originalScale, (squashProgress - 0.5) * 2);
        } else {
            fishBody.scale.copy(originalScale);
            return;
        }
        requestAnimationFrame(animateSquash);
    }
    requestAnimationFrame(animateSquash);

    // 3. 木槌动画 (敲击) - 优化版
    const startPos = malletGroup.position.clone();
    const startRot = malletGroup.rotation.z;
    
    // 目标敲击位置 (槌头半径 0.4，所以要抬高一点)
    const hitPos = point3D.clone().add(new THREE.Vector3(0, 0.4, 0));
    // 敲击时的旋转角度 (放平一点)
    const hitRot = 0; 

    let malletStartTime = null;
    const strikeDuration = 60; // 下砸时间 (更短更用力)
    const returnDuration = 120; // 回弹时间

    function animateMallet(time) {
        if (!malletStartTime) malletStartTime = time;
        const elapsed = time - malletStartTime;
        
        if (elapsed < strikeDuration) {
            // 下砸阶段 (EaseIn)
            const strikeProgress = elapsed / strikeDuration;
            const easeT = strikeProgress * strikeProgress; // Quad Ease In
            
            malletGroup.position.lerpVectors(startPos, hitPos, easeT);
            malletGroup.rotation.z = startRot + (hitRot - startRot) * easeT;
            
            requestAnimationFrame(animateMallet);
        } else if (elapsed < strikeDuration + returnDuration) {
            // 回弹阶段 (EaseOut)
            const returnProgress = (elapsed - strikeDuration) / returnDuration;
            const easeT = 1 - Math.pow(1 - returnProgress, 3); // Cubic Ease Out
            
            // 回弹到悬停位置
            const returnTargetPos = malletGroup.userData.targetPos || startPos;
            const returnTargetRot = malletGroup.userData.targetRotZ || Math.PI / 4;

            malletGroup.position.lerpVectors(hitPos, returnTargetPos, easeT);
            malletGroup.rotation.z = hitRot + (returnTargetRot - hitRot) * easeT;
            
            requestAnimationFrame(animateMallet);
        } else {
            isStriking = false;
        }
    }
    requestAnimationFrame(animateMallet);

    // 4. 粒子特效
    const color = state.settings.effectType === 'gold' ? 0xffd700 : 0xffffff;
    createParticles(point3D, color);

    // 5. 游戏逻辑
    state.merit++;
    spawnFloatingText(screenX, screenY);
    updateUI();
}

// 飘字逻辑 (保留DOM方式，因为文字在3D中处理较麻烦且不如DOM清晰)
function spawnFloatingText(x, y, text = '功德 +1') {
    const el = document.createElement('div');
    el.className = 'float-text text-2xl font-bold';
    el.textContent = text;
    
    if (state.settings.effectType === 'gold') {
        el.classList.add('text-yellow-300');
        el.style.textShadow = '0 0 10px gold';
    } else {
        el.classList.add('text-white');
    }

    // 如果没有传入坐标（例如自动敲击），则默认在屏幕中心
    if (!x || !y) {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
    }

    const offsetX = (Math.random() - 0.5) * 40;
    el.style.left = `${x + offsetX}px`;
    el.style.top = `${y - 50}px`;

    elements.container.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 1500);
}

function animate() {
    requestAnimationFrame(animate);

    // 木鱼自转 (缓慢)
    if (fishGroup) {
        fishGroup.rotation.y += 0.002;
    }

    // 木槌跟随逻辑
    if (malletGroup && !isStriking && malletGroup.userData.targetPos) {
        // 平滑跟随
        malletGroup.position.lerp(malletGroup.userData.targetPos, 0.15); // 稍微加快跟随速度
        
        // 平滑旋转
        const targetRot = malletGroup.userData.targetRotZ || Math.PI / 4;
        malletGroup.rotation.z += (targetRot - malletGroup.rotation.z) * 0.1;
    }

    // 粒子动画
    for (let i = particles.length - 1; i >= 0; i--) {
        const sys = particles[i];
        const positions = sys.geometry.attributes.position.array;
        const vels = sys.userData.velocities;
        
        sys.userData.age += 1;
        
        for (let j = 0; j < positions.length / 3; j++) {
            positions[j * 3] += vels[j * 3];
            positions[j * 3 + 1] += vels[j * 3 + 1];
            positions[j * 3 + 2] += vels[j * 3 + 2];
            
            // 重力
            vels[j * 3 + 1] -= 0.01;
        }
        
        sys.geometry.attributes.position.needsUpdate = true;
        sys.material.opacity = 1 - (sys.userData.age / 60); // 60帧淡出

        if (sys.userData.age > 60) {
            scene.remove(sys);
            particles.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

// UI 更新逻辑 (保留原有逻辑)
function updateUI() {
    elements.meritCount.textContent = state.merit;
    localStorage.setItem('merit', state.merit);
    localStorage.setItem('settings', JSON.stringify(state.settings));
    
    elements.buyBtns.forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        const item = btn.dataset.item;
        
        if (state.unlocked[item]) {
            btn.textContent = '已拥有';
            btn.disabled = true;
            btn.classList.replace('bg-amber-600', 'bg-stone-600');
            btn.classList.replace('hover:bg-amber-500', 'hover:bg-stone-600');
        } else if (state.merit >= cost) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    if (state.unlocked.sound_deep) {
        elements.optSoundDeep.disabled = false;
        elements.optSoundDeep.textContent = '深山古刹';
    }
    if (state.unlocked.effect_gold) {
        elements.optEffectGold.disabled = false;
        elements.optEffectGold.textContent = '佛光普照';
    }

    elements.settingOptions.forEach(opt => {
        const type = opt.dataset.type;
        const value = opt.dataset.value;
        
        if (type === 'sound') {
            if (value === state.settings.soundType) opt.classList.add('active');
            else opt.classList.remove('active');
        } else if (type === 'effect') {
            if (value === state.settings.effectType) opt.classList.add('active');
            else opt.classList.remove('active');
        }
    });
}

// 模式切换
function setMode(mode) {
    state.mode = mode;
    clearInterval(state.challengeTimer);
    clearInterval(state.meditationInterval);
    state.isChallengeActive = false;
    elements.timerDisplay.classList.add('hidden');
    
    elements.modeBtns.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    switch (mode) {
        case 'normal':
            elements.modeIndicator.textContent = '普通模式 - 随心敲击';
            break;
        case 'challenge':
            elements.modeIndicator.textContent = '挑战模式 - 限时积攒';
            startChallenge();
            break;
        case 'meditation':
            elements.modeIndicator.textContent = '冥想模式 - 自动修行';
            startMeditation();
            break;
    }
}

function startChallenge() {
    state.isChallengeActive = true;
    let timeLeft = 30;
    let startMerit = state.merit;
    
    elements.timerDisplay.classList.remove('hidden');
    elements.timeLeft.textContent = timeLeft;

    state.challengeTimer = setInterval(() => {
        timeLeft--;
        elements.timeLeft.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(state.challengeTimer);
            state.isChallengeActive = false;
            const score = state.merit - startMerit;
            elements.challengeScore.textContent = score;
            elements.challengeModal.classList.remove('hidden');
            setMode('normal');
        }
    }, 1000);
}

function startMeditation() {
    state.meditationInterval = setInterval(() => {
        // 自动敲击中心
        knock(new THREE.Vector3(0, 1, 0), window.innerWidth/2, window.innerHeight/2);
    }, 2000);
}

function buyItem(item, cost) {
    if (state.merit >= cost && !state.unlocked[item]) {
        state.merit -= cost;
        state.unlocked[item] = true;
        if (item === 'sound_deep') state.settings.soundType = 'deep';
        else if (item === 'effect_gold') state.settings.effectType = 'gold';
        localStorage.setItem('unlocked', JSON.stringify(state.unlocked));
        updateUI();
    }
}

function toggleSettings(show) {
    if (show) {
        elements.settingsModal.classList.remove('hidden');
        setTimeout(() => {
            elements.settingsModal.classList.remove('opacity-0');
            document.getElementById('settings-content').classList.remove('scale-95');
            document.getElementById('settings-content').classList.add('scale-100');
        }, 10);
    } else {
        elements.settingsModal.classList.add('opacity-0');
        document.getElementById('settings-content').classList.remove('scale-100');
        document.getElementById('settings-content').classList.add('scale-95');
        setTimeout(() => {
            elements.settingsModal.classList.add('hidden');
        }, 300);
    }
    updateUI();
}

function resetSettings() {
    if (confirm('确定要恢复默认设置吗？')) {
        state.settings.soundType = 'default';
        state.settings.effectType = 'star';
        state.settings.soundEnabled = true;
        updateUI();
        toggleSettings(false);
    }
}

// 绑定UI事件
elements.modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
elements.storeBtn.addEventListener('click', () => {
    elements.storeModal.classList.remove('hidden');
    setTimeout(() => {
        elements.storeModal.classList.remove('opacity-0');
        document.getElementById('store-content').classList.remove('scale-95');
        document.getElementById('store-content').classList.add('scale-100');
    }, 10);
    updateUI();
});
elements.closeStoreBtn.addEventListener('click', () => {
    elements.storeModal.classList.add('opacity-0');
    document.getElementById('store-content').classList.remove('scale-100');
    document.getElementById('store-content').classList.add('scale-95');
    setTimeout(() => elements.storeModal.classList.add('hidden'), 300);
});
elements.buyBtns.forEach(btn => btn.addEventListener('click', () => buyItem(btn.dataset.item, parseInt(btn.dataset.cost))));
elements.closeChallengeBtn.addEventListener('click', () => elements.challengeModal.classList.add('hidden'));
elements.soundToggle.addEventListener('click', () => {
    state.settings.soundEnabled = !state.settings.soundEnabled;
    elements.soundToggle.innerHTML = state.settings.soundEnabled ? 
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>`;
});
elements.settingsBtn.addEventListener('click', () => toggleSettings(true));
elements.closeSettingsBtn.addEventListener('click', () => toggleSettings(false));
elements.resetSettingsBtn.addEventListener('click', resetSettings);
elements.settingOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        if (opt.disabled) return;
        const type = opt.dataset.type;
        const value = opt.dataset.value;
        if (type === 'sound') state.settings.soundType = value;
        if (type === 'effect') state.settings.effectType = value;
        updateUI();
    });
});

// 初始化
function init() {
    const savedMerit = localStorage.getItem('merit');
    if (savedMerit) state.merit = parseInt(savedMerit);
    
    const savedUnlocked = localStorage.getItem('unlocked');
    if (savedUnlocked) state.unlocked = JSON.parse(savedUnlocked);

    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) state.settings = JSON.parse(savedSettings);

    updateUI();
    init3D();
}

init();