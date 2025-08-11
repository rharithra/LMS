import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useSocket } from '../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ right: '0', transform: 'none' });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { notifications, unreadCount, markNotificationAsRead, connected } = useSocket();
  
  // Calculate dropdown position to prevent overflow
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 320; // 320px width
    
    // Check if dropdown would overflow on the right
    if (buttonRect.right - dropdownWidth < 0) {
      // Position on the right side of the button
      setDropdownPosition({
        right: 'auto',
        left: '0',
        transform: 'none'
      });
    } else if (buttonRect.right + 20 > viewportWidth) {
      // Move left by the overflow amount plus some padding
      const overflow = (buttonRect.right + 20) - viewportWidth;
      setDropdownPosition({
        right: '0',
        transform: `translateX(-${overflow + 20}px)`
      });
    } else {
      // Default right alignment
      setDropdownPosition({
        right: '0',
        transform: 'none'
      });
    }
  };
  
  // Debug logging
  React.useEffect(() => {
    console.log('NotificationBell render:', { 
      isOpen, 
      connected, 
      unreadCount, 
      notificationsLength: notifications.length,
      notifications: notifications.slice(0, 3)
    });
  }, [isOpen, connected, unreadCount, notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_request':
        return '📝';
      case 'leave_approved':
        return '✅';
      case 'leave_rejected':
        return '❌';
      default:
        return '📧';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'leave_request':
        return 'border-l-blue-500';
      case 'leave_approved':
        return 'border-l-green-500';
      case 'leave_rejected':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        ref={buttonRef}
        onClick={() => {
          console.log('Notification bell clicked, current state:', isOpen);
          if (!isOpen) {
            calculateDropdownPosition();
          }
          setIsOpen(!isOpen);
        }}
        className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${
          connected ? 'text-gray-700' : 'text-gray-400'
        }`}
        title={connected ? 'Notifications' : 'Notifications (Disconnected)'}
      >
        <BellIcon className="h-6 w-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <span
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
            connected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

            {/* Dropdown - Mobile-first design */}
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] lg:hidden" />
          
                    {/* Dropdown */}
          <div 
            className="fixed mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] max-h-96 overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '2px solid #e5e7eb',
              minWidth: '320px',
              top: '60px', // Position below the header
              right: '20px' // 20px from the right edge of the screen
            }}
            onClick={(e) => e.stopPropagation()}
          >
             {/* Header */}
           <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-gray-900">
                 Notifications 
                 <span className="text-xs text-red-500 ml-2">(DEBUG: Dropdown Open)</span>
               </h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${getNotificationColor(
                      notification.type
                    )} ${notification.read ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
                         </div>
           )}
           </div>
         </>
       )}
    </div>
  );
};

export default NotificationBell; 