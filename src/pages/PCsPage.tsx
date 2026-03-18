import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  specs: string[];
  imageColor: string;
  series: string;
  basePrice: number;
}

const products: Product[] = [
  {
    id: 1,
    name: 'LANForge Pro',
    description: 'High‑end gaming PC with RTX 4080 Super',
    price: '$2,499',
    specs: [
      'Case: Lian Li O11 Dynamic EVO',
      'CPU: Intel Core i7‑14700K',
      'GPU: NVIDIA GeForce RTX 4080 Super',
      'Motherboard: ASUS ROG Strix Z790-E Gaming',
      'RAM: 32GB Corsair Vengeance RGB DDR5 6000MHz',
      'SSD: 2TB Samsung 990 Pro NVMe',
      'PSU: Corsair RM1000e 1000W 80+ Gold',
      'Windows Edition: Windows 11 Pro'
    ],
    imageColor: '#3a86ff',
    series: 'LANForge Series',
    basePrice: 2499
  },
  {
    id: 2,
    name: 'LANForge Elite',
    description: 'Extreme performance with RTX 4090',
    price: '$3,599',
    specs: [
      'Case: Lian Li O11 Dynamic EVO XL',
      'CPU: AMD Ryzen 9 7950X',
      'GPU: NVIDIA GeForce RTX 4090',
      'Motherboard: ASUS ROG Crosshair X670E Hero',
      'RAM: 64GB G.Skill Trident Z5 RGB DDR5 6400MHz',
      'SSD: 4TB Samsung 990 Pro NVMe',
      'PSU: Seasonic Prime TX-1000 1000W 80+ Titanium',
      'Windows Edition: Windows 11 Pro'
    ],
    imageColor: '#8338ec',
    series: 'LANForge Series',
    basePrice: 3599
  },
  {
    id: 3,
    name: 'LANForge Stream',
    description: 'Perfect for streaming & content creation',
    price: '$1,899',
    specs: [
      'Case: NZXT H7 Flow',
      'CPU: AMD Ryzen 7 7800X3D',
      'GPU: NVIDIA GeForce RTX 4070 Ti',
      'Motherboard: ASUS TUF Gaming B650-PLUS',
      'RAM: 32GB Corsair Vengeance RGB DDR5 6000MHz',
      'SSD: 2TB Samsung 980 Pro NVMe',
      'PSU: Corsair RM850e 850W 80+ Gold',
      'Windows Edition: Windows 11 Home'
    ],
    imageColor: '#ff006e',
    series: 'LANForge Series',
    basePrice: 1899
  },
  {
    id: 4,
    name: 'LANForge Mini Pro',
    description: 'Compact powerhouse with RTX 4070',
    price: '$1,799',
    specs: [
      'Case: Fractal Design Meshify 2 Mini',
      'CPU: AMD Ryzen 7 7700X',
      'GPU: NVIDIA GeForce RTX 4070',
      'Motherboard: ASUS ROG Strix B650E-I Gaming',
      'RAM: 32GB G.Skill Flare X5 DDR5 6000MHz',
      'SSD: 2TB WD Black SN850X NVMe',
      'PSU: Corsair SF750 750W 80+ Platinum',
      'Windows Edition: Windows 11 Home'
    ],
    imageColor: '#06d6a0',
    series: 'Mini Series',
    basePrice: 1799
  },
  {
    id: 5,
    name: 'LANForge Mini Elite',
    description: 'Small form factor with RTX 4080',
    price: '$2,299',
    specs: [
      'Case: Lian Li A4-H2O',
      'CPU: Intel Core i5‑14600K',
      'GPU: NVIDIA GeForce RTX 4080',
      'Motherboard: ASUS ROG Strix Z790-I Gaming',
      'RAM: 32GB Corsair Vengeance DDR5 6000MHz',
      'SSD: 2TB Samsung 990 Pro NVMe',
      'PSU: Cooler Master V850 SFX 850W 80+ Gold',
      'Windows Edition: Windows 11 Pro'
    ],
    imageColor: '#118ab2',
    series: 'Mini Series',
    basePrice: 2299
  },
  {
    id: 6,
    name: 'LANForge Gaming Pro',
    description: 'Premium gaming performance with RTX 4070',
    price: '$1,999',
    specs: [
      'Case: Corsair 4000D Airflow',
      'CPU: AMD Ryzen 7 7700X',
      'GPU: NVIDIA GeForce RTX 4070',
      'Motherboard: ASUS TUF Gaming B650-PLUS',
      'RAM: 32GB Corsair Vengeance RGB DDR5 6000MHz',
      'SSD: 2TB Samsung 980 Pro NVMe',
      'PSU: Corsair RM850e 850W 80+ Gold',
      'Windows Edition: Windows 11 Home'
    ],
    imageColor: '#ff9e00',
    series: 'Ready to Ship',
    basePrice: 1999
  },
  {
    id: 7,
    name: 'LANForge Creator',
    description: 'Professional workstation for creators',
    price: '$2,899',
    specs: [
      'Case: Fractal Design Meshify 2',
      'CPU: Intel Core i9‑14900K',
      'GPU: NVIDIA GeForce RTX 4080',
      'Motherboard: ASUS ProArt Z790-CREATOR',
      'RAM: 64GB Corsair Vengeance RGB DDR5 6000MHz',
      'SSD: 4TB Samsung 990 Pro NVMe',
      'PSU: Seasonic Prime TX-1000 1000W 80+ Titanium',
      'Windows Edition: Windows 11 Pro'
    ],
    imageColor: '#9d4edd',
    series: 'Ready to Ship',
    basePrice: 2899
  },
  {
    id: 8,
    name: 'LANForge Compact',
    description: 'Space-saving performance PC',
    price: '$1,599',
    specs: [
      'Case: Cooler Master NR200P',
      'CPU: AMD Ryzen 5 7600X',
      'GPU: NVIDIA GeForce RTX 4060 Ti',
      'Motherboard: ASUS ROG Strix B650E-I Gaming',
      'RAM: 32GB G.Skill Flare X5 DDR5 6000MHz',
      'SSD: 1TB Samsung 980 Pro NVMe',
      'PSU: Corsair SF750 750W 80+ Platinum',
      'Windows Edition: Windows 11 Home'
    ],
    imageColor: '#00bbf9',
    series: 'Ready to Ship',
    basePrice: 1599
  },
];

const PCsPage: React.FC = () => {
  const [expandedSpecs, setExpandedSpecs] = useState<Record<number, boolean>>({});
  const [selectedSeries, setSelectedSeries] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('price-asc');

  const toggleSpecs = (productId: number) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Get unique series
  const allSeries = ['All', ...Array.from(new Set(products.map(p => p.series)))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => selectedSeries === 'All' || product.series === selectedSeries)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.basePrice - b.basePrice;
        case 'price-desc':
          return b.basePrice - a.basePrice;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Group by series for display
  const productsBySeries = filteredProducts.reduce((acc, product) => {
    if (!acc[product.series]) {
      acc[product.series] = [];
    }
    acc[product.series].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

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
              High-Performance Gaming PCs
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              Discover our complete lineup of custom-built gaming PCs, optimized for maximum performance, 
              stunning visuals, and seamless gameplay. Every system is hand-built and tested for excellence.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">8+</div>
                <div className="text-gray-400">PC Models</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">24/7</div>
                <div className="text-gray-400">Support</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">3-Year</div>
                <div className="text-gray-400">Warranty</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">Free</div>
                <div className="text-gray-400">Shipping</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Controls */}
      <section className="py-8 bg-gray-900/50 border-y border-gray-800/50">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-3">
              {allSeries.map(series => (
                <button
                  key={series}
                  onClick={() => setSelectedSeries(series)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedSeries === series
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {series}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select bg-gray-800/50 border-gray-700/50 text-gray-300 rounded-lg px-4 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section">
        <div className="container-narrow">
          {Object.entries(productsBySeries).map(([series, seriesProducts], seriesIndex) => (
            <motion.div
              key={series}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: seriesIndex * 0.1 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="heading-2 mb-2">{series}</h2>
                  <p className="text-gray-400">{seriesProducts.length} models available</p>
                </div>
                <div className="badge-primary">
                  {seriesProducts.length} PCs
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {seriesProducts.map((product) => {
                  const isExpanded = expandedSpecs[product.id] || false;
                  
                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -5 }}
                      className="card-glow group"
                    >
                      <div className="p-6">
                        {/* Product Image */}
                        <div className="mb-6">
                          <div 
                            className="relative h-48 rounded-xl overflow-hidden"
                            style={{ backgroundColor: product.imageColor }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-6xl opacity-30">🖥️</div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="badge-accent inline-block">
                                {product.series}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                              <p className="text-gray-400 mb-4">{product.description}</p>
                            </div>
                            <div className="text-2xl font-bold text-gradient-neon">
                              {product.price}
                            </div>
                          </div>

                          {/* Specs */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-300">Key Specifications</h4>
                              <button
                                onClick={() => toggleSpecs(product.id)}
                                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                {isExpanded ? 'Show Less' : 'View All Specs'}
                              </button>
                            </div>
                            <ul className="space-y-2">
                              {(isExpanded ? product.specs : product.specs.slice(0, 3)).map((spec, idx) => (
                                <li key={idx} className="flex items-start">
                                  <svg className="w-4 h-4 text-emerald-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-gray-300 text-sm">{spec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3">
                            <Link 
                              to={`/products/${product.id}`}
                              className="btn btn-primary w-full"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </Link>
                            <button className="btn btn-outline w-full">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Customize
                            </button>
                            <button className="btn btn-secondary w-full">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Why Choose LANForge?</h2>
            <p className="body-large max-w-3xl mx-auto">
              Every PC is built with precision, tested for performance, and backed by our industry-leading warranty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-2xl">🔧</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Hand-Built Quality</h3>
              <p className="text-gray-400 text-sm">
                Every system is meticulously assembled and tested by our expert technicians.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-2xl">⚡</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Performance Optimized</h3>
              <p className="text-gray-400 text-sm">
                Fine-tuned for maximum FPS, low latency, and smooth gameplay across all titles.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-2xl">🛡️</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">3-Year Warranty</h3>
              <p className="text-gray-400 text-sm">
                Comprehensive coverage including parts, labor, and lifetime technical support.
              </p>
            </div>

            <div className="card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-2xl">🚚</div>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Free Shipping</h3>
              <p className="text-gray-400 text-sm">
                Free insured shipping with 2-5 day delivery across the continental United States.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Ready to Level Up Your Gaming?</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              Build your dream PC with our configurator or choose from our ready-to-ship models. 
              Free shipping and lifetime support included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/configurator" className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Build Your PC
              </Link>
              <Link to="/contact" className="btn btn-outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PCsPage;
