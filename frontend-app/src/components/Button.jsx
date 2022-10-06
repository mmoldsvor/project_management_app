export default function Button(props){
    return (
        <div>
            <button className={props?.className ? props?.className : "general__button"}
                    type={"button"}
                    {...props}
                    style={{"background-color": props?.color}}
            >
                {props?.label}
            </button>
        </div>
    )
}