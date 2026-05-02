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
    <section className="border-y border-[#C9261A]/10 bg-gradient-to-b from-[#FFE0C2]/60 to-[#FFD4AE]/60">
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8">
          {BADGES.map(({ icon: Icon, title, note }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-white ring-1 ring-[#C9261A]/15 shadow-sm flex items-center justify-center mb-3">
                <Icon className="h-6 w-6 text-[#C9261A]" strokeWidth={1.8} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1 text-[#3A0F08]">{title}</p>
              <p className="text-[11px] text-[#7A1F12]/70 leading-snug">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
