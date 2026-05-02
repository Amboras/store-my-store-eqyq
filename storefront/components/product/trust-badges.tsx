import { Truck, RotateCcw, Lock, BadgeCheck, Leaf, Award } from 'lucide-react'

const BADGES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    note: 'On orders over $75',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    note: 'No questions asked',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    note: 'SSL encrypted',
  },
  {
    icon: BadgeCheck,
    title: 'Quality Promise',
    note: 'Inspected by hand',
  },
  {
    icon: Leaf,
    title: 'Ethically Made',
    note: 'Sustainably sourced',
  },
  {
    icon: Award,
    title: '10K+ Happy',
    note: 'Customers worldwide',
  },
]

export default function TrustBadges() {
  return (
    <section className="border-t bg-muted/30">
      <div className="container-custom py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8">
          {BADGES.map(({ icon: Icon, title, note }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
