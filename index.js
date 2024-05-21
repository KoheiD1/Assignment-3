const PAGE_SIZE = 10;
let currentPage = 1;
let allPokemons = [];
let filteredPokemons = [];
let totalPokemons = 0; // Variable to store total number of Pokémon
let numDisplayedPokemons = 0; // Variable to store the number of Pokémon currently being displayed

const typeColors = {
  normal: 'type-normal',
  fire: 'type-fire',
  water: 'type-water',
  electric: 'type-electric',
  grass: 'type-grass',
  ice: 'type-ice',
  fighting: 'type-fighting',
  poison: 'type-poison',
  ground: 'type-ground',
  flying: 'type-flying',
  psychic: 'type-psychic',
  bug: 'type-bug',
  rock: 'type-rock',
  ghost: 'type-ghost',
  dragon: 'type-dragon',
  dark: 'type-dark',
  steel: 'type-steel',
  fairy: 'type-fairy'
};

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  const startPage = Math.max(currentPage - 2, 1);
  const endPage = Math.min(startPage + 4, numPages);

  // Display total number of Pokémon
  $('#pagination').append(`<div>Total Pokémon: ${totalPokemons}</div>`);

  // Display number of Pokémon being displayed
  $('#pagination').append(`<div>Displayed Pokémon: 10 </div>`);

  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 startButton" value="Start">Start</button>
    `);
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 prevButton" value="Previous">Previous</button>
    `);
  }

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 nextButton" value="Next">Next</button>
    `);
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 endButton" value="End">End</button>
    `);
  }

  $('.numberedButtons').removeClass('active');
  $(`.numberedButtons[value="${currentPage}"]`).addClass('active');

  if (currentPage === 1) {
    $('.startButton').hide();
    $('.prevButton').hide();
  } else {
    $('.startButton').show();
    $('.prevButton').show();
  }

  if (currentPage === numPages) {
    $('.nextButton').hide();
    $('.endButton').hide();
  } else {
    $('.nextButton').show();
    $('.endButton').show();
  }
};

const filters = async () => {
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/type/');
    const types = response.data.results;
    const filtersDiv = document.getElementById('filters');

    types.forEach((type) => {
      const checkboxDiv = document.createElement('div');
      checkboxDiv.className = 'form-check';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-check-input';
      checkbox.id = `type-${type.name}`;
      checkbox.value = type.name;

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `type-${type.name}`;
      label.textContent = type.name;

      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      filtersDiv.appendChild(checkboxDiv);

      checkbox.addEventListener('change', filterPokemon);
    });
  } catch (error) {
    console.error('Error fetching Pokémon types:', error);
  }
};

const filterPokemon = async () => {
  try {
    const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox) => checkbox.value);

    if (selectedTypes.length === 0) {
      filteredPokemons = allPokemons;
    } else {
      filteredPokemons = await Promise.all(allPokemons.map(async (pokemon) => {
        const res = await axios.get(pokemon.url);
        const types = res.data.types.map((type) => type.type.name);
        if (selectedTypes.every((type) => types.includes(type))) {
          return pokemon;
        }
      })).then(results => results.filter(pokemon => pokemon != null));
    }

    currentPage = 1;
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  } catch (error) {
    console.error('Error filtering Pokémon:', error);
  }
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  try {
    const selectedPokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    $('#pokeCards').empty();
    for (const pokemon of selectedPokemons) {
      const res = await axios.get(pokemon.url);
      $('#pokeCards').append(`
        <div class="pokeCard card" pokeName=${res.data.name}>
          <h3>${res.data.name.toUpperCase()}</h3> 
          <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal" onclick="showDetails('${res.data.name}')">
            More
          </button>
        </div>  
      `);
    }

    numDisplayedPokemons = Math.min(totalPokemons, currentPage * PAGE_SIZE); // Update numDisplayedPokemons
    updatePaginationDiv(currentPage, Math.ceil(totalPokemons / PAGE_SIZE)); // Update pagination with total number of pages
  } catch (error) {
    console.error('Error paginating Pokémon:', error);
  }
};

const showDetails = async (name) => {
  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = res.data;
    const typeClass = typeColors[pokemon.types[0].type.name] || 'type-normal';
    $('.modal-body').empty().append(`
      <div class="${typeClass} p-3 rounded">
        <h3>${pokemon.name.toUpperCase()}</h3>
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}" class="img-fluid mb-3"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${pokemon.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h3>Stats</h3>
          <ul>
            ${pokemon.stats.map((stat) => `<li>${stat.stat.name}:
            ${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
        </div>
        <h3>Types</h3>
        <ul>
          ${pokemon.types.map((type) => `<li>${type.type.name}</li>`).join('')}
        </ul>
        <ul>
          <li>Height: ${pokemon.height}</li>
          <li>Weight: ${pokemon.weight}</li>
          <li>Base Experience: ${pokemon.base_experience}</li>
        </ul>
      </div>
    `);
  } catch (error) {
    console.error('Error fetching Pokémon details:', error);
  }
};

const setup = async () => {
  await filters();

  $('#pokeCards').empty();
  const response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  allPokemons = response.data.results;
  totalPokemons = allPokemons.length; // Update total number of Pokémon
  filteredPokemons = allPokemons;

  paginate(currentPage, PAGE_SIZE, filteredPokemons);

  $('body').on('click', '.page', function() {
    const pageNum = $(this).val();
    if (pageNum === 'Start') {
      currentPage = 1;
    } else if (pageNum === 'End') {
      currentPage = Math.ceil(totalPokemons / PAGE_SIZE); // Go to the last page
    } else {
      currentPage = Number(pageNum);
    }
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
  });

  $('#pokeModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const pokemonName = button.closest('.pokeCard').attr('pokeName');
    showDetails(pokemonName);
  });
};

$(document).ready(setup);
