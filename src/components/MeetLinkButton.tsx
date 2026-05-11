'use client'

import { useState } from 'react'
import { Video, ExternalLink, Copy, Check } from 'lucide-react'

export function MeetLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all"
      >
        <Video className="h-3.5 w-3.5" />
        Entrar na Sala
        <ExternalLink className="h-3 w-3 opacity-70" />
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-gray-400 border border-white/5 rounded-lg text-xs hover:bg-white/10 transition-all"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
