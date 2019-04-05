import React from 'react'
import ReactDOM from 'react-dom'
import {Button, Modal, ModalBody, ButtonGroup} from 'reactstrap'

class Confirm extends React.Component {
  state = {open: true}

  componentDidUpdate (prevProps) {
    if (this.props !== prevProps) {
      this.setState({open: true})
    }
  }

  finish = yes => {
    this.setState({open: false})
    this.props.resolve(yes)
  }

  render = () => (
    <Modal isOpen={this.state.open} toggle={() => this.finish(false)}>
      <ModalBody>
        <div className="mb-2">
          {this.props.message || 'Are you sure you want to continue?'}
        </div>
        <div className="text-right">
          <ButtonGroup>
            <Button size="sm" onClick={() => this.finish(false)}>
              {this.props.cancel_text || 'Cancel'}
            </Button>
            <Button size="sm" color={this.props.continue_color || 'primary'} onClick={() => this.finish(true)}>
              {this.props.continue_text || 'Continue'}
            </Button>
          </ButtonGroup>
        </div>
      </ModalBody>
    </Modal>
  )
}

export function get_create_element (el_id) {
  const el = document.getElementById(el_id)
  if (el) {
    return el
  } else {
    const new_el = document.createElement('div')
    new_el.id = el_id
    document.body.appendChild(new_el)
    return document.getElementById(el_id)
  }
}

export function confirm_modal ({message, continue_text, continue_color, cancel_text}={}) {
  const el = get_create_element('rstb-confirm-modal')
  return new Promise(resolve => {
    ReactDOM.render(<Confirm {...{resolve, message, continue_text, continue_color, cancel_text}}/>, el)
  })
}
