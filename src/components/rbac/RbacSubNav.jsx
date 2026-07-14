import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { rbacSubTabBase, rbacSubTabClass } from "./rbacTheme";

export default function RbacSubNav({ items, ariaLabel }) {
  return (
    <nav
      className="flex gap-0 overflow-x-auto border-b border-gray-200 bg-white px-2 pt-1"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            clsx(rbacSubTabBase, rbacSubTabClass(isActive))
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
