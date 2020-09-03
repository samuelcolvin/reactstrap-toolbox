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

export const InputLabel = ({field, children}) => (
  field.show_label !== false ? (
    <BsLabel htmlFor={field.name} className={field.required ? 'required' : ''}>
     { children}
      {field.title}
    </BsLabel>
  ) : null
)

export const InputHelpText = ({field}) => (
  field.help_text ? <FormText>{field.help_text}</FormText> : null
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
    <InputLabel field={field}/>
    <BsInput type={custom_type || field.type || 'text'}
             className={field.inputClassName}
             invalid={!!error}
             disabled={disabled}
             name={field.name}
             id={field.name}
             required={field.required}
             maxLength={field.max_length || 255}
             placeholder={placeholder(field)}
             value={value || ''}
             onChange={e => onChange(e.target.value)}
             onBlur={e => onBlur(e.target.value)}
             {...extra}/>
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field}/>
  </FormGroup>
)

export const InputCheckbox = ({className, field, disabled, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className || 'py-2'} check>
    <InputLabel field={field}>
      <BsInput type="checkbox"
               label={field.title}
               disabled={disabled}
               name={field.name}
               id={field.name}
               required={field.required}
               checked={value || false}
               onChange={e => onChange(e.target.checked)}
               onBlur={e => onBlur(e.target.checked)}/>
    </InputLabel>
    <InputHelpText field={field}/>
  </FormGroup>
)

function prep_choice (c) {
  if (typeof(c) === 'string') {
    c = {value: c}
  }
  if (typeof(c) !== 'object' || typeof(c.value) !== 'string') {
    throw TypeError(`choice not an object or choice.value not a string: ${c}`)
  }
  return {value: c.value, label: c.label || as_title(c.value)}
}

export const InputSelect = ({className, field, disabled, error, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field}/>
    <CustomInput type="select"
                 invalid={!!error}
                 value={value || ''}
                 disabled={disabled}
                 name={field.name}
                 id={field.name}
                 required={field.required}
                 onChange={e => onChange(e.target.value)}
                 onBlur={e => onBlur(e.target.value)}>
      {field.allow_empty !== false && <option value="">&mdash;</option>}
      {field.choices && field.choices.map(prep_choice).map((c, i) => (
        <option key={i} value={c.value}>{c.label}</option>
      ))}
    </CustomInput>
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field}/>
  </FormGroup>
)

export const InputRadio = ({className, field, disabled, error, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field}/>
    {field.choices && field.choices.map(prep_choice).map((c, i) => (
      <div key={i} className="custom-control custom-radio">
        <input type="radio"
               className="custom-control-input"
               checked={c.value === value}
               disabled={disabled}
               name={field.name}
               id={`${field.name}-${c.value}`}
               required={field.required}
               onChange={() => onChange(c.value)}
               onBlur={() => onBlur(c.value)}/>
        <label className="custom-control-label" htmlFor={`${field.name}-${c.value}`}>
          <span className="d-inline-block mr-1">{c.label.title || c.label}</span>
          {c.label.description && <small className="text-muted">{c.label.description}</small>}
        </label>
     </div>
    ))}
    {error && <FormFeedback className="d-block">{error}</FormFeedback>}
    <InputHelpText field={field}/>
  </FormGroup>
)

export const InputToggle = ({className, field, disabled, error, value, onChange, onBlur}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field}/>
    <div>
      <ButtonGroup>
        {field.choices && field.choices.map(prep_choice).map((c, i) => (
          <Button key={i} disabled={disabled} onClick={() => onChange(c.value)}
                  color={c.value === value ? 'primary' : 'secondary'}>
            {c.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
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
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field}/>
  </FormGroup>
)

export const InputInteger = props => (
  <InputGeneral {...props} custom_type="number" step="1" min={props.field.min} max={props.field.max}
                onChange={v => props.onChange(v ? parseInt(v) : null)}/>
)

export const InputNumber = props => (
  <InputGeneral {...props} custom_type="number" step={props.field.step} min={props.field.min} max={props.field.max}
                onChange={v => props.onChange(v ? parseFloat(v) : null)}/>
)

// placeholder is useful here to provide partial support for safari which doesn't support date inputs
export const InputDate = props => (
  <InputGeneral {...props} custom_type="date" min={props.field.min} max={props.field.max}
                placeholder={props.field.placeholder || 'dd/mm/yyyy'}/>
)

const INPUT_LOOKUP = {
  bool: InputCheckbox,
  select: InputSelect,
  toggle: InputToggle,
  radio: InputRadio,
  int: InputInteger,
  number: InputNumber,
  date: InputDate,
}

export const InputWrapper = ({field, value, type_lookup, ...props}) => {
  const InputComp = (
    (type_lookup && type_lookup[field.type]) || INPUT_LOOKUP[field.type] || InputGeneral
  )

  field.title = field.title || as_title(field.name)
  return (
    <InputComp
      field={field}
      value={[null, undefined].includes(value) ? field.default : value}
      {...props}
    />
  )
}
