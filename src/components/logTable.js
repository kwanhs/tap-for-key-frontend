import React from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { Table, Button, Input, Select, Checkbox, Row, Tag, DatePicker, Tooltip, Card, List } from 'antd'
import moment from 'moment'
import update from 'immutability-helper'
import _, { keys } from 'lodash'
import Meta from 'antd/lib/card/Meta'
import { SearchOutlined, StopOutlined, CheckOutlined, RollbackOutlined } from '@ant-design/icons'
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
    cellNumber: undefined,
    description: undefined,
    keyGroup: undefined,
    status: undefined,
    actionBy: undefined,
    actionTime: undefined,
}

@inject('commonStore', 'logStore') @observer
class LogTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            pageSize: 7,
            filterValues: initialFilterValues,
            sortedInfo: undefined,
        };
    }

    async componentDidUpdate(prevProps) {

        if (!prevProps.selectedKey ||
             this.props.selectedKey.id !== prevProps.selectedKey.id &&
             this.props.selectedKey.id > 0 ) {

            const { logStore, commonStore, selectedKey } = this.props;
            const { pageSize } = this.state
            const currentPage = 1

            try {
                await logStore.listLog(selectedKey.id, pageSize, pageSize * (currentPage - 1));

            } catch (error) {
                // console.log(error)
                switch (error.response.status) {
                    default:
                        ZoomMessage.error(`Uncaught error ${error.response.status}: ${error.response.data}`);
                        break;
                }

            }

            // this.setState({ currentPage })
        }
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
                    dataIndex === 'cellNumber' ||
                    dataIndex === 'description' ||
                    dataIndex === 'keyGroup' //||
                    // dataIndex === 'status' ||
                    // dataIndex === 'actionBy' ||
                    // dataIndex === 'action'
                )
            ) {
                setTimeout(() => this.searchInput.select())
            }
        },
    })

    handleReset(dataIndex, clearFilters) {
        clearFilters()
        switch (dataIndex) {
            case 'cellNumber':
            case 'description':
            case 'keyGroup':
            // case 'status':
            // case 'action':
            // case 'time':
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
        const { logStore, selectedKey } = this.props
        const { pageSize } = pagination
        const { cellNumber, description, keyGroup, status, actionBy, actionTime } = this.state.filterValues;

        logStore
            .listLog(selectedKey.id, pageSize, pageSize * (page - 1),
                sortField,
                cellNumber, description, keyGroup, status, actionBy, actionTime
            )
            .catch(error => {
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

    renderFilterDropdownInput(dataIndex) {
        switch (dataIndex) {
            case 'description':
            case 'keyGroup':
            // case 'status':
            // case 'actionBy':
            // case 'actionTime':
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
                title: 'Action',
                dataIndex: 'action',
                key: 'action',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'actionTime' && sortedInfo.order,
                width: 50,
                render: action => (action==='return') ?
                    <Tooltip title='Return'> <RollbackOutlined /> </Tooltip> :
                    <Tooltip title='Retrieve'> <CheckOutlined /> </Tooltip>,
                // ...this.getColumnSearchProps('actionTime')
            },
            
            {
                title: 'Username',
                dataIndex: 'user',
                key: 'username',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'actionTime' && sortedInfo.order,
                width: 50,
                render: user => <Tag color = 'geekblue'>{user.username}</Tag>
                // ...this.getColumnSearchProps('actionTime')
            },
            
            {
                title: 'Display name',
                dataIndex: 'user',
                key: 'displayName',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'actionTime' && sortedInfo.order,
                width: 300,
                render: user => user.displayName ? user.displayName : '-'
                // ...this.getColumnSearchProps('actionTime')
            },
            
            {
                title: 'Time',
                dataIndex: 'createdAt',
                key: 'actionTime',
                // sorter: true,
                // sortOrder: sortedInfo && sortedInfo.columnKey === 'actionTime' && sortedInfo.order,
                width: 150,
                render: time => time && moment(time).format('D-MMM-YYYY HH:mm'),
                // ...this.getColumnSearchProps('actionTime')
            },
        ]

        return columns
    }
    

    render() {
        const { commonStore, logStore } = this.props;
        const { currentPage, pageSize } = this.state;

        let selectedKeyIndex;
        
        return (
            <TableWrapper>
                {/* <ActionWrapper>
                    <ActionLeftWrapper>
                        {this.renderFilterTags()}
                    </ActionLeftWrapper>

                    <Button type="primary" onClick={() => this.handleOnResetAllClick()}>
                        Reset view
                    </Button>
                </ActionWrapper> */}
                <Table
                    columns={this.renderTableColumn()}
                    dataSource={logStore.count > -1 && toJS(logStore.log)}
                    pagination={
                        {
                            showQuickJumper: true,
                            showSizeChanger: false,
                            current: +currentPage,
                            pageSize: pageSize,
                            total: logStore.count,
                        }
                    }
                    onChange={(pagination, filters, sorter) => this.handleOnTableChange(pagination, filters, sorter)}
                    loading={logStore.isSubmitting}
                    rowKey={record => record.id}
                />

            </TableWrapper>
        )
    }
}

export default withRouter(LogTable)