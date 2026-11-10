import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface TestRecord {
  id: number
  name: string
}

export const SupabaseConnectionTest: React.FC = () => {
  const [records, setRecords] = useState<TestRecord[]>([])
  const [status, setStatus] = useState<'loading' | 'connected' | 'failed'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTestRecords() {
      try {
        const { data, error } = await supabase
          .from('test_connection')
          .select('*')

        if (error) {
          setStatus('failed')
          setErrorMessage(error.message)
        } else {
          setRecords(data || [])
          setStatus('connected')
        }
      } catch (err: unknown) {
        setStatus('failed')
        setErrorMessage(err instanceof Error ? err.message : 'Unknown connection error')
      }
    }

    fetchTestRecords()
  }, [])

  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-700/80 px-4 py-3 text-sm shadow-md">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-400">
            Supabase Status:
          </span>
          {status === 'loading' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Connecting...
            </span>
          )}
          {status === 'connected' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● Connected
            </span>
          )}
          {status === 'failed' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
              ✕ Failed
            </span>
          )}
        </div>

        {status === 'connected' && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Records from test_connection:</span>
            <div className="flex gap-2">
              {records.length > 0 ? (
                records.map((record) => (
                  <span
                    key={record.id}
                    className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-xs"
                  >
                    #{record.id}: {record.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 italic">No records found</span>
              )}
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-xs text-rose-300 font-mono bg-rose-950/40 px-3 py-1.5 rounded border border-rose-900/50">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}

