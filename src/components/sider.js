import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { Menu, SubMenu } from 'antd'
import { HomeOutlined, UserOutlined, UnlockOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import ZoomMessage from './zoomMessage'

const SiderWrapper = styled(Menu)`
    /* min-height: 100vh; */
`


@inject('commonStore', 'authStore') @observer


class Sider extends Component {

    getSiderItems() {
        const { commonStore, authStore } = this.props;

        let siderItems = [
            {
                key: 'home',
                value: 'home',
                text: 'Home',
                icon: <HomeOutlined />,
            },
        
            {
                key: 'key',
                value: 'key',
                text: 'Key',
                icon: <UnlockOutlined />,
                route: 'key'
            },
        
            
        
            
        ]

        if (commonStore.isLoggedIn()) {
            siderItems.push(
                {
                    key: 'user',
                    value: 'user',
                    text: 'User',
                    icon: <UserOutlined />,
                    route: 'user'
                },

                {
                    key: 'logout',
                    value: 'logout',
                    text: 'Logout',
                    icon: <LogoutOutlined />,
                    onClick: () => this.handleOnLogoutClick(),
                }
            )
        } else {
            siderItems.push(
                {
                    key: 'login',
                    value: 'login',
                    text: 'Login',
                    icon: <LoginOutlined />,
                    route: 'login'
                }
            )
            
        }

        return siderItems;
    }

    handleOnMenuItemClick(e) {
        if (e === undefined) return;

        const { props } = e.item;

        if (props.hasOwnProperty('route') && props.route)
            this.props.history.push(`/${props.route}`)
            
        else
            this.props.history.push(`/`)
    }

    handleOnLogoutClick(e) {
        const { authStore } = this.props;

        authStore
            .logout()
            .then(() => {
                ZoomMessage.success('Logout success. See you soon!')
            });
    }

    renderMenuItems() {
        return this.getSiderItems().map((item, index) => {

            if (!item.subMenu) {
                if (item.route)
                    return <Menu.Item key={item.key} route={item.route}><span>{item.icon}<span>{item.text}</span></span></Menu.Item>
                else if (item.onClick)
                    return <Menu.Item key={item.key} onClick={item.onClick}><span>{item.icon}<span>{item.text}</span></span></Menu.Item>
                else
                    return <Menu.Item key={item.key}><span>{item.icon}<span>{item.text}</span></span></Menu.Item>
            }

            const subMenuItems = item.subMenu.map((subMenuItem, subIndex) => {
                return <Menu.Item key={subMenuItem.key} route={subMenuItem.route}>{subMenuItem.text}</Menu.Item>
            })

            return (
                <Menu.SubMenu key={item.key} title={<span>{item.icon}<span>{item.text}</span></span>}>
                    {subMenuItems}
                </Menu.SubMenu>
            )
        })
    }

    getSelectedKey() {
        if (this.props.location.pathname === '/') {
            return 'home'
        }
        const tempArray = this.props.location.pathname.substring(1).split('/')
        
        return tempArray[0]
    }

    render() {
        return (
            <Menu
                theme='dark'
                onClick={(e) => this.handleOnMenuItemClick(e)}
                style={{ maxWidth: 256 }}
                defaultSelectedKeys={[this.getSelectedKey()]}
                selectedKeys={[this.getSelectedKey()]}
                mode='inline'
            >
                {
                    this.renderMenuItems()
                }
            </Menu>
        )
    }
}

export default withRouter(Sider)
