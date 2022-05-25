import React from 'react'
import { Form, Input, Button, Row } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import styled from 'styled-components'
// import messages from '~/src/messages'
// import validator from '~/src/lib/validator'
// import { hasError, getErrorMessage } from '~/src/lib/errorMessages'

const LoginButton = styled(Button)`
    margin-right: 16px;
`

class LoginForm extends React.Component {

    handleOnFinish(values) {
        const { isSubmitting } = this.props
        
        if (!isSubmitting)
            this.props.onLogin(values)
    }

    render() {
        const { isSubmitting, error } = this.props
        
        return (
            <Form onFinish={(v) => this.handleOnFinish(v)}>
                <Form.Item
                    name='username'
                    rules = {[
                        { required: true, message: 'Please input username.' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Username"
                        disabled={isSubmitting}
                    />
                </Form.Item>

                <Form.Item
                    name='password'
                    rules = {[
                        { required: true, message: 'Please input password.' }
                    ]}
                >
                    <Input
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Password"
                        disabled={isSubmitting}
                    />
                </Form.Item>

                <Form.Item>
                    <LoginButton type="primary" block htmlType="submit" loading={isSubmitting}>
                        Login
                    </LoginButton>
                </Form.Item>

            </Form>
        )
    }
}

export default LoginForm