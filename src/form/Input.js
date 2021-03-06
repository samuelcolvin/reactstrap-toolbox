import React from 'react'
import {
  FormGroup,
  Label as BsLabel,
  Input as BsInput,
  CustomInput,
  FormText,
  FormFeedback,
  ButtonGroup,
  Button,
} from 'reactstrap'
import {as_title} from '../utils'
import Recaptcha from '../Recaptcha'

export const InputLabel = ({field, children}) =>
  field.show_label !== false ? (
    <BsLabel htmlFor={field.name} className={field.required ? 'required' : ''}>
      {children}
      {field.title}
    </BsLabel>
  ) : null

export const InputHelpText = ({field}) => (field.help_text ? <FormText>{field.help_text}</FormText> : null)

export const HiddenInput = ({field, disabled, error, value, onChange, onBlur}) => (
  <BsInput
    className="hidden-input"
    value={value || ''}
    invalid={!!error}
    disabled={disabled}
    name={field.name}
    id={field.name}
    onChange={e => onChange(e.target.value)}
    onBlur={e => onBlur(e.target.value)}
    required={field.required}
  />
)

const placeholder = field => {
  if (field.placeholder === true) {
    return field.title
  } else if (field.placeholder) {
    return field.placeholder
  }
  return null
}

export const InputGeneral = ({className, field, error, disabled, value, onChange, onBlur, custom_type, ...extra}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field} />
    <BsInput
      type={custom_type || field.type || 'text'}
      className={field.inputClassName}
      invalid={!!error}
      disabled={disabled}
      name={field.name}
      id={field.name}
      required={field.required}
      maxLength={field.max_length}
      minLength={field.min_length}
      autoComplete={field.autocomplete}
      placeholder={placeholder(field)}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      onBlur={e => onBlur(e.target.value)}
      {...extra}
    />
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field} />
  </FormGroup>
)

export const InputCheckbox = ({className, field, disabled, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className || 'py-2'} check>
    <InputLabel field={field}>
      <BsInput
        type="checkbox"
        label={field.title}
        disabled={disabled}
        name={field.name}
        id={field.name}
        required={field.required}
        checked={value || false}
        onChange={e => onChange(e.target.checked)}
        onBlur={e => onBlur(e.target.checked)}
      />
    </InputLabel>
    <InputHelpText field={field} />
  </FormGroup>
)

function prep_choice (c) {
  if (typeof c === 'string') {
    c = {value: c}
  }
  if (typeof c !== 'object' || typeof c.value !== 'string') {
    throw TypeError(`choice not an object or choice.value not a string: ${c}`)
  }
  return {value: c.value, label: c.label || as_title(c.value)}
}

export const InputSelect = ({className, field, disabled, error, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field} />
    <CustomInput
      type="select"
      invalid={!!error}
      value={value || ''}
      disabled={disabled}
      name={field.name}
      id={field.name}
      required={field.required}
      autoComplete={field.autocomplete}
      onChange={e => onChange(e.target.value)}
      onBlur={e => onBlur(e.target.value)}
    >
      {field.allow_empty !== false && <option value="">&mdash;</option>}
      {field.choices &&
        field.choices.map(prep_choice).map((c, i) => (
          <option key={i} value={c.value}>
            {c.label}
          </option>
        ))}
    </CustomInput>
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field} />
  </FormGroup>
)

export const InputCheckboxMultiple = ({className, field, disabled, value, onChange, onBlur, error}) => {
  const selected = new Set(value || [])
  const onSingleChange = key => {
    if (!selected.delete(key)) {
      selected.add(key)
    }
    onChange([...selected])
  }
  return (
    <FormGroup className={className || field.className || 'checkbox-multiple'}>
      <InputLabel field={field} />
      {field.choices &&
        field.choices.map(prep_choice).map((c, i) => (
          <div key={i} className="form-check">
            <BsLabel htmlFor={`${field.name}-${c.value}`}>
                <BsInput
                  type="checkbox"
                  label={c.label}
                  disabled={disabled}
                  name={`${field.name}-${c.value}`}
                  id={`${field.name}-${c.value}`}
                  checked={selected.has(c.value)}
                  onChange={() => onSingleChange(c.value)}
                  onBlur={e => onBlur(e.target.checked)}
                />
                {c.label}
            </BsLabel>
          </div>
        ))}
      <BsInput
        className="hidden-input"
        value={selected.size ? 'set' : ''}
        invalid={!!error}
        disabled={disabled}
        name={field.name}
        id={field.name}
        required={field.required}
      />
      <InputHelpText field={field} />
      {error && <FormFeedback>{error}</FormFeedback>}
    </FormGroup>
  )
}

export const InputRadio = ({className, field, disabled, error, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field} />
    {field.choices &&
      field.choices.map(prep_choice).map((c, i) => (
        <div key={i} className="custom-control custom-radio">
          <input
            type="radio"
            className="custom-control-input"
            checked={c.value === value}
            disabled={disabled}
            name={field.name}
            id={`${field.name}-${c.value}`}
            required={field.required}
            onChange={() => onChange(c.value)}
            onBlur={() => onBlur(c.value)}
          />
          <label className="custom-control-label" htmlFor={`${field.name}-${c.value}`}>
            <span className="d-inline-block mr-1">{c.label.title || c.label}</span>
            {c.label.description && <small className="text-muted">{c.label.description}</small>}
          </label>
        </div>
      ))}
    {error && <FormFeedback className="d-block">{error}</FormFeedback>}
    <InputHelpText field={field} />
  </FormGroup>
)

export const InputToggle = ({className, field, disabled, error, value, onChange, onBlur, children}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field} />
    <div>
      <ButtonGroup>
        {field.choices &&
          field.choices.map(prep_choice).map((c, i) => (
            <Button
              key={i}
              disabled={disabled}
              onClick={() => onChange(c.value)}
              color={c.value === value ? 'primary' : 'secondary'}
            >
              {c.label}
            </Button>
          ))}
        {children}
      </ButtonGroup>
    </div>
    <HiddenInput field={field} disabled={disabled} error={error} value={value} onChange={onChange} onBlur={onBlur} />
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field} />
  </FormGroup>
)

export const InputInteger = props => (
  <InputGeneral
    {...props}
    custom_type="number"
    step="1"
    min={props.field.min}
    max={props.field.max}
    onChange={v => props.onChange(v ? parseInt(v) : null)}
  />
)

export const InputNumber = props => (
  <InputGeneral
    {...props}
    custom_type="number"
    step={props.field.step}
    min={props.field.min}
    max={props.field.max}
    onChange={v => props.onChange(v ? parseFloat(v) : null)}
  />
)

// placeholder is useful here to provide partial support for safari which doesn't support date inputs
export const InputDate = props => (
  <InputGeneral
    {...props}
    custom_type="date"
    min={props.field.min}
    max={props.field.max}
    placeholder={props.field.placeholder || 'dd/mm/yyyy'}
  />
)

export const InputRecaptcha = ({className, field, error, onChange}) => (
  <FormGroup className={className || field.className}>
    <Recaptcha onChange={onChange} element_id={field.name} />
    {error && <FormFeedback className="d-block">{error}</FormFeedback>}
    <InputHelpText field={field} />
  </FormGroup>
)

const ab2base64 = ab => btoa(String.fromCharCode(...new Uint8Array(ab)))

export const InputFile = ({className, field, error, disabled, onChange}) => {
  const [filename, setFilename] = React.useState(null)
  const [local_error, setError] = React.useState(null)

  const onFileChange = e => {
    const file = e.target.files[0]
    setFilename(file.name)
    if (field.file_types && !field.file_types.includes(file.type)) {
      setError(`Unexpected file type ${file.type}, expected ${field.file_types.join(', ')}`)
      onChange(null)
    } else {
      setError(null)
      const reader = new FileReader()
      const f = {name: file.name, last_modified: file.lastModified}
      if (field.binary_data) {
        reader.onload = () => onChange({...f, content: ab2base64(reader.result)})
        reader.readAsArrayBuffer(file)
      } else {
        reader.onload = () => onChange({...f, content: reader.result})
        reader.readAsText(file)
      }
    }
  }

  if (local_error) {
    if (error) {
      error += ', ' + local_error
    } else {
      error = local_error
    }
  }

  return (
    <FormGroup className={className || field.className}>
      <InputLabel field={field} />
      <div className="custom-file">
        <BsInput
          type="file"
          className="custom-file-input"
          invalid={!!error}
          disabled={disabled}
          name={field.name}
          id={field.name}
          required={field.required}
          onChange={e => onFileChange(e)}
        />
        <label className="custom-file-label" htmlFor={field.name}>
          {filename || placeholder(field) || 'Choose file...'}
        </label>
      </div>
      {error && <FormFeedback className="d-block">{error}</FormFeedback>}
      <InputHelpText field={field} />
    </FormGroup>
  )
}

const INPUT_LOOKUP = {
  bool: InputCheckbox,
  select: InputSelect,
  checkboxes: InputCheckboxMultiple,
  toggle: InputToggle,
  radio: InputRadio,
  int: InputInteger,
  number: InputNumber,
  date: InputDate,
  recaptcha: InputRecaptcha,
  file: InputFile,
}

export const InputWrapper = ({field, value, type_lookup, ...props}) => {
  const InputComp = (type_lookup && type_lookup[field.type]) || INPUT_LOOKUP[field.type] || InputGeneral

  field.title = field.title || as_title(field.name)
  return <InputComp field={field} value={[null, undefined].includes(value) ? field.default : value} {...props} />
}
