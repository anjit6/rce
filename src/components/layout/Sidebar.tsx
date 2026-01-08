import { useState } from 'react';
import { Menu, Tooltip, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    NodeIndexOutlined,
    HistoryOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
    {
        key: '/rules',
        icon: <FileTextOutlined className="text-lg" />,
        label: 'Rules',
    },
    {
        key: '/approvals',
        icon: <CheckCircleOutlined className="text-lg" />,
        label: 'Approvals',
    },
    {
        key: '/mapping',
        icon: <NodeIndexOutlined className="text-lg" />,
        label: 'Mapping',
    },
    {
        key: '/history',
        icon: <HistoryOutlined className="text-lg" />,
        label: 'History',
    },
    {
        key: '/users',
        icon: <TeamOutlined className="text-lg" />,
        label: 'Users',
    },
];

interface SidebarProps {
    currentPath?: string;
    onNavigate?: (path: string) => void;
    userName?: string;
    userEmail?: string;
    userAvatar?: string;
    onLogout?: () => void;
}

export default function Sidebar({
    currentPath = '/rules',
    onNavigate,
    userName = 'John Doe',
    userEmail = 'john.doe@example.com',
    userAvatar,
    onLogout
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState(currentPath);

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        setSelectedKey(key);
        if (onNavigate) {
            onNavigate(key);
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            // Default logout behavior
            window.location.href = '/login';
        }
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Logo Header with Collapse Button */}
            <div className={`px-5 py-6 flex items-center gap-3 border-b border-gray-200 bg-white ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                    <svg width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden flex-1">
                        <h1 className="text-sm font-bold text-gray-900 whitespace-nowrap">Rules Configuration</h1>
                        <p className="text-xs text-gray-500">Engine</p>
                    </div>
                )}
                {/* Collapse Toggle Button */}
                <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'} placement="right">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        {isCollapsed ? (
                            <MenuUnfoldOutlined className="text-base" />
                        ) : (
                            <MenuFoldOutlined className="text-base" />
                        )}
                    </button>
                </Tooltip>
            </div>

            {/* Menu Label */}
            {!isCollapsed && (
                <div className="px-6 pt-6 pb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Menu
                    </p>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-2">
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    items={menuItems}
                    inlineCollapsed={isCollapsed}
                    className="border-none bg-transparent sidebar-menu"
                    style={{ borderInlineEnd: 'none' }}
                />
            </nav>

            {/* User Profile Section */}
            <div className={`px-4 py-4 border-t border-gray-200 bg-white ${isCollapsed ? 'px-2' : ''}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    {/* Profile Avatar */}
                    <Tooltip title={isCollapsed ? userName : ''} placement="right">
                        <Avatar
                            size={40}
                            src={userAvatar}
                            icon={!userAvatar && <UserOutlined />}
                            className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 cursor-pointer"
                        />
                    </Tooltip>

                    {/* User Info */}
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                        </div>
                    )}

                    {/* Logout Button */}
                    {!isCollapsed && (
                        <Tooltip title="Logout" placement="top">
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                                <LogoutOutlined className="text-base" />
                            </button>
                        </Tooltip>
                    )}
                </div>

                {/* Logout button when collapsed */}
                {isCollapsed && (
                    <Tooltip title="Logout" placement="right">
                        <button
                            onClick={handleLogout}
                            className="w-full mt-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <LogoutOutlined className="text-base" />
                        </button>
                    </Tooltip>
                )}
            </div>
        </aside>
    );
}

