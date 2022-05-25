import React from 'react'
import { Form, Input, DatePicker, Radio, Select, Transfer, Tabs, Switch, Row } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

const { TabPane } = Tabs;

class CreateUserForm extends React.Component {
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
        const { role: userRoles, ... props } = values;
        const allRoles = this.props.roles;

        let newValues = props;

        if (userRoles) newValues.role = allRoles.filter(r => userRoles.includes(r.id));

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
        const { isSubmitting, initial, roles } = this.props
        const isNewUser = initial.id === undefined;
        
        return (
            <Form
                ref={this.formRef}
                initialValues={initial}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 14 }}
                onFinish={this.onFinish.bind(this)}
            >
                <Tabs
                    defaultActiveKey='info'
                    activeKey={ this.state.activeTabKey }
                    onChange={ activeKey => this.setState({ activeTabKey: activeKey }) }
                >

                    <TabPane tab='Info' key='info'>
                        <Form.Item
                            label='Username'
                            name='username'
                            rules={[
                                { required: true, message: 'Please input.' }
                            ]}
                        >
                            <Input
                                placeholder='Username'
                                disabled={isSubmitting || !isNewUser}
                            />
                        </Form.Item>
                        <Form.Item
                            label='Display name'
                            name='displayName'
                            rules={[
                                { required: true, message: 'Please input.' }
                            ]}
                        >
                            <Input
                                placeholder='Display name'
                                disabled={isSubmitting}
                            />
                        </Form.Item>
                        <Form.Item
                            label='Card'
                            name='cardNumber'
                            rules={[
                                (isNewUser) && { required: true, message: 'Please input.' }
                            ]}
                        >
                            <Input
                                type='password'
                                placeholder='Click here and tap card'
                                disabled={isSubmitting}
                            />
                        </Form.Item>
                        <Form.Item
                            label='Active'
                            name='active'
                            valuePropName='checked'
                        >
                            <Switch disabled={isSubmitting} />
                        </Form.Item>
                    </TabPane>

                    <TabPane tab="Roles" key="roles">
                        <Row type="flex" justify="center">
                            <Form.Item
                                name='role'
                                wrapperCol={{span: 24}}
                                valuePropName='targetKeys'
                            >
                                <Transfer
                                    rowKey={item => item.id}
                                    listStyle={{width: 300, height: 300}}
                                    dataSource={roles}
                                    render={item => item.description}
                                    disabled={isSubmitting}
                                    showSearch
                                    oneWay
                                />
                            </Form.Item>
                        </Row>
                    </TabPane>
                </Tabs>
            </Form>
        )
    }
}

export default CreateUserForm
