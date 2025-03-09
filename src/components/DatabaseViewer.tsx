// components/DatabaseViewer.tsx
import { useState } from 'react'
import useSWR from 'swr'
import React from 'react'

const models = ['user', 'submission', 'bTD6Map', 'gameType', 'challenge']
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DatabaseViewer() {
  const [selectedModel, setSelectedModel] = useState('user')
  const { data: records } = useSWR(`/api/admin/data?model=${selectedModel}`, fetcher)

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="p-2 border rounded"
        >
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {records?.[0] && Object.keys(records[0]).map(key => (
                <th key={key} className="px-6 py-3 text-left">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records?.map((record: { [s: string]: unknown } | ArrayLike<unknown>, index: React.Key | null | undefined) => (
              <tr key={index}>
                {Object.values(record).map((value, i) => (
                  <td key={i} className="px-6 py-4 max-w-xs truncate">
                    {typeof value === 'object' 
                      ? JSON.stringify(value)
                      : value?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}