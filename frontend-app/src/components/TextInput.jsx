export default function TextInput(props){
    if (props?.className === "general__text_input__large") { return (
        <div>
            <textarea className={props?.className ? props?.className : "general__text_input"}
                      rows={2}
                      placeholder={props?.label}
                      {...props}
            />
        </div>
    )} else return (
        <div>
            <input
                className={props?.className ? props?.className : "general__text_input"}
                type={props?.type ? props?.type : "text"}
                placeholder={props?.label}
                {...props}
            />
        </div>
    )
}