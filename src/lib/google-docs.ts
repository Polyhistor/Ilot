/**
 * Convert a standard Google Docs URL into the direct PDF-export URL so a click
 * triggers an immediate download instead of opening the document in the browser.
 *
 *   https://docs.google.com/document/d/{id}/edit?tab=t.0
 *   → https://docs.google.com/document/d/{id}/export?format=pdf
 *
 * The doc must be set to "Anyone with the link can view" — otherwise the
 * export URL redirects to a Google login page.
 *
 * Returns null if the input is not a recognizable Google Docs URL, so callers
 * can decide whether to hide the download button.
 */
export function toGoogleDocsPdfUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/^https?:\/\/docs\.google\.com\/document\/d\/([^/?#]+)/i)
  if (!match) return null
  return `https://docs.google.com/document/d/${match[1]}/export?format=pdf`
}
