import React from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Table, Button, Input, Select, Checkbox, Row, Tag, DatePicker, Tooltip, Card, List, Popconfirm } from 'antd'
import update from 'immutability-helper'
import _ from 'lodash'
import CreateKeyGroupModal from './createKeyGroupModal'
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
    description: undefined,
    abbreviation: undefined,
    key: undefined,
}

@inject('commonStore', 'keyGroupStore', 'keyStore', 'roleStore') @observer
class KeyGroupTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            pageSize: 7,
            filterValues: initialFilterValues,
            sortedInfo: undefined,
            createKeyGroupVisible: false,
            selectedKeyGroupId: undefined,
        };
        
        this.emptyKeyGroup = {
            id: undefined,
            description: undefined,
            abbreviation: undefined,
            key: [],
            role: [],
        };
    }

    async componentDidMount() {
        const { commonStore, keyGroupStore, keyStore, roleStore } = this.props;
        const { pageSize } = this.state
        const currentPage = 1

        try {
            await keyGroupStore.listKeyGroup(pageSize, pageSize * (currentPage - 1));
            await keyStore.listKey();
            await roleStore.listRole(); 

        } catch (error) {
            switch (error.response.status) {
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
                    dataIndex === 'key' 
                )
            ) {
                setTimeout(() => this.searchInput.select())
            }
        },
    })

    handleOnAddNewClick() {
        this.setState({ createKeyGroupVisible: true, selectedKeyGroupId: undefined })
    }

    handleOnDelete(record) {
        const { keyGroupStore, keyStore } = this.props;
        
        keyGroupStore
            .deleteKeyGroup(record.id)
            .then(() => ZoomMessage.success('Deletion successful'))
            .then(() => keyStore.listKey())
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
        this.setState({ createKeyGroupVisible: true, selectedKeyGroupId: record.id })
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
        const { keyGroupStore } = this.props
        const { pageSize } = pagination
        const { description, abbreviation, key } = this.state.filterValues;

        keyGroupStore
            .listKeyGroup(pageSize, pageSize * (page - 1),
                sortField,
                description, abbreviation, key,
            )
            .catch (error => {
                switch (error.response.status) {
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

    handleOnKeyGroupCreate(values, reset) {
        const { commonStore, keyGroupStore, roleStore } = this.props;
        const { selectedKeyGroupId } = this.state;
        const { description, abbreviation, role } = values;

        if (selectedKeyGroupId) { // update
            keyGroupStore
                .updateKeyGroup(selectedKeyGroupId, description, abbreviation, role)
                .then(() => {
                    reset()
                    ZoomMessage.success('Update successful')
                    this.setState({ createKeyGroupVisible: false, selectedKeyGroupId: undefined })
                })
                .then(() => roleStore.listRole)
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

        } else { // create
            keyGroupStore
                .createKeyGroup(description, abbreviation, role)
                .then(() => {
                    reset()
                    ZoomMessage.success('Creation successful')
                    this.setState({ createKeyGroupVisible: false, selectedKeyGroupId: undefined })
                    this.handleOnResetAllClick()
                })
                .then(() => roleStore.listRole)
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
            case 'key':
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
                title: 'Key',
                dataIndex: 'key',
                key: 'key',
                sorter: true,
                sortOrder: sortedInfo && sortedInfo.columnKey === 'key' && sortedInfo.order,
                width: 150,
                render: key => (
                    <span>
                        {key && key.map(k =>
                            <Tag color = 'geekblue' key={k.id}>
                                {k.description}
                            </Tag>
                        )}
                    </span>
                ),
                ...this.getColumnSearchProps('key')
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
                                        Authorisations for all roles to this key group will be revoked.<br />
                                        However, you should manually edit the keys belonging to this group.
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
        const { commonStore, keyGroupStore, keyStore, roleStore } = this.props;
        const { currentPage, pageSize, selectedKeyGroupId } = this.state;

        let selectedKeyGroupIndex;

        if (selectedKeyGroupId) selectedKeyGroupIndex = keyGroupStore.keyGroups.findIndex(kGp => kGp.id === selectedKeyGroupId);
        
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
                    dataSource={toJS(keyGroupStore.keyGroups)}
                    pagination={
                        {
                            showQuickJumper: true,
                            current: +currentPage,
                            pageSize: pageSize,
                            // total: keyGroupStore.count,
                        }
                    }
                    onChange={(pagination, filters, sorter) => this.handleOnTableChange(pagination, filters, sorter)}
                    loading={keyGroupStore.isSubmitting}
                    rowKey={record => record.id}
                />

                <CreateKeyGroupModal
                    keyGroup={selectedKeyGroupIndex > -1 ? toJS(keyGroupStore.keyGroups[selectedKeyGroupIndex]) : this.emptyKeyGroup}
                    keys={toJS(keyStore.keys)}
                    roles={toJS(roleStore.roles)}
                    visible={this.state.createKeyGroupVisible}
                    isSubmitting={keyGroupStore.isSubmitting}
                    onSubmit={(values, reset) => this.handleOnKeyGroupCreate(values, reset)}
                    onClose={() => this.setState({ createKeyGroupVisible: false })}
                />

            </TableWrapper>
        )
    }
}

export default withRouter(KeyGroupTable)