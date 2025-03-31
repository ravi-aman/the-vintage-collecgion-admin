/* eslint-disable */
import React, { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import NavLink from 'components/link/NavLink';
import DashIcon from 'components/icons/DashIcon';

export const SidebarLinks = (props: { routes: RoutesType[] }): JSX.Element => {
  const pathname = usePathname();
  const { routes } = props;

  // Function to check if the route is active
  const activeRoute = useCallback(
    (routeName: string) => pathname?.includes(routeName),
    [pathname]
  );

  // Generate Sidebar Links
  const createLinks = (routes: RoutesType[]) => {
    return routes.map((route, index) => {
      if (['/admin', '/auth', '/rtl'].includes(route.layout)) {
        return (
          <NavLink key={index} href={`${route.layout}/${route.path}`}>
            <div
              className="relative mb-3 flex cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2"
            >
              <li
                className="my-[3px] flex items-center px-8 w-full"
                key={index}
              >
                <span
                  className={`transition-all duration-300 ${
                    activeRoute(route.path)
                      ? 'font-bold text-brand-500 dark:text-white'
                      : 'font-medium text-gray-600 hover:text-brand-500 dark:hover:text-white'
                  }`}
                >
                  {route.icon ? route.icon : <DashIcon />}
                </span>
                <p
                  className={`leading-1 ml-4 flex transition-all duration-300 ${
                    activeRoute(route.path)
                      ? 'font-bold text-navy-700 dark:text-white'
                      : 'font-medium text-gray-600 hover:text-brand-500 dark:hover:text-white'
                  }`}
                >
                  {route.name}
                </p>
              </li>
              {activeRoute(route.path) && (
                <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400 transition-all duration-300 ease-in-out" />
              )}
            </div>
          </NavLink>
        );
      }
    });
  };

  return <>{createLinks(routes)}</>;
};

export default SidebarLinks;
