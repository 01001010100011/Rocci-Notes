import { useEffect } from 'react'

const SITE = 'Rocci Notes'

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE
  }, [title])
}
