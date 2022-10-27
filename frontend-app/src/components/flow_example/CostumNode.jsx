import { Handle, Position, useStore } from 'reactflow';
import {Typography} from "@mui/material";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

export default function CustomNode(props) {
    const connectionNodeId = useStore(connectionNodeIdSelector);
    const isTarget = connectionNodeId && connectionNodeId !== props.id;


    const targetHandleStyle = { zIndex: isTarget ? 3 : 1 };

    return (
        <div className="customNode">
            <div
                className="customNodeBody"
                style={{
                    borderStyle: isTarget ? 'dashed' : 'solid',
                    backgroundColor: isTarget ? '#ffcce3' : '#ccd9f6',
                }}
            >
                <Handle
                    className="targetHandle"
                    style={{ zIndex: 2 }}
                    position={Position.Right}
                    type="source"
                />
                <Handle
                    className="targetHandle"
                    style={targetHandleStyle}
                    position={Position.Left}
                    type="target"
                />
                <Typography className="customNodeBody__inner_text" variant={"h6"}>
                    {props.data?.label} ({props?.data.duration})
                </Typography>
                <Typography className="customNodeBody__inner_description" variant={"body1"}>
                    {props.data?.description}
                </Typography>
            </div>
        </div>
    );
}
