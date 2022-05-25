import React, { Component } from 'react'
import { Modal } from 'antd'
import CreateKeyForm from './forms/createKeyForm'
import { reaction } from 'mobx'

class CreateKeyModal extends Component {
    formRef = React.createRef();

    constructor(props) {
        super(props)
    }

    render() {
        const { visible, isSubmitting, selectedKey, keyGroups } = this.props
        const isNewKey = selectedKey.id === undefined;
        
        return (
            <Modal
                visible={visible}
                mask
                maskClosable={false}
                centered
                width={600}
                title={isNewKey ? 'Create key' : 'Edit key'}
                okText='Save'
                cancelText='Cancel'
                onOk={() => this.formRef.handleSubmit()}
                onCancel={() => {
                    this.props.onClose()
                    this.formRef.resetForm()
                }}
                forceRender
            >
                <CreateKeyForm
                    initial={selectedKey}
                    keyGroups={keyGroups}
                    isSubmitting={isSubmitting}
                    onSubmit={(values, reset) => this.props.onSubmit(values, reset)}
                    ref={(inst) => this.formRef = inst}
                />
            </Modal>
        )
    }
}

export default CreateKeyModal
