import { ConfigurationStep, InputParameter } from '../../types/rule-configuration';
import { CustomSelect } from '../ui/custom-select';
import { Label } from '../ui/label';

interface OutputCardProps {
    step: ConfigurationStep;
    inputParameters: InputParameter[];
    configurationSteps: ConfigurationStep[];
    stepIndex: number;
    onConfigUpdate: (stepId: string, config: any) => void;
}

export default function OutputCard({ step, inputParameters, configurationSteps, stepIndex, onConfigUpdate }: OutputCardProps) {
    const config = step.config || { type: '', dataType: '', value: '' };

    const handleValueChange = (selectedValue: string) => {
        let type = '';

        // Determine type based on selected value
        if (selectedValue === 'static') {
            type = 'static';
        } else if (inputParameters.some(p => p.name === selectedValue)) {
            type = 'inputParam';
        } else {
            type = 'stepOutputVariable';
        }

        onConfigUpdate(step.id, {
            ...config,
            type: type,
            value: selectedValue
        });
    };

    const handleDataTypeChange = (value: string) => {
        onConfigUpdate(step.id, {
            ...config,
            dataType: value
        });
    };

    // Get output variables from all previous steps
    const previousOutputVariables = configurationSteps
        .slice(0, stepIndex)
        .filter(s => s.type === 'subfunction' && s.config?.outputVariable)
        .map(s => s.config.outputVariable);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 relative">
            {/* Title Section - Similar to Define Input Parameters */}
            <div className="flex items-start justify-between mb-1">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Return</h2>
                    <p className="text-sm text-gray-600">Define the final output of the rule</p>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded">
                    Output
                </span>
            </div>

            {/* Two Dropdowns in Single Row */}
            <div className="mt-6">
                <div className="grid grid-cols-2 gap-4 items-start">
                    {/* First Dropdown - Type Selection (shows actual values) */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Type <span className="text-black">*</span>
                        </Label>
                        <CustomSelect
                            value={config.value}
                            onChange={(e) => handleValueChange(e.target.value)}
                            className="w-full"
                            selectSize="lg"
                        >
                            <option value="">Select type</option>
                            {inputParameters.map(p => (
                                <option key={p.id} value={p.name}>{p.fieldName}</option>
                            ))}
                            {previousOutputVariables.map((varName, idx) => (
                                <option key={`output-${idx}`} value={varName}>{varName}</option>
                            ))}
                            <option value="static">Static</option>
                        </CustomSelect>
                    </div>

                    {/* Second Dropdown - Data Type */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Data Type <span className="text-black">*</span>
                        </Label>
                        <CustomSelect
                            value={config.dataType}
                            onChange={(e) => handleDataTypeChange(e.target.value)}
                            className="w-full"
                            selectSize="lg"
                        >
                            <option value="">Select data type</option>
                            <option value="String">String</option>
                            <option value="Integer">Integer</option>
                            <option value="Float">Float</option>
                            <option value="Boolean">Boolean</option>
                            <option value="Date">Date</option>
                        </CustomSelect>
                    </div>
                </div>
            </div>
        </div>
    );
}
