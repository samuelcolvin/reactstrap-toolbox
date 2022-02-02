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
  InputGroup,
} from 'reactstrap'
import {as_title} from '../utils'
import {Recaptcha} from '../Recaptcha'
import moment from 'moment'

export const InputLabel = ({field, children}) =>
  field.show_label !== false ? (
    <BsLabel htmlFor={field.name} className={field.required ? 'required' : ''}>
      {children}
      {field.title}
    </BsLabel>
  ) : null

export const InputHelpText = ({field}) => (field.help_text ? <FormText>{field.help_text}</FormText> : null)

// used when a field is needed for html form validation but it should not be shown
export const InvisibleInput = ({field, disabled, error, value, onChange, onBlur}) => (
  <BsInput
    className="invisible-input"
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

const not_null_undefined = v => {
  if (v === null || v === undefined) {
    return ''
  } else {
    return v
  }
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
      value={not_null_undefined(value)}
      onChange={e => onChange(e.target.value)}
      onBlur={e => onBlur(e.target.value)}
      {...extra}
    />
    {error && <FormFeedback>{error}</FormFeedback>}
    <InputHelpText field={field} />
  </FormGroup>
)

export const InputCheckbox = ({className, field, disabled, value, onChange, onBlur, ...extra}) => (
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
        {...extra}
      />
    </InputLabel>
    <InputHelpText field={field} />
  </FormGroup>
)

export function prep_choice (c) {
  if (typeof c === 'string') {
    c = {value: c}
  }
  if (typeof c !== 'object' || typeof c.value !== 'string') {
    throw TypeError(`choice not an object or choice.value not a string: ${c}`)
  }
  return {value: c.value, label: c.label || as_title(c.value)}
}

export const InputSelect = ({className, field, disabled, error, value, onChange, onBlur, ...extra}) => (
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
      {...extra}
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

export const InputCheckboxMultiple = ({className, field, disabled, value, onChange, onBlur, error, ...extra}) => {
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
                  {...extra}
                />
                {c.label}
            </BsLabel>
          </div>
        ))}
      <InvisibleInput
        field={field}
        disabled={disabled}
        error={error}
        value={(value || []).join(',')}
        onChange={onChange}
        onBlur={onBlur}
      />
      <InputHelpText field={field} />
      {error && <FormFeedback>{error}</FormFeedback>}
    </FormGroup>
  )
}

export const InputRadio = ({className, field, disabled, error, value, onChange, onBlur, ...extra}) => (
  <FormGroup className={className || field.className}>
    <InputLabel field={field} />
    {field.choices &&
      field.choices.map(prep_choice).map((c, i) => (
        <div key={i} className="custom-control custom-radio">
          <BsInput
            type="radio"
            className="custom-control-input"
            checked={c.value === value}
            disabled={disabled}
            name={field.name}
            id={`${field.name}-${c.value}`}
            required={field.required}
            onChange={() => onChange(c.value)}
            onBlur={() => onBlur(c.value)}
            {...extra}
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

export const InputToggle = ({className, field, disabled, error, value, onChange, onBlur, children, ...extra}) => (
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
              {...extra}
            >
              {c.label}
            </Button>
          ))}
        {children}
      </ButtonGroup>
    </div>
    <InvisibleInput field={field} disabled={disabled} error={error} value={value} onChange={onChange} onBlur={onBlur} />
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

const date_placeholder = 'dd/mm/yyyy'
const date_pattern = '([0-2]\\d|30|31)/(0\\d|10|11|12)/(19|20)\\d{2}'

// placeholder is useful here to provide partial support for safari which doesn't support date inputs
export const InputDate = props => (
  <InputGeneral
    {...props}
    custom_type="date"
    min={props.field.min}
    max={props.field.max}
    placeholder={props.field.placeholder || date_placeholder}
    pattern={props.field.pattern || date_pattern}
  />
)

export const InputDob = ({className, field, error, disabled, value, onChange, onBlur, ...extra}) => {

  const date_value_format = 'YYYY-MM-DD'

  const [day, setDay] = React.useState('')
  const [month, setMonth] = React.useState('')
  const [year, setYear] = React.useState('')
  const [local_error, setError] = React.useState(null)

  //console.log('value:', value);

  React.useEffect(() => {
    if(value){
      validateValue(value)
    }else if(field.default){
      validateValue(field.default)
    }
  },[]);

  const validateValue = (value_) =>{

    console.log('validateValue:', value_);

    var _error = null

    try{
      // Split the date string, allowing the correct number of characters for each part
      const m = value_.match(/(\d{0,4})-(\d{0,2})-(\d{0,2})/)

      console.log('m.length:', m.length);

      if (m && m.length > 3) {

        // Update the state - allowing for empty values
        const _day = m[3]
        const _month = m[2]
        const _year = m[1]

        // Check that it's a valid date. 
        const date_string = `${_year}-${pad2(_month)}-${pad2(_day)}`
        const date = moment(date_string, date_value_format, true);

        console.log('date_string:', date_string);

        if(date.isValid()){
          if(field.min && date < moment(field.min, date_value_format, true)){
            _error = `Date must be after ${moment(field.min, date_value_format, true).format('L')}`
          }else if(date >= moment()){
            _error = `Date must be before ${moment().format('L')}`
          }
          else{
            // We have a valid value - so update if it's changed
            if(date_string !== value){
              onChange(date_string);
            }
          }
        }else{
          _error = 'Please enter a valid date'
        }

        // Update the state
        setDay(_day)
        setMonth(_month)
        setYear(_year)
      }

    }catch(e){
        console.log(error);
        _error = e.message
    }

    // Reset the value on a local error
    if(_error)
      onChange(undefined)

    setError(_error);  
  } 

    
  const updateDay = (day_) => {
    validateValue(`${year}-${month}-${day_}`)
  }

  const updateMonth = (month_) => {
    validateValue(`${year}-${month_}-${day}`)
  }

  const updateYear = (year_) => {
    validateValue(`${year_}-${month}-${day}`)
  }

  const dayInput = (value_) =>{
    return <>
     <BsInput
          type="text"
          placeholder={"DD"}
          pattern="^(0?[1-9]|[1-2][0-9]|3[0-1])$"
          title="Valid day between 1 and 31"
          className={field.inputClassName}
          invalid={!!error}
          disabled={disabled}
          name={`${field.name}-day`}
          id={`${field.name}-day`}
          required={field.required}
          autoComplete={field.autocomplete}
          value={value_}
          onChange={e => updateDay(e.target.value)}
          onBlur={e => onBlur(e.target.value)}
          {...extra}
        />
    </>
  }

  const monthInput = (value_) =>{
    return <>
     <BsInput
          type="text"
          placeholder={"MM"}
          pattern="^(0?[1-9]|1[012])$"
          title="Valid month between 1 and 12"
          className={field.inputClassName}
          invalid={!!error}
          disabled={disabled}
          name={`${field.name}-month`}
          id={`${field.name}-month`}
          required={field.required}
          autoComplete={field.autocomplete}
          value={value_}
          onChange={e => updateMonth(e.target.value)}
          onBlur={e => onBlur(e.target.value)}
          {...extra}
        />
    </>
  }

  const yearInput = (value_) =>{
    return <>
      <BsInput
          type="text"
          placeholder={"YYYY"}
          pattern="^\d{4}$"
          title="Valid year"
          className={field.inputClassName}
          invalid={!!error}
          disabled={disabled}
          name={`${field.name}-year`}
          id={`${field.name}-year`}
          required={field.required}
          autoComplete={field.autocomplete}
          value={value_}
          onChange={e => updateYear(e.target.value)}
          onBlur={e => onBlur(e.target.value)}
          {...extra}
        />
    </>
  }

  const allInputs = (day_, month_, year_) => {

    try{

      var date_format = ''

      // Get the locale date format
      if(field.input_format === null || field.input_format === undefined){
        date_format = moment.localeData().longDateFormat('L')
      }else{
        date_format = field.input_format 
      }
       
      // Find each of the d, m and y positions.  
      const day_position = date_format.toLowerCase().indexOf('d')
      const month_position = date_format.toLowerCase().indexOf('m')
      const year_position = date_format.toLowerCase().indexOf('y')

      console.assert(day_position !== -1, 'day_position not found')
      console.assert(month_position !== -1, 'month_position not found')
      console.assert(year_position !== -1, 'year_position not found')
      
      // Add to and array and sort
      var positions = [day_position, month_position, year_position]
      positions.sort()

      // Use the index in the array to match the position
      const getInput = (index_, day_, month_, year_) =>{
        if(positions[index_] === day_position)
          return dayInput(day_)
        if(positions[index_] === month_position)
          return monthInput(month_)
        if(positions[index_] === year_position)
          return yearInput(year_)

        throw('Error getting date format')  
      }

      return <>
        {getInput(0, day_, month_, year_)}
        {getInput(1, day_, month_, year_)}
        {getInput(2, day_, month_, year_)}
      </>
    }
    catch(error){
      console.log(error)

      // Fallback to basic UK format 
      return <>
        {dayInput(day_)}<>&nbsp;</>
        {monthInput(month_)}<>&nbsp;</>
        {yearInput(year_)}
      </>
    }
  }

  if (local_error) {
      error = local_error
  }

  return (
    <FormGroup className={className || field.className}>
      <InputLabel field={field} />
      <InputGroup>
       {allInputs(day, month, year)}
      </InputGroup>
      {error && <FormFeedback className="d-block">{error}</FormFeedback>}
      <InputHelpText field={field} />
    </FormGroup>
  )
}

const time_placeholder = 'HH:MM'
const time_pattern = '([01]\\d|2[0-3])[-:.][0-5]\\d'

export const InputTime = props => (
  <InputGeneral
    {...props}
    custom_type="time"
    min={props.field.min}
    max={props.field.max}
    placeholder={props.field.placeholder || time_placeholder}
    pattern={props.field.pattern || time_pattern}
  />
)

const pad2 = number => Math.abs(number).toString().padStart(2, '0')
// NOTE: getTimezoneOffset is the opposite way round from normal TZ offsets, e.g. in BST getTimezoneOffset() gives -60
const display_offset = offset => `${offset > 0 ? '-' : '+'}${pad2(offset / 60)}:${pad2(offset % 60)}`

export const InputDatetime = ({className, field, error, disabled, value, onChange, onBlur, custom_type, ...extra}) => {
  let [date, time] = ['', '']
  if (value) {
    const m = value.match(/([^T]*)T([^+-]*)/)
    if (m) {
      [, date, time] = m
    }
  }

  const update = (date_, time_) => {
    date_ = date_ || date
    time_ = time_ || time
    const ts_string = `${date_}T${time_}`
    const tz_offset = new Date(Date.parse(ts_string)).getTimezoneOffset()
    if (isNaN(tz_offset)) {
      // not yet a valid datetime, but we need to update it so the field changes
      onChange(ts_string)
    } else {
      onChange(ts_string + display_offset(tz_offset))
    }
  }

  return (
    <FormGroup className={className || field.className}>
      <InputLabel field={field} />
      <InputGroup>
        <BsInput
          type="date"
          min={field.min}
          max={field.max}
          placeholder={field.placeholder || date_placeholder}
          pattern={field.pattern || date_pattern}
          className={field.inputClassName}
          invalid={!!error}
          disabled={disabled}
          name={`${field.name}-date`}
          id={`${field.name}-date`}
          required={field.required}
          autoComplete={field.autocomplete}
          value={date}
          onChange={e => update(e.target.value)}
          onBlur={e => onBlur(e.target.value)}
          {...extra}
        />
        <BsInput
          type="time"
          placeholder={field.placeholder || time_placeholder}
          pattern={field.pattern || time_pattern}
          className={field.inputClassName}
          invalid={!!error}
          disabled={disabled}
          name={`${field.name}-time`}
          id={`${field.name}-time`}
          required={field.required}
          autoComplete={field.autocomplete}
          value={time}
          onChange={e => update(null, e.target.value)}
          onBlur={e => onBlur(e.target.value)}
          {...extra}
        />
      </InputGroup>
      {error && <FormFeedback className="d-block">{error}</FormFeedback>}
      <InputHelpText field={field} />
    </FormGroup>
  )
}

export const InputRecaptcha = ({className, field, value, error, onChange}) => {
  React.useEffect(() => {
    if (!value && window.grecaptcha) {
      window.grecaptcha.reset()
    }
  }, [value])

  return (
    <FormGroup className={className || field.className}>
      <Recaptcha onChange={onChange} element_id={field.name} />
      {error && <FormFeedback className="d-block">{error}</FormFeedback>}
      <InputHelpText field={field} />
    </FormGroup>
  )
}

export const InputFile = ({className, field, error, disabled, onChange, value, ...extra}) => {
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
      reader.onload = () => onChange({
        name: file.name,
        last_modified: file.lastModified,
        content: reader.result,
      })
      if (field.binary_data) {
        reader.readAsDataURL(file)
      } else {
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
          {...extra}
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

export const HiddenInput = ({field, error, value, onChange, ...extra}) => (
  <>
    <BsInput
      type="hidden"
      value={value || ''}
      invalid={!!error}
      name={field.name}
      id={field.name}
      onChange={e => onChange(e.target.value)}
      required={field.required}
      {...extra}
    />
    {error && <FormFeedback>{as_title(field.name)}: {error}</FormFeedback>}
  </>
)

const INPUT_LOOKUP = {
  bool: InputCheckbox,
  select: InputSelect,
  checkboxes: InputCheckboxMultiple,
  toggle: InputToggle,
  radio: InputRadio,
  int: InputInteger,
  number: InputNumber,
  date: InputDate,
  time: InputTime,
  datetime: InputDatetime,
  recaptcha: InputRecaptcha,
  file: InputFile,
  hidden: HiddenInput,
  dob: InputDob,
}

export const InputWrapper = ({field, value, type_lookup, ...props}) => {
  const InputComp = (type_lookup && type_lookup[field.type]) || INPUT_LOOKUP[field.type] || InputGeneral
  const [focused, setFocused] = React.useState(false)

  const {focus} = field
  const inputRef = React.createRef()
  React.useEffect(() => {
    if (focus && !focused && inputRef.current) {
      inputRef.current.focus()
      setFocused(true)
    }
  }, [focus, inputRef])


  field.title = field.title || as_title(field.name)
  return (
    <InputComp
      field={field}
      value={[null, undefined].includes(value) ? field.default : value}
      innerRef={inputRef}
      {...props}
    />
  )
}
