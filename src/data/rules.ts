// Rule types
export type RuleStage = 'WIP' | 'Test' | 'Pending' | 'Production';
export type RuleType = 'static' | 'dynamic';

export interface Rule {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    stage: RuleStage;
    mappingCount: number;
    type: RuleType;
    createdAt: string;
    updatedAt: string;
    subRules?: SubRule[];
}

export interface SubRule {
    id: string;
    name: string;
    condition: RuleCondition;
    action: RuleAction;
    order: number;
}

export interface RuleCondition {
    type: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'regex' | 'characterPosition' | 'length';
    value: string;
    additionalParams?: Record<string, unknown>;
}

export interface RuleAction {
    type: 'replace' | 'insert' | 'remove' | 'transform' | 'concatenate';
    value: string;
    additionalParams?: Record<string, unknown>;
}

// Initial mock data
export const initialRules: Rule[] = [
    {
        id: '70668',
        name: 'Line Break Rule',
        description: 'This rule replaces "\\" with "<br>" across all text fields',
        version: '1.3',
        author: 'Madison Green',
        stage: 'WIP',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-12-01T10:00:00Z',
        updatedAt: '2025-12-15T14:30:00Z'
    },
    {
        id: '22739',
        name: 'Season Order Date',
        description: 'This rule extracts and formats season order dates',
        version: '2.8',
        author: 'Michael Hall',
        stage: 'Test',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-11-15T09:00:00Z',
        updatedAt: '2025-12-20T11:00:00Z'
    },
    {
        id: '22740',
        name: 'Color Concatenation',
        description: 'This rule concatenates color codes with product identifiers',
        version: '2.6',
        author: 'Joseph Nelson',
        stage: 'Pending',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-11-10T08:00:00Z',
        updatedAt: '2025-12-18T16:00:00Z'
    },
    {
        id: '43756',
        name: 'MSRP Decimal Rule',
        description: 'This rule formats MSRP values with proper decimal placement',
        version: '2.0',
        author: 'Mia Collins',
        stage: 'Production',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-10-01T12:00:00Z',
        updatedAt: '2025-11-30T10:00:00Z'
    },
    {
        id: '39635',
        name: 'Character Count Shrink Rule',
        description: 'This rule shrinks text based on character count limits',
        version: '7.5',
        author: 'Ethan Miller',
        stage: 'WIP',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-09-15T14:00:00Z',
        updatedAt: '2025-12-22T09:00:00Z'
    },
    {
        id: '70669',
        name: 'Exclusivity Rule',
        description: 'This rule handles exclusivity markers for products',
        version: '2.9',
        author: 'Harper Adams',
        stage: 'Test',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-08-20T11:00:00Z',
        updatedAt: '2025-12-10T15:00:00Z'
    },
    {
        id: '43178',
        name: 'PO Approval Date Conversion',
        description: 'This rule converts PO approval dates to target format',
        version: '2.7',
        author: 'Charlotte Adams',
        stage: 'Pending',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-07-10T10:00:00Z',
        updatedAt: '2025-12-05T14:00:00Z'
    },
    {
        id: '43179',
        name: 'Decimal to Binary Rule',
        description: 'This rule converts decimal values to binary representation',
        version: '4.0',
        author: 'Amelia Martin',
        stage: 'Production',
        mappingCount: 20,
        type: 'dynamic',
        createdAt: '2025-06-01T09:00:00Z',
        updatedAt: '2025-11-25T12:00:00Z'
    },
    {
        id: '22741',
        name: 'Create EAN 13 Barcode Rule',
        description: 'This rule generates EAN 13 barcodes with check digits',
        version: '8.1',
        author: 'Joseph White',
        stage: 'Pending',
        mappingCount: 0,
        type: 'static',
        createdAt: '2025-05-15T08:00:00Z',
        updatedAt: '2025-12-01T11:00:00Z'
    },
    {
        id: '97174',
        name: 'GPM Text Style Conversion',
        description: 'This rule applies GPM text style transformations',
        version: '1.0',
        author: 'Matthew Turner',
        stage: 'Production',
        mappingCount: 10,
        type: 'static',
        createdAt: '2025-04-01T10:00:00Z',
        updatedAt: '2025-10-15T14:00:00Z'
    },
];

// Rules store using closure for state management
let rulesData: Rule[] = [...initialRules];

// Generate unique ID
const generateId = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

// Get all rules
export const getRules = (): Rule[] => {
    return [...rulesData];
};

// Get rule by ID
export const getRuleById = (id: string): Rule | undefined => {
    return rulesData.find(rule => rule.id === id);
};

// Add new rule
export const addRule = (ruleData: {
    name: string;
    description: string;
    type: RuleType;
    author?: string;
}): Rule => {
    const newRule: Rule = {
        id: generateId(),
        name: ruleData.name,
        description: ruleData.description,
        version: '0.1',
        author: ruleData.author || 'Current User',
        stage: 'WIP',
        mappingCount: 0,
        type: ruleData.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subRules: []
    };

    rulesData = [newRule, ...rulesData];
    return newRule;
};

// Update rule
export const updateRule = (id: string, updates: Partial<Rule>): Rule | undefined => {
    const index = rulesData.findIndex(rule => rule.id === id);
    if (index === -1) return undefined;

    rulesData[index] = {
        ...rulesData[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    return rulesData[index];
};

// Delete rule
export const deleteRule = (id: string): boolean => {
    const initialLength = rulesData.length;
    rulesData = rulesData.filter(rule => rule.id !== id);
    return rulesData.length < initialLength;
};

// Reset to initial data (for testing)
export const resetRules = (): void => {
    rulesData = [...initialRules];
};
