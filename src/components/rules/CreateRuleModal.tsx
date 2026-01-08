import { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface CreateRuleModalProps {
    isOpen: boolean;
    ruleType: 'static' | 'dynamic' | null;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }) => void;
}

interface FormValues {
    name: string;
    description: string;
}

export default function CreateRuleModal({ isOpen, ruleType, onClose, onSubmit }: CreateRuleModalProps) {
    const [form] = Form.useForm();

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            form.resetFields();
        }
    }, [isOpen, form]);

    const handleSubmit = async (values: FormValues) => {
        onSubmit({ name: values.name, description: values.description || '' });
    };

    const getRuleTypeLabel = () => {
        if (ruleType === 'static') return 'Data Transformation Rule';
        if (ruleType === 'dynamic') return 'Data Processing Rule';
        return '';
    };

    return (
        <Modal
            title={
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create Rule</h2>
                    {ruleType && (
                        <p className="text-sm text-gray-500 font-normal mt-1">
                            {getRuleTypeLabel()}
                        </p>
                    )}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={450}
            centered
            destroyOnClose
            className="create-rule-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                className="mt-6"
            >
                {/* Rule Name */}
                <Form.Item
                    name="name"
                    label={<span className="text-sm font-medium text-gray-700">Rule Name</span>}
                    rules={[{ required: true, message: 'Please enter a rule name' }]}
                >
                    <Input
                        placeholder="Placeholder text..."
                        size="large"
                        className="rounded-lg"
                    />
                </Form.Item>

                {/* Rule Description */}
                <Form.Item
                    name="description"
                    label={<span className="text-sm font-medium text-gray-700">Rule Description</span>}
                >
                    <Input.TextArea
                        placeholder="Description ..."
                        rows={4}
                        className="rounded-lg resize-none"
                    />
                </Form.Item>

                {/* Actions */}
                <Form.Item className="mb-0 mt-6">
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            onClick={onClose}
                            size="large"
                            className="rounded-lg px-6 hover:border-red-500 hover:text-red-500 focus:border-red-500 focus:text-red-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="rounded-lg px-6 bg-red-600 hover:bg-red-500 focus:bg-red-500 border-none"
                        >
                            Create
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
}
