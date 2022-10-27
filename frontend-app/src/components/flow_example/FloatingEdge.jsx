import { useCallback } from 'react';
import {useStore, getStraightPath, getSmoothStepPath} from 'reactflow';

import { getEdgeParams } from './utls.jsx';

function FloatingEdge({ id, source, target, markerEnd, style }) {
    const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
    const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    const [edgePath] = getSmoothStepPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    return (
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
            style={style}
        />
    );
}

export default FloatingEdge;
