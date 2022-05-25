import React, { Component } from 'react'
import { Modal } from 'antd'
import CreateKeyGroup from './forms/createKeyGroupForm'
import { reaction } from 'mobx'

class CreateKeyGroupModal extends Component {
    formRef = React.createRef();

    constructor(props) {
        super(props)
    }

    render() {
        const { visible, isSubmitting, keyGroup, keys, roles } = this.props
        const isNewKeyGroup = keyGroup.id === undefined;
        
        return (
            <Modal
                visible={visible}
                mask
                maskClosable={false}
                centered
                width={800}
                bodyStyle={{height: 400}}
                title={isNewKeyGroup ? 'Create Key Group' : 'Edit Key Group'}
                okText='Save'
                cancelText='Cancel'
                onOk={() => this.formRef.handleSubmit()}
                onCancel={() => {
                    this.props.onClose()
                    this.formRef.resetForm()
                }}
                forceRender
            >
                <CreateKeyGroup
                    initial={keyGroup}
                    keys={keys}
                    roles={roles}
                    isSubmitting={isSubmitting}
                    onSubmit={(values, reset) => this.props.onSubmit(values, reset)}
                    ref={(inst) => this.formRef = inst}
                />
            </Modal>
        )
    }
}

export default CreateKeyGroupModal
