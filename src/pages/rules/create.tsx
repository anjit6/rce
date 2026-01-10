import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Collapse, Modal, Tooltip } from 'antd';
import { PlusOutlined, CloseOutlined, SearchOutlined, ExclamationCircleOutlined, CloseCircleFilled } from '@ant-design/icons';
import Layout from '../../components/layout/Layout';
import { getRuleById } from '../../data/rules';
import { SUBFUNCTIONS } from '../../constants/subfunctions';
import { InputParameter, FunctionType, ConfigurationStep } from '../../types/rule-configuration';
import RuleConfigurationCard from '../../components/rules/RuleConfigurationCard';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { CustomSelect } from '../../components/ui/custom-select';
import { Label } from '../../components/ui/label';

const { Panel } = Collapse;
const { confirm } = Modal;

export default function RuleCreatePage() {
    const { ruleId } = useParams<{ ruleId: string }>();
    const navigate = useNavigate();
    const [rule, setRule] = useState<any>(null);
    const [configurationStarted, setConfigurationStarted] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configurationSteps, setConfigurationSteps] = useState<ConfigurationStep[]>([]);
    const [inputParameters, setInputParameters] = useState<InputParameter[]>([
        { id: '1', name: 'Input Parameter 1', size: '', type: 'String', dataType: 'String' }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeAccordionKeys, setActiveAccordionKeys] = useState<string[]>([]);
    const [parameterErrors, setParameterErrors] = useState<Record<string, { type?: boolean; size?: boolean; dataType?: boolean }>>({});
    const [parametersLocked, setParametersLocked] = useState(false);

    useEffect(() => {
        if (ruleId) {
            const ruleData = getRuleById(ruleId);
            if (ruleData) {
                setRule(ruleData);
                document.title = `${ruleData.name} - RCE`;
            } else {
                navigate('/rules');
            }
        }
    }, [ruleId, navigate]);

    // Update active accordion keys when modal opens or search query changes
    useEffect(() => {
        if (isConfigModalOpen) {
            // Recompute which sections have data
            const userDefinedRules: string[] = [];
            const stringFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'STR' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const numberFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'NUM' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const dateFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'DATE' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const utilFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'UTIL' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const conditionalFunctions = [
                { name: 'IF', type: 'conditional' as FunctionType },
                { name: 'IFS', type: null },
            ].filter(func => func.name.toLowerCase().includes(searchQuery.toLowerCase()));

            // Determine which accordion should open
            const newActiveKeys: string[] = [];

            if (userDefinedRules.length > 0) {
                newActiveKeys.push('1');
            } else if (stringFunctions.length > 0) {
                newActiveKeys.push('2');
            } else if (numberFunctions.length > 0) {
                newActiveKeys.push('number');
            } else if (dateFunctions.length > 0) {
                newActiveKeys.push('3');
            } else if (conditionalFunctions.length > 0 || utilFunctions.length > 0) {
                newActiveKeys.push('5');
            }

            setActiveAccordionKeys(newActiveKeys);
        }
    }, [isConfigModalOpen, searchQuery]);

    // Helper function to renumber parameters sequentially
    const renumberParameters = (params: InputParameter[]) => {
        return params.map((param, index) => ({
            ...param,
            name: `Input Parameter ${index + 1}`
        }));
    };

    const addInputParameter = () => {
        const newParam: InputParameter = {
            id: Date.now().toString(),
            name: `Input Parameter ${inputParameters.length + 1}`,
            size: '',
            type: 'String',
            dataType: 'String'
        };
        const updatedParams = renumberParameters([...inputParameters, newParam]);
        setInputParameters(updatedParams);
    };

    const updateInputParameter = (id: string, field: 'size' | 'type' | 'dataType', value: string) => {
        setInputParameters(inputParameters.map(param =>
            param.id === id ? { ...param, [field]: value } : param
        ));

        // Clear error when user types
        if (parameterErrors[id]?.[field]) {
            setParameterErrors(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: false
                }
            }));
        }
    };

    const removeInputParameter = (id: string) => {
        // Prevent removing if only one parameter left
        if (inputParameters.length > 1) {
            confirm({
                title: 'Remove Input Parameter',
                icon: <ExclamationCircleOutlined className="text-red-600" />,
                content: 'Are you sure you want to remove this Parameter?',
                okText: 'Yes, Remove',
                okType: 'danger',
                cancelText: 'Cancel',
                centered: true,
                onOk() {
                    const filteredParams = inputParameters.filter(param => param.id !== id);
                    const renumberedParams = renumberParameters(filteredParams);
                    setInputParameters(renumberedParams);
                },
                onCancel() {
                    // Do nothing on cancel
                },
            });
        }
    };

    const handleStartConfiguration = () => {
        // Validate input parameters
        const newErrors: Record<string, { type?: boolean; size?: boolean; dataType?: boolean }> = {};
        let hasErrors = false;

        inputParameters.forEach(param => {
            const paramErrors: { type?: boolean; size?: boolean; dataType?: boolean } = {};

            if (!param.type) paramErrors.type = true;
            if (!param.size.trim()) paramErrors.size = true;
            if (!param.dataType) paramErrors.dataType = true;

            if (Object.keys(paramErrors).length > 0) {
                newErrors[param.id] = paramErrors;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setParameterErrors(newErrors);
            return;
        }

        // Show confirmation dialog
        confirm({
            title: 'Start Configuration',
            icon: <ExclamationCircleOutlined className="text-red-600" />,
            content: 'Are you sure you want to start configuration? Once confirmed, input parameters will be locked and cannot be modified.',
            okText: 'Yes, Start',
            okType: 'danger',
            cancelText: 'No',
            centered: true,
            onOk() {
                setParametersLocked(true);
                setIsConfigModalOpen(true);
            },
            onCancel() {
                // Do nothing, keep parameters editable
            },
        });
    };

    const handleCloseConfigModal = () => {
        setIsConfigModalOpen(false);
    };

    const [insertPosition, setInsertPosition] = useState<number>(-1);

    const handleFunctionSelect = (functionType: FunctionType, subfunctionId?: number) => {
        const newStep: ConfigurationStep = {
            id: Date.now().toString(),
            type: functionType,
            subfunctionId: subfunctionId
        };

        // Insert at the specified position or at the end
        if (insertPosition >= 0 && insertPosition <= configurationSteps.length) {
            const newSteps = [...configurationSteps];
            newSteps.splice(insertPosition + 1, 0, newStep);
            setConfigurationSteps(newSteps);
        } else {
            setConfigurationSteps([...configurationSteps, newStep]);
        }

        // Mark configuration as started only when a function is selected
        setConfigurationStarted(true);
        setIsConfigModalOpen(false);
        setInsertPosition(-1);
    };

    const handleAddStep = (position: number) => {
        setInsertPosition(position);
        setIsConfigModalOpen(true);
    };

    if (!rule) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-lg text-gray-500">Loading...</div>
                </div>
            </Layout>
        );
    }

    // Predefined functions for the sidebar (empty - will be populated in future)
    const userDefinedRules: string[] = [];

    const stringFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'STR' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const numberFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'NUM' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const dateFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'DATE' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const utilFunctions = SUBFUNCTIONS.filter(func => func.categoryId === 'UTIL' && func.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const conditionalFunctions = [
        { name: 'IF', type: 'conditional' as FunctionType },
        { name: 'IFS', type: null },
    ].filter(func => func.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Main Content Area */}
                <div className="px-8 py-6 max-w-full">
                    {/* Rule Title and Description */}
                    <div className="mb-6 max-w-full overflow-hidden">
                        <Tooltip title={rule.name}>
                            <h1 className="text-xl font-bold text-gray-900 truncate cursor-pointer">{rule.name}</h1>
                        </Tooltip>
                        <Tooltip title={rule.description}>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 cursor-pointer">{rule.description}</p>
                        </Tooltip>
                    </div>

                    {/* Define Input Parameters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">Define Input Parameters</h2>
                                <p className="text-sm text-gray-600">
                                    {inputParameters.length} parameter{inputParameters.length !== 1 ? 's' : ''} defined
                                </p>
                            </div>
                            <Button
                                icon={<PlusOutlined />}
                                type="primary"
                                size="middle"
                                onClick={addInputParameter}
                                disabled={parametersLocked}
                                className="bg-red-500 hover:bg-red-400 focus:bg-red-400 border-none rounded-lg px-6 disabled:bg-gray-300 disabled:text-gray-500"
                            >
                                Add Parameter
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto mt-6">
                            {inputParameters.map((param, index) => (
                                <div key={param.id}>
                                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start">
                                        {/* Type Column */}
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Type <span className="text-black">*</span></Label>
                                        <CustomSelect
                                            value={param.type}
                                            onChange={(e) => updateInputParameter(param.id, 'type', e.target.value)}
                                            className="w-full"
                                            selectSize="lg"
                                            variant={parameterErrors[param.id]?.type ? 'error' : 'default'}
                                            disabled={parametersLocked}
                                        >
                                            <option value="Input field">Input field</option>
                                            <option value="Metadata field">Metadata field</option>
                                            <option value="String">String</option>
                                        </CustomSelect>
                                        {parameterErrors[param.id]?.type && (
                                            <span className="text-red-500 text-xs mt-1 block">This field is required</span>
                                        )}
                                    </div>

                                    {/* Field Name Column */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                            {param.type === 'Metadata field' ? 'Metadata Field Name' :
                                                param.type === 'String' || param.type === 'Number' || param.type === 'Date' || param.type === 'Boolean' ? 'Parameter Name' :
                                                    'Field Name'} <span className="text-black">*</span>
                                        </Label>
                                        <Input
                                            value={param.size}
                                            onChange={(e) => updateInputParameter(param.id, 'size', e.target.value)}
                                            placeholder={
                                                param.type === 'Metadata field' ? 'Enter metadata field name' :
                                                    param.type === 'String' || param.type === 'Number' || param.type === 'Date' || param.type === 'Boolean' ? 'Enter parameter name' :
                                                        'Enter field name'
                                            }
                                            className="w-full"
                                            inputSize="lg"
                                            variant={parameterErrors[param.id]?.size ? 'error' : 'default'}
                                            disabled={parametersLocked}
                                        />
                                        {parameterErrors[param.id]?.size && (
                                            <span className="text-red-500 text-xs mt-1 block">This field is required</span>
                                        )}
                                    </div>

                                    {/* Field Data Type Column */}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Field Data Type <span className="text-black">*</span></Label>
                                        <CustomSelect
                                            value={param.dataType || 'String'}
                                            onChange={(e) => updateInputParameter(param.id, 'dataType', e.target.value)}
                                            className="w-full"
                                            selectSize="lg"
                                            variant={parameterErrors[param.id]?.dataType ? 'error' : 'default'}
                                            disabled={parametersLocked}
                                        >
                                            <option value="String">String</option>
                                            <option value="Integer">Integer</option>
                                            <option value="Float">Float</option>
                                            <option value="Boolean">Boolean</option>
                                        </CustomSelect>
                                        {parameterErrors[param.id]?.dataType && (
                                            <span className="text-red-500 text-xs mt-1 block">This field is required</span>
                                        )}
                                    </div>

                                        {/* Delete Button Column */}
                                        <div className="flex items-start justify-end pt-8">
                                            {inputParameters.length > 1 && !parametersLocked && (
                                                <Button
                                                    icon={<CloseOutlined />}
                                                    onClick={() => removeInputParameter(param.id)}
                                                    className="delete-param-btn flex items-center justify-center w-9 h-9 border-none text-gray-400 transition-colors rounded-full"
                                                    type="text"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Horizontal Line Separator */}
                                    {index < inputParameters.length - 1 && (
                                        <div className="border-b border-gray-200 my-4"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Start Configuration */}
                    <div className="flex flex-col items-center py-8">
                        <p className="text-base font-semibold text-gray-900 mb-4">Start Configuration</p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleStartConfiguration}
                            disabled={configurationStarted || configurationSteps.length > 0}
                            className="bg-red-500 hover:bg-red-400 focus:bg-red-400 border-none rounded-lg px-8 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                            Start
                        </Button>
                    </div>

                    {/* Configuration Steps */}
                    {configurationSteps.length > 0 && (
                        <>
                            {/* Vertical Line connecting Start to first Card */}
                            <div className="h-8 w-px bg-gray-300 mx-auto -mt-8"></div>

                            {configurationSteps.map((step, index) => (
                                <div key={step.id}>
                                    <RuleConfigurationCard
                                        step={step}
                                        inputParameters={inputParameters}
                                        stepIndex={index}
                                    />

                                    {/* Vertical connector line */}
                                    <div className="h-8 w-px bg-gray-300 mx-auto -mt-6"></div>

                                    {/* Add Button - Only enabled for the last card */}
                                    <div className="flex justify-center mb-8">
                                        <Button
                                            type="primary"
                                            className="border-none px-8 h-10 rounded-md bg-red-500 hover:bg-red-400 disabled:bg-gray-300 disabled:text-gray-500"
                                            onClick={() => handleAddStep(index)}
                                            disabled={index !== configurationSteps.length - 1}
                                        >
                                            Add
                                        </Button>
                                    </div>

                                    {/* Connector line to next card if not the last one */}
                                    {index < configurationSteps.length - 1 && (
                                        <div className="h-8 w-px bg-gray-300 mx-auto -mt-8"></div>
                                    )}
                                </div>
                            ))}

                            {/* Output Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-base font-medium text-gray-900 mb-4">Output</h3>
                                <Select selectSize="lg" className="w-full mb-4">
                                    <option value="" disabled selected>Select</option>
                                </Select>
                                <div className="text-sm text-gray-500">Return</div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center py-6">
                                <div className="flex gap-3">
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="bg-red-500 hover:bg-red-400 focus:bg-red-400 border-none"
                                    >
                                        Save
                                    </Button>
                                    <Button size="large" className="hover:border-red-400 hover:text-red-500 focus:border-red-400 focus:text-red-500">Test</Button>
                                    <Button size="large" className="hover:border-red-400 hover:text-red-500 focus:border-red-400 focus:text-red-500">Generate JavaScript</Button>
                                </div>
                                <Button size="large" className="hover:border-red-400 hover:text-red-500 focus:border-red-400 focus:text-red-500">Cancel</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Function Library Modal */}
            <Modal
                title={null}
                open={isConfigModalOpen}
                onCancel={handleCloseConfigModal}
                footer={null}
                width={500}
                className="function-library-modal"
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}
            >
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 pl-6">Select Function</h2>
                    <div className="relative mb-6 mx-6" style={{ width: '90%' }}>
                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <Input
                            placeholder="Search Rule"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 rounded-lg"
                        />
                        {searchQuery && (
                            <CloseCircleFilled
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 cursor-pointer hover:text-gray-600"
                                onClick={() => setSearchQuery('')}
                            />
                        )}
                    </div>

                    <Collapse
                        activeKey={activeAccordionKeys}
                        onChange={(keys) => setActiveAccordionKeys(keys as string[])}
                        ghost
                        className="function-library-collapse"
                    >
                        {/* Rules */}
                        <Panel header={<span className="font-semibold text-gray-900">Rules</span>} key="1">
                            <div className="flex flex-wrap gap-2">
                                {userDefinedRules.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic py-2">No data found</div>
                                ) : (
                                    userDefinedRules.map((func, index) => (
                                        <Button
                                            key={index}
                                            className="rounded-full border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                                            size="small"
                                        >
                                            {func}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </Panel>

                        {/* String Functions */}
                        <Panel header={<span className="font-semibold text-gray-900">String Functions</span>} key="2">
                            <div className="flex flex-wrap gap-2">
                                {stringFunctions.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic py-2">No data found</div>
                                ) : (
                                    stringFunctions.map((func, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => handleFunctionSelect('subfunction', func.id)}
                                            className="rounded-full border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                                            size="small"
                                        >
                                            {func.name}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </Panel>

                        {/* Number Functions */}
                        <Panel header={<span className="font-semibold text-gray-900">Number Functions</span>} key="number">
                            <div className="flex flex-wrap gap-2">
                                {numberFunctions.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic py-2">No data found</div>
                                ) : (
                                    numberFunctions.map((func, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => handleFunctionSelect('subfunction', func.id)}
                                            className="rounded-full border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                                            size="small"
                                        >
                                            {func.name}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </Panel>

                        {/* Date Functions */}
                        <Panel header={<span className="font-semibold text-gray-900">Date Functions</span>} key="3">
                            <div className="flex flex-wrap gap-2">
                                {dateFunctions.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic py-2">No data found</div>
                                ) : (
                                    dateFunctions.map((func, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => handleFunctionSelect('subfunction', func.id)}
                                            className="rounded-full border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                                            size="small"
                                        >
                                            {func.name}
                                        </Button>
                                    ))
                                )}
                            </div>
                        </Panel>

                        {/* Output Card */}
                        <Panel header={<span className="font-semibold text-gray-900">Output Card</span>} key="4">
                            <div className="text-sm text-gray-500">
                                Output configuration options
                            </div>
                        </Panel>

                        {/* Conditional */}
                        <Panel header={<span className="font-semibold text-gray-900">Conditional</span>} key="5">
                            <div className="flex flex-wrap gap-2">
                                {conditionalFunctions.length === 0 && utilFunctions.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic py-2">No data found</div>
                                ) : (
                                    <>
                                        {conditionalFunctions.map((func, index) => (
                                            <Button
                                                key={`cond-${index}`}
                                                onClick={() => func.type && handleFunctionSelect(func.type)}
                                                className="rounded-full border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                                                size="small"
                                            >
                                                {func.name}
                                            </Button>
                                        ))}
                                        {utilFunctions.map((func, index) => (
                                            <Button
                                                key={`util-${index}`}
                                                onClick={() => handleFunctionSelect('subfunction', func.id)}
                                                className="rounded-full border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                                                size="small"
                                            >
                                                {func.name}
                                            </Button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </Panel>
                    </Collapse>
                </div>
            </Modal>
        </Layout>
    );
}
