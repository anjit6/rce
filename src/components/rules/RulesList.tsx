import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Dropdown, Space, Pagination, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import CreateRuleModal from './CreateRuleModal';
import { addRule, getRules } from '../../data/rules';
import { Input } from '../ui/input';

// Type definitions for table display
interface TableRule {
    key: string;
    id: number;
    name: string;
    description: string;
    version: string;
    author: string;
    status: 'WIP' | 'Test' | 'Pending' | 'Production';
    mappingCount: number;
    type: 'static' | 'dynamic';
}

export default function RulesList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRuleType, setSelectedRuleType] = useState<'static' | 'dynamic' | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rules, setRules] = useState<TableRule[]>([]);
    const pageSize = 10;

    // Load rules from data store on mount and when returning from navigation
    useEffect(() => {
        loadRules();

        // Reload rules when window gets focus (user returns from create page)
        const handleFocus = () => loadRules();
        window.addEventListener('focus', handleFocus);

        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const loadRules = () => {
        const rulesData = getRules();
        const tableRules: TableRule[] = rulesData.map(rule => ({
            key: rule.id.toString(),
            id: rule.id,
            name: rule.name,
            description: rule.description,
            version: `${rule.version.major}.${rule.version.minor}`,
            author: rule.author || 'Unknown',
            status: rule.status,
            mappingCount: rule.mappingCount,
            type: rule.type
        }));
        setRules(tableRules);
    };

    // Dropdown menu items
    const createRuleMenuItems: MenuProps['items'] = [
        {
            key: 'static',
            label: (
                <div className="py-2">
                    <div className="font-medium text-gray-900">Data Transformation</div>
                    <div className="text-sm text-gray-500">Simple to complex text manipulation.</div>
                </div>
            ),
        },
        {
            key: 'dynamic',
            label: (
                <div className="py-2">
                    <div className="font-medium text-gray-900">Data Processing</div>
                    <div className="text-sm text-gray-500">Write custom JavaScript functions using inbuilt SDK</div>
                </div>
            ),
        },
    ];

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        setSelectedRuleType(key as 'static' | 'dynamic');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRuleType(null);
    };

    const handleRuleCreate = (data: { name: string; description: string }) => {
        if (selectedRuleType) {
            // Add rule to the rules array in rules.ts
            const newRule = addRule({
                name: data.name,
                description: data.description,
                type: selectedRuleType,
                author: ''
            });

            // Reload rules list
            loadRules();

            // Close modal and reset state
            setIsModalOpen(false);
            setSelectedRuleType(null);

            // Navigate to the rule configuration page
            navigate(`/rule/create/${newRule.id}`);
        }
    };

    // Filter rules based on search query
    const filteredRules = rules.filter(rule =>
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.id.toString().includes(searchQuery) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate paginated data
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRules = filteredRules.slice(startIndex, endIndex);

    // Table columns definition
    const columns: ColumnsType<TableRule> = [
        {
            title: <span className="font-bold">ID</span>,
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (id: number) => (
                <Tooltip title={`Rule ID: ${id}`}>
                    <span className="text-gray-500">{id}</span>
                </Tooltip>
            ),
        },
        {
            title: <span className="font-bold">Rule Name & Description</span>,
            key: 'name',
            width: 280,
            render: (_, record) => (
                <Tooltip title={
                    <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-xs mt-1">{record.description}</div>
                    </div>
                }>
                    <div className="max-w-[250px]">
                        <div className="font-medium text-gray-900 hover:text-red-600 cursor-pointer transition-colors truncate">
                            {record.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                            {record.description}
                        </div>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: <span className="font-bold">Version</span>,
            dataIndex: 'version',
            key: 'version',
            width: 100,
            render: (version: string) => (
                <Tooltip title={`Version: ${version}`}>
                    <span className="text-gray-700">{version}</span>
                </Tooltip>
            ),
        },
        {
            title: <span className="font-bold">Author</span>,
            dataIndex: 'author',
            key: 'author',
            width: 150,
            render: (author: string) => (
                <Tooltip title={`Author: ${author}`}>
                    <span className="text-gray-700">{author}</span>
                </Tooltip>
            ),
        },
        {
            title: <span className="font-bold">Status</span>,
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: TableRule['status']) => (
                <Tooltip title={`Status: ${status}`}>
                    <span className="text-gray-900 font-medium">{status}</span>
                </Tooltip>
            ),
        },
        {
            title: <span className="font-bold">Mapping</span>,
            dataIndex: 'mappingCount',
            key: 'mappingCount',
            width: 100,
            render: (count: number) => (
                <Tooltip title={`${count} mapping${count !== 1 ? 's' : ''}`}>
                    <span className={count > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {count}
                    </span>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="px-8 py-6">
                <h1 className="text-xl font-semibold text-gray-900">All Rules</h1>
            </div>

            {/* Search and Actions Bar */}
            <div className="px-8 pb-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative" style={{ width: '22rem' }}>
                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <Input
                            placeholder="Search by Rule ID, Name and Description"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-lg"
                        />
                    </div>

                    <Space size="middle">
                        {/* Filter Button */}
                        <Button
                            icon={<FilterOutlined />}
                            className="rounded-lg border-gray-200 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                        />

                        {/* Create Rule Dropdown */}
                        <Dropdown
                            menu={{
                                items: createRuleMenuItems,
                                onClick: handleMenuClick,
                                className: 'w-72'
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                className="rounded-lg bg-red-600 hover:bg-red-500 focus:bg-red-500 border-none flex items-center"
                            >
                                <span>Create Rule</span>
                                <DownOutlined className="ml-2 text-xs" />
                            </Button>
                        </Dropdown>
                    </Space>
                </div>
            </div>

            {/* Rules Table */}
            <div className="px-8 pb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={paginatedRules}
                        pagination={false}
                        rowClassName="hover:bg-gray-50/50 cursor-pointer"
                        className="rules-table"
                        onRow={(record) => ({
                            onClick: () => navigate(`/rule/create/${record.id}`),
                        })}
                        locale={{
                            emptyText: (
                                <div className="py-12 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900 mb-1">No rules found</p>
                                </div>
                            )
                        }}
                    />
                </div>

                {/* Custom Pagination */}
                {filteredRules.length > 0 && (
                    <div className="flex justify-end mt-6">
                        <Pagination
                            current={currentPage}
                            total={filteredRules.length}
                            pageSize={pageSize}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            className="custom-pagination"
                        />
                    </div>
                )}
            </div>

            {/* Create Rule Modal */}
            <CreateRuleModal
                isOpen={isModalOpen}
                ruleType={selectedRuleType}
                onClose={handleModalClose}
                onSubmit={handleRuleCreate}
            />
        </div>
    );
}
