export default function Button(props){
    return (
        <div>
            <button className={props?.className ? props?.className : "general__button"}
                    type={"button"}
                    {...props}
                    style={{"background-color": props?.color, "width": props?.width}}
            >
                {props?.label}
            </button>
        </div>
    )
}