import { useEffect } from 'react'

export function useKey(callback, key) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code?.toLowerCase() === key.toLowerCase()) {
        callback?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [callback, key])
}
