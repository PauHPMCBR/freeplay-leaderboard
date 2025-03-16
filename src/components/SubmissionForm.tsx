'use client';

import { BTD6Map, Challenge, GameType, Hero } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import React from 'react';


type SubmitFormData = {
  btd6MapId: string;
  gameTypeId: string;
  heroIds: string[];
  version: string;
  players: number;
  seed?: string;
  highestRound: number;
  challengeIds: string[];
  mediaLink?: string;
  additionalNotes: string;
  adminFakeUsername?: string;
};

export default function SubmissionForm() {
  const { data: session } = useSession();

  const [formData, setFormData] = useState<SubmitFormData>({
    btd6MapId: '',
    gameTypeId: '',
    heroIds: [''],
    version: '',
    players: 1,
    seed: '',
    challengeIds: [],
    highestRound: 0,
    mediaLink: '',
    additionalNotes: '',
  });
  
  const [maps, setMaps] = useState<BTD6Map[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [saveFile, setSaveFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch maps and game types on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
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
        
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Fetch available challenges when map or game type changes
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!formData.btd6MapId || !formData.gameTypeId) {
        setAvailableChallenges([]);
        return;
      }
      
      try {
        setIsLoading(true);
        const res = await fetch(`/api/challenges?btd6Map=${formData.btd6MapId}&gameType=${formData.gameTypeId}`);
        const data = await res.json();
        setAvailableChallenges(data.challenges);
        
        // Clear selected challenges when available challenges change
        setFormData(prev => ({
          ...prev,
          challengeIds: [],
        }));
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChallenges();
  }, [formData.btd6MapId, formData.gameTypeId]);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Handle hero array inputs
    if (name.startsWith('heroIds[')) {
      const index = parseInt(name.match(/\[(\d+)\]/)?.[1] || '0', 10);
      setFormData(prev => ({
        ...prev,
        heroIds: prev.heroIds.map((heroId, i) => i === index ? value : heroId)
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0,
    }));
  };

  const handleChallengeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      challengeIds: checked 
        ? [...prev.challengeIds, value]
        : prev.challengeIds.filter(id => id !== value),
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    
    if (name === 'screenshot') {
      setScreenshot(files[0]);
    } else if (name === 'saveFile') {
      setSaveFile(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    //TODO handle frontend incorrect input data (version, number of players, additional notes length (and strings in general)...)

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Append all text/number fields
      Object.entries(formData).forEach(([key, value]) => {
          formDataToSend.append(key, String(value));
      });
      
      // Append files if they exist
      if (screenshot) {
        formDataToSend.append('screenshot', screenshot);
      }
      
      if (saveFile) {
        formDataToSend.append('saveFile', saveFile);
      }

      console.log(formDataToSend);
      
      // Submit the form
      const response = await fetch('/api/submissions/create', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header - the browser will set it with the boundary for FormData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit run');
      }
      
      setSubmitStatus({
        success: true,
        message: 'Run submitted successfully!',
      });
      
      // Reset form after successful submission
      setFormData({
        btd6MapId: '',
        gameTypeId: '',
        heroIds: [''],
        version: '',
        players: 1,
        seed: '',
        challengeIds: [],
        highestRound: 0,
        mediaLink: '',
        additionalNotes: '',
      });
      setScreenshot(null);
      setSaveFile(null);
      
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      
      {submitStatus && (
        <div 
          className={`p-4 mb-4 rounded-md ${
            submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {submitStatus.message}
        </div>
      )}
      
      {isLoading && <div className="text-center p-4">Loading...</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="btd6MapId" className="block text-sm font-medium text-gray-700 mb-1">
              Map
            </label>
            <select
              id="btd6MapId"
              name="btd6MapId"
              value={formData.btd6MapId}
              onChange={handleTextChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value="">Select Map</option>
              {maps.map(map => (
                <option key={map.id} value={map.id}>
                  {map.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="gameTypeId" className="block text-sm font-medium text-gray-700 mb-1">
              Game Type
            </label>
            <select
              id="gameTypeId"
              name="gameTypeId"
              value={formData.gameTypeId}
              onChange={handleTextChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value="">Select Game Type</option>
              {gameTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 max-w-xs">
          <label htmlFor="players" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Players (1-4)
          </label>
          <input
            type="number"
            id="players"
            name="players"
            min="1"
            max="4"
            value={formData.players}
            onChange={(e) => {
              const numPlayers = Math.min(4, Math.max(1, parseInt(e.target.value) || 1));
              setFormData(prev => ({
                ...prev,
                players: numPlayers,
                heroIds: Array(numPlayers).fill('').map((_, i) => 
                  (i < prev.heroIds.length ? prev.heroIds[i] : ''))
              }));
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[...Array(formData.players)].map((_, index) => (
            <div key={index}>
              <label htmlFor={`heroId-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                Player {index + 1} Hero
              </label>
              <select
                id={`heroId-${index}`}
                name={`heroIds[${index}]`}
                value={formData.heroIds[index] || ''}
                onChange={handleTextChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isLoading}
              >
                <option value="">Select Hero</option>
                {heroes.map(hero => (
                  <option key={hero.id} value={hero.id}>
                    {hero.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Challenges
          </label>
          {formData.btd6MapId && formData.gameTypeId ? (
            availableChallenges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableChallenges.map(challenge => (
                  <div key={challenge.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`challenge-${challenge.id}`}
                      name="challenges"
                      value={challenge.id}
                      checked={formData.challengeIds.includes(challenge.id)}
                      onChange={handleChallengeChange}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <label htmlFor={`challenge-${challenge.id}`} className="text-sm">
                      {challenge.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No challenges available for this map and game type.</p>
            )
          ) : (
            <p className="text-sm text-gray-500">Select a map and game type to see available challenges.</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label htmlFor="highestRound" className="block text-sm font-medium text-gray-700 mb-1">
              Highest Round
            </label>
            <input
              type="number"
              id="highestRound"
              name="highestRound"
              min="1"
              value={formData.highestRound || ''}
              onChange={handleNumberChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
              Game Version (e.g., 32.0)
            </label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleTextChange}
              required
              pattern="\d+\.\d+"  // Validate version format
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="seed" className="block text-sm font-medium text-gray-700 mb-1">
            Seed (Optional)
          </label>
          <input
            type="number"
            id="seed"
            name="seed"
            value={formData.seed || ''}
            onChange={handleNumberChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="mediaLink" className="block text-sm font-medium text-gray-700 mb-1">
            Media Link (Optional)
          </label>
          <input
            type="url"
            id="mediaLink"
            name="mediaLink"
            value={formData.mediaLink || ''}
            onChange={handleTextChange}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
              Screenshot (Optional)
            </label>
            <input
              type="file"
              id="screenshot"
              name="screenshot"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
            {screenshot && (
              <p className="mt-1 text-sm text-gray-500">
                Selected: {screenshot.name}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="saveFile" className="block text-sm font-medium text-gray-700 mb-1">
              Save File (Optional)
            </label>
            <input
              type="file"
              id="saveFile"
              name="saveFile"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
            {saveFile && (
              <p className="mt-1 text-sm text-gray-500">
                Selected: {saveFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes || ''}
            onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-16 resize-y"
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500 text-right">
            {formData.additionalNotes.length}/500
          </p>
        </div>

        {session.user.admin && (
          <div className="mb-4">
          <label htmlFor="seed" className="block text-sm font-medium text-gray-700 mb-1">
            ADMIN ONLY: Set a username here to submit the run as bot generated from this specified user:
          </label>
          <input
            type="adminFakeUsername"
            id="adminFakeUsername"
            name="adminFakeUsername"
            value={formData.adminFakeUsername || ''}
            onChange={handleTextChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={isLoading}
          />
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Run'}
        </button>
      </form>
    </div>
  );
}