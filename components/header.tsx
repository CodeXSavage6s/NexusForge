import Link from 'next/link'
import Image from 'next/image'

export default function header() {
  return (
    <div className="flex justify-between gap-2">
      <div>
        <Link href="/">
          <Image src="/assets/logo.svg" width={200} height={100} alt="NexusForge Logo" />
        </Link>
      </div>
      <div>
        
      </div>
      <div>
        
      </div>
    </div>
  )
}