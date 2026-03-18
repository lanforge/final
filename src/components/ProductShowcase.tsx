import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  specs: string[];
  imageColor: string;
  series: string;
}

const products: Product[] = [
  // LANForge Series (3 products)
  {
    id: 1,
    name: 'LANForge Pro',
    description: 'High‑end gaming PC with RTX 4080 Super',
    price: '$2,499',
    specs: ['RTX 4080 Super', 'Intel i7‑14700K', '32GB DDR5', '2TB NVMe'],
    imageColor: '#3a86ff',
    series: 'LANForge Series'
  },
  {
    id: 2,
    name: 'LANForge Elite',
    description: 'Extreme performance with RTX 4090',
    price: '$3,599',
    specs: ['RTX 4090', 'AMD Ryzen 9 7950X', '64GB DDR5', '4TB NVMe'],
    imageColor: '#8338ec',
    series: 'LANForge Series'
  },
  {
    id: 3,
    name: 'LANForge Stream',
    description: 'Perfect for streaming & content creation',
    price: '$1,899',
    specs: ['RTX 4070 Ti', 'AMD Ryzen 7 7800X3D', '32GB DDR5', '2TB NVMe'],
    imageColor: '#ff006e',
    series: 'LANForge Series'
  },
  // LANForge Mini Series (3 products)
  {
    id: 4,
    name: 'LANForge Mini Pro',
    description: 'Compact powerhouse with RTX 4070',
    price: '$1,799',
    specs: ['RTX 4070', 'AMD Ryzen 7 7700X', '32GB DDR5', '2TB NVMe'],
    imageColor: '#06d6a0',
    series: 'Mini Series'
  },
  {
    id: 5,
    name: 'LANForge Mini Elite',
    description: 'Small form factor with RTX 4080',
    price: '$2,299',
    specs: ['RTX 4080', 'Intel i5‑14600K', '32GB DDR5', '2TB NVMe'],
    imageColor: '#118ab2',
    series: 'Mini Series'
  },
  {
    id: 9,
    name: 'LANForge Mini Stream',
    description: 'Mini ITX build for 1440p gaming',
    price: '$1,999',
    specs: ['RTX 4070 Super', 'AMD Ryzen 5 7600X', '32GB DDR5', '2TB NVMe'],
    imageColor: '#ff9e00',
    series: 'Mini Series'
  },
  // Ready to Ship Series (3 products)
  {
    id: 8,
    name: 'LANForge Essential',
    description: 'Great performance for 1080p gaming',
    price: '$999',
    specs: ['RTX 4060', 'AMD Ryzen 5 7600X', '16GB DDR5', '1TB NVMe'],
    imageColor: '#8a8d93',
    series: 'Ready to Ship'
  },
  {
    id: 10,
    name: 'LANForge Valorant Ready',
    description: 'Optimized for competitive esports',
    price: '$1,299',
    specs: ['RTX 4060 Ti', 'Intel i5‑14600KF', '16GB DDR5', '1TB NVMe'],
    imageColor: '#7209b7',
    series: 'Ready to Ship'
  },
  {
    id: 11,
    name: 'LANForge Office Pro',
    description: 'Productivity powerhouse with gaming capability',
    price: '$1,499',
    specs: ['RTX 4060', 'AMD Ryzen 7 7700', '32GB DDR5', '2TB NVMe'],
    imageColor: '#4cc9f0',
    series: 'Ready to Ship'
  }
];

const ProductShowcase: React.FC = () => {
  // Group products by series
  const seriesGroups = products.reduce((groups, product) => {
    const series = product.series;
    if (!groups[series]) {
      groups[series] = [];
    }
    groups[series].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  const seriesOrder = ['LANForge Series', 'Mini Series', 'Ready to Ship'];

  return (
    <section className="section py-32 relative overflow-hidden bg-gray-950" id="products">
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
            <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Premium Builds</span>
          </div>
          
          <h2 className="heading-2 mb-6">
            Featured <span className="text-gradient-neon">Builds</span>
          </h2>
          
          <p className="body-large max-w-3xl mx-auto">
            Choose from our curated selection of premium gaming PCs or customize every component to create your perfect system.
          </p>
        </motion.div>
        
        {seriesOrder.map((series, seriesIndex) => {
          const seriesProducts = seriesGroups[series];
          if (!seriesProducts) return null;
          
          return (
            <motion.div 
              key={series}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: seriesIndex * 0.2 }}
              className="mb-20 last:mb-0"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="heading-3 mb-2">{series}</h3>
                  <p className="text-gray-400">
                    {series === 'LANForge Series' && 'Flagship performance for serious gamers'}
                    {series === 'Mini Series' && 'Compact powerhouses for space-conscious setups'}
                    {series === 'Ready to Ship' && 'Pre-configured systems ready for immediate delivery'}
                  </p>
                </div>
                <div className="hidden md:block">
                  <span className="text-sm text-gray-500">{seriesProducts.length} models</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {seriesProducts.map((product, productIndex) => (
                  <div
                    key={product.id}
                    className="bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50 group"
                  >
                    <div className="p-6">
                      {/* Series badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-cyan-500/50 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: product.imageColor }}
                        />
                        <span className="text-xs font-medium text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">{product.series}</span>
                      </div>
                      
                      {/* Product image */}
                      <div className="relative mb-6">
                        <div 
                          className="w-full h-48 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: `${product.imageColor}20` }}
                        >
                          <div className="text-6xl opacity-30">🖥️</div>
                          <div 
                            className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl"
                            style={{ backgroundColor: product.imageColor }}
                          />
                        </div>
                        
                        {/* Price tag */}
                        <div className="absolute top-4 right-4">
                          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">{product.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xl font-bold text-white mb-2">{product.name}</h4>
                          <p className="text-gray-400 text-sm">{product.description}</p>
                        </div>
                        
                        {/* Specs */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-500">Key Specs</div>
                          <ul className="space-y-2">
                            {product.specs.map((spec, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                                {spec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                          <Link to={`/configurator?model=${product.id}`}>
                            <div className="skew-x-[-10deg] bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
                              <button className="skew-x-[10deg] px-6 py-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 hover:from-cyan-300 hover:to-cyan-500 transition-all duration-300">
                                Customize
                              </button>
                            </div>
                          </Link>
                          <Link to={`/products/${product.id}`}>
                            <div className="skew-x-[-10deg] bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
                              <button className="skew-x-[10deg] px-6 py-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 hover:from-cyan-300 hover:to-cyan-500 transition-all duration-300">
                                Details
                              </button>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-xl p-8 max-w-3xl mx-auto shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50">
            <h3 className="heading-3 mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Don't see what you're looking for?</h3>
            <p className="body-large mb-8 text-gray-300">
              Build your perfect PC from scratch with our configurator. Choose every component and create a system tailored to your exact needs.
            </p>
            <Link to="/configurator">
              <div className="skew-x-[-10deg] bg-black/40 backdrop-blur-md border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50 inline-block">
                <button className="skew-x-[10deg] px-8 py-4 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 hover:from-cyan-300 hover:to-cyan-500 transition-all duration-300">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start Custom Build
                </button>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
