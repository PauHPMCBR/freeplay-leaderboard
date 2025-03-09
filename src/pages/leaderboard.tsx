import { useRouter } from 'next/router';
import Leaderboard from '@/components/Leaderboard';
import React, { JSX, useEffect, useState } from 'react';
import type { BTD6Map, GameType, Hero, Challenge } from '@prisma/client';

type TripleState = 'include' | 'exclude' | 'indifferent';
type ChallengeFilter = Record<string, TripleState>;

interface FilterLabels {
  maps: string;
  gameTypes: string;
  heroes: string[];
  versionStart: string;
  versionEnd: string;
  players: string;
  challenges: Array<{ name: string; type: 'include' | 'exclude' }>;
}

interface LeaderboardFiltersProps {
  btd6Map?: string;
  gameType?: string;
  selectedHeroes: string[];
  versionStart?: string;
  versionEnd?: string;
  playerCount?: string;
  selectedChallenges: ChallengeFilter;
  verified: TripleState;
}

export default function DynamicLeaderboard(): JSX.Element {
  const router = useRouter();
  const { 
    btd6Map, 
    gameType, 
    heroes, 
    versionStart, 
    versionEnd, 
    players, 
    challenges,
    verified,
  } = router.query;

  // Parse selected heroes from query
  const selectedHeroes = heroes 
    ? (heroes as string).split(',') 
    : [];

  // Parse challenge states from query
  const selectedChallenges = challenges 
    ? JSON.parse(challenges as string) as ChallengeFilter 
    : {};

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
      {/* Filter Sidebar */}
      <div className="w-full md:w-64 p-4 border-r">
        <h2 className="text-xl font-bold mb-6">Filters</h2>
        <LeaderboardFilters
          btd6Map={btd6Map as string}
          gameType={gameType as string}
          selectedHeroes={selectedHeroes}
          versionStart={versionStart as string}
          versionEnd={versionEnd as string}
          playerCount={players as string}
          selectedChallenges={selectedChallenges}
          verified={verified as TripleState}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <button 
            onClick={() => router.push('/leaderboard')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear All Filters
          </button>
        </div>
        <div className="mb-4">
          <ActiveFilters />
        </div>
        <Leaderboard
          btd6Map={btd6Map as string}
          gameType={gameType as string}
          heroes={heroes as string}
          versionStart={versionStart as string}
          versionEnd={versionEnd as string}
          players={players as string}
          challenges={challenges as string}
          verified={(verified === 'include' ? 'true' : (verified === 'exclude' ? 'false' : undefined))}
        />
      </div>
    </div>
  );
}

function ActiveFilters(): JSX.Element {
  const router = useRouter();
  const { 
    btd6Map, 
    gameType, 
    heroes, 
    versionStart,
    versionEnd, 
    players, 
    challenges,
    verified,
  } = router.query;
  
  const [filterLabels, setFilterLabels] = useState<FilterLabels>({
    maps: '',
    gameTypes: '',
    heroes: [],
    versionStart: '',
    versionEnd: '',
    players: '',
    challenges: [],
  });

  useEffect(() => {
    const fetchFilterLabels = async (): Promise<void> => {
      try {
        // Fetch map name if map ID is selected
        if (btd6Map) {
          const mapRes = await fetch(`/api/maps/${btd6Map}`);
          const mapData = await mapRes.json();
          setFilterLabels(prev => ({ ...prev, maps: mapData.name }));
        }

        // Fetch game type name if game type ID is selected
        if (gameType) {
          const gameTypeRes = await fetch(`/api/game-types/${gameType}`);
          const gameTypeData = await gameTypeRes.json();
          setFilterLabels(prev => ({ ...prev, gameTypes: gameTypeData.name }));
        }

        // Fetch hero names if hero IDs are selected
        if (heroes) {
          const heroIds = (heroes as string).split(',');
          const heroPromises = heroIds.map(id => 
            fetch(`/api/heroes/${id}`).then(res => res.json())
          );
          const heroData = await Promise.all(heroPromises);
          setFilterLabels(prev => ({ 
            ...prev, 
            heroes: heroData.map(h => h.name) 
          }));
        }

        // Fetch challenge names if challenge IDs are selected
        if (challenges) {
          const challengeObj = JSON.parse(challenges as string) as ChallengeFilter;
          const includedIds = Object.keys(challengeObj).filter(id => 
            challengeObj[id] === 'include'
          );
          const excludedIds = Object.keys(challengeObj).filter(id => 
            challengeObj[id] === 'exclude'
          );
          
          const challengePromises = [...includedIds, ...excludedIds].map(id => 
            fetch(`/api/challenges/${id}`).then(res => res.json())
          );
          const challengeData = await Promise.all(challengePromises);
          
          const formattedChallenges = challengeData.map((c, index) => {
            const id = index < includedIds.length 
              ? includedIds[index] 
              : excludedIds[index - includedIds.length];
            return {
              name: c.name,
              type: challengeObj[id] as 'include' | 'exclude'
            };
          });
          
          setFilterLabels(prev => ({ 
            ...prev, 
            challenges: formattedChallenges 
          }));

          setFilterLabels(prev => ({
            ...prev,
            verified: verified as string
          }))
        }
      } catch (error) {
        console.error('Failed to fetch filter labels:', error);
      }
    };

    fetchFilterLabels();
  }, [btd6Map, gameType, heroes, challenges]);

  const removeFilter = (type: string, value: string | null = null): void => {
    const newQuery = { ...router.query };
    
    if (type === 'hero' && value && heroes) {
      const heroList = (heroes as string).split(',');
      const updatedHeroes = heroList.filter(h => h !== value).join(',');
      
      if (updatedHeroes) {
        newQuery.heroes = updatedHeroes;
      } else {
        delete newQuery.heroes;
      }
    } else if (type === 'challenge' && value && challenges) {
      const challengeObj = JSON.parse(challenges as string) as ChallengeFilter;
      delete challengeObj[value];
      
      if (Object.keys(challengeObj).length > 0) {
        newQuery.challenges = JSON.stringify(challengeObj);
      } else {
        delete newQuery.challenges;
      }
    } else {
      delete newQuery[type];
    }

    router.push({
      pathname: '/leaderboard',
      query: newQuery
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {btd6Map && (
        <div className="px-3 py-1 bg-blue-100 rounded-full flex items-center">
          <span>Map: {filterLabels.maps}</span>
          <button 
            onClick={() => removeFilter('btd6Map')} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove map filter"
          >
            ×
          </button>
        </div>
      )}
      
      {gameType && (
        <div className="px-3 py-1 bg-green-100 rounded-full flex items-center">
          <span>Game Type: {filterLabels.gameTypes}</span>
          <button 
            onClick={() => removeFilter('gameType')} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove game type filter"
          >
            ×
          </button>
        </div>
      )}
      
      {filterLabels.heroes.map(hero => (
        <div key={hero} className="px-3 py-1 bg-purple-100 rounded-full flex items-center">
          <span>Hero: {hero}</span>
          <button 
            onClick={() => removeFilter('hero', hero)} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label={`Remove ${hero} filter`}
          >
            ×
          </button>
        </div>
      ))}
      
      {versionStart && (
        <div className="px-3 py-1 bg-yellow-100 rounded-full flex items-center">
          <span>Version Start: {versionStart}</span>
          <button 
            onClick={() => removeFilter('versionStart')} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove version filter"
          >
            ×
          </button>
        </div>
      )}

      {versionEnd && (
        <div className="px-3 py-1 bg-yellow-100 rounded-full flex items-center">
          <span>Version End: {versionEnd}</span>
          <button 
            onClick={() => removeFilter('versionEnd')} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove version filter"
          >
            ×
          </button>
        </div>
      )}
      
      {players && (
        <div className="px-3 py-1 bg-red-100 rounded-full flex items-center">
          <span>Players: {players}</span>
          <button 
            onClick={() => removeFilter('players')} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Remove players filter"
          >
            ×
          </button>
        </div>
      )}
      
      {filterLabels.challenges.map(challenge => (
        <div 
          key={challenge.name} 
          className={`px-3 py-1 rounded-full flex items-center ${
            challenge.type === 'include' ? 'bg-indigo-100' : 'bg-orange-100'
          }`}
        >
          <span>
            Challenge: {challenge.name} {challenge.type === 'include' ? '(✓)' : '(✗)'}
          </span>
          <button 
            onClick={() => removeFilter('challenge', challenge.name)} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label={`Remove ${challenge.name} filter`}
          >
            ×
          </button>
        </div>
      ))}

      {verified !== 'include' && (
        <div 
          key='verified' 
          className={`px-3 py-1 rounded-full flex items-center ${
            verified === 'include' ? 'bg-indigo-100' : 'bg-orange-100'
          }`}
        >
          <span>
            Verified {verified === 'indifferent' ? '(-)' : '(✗)'}
          </span>
          <button 
            onClick={() => removeFilter('verified')} 
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label={`Remove verified filter`}
          >
            ×
          </button>
        </div>
      )}
      
    </div>
  );
}

function LeaderboardFilters({
  btd6Map = '',
  gameType = '',
  selectedHeroes = [],
  versionStart = '',
  versionEnd = '',
  playerCount = '',
  selectedChallenges = {},
  verified = 'include'
}: LeaderboardFiltersProps): JSX.Element {
  const router = useRouter();
  
  const [maps, setMaps] = useState<BTD6Map[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [players] = useState<number[]>([1, 2, 3, 4]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        // Fetch BTD6 maps
        const mapsRes = await fetch('/api/maps');
        const mapsData = await mapsRes.json();
        setMaps(mapsData.maps);
        
        // Fetch game types
        const gameTypesRes = await fetch('/api/game-types');
        const gameTypesData = await gameTypesRes.json();
        setGameTypes(gameTypesData.gameTypes);
        
        // Fetch heroes
        const heroesRes = await fetch('/api/heroes');
        const heroesData = await heroesRes.json();
        setHeroes(heroesData.heroes);

        // Fetch challenges
        const queryParams = new URLSearchParams();
        if (btd6Map) queryParams.append('btd6Map', btd6Map);
        if (gameType) queryParams.append('gameType', gameType);
        const challengesRes = await fetch(`/api/challenges?${queryParams.toString()}`);
        const challengesData = await challengesRes.json();
        setChallenges(challengesData.challenges);
        
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    
    fetchInitialData();
  }, [btd6Map, gameType]);

  const handleFilterChange = (filterType: string, value: string): void => {
    router.push({
      pathname: '/leaderboard',
      query: { ...router.query, [filterType]: value }
    });
  };

  const handleHeroChange = (heroId: string): void => {
    const currentHeroes = [...selectedHeroes];
    const heroIndex = currentHeroes.indexOf(heroId);
    
    if (heroIndex === -1) {
      currentHeroes.push(heroId);
    } else {
      currentHeroes.splice(heroIndex, 1);
    }
    
    if (currentHeroes.length > 0) {
      router.push({
        pathname: '/leaderboard',
        query: { ...router.query, heroes: currentHeroes.join(',') }
      });
    } else {
      const newQuery = { ...router.query };
      delete newQuery.heroes;
      router.push({
        pathname: '/leaderboard',
        query: newQuery
      });
    }
  };

  const handleChallengeStateChange = (
    challengeId: string, 
    state: TripleState
  ): void => {
    const currentChallenges = { ...selectedChallenges };
    
    if (state === 'indifferent') {
      delete currentChallenges[challengeId];
    } else {
      currentChallenges[challengeId] = state;
    }
    
    if (Object.keys(currentChallenges).length > 0) {
      router.push({
        pathname: '/leaderboard',
        query: { 
          ...router.query, 
          challenges: JSON.stringify(currentChallenges) 
        }
      });
    } else {
      const newQuery = { ...router.query };
      delete newQuery.challenges;
      router.push({
        pathname: '/leaderboard',
        query: newQuery
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Selection */}
      <div>
        <label className="block mb-2 font-medium">Map</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={btd6Map || ''}
          onChange={(e) => handleFilterChange('btd6Map', e.target.value)}
          aria-label="Select map"
        >
          <option value="">All Maps</option>
          {maps.map(map => (
            <option key={map.id} value={map.id}>
              {map.name} ({map.difficulty})
            </option>
          ))}
        </select>
      </div>
      
      {/* Game Type Selection */}
      <div>
        <label className="block mb-2 font-medium">Game Type</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={gameType || ''}
          onChange={(e) => handleFilterChange('gameType', e.target.value)}
          aria-label="Select game type"
        >
          <option value="">All Game Types</option>
          {gameTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.difficulty})
            </option>
          ))}
        </select>
      </div>
      
      {/* Hero Selection */}
      <div>
        <label className="block mb-2 font-medium">Heroes</label>
        <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded">
          {heroes.map(hero => (
            <div key={hero.id} className="flex items-center">
              <input
                type="checkbox"
                id={`hero-${hero.id}`}
                checked={selectedHeroes.includes(hero.id)}
                onChange={() => handleHeroChange(hero.id)}
                className="mr-2"
                aria-label={`Select ${hero.name}`}
              />
              <label htmlFor={`hero-${hero.id}`}>{hero.name}</label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Version Range */}
      <div>
        <label className="block mb-2 font-medium">Version Start</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={versionStart || ''}
          onChange={(e) => handleFilterChange('versionStart', e.target.value)}
          aria-label="Select version"
        >
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">Version End</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={versionEnd || ''}
          onChange={(e) => handleFilterChange('versionEnd', e.target.value)}
          aria-label="Select version"
        >
        </select>
      </div>
      
      {/* Player Count */}
      <div>
        <label className="block mb-2 font-medium">Player Count</label>
        <select
          className="w-full px-4 py-2 border rounded"
          value={playerCount || ''}
          onChange={(e) => handleFilterChange('players', e.target.value)}
          aria-label="Select player count"
        >
          <option value="">Any Players</option>
          {players.map(count => (
            <option key={count} value={count}>
              {count} {count === 1 ? 'Player' : 'Players'}
            </option>
          ))}
        </select>
      </div>
      
      {/* Challenges */}
      <div>
        <label className="block mb-2 font-medium">Challenges</label>
        <div className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded">
          {challenges.map(challenge => {
            const challengeState = selectedChallenges[challenge.id] || 'indifferent';
            
            return (
              <div key={challenge.id} className="flex items-center justify-between">
                <span>{challenge.name}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleChallengeStateChange(challenge.id, 'include')}
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      challengeState === 'include' ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
                    title="Include only submissions with this challenge"
                    aria-label={`Include only submissions with ${challenge.name}`}
                    type="button"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleChallengeStateChange(challenge.id, 'indifferent')}
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      challengeState === 'indifferent' ? 'bg-gray-500 text-white' : 'bg-gray-200'
                    }`}
                    title="Show all submissions regardless of this challenge"
                    aria-label={`Show all submissions regardless of ${challenge.name}`}
                    type="button"
                  >
                    −
                  </button>
                  <button
                    onClick={() => handleChallengeStateChange(challenge.id, 'exclude')}
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      challengeState === 'exclude' ? 'bg-red-500 text-white' : 'bg-gray-200'
                    }`}
                    title="Exclude submissions with this challenge"
                    aria-label={`Exclude submissions with ${challenge.name}`}
                    type="button"
                  >
                    ✗
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div key='verified' className="flex items-center justify-between">
        <span>Verified</span>
        <div className="flex space-x-1">
          <button
            onClick={() => handleFilterChange('verified', 'include')}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              verified === 'include' ? 'bg-green-500 text-white' : 'bg-gray-200'
            }`}
            title="Include only submissions with this challenge"
            aria-label={`Include only verified submissions`}
            type="button"
          >
            ✓
          </button>
          <button
            onClick={() => handleFilterChange('verified', 'indifferent')}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              verified === 'indifferent' ? 'bg-gray-500 text-white' : 'bg-gray-200'
            }`}
            title="Show all submissions regardless of this challenge"
            aria-label={`Show all submissions regardless of verification`}
            type="button"
          >
            −
          </button>
          <button
            onClick={() => handleFilterChange('verified', 'exclude')}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              verified === 'exclude' ? 'bg-red-500 text-white' : 'bg-gray-200'
            }`}
            title="Exclude submissions with this challenge"
            aria-label={`Exclude verified submissions`}
            type="button"
          >
            ✗
          </button>
        </div>
      </div>
    </div>
  );
}