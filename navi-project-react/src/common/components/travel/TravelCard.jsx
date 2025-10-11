import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TravelCard = ({ item, onClick, isSelected, onMouseEnter, onMouseLeave }) => (
  <div
    className={`bg-white rounded-xl shadow-lg border-2 p-4 cursor-pointer transition duration-300 transform hover:shadow-xl hover:-translate-y-1 ${
      isSelected ? 'border-blue-500 shadow-blue-300/50 scale-[1.01]' : 'border-gray-200'
    } flex space-x-4`}
    onClick={() => onClick(item)}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="flex-shrink-0 w-36 h-24 sm:w-40 sm:h-28">
      <img
        src={item.thumbnailPath || item.imagePath || 'https://placehold.co/112x112/cccccc/333333?text=No+Image'}
        alt={item.title}
        className="w-full h-full object-cover rounded-lg shadow-md"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/112x112/cccccc/333333?text=No+Image';
        }}
      />
    </div>

    <div className="flex-grow min-w-0 justify-center">
      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1 truncate">{item.title}</h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-2">{item.region1Name} {' > '} {item.region2Name}</p>
      <p className="text-xs sm:text-sm text-gray-400 mb-2 truncate">
          {item.tag?.split(',').map(tag => `#${tag.trim()}`).join(' ') || ''}
      </p>

      <div className="flex items-center space-x-4 text-lg text-gray-600 font-medium pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <i className="bi bi-eye-fill text-base text-blue-400"></i>
          <span>{item.views.toLocaleString()}</span>
        </div>

        <div className="flex items-center space-x-1">
          <i className="bi bi-suit-heart-fill text-red-500"></i>
          <span>{item.likesCount.toLocaleString()}</span>
        </div>


        <div className="flex items-center space-x-1">
          <i className="bi bi-bookmarkCount-fill text-green-500"></i>
          <span>{item.bookmarkCount?.toLocaleString() || 0}</span>
        </div>
      </div>
    
    </div>
  </div>
);

export default TravelCard;
