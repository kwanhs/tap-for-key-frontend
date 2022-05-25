import React from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Table, Button, Input, Select, Checkbox, Row, Tag, DatePicker, Tooltip, Card, List, Popconfirm } from 'antd'
import moment from 'moment'
import update from 'immutability-helper'
import _, { keyGroups } from 'lodash'
import Meta from 'antd/lib/card/Meta'
import CreateRoleModal from './createRoleModal'
import { SearchOutlined, StopOutlined } from '@ant-design/icons'
import userStore from '../stores/userStore'
import commonStore from '../stores/commonStore'
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
    description: undefined,
    abbreviation: undefined,
    keyGroup: undefined,
}

@inject('commonStore', 'roleStore', 'userStore', 'keyGroupStore') @observer
class RoleTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            pageSize: 15,
            filterValues: initialFilterValues,
            sortedInfo: undefined,
            createRoleVisible: false,
            selectedRoleId: undefined,
        };
        
        this.emptyRole = {
            id: undefined,
            description: undefined,
            abbreviation: undefined,
            keyGroup: [],
            user: [],
        };
    }

    async componentDidMount() {
        const { commonStore, roleStore, userStore, keyGroupStore } = this.props;
        const { pageSize } = this.state
        const currentPage = 1

        try {
            await roleStore.listRole(pageSize, pageSize * (currentPage - 1));
            await userStore.listUser();
            await keyGroupStore.listKeyGroup();    

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
        filterDropdown: ({ setSelectedkeyGroups, selectedkeyGroups, confirm, clearFilters }) => {
            return (
                <div style={{ padding: 8 }}>
                    {this.renderFilterDropdownInput(dataIndex, confirm)}
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
                    dataIndex === 'description' ||
                    dataIndex === 'abbreviation' ||
                    dataIndex === 'keyGroup'
                )
            ) {
                setTimeout(() => this.searchInput.select())
            }
        },
    })

    handleOnAddNewClick() {
        this.setState({ createRoleVisible: true, selectedRoleId: undefined })
    }

    handleOnDelete(record) {
        const { roleStore, userStore, keyGroupStore } = this.props;
        
        roleStore
            .deleteRole(record.id)
            .then(() => ZoomMessage.success('Deletion successful'))
            .then(() => userStore.listUser)
            .then(() => keyGroupStore.listKeyGroup)
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
                    case 404: // Not found
                        ZoomMessage.error('Not found');
                        keyStore.listKey();
                        break;
                    default:
                        ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                        break;
                }
            });
    }

    handleOnEditClick(record) {
        this.setState({ createRoleVisible: true, selectedRoleId: record.id })
    }

    handleReset(dataIndex, clearFilters) {
        clearFilters()
        switch (dataIndex) {
            case 'description':
            case 'abbreviation':
            case 'keyGroup':
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
        const { roleStore } = this.props
        const { pageSize } = pagination
        const { description, abbreviation, keyGroup } = this.state.filterValues;
        
        roleStore
            .listRole(pageSize, pageSize * (page - 1),
                sortField,
                description, abbreviation, keyGroup,
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

    handleOnRoleCreate(values, reset) {
        const { commonStore, roleStore, userStore, keyGroupStore } = this.props;
        const { selectedRoleId } = this.state;
        const { description, abbreviation, user, keyGroup } = values;

        // console.log(role);
        // return;

        if (selectedRoleId) { // update
            roleStore
                .updateRole(selectedRoleId, description, abbreviation, user, keyGroup)
                .then(() => {
                    reset()
                    ZoomMessage.success('Update successful')
                    this.setState({ createRoleVisible: false, selectedRoleId: undefined })
                })
                .then(() => userStore.listUser)
                .then(() => keyGroupStore.listKeyGroup)
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
            roleStore
                .createRole(description, abbreviation, user, keyGroup)
                .then(() => {
                    reset()
                    ZoomMessage.success('Creation successful')
                    this.setState({ createRoleVisible: false, selectedRoleId: undefined })
                    this.handleOnResetAllClick()
                })
                .then(() => userStore.listUser)
                .then(() => keyGroupStore.listKeyGroup)
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

    renderFilterDropdownInput(dataIndex, confirm) {
        switch (dataIndex) {
            case 'description':
            case 'abbreviation':
            case 'keyGroup':
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
                        onPressEnter={() => this.handleSearch(confirm)}
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
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'description' && sortedInfo.order,
                width: 150,
                render: (text, record) => {
                    return record.description || '-'
                },
                ...this.getColumnSearchProps('description')
            },
            {
                title: 'Abbreviation',
                dataIndex: 'abbreviation',
                key: 'abbreviation',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'abbreviation' && sortedInfo.order,
                width: 150,
                render: (text, record) => {
                    return record.abbreviation || '-'
                },
                ...this.getColumnSearchProps('abbreviation')
            },
            {
                title: 'Key gruop',
                dataIndex: 'keyGroup',
                key: 'keyGroup',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'keyGroup' && sortedInfo.order,
                width: 150,
                render: keyGroup => (
                    <span>
                        {keyGroup && keyGroup.map(kGp =>
                            <Tag color = 'geekblue' key={kGp.id}>
                                <Tooltip title={kGp.description}>
                                    {kGp.abbreviation}
                                </Tooltip>
                            </Tag>
                        )}
                    </span>
                ),
                ...this.getColumnSearchProps('keyGroup')
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
                        &nbsp;|&nbsp;   
                        <Popconfirm
                                title = {
                                    <div>
                                        Are you sure to delete this record?<br />
                                        Assignments of any users to use key groups<br />
                                        authorised under this role will also be deleted.
                                    </div>
                                }
                                onConfirm={() => this.handleOnDelete(record)}
                            >
                                <a href="#">
                                    Delete
                                </a>
                        </Popconfirm>
                    </span>
                )
            })

        return columns
    }
    

    render() {
        const { commonStore, roleStore, userStore, keyGroupStore } = this.props;
        const { currentPage, pageSize, selectedRoleId } = this.state;

        let selectedRoleIndex;

        if (selectedRoleId) selectedRoleIndex = roleStore.roles.findIndex(r => r.id === selectedRoleId);
        
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
                    dataSource={toJS(roleStore.roles)}
                    pagination={
                        {
                            showQuickJumper: true,
                            current: +currentPage,
                            pageSize: pageSize,
                            // total: roleStore.count,
                        }
                    }
                    onChange={(pagination, filters, sorter) => this.handleOnTableChange(pagination, filters, sorter)}
                    loading={roleStore.isSubmitting}
                    rowKey={record => record.id}
                />

                <CreateRoleModal
                    role={selectedRoleIndex > -1 ? toJS(roleStore.roles[selectedRoleIndex]) : this.emptyRole}
                    users={toJS(userStore.users)}
                    keyGroups={toJS(keyGroupStore.keyGroups)}
                    visible={this.state.createRoleVisible}
                    isSubmitting={roleStore.isSubmitting}
                    onSubmit={(values, reset) => this.handleOnRoleCreate(values, reset)}
                    onClose={() => this.setState({ createRoleVisible: false })}
                />

            </TableWrapper>
        )
    }
}

export default withRouter(RoleTable)