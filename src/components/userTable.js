import React from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Table, Button, Input, Select, Checkbox, Row, Tag, DatePicker, Tooltip, Card, List } from 'antd'
import moment from 'moment'
import update from 'immutability-helper'
import _, { keys } from 'lodash'
import Meta from 'antd/lib/card/Meta'
import CreateUserModal from './createUserModal'
import { SearchOutlined, StopOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import ZoomMessage from './zoomMessage'

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
`

const ActionWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 16px;

    button {
        margin-right: 8px;
    }
`

const ActionLeftWrapper = styled.div`
    flex-grow: 1;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
`

const TableWrapper = styled.div`
    background-color: white;
`

const EllipsisText = styled.div`
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
`

const TagWrapper = styled.div`
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 16px;

`

const initialFilterValues = {
    username: undefined,
    displayName: undefined,
    role: undefined,
}

@inject('commonStore', 'userStore', 'roleStore') @observer
class UserTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            pageSize: 7,
            filterValues: initialFilterValues,
            sortedInfo: undefined,
            createUserVisible: false,
            selectedUserId: undefined,
        };
        
        this.emptyUser = {
            id: undefined,
            username: undefined,
            displayName: undefined,
            cardNumber: undefined,
            active: true,
            role: [],
        };
    }

    async componentDidMount() {
        const { userStore, roleStore, commonStore } = this.props;
        const { pageSize } = this.state
        const currentPage = 1

        try {
            await userStore.listUser(pageSize, pageSize * (currentPage - 1));
            await roleStore.listRole(); 

        } catch (error) {
            switch (error.response.status) {
                case 401: // Unauthorized
                    ZoomMessage.error('Unauthorized or expired access');
                    if (commonStore.isLoggedIn) commonStore.removeUser();
                    this.props.history.push('/login')
                    break;
                case 403: // Forbidden
                    ZoomMessage.error('Access denied');
                    break;
                default:
                    ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                    break;
            }

        }

        this.setState({ currentPage })
    }

    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            return (
                <div style={{ padding: 8 }}>
                    {this.renderFilterDropdownInput(dataIndex)}
                    <Row type='flex' justify='space-between'>
                        <a onClick={() => this.handleSearch(confirm)}> Search </a>
                        <a onClick={() => this.handleReset(dataIndex, clearFilters)}> Reset </a>
                    </Row>
                </div>
            )
        },
        filterIcon: filtered => <SearchOutlined type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: (visible) => {
            if (visible
                && (
                    dataIndex === 'username' ||
                    dataIndex === 'displayName' ||
                    dataIndex === 'role' 
                )
            ) {
                setTimeout(() => this.searchInput.select())
            }
        },
    })

    handleOnAddNewClick() {
        this.setState({ createUserVisible: true, selectedUserId: undefined })
    }

    handleOnEditClick(record) {
        this.setState({ createUserVisible: true, selectedUserId: record.id })
    }

    handleReset(dataIndex, clearFilters) {
        clearFilters()
        switch (dataIndex) {
            case 'username':
            case 'displayName':
            case 'role':
                this.setState({
                    filterValues: update(this.state.filterValues, { [dataIndex]: { $set: undefined } })
                }, () => this.handleOnTableChange({ current: 1, pageSize: this.state.pageSize }, null, {}))
                break;

            default:
                break
        }
    }

    handleOnResetAllClick() {
        this.setState({
            filterValues: initialFilterValues,
            sortField: undefined
        }, () => this.handleOnTableChange({ current: 1, pageSize: this.state.pageSize }, null, {}))
    }

    handleSearch(confirm) {
        confirm()
        this.handleOnTableChange({ current: 1, pageSize: this.state.pageSize }, null, {})
    }

    handleOnTableChange(pagination, filters, sorter) {
        const { order } = sorter
        const sortField = order ? (order === 'ascend' ? `${sorter.columnKey}` : `-${sorter.columnKey}`) : null
        const page = pagination.current
        const { userStore } = this.props
        const { pageSize } = pagination
        const { username, displayName, role } = this.state.filterValues;

        userStore
            .listUser(pageSize, pageSize * (page - 1),
                sortField,
                username, displayName, role,
            )
            .catch(error => {
                switch (error.response.status) {
                    case 401: // Unauthorized
                        ZoomMessage.error('Unauthorized or expired access');
                        if (commonStore.isLoggedIn) commonStore.removeUser();
                        this.props.history.push('/login')
                        break;
                    case 403: // Forbidden
                        ZoomMessage.error('Access denied');
                        break;
                    default:
                        ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                        break;
                }
            });

        this.setState({
            currentPage: page,
            pageSize: pageSize,
            sortedInfo: sorter
        })
    }

    handleOnUserCreate(values, reset) {
        const { commonStore, userStore, roleStore } = this.props;
        const { selectedUserId } = this.state;
        const { username, displayName, cardNumber, active, role } = values;

        // console.log(role);
        // return;

        if (selectedUserId) { // update
            userStore
                .updateUser(selectedUserId, username, displayName, cardNumber, active, role)
                .then(() => {
                    reset()
                    ZoomMessage.success('Update successful')
                    this.setState({ createUserVisible: false, selectedUserId: undefined })
                })
                .then(() => roleStore.listRole())
                .catch(error => {
                    switch (error.response.status) {
                        case 401: // Unauthorized
                            ZoomMessage.error('Unauthorized or expired access');
                            if (commonStore.isLoggedIn) commonStore.removeUser();
                            this.props.history.push('/login')
                            break;
                        case 403: // Forbidden
                            ZoomMessage.error('Access denied');
                            break;
                        default:
                            ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                            break;
                    }
                });

        } else { // create
            userStore
                .createUser(username, displayName, cardNumber, active, role)
                .then(() => {
                    reset()
                    ZoomMessage.success('Creation successful')
                    this.setState({ createUserVisible: false, selectedUserId: undefined })
                    this.handleOnResetAllClick()
                })
                .then(() => roleStore.listRole())
                .catch(error => {
                    switch (error.response.status) {
                        case 401: // Unauthorized
                            ZoomMessage.error('Unauthorized or expired access');
                            if (commonStore.isLoggedIn) commonStore.removeUser();
                            this.props.history.push('/login')
                            break;
                        case 403: // Forbidden
                            ZoomMessage.error('Access denied');
                            break;
                        case 409: // Conflict
                            ZoomMessage.error('Duplicates exist');
                            keyStore.listKey();
                            break;
                        default:
                            ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                            break;
                    }
                });

        }
    }

    renderFilterDropdownInput(dataIndex) {
        switch (dataIndex) {
            case 'username':
            case 'displayName':
            case 'role':
                return (
                    <Input
                        ref={node => { this.searchInput = node }}
                        placeholder='Search ...'
                        value={this.state.filterValues[dataIndex]}
                        onChange={e => {
                            const filterValues = update(this.state.filterValues, { [dataIndex]: { $set: e.target.value } })
                            this.setState({
                                filterValues
                            })
                        }}
                        style={{ width: 100, marginBottom: 8, display: 'block' }}
                    />
                )
            default:
                return null
        }
    }

    
    renderTableColumn() {
        const { commonStore } = this.props
        const { sortedInfo } = this.state

        let columns = [
            {
                title: '',
                dataIndex: 'inactive',
                key: 'inactive',
                sorter: false,
                width: 30,
                render: (text, record) => {
                    return (!record.active) && <Tooltip title='Inactive'><StopOutlined /></Tooltip>
                },
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'username' && sortedInfo.order,
                width: 100,
                render: (text, record) => {
                    return record.username || '-'
                },
                ...this.getColumnSearchProps('username')
            },
            {
                title: 'Display name',
                dataIndex: 'displayName',
                key: 'displayName',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'displayName' && sortedInfo.order,
                width: 350,
                render: (text, record) => {
                    return record.displayName || '-'
                },
                ...this.getColumnSearchProps('displayName')
            },
            {
                title: 'Role',
                dataIndex: 'role',
                key: 'role',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'role' && sortedInfo.order,
                render: roles => (
                    <span>
                        {roles && roles.map(r =>
                            <Tag color = 'geekblue' key = {r.id}>
                                <Tooltip title={r.description}>
                                    {r.abbreviation}
                                </Tooltip>
                            </Tag>
                        )}
                    </span>
                ),
                ...this.getColumnSearchProps('role')
            },
        ]

        if (commonStore.isAdmin())
            columns = columns.concat({
                title: 'Action',
                key: 'action',
                fixed: 'right',
                width: 70,
                render: (text, record) => (
                    <span>
                        <a onClick={() => this.handleOnEditClick(record)}>
                            Edit
                        </a>
                    </span>
                )
            })

        return columns
    }
    

    render() {
        const { commonStore, userStore, roleStore } = this.props;
        const { currentPage, pageSize, selectedUserId } = this.state;

        let selectedUserIndex;

        if (selectedUserId) selectedUserIndex = userStore.users.findIndex(u => u.id === selectedUserId);

        return (
            <TableWrapper>
                <ActionWrapper>
                    <ActionLeftWrapper>
                        {/* {this.renderFilterTags()} */}
                    </ActionLeftWrapper>

                    <Button type="primary" onClick={() => this.handleOnResetAllClick()}>
                        Reset view
                    </Button>
                    {commonStore.isAdmin() ?
                        <Button type="primary" onClick={() => this.handleOnAddNewClick()}>
                            New
                        </Button> :
                        null
                    }
                </ActionWrapper>
                <Table
                    columns={this.renderTableColumn()}
                    dataSource={toJS(userStore.users)}
                    pagination={
                        {
                            showQuickJumper: true,
                            current: +currentPage,
                            pageSize: pageSize,
                            // total: userStore.count,
                        }
                    }
                    onChange={(pagination, filters, sorter) => this.handleOnTableChange(pagination, filters, sorter)}
                    loading={userStore.isSubmitting}
                    rowKey={record => record.id}
                />

                <CreateUserModal
                    user={selectedUserIndex > -1 ? toJS(userStore.users[selectedUserIndex]) : this.emptyUser}
                    roles={toJS(roleStore.roles)}
                    visible={this.state.createUserVisible}
                    isSubmitting={userStore.isSubmitting}
                    onSubmit={(values, reset) => this.handleOnUserCreate(values, reset)}
                    onClose={() => this.setState({ createUserVisible: false })}
                />

            </TableWrapper>
        )
    }
}

export default withRouter(UserTable)