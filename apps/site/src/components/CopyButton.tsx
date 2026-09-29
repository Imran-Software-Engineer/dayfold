import { useState } from 'react'

export default function CopyButton({
  text,
  label,
  done,
}: {
  text: string
  label: string
  done: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {}
      }}
    >
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  )
}
