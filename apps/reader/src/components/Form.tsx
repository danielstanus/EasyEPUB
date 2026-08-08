import clsx from 'clsx'
import {
  ElementType,
  useRef,
  useEffect,
  useState,
  RefObject,
  ComponentProps,
} from 'react'
import { IconType } from 'react-icons'
import { MdArrowDropDown, MdCheck, MdClose } from 'react-icons/md'
import { PolymorphicPropsWithoutRef } from 'react-polymorphic-types'

import { useMobile, useTranslation } from '../hooks'

import { IconButton } from './Button'

type Action = {
  title: string
  Icon: IconType
  onClick: (el: HTMLInputElement | null) => void
}

export type TextFieldProps<T extends ElementType> = PolymorphicPropsWithoutRef<
  {
    name: string
    hideLabel?: boolean
    autoFocus?: boolean
    actions?: Action[]
    datalist?: React.ReactNode[]
    onClear?: () => void
    // https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/#generic-forwardrefs
    mRef?: RefObject<HTMLInputElement> | null
  },
  T
>
export function TextField<T extends ElementType = 'input'>({
  name,
  as,
  className,
  hideLabel = false,
  autoFocus,
  actions = [],
  datalist,
  onClear,
  mRef: outerRef,
  ...props
}: TextFieldProps<T>) {
  const Component = as || 'input'
  const isInput = Component === 'input'
  const innerRef = useRef<HTMLInputElement>(null)
  const datalistId = `${name}-datalist` // TODO: use `useId`
  const ref = outerRef || innerRef
  const mobile = useMobile()
  const t = useTranslation()

  if (onClear) {
    actions = [
      ...actions,
      {
        title: t('action.clear'),
        Icon: MdClose,
        onClick: onClear,
      },
    ]
  }

  useEffect(() => {
    if (mobile === false && autoFocus) {
      setTimeout(() => {
        ref.current?.focus()
      })
    }
  }, [autoFocus, mobile, ref])

  return (
    <div className={clsx('flex flex-col', className)}>
      <Label name={name} hide={hideLabel}>
        {name}
      </Label>
      <div className="bg-default textfield flex grow items-center">
        <Component
          ref={ref}
          name={name}
          id={name}
          className={clsx(
            'typescale-body-medium text-on-surface-variant placeholder:text-outline/60 w-0 flex-1 bg-transparent py-1 px-1.5 !text-[13px]',
            isInput || 'scroll h-full resize-none',
          )}
          {...(datalist && { list: datalistId })}
          {...props}
        />
        {datalist && <datalist id={datalistId}>{datalist}</datalist>}
        {!!actions.length && (
          <div className="mx-1 flex gap-0.5">
            {actions.map(({ onClick, ...a }) => (
              <IconButton
                className="text-outline !p-px"
                key={a.title}
                onClick={() => {
                  onClick(ref.current)
                }}
                {...a}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface CheckboxProps extends ComponentProps<'input'> {
  name: string
}
export const Checkbox: React.FC<CheckboxProps> = ({ name, ...props }) => {
  return (
    <div className="flex items-center">
      <Label name={name} />
      <div className="checkbox bg-default relative ml-auto rounded-sm">
        <input
          type="checkbox"
          name={name}
          id={name}
          className="peer block h-4 w-4 appearance-none"
          {...props}
        />
        <MdCheck className="text-on-surface-variant pointer-events-none invisible absolute top-0 peer-checked:visible" />
      </div>
    </div>
  )
}

interface SelectProps extends ComponentProps<'select'> {
  name?: string
}
export const Select: React.FC<SelectProps> = ({
  name,
  className,
  ...props
}) => {
  return (
    <div className={clsx('flex flex-col', className)}>
      {name && <Label name={name} />}
      <select
        name={name}
        id={name}
        className={clsx(
          'typescale-body-medium text-on-surface-variant bg-default max-w-xs px-0.5 py-1 !text-[13px]',
        )}
        {...props}
      ></select>
    </div>
  )
}

export interface SearchableSelectOption {
  value: string
  label: string
}
interface SearchableSelectProps {
  name?: string
  value?: string
  options: SearchableSelectOption[]
  placeholder?: string
  onChange?: (value: string) => void
  onOpen?: () => void
}
/**
 * A select with a searchable dropdown (React Select-like).
 * The list expands in place so it is not clipped by scrollable panes.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  name,
  value,
  options,
  placeholder,
  onChange,
  onOpen,
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const t = useTranslation()

  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Keep the highlighted option in view when navigating with the keyboard
  useEffect(() => {
    if (!open) return
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={rootRef} className="flex flex-col">
      {name && <Label name={name} />}
      <button
        type="button"
        id={name}
        name={name}
        className={clsx(
          'typescale-body-medium text-on-surface-variant bg-default flex max-w-xs items-center justify-between gap-2 px-1.5 py-1 !text-[13px]',
        )}
        aria-expanded={open}
        onClick={() => {
          if (!open) onOpen?.()
          setOpen(!open)
          setQuery('')
          setActive(0)
        }}
      >
        <span className="truncate">
          {selected?.label ?? (value || placeholder)}
        </span>
        <MdArrowDropDown
          className={clsx(
            'text-outline shrink-0 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="bg-default mt-1 max-w-xs rounded-md p-1">
          <input
            className="typescale-body-medium text-on-surface-variant placeholder:text-outline/60 w-full rounded bg-transparent px-1.5 py-1 !text-[13px] outline-none"
            autoFocus
            value={query}
            placeholder={t('search.title')}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setOpen(false)
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((a) =>
                  filtered.length ? Math.min(a + 1, filtered.length - 1) : 0,
                )
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((a) => Math.max(a - 1, 0))
              } else if (e.key === 'Enter') {
                const option = filtered[active]
                if (option) {
                  onChange?.(option.value)
                  setOpen(false)
                }
              }
            }}
          />
          <ul ref={listRef} role="listbox" className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="typescale-body-medium text-outline/60 px-1.5 py-1 !text-[13px]">
                {t('search.no_results')}
              </li>
            ) : (
              filtered.map((o, i) => (
                <li key={o.value}>
                  <button
                    type="button"
                    className={clsx(
                      'typescale-body-medium text-on-surface-variant w-full rounded px-1.5 py-1 text-left !text-[13px]',
                      i === active && 'bg-outline/10',
                    )}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      onChange?.(o.value)
                      setOpen(false)
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

interface ColorPickerProps extends ComponentProps<'input'> {
  name?: string
}
export const ColorPicker: React.FC<ColorPickerProps> = ({
  name,
  className,
  ...props
}) => {
  return (
    <div className={clsx('flex flex-col', className)}>
      {name && <Label name={name} />}
      <input
        type="color"
        name={name}
        id={name}
        className="h-6 w-12"
        {...props}
      />
    </div>
  )
}

interface LabelProps extends ComponentProps<'label'> {
  name: string
  hide?: boolean
}
export const Label: React.FC<LabelProps> = ({
  name,
  hide = false,
  className,
}) => {
  return (
    <label
      htmlFor={name}
      className={clsx(
        'typescale-label-medium text-on-surface-variant mb-1 block !text-[13px]',
        hide && 'hidden',
        className,
      )}
    >
      {name}
    </label>
  )
}
