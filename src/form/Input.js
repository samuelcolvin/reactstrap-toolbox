import React from 'react'
import {
  FormGroup,
  Label as BsLabel,
  Input as BsInput,
  CustomInput,
  FormText,
  FormFeedback,
} from 'reactstrap'
import {as_title} from '../utils'

export const InputLabel = ({field, children}) => (
  field.show_label !== false ? (
    <BsLabel for={field.name} className={field.required ? 'required' : ''}>
     { children}
      {field.title}
    </BsLabel>
  ) : null
)

export const InputHelpText = ({field}) => (
  field.help_text ? <FormText>{field.help_text} {field.required && <span>(required)</span>}</FormText> : null
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
      {field.choices && field.choices.map((choice, i) => (
        <option key={i} value={choice.value}>
          {choice.label || as_title(choice.value)}
        </option>
      ))}
    </CustomInput>
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

const INPUT_LOOKUP = {
  bool: InputCheckbox,
  select: InputSelect,
  int: InputInteger,
  number: InputNumber,
}

export const InputWrapper = props => {
  let InputComp = props.type_lookup && props.type_lookup[props.field.type]
  InputComp = InputComp || INPUT_LOOKUP[props.field.type] || InputGeneral

  props.field.title = props.field.title || as_title(props.field.name)
  const value = [null, undefined].includes(props.value) ? props.field.default : props.value
  return (
    <InputComp
      field={props.field}
      error={props.error}
      value={value}
      disabled={props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
    />
  )
}
