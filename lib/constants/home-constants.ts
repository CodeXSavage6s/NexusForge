export const problems = [
  "Too many tools to manage",
  "Scattered Client info",
  "Hard to track payments",
  "Missed Deadlines & follow-ups"
]

export const features = [
  {
    path: "svgs/feat-client-management.svg",
    title: "Client Management",
    description: "Store all client details, contacts, and notes in one place."
  },
  {
    path: "svgs/feat-project-tracking.svg",
    title: "Project Tracking",
    description: "Create projects, set deadlines, and track progress easily."
  },
  {
    path: "svgs/feat-invoice-generator.svg",
    title: "Invoice Generator",
    description: "Create professional invoices and get paid faster."
  },
  {
    path: "svgs/feat-task-todo.svg",
    title: "Task & To-Do",
    description: "Manage tasks, set priorities, and never miss a deadline."
  },
  {
    path: "svgs/feat-notes-files.svg",
    title: "Notes & Files",
    description: "Keep notes, contracts, and files organized by project."
  },
  {
    path: "svgs/feat-dashboard-reports.svg",
    title: "Dashboard & Reports",
    description: "Get a clear overview of your business and earnings."
  }
];

export const steps = [
  {
    number: 1,
    title: 'Add Clients',
    description: 'Store client details and important information.',
  },
  {
    number: 2,
    title: 'Create Projects',
    description: 'Break down your work and set deadlines.',
  },
  {
    number: 3,
    title: 'Track & Get Paid',
    description: 'Manage progress, send invoices, and grow.',
  },
]

export const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    cta: 'Get Started',
    href: '/sign-up',
    highlighted: true,
    features: ['Up to 5 Clients', 'Up to 10 Projects', 'Invoice & Quotes', 'Basic Reports'],
  },
  {
    name: 'Pro',
    price: 'Coming Soon',
    period: '',
    cta: 'Notify Me',
    href: '/waitlist',
    highlighted: false,
    features: ['Unlimited Clients', 'Unlimited Projects', 'Advanced Reports', 'Priority Support'],
  },
]

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export const ITEMS_PER_PAGE = 3
