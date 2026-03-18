import React from 'react';
import { motion } from 'framer-motion';

const reviews = [
  {
    id: 1,
    name: 'Alex R.',
    role: 'Professional Streamer',
    rating: 5,
    comment: 'My LANForge Pro handles 4K streaming while gaming at max settings. Zero lag, incredible performance!',
    avatarColor: '#3a86ff'
  },
  {
    id: 2,
    name: 'Jordan T.',
    role: 'Game Developer',
    rating: 5,
    comment: 'The build quality is exceptional. Cable management is pristine, and thermals are better than expected.',
    avatarColor: '#8338ec'
  },
  {
    id: 3,
    name: 'Casey L.',
    role: 'Competitive Gamer',
    rating: 5,
    comment: 'Went from Diamond to Master in Valorant after upgrading. The 360Hz monitor + PC combo is unreal.',
    avatarColor: '#ff006e'
  },
  {
    id: 4,
    name: 'Taylor M.',
    role: 'Content Creator',
    rating: 5,
    comment: 'Renders 8K video in half the time of my old workstation. Worth every penny for my workflow.',
    avatarColor: '#fb5607'
  },
  {
    id: 5,
    name: 'Morgan K.',
    role: 'VR Enthusiast',
    rating: 5,
    comment: 'Perfect for VR development and gaming. The RTX 4090 handles everything I throw at it effortlessly.',
    avatarColor: '#06d6a0'
  },
  {
    id: 6,
    name: 'Riley J.',
    role: 'Esports Coach',
    rating: 5,
    comment: 'My team uses LANForge systems exclusively. The reliability and performance are unmatched.',
    avatarColor: '#7209b7'
  }
];

const Reviews: React.FC = () => {
  return (
    <section className="section py-32 relative overflow-hidden bg-gray-950">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>
      
      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-cyan-500/50 mb-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Customer Reviews</span>
          </div>
          
          <h2 className="heading-2 mb-6">
            What Our <span className="text-gradient-cyber">Customers Say</span>
          </h2>
          
          <p className="body-large max-w-3xl mx-auto">
            Join thousands of satisfied gamers, creators, and professionals who trust LANForge for their PC needs.
          </p>
        </motion.div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50 group"
            >
              <div className="p-6">
                {/* Review header */}
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: review.avatarColor }}
                  >
                    {review.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white">{review.name}</h4>
                        <p className="text-sm text-gray-400">{review.role}</p>
                      </div>
                      <div className="flex text-yellow-400">
                        {'★'.repeat(review.rating)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Review comment */}
                <p className="text-gray-300 italic mb-6">"{review.comment}"</p>
                
                {/* Verified badge */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Purchase</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="grid grid-cols-3 gap-6">
            {[
              { number: '4.9/5', label: 'Average Rating', icon: '⭐' },
              { number: '98%', label: 'Satisfaction Rate', icon: '❤️' },
              { number: '24/7', label: 'Support Available', icon: '🛡️' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-xl text-center p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
                <div className="text-2xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-2">{stat.number}</div>
                <div className="text-sm text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4">
            <div className="skew-x-[-10deg] bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
              <button className="skew-x-[10deg] px-6 py-3 font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 hover:from-cyan-300 hover:to-cyan-500 transition-all duration-300">
                Read More Reviews
              </button>
            </div>
            <div className="skew-x-[-10deg] bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
              <button className="skew-x-[10deg] px-6 py-3 font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 hover:from-cyan-300 hover:to-cyan-500 transition-all duration-300">
                Write a Review
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Reviews;
