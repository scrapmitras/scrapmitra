import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { ScrapItem } from '@/types'

export interface LiveRateItem {
  id: string
  name: string
  category: string
  unit: string
  rate: number
  icon: string
  display_order: number
}

// Fallback baseline rates if database connection is loading
export const DEFAULT_RATES: LiveRateItem[] = [
  { id: '44444444-4444-4444-4444-444444444401', name: 'Newspaper', category: 'paper', unit: 'kg', rate: 14, icon: '📰', display_order: 1 },
  { id: '44444444-4444-4444-4444-444444444402', name: 'Cardboard Boxes', category: 'paper', unit: 'kg', rate: 12, icon: '📦', display_order: 2 },
  { id: '44444444-4444-4444-4444-444444444403', name: 'Plastic Bottles (PET)', category: 'plastic', unit: 'kg', rate: 10, icon: '🧴', display_order: 3 },
  { id: '44444444-4444-4444-4444-444444444404', name: 'Heavy Iron Scrap', category: 'metal', unit: 'kg', rate: 28, icon: '🔩', display_order: 4 },
  { id: '44444444-4444-4444-4444-444444444405', name: 'Copper Wires', category: 'metal', unit: 'kg', rate: 520, icon: '🔌', display_order: 5 },
  { id: '44444444-4444-4444-4444-444444444406', name: 'Old Refrigerator', category: 'appliances', unit: 'piece', rate: 800, icon: '❄️', display_order: 6 },
]

export function useScrapRates() {
  const [rates, setRates] = useState<LiveRateItem[]>(DEFAULT_RATES)
  const [rawItems, setRawItems] = useState<ScrapItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('scrap_items')
        .select('*, current_rate:scrap_rates(*)')
        .order('display_order', { ascending: true })

      if (!error && data && data.length > 0) {
        const formattedRaw = data.map((item: any) => ({
          ...item,
          current_rate: Array.isArray(item.current_rate) ? item.current_rate[0] : item.current_rate,
        }))
        setRawItems(formattedRaw as ScrapItem[])

        const mapped: LiveRateItem[] = formattedRaw.map((item: any) => {
          let icon = '📦'
          const lower = (item.name || '').toLowerCase()
          if (lower.includes('newspaper') || lower.includes('paper')) icon = '📰'
          else if (lower.includes('cardboard') || lower.includes('carton')) icon = '📦'
          else if (lower.includes('plastic') || lower.includes('bottle')) icon = '🧴'
          else if (lower.includes('iron')) icon = '🔩'
          else if (lower.includes('copper')) icon = '🔌'
          else if (lower.includes('brass')) icon = '🪔'
          else if (lower.includes('aluminium')) icon = '🥫'
          else if (lower.includes('refrigerator') || lower.includes('fridge')) icon = '❄️'
          else if (lower.includes('e-waste') || lower.includes('electronic')) icon = '💻'

          let cat = 'general'
          if (lower.includes('paper') || lower.includes('cardboard')) cat = 'paper'
          else if (lower.includes('plastic')) cat = 'plastic'
          else if (lower.includes('iron') || lower.includes('copper') || lower.includes('brass') || lower.includes('aluminium')) cat = 'metal'
          else if (lower.includes('refrigerator') || lower.includes('appliance')) cat = 'appliances'
          else if (lower.includes('e-waste')) cat = 'ewaste'

          return {
            id: item.id,
            name: item.name,
            category: cat,
            unit: item.unit || 'kg',
            rate: item.current_rate?.rate_per_unit ?? 0,
            icon,
            display_order: item.display_order || 99,
          }
        })

        setRates(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch live scrap rates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  return { rates, rawItems, isLoading, refetch: fetchRates }
}

