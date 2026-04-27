import Image from 'next/image'
import type { Author } from '@/lib/db/types'

interface Props {
  author: Author | null
  size?: 'sm' | 'md'
}

export function AuthorByline({ author, size = 'md' }: Props) {
  const name = author?.name ?? 'Ilot'
  const role = author?.role ?? 'Legal & Business Experts'
  const photoUrl = author?.photo_url ?? null
  const imgSize = size === 'sm' ? 28 : 36

  return (
    <div className="flex items-center gap-2">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          width={imgSize}
          height={imgSize}
          className="rounded-full object-cover"
        />
      ) : (
        <div
          className="rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold text-foreground/60"
          style={{ width: imgSize, height: imgSize }}
        >
          {name[0]}
        </div>
      )}
      <div>
        <p className={`font-medium text-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {name}
        </p>
        {size === 'md' && (
          <p className="text-xs text-muted">{role}</p>
        )}
      </div>
    </div>
  )
}
