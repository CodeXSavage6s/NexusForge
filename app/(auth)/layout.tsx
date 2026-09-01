import Image from 'next/image'
import Link from 'next/link'
import { GetReviews, GetReviewStats } from '@/lib/actions/review'

const Layout = async ({ children } : {
  children : React.ReactNode
}) => {
  const [reviews, stats] = await Promise.all([GetReviews(), GetReviewStats()]);

  const featured = [...reviews].sort(
    (a, b) => b.rating - a.rating || b.createdAt.getTime() - a.createdAt.getTime()
  )[0];

  return (
      <main className="flex flex-col justify-between min-h-screen relative lg:flex-row">
      <section className="flex-1 flex flex-col lg:sticky lg:top-0 lg:min-h-screen">
        <div className="mb-2">
          <Link href="/">
            <Image src="/assets/logo.svg" width={250} height={100} alt="NexusForge Logo" />
          </Link>
        </div>
          <div className="flex-1 overflow-auto">{children}</div>
      </section>

      <section className="bg-card hidden lg:flex lg:flex-1 lg:flex-col lg:justify-end">
        <div className="z-10 relative text-gray-400 text-md font-serif font-semibold bg-card p-2 mb-3 flex flex-col gap-2">
          <blockquote className="">
            {featured
              ? `"${featured.comment}"`
              : "The all-in-one workspace for freelancers to manage clients, projects, and payments."}
          </blockquote>
          <div className="flex gap-2 items-center justify-between">
            <cite className="text-sm italic">
              {featured ? featured.author.name : "NexusForge corps"}
            </cite>
            <div className="flex">
            {
              [1, 2, 3, 4, 5].map(star => (
              <Image
                key={star}
                src="/assets/star.svg"
                width={25}
                height={25}
                alt=""
                aria-hidden="true"
                className={featured && star > featured.rating ? "opacity-25" : ""}
              />
              ))
            }
            </div>
          </div>
          {stats.count > 0 ? (
            <Link href="/reviews" className="footer-link text-xs">
              {stats.average.toFixed(1)} / 5 from {stats.count} freelancer{stats.count === 1 ? "" : "s"} — read more reviews
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default Layout