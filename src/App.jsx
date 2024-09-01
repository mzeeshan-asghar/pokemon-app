import "./App.css";
import { useEffect, useState, useCallback } from "react";

function PokémonCard({ pokemonData }) {
  return (
    <div className="pokemon-card">
      <figure className="card-image">
        <img
          src={pokemonData.sprites.other.dream_world.front_default}
          alt={pokemonData.name}
        />
      </figure>
      <div className="card-content">
        <div className="title">{pokemonData.name}</div>
        <span className="main">
          {pokemonData.types.map((currType) => currType.type.name).join(", ")}
        </span>
        <div className="skills">
          <p>
            <span> Height:</span>
            <span>{pokemonData.height}</span>
          </p>
          <p>
            <span> Weight:</span>
            <span>{pokemonData.weight}</span>
          </p>
          <p>
            <span> Speed:</span>
            <span>{pokemonData.stats[5].base_stat}</span>
          </p>
          <p>
            <span> Experience:</span>
            <span>{pokemonData.base_experience}</span>
          </p>
          <p>
            <span> Attack:</span>
            <span>{pokemonData.stats[1].base_stat}</span>
          </p>
          <p>
            <span>Abilities:</span>
            <span>
              {pokemonData.abilities
                .map((abilityInfo) => abilityInfo.ability.name)
                .slice(0, 1)
                .join(", ")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ input, handleSearch }) {
  return (
    <div className="section-header">
      <h1>Let&apos;s Catch Pokémon</h1>
      <div className="search-box">
        <input
          value={input}
          onChange={handleSearch}
          placeholder="search Pokémon"
          type="text"
        />
      </div>
    </div>
  );
}

function SectionContent({ pokemonList, handleNavigation, navigation }) {
  return (
    <div className="section-content">
      <div className="pokemon-list">
        {pokemonList.map((pokemon) => (
          <PokémonCard key={pokemon.id} pokemonData={pokemon} />
        ))}
      </div>

      <div className="navigation-btns">
        <button
          onClick={() => handleNavigation("prev")}
          disabled={!navigation.prevPage}
        >
          Prev
        </button>
        <button
          onClick={() => handleNavigation("next")}
          disabled={!navigation.nextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
}

function App() {
  const [input, setInput] = useState("");
  const [pokemonList, setPokemonList] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [navigation, setNavigation] = useState({
    prevPage: null,
    default: "https://pokeapi.co/api/v2/pokemon?limit=24",
    nextPage: null,
  });

  const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=24";

  // Fetch Pokémon list
  const fetchPokémonList = useCallback(async (url) => {
    try {
      setError(null); // Clear previous errors
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      console.log(data);

      // Fetch detailed data for each Pokémon and set the full list
      const pokemonDataPromises = data.results.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const pokemonData = await response.json();
        return pokemonData;
      });

      const pokemonDataList = await Promise.all(pokemonDataPromises);

      setPokemonList(pokemonDataList); // Store the full list
      setNavigation({
        prevPage: data.previous,
        nextPage: data.next,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setInitialLoading(false);
      setSearchLoading(false);
    }
  }, []);

  const handleNavigation = (direction) => {
    setSearchLoading(true);
    if (direction === "prev" && navigation.prevPage) {
      fetchPokémonList(navigation.prevPage);
    } else if (direction === "next" && navigation.nextPage) {
      fetchPokémonList(navigation.nextPage);
    }
  };

  const handleSearch = (e) => {
    setInput(e.target.value);
  };

  const searchPokémon = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    fetchPokémonList(API_URL);
  }, [fetchPokémonList]);

  return (
    <section className="pokemon-section">
      {initialLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <>
            <SectionHeader input={input} handleSearch={handleSearch} />
            {searchLoading ? (
              <LoadingSpinner />
            ) : (
              <SectionContent
                pokemonList={searchPokémon}
                handleNavigation={handleNavigation}
                navigation={navigation}
              />
            )}
          </>
        </>
      )}
    </section>
  );
}

export default App;
