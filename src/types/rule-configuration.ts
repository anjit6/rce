export interface InputParameter {
    id: string;
    name: string;
    fieldName: string;
    type: string;
    dataType?: string;
}

export type FunctionType = 'find-replace' | 'concatenate' | 'date-format' | 'conditional' | 'subfunction' | 'output' | null;

export interface ConfigurationStep {
    id: string;
    type: FunctionType;
    subfunctionId?: number;
    config?: any;
}
