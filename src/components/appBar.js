import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { Dropdown, Badge, Menu, Popover } from 'antd'
import { withRouter } from 'react-router-dom'
import { CaretDownFilled } from '@ant-design/icons'

const AppBar = styled.div`
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    padding: 0 16px;
    box-shadow: 1px 1px 1px #888888;
    background: #fff;
    height: 64px;
`

const AppBarLeftSideWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    flex-grow: 1;
`

const AppBarRightSideWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
`

const AppBarEmail = styled.div`
    margin: 0 16px;
    cursor: pointer;
`

const Username = styled.div`
    cursor: pointer;
`

const Wrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    margin-left: 16px;

    .ant-badge:not(:first-child) {
        margin-left: 16px;
    }
`

@inject('commonStore') @observer
class ApplicationBar extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userDetailVisible: false
        }
    }

    handleOnLogoutClick() {
        this.props.onLogout()
    }

    renderMenu() {
        return (
            <Menu>
                <Menu.Item onClick={() => this.handleOnLogoutClick()}>
                    <a>Logout</a>
                </Menu.Item>
            </Menu>
        )
    }

    renderStatusBadges() {
        // render current status
    }

    render() {
        const { username, isSiderCollapsed } = this.props

        const tempArray = this.props.location.pathname.substring(1).split('/')
        return (
            <AppBar>
            <AppBarLeftSideWrapper>
                {this.renderStatusBadges()}
            </AppBarLeftSideWrapper>
                <AppBarRightSideWrapper>
                    <Dropdown trigger={['hover']} overlay={this.renderMenu()}>
                        <Username>
                            {username} <CaretDownFilled />
                        </Username>
                    </Dropdown>
                </AppBarRightSideWrapper>
            </AppBar>
        )
    }
}

export default withRouter(ApplicationBar)
