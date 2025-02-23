import { Dom } from "OneJS/Dom"
import { h, Fragment, createContext } from "preact"
import { useContext, useEffect, useRef, useState } from "preact/hooks"
import { Style } from "preact/jsx"
import { FAIcon } from "onejs/fonts/fontawesome"

export interface ListboxProps {
    class?: string
    children?: any
    style?: Style
    items: any[]
    index?: number
    onChange?: (item: any) => void
}

const ListboxContext = createContext({} as any)

export const Listbox = ({ class: classProp, children, items, onChange, index, style }: ListboxProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(index || 0)
    const ref = useRef<Dom>()
    const offset = useRef({ x: 0, y: 0, width: 0 })

    useEffect(() => {
        // let listboxPos = ref.current.ve.LocalToWorld(ref.current.ve.layout)
        offset.current.x = ref.current.ve.layout.x
        offset.current.y = ref.current.ve.layout.y + ref.current.ve.layout.height
        offset.current.width = ref.current.ve.layout.width
    }, [])

    useEffect(() => {
        onChange && onChange(items[selectedIndex])
    }, [selectedIndex])

    return <ListboxContext.Provider value={{ isOpen, setIsOpen, selectedIndex, setSelectedIndex, items, offset }}>
        <div ref={ref} class={`${classProp}`} style={style}>{children}</div>
    </ListboxContext.Provider>
}

export interface ListboxButtonProps {
    class?: string
    children?: any
    style?: Style
}

Listbox.Button = ({ class: classProp, children }: ListboxButtonProps) => {
    const { isOpen, setIsOpen } = useContext(ListboxContext)

    function onClick() {
        setIsOpen(!isOpen)
    }

    return <div class={`${classProp}`} onClick={onClick}>
        {children}
    </div>
}

export interface ListboxOptionsProps {
    class?: string
    children?: any
    style?: Style
}

Listbox.Options = ({ class: classProp, children }: ListboxOptionsProps) => {
    const { isOpen, offset } = useContext(ListboxContext)
    const ref = useRef<Dom>()

    useEffect(() => {
        if (!isOpen) return
        document.body.appendChild(ref.current as any)
        setTimeout(() => {
            ref.current.style.opacity = 1
            ref.current.style.top = `${offset.current.y}px`
            ref.current.style.left = `${offset.current.x}px`
            ref.current.style.width = `${offset.current.width}px`
        })
    }, [isOpen])

    return isOpen ? <div ref={ref} class={`opacity-0 transition-[opacity] duration-200 ${classProp}`}>{children}</div> : null
}

export interface ListboxOptionProps {
    class?: string
    children?: any
    style?: Style
    index: number
    item?: any
}

Listbox.Option = ({ class: classProp, index, children, item, style }: ListboxOptionProps) => {
    const { setIsOpen, selectedIndex, setSelectedIndex, items } = useContext(ListboxContext)

    function onClick() {
        setSelectedIndex(index)
        setIsOpen(false)
    }

    return <div key={`${item.id}`} class={`${classProp}`} onClick={onClick} style={style}>
        {typeof children === "function" ? children({ selected: selectedIndex == index }) : children}
    </div>
}

export interface SelectProps {
    class?: string
    style?: Style
    items: any[]
    index?: number
    onChange?: (item: any) => void
}

export const Select = ({ class: classProp, items, index, onChange, style }: SelectProps) => {
    index = index || 0
    const [selectedItem, setSelectedItem] = useState(items[index])

    useEffect(() => {
        onChange && onChange(selectedItem)
    }, [selectedItem])

    return <Listbox class={`relative ${classProp}`} items={items} index={index} onChange={setSelectedItem}>
        <Listbox.Button class={`bg-white rounded-md px-[12px] py-[10px] flex-row justify-between`}>
            <div class="">{selectedItem.name}</div>
            <FAIcon name="down-dir" class="text-gray-400 translate-y-1" />
        </Listbox.Button>
        <Listbox.Options class="absolute bg-white rounded-md py-2 mt-2">
            {items.map((item, i) => (
                <Listbox.Option index={i} class={`hover:bg-yellow-100 px-[12px] py-[10px] flex-row justify-between`} item={item}>
                    {({ selected }) => <Fragment>
                        <div class={`${selected ? 'bold' : 'font-normal'}`}>
                            {item.name}
                        </div>
                        {selected ? <FAIcon name="ok" class="text-gray-400 translate-y-1" /> : null}
                    </Fragment>}
                </Listbox.Option>
            ))}
        </Listbox.Options>
    </Listbox>
}