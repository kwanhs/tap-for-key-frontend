import React from 'react'
import { Form, Input, DatePicker, Radio, Select, Transfer, Tabs, Switch } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

const { TabPane } = Tabs;

class CreateKeyForm extends React.Component {
    formRef = React.createRef();

    constructor(props) {
        super(props)

        this.defaultTabKey = 'info';

        this.state = {
            confirmDirty: false,
            activeTabKey: this.defaultTabKey,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.initial !== this.props.initial) {
            // initialValues passed to form as props only work for once
            // onChange of initial, it should be passed by setFieldsValue
            this.resetForm();
        }
    }

    handleSubmit() {
        this.formRef.current.submit();
    }


    handleConfirmBlur(e) {
        const value = e.target.value
        this.setState({ confirmDirty: this.state.confirmDirty || !!value })
    }

    onFinish(values) {
        const { keyGroupId, keyGroup, ... props } = values;
        const allKeyGroups = this.props.keyGroups;

        let newValues = values;

        newValues.keyGroup = allKeyGroups.filter(kGp => kGp.id === keyGroupId)[0];
        
        // remove unecessary information of other keys under this keyGroup
        delete newValues.keyGroup.key;

        this.props.onSubmit(newValues, () => { this.resetForm() });
    }

    resetForm() {
        const { role, cardNumber, ... props} = this.props.initial;
        let roleId = role ? role.map(r => r.id) : [];

        this.formRef.current.resetFields();

        this.formRef.current.setFieldsValue({
            role: roleId,
            cardNumber: undefined,
            ... props
        });

        //reset Tabs activeKey
        this.setState({ activeTabKey: this.defaultTabKey });
    }

    render() {
        const { isSubmitting, initial, keyGroups } = this.props
        const isNewKey = initial.id === undefined;
        
        return (
            <Form
                ref={this.formRef}
                initialValues={initial}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 14 }}
                onFinish={this.onFinish.bind(this)}
            >
                <Form.Item
                    label='Cell'
                    name='cellNumber'
                    rules={[
                        { required: true, message: 'Please input.' }
                    ]}
                >
                    <Input
                        placeholder='Cell'
                    />
                </Form.Item>
                <Form.Item
                    label='Description'
                    name='description'
                    rules={[
                        { required: true, message: 'Please input.' }
                    ]}
                >
                    <Input
                        placeholder='Description'
                    />
                </Form.Item>
                <Form.Item
                    label='Key group'
                    name='keyGroupId'
                    rules={[
                        { required: true, message: 'Please select.' }
                    ]}
                >
                    <Select
                        showSearch
                    >
                        {keyGroups.map(kGp => 
                            <Select.Option key={kGp.id} value={kGp.id}>{kGp.description}</Select.Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item
                    label='Tag'
                    name='keyTagNumber'
                    rules={[
                        (isNewKey) && { required: true, message: 'Please input.' }
                    ]}
                >
                    <Input
                        type='password'
                        placeholder='Click here and tap tag'
                        disabled={isSubmitting}
                    />
                </Form.Item>
            </Form>
        )
    }
}

export default CreateKeyForm
