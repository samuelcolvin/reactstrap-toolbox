import React from 'react'
import ReactDOM from 'react-dom'
import {Button, Modal, ModalBody, ButtonGroup} from 'reactstrap'

class ChoiceModal extends React.Component {
  state = {open: true}

  componentDidUpdate (prevProps) {
    if (this.props !== prevProps) {
      this.setState({open: true})
    }
  }

  finish = answer => {
    this.setState({open: false})
    this.props.resolve(answer)
  }

  render = () => (
    <Modal isOpen={this.state.open} toggle={() => this.finish(this.props.choices[0].answer)}>
      <ModalBody>
        <div className="mb-2">
          {this.props.message}
        </div>
        <div className="text-right">
          <ButtonGroup>
            {this.props.choices.map((c, i) => (
              <Button key={i} size="sm" color={c.colour || 'secondary'} onClick={() => this.finish(c.answer)}>
                {c.text}
              </Button>
            ))}
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

export function choice_modal (message, choices) {
  return new Promise(resolve => {
    ReactDOM.render(<ChoiceModal {...{resolve, message, choices}}/>, get_create_element('rstb-choice-modal'))
  })
}

export function confirm_modal ({message, continue_text, continue_colour, cancel_text, cancel_colour}={}) {
  const choices = [
    {
      answer: false,
      colour: cancel_colour || null,
      text: cancel_text || 'Cancel',
    },
    {
      answer: true,
      colour: continue_colour || 'primary',
      text: continue_text || 'Continue',
    },
  ]
  message = message || 'Are you sure you want to continue?'
  return choice_modal(message, choices)
}
