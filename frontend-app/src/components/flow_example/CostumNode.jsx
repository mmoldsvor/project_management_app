import { Handle, Position, useStore } from 'reactflow';

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
                {props.data?.label}
            </div>
        </div>
    );
}
