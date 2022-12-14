import {
    Avatar,
    Dialog,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText, Typography
} from "@mui/material";
import Select from 'react-select'
import "../../styles/Relations.scss"
import TextInput from "../TextInput";
import Button from "../Button";
import {useEffect, useState} from "react";

export interface RelationsProps {
    open: boolean;
    selectedValue: string;
    onClose: (value: string) => void;
    source: string;
    target: string;
    handleSave: (relation: string, duration: string) => void;
}

export default function RelationsDialog(props: RelationsProps) {
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };


    const relationsOptions = [
        { value: 'FF', label: 'Finish-to-finish' },
        { value: 'FS', label: 'Finish-to-start' },
        { value: 'SF', label: 'Start-to-finish' },
        { value: 'SS', label: 'Start-to-start' }
    ]
    const defaultRelation = () => {
        switch(props?.dialogState?.relation){
            case "FF" : return { value: 'FF', label: 'Finish-to-finish' }
            case "FS" : return { value: 'FS', label: 'Finish-to-start' }
            case "SF" : return { value: 'SF', label: 'Start-to-finish' }
            case "SS" : return { value: 'SS', label: 'Start-to-start' }
            case undefined :
        }
    }

    const [relation, setRelation] = useState(defaultRelation)
    const [delay, setDelay] = useState("")
    useEffect(() => {
        (props?.dialogState?.duration !== "undefined") ? setDelay(props?.dialogState?.duration) : setDelay("")
    }, [props.dialogState])

    return (
        <Dialog open={open}>
            <div className={"relations__inner"}>
                <DialogTitle>Set relation between {props.source} and {props.target}</DialogTitle>
                <Select
                    className={"relations__options"}
                    defaultValue={defaultRelation}
                    onChange={e => setRelation(e.value)}
                    options={relationsOptions} />
                <br/>
                <Typography style={{textAlign: "center"}}>Duration</Typography>
                <TextInput
                    style={{width:"93%"}}
                    label={"Delay"}
                    value={delay}
                    onChange={e => setDelay(e.target.value)}
                />
                <div style={{textAlign: "center"}}>
                    <Button
                        label={"Save"}
                        color={"lightblue"}
                        onClick={() => {
                            setDelay("")
                            props.handleSave(relation, delay)
                        }}
                    />
                    <Button
                        label={"Cancel"}
                        color={""}
                        onClick={handleClose}
                    />
                </div>
            </div>
        </Dialog>
    );
}