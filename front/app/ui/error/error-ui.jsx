import { useStat, useEffect } from 'react'
const stylesize = {
    mini: "text-xs p-1 ",
    small: "text-sm p-2 ",
    medium: "text-md p-4 ",
    big: "text-lg p-6 ",
    extra: "text-xl p-9 ",
}

const stylebox = {
    none: "",
    regular: " p-1 border rounded border-red-500 bg-red-50"
}


export default function ErrorBox({size, box, display, msg})
{

    return (
        <>
            <p className={ (stylesize[size] || stylesize.mini) +
                ( stylebox[box] || stylebox.none )  + 
                " italic text-red-400" }>
                    Error: {msg}
            </p>
        </>
    );
}