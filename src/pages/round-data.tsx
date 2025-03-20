import { compute_round, IncludeRoundInfo } from '@/lib/roundInfoCalculator/computeRound';
import { BTD6Map } from '@prisma/client';
import React, { FormEvent, useEffect, useState } from 'react';

export default function RoundDataPage() {
  const [maps, setMaps] = useState<BTD6Map[]>([]);

  const [seed, setSeed] = useState<number | null>(null);
  const [startingRound, setStartingRound] = useState<number>(1);
  const [endingRound, setEndingRound] = useState<number>(1);

  const [resultDisplay, setResultDisplay] = useState<string[]>([]);

  type IncludeRoundKey = keyof IncludeRoundInfo;
  const includeRoundInfoParams: IncludeRoundKey[] = [
    'cash',
    'RBE',
    'sendTime',
    'FBADs',
    'BADs',
    'fullRound'
  ];

  const [includeInfo, setIncludeInfo] = useState<IncludeRoundInfo>({
    cash: true,
    RBE: true,
    sendTime: false,
    FBADs: true,
    BADs: true,
    fullRound: false,
  });
  const [saveFile, setSaveFile] = useState<File | null>(null);
  const [mapId, setMapId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch BTD6 maps
        const mapsRes = await fetch('/api/maps');
        const mapsData = await mapsRes.json();
        setMaps(mapsData.maps);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleParamChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setIncludeInfo(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    //TODO handle frontend incorrect input data

    try {
      let seedToUse = seed;

      if (!seed) {
        if (!saveFile || !mapId) {
          throw new Error("No seed and no save file with map was specified");
        }
        const formDataToSend = new FormData();
        formDataToSend.append('btd6MapId', mapId);
        formDataToSend.append('saveFile', saveFile);
        const response = await fetch('/api/seed-from-save', {
          method: 'POST',
          body: formDataToSend,
          // Don't set Content-Type header - the browser will set it with the boundary for FormData
        });

        const data = await response.json();
        console.log("data:", data);
      
        if (!response.ok) {
          throw new Error(data.message || 'Failed to get seed from save file');
        }
        
        setSeed(data.seed);
        seedToUse = data.seed;
      }

      if (!seedToUse) {
        throw new Error("No seed could be found");
      }

      const result = compute_round(seedToUse, startingRound, endingRound, includeInfo);
      const resultArray: string[] = [];
      if (includeInfo.cash) resultArray.push(`Total Cash: ${result.total_cash}`);
      if (includeInfo.RBE) resultArray.push(`Total RBE: ${result.total_RBE}`);
      if (includeInfo.sendTime) resultArray.push(`Total Time: ${result.total_time}`);
      if (includeInfo.FBADs) resultArray.push(`Total FBADs: ${result.total_FBADs}`);
      if (includeInfo.BADs) resultArray.push(`Total BADs: ${result.total_BADs}`);
      if (includeInfo.fullRound) resultArray.push(`Full Round: ${result.full_rounds}`);
      
      setResultDisplay(resultArray);
      
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="parent">
        <div className="container">
            
            <h1>Round Data Getter</h1>
            <p>Aproximately 99.9% accuracy</p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div>
                    <label htmlFor="saveFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Save File (Optional)
                    </label>
                    <input
                      type="file"
                      id="saveFile"
                      name="saveFile"
                      onChange={(e => setSaveFile(e.target.files?.[0] ?? null))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={isLoading}
                    />
                    {saveFile && (
                      <p className="mt-1 text-sm text-gray-500">
                        Selected: {saveFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="btd6MapId" className="block text-sm font-medium text-gray-700 mb-1">
                      Map
                    </label>
                    <select
                      id="btd6MapId"
                      name="btd6MapId"
                      value={mapId}
                      onChange={e => setMapId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={isLoading}
                    >
                      <option value="">Select Map</option>
                      {maps.map(btd6Map => (
                        <option key={btd6Map.id} value={btd6Map.id}>
                          {btd6Map.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="seed" className="block text-sm font-medium text-gray-700 mb-1">
                      Seed
                    </label>
                    <input
                      type="number"
                      id="seed"
                      name="seed"
                      value={seed || ''}
                      onChange={e => setSeed(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Round
                  </label>
                  <input
                    type="number"
                    id="startingRound"
                    name="startingRound"
                    min="1"
                    value={startingRound || ''}
                    onChange={e => setStartingRound(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ending Round
                  </label>
                  <input
                    type="number"
                    id="endingRound"
                    name="endingRound"
                    min="1"
                    value={endingRound || ''}
                    onChange={e => setEndingRound(parseInt(e.target.value, 10) || 0)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isLoading}
                  />
                </div>

                <fieldset>
                    <legend>Info to show:</legend>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {includeRoundInfoParams.map(param => (
                        <div key={param} className="flex items-center">
                          <input
                            type="checkbox"
                            id={param}
                            name={param}
                            value={param}
                            checked={includeInfo[param]}
                            onChange={handleParamChecked}
                            className="mr-2"
                            disabled={isLoading}
                          />
                          <label htmlFor={param} className="text-sm">
                            {param
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Run'}
                </button>
            </form>

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

            <div className="roundData" id="round_data">
                {resultDisplay.map(text =>
                <div key={text} className="flex items-center">
                  <label>{text}</label>
                </div>
                )}
            </div>
        </div>
      </div>
    </>
  )
}