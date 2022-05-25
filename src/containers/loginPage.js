import React from 'react'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { withRouter } from "react-router"
import ZoomMessage from '../components/zoomMessage'

import LoginForm from '~/src/components/forms/loginForm.js'

const LoginWrapper = styled.div`
    height: 100vh;
    max-width: 300px;
    margin: 0 auto;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
`

@inject('authStore') @observer
class LoginPage extends React.Component {

    handleOnLogin(fields) {
        const { username, password } = fields
        this.props.authStore.login(username, password)
            .then(() => {
                ZoomMessage.success(`Welcome back, ${username}!`);
                this.props.history.push('/')
            })
            .catch(error => {
                switch (error.response.status) {
                    case 401: // Unauthorized
                        ZoomMessage.error('Incorrect username or password.');
                        break;
                    default:
                        ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                        break;
                }
            })
    }

    render() {
        const { authStore } = this.props
        const { isSubmitting, error } = authStore

        return (
            <LoginWrapper>
                <LoginForm
                    isSubmitting={isSubmitting}
                    error={error}
                    onLogin={(fields) => this.handleOnLogin(fields)}
                />
            </LoginWrapper>
        )
    }
}

export default withRouter(LoginPage)
