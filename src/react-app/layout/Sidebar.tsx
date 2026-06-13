import { NavLink } from 'react-router-dom';

interface Props {
  collapsed: boolean;
}

function Icon({ d, d2, fill }: { d: string; d2?: string; fill?: string }) {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill={fill ?? 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  );
}

const SECTIONS = [
  {
    label: 'Intelligence',
    items: [
      {
        to: '/',
        end: true,
        label: 'Dashboard',
        icon: <Icon
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          d2="M9 22V12h6v10"
        />,
      },
      {
        to: '/players',
        label: 'Players',
        icon: <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
      },
      {
        to: '/teams',
        label: 'Teams',
        icon: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        to: '/validate',
        label: 'Validate JSON',
        icon: <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />,
      },
    ],
  },
];

export default function Sidebar({ collapsed }: Props) {
  return (
    <nav
      className="sidebar"
      data-col={String(collapsed)}
      aria-label="Main navigation"
    >
      {SECTIONS.map((section, si) => (
        <div key={section.label} className="sidebar-section">
          {!collapsed && (
            <span className="sidebar-label">{section.label}</span>
          )}
          {section.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' active' : '')
              }
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && (
                <span className="sidebar-link-text">{item.label}</span>
              )}
            </NavLink>
          ))}
          {si < SECTIONS.length - 1 && !collapsed && (
            <div className="sidebar-divider" />
          )}
        </div>
      ))}
    </nav>
  );
}
