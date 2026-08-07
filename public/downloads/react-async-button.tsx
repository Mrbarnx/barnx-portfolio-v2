import type {ButtonHTMLAttributes,ReactNode} from 'react';
export function AsyncButton({loading,children,...props}:{loading:boolean;children:ReactNode}&ButtonHTMLAttributes<HTMLButtonElement>){return <button {...props} disabled={loading||props.disabled} aria-busy={loading}>{loading?'Working…':children}</button>}
