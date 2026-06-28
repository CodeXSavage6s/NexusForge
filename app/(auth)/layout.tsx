import Image from 'next/image'
import Link from 'next/link'

const Layout = async ({ children } : {
  children : React.ReactNode
}) => {
  return (
    <main className="flex flex-col justify-between min-h-screen overflow-hidden relative">
      <section className="">
        <div className="mb-2">
          <Link href="/">
            <Image src="/assets/logo.svg" width={250} height={100} alt="logo.svg" />
          </Link>
        </div>
        <div className="overflow-auto">{children}</div>
      </section>
      <section className="bg-card">
        <div className="z-10 relative text-gray-400 text-md font-serif font-semibold bg-card p-2 mb-3 flex flex-col gap-2">
          <blockquote className="">
            The all-in-one workspace for freelancers to manage clients, projects, and payments.
          </blockquote>
          <div className="flex gap-2 items-center justify-between">
            <cite className="text-sm italic">NexusForge corps</cite>
            <div className="flex">
            {
              [1, 2, 3, 4, 5].map(star => (
              <Image src="/assets/star.svg" width={25} height={25} alt="star.svg" />
              ))
            }
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Layout