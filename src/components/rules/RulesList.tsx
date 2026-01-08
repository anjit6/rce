import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Table, Dropdown, Space, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import CreateRuleModal from './CreateRuleModal';
import { addRule } from '../../data/rules';

// Type definitions
interface Rule {
    key: string;
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    stage: 'WIP' | 'Test' | 'Pending' | 'Production';
    mappingCount: number;
    type: 'static' | 'dynamic';
}

// Mock data for the rules list
const mockRules: Rule[] = [
    { key: '1', id: '70668', name: 'Line Break Rule', description: 'This rule replaces "\\" with "<br>" ac...', version: '1.3', author: 'Madison Green', stage: 'WIP', mappingCount: 0, type: 'static' },
    { key: '2', id: '22739', name: 'Season Order Date', description: 'This rule replaces "\\" with "<br>" ac...', version: '2.8', author: 'Michael Hall', stage: 'Test', mappingCount: 0, type: 'static' },
    { key: '3', id: '22739', name: 'Color Concatenation', description: 'This rule replaces "\\" with "<br>" ac...', version: '2.6', author: 'Joseph Nelson', stage: 'Pending', mappingCount: 0, type: 'static' },
    { key: '4', id: '43756', name: 'MSRP Decimal Rule', description: 'This rule replaces "\\" with "<br>" ac...', version: '2.0', author: 'Mia Collins', stage: 'Production', mappingCount: 0, type: 'static' },
    { key: '5', id: '39635', name: 'Character Count Shrink Rule', description: 'This rule replaces "\\" with "<br>" ac...', version: '7.5', author: 'Ethan Miller', stage: 'WIP', mappingCount: 0, type: 'static' },
    { key: '6', id: '70668', name: 'Exclusivity Rule', description: 'This rule replaces "\\" with "<br>" ac...', version: '2.9', author: 'Harper Adams', stage: 'Test', mappingCount: 0, type: 'static' },
    { key: '7', id: '43178', name: 'PO Approval Date Conversion', description: 'This rule replaces "\\" with "<br>" ac...', version: '2.7', author: 'Charlotte Adams', stage: 'Pending', mappingCount: 0, type: 'static' },
    { key: '8', id: '43178', name: 'Decimal to Binary Rule', description: 'This rule replaces "\\" with "<br>" ac...', version: '4.0', author: 'Amelia Martin', stage: 'Production', mappingCount: 20, type: 'dynamic' },
    { key: '9', id: '22739', name: 'Create EAN 13 Barcode Rule', description: 'This rule replaces "\\" with "<br>" ac...', version: '8.1', author: 'Joseph White', stage: 'Pending', mappingCount: 0, type: 'static' },
    { key: '10', id: '97174', name: 'GPM Text Style Conversion', description: 'This rule replaces "\\" with "<br>" ac...', version: '1.0', author: 'Matthew Turner', stage: 'Production', mappingCount: 10, type: 'static' },
];

export default function RulesList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRuleType, setSelectedRuleType] = useState<'static' | 'dynamic' | null>(null);
    const [currentPage, setCurrentPage] = useState(3);
    const pageSize = 10;

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
                author: 'Current User'
            });

            // Close modal and reset state
            setIsModalOpen(false);
            setSelectedRuleType(null);

            // Navigate to the rule configuration page
            navigate(`/rules/create/${newRule.id}`);
        }
    };

    // Filter rules based on search query
    const filteredRules = mockRules.filter(rule =>
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.id.includes(searchQuery) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Table columns definition
    const columns: ColumnsType<Rule> = [
        {
            title: <span className="font-bold">Rule ID</span>,
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (id: string) => (
                <span className="text-gray-500">ID: {id}</span>
            ),
        },
        {
            title: <span className="font-bold">Rule Name & Description</span>,
            key: 'name',
            width: 280,
            render: (_, record) => (
                <div>
                    <div className="font-medium text-gray-900 hover:text-red-600 cursor-pointer transition-colors">
                        {record.name}
                    </div>
                    <div className="text-sm text-gray-400 truncate max-w-[250px]">
                        {record.description}
                    </div>
                </div>
            ),
        },
        {
            title: <span className="font-bold">Version</span>,
            dataIndex: 'version',
            key: 'version',
            width: 100,
            render: (version: string) => (
                <span className="text-gray-700">{version}</span>
            ),
        },
        {
            title: <span className="font-bold">Author</span>,
            dataIndex: 'author',
            key: 'author',
            width: 150,
            render: (author: string) => (
                <span className="text-gray-700">{author}</span>
            ),
        },
        {
            title: <span className="font-bold">Stage</span>,
            dataIndex: 'stage',
            key: 'stage',
            width: 120,
            render: (stage: Rule['stage']) => (
                <span className="text-gray-900 font-medium">{stage}</span>
            ),
        },
        {
            title: <span className="font-bold">Mapping</span>,
            dataIndex: 'mappingCount',
            key: 'mappingCount',
            width: 100,
            render: (count: number) => (
                <span className={count > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                    {count}
                </span>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="px-8 py-6">
                <h1 className="text-2xl font-bold text-indigo-900">All Rules</h1>
            </div>

            {/* Search and Actions Bar */}
            <div className="px-8 pb-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Search Input */}
                    <Input
                        placeholder="Search by Rule ID, Name and Description"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-md rounded-lg"
                        allowClear
                    />

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
                        dataSource={filteredRules}
                        pagination={false}
                        rowClassName="hover:bg-gray-50/50 cursor-pointer"
                        className="rules-table"
                        onRow={(record) => ({
                            onClick: () => console.log('Clicked row:', record),
                        })}
                    />
                </div>

                {/* Custom Pagination */}
                <div className="flex justify-end mt-6">
                    <Pagination
                        current={currentPage}
                        total={50}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        className="custom-pagination"
                    />
                </div>
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
