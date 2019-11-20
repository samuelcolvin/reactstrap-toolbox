import React from 'react'
import {Button, ButtonGroup, Form as BootstrapForm} from 'reactstrap'
import {AsModal} from '../Modal'
import {InputWrapper} from './Input'
import {WithContext} from '../context'

const DefaultRenderFields = ({fields, RenderField}) => (
  Object.values(fields).map(field => <RenderField key={field.name} field={field}/>)
)

const DefaultFormButtons = ({state, form_props}) => (
  <div className={form_props.form_footer_class || 'text-right'}>
    <ButtonGroup>
      <Button type="button"
              color="secondary"
              disabled={state.disabled}
              onClick={() => form_props.done && form_props.done()}>
        {form_props.cancel_label || 'Cancel'}
      </Button>
      <Button type="submit" color="primary" disabled={state.disabled}>
        {form_props.save_label || 'Save'}
      </Button>
    </ButtonGroup>
  </div>
)

class _Form extends React.Component {
  constructor (props) {
    super(props)
    this.form_ref = React.createRef()
    this.state = {
      disabled: false,
      errors: {},
      form_error: null,
    }
    this.errors = {}
    if (this.props.fields) {
      for (const [k, v] of Object.entries(this.props.fields)) {
        v['name'] = k
      }
    }
  }

  componentDidMount () {
    if (this.props.submit_initial && this.props.fields) {
      const form_data = {}
      for (const field_name of Object.keys(this.props.fields)) {
        const initial = this.props.initial[field_name]
        if (initial) {
          form_data[field_name] = initial
        }
      }
      this.props.onChange(form_data)
    }
  }

  submit = async e => {
    if (e) {
      // check it's this form that was submitted
      if (e.target !== this.form_ref.current) {
        return
      }
      e.preventDefault()
    }
    const data = this.props.submit_data ? this.props.submit_data(this.props.form_data) : {...this.props.form_data}
    if (this.props.errors && Object.values(this.props.errors).some(v => v)) {
      return
    }
    if (Object.keys(data).length === 0) {
      this.setState({form_error: 'No data entered'})
      return
    }
    const initial = this.props.initial || {}
    const missing = (
      Object.values(this.props.fields).filter(f => f.required && !initial[f.name] && !data[f.name])
    )
    if (missing.length) {
      // required since editors don't use inputs so required won't be caught be the browser
      this.setState({errors: missing.reduce((o, f) => ({...o, [f.name]: 'Field Required'}), {})})
      return
    }
    this.setState({disabled: true, errors: {}, form_error: null})
    const r = await this.props.function(data)
    if (r.status >= 400) {
      console.warn('form error', r)
      const errors = {}
      for (let e of (r.data.details || [])) {
        errors[e.loc[0]] = e.msg
      }
      this.setState({disabled: false, errors, form_error: Object.keys(errors).length ? 'Error occurred' : null})
    } else {
      this.props.success_msg && this.props.ctx.setMessage(this.props.success_msg)
      this.props.submitted && this.props.submitted(r)
      this.props.done && this.props.done(r)
    }
  }

  setField = (name, value) => {
    if (this.props.onChange) {
      return this.props.onChange({...this.props.form_data, [name]: value})
    }
  }

  render_field = ({field, optional}) => {
    if (!field) {
      if (optional) {
        return null
      }
      throw TypeError(
        'RenderField: field undefined but "optional" not set, make sure all fields referenced are properly defined.'
      )
    }
    const field_value = this.props.form_data[field.name]
    const value = field_value === undefined ? (this.props.initial || {})[field.name] : field_value
    return (
      <InputWrapper
        field={field}
        value={value}
        error={this.errors[field.name]}
        disabled={this.state.disabled}
        onChange={v => this.setField(field.name, v)}
        type_lookup={this.props.type_lookup}
        onBlur={() => this.props.onBlur && this.props.onBlur(field.name)}
      />
    )
  }

  render () {
    this.errors = {...this.state.errors, ...(this.props.errors || {})}
    const RenderFields = this.props.RenderFields || DefaultRenderFields
    const Buttons = this.props.Buttons || DefaultFormButtons
    return (
      <BootstrapForm onSubmit={this.submit} className="highlight-required" ref={this.form_ref}>
        <div className={this.props.form_body_class}>
          <div className="form-error text-right">{this.props.form_error || this.state.form_error}</div>
          <RenderFields fields={this.props.fields || {}} RenderField={this.render_field}/>
        </div>
        <Buttons state={this.state} form_props={this.props} setField={this.setField} submit={this.submit}/>
      </BootstrapForm>
    )
  }
}
export const Form = WithContext(_Form)

export class StandaloneForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {form_data: {}}
  }

  setFormData = form_data => {
    return new Promise(resolve => {
      this.setState({form_data}, resolve)
    })
  }

  render () {
    return <Form {...this.props} form_data={this.state.form_data} onChange={this.setFormData}/>
  }
}
export const ModalForm = AsModal(StandaloneForm)
