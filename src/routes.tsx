import React from 'react';

// Icon Imports
import {
  MdHome,
  MdShoppingCart,
  MdBarChart,
  MdCategory,
  MdLocalOffer,
  MdPeople,
  MdOutlineShoppingBag,
  MdSettings,
  MdPerson,
  MdLock,
  MdHelp,
} from 'react-icons/md';

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '',
    icon: <MdHome className="h-6 w-6" />,
  },
  {
    name: 'Products',
    layout: '/admin',
    path: 'products',
    icon: <MdShoppingCart className="h-6 w-6" />,
  },
  {
    name: 'Categories',
    layout: '/admin',
    path: 'categories',
    icon: <MdCategory className="h-6 w-6" />,
  },
  {
    name: 'Orders',
    layout: '/admin',
    path: 'orders',
    icon: <MdOutlineShoppingBag className="h-6 w-6" />,
  },
  {
    name: 'Customers',
    layout: '/admin',
    path: 'customers',
    icon: <MdPeople className="h-6 w-6" />,
  },
  // {
  //   name: 'Discounts',
  //   layout: '/admin',
  //   path: 'discounts',
  //   icon: <MdLocalOffer className="h-6 w-6" />,
  // },
  {
    name: 'Reports & Analytics',
    layout: '/admin',
    path: 'reports',
    icon: <MdBarChart className="h-6 w-6" />,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: 'profile',
    icon: <MdPerson className="h-6 w-6" />,
  },
  {
    name: 'Settings',
    layout: '/admin',
    path: 'settings',
    icon: <MdSettings className="h-6 w-6" />,
  },
  {
    name: 'Support',
    layout: '/admin',
    path: 'support',
    icon: <MdHelp className="h-6 w-6" />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: 'sign-in',
    icon: <MdLock className="h-6 w-6" />,
  },
  {
    name: 'RTL Admin',
    layout: '/rtl',
    path: 'rtl-default',
    icon: <MdHome className="h-6 w-6" />,
  },
];

export default routes;
