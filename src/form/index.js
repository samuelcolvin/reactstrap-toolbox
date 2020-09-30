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
      {form_props.onCancel ? (
        <Button type="button"
                color="secondary"
                disabled={state.disabled}
                onClick={() => form_props.onCancel()}>
          {form_props.cancel_label || 'Cancel'}
        </Button>
      ) : null}
      <Button type="submit" color="primary" disabled={state.disabled}>
        {form_props.save_label || 'Save'}
      </Button>
    </ButtonGroup>
  </div>
)

class _Form extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      disabled: false,
      errors: {},
      form_error: null,
    }
    this.errors = {}
  }

  componentDidMount () {
    this.mounted = true
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

  componentWillUnmount () {
    this.mounted = false
  }

  form_id = () => this.props.id || 'rstb-form'

  execute = data => {
    if (this.props.execute) {
      return this.props.execute(data)
    } else if (this.props.endpoint) {
      if (!window.app || !window.app.requests) {
        throw Error('"window.app.requests" is not set')
      }
      return window.app.requests.post(this.props.endpoint, data, {expected_status: [200, 201, 400, 409, 422, 470]})
    } else {
      throw Error('either "execute" or "endpoint" props must be set')
    }
  }

  submit = async e => {
    if (e) {
      // check it's this form that was submitted
      if (e.target.id !== this.form_id()) {
        return
      }
      e.preventDefault()
    }
    const data = this.props.submit_data ? this.props.submit_data({...this.props.form_data}) : {...this.props.form_data}
    if (this.props.errors && Object.values(this.props.errors).some(v => v)) {
      return
    }
    if (Object.keys(data).length === 0) {
      this.setState({form_error: 'No data entered'})
      return
    }
    const initial = this.props.initial || {}
    const missing = (
      Object.values(this.get_fields()).filter(f => f.required && !initial[f.name] && !data[f.name])
    )
    if (missing.length) {
      // required since editors don't use inputs so required won't be caught be the browser
      this.setState({errors: missing.reduce((o, f) => ({...o, [f.name]: 'Field Required'}), {})})
      return
    }
    this.setState({disabled: true, errors: {}, form_error: null})
    let r = await this.execute(data)
    if (!r) {
      r = {status: 200}
    }
    if (r.status >= 400) {
      const errors = {}
      for (let e of (r.data.details || r.data.detail || [])) {
        const k = e.loc[0] === 'body' ? e.loc[1] : e.loc[0]
        errors[k] = e.msg
      }
      this.setState({disabled: false, errors, form_error: Object.keys(errors).length ? null : 'Error occurred'})
    } else {
      this.props.afterSubmit && this.props.afterSubmit(r)
      // if the form is still visible, it can be made editable again for future use
      this.mounted && this.setState({disabled: false})
    }
  }

  setField = (name, value) => {
    if (this.props.onChange) {
      return this.props.onChange({...this.props.form_data, [name]: value})
    }
  }

  get_fields = () => {
    const fields = {}
    if (this.props.fields) {
      for (const [k, v] of Object.entries(this.props.fields)) {
        fields[k] = Object.assign({}, v, {name: k})
      }
    }
    return fields
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
        disabled={this.state.disabled || field.disabled || this.props.disabled}
        onChange={v => this.setField(field.name, v)}
        type_lookup={this.props.type_lookup}
        onBlur={() => this.props.onBlur && this.props.onBlur(field.name)}
        {...(field.extra || {})}
      />
    )
  }

  render () {
    this.errors = {...this.state.errors, ...(this.props.errors || {})}
    const RenderFields = this.props.RenderFields || DefaultRenderFields
    const Buttons = this.props.Buttons || DefaultFormButtons
    const className = this.props.highlight_required !== false ? 'highlight-required' : null
    return (
      <BootstrapForm onSubmit={this.submit} className={className} id={this.form_id()}>
        <div className={this.props.form_body_class || 'rstb-form'}>
          {this.props.children}
          <div className="form-error text-right">{this.props.form_error || this.state.form_error}</div>
          <RenderFields fields={this.get_fields()} RenderField={this.render_field}/>
        </div>
        <Buttons state={this.state} form_props={this.props} setField={this.setField} submit={this.submit}/>
      </BootstrapForm>
    )
  }
}
export const Form = WithContext(_Form)

export const StandaloneForm = props => {
  const [form_data, setFormData] = React.useState({})

  return <Form {...props} form_data={form_data} onChange={setFormData}/>
}

export const ModalForm = AsModal(StandaloneForm)
