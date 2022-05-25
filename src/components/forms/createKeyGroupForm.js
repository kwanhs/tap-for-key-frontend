import React from 'react'
import { Form, Input, DatePicker, Radio, Select, Transfer, Tabs, Switch, Row, List } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

const { TabPane } = Tabs;

class CreateKeyGroup extends React.Component {
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
        const { role: keyGroupRoles, ... props } = values;
        const allRoles = this.props.roles;

        let newValues = props;

        if (keyGroupRoles) newValues.role = allRoles.filter(r => keyGroupRoles.includes(r.id));

        this.props.onSubmit(newValues, () => { this.resetForm() });
    }

    resetForm() {
        const { role, ... props } = this.props.initial;

        let roleId = role ? role.map(r => r.id) : [];

        this.formRef.current.resetFields();

        this.formRef.current.setFieldsValue({
            role: roleId,
            ... props,
        });

        //reset Tabs activeKey
        this.setState({ activeTabKey: this.defaultTabKey });
    }

    render() {
        const { isSubmitting, initial, keys, roles } = this.props
        const isNewKeyGroup = initial.id === undefined;
        
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
                            label='Description'
                            name='description'
                            rules={[
                                { required: true, message: 'Please input.' }
                            ]}
                        >
                            <Input
                                placeholder='Description'
                                disabled={isSubmitting}
                            />
                        </Form.Item>
                        <Form.Item
                            label='Abbreviation'
                            name='abbreviation'
                            rules={[
                                { required: true, message: 'Please input.' }
                            ]}
                        >
                            <Input
                                placeholder='Abbreviation'
                                disabled={isSubmitting}
                            />
                        </Form.Item>
                    </TabPane>

                    <TabPane tab="Roles" key="role">
                        <Row type="flex" justify="center">
                            <Form.Item
                                name='role'
                                valuePropName='targetKeys'
                                wrapperCol={{span: 24}}
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

                    <TabPane tab="Keys" key="key">
                        <List
                            dataSource={initial.key}
                            bordered
                            renderItem={item => 
                                <List.Item>
                                    {item.description}
                                </List.Item>
                            }
                        />
                        {/* <Row type="flex" justify="center">
                            <Form.Item
                                name='key'
                                valuePropName='targetKeys'
                                wrapperCol={{span: 24}}
                            >
                                <Transfer
                                    rowKey={item => item.id}
                                    listStyle={{width: 300, height: 300}}
                                    dataSource={keys}
                                    render={item => item.description}
                                    // disabled={isSubmitting}
                                    operations={[]}
                                    // disabled
                                    showSearch
                                    oneWay
                                />
                            </Form.Item>
                        </Row> */}
                    </TabPane>

                </Tabs>
            </Form>
        )
    }
}

export default CreateKeyGroup
