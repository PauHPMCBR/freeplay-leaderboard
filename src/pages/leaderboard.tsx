import { useRouter } from 'next/router'
import Leaderboard from '@/components/Leaderboard'
import React, { useEffect, useState } from 'react'
import { BTD6Map, GameType } from '@prisma/client'

export default function DynamicLeaderboard() {
  const router = useRouter()
  const { btd6Map, gameType } = router.query //TODO update selectable dropdowns if these 2 are not undefined, also wait for them??

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Leaderboard
          </h1>
          <LeaderboardFilters
            btd6Map={btd6Map as string} 
            gameType={gameType as string} 
           />
        </div>
        <Leaderboard 
          btd6Map={btd6Map as string} 
          gameType={gameType as string} 
        />
      </div>
    </>
  )
}

function LeaderboardFilters({ btd6Map, gameType }: {
  btd6Map?: string
  gameType?: string
}) {
  const router = useRouter();

  const [maps, setMaps] = useState<BTD6Map[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);


  // Fetch maps and game types on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        
        // Fetch BTD6 maps
        const mapsRes = await fetch('/api/maps');
        const mapsData = await mapsRes.json();
        setMaps(mapsData.maps);
        
        // Fetch game types
        const gameTypesRes = await fetch('/api/game-types');
        const gameTypesData = await gameTypesRes.json();
        setGameTypes(gameTypesData.gameTypes);
        
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);
    
  
  const handleFilterChange = (filterType: string, value: string) => {
    router.push({
      pathname: '/leaderboard',
      query: { ...router.query, [filterType]: value }
    })
  }

  return (
    <div className="flex gap-4">
      <select 
        className="px-4 py-2 border rounded"
        value={btd6Map || ''}
        onChange={(e) => handleFilterChange('btd6Map', e.target.value)}
      >
        <option value="">All Maps</option>
        {maps.map(map => (
                <option key={map.id} value={map.id}>
                  {map.name}
                </option>
        ))}
      </select>
      
      <select
        className="px-4 py-2 border rounded"
        value={gameType || ''}
        onChange={(e) => handleFilterChange('gameType', e.target.value)}
      >
        <option value="">All Game Types</option>
        {gameTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
      </select>
    </div>
  )
}