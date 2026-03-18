import React from 'react';
import { motion } from 'framer-motion';

interface OrganizationPartner {
  id: number;
  name: string;
  description: string;
  logoColor: string;
  category: string;
  partnershipType: string;
  since: string;
  website: string;
}

interface IndividualPartner {
  id: number;
  name: string;
  role: string;
  expertise: string[];
  avatarColor: string;
  social: {
    twitter?: string;
    twitch?: string;
    youtube?: string;
    instagram?: string;
  };
  achievements: string[];
}

const organizationPartners: OrganizationPartner[] = [
  {
    id: 1,
    name: 'Dignitas',
    description: 'World-renowned esports organization with championship-winning teams across multiple games',
    logoColor: '#ff6b35',
    category: 'Esports',
    partnershipType: 'Official PC Partner',
    since: '2025',
    website: 'https://dignitas.gg'
  },
  {
    id: 2,
    name: 'NVIDIA',
    description: 'Global leader in graphics processing units and AI computing',
    logoColor: '#76b900',
    category: 'Hardware',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://nvidia.com'
  },
  {
    id: 3,
    name: 'Intel',
    description: 'Pioneer in semiconductor manufacturing and processor technology',
    logoColor: '#0071c5',
    category: 'Hardware',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://intel.com'
  },
  {
    id: 4,
    name: 'AMD',
    description: 'Innovator in high-performance computing and graphics solutions',
    logoColor: '#ed1c24',
    category: 'Hardware',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://amd.com'
  },
  {
    id: 5,
    name: 'Corsair',
    description: 'Leading manufacturer of high-performance gaming peripherals and components',
    logoColor: '#ffffff',
    category: 'Peripherals',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://corsair.com'
  },
  {
    id: 6,
    name: 'ASUS ROG',
    description: 'Premium gaming hardware brand known for innovative motherboard and GPU designs',
    logoColor: '#ff0029',
    category: 'Hardware',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://rog.asus.com'
  },
  {
    id: 7,
    name: 'Lian Li',
    description: 'Industry leader in premium PC cases and cooling solutions',
    logoColor: '#00a8ff',
    category: 'Cases',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://lian-li.com'
  },
  {
    id: 8,
    name: 'Samsung',
    description: 'Global technology leader in memory and storage solutions',
    logoColor: '#1428a0',
    category: 'Storage',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://samsung.com'
  },
  {
    id: 9,
    name: 'Cooler Master',
    description: 'Innovator in PC cooling solutions and gaming peripherals',
    logoColor: '#1a1a1a',
    category: 'Cooling',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://coolermaster.com'
  },
  {
    id: 10,
    name: 'G.Skill',
    description: 'Premium memory manufacturer specializing in high-performance RAM',
    logoColor: '#ff6600',
    category: 'Memory',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://gskill.com'
  },
  {
    id: 11,
    name: 'Seasonic',
    description: 'Industry-leading power supply manufacturer with focus on reliability',
    logoColor: '#00a651',
    category: 'Power Supplies',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://seasonic.com'
  },
  {
    id: 12,
    name: 'Fractal Design',
    description: 'Award-winning PC case manufacturer known for minimalist design',
    logoColor: '#333333',
    category: 'Cases',
    partnershipType: 'Component Partner',
    since: '2025',
    website: 'https://fractal-design.com'
  }
];

const individualPartners: IndividualPartner[] = [
  {
    id: 1,
    name: 'Alex "Mendo" Mendoza',
    role: 'Professional Streamer & Content Creator',
    expertise: ['FPS Gaming', 'PC Building', 'Performance Optimization'],
    avatarColor: '#3a86ff',
    social: {
      twitch: 'mendo',
      twitter: 'mendo',
      youtube: 'mendo'
    },
    achievements: [
      'Former professional Overwatch player',
      '500K+ Twitch followers',
      'LANForge system ambassador since 2025'
    ]
  },
  {
    id: 2,
    name: 'Sarah "TechWitch" Chen',
    role: 'PC Building Expert & Educator',
    expertise: ['Custom Water Cooling', 'SFF Builds', 'Aesthetic Design'],
    avatarColor: '#8338ec',
    social: {
      youtube: 'techwitch',
      twitter: 'techwitch',
      instagram: 'techwitch'
    },
    achievements: [
      'Featured in PC Gamer and TechSpot',
      '200K+ YouTube subscribers',
      'LANForge technical consultant'
    ]
  },
  {
    id: 3,
    name: 'Marcus "Benchmark" Rodriguez',
    role: 'Performance Analyst & Reviewer',
    expertise: ['Benchmarking', 'Hardware Testing', 'Performance Analysis'],
    avatarColor: '#ff006e',
    social: {
      youtube: 'benchmark',
      twitter: 'benchmark',
      twitch: 'benchmark'
    },
    achievements: [
      'Published 500+ hardware reviews',
      'Industry-recognized testing methodology',
      'LANForge performance validation partner'
    ]
  },
  {
    id: 4,
    name: 'Jamie "BuildMaster" Wilson',
    role: 'Custom PC Specialist',
    expertise: ['Extreme Overclocking', 'Modding', 'RGB Integration'],
    avatarColor: '#06d6a0',
    social: {
      twitch: 'buildmaster',
      youtube: 'buildmaster',
      instagram: 'buildmaster'
    },
    achievements: [
      'Multiple world record overclocks',
      'Featured at major tech conventions',
      'LANForge extreme build specialist'
    ]
  },
  {
    id: 5,
    name: 'Lisa "PixelQueen" Thompson',
    role: 'Content Creator & Designer',
    expertise: ['Stream Setup Design', 'Aesthetic Builds', 'Content Production'],
    avatarColor: '#118ab2',
    social: {
      twitch: 'pixelqueen',
      youtube: 'pixelqueen',
      instagram: 'pixelqueen'
    },
    achievements: [
      'Award-winning stream setup designs',
      '100K+ Instagram followers',
      'LANForge aesthetic consultant'
    ]
  },
  {
    id: 6,
    name: 'David "SilentBuild" Kim',
    role: 'Silent PC Specialist',
    expertise: ['Noise Reduction', 'Thermal Management', 'Efficient Cooling'],
    avatarColor: '#ff9e00',
    social: {
      youtube: 'silentbuild',
      twitter: 'silentbuild'
    },
    achievements: [
      'Pioneer in silent PC building techniques',
      'Published research on acoustic optimization',
      'LANForge silent build expert'
    ]
  },
  {
    id: 7,
    name: 'Emma "RGBQueen" Martinez',
    role: 'RGB & Lighting Specialist',
    expertise: ['RGB Integration', 'Lighting Control', 'Visual Effects'],
    avatarColor: '#ef476f',
    social: {
      twitch: 'rgbqueen',
      youtube: 'rgbqueen',
      instagram: 'rgbqueen'
    },
    achievements: [
      'Industry-leading RGB synchronization techniques',
      'Featured in major tech publications',
      'LANForge lighting design partner'
    ]
  },
  {
    id: 8,
    name: 'Ryan "BudgetKing" Davis',
    role: 'Budget Build Expert',
    expertise: ['Cost Optimization', 'Value Analysis', 'Entry-Level Builds'],
    avatarColor: '#073b4c',
    social: {
      youtube: 'budgetking',
      twitter: 'budgetking'
    },
    achievements: [
      'Helped 10,000+ users build affordable PCs',
      'Best value award winner multiple years',
      'LANForge budget build consultant'
    ]
  }
];

const PartnersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-radial from-emerald-400/10 via-transparent to-transparent" />
        <div className="container-narrow relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="heading-1 mb-6">
              Our Partners
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              Collaborating with industry leaders and experts to deliver exceptional PC building experiences
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">12</div>
                <div className="text-gray-400">Organization Partners</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">8</div>
                <div className="text-gray-400">Individual Experts</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">2025</div>
                <div className="text-gray-400">Partnerships Started</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">Global</div>
                <div className="text-gray-400">Network Reach</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Organization Partners */}
      <section className="section">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">Organization Partners</h2>
              <p className="body-large max-w-3xl mx-auto">
                Collaborating with industry leaders to bring you the best components and technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {organizationPartners.map((partner, idx) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + idx * 0.05 }}
                  className="card-glow p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: partner.logoColor }}
                    >
                      {partner.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{partner.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                          {partner.category}
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-sm text-emerald-400">
                          {partner.partnershipType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">Partner since {partner.since}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{partner.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <a 
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gradient-neon font-medium hover:underline"
                    >
                      Visit Website →
                    </a>
                    <div className="text-sm text-gray-400">
                      Official Partner
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Individual Partners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">Individual Experts</h2>
              <p className="body-large max-w-3xl mx-auto">
                Working with industry experts to provide specialized knowledge and unique perspectives
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {individualPartners.map((partner, idx) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.05 }}
                  className="card-glow p-6"
                >
                  <div className="text-center mb-6">
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: partner.avatarColor }}
                    >
                      {partner.name.split(' ').map(n => n.charAt(0)).join('')}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{partner.name}</h3>
                    <div className="text-gradient-neon font-medium mb-2">{partner.role}</div>
                    <div className="text-sm text-gray-400">LANForge Partner</div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.expertise.map((skill, skillIdx) => (
                        <span 
                          key={skillIdx}
                          className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Notable Achievements</h4>
                    <ul className="space-y-2">
                      {partner.achievements.map((achievement, achievementIdx) => (
                        <li key={achievementIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">•</span>
                          <span className="text-gray-300 text-sm">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    {partner.social.twitter && (
                      <a 
                        href={`https://twitter.com/${partner.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        𝕏
                      </a>
                    )}
                    {partner.social.twitch && (
                      <a 
                        href={`https://twitch.tv/${partner.social.twitch}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <span className="text-purple-400">Tw</span>
                      </a>
                    )}
                    {partner.social.youtube && (
                      <a 
                        href={`https://youtube.com/${partner.social.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <span className="text-red-400">YT</span>
                      </a>
                    )}
                    {partner.social.instagram && (
                      <a 
                        href={`https://instagram.com/${partner.social.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                      >
                        <span className="text-pink-400">IG</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Become a LANForge Partner</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Join our network of industry leaders and experts. Whether you're an organization or individual,
              we're always looking for passionate partners to collaborate with.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="btn btn-primary">
                <span className="mr-2">🤝</span>
                Partner Inquiry
              </a>
              <a href="/press" className="btn btn-outline">
                <span className="mr-2">📰</span>
                Media Kit
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnersPage;
                   