import React from 'react'
import {
  Modal,
  ModalHeader,
} from 'reactstrap'
import {withRouter} from 'react-router-dom'
import {WithContext} from './context'
import {get_component_name} from './utils'

export function AsModal (WrappedComponent) {
  class AsModal extends React.Component {
    constructor (props) {
      super(props)
      this.regex = props.regex || /modal\/$/
      this.state = {
        open: this.path_match(),
      }
    }

    path_match = () => this.regex.test(this.props.location.pathname)

    parent_uri = () => {
      if (this.props.parent_uri) {
        return this.props.parent_uri
      } else {
        return this.props.location.pathname.replace(this.regex, '')
      }
    }

    componentDidMount () {
      this.toggle()
    }

    componentDidUpdate (prevProps) {
      if (this.props.location.pathname !== prevProps.location.pathname) {
        this.toggle()
      }
    }

    toggle = () => this.setState({open: this.path_match()})

    close = () => this.props.history.replace(this.parent_uri())

    onSubmitWrapper = r => {
      this.close()
      this.props.onSubmit && this.props.onSubmit(r)
    }

    render () {
      return (
        <Modal isOpen={this.state.open} toggle={this.close}
               size={this.props.size}
               className={this.props.className}>
          <ModalHeader toggle={this.close}>
            {this.props.title}
            <span id="modal-title"/>
          </ModalHeader>
          <WrappedComponent
            {...this.props}
            onCancel={this.close}
            onSubmit={this.onSubmitWrapper}
            modal_open={this.state.open}
            form_body_class="modal-body"
            form_footer_class="modal-footer"
          />
        </Modal>
      )
    }
  }
  AsModal.displayName = `AsModal(${get_component_name(WrappedComponent)})`
  return WithContext(withRouter(AsModal))
}
