import React from 'react'
import { Form, Input, DatePicker, Radio, Select, Transfer, Tabs, Switch, Row } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

const { TabPane } = Tabs;

class CreateRole extends React.Component {
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
        const { user: roleUser, keyGroup: roleKeyGroup, ... props } = values;
        const { users: allUsers, keyGroups: allKeyGroups } = this.props;

        let newValues = props;

        if (roleUser) newValues.user = allUsers.filter(r => roleUser.includes(r.id));
        if (roleKeyGroup) newValues.keyGroup = allKeyGroups.filter(r => roleKeyGroup.includes(r.id));

        this.props.onSubmit(newValues, () => { this.resetForm() });
    }

    resetForm() {
        const { user, keyGroup, ... props} = this.props.initial;
        let userId = user ? user.map(u => u.id) : [];
        let keyGroupId = keyGroup ? keyGroup.map(kGp => kGp.id) : [];

        this.formRef.current.resetFields();

        this.formRef.current.setFieldsValue({
            user: userId,
            keyGroup: keyGroupId,
            ... props
        });

        //reset Tabs activeKey
        this.setState({ activeTabKey: this.defaultTabKey });
    }

    render() {
        const { isSubmitting, initial, users, keyGroups } = this.props
        const isNewRole = initial.id === undefined;
        
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

                    <TabPane tab="Users" key="user">
                        <Row type="flex" justify="center">
                            <Form.Item
                                name='user'
                                wrapperCol={{span: 24}}
                                valuePropName='targetKeys'
                            >
                                <Transfer
                                    rowKey={item => item.id}
                                    listStyle={{width: 300, height: 300}}
                                    dataSource={users}
                                    render={item => `${item.username} - ${item.displayName}`}
                                    disabled={isSubmitting}
                                    showSearch
                                    oneWay
                                />
                            </Form.Item>
                        </Row>
                    </TabPane>

                    <TabPane tab="Key Groups" key="keyGroup">
                        <Row type="flex" justify="center" style={{minHeight: '100vh'}}>
                            <Form.Item
                                name='keyGroup'
                                wrapperCol={{span: 24}}
                                valuePropName='targetKeys'
                            >
                                <Transfer
                                    rowKey={item => item.id}
                                    listStyle={{width: 300, height: 300}}
                                    dataSource={keyGroups}
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

export default CreateRole
