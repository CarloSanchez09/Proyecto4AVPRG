let player1Pokemon = null;
let player2Pokemon = null;
let player1Inventory = [];
let player2Inventory = [];
let player1Victories = 0;
let player2Victories = 0;
let currentTurn = null;

// Datos locales de Pokémon como fallback
const pokemonData = {
    1: {
        id: 1,
        name: "Bulbasaur",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        hp: 45,
        maxHp: 45,
        attack: 49,
        defense: 49,
        speed: 45,
        types: "grass, poison",
        abilities: getAbilitiesByType(["grass", "poison"])
    },
    5: {
        id: 5,
        name: "Charmeleon",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
        hp: 58,
        maxHp: 58,
        attack: 64,
        defense: 58,
        speed: 65,
        types: "fire",
        abilities: getAbilitiesByType(["fire"])
    },
    25: {
        id: 25,
        name: "Pikachu",
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
        hp: 35,
        maxHp: 35,
        attack: 55,
        defense: 40,
        speed: 90,
        types: "electric",
        abilities: getAbilitiesByType(["electric"])
    }
};

const typeChart = {
    fire: {
        strongAgainst: ['grass', 'bug', 'ice', 'steel'],
        weakAgainst: ['water', 'rock', 'dragon'],
        immune: []
    },
    water: {
        strongAgainst: ['fire', 'ground', 'rock'],
        weakAgainst: ['grass', 'electric', 'dragon'],
        immune: []
    },
    grass: {
        strongAgainst: ['water', 'ground', 'rock'],
        weakAgainst: ['fire', 'bug', 'dragon', 'flying', 'poison'],
        immune: []
    },
    electric: {
        strongAgainst: ['water', 'flying'],
        weakAgainst: ['grass', 'dragon', 'electric'],
        immune: ['ground']
    },
    poison: {
        strongAgainst: ['grass', 'fairy'],
        weakAgainst: ['ground', 'psychic'],
        immune: []
    }
};

const typeAbilities = {
    fire: [
        { name: "Lanzallamas", damage: 15, type: "fire", accuracy: 100 },
        { name: "Ascuas", damage: 10, type: "fire", accuracy: 100 },
        { name: "Llamarada", damage: 20, type: "fire", accuracy: 85 }
    ],
    water: [
        { name: "Hidrobomba", damage: 20, type: "water", accuracy: 80 },
        { name: "Burbuja", damage: 10, type: "water", accuracy: 100 },
        { name: "Pistola Agua", damage: 15, type: "water", accuracy: 100 }
    ],
    grass: [
        { name: "Latigazo", damage: 15, type: "grass", accuracy: 100 },
        { name: "Hoja Afilada", damage: 10, type: "grass", accuracy: 95 },
        { name: "Rayo Solar", damage: 20, type: "grass", accuracy: 100 }
    ],
    electric: [
        { name: "Impactrueno", damage: 15, type: "electric", accuracy: 100 },
        { name: "Trueno", damage: 20, type: "electric", accuracy: 70 },
        { name: "Chispazo", damage: 10, type: "electric", accuracy: 100 }
    ],
    poison: [
        { name: "Veneno Líquido", damage: 15, type: "poison", accuracy: 100 },
        { name: "Ataque Ácido", damage: 10, type: "poison", accuracy: 95 },
        { name: "Lanzamiento Tóxico", damage: 20, type: "poison", accuracy: 85 }
    ]
};

function getAbilitiesByType(types) {
    const abilities = new Set();
    types.forEach(type => {
        const typeAbs = typeAbilities[type] || [
            { name: "Tackle", damage: 10, type: "normal", accuracy: 100 },
            { name: "Arañazo", damage: 8, type: "normal", accuracy: 100 }
        ];
        typeAbs.forEach(ability => abilities.add(JSON.stringify(ability)));
    });
    return Array.from(abilities).map(JSON.parse);
}

async function fetchPokemonData(pokemonId) {
    try {
        console.log(`Intentando buscar Pokémon con ID: ${pokemonId}`);
        const id = parseInt(pokemonId);
        if (isNaN(id) || id < 1 || id > 1010) {
            throw new Error('ID inválido. Usa un número entre 1 y 1010.');
        }
        console.log('Haciendo solicitud a la API...');
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        console.log(`Respuesta de la API: ${response.status}`);
        if (!response.ok) throw new Error(`Código de estado: ${response.status} - Pokémon no encontrado`);
        const data = await response.json();
        console.log('Datos recibidos de la API:', data);
        const types = data.types.map(type => type.type.name);
        
        return {
            id: data.id,
            name: data.name,
            image: data.sprites.front_default || 'placeholder.png',
            hp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
            maxHp: data.stats.find(stat => stat.stat.name === 'hp').base_stat,
            attack: data.stats.find(stat => stat.stat.name === 'attack').base_stat,
            defense: data.stats.find(stat => stat.stat.name === 'defense').base_stat,
            speed: data.stats.find(stat => stat.stat.name === 'speed').base_stat,
            types: types.join(', '),
            abilities: getAbilitiesByType(types),
            status: null
        };
    } catch (error) {
        console.error("Error en fetchPokemonData con API:", error);
        console.log(`Usando datos locales para ID: ${pokemonId}`);
        const localPokemon = pokemonData[pokemonId];
        if (localPokemon) {
            console.log('Pokémon local encontrado:', localPokemon);
            return { ...localPokemon, status: null };
        } else {
            alert(`No se encontró el Pokémon con ID ${pokemonId} ni en la API ni localmente.`);
            return null;
        }
    }
}

async function searchPokemon() {
    console.log('searchPokemon ejecutado');
    const pokemonInput = document.getElementById('pokemonIdInput');
    if (!pokemonInput) {
        console.error('Elemento pokemonIdInput no encontrado');
        return;
    }
    const pokemonId = pokemonInput.value;
    console.log('ID ingresado:', pokemonId);
    if (!pokemonId) {
        alert('Por favor, ingresa un ID de Pokémon.');
        return;
    }

    const pokemon = await fetchPokemonData(pokemonId);
    console.log('Pokémon obtenido:', pokemon);
    if (!pokemon) {
        console.log('No se obtuvo el Pokémon, revisa la consola para más detalles.');
        return;
    }

    const imageElement = document.getElementById('pokemon-image');
    const nameElement = document.getElementById('pokemon-name');
    const typesElement = document.getElementById('pokemon-types');
    const hpElement = document.getElementById('pokemon-hp');
    const attackElement = document.getElementById('pokemon-attack');

    if (!imageElement || !nameElement || !typesElement || !hpElement || !attackElement) {
        console.error('Uno o más elementos del DOM no se encontraron');
        return;
    }

    imageElement.src = pokemon.image;
    nameElement.textContent = pokemon.name;
    typesElement.textContent = `Tipo: ${pokemon.types}`;
    hpElement.textContent = `HP: ${pokemon.hp}`;
    attackElement.textContent = `Ataque: ${pokemon.attack}`;
}

function selectPokemonForPlayer(player) {
    const pokemonInput = document.getElementById('pokemonIdInput').value;
    if (!pokemonInput) {
        alert('Por favor, ingresa un ID de Pokémon.');
        return;
    }

    fetchPokemonData(pokemonInput).then(pokemon => {
        if (!pokemon) return;
        const inventory = player === 'player1' ? player1Inventory : player2Inventory;
        if (inventory.length >= 6) {
            alert(`El inventario de ${player} está lleno.`);
            return;
        }
        if (inventory.some(p => p.id === pokemon.id)) {
            alert('Este Pokémon ya está en tu inventario.');
            return;
        }
        inventory.push(pokemon);
        renderInventory(player);
        saveProgress(player);
    });
}

function renderInventory(player) {
    const inventoryList = document.getElementById(`${player}-pokemon-list`);
    inventoryList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    const inventory = player === 'player1' ? player1Inventory : player2Inventory;

    inventory.forEach((pokemon, index) => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" width="50" loading="lazy">
            <h3>${pokemon.name}</h3>
            <p>HP: ${pokemon.hp}</p>
            <p>Ataque: ${pokemon.attack}</p>
        `;
        card.addEventListener('click', () => selectPokemonForBattle(player, index));
        fragment.appendChild(card);
    });

    inventoryList.appendChild(fragment);

    const victories = player === 'player1' ? player1Victories : player2Victories;
    document.getElementById(`${player}-victories`).textContent = `Victorias: ${victories}`;
}

function selectPokemonForBattle(player, index) {
    const pokemon = player === 'player1' ? player1Inventory[index] : player2Inventory[index];
    if (player === 'player1') {
        player1Pokemon = pokemon;
        updateBattleInterface('player1', pokemon);
    } else {
        player2Pokemon = pokemon;
        updateBattleInterface('player2', pokemon);
    }
    determineFirstTurn();
}

function updateBattleInterface(player, pokemon) {
    const imageId = `${player}-image`;
    const nameId = `${player}-name`;
    const healthBarId = `${player}-health`;
    const healthTextId = `${player}-hp-text`;
    const abilitiesId = `${player}-abilities`;

    const imageElement = document.getElementById(imageId);
    const nameElement = document.getElementById(nameId);
    const healthBarElement = document.getElementById(healthBarId);
    const healthTextElement = document.getElementById(healthTextId);
    const abilitiesElement = document.getElementById(abilitiesId);

    imageElement.src = pokemon.image || '';
    nameElement.textContent = pokemon.name || '';
    healthBarElement.style.width = '100%';
    healthTextElement.textContent = '';
    abilitiesElement.innerHTML = '';

    updateHealthBar(player, pokemon.hp || 0, pokemon.maxHp || 0);
    renderAbilities(player, pokemon.abilities || []);
}

function updateHealthBar(player, currentHP, maxHP) {
    const healthBar = document.getElementById(`${player}-health`);
    const healthText = document.getElementById(`${player}-hp-text`);
    const healthPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
    healthBar.style.width = `${healthPercentage}%`;
    healthText.textContent = `HP: ${currentHP} / ${maxHP}`;
}

function renderAbilities(player, abilities) {
    const abilitiesElement = document.getElementById(`${player}-abilities`);
    abilitiesElement.innerHTML = '';
    abilities.forEach((ability, index) => {
        const button = document.createElement('button');
        button.textContent = `${ability.name} (${ability.damage} daño, ${ability.accuracy}%)`;
        button.onclick = () => useAbility(player, index);
        abilitiesElement.appendChild(button);
    });
}

function determineFirstTurn() {
    if (!player1Pokemon || !player2Pokemon) return;
    currentTurn = player1Pokemon.speed >= player2Pokemon.speed ? 'player1' : 'player2';
}

function calculateDamage(attackingPokemon, defendingPokemon, ability) {
    const accuracy = ability.accuracy || 100;
    const isMiss = Math.random() > (accuracy / 100) || (attackingPokemon.status === "paralyzed" && Math.random() < 0.25);
    if (isMiss) return { damage: 0, isMiss: true, isCritical: false, status: null };

    const level = 50;
    let baseDamage = ability.damage;
    let damage = Math.round(((2 * level / 5 + 2) * baseDamage * (attackingPokemon.attack / defendingPokemon.defense) / 50 + 2));

    const attackingType = ability.type || attackingPokemon.types.split(', ')[0];
    const defendingTypes = defendingPokemon.types.split(', ');
    let typeMultiplier = 1;

    defendingTypes.forEach(defendingType => {
        if (typeChart[attackingType]?.strongAgainst.includes(defendingType)) {
            typeMultiplier *= 2;
        } else if (typeChart[attackingType]?.weakAgainst.includes(defendingType)) {
            typeMultiplier *= 0.5;
        } else if (typeChart[attackingType]?.immune.includes(defendingType)) {
            typeMultiplier *= 0;
        }
    });

    const isCritical = Math.random() < 0.1;
    const criticalMultiplier = isCritical ? 1.5 : 1;

    let status = null;
    if (ability.name === "Lanzallamas" && Math.random() < 0.1) status = "burned";
    if (ability.name === "Trueno" && Math.random() < 0.2) status = "paralyzed";

    damage = Math.round(damage * typeMultiplier * criticalMultiplier);
    return { damage: typeMultiplier === 0 ? 0 : Math.max(1, damage), isMiss: false, isCritical, status };
}

function useAbility(player, abilityIndex) {
    if (player !== currentTurn) {
        alert('No es tu turno.');
        return;
    }

    const attackingPokemon = player === 'player1' ? player1Pokemon : player2Pokemon;
    const defendingPokemon = player === 'player1' ? player2Pokemon : player1Pokemon;

    if (!attackingPokemon || !defendingPokemon) {
        alert('Ambos jugadores deben seleccionar un Pokémon.');
        return;
    }

    applyTurnEffects(attackingPokemon);
    applyTurnEffects(defendingPokemon);

    const ability = attackingPokemon.abilities[abilityIndex];
    const { damage, isMiss, isCritical, status } = calculateDamage(attackingPokemon, defendingPokemon, ability);

    const attackingElement = document.getElementById(`${player}-pokemon`);
    attackingElement.classList.add('attack');
    setTimeout(() => attackingElement.classList.remove('attack'), 500);

    const battleLog = document.getElementById('battle-log');
    const logMessage = document.createElement('p');

    if (isMiss) {
        logMessage.textContent = `${attackingPokemon.name} falló el ataque!`;
        logMessage.classList.add('miss');
        battleLog.prepend(logMessage);
        currentTurn = player === 'player1' ? 'player2' : 'player1';
        updateHealthBars();
        return;
    }

    defendingPokemon.hp -= damage;
    if (defendingPokemon.hp < 0) defendingPokemon.hp = 0;

    const defendingElement = document.getElementById(player === 'player1' ? 'player2-pokemon' : 'player1-pokemon');
    defendingElement.classList.add('damage');
    setTimeout(() => defendingElement.classList.remove('damage'), 500);

    showDamageText(defendingElement, damage);

    let messageText = `${attackingPokemon.name} usó ${ability.name} y causó ${damage} de daño a ${defendingPokemon.name}.`;
    if (isCritical) {
        messageText += ' ¡Golpe crítico!';
        logMessage.classList.add('critical');
    }
    if (status && !defendingPokemon.status) {
        applyStatus(defendingPokemon, status);
        messageText += ` ¡${defendingPokemon.name} está ${status === "burned" ? "quemado" : "paralizado"}!`;
        logMessage.classList.add('status');
    }
    logMessage.textContent = messageText;
    battleLog.prepend(logMessage);

    updateHealthBars();

    if (defendingPokemon.hp <= 0) {
        const defeatMessage = document.createElement('p');
        defeatMessage.textContent = `${defendingPokemon.name} ha sido derrotado.`;
        battleLog.prepend(defeatMessage);
        removePokemonFromInventory(player === 'player1' ? 'player2' : 'player1');
        showBattleResult(attackingPokemon.name, player);
    }

    currentTurn = player === 'player1' ? 'player2' : 'player1';
}

function applyStatus(pokemon, status) {
    if (status === "burned") {
        pokemon.attack = Math.round(pokemon.attack * 0.5);
        pokemon.status = "burned";
    } else if (status === "paralyzed") {
        pokemon.speed = Math.round(pokemon.speed * 0.5);
        pokemon.status = "paralyzed";
    }
}

function applyTurnEffects(pokemon) {
    if (pokemon.hp <= 0) return;
    if (pokemon.status === "burned") {
        const burnDamage = Math.round(pokemon.maxHp / 16);
        pokemon.hp = Math.max(0, pokemon.hp - burnDamage);
        const logMessage = document.createElement('p');
        logMessage.textContent = `${pokemon.name} sufre ${burnDamage} de daño por quemadura.`;
        logMessage.classList.add('status');
        document.getElementById('battle-log').prepend(logMessage);
    }
}

function updateHealthBars() {
    if (player1Pokemon) updateHealthBar('player1', player1Pokemon.hp, player1Pokemon.maxHp);
    if (player2Pokemon) updateHealthBar('player2', player2Pokemon.hp, player2Pokemon.maxHp);
}

function showDamageText(element, damage) {
    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    damageText.textContent = `-${damage}`;
    element.appendChild(damageText);
    setTimeout(() => element.removeChild(damageText), 1000);
}

function removePokemonFromInventory(player) {
    if (player === 'player1') {
        player1Inventory = player1Inventory.filter(p => p.id !== player1Pokemon.id);
        renderInventory('player1');
        saveProgress('player1');
    } else {
        player2Inventory = player2Inventory.filter(p => p.id !== player2Pokemon.id);
        renderInventory('player2');
        saveProgress('player2');
    }
}

function showBattleResult(winner, winningPlayer) {
    alert(`${winner} gana la batalla!`);
    if (winningPlayer === 'player1') {
        player1Victories += 1;
        alert(`¡Player 1 ha ganado 1 punto de victoria! Total: ${player1Victories}`);
        saveProgress('player1');
        renderInventory('player1');
    } else {
        player2Victories += 1;
        alert(`¡Player 2 ha ganado 1 punto de victoria! Total: ${player2Victories}`);
        saveProgress('player2');
        renderInventory('player2');
    }
    resetBattle();
}

function resetBattle() {
    player1Pokemon = null;
    player2Pokemon = null;
    updateBattleInterface('player1', { image: '', name: '', hp: 0, maxHp: 0, abilities: [] });
    updateBattleInterface('player2', { image: '', name: '', hp: 0, maxHp: 0, abilities: [] });
    document.getElementById('battle-log').innerHTML = '';
}

function loadDashboard() {
    console.log('loadDashboard ejecutado');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('usernameHeader').textContent = `${loggedInUser.username}`;
    
    resetBattle();
    
    loadProgress('player1');
    loadProgress('player2');
}

function saveProgress(player) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) return;

    const inventory = player === 'player1' ? player1Inventory : player2Inventory;
    const victories = player === 'player1' ? player1Victories : player2Victories;
    const progress = {
        inventory: inventory.map(p => ({
            id: p.id,
            name: p.name,
            image: p.image,
            hp: p.hp,
            maxHp: p.maxHp,
            attack: p.attack,
            defense: p.defense,
            speed: p.speed,
            types: p.types,
            abilities: p.abilities
        })),
        victories: victories
    };
    localStorage.setItem(`progress_${loggedInUser.username}_${player}`, JSON.stringify(progress));
}

function loadProgress(player) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) return;

    const savedProgress = JSON.parse(localStorage.getItem(`progress_${loggedInUser.username}_${player}`));
    if (savedProgress) {
        if (player === 'player1') {
            player1Inventory = savedProgress.inventory;
            player1Victories = savedProgress.victories || 0;
        } else {
            player2Inventory = savedProgress.inventory;
            player2Victories = savedProgress.victories || 0;
        }
        renderInventory(player);
    }
}

function logout() {
    saveProgress('player1');
    saveProgress('player2');
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
}, { once: true });