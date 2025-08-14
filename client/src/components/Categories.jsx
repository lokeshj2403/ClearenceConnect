import React from 'react';
import { Smartphone, Shirt, Home, Book, ArrowRight } from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      icon: Smartphone,
      name: 'Electronics',
      count: '1,234 items',
      href: '#electronics'
    },
    {
      icon: Shirt,
      name: 'Fashion',
      count: '2,567 items',
      href: '#fashion'
    },
    {
      icon: Home,
      name: 'Home & Living',
      count: '1,890 items',
      href: '#home'
    },
    {
      icon: Book,
      name: 'Books',
      count: '1,890 items',
      href: '#books'
    }
  ];

  return (
    <section id="categories" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#FF4C4C] font-semibold tracking-wider">BROWSE</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-4">Popular Categories</h2>
          <p className="text-gray-600 mt-4">
            Explore our wide range of categories and find exactly what you're looking for at prices you'll love.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="w-16 h-16 flex items-center justify-center text-[#FF4C4C] mb-6 bg-[#FF4C4C]/5 rounded-xl group-hover:bg-[#FF4C4C] group-hover:text-white transition-all duration-300">
                <category.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-[#FF4C4C] transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-500">{category.count}</p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={category.href} className="text-[#FF4C4C] font-medium flex items-center gap-2">
                  Browse Category <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;