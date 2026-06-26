'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { problems, features, steps, pricingPlans, footerColumns, ITEMS_PER_PAGE } from '@/lib/constants/home-constants'
import ThemeToggle from '@/components/theme-toggle'


const Home = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activePage, setActivePage] = useState(0)

  const pages = Array.from(
    { length: Math.ceil(features.length / ITEMS_PER_PAGE) },
    (_, i) => features.slice(i * ITEMS_PER_PAGE, i * ITEMS_PER_PAGE + ITEMS_PER_PAGE)
  )

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActivePage(index)
  }

  const goToPage = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Header */}
      <header className="header flex items-center justify-between px-4 py-3 border-b">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/assets/logo.svg" width={170} height={60} alt="NexusForge" />
        </Link>
        

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
        <ThemeToggle />
          <Link href="/sign-in">
            <Button >Sign In</Button>
          </Link>
          <Link href="/sign-up" className="hidden sm:block">
            <Button className="blue-btn">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-4">
        <div className="light-blue-bg text-blue-600 rounded-full px-2 py-1 text-[9px] font-medium w-fit my-4 border border-blue-200">
          + All-in-one workspace for freelancers
        </div>

        <article>
          <h1 className="h1">
            Manage Clients,
            <br />
            <span className="text-blue-500">Projects, and Invoices</span>
            <br />
            from One Dashboard
          </h1>
          <p className="text-sm text-gray-500 text-center mt-3 max-w-sm mx-auto">
            A simple workspace for freelancers to track clients, projects, deadlines, and payments.
          </p>
        </article>

        <div className="flex flex-col gap-2 my-4 w-full max-w-sm">
          <Button className="blue-btn">
            <Link href="/sign-up" className="w-full">
              Get Started &ndash; It&apos;s Free
            </Link>
          </Button>
          <Button className="black-btn" variant="outline">
            <Link href="/demo" className="w-full">
              View Demo
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-gray-500 mb-6">
          <span>No credit card required</span>
          <span>Free forever plan</span>
          <span>Cancel anytime</span>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-card px-4 py-8">
        <article className="text-center">
          <h2>
            Freelancing is hard enough,
            <br />
            <span className="text-blue-500">Managing it shouldn&apos;t be.</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Juggling between multiple tools leads to missed deadlines, lost information, and late payments.
          </p>
        </article>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          {problems.map((pro) => (
            <div
              key={pro}
              className="flex flex-col justify-between gap-3 bg-popover p-3 rounded-lg shadow-sm shadow-muted-foreground transition-shadow hover:shadow-md"
            >
              <Image src="/svgs/icon-cross.svg" width={24} height={24} alt="" />
              <p className="text-[12px] font-bold">{pro}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-8">
        <article className="text-center">
          <h2>
            Everything you need to run
            <br />
            your <span className="text-blue-400">freelancing business</span>
          </h2>
        </article>

        {/* Carousel: small screens */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory my-4 md:hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              className="grid grid-cols-3 gap-2 w-full flex-shrink-0 snap-start"
            >
              {page.map((fea) => (
                <div
                  key={fea.title}
                  className="flex flex-col justify-evenly bg-card rounded-lg text-center items-center p-2"
                >
                  <Image src={fea.path} width={30} height={30} alt={fea.title} />
                  <strong>{fea.title}</strong>
                  <small>{fea.description}</small>
                </div>
              ))}
            </div>
          ))}
        </div>

        {pages.length > 1 && (
          <div className="flex justify-center gap-2 pb-3 md:hidden">
            {pages.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to feature set ${index + 1}`}
                onClick={() => goToPage(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activePage ? 'w-5 bg-blue-500' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Static grid: medium screens and up */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
          {features.map((fea) => (
            <div
              key={fea.title}
              className="flex flex-col justify-evenly bg-card rounded-lg text-center items-center p-3"
            >
              <Image src={fea.path} width={30} height={30} alt={fea.title} />
              <strong className="mt-2">{fea.title}</strong>
              <small className="text-gray-500">{fea.description}</small>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-10 text-center">
        <h2>How NexusForge Works</h2>

        <div className="flex md:flex-row md:justify-center md:items-start gap-6 md:gap-4 mt-6 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center gap-4 md:gap-2 md:flex-1 text-center">
              <div className="flex items-center w-full md:w-auto md:flex-col">
                <div className="flex items-center justify-center h-10 w-10 rounded-full light-blue-bg text-blue-600 font-bold shrink-0">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block h-px flex-1 border-t border-dashed border-blue-200 mx-2" />
                )}
              </div>
              <div className="text-left md:text-center">
                <p className="font-bold text-sm">{step.title}</p>
                <p className="text-[12px] text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-card px-4 py-10 text-center">
        <h2>Simple, transparent pricing</h2>
        <p className="text-sm text-gray-500 mt-2">Start free and upgrade when you&apos;re ready.</p>

        <div className="flex flex-col md:flex-row justify-center gap-4 mt-6 max-w-2xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`flex-1 text-left bg-popover rounded-xl p-5 border ${
                plan.highlighted ? 'border-blue-300 shadow-sm' : 'border-muted-foreground/20'
              }`}
            >
            <div className="flex justify-between mb-2 items-center">
            <div>
              <p className="font-bold">{plan.name}</p>
              <p className="mt-1">
                {plan.price === "Coming Soon" ?
                <span className="text-2xl font-bold italic font-serif">{plan.price}</span>
                :
                <span className="text-2xl font-bold">{plan.price}</span>
                }
                {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
              </p>
            </div>

              <ul className="mt-3 flex flex-col gap-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-[13px] flex items-center gap-2 text-gray-600">
                    <span className="text-blue-500">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

              <Link href={plan.href}>
                <Button className={`w-full mt-4 ${plan.highlighted ? 'blue-btn' : 'black-btn'}`}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-8">
        <div className="bg-card rounded-xl p-5 flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
          <p className="font-bold">Ready to organize your freelance business?</p>
          <Link href="/sign-up" className="w-full max-w-xs">
            <Button className="blue-btn w-full">Get Started &ndash; It&apos;s Free</Button>
          </Link>
          <p className="text-[11px] text-gray-500">
            No credit card required &middot; Free forever plan &middot; Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 max-w-4xl mx-auto">
          <div className="max-w-xs">
            <Image src="/assets/logo.svg" width={120} height={32} alt="NexusForge" />
            <p className="text-[12px] text-gray-500 mt-2">
              The all-in-one workspace for freelancers to manage clients, projects, and payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="font-bold text-sm mb-2">{col.title}</p>
                <ul className="flex flex-col gap-1">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[13px] text-gray-500">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} NexusForge. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default Home
