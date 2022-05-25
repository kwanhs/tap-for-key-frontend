import React from 'react'
import { inject, observer } from 'mobx-react'
import { Layout } from 'antd'
import styled from 'styled-components'
import AppBar from '~/src/components/appBar'
import Footer from '~/src/components/footer'
import Sider from '~/src/components/sider'
import AppIcon from '~/src/components/appIcon'
import { withRouter } from 'react-router-dom'

const TitleWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    height: 64px;
`

const Title = styled.div`
    color: white;
`

const Copyright = styled.div`
    color: #fff;
    padding: 8px;
`

@inject('commonStore') @observer
class PageLayout extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            collapsed: false
        }
    }

    componentDidMount() {
        this.updateWindowDimensions()
        this.setState({ collapsed: true })
        window.addEventListener('resize', () => this.updateWindowDimensions())
    }

    componentWillUnmount() {
        window.removeEventListener('resize', () => this.updateWindowDimensions())
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth })
    }

    handleOnLogout() {
        const { authStore } = this.props
        authStore.logout()
            .then(() => {
                this.props.history.push(`/login`)
            })
    }


    handleOnSelfClick() {
        const { commonStore } = this.props
    }

    render() {
        const { children, pathname, commonStore, title } = this.props
        const { username } = commonStore
        const isMobile = this.state.width <= 1224

        const childrenWithProps = React.Children.map(children, child =>
            React.cloneElement(child, { isMobile: isMobile })
        )

        const tempArray = this.props.location.pathname.substring(1).split('/')

        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Layout.Sider
                    collapsible
                    collapsed={this.state.collapsed}
                    onCollapse={(collapsed) => this.setState({ collapsed })}
                >
                    <TitleWrapper>
                        <AppIcon />
                        <Title>Tap for Key</Title>
                    </TitleWrapper>
                    <Sider isMobile={isMobile} pathname={pathname} />
                </Layout.Sider>
                <Layout>
                    <Layout.Content style={{ padding: 16, backgroundColor: 'white' }}>
                        {childrenWithProps}
                    </Layout.Content>
                    <Layout.Footer style={{ padding: 0 }}>
                        <Footer />
                    </Layout.Footer>
                </Layout>
            </Layout>
        )
    }
}

export default withRouter(PageLayout)