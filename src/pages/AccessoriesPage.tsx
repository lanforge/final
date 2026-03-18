import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Accessory {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  features: string[];
  imageColor: string;
  brand: string;
  rating: number;
  inStock: boolean;
}

const accessories: Accessory[] = [
  {
    id: 1,
    name: 'Mechanical Gaming Keyboard',
    category: 'Keyboard',
    description: 'RGB mechanical keyboard with customizable switches and per-key lighting',
    price: '$129.99',
    features: [
      'Cherry MX Red switches',
      'RGB per-key lighting',
      'Aluminum frame',
      'Detachable USB-C cable',
      'Programmable macros'
    ],
    imageColor: '#3a86ff',
    brand: 'Corsair',
    rating: 4.8,
    inStock: true
  },
  {
    id: 2,
    name: 'Wireless Gaming Mouse',
    category: 'Mouse',
    description: 'High-precision wireless gaming mouse with ultra-lightweight design',
    price: '$89.99',
    features: [
      '25,600 DPI optical sensor',
      'Wireless 2.4GHz & Bluetooth',
      '70-hour battery life',
      '69g ultra-lightweight',
      'PTFE skates'
    ],
    imageColor: '#8338ec',
    brand: 'Logitech',
    rating: 4.7,
    inStock: true
  },
  {
    id: 3,
    name: 'Extended Gaming Mouse Pad',
    category: 'Mouse Pad',
    description: 'XXL mouse pad with stitched edges and water-resistant surface',
    price: '$34.99',
    features: [
      '900x400mm size',
      'Stitched edges',
      'Water-resistant surface',
      'Non-slip rubber base',
      'Machine washable'
    ],
    imageColor: '#ff006e',
    brand: 'SteelSeries',
    rating: 4.6,
    inStock: true
  },
  {
    id: 4,
    name: '27" 1440p Gaming Monitor',
    category: 'Monitor',
    description: 'High refresh rate gaming monitor with IPS panel and HDR support',
    price: '$349.99',
    features: [
      '27" IPS panel',
      '2560x1440 resolution',
      '165Hz refresh rate',
      '1ms response time',
      'HDR400 support'
    ],
    imageColor: '#06d6a0',
    brand: 'ASUS',
    rating: 4.9,
    inStock: true
  },
  {
    id: 5,
    name: 'Wireless Gaming Controller',
    category: 'Controller',
    description: 'Ergonomic wireless controller with customizable buttons and triggers',
    price: '$69.99',
    features: [
      'Wireless 2.4GHz & Bluetooth',
      'Customizable back buttons',
      'Adjustable trigger stops',
      '40-hour battery life',
      'PC & console compatible'
    ],
    imageColor: '#118ab2',
    brand: 'Xbox',
    rating: 4.5,
    inStock: true
  },
  {
    id: 6,
    name: 'Gaming Headset',
    category: 'Audio',
    description: 'Surround sound gaming headset with noise-cancelling microphone',
    price: '$99.99',
    features: [
      '7.1 virtual surround sound',
      'Noise-cancelling microphone',
      'Memory foam ear cushions',
      'RGB lighting',
      'Multi-platform compatible'
    ],
    imageColor: '#fb5607',
    brand: 'Razer',
    rating: 4.4,
    inStock: true
  },
  {
    id: 7,
    name: 'Streaming Webcam',
    category: 'Webcam',
    description: '4K streaming webcam with HDR and background removal',
    price: '$149.99',
    features: [
      '4K UHD resolution',
      'HDR support',
      'Background removal AI',
      'Auto-focus & auto-light',
      'Privacy shutter'
    ],
    imageColor: '#ffbe0b',
    brand: 'Logitech',
    rating: 4.7,
    inStock: true
  },
  {
    id: 8,
    name: 'RGB Desk Mat',
    category: 'Desk Accessory',
    description: 'Large RGB desk mat with customizable lighting zones',
    price: '$59.99',
    features: [
      '800x300mm size',
      '16.8 million RGB colors',
      'Multiple lighting effects',
      'Spill-resistant surface',
      'USB-powered'
    ],
    imageColor: '#8338ec',
    brand: 'Corsair',
    rating: 4.3,
    inStock: true
  },
  {
    id: 9,
    name: 'Monitor Arm Mount',
    category: 'Mount',
    description: 'Gas spring monitor arm with full motion adjustment',
    price: '$89.99',
    features: [
      'Gas spring mechanism',
      'VESA 75x75/100x100',
      '360° rotation',
      'Height adjustable',
      'Cable management'
    ],
    imageColor: '#3a86ff',
    brand: 'Ergotron',
    rating: 4.8,
    inStock: true
  },
  {
    id: 10,
    name: 'Gaming Chair',
    category: 'Chair',
    description: 'Ergonomic gaming chair with lumbar support and adjustable armrests',
    price: '$299.99',
    features: [
      '4D adjustable armrests',
      'Lumbar support pillow',
      'Reclines 135°',
      'High-density foam',
      'PU leather'
    ],
    imageColor: '#ff006e',
    brand: 'Secretlab',
    rating: 4.9,
    inStock: true
  },
  {
    id: 11,
    name: 'USB Hub',
    category: 'Connectivity',
    description: '10-port USB hub with individual power switches',
    price: '$49.99',
    features: [
      '10 USB 3.0 ports',
      'Individual power switches',
      '7.5W per port',
      'LED indicators',
      'Aluminum housing'
    ],
    imageColor: '#06d6a0',
    brand: 'Sabrent',
    rating: 4.6,
    inStock: true
  },
  {
    id: 12,
    name: 'Cable Management Kit',
    category: 'Organization',
    description: 'Complete cable management solution with various accessories',
    price: '$24.99',
    features: [
      'Cable sleeves',
      'Cable clips',
      'Velcro straps',
      'Cable ties',
      'Under-desk tray'
    ],
    imageColor: '#118ab2',
    brand: 'JOTO',
    rating: 4.4,
    inStock: true
  }
];

const categories = [
  'All',
  'Keyboard',
  'Mouse',
  'Mouse Pad',
  'Monitor',
  'Controller',
  'Audio',
  'Webcam',
  'Desk Accessory',
  'Mount',
  'Chair',
  'Connectivity',
  'Organization'
];

const AccessoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  const filteredAccessories = selectedCategory === 'All' 
    ? accessories 
    : accessories.filter(accessory => accessory.category === selectedCategory);

  const sortedAccessories = [...filteredAccessories].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
      case 'price-high':
        return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleViewDetails = (accessory: Accessory) => {
    setSelectedAccessory(accessory);
  };

  const handleCloseDetails = () => {
    setSelectedAccessory(null);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-600">★</span>);
    }
    
    return stars;
  };

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
              Premium Gaming Accessories
            </h1>
            <p className="body-large max-w-3xl mx-auto mb-10">
              Enhance your gaming setup with our curated selection of high-performance accessories. 
              From precision mice to immersive audio, find everything you need to level up your gaming experience.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">12+</div>
                <div className="text-gray-400">Categories</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">50+</div>
                <div className="text-gray-400">Products</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-bold text-gradient-neon mb-2">4.7★</div>
                <div className="text-gray-400">Avg Rating</div>
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
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {category}
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
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Accessories Grid */}
      <section className="section">
        <div className="container-narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAccessories.map((accessory, index) => (
              <motion.div
                key={accessory.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="card-glow group"
              >
                <div className="p-6">
                  {/* Accessory Image */}
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <div 
                      className="absolute inset-0"
                      style={{ backgroundColor: accessory.imageColor }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="badge-accent">
                        {accessory.category}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-center">
                        <div className="badge-secondary">
                          {accessory.brand}
                        </div>
                        {!accessory.inStock && (
                          <div className="badge-error">
                            Out of Stock
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accessory Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{accessory.name}</h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {renderStars(accessory.rating)}
                      </div>
                      <span className="text-sm text-gray-400">{accessory.rating.toFixed(1)}</span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{accessory.description}</p>

                    {/* Features Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {accessory.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg className="w-4 h-4 text-emerald-400 mt-1 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gradient-neon">
                        {accessory.price}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleViewDetails(accessory)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="btn btn-primary"
                          disabled={!accessory.inStock}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="py-20 bg-gray-900/30">
        <div className="container-narrow">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">Popular Categories</h2>
            <p className="body-large max-w-3xl mx-auto">
              Explore our most popular accessory categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              className="card cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              onClick={() => setSelectedCategory('Keyboard')}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  ⌨️
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Keyboards</h3>
                <p className="text-gray-400 text-sm">Mechanical, wireless, and RGB keyboards</p>
              </div>
            </div>

            <div 
              className="card cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              onClick={() => setSelectedCategory('Mouse')}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  🖱️
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mice</h3>
                <p className="text-gray-400 text-sm">Precision gaming mice and accessories</p>
              </div>
            </div>

            <div 
              className="card cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              onClick={() => setSelectedCategory('Monitor')}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  🖥️
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Monitors</h3>
                <p className="text-gray-400 text-sm">High refresh rate gaming displays</p>
              </div>
            </div>

            <div 
              className="card cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              onClick={() => setSelectedCategory('Audio')}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  🎧
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Audio</h3>
                <p className="text-gray-400 text-sm">Headsets, speakers, and microphones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessory Details Modal */}
      {selectedAccessory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-800/50"
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedAccessory.name}</h2>
                  <div className="flex items-center gap-4">
                    <div className="badge-accent">{selectedAccessory.category}</div>
                    <div className="badge-secondary">{selectedAccessory.brand}</div>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedAccessory.rating)}
                      <span className="text-gray-400">{selectedAccessory.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Section */}
                <div>
                  <div 
                    className="h-64 rounded-xl mb-4"
                    style={{ backgroundColor: selectedAccessory.imageColor }}
                  />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient-neon mb-2">
                      {selectedAccessory.price}
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-lg font-medium ${
                      selectedAccessory.inStock 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {selectedAccessory.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-gray-300">{selectedAccessory.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                    <ul className="space-y-2">
                      {selectedAccessory.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="w-5 h-5 text-emerald-400 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button 
                      className="btn btn-primary flex-1"
                      disabled={!selectedAccessory.inStock}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {selectedAccessory.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={handleCloseDetails}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-narrow">
          <div className="card-glow p-8 md:p-12 text-center">
            <h2 className="heading-2 mb-4">Complete Your Gaming Setup</h2>
            <p className="body-large max-w-2xl mx-auto mb-8">
              All accessories include free shipping and our 30-day satisfaction guarantee. 
              Mix and match to create the perfect gaming environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Shop All Accessories
              </button>
              <button className="btn btn-outline">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Setup Guide
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessoriesPage;
