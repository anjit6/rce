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

export default function OutputCard({ step, onConfigUpdate }: OutputCardProps) {
    const config = step.config || { type: '', dataType: '', value: '' };

    const handleTypeChange = (value: string) => {
        onConfigUpdate(step.id, {
            ...config,
            type: value,
            value: '' // Reset value when type changes
        });
    };

    const handleDataTypeChange = (value: string) => {
        onConfigUpdate(step.id, {
            ...config,
            dataType: value
        });
    };

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
                    {/* First Dropdown - Type Selection */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Type <span className="text-black">*</span>
                        </Label>
                        <CustomSelect
                            value={config.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full"
                            selectSize="lg"
                        >
                            <option value="">Select type</option>
                            <option value="inputParam">Input Parameter</option>
                            <option value="stepOutputVariable">Output Parameter</option>
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
