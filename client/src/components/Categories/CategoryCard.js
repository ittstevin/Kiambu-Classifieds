import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/category/${category.id}`} className="block">
      <div className="card p-6 text-center hover:shadow-lg transition-all duration-200 group">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
          {category.icon}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {category.description}
        </p>
        <div className="text-xs text-gray-500">
          {category.count} ads
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard; 